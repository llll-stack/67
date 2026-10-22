# Sea Legends — jogo de aventura multiplayer

Protótipo de navegador em Three.js + Node.js + Socket.IO, separado do projeto Tower Defense original.

## Rodar no Windows 11

1. Instale o Node.js LTS: https://nodejs.org/
2. Abra o PowerShell nesta pasta.
3. Execute `npm install` e depois `npm start`.
4. Acesse http://localhost:3000. Para testar o multiplayer, abra outra janela apontando para o mesmo servidor.

## Hospedar online

Use uma hospedagem que execute Node.js (por exemplo, Render ou Railway), não apenas hospedagem estática.
- Diretório raiz: `sea-legends`
- Build: `npm install`
- Start: `npm start`
- O servidor usa `process.env.PORT`.

O arquivo `data.json` guarda os dados no disco do servidor. Em hospedagens com disco efêmero, configure armazenamento persistente ou banco de dados gerenciado.

## Incluído nesta primeira versão

- Cena 3D de ilha, personagem, movimento WASD, câmera com mouse e inimigos.
- Multiplayer por Socket.IO e contagem de jogadores online.
- Nível até 300, XP, pontos de atributo e dinheiro.
- Combate Combat contra inimigos, com cooldown e distância verificados pelo servidor.
- Missões, recompensas, loja rotativa, giro aleatório, inventário de frutas e facções.
- Dragon, Kitsune, Dough, Portal, Dark, Leopard, Kilo e Rocket.

## O que ainda não está completo

Esta é uma base jogável, não uma réplica completa de Blox Fruits. As habilidades das frutas Z/X/C/V/F, transformações e animações específicas ainda precisam ser implementadas. O PvP/Bounty ainda precisa de combate validado entre jogadores e autenticação adequada para produção. O armazenamento JSON é provisório e deve ser trocado por banco de dados para um lançamento real.
