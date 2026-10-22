const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const fs=require('fs');
const path=require('path');
const app=express(),server=http.createServer(app),io=new Server(server);
const PORT=process.env.PORT||3000, ROOT=__dirname, SAVE=path.join(ROOT,'data.json');
app.use(express.static(ROOT));
app.get('/health',(req,res)=>res.json({ok:true,game:'Sea Legends'}));
const FRUITS=[
 {id:'Dragon',rarity:'Mítica',price:250000,weight:2,desc:'Poder dracônico, rajadas de fogo e transformação.'},
 {id:'Kitsune',rarity:'Mítica',price:220000,weight:2,desc:'Velocidade sobrenatural e chamas espirituais.'},
 {id:'Dough',rarity:'Mítica',price:180000,weight:4,desc:'Golpes elásticos e ataques de massa.'},
 {id:'Portal',rarity:'Lendária',price:120000,weight:8,desc:'Abre portais para reposicionamento e ataques.'},
 {id:'Dark',rarity:'Rara',price:65000,weight:14,desc:'Energia sombria que puxa e atinge inimigos.'},
 {id:'Leopard',rarity:'Mítica',price:200000,weight:3,desc:'Poder bestial, velocidade e ataques físicos.'},
 {id:'Kilo',rarity:'Legada',price:10000,weight:20,desc:'Manipula o peso para saltos e impacto.'},
 {id:'Rocket',rarity:'Comum',price:5000,weight:47,desc:'Impulsos explosivos e mobilidade.'}
];
const QUESTS=[{id:'q1',name:'Primeiros passos',min:1,target:3,xp:60,money:250,enemy:'Bandido'}, {id:'q2',name:'Limpe a praia',min:5,target:6,xp:180,money:700,enemy:'Bandido forte'}, {id:'q3',name:'Caçador de elite',min:20,target:8,xp:550,money:2200,enemy:'Elite'}, {id:'q4',name:'Desafio do mar',min:60,target:10,xp:1500,money:6500,enemy:'Guardião'}, {id:'q5',name:'Lenda da ilha',min:150,target:12,xp:4000,money:18000,enemy:'Chefe'}];
let db={players:{},rotation:{at:0,ids:[]},recentKills:{}};\nconst socketToKey={};\nconst enemies=[{id:'bandit-1',name:'Bandido',x:2,z:-7,hp:60,maxHp:60,level:1},{id:'bandit-2',name:'Bandido',x:-2,z:-8,hp:60,maxHp:60,level:1},{id:'bandit-3',name:'Bandido',x:7,z:1,hp:60,maxHp:60,level:1},{id:'bandit-4',name:'Bandido',x:-7,z:1,hp:60,maxHp:60,level:1},{id:'bandit-5',name:'Bandido forte',x:9,z:-5,hp:130,maxHp:130,level:5}];
try{if(fs.existsSync(SAVE))db=JSON.parse(fs.readFileSync(SAVE,'utf8'));}catch(e){console.error('Save inválido, iniciando novo banco.')}
function persist(){try{fs.writeFileSync(SAVE,JSON.stringify(db,null,2));}catch(e){console.error('Falha ao salvar',e.message)}}
function newPlayer(name){return {name:String(name||'Pirata').slice(0,20),level:1,xp:0,money:1000,hp:100,energy:100,stats:{Melee:1,Defense:1,Sword:1,Gun:1,Fruit:1},points:0,bounty:0,honor:0,faction:'Pirata',fruit:null,inventory:[],style:'Combat',mastery:0,quest:null,questCount:0,kills:0};}
function xpNeed(level){return Math.floor(100+level*level*7);}
function addXP(p,amount){p.xp+=amount;while(p.level<300&&p.xp>=xpNeed(p.level)){p.xp-=xpNeed(p.level);p.level++;p.points+=3;p.hp=100+p.stats.Defense*10;p.energy=100+p.stats.Melee*5;}if(p.level>=300){p.level=300;p.xp=Math.min(p.xp,xpNeed(300)-1);}}
function weightedFruit(){let total=FRUITS.reduce((a,f)=>a+f.weight,0),r=Math.random()*total;for(const f of FRUITS){r-=f.weight;if(r<=0)return f;}return FRUITS[FRUITS.length-1];}
function rotate(){let now=Date.now();if(!db.rotation||!db.rotation.at||now>=db.rotation.at){let pool=[...FRUITS],ids=[];while(ids.length<4&&pool.length){const i=Math.floor(Math.random()*pool.length);ids.push(pool.splice(i,1)[0].id);}db.rotation={at:now+4*60*60*1000,ids};persist();}}
function pub(p){return {...p,xpNeed:xpNeed(p.level),fruits:FRUITS,quests:QUESTS};}\nfunction playerFor(s){return db.players[socketToKey[s.id]];}\nfunction syncEnemies(){io.emit('enemies',enemies.map(e=>({...e})));}
function sendState(s){const p=playerFor(s);if(p)s.emit('state',pub(p));}
app.get('/api/fruit-rotation',(req,res)=>{rotate();res.json({fruits:db.rotation.ids.map(id=>FRUITS.find(f=>f.id===id)),nextAt:db.rotation.at});});
io.on('connection',s=>{
 s.on('join',data=>{let name=String(data&&data.name||'Pirata').slice(0,20);let key=String(data&&data.playerKey||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);if(!key)key=s.id;socketToKey[s.id]=key;if(!db.players[key])db.players[key]=newPlayer(name);db.players[key].name=name;db.players[key].pos={x:0,z:4};rotate();persist();sendState(s);s.emit('rotation',{fruits:db.rotation.ids.map(f=>FRUITS.find(x=>x.id===f)),nextAt:db.rotation.at});s.emit('enemies',enemies.map(e=>({...e})));io.emit('online',io.engine.clientsCount);});
 s.on('chooseFaction',f=>{const p=db.players[s.id];if(!p)return;if(['Pirata','Marinheiro'].includes(f))p.faction=f;persist();sendState(s);});
 s.on('acceptQuest',id=>{const p=db.players[s.id],q=QUESTS.find(q=>q.id===id);if(!p||!q||p.level<q.min)return;if(p.quest)return;p.quest=q.id;p.questCount=0;persist();sendState(s);});
 s.on('abandonQuest',()=>{let p=playerFor(s);if(p){p.quest=null;p.questCount=0;persist();sendState(s);}});
 s.on('enemyDefeated',()=>{const p=db.players[s.id];if(!p)return;p.kills++;addXP(p,20+p.level);p.money+=50+Math.floor(p.level*2);if(p.quest){const q=QUESTS.find(q=>q.id===p.quest);if(q){p.questCount++;if(p.questCount>=q.target){p.money+=q.money;p.quest=null;p.questCount=0;addXP(p,q.xp);s.emit('toast','Missão concluída! Recompensas recebidas.');}}}persist();sendState(s);});
 s.on('spendPoint',stat=>{const p=db.players[s.id];if(!p||p.points<1||!Object.hasOwn(p.stats,stat))return;p.points--;p.stats[stat]++;persist();sendState(s);});
 s.on('buyFruit',id=>{const p=db.players[s.id],f=FRUITS.find(f=>f.id===id);if(!p||!f)return;if(!db.rotation.ids.includes(id))return s.emit('toast','Essa fruta não está no estoque atual.');if(p.money<f.price)return s.emit('toast','Dinheiro insuficiente.');p.money-=f.price;p.inventory.push({type:'fruit',id});p.fruit=id;persist();sendState(s);s.emit('toast',id+' obtida e equipada!');});
 s.on('spinFruit',()=>{const p=db.players[s.id];if(!p)return;const cost=2500;if(p.money<cost)return s.emit('toast','O giro custa ฿ 2.500.');p.money-=cost;const f=weightedFruit();p.inventory.push({type:'fruit',id:f.id});p.fruit=f.id;persist();sendState(s);s.emit('spinResult',f);});
 s.on('equipFruit',id=>{const p=db.players[s.id];if(!p)return;if(p.inventory.some(i=>i.type==='fruit'&&i.id===id)){p.fruit=id;persist();sendState(s);}});
 s.on('attack',data=>{const p=db.players[s.id];if(!p)return;const now=Date.now();if(now-(p.lastAttack||0)<650)return;p.lastAttack=now;p.mastery++;persist();s.emit('attackResult',{damage:Math.max(5,8+p.stats.Melee*2),mastery:p.mastery});});
 s.on('pvpKill',victimId=>{const p=playerFor(s),v=db.players[socketToKey[victimId]];if(!p||!v||p.faction===v.faction||victimId===s.id)return;const key=[s.id,victimId].sort().join(':');const now=Date.now();db.recentKills=db.recentKills||{};if(now-(db.recentKills[key]||0)<30*60*1000)return;db.recentKills[key]=now;const amount=100+v.level*10;if(p.faction==='Pirata')p.bounty+=amount;else p.honor+=amount;if(v.faction==='Pirata')v.bounty=Math.max(0,v.bounty-Math.floor(amount/2));else v.honor=Math.max(0,v.honor-Math.floor(amount/2));persist();sendState(s);const vs=[...io.sockets.sockets.values()].find(x=>x.id===victimId);if(vs)sendState(vs);});
 s.on('disconnect',()=>{delete socketToKey[s.id];persist();io.emit('online',io.engine.clientsCount);});
});
rotate();setInterval(()=>{rotate();io.emit('rotation',{fruits:db.rotation.ids.map(id=>FRUITS.find(f=>f.id===id)),nextAt:db.rotation.at});},30000);
server.listen(PORT,'0.0.0.0',()=>console.log('Sea Legends online na porta '+PORT));