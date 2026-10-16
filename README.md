# Vire a Carta — webapp (v0.2)

Jogo de cartas educativo para celular, feito em **Vite + TypeScript**, sem framework.
Roda em qualquer navegador moderno; a interface é 100% touch-first.

Visual: arena neon escura com dourado de destaque (mesma linguagem da referência
`Duelo Neon`), com dois times **espelhados e neutros** — Aurora (violeta) e
Órbita (ciano). Nenhum símbolo partidário, bandeira ou cor de partido.

## Rodar

Requisito: Node.js 22+.

```sh
npm ci
npm run dev        # http://127.0.0.1:5173
npm test           # testes do motor (node:test)
npm run build      # gera dist/
```

Para testar no celular na mesma rede: `npm run dev -- --host 0.0.0.0` e abra o IP local.

## O que tem hoje

- **Tela inicial** com logo, duelo dos capitães (SVG procedural), carta de exemplo flutuando e chips de status.
- **3 modos**: Partida rápida (10 cartas equilibradas), Baralho completo (32) e Por tema.
- **Rodada**: leitura → opinião (opcional, sem pontos) → palpite → virada 3D da carta → evidência → próxima.
- **Placar** com trava anti-dupla-pontuação; +10 por acerto.
- **Biblioteca** com busca por texto/tema.
- **Ajustes**: animações on/off (respeita `prefers-reduced-motion`), sons on/off.
- **Cenário em camadas** com parallax (só `transform`, 60 fps) e partículas em canvas.
- **Sons sintetizados** com Web Audio — zero arquivos de áudio.
- Tudo local: `localStorage` para preferências. Sem conta, servidor ou rastreamento.

## Baralho fictício

As **32 cartas são de demonstração**: propostas imaginárias das equipes Aurora e
Órbita, escritas para treinar o jogo sem atribuir nada a pessoas reais. Quando o
baralho verificado (dataset real com evidências) estiver pronto, ele entra por aqui
e o modo oficial passa a valer pontos — o motor já separa os dois conceitos.

## Arte dos renders (slots)

O cenário usa slots em `public/art/` (ver `public/art/README.md`). O app
detecta WebP ou PNG; enquanto não houver arquivos, o CSS procedural ocupa o
lugar — nunca quebra por falta de arte.

Pipeline de produção pronto e testado: `art/blender/create_arena.py` gera a
arena neon em 3 camadas (fundo/palco/fx) via Blender em modo silencioso.
O `.blend` editável fica em `~/Desktop/vire_a_carta_renders/cenario/`.

## Estrutura

```
index.html          casca HTML
src/main.ts         telas, eventos, estado
src/engine.ts       regras puras do jogo (testada)
src/data.ts         32 cartas fictícias
src/avatar.ts       avatares SVG + ícones por categoria
src/arena.ts        camadas, parallax e partículas
src/audio.ts        efeitos Web Audio
src/style.css       design system
tests/engine.test.ts
public/art/         slots para renders do Blender
```

## Métricas de uso (Umami)

Métricas anônimas, sem cookies, em `src/metricas.ts`. Ficam desligadas até existir a
variável `VITE_UMAMI_WEBSITE_ID` (ver `.env.example`).

1. Crie uma conta em https://cloud.umami.is e adicione o site (domínio da Vercel).
2. Copie o **Website ID** e, na Vercel, cadastre `VITE_UMAMI_WEBSITE_ID` em
   Settings → Environment Variables (ambiente Production). Faça um novo deploy.

Eventos enviados:

| Evento | Dados | Quando |
| --- | --- | --- |
| `jogo_iniciado` | — | toque em "Entrar na arena" |
| `opiniao` | `carta`, `opiniao` (boa/ruim) | escolha de Boa/Ruim |
| `palpite` | `carta`, `resultado` (acertou/errou) | escolha do candidato |
| `partida_concluida` | `acertos`, `total` | fim das 32 cartas |
| `abandono` | `carta_numero` | sair no meio da partida ou fechar a aba |
| `clique_fonte` | `carta` | toque em "Consultar fonte" |
| `clique_whatsapp` | — | toque no botão da comunidade |

Visitas (acessos, país, dispositivo, origem) são contadas automaticamente pelo Umami.
O aviso de privacidade fica na tela de Ajustes.
