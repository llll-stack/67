# 67 Tower Defense

Jogo de estratégia em HTML, CSS e JavaScript, sem instalação ou servidor obrigatório.

## Executar

1. Abra `index.html` em um navegador atualizado (Chrome, Edge ou Firefox).
2. Escolha **Normal** ou **Infinito**.
3. Clique em uma defesa na loja e depois em um espaço livre do mapa.
4. Clique em **Iniciar onda 1**. Selecione torres colocadas para melhorar ou vender.

Também é possível servir a pasta localmente com `python -m http.server 8000` e abrir `http://localhost:8000/outputs/67-tower-defense/`.

## Controles e regras

- **Espaço** inicia a próxima onda; **Esc** cancela a colocação/seleção.
- **Ⅱ Pausar** congela a simulação; velocidade alterna entre 1×, 2× e 3×.
- O caminho é marcado no mapa. Torres não podem ser colocadas sobre o caminho nem sobre outra torre.
- Torres priorizam o inimigo mais próximo da base. Guardiãs anulam o dano/atordoamento de inimigos próximos e podem atacar.
- Torres podem ser melhoradas até o nível 4. A venda devolve 65% do investimento total na torre.
- A base começa com 20 vidas. Cada inimigo que escapa reduz uma vida.
- A campanha Normal termina após a onda 20, com uma formação final de chefe. Infinito cresce por `ceil(8 × 1,5^(onda−1))`; a onda 100 reserva exatamente cinco Divinos. A fila é mantida como contagens por raridade e o campo limita a 36 inimigos ativos.
- O recorde do modo Infinito é guardado no armazenamento local do navegador.

## Arquivos

- `index.html`: interface e estrutura.
- `style.css`: estilo responsivo.
- `game.js`: configuração de balanceamento, simulação, inimigos, economia e controles.

## Sistemas incluídos

Ondas Normal e Infinita; mapa e rota; posicionamento, alcance, seleção, melhoria e venda de oito torres; 7 raridades com habilidades funcionais; recompensas com eliminação única; dinheiro, vidas, chefe, vitória/derrota; pausa e velocidade; melhor onda salva localmente.

## Escopo desta versão

É um protótipo jogável 2D com arte vetorial desenhada no canvas. Ainda não tem multiplayer, conta na nuvem, efeitos de áudio, editor de mapas, animações de sprites dedicadas ou visibilidade por obstáculos. A dificuldade após a onda 100 continua escalando; a contagem é limitada ao maior inteiro seguro do JavaScript para evitar perda de precisão numérica.
