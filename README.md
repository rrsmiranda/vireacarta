# Vire a Carta — Presidente 2026

Jogo de cartas para celular sobre as propostas dos candidatos à Presidência em 2026:
**Lula** e **Flávio Bolsonaro**. Feito em **Vite + TypeScript**, sem framework,
publicado na Vercel (https://vireacarta.vercel.app).

Os IDs internos `aurora` (Lula) e `orbita` (Flávio) vêm da primeira versão do jogo
e continuam nomeando arquivos de arte, vídeos e classes CSS.

## Rodar

Requisito: Node.js 22+.

```sh
npm ci
npm run dev        # http://127.0.0.1:5173
npm test           # testes do motor e do baralho (node:test)
npm run build      # gera dist/
```

Para testar no celular na mesma rede: `npm run dev -- --host 0.0.0.0` e abra o IP local.

## Como o jogo funciona

1. **Tela inicial**: duelo dos candidatos, música de fundo e "Entrar na arena".
2. **Popup ao entrar na arena** (só na primeira entrada da visita): convida a começar
   pelo **Teste rápido**. Para quem já fez o teste rápido, sugere os temas que faltam.
   Fecha com o X, "Escolher outro tema", toque fora, Esc ou o botão Voltar do celular.
3. **Escolha do tema**:
   - **Teste rápido**: Seu bolso, Trabalho e Saúde, 4 cartas cada.
   - Tema avulso: 6 cartas (4 do Lula, 2 do Flávio).
   - Todos os 6 temas: 4 cartas por tema (3 do Lula, 1 do Flávio), 24 no total.
4. **Cada carta**: a pessoa marca a proposta como **Boa** ou **Ruim**, adivinha de quem
   é e vê a revelação com o vídeo do candidato e as **evidências**:
   - dado de resultado em destaque (cartas do Lula);
   - resumo da proposta;
   - botão "Programa oficial · p. N", que abre o PDF do programa no TSE e indica a página;
   - reportagens rotuladas como **Confirma**, **Resultado** ou **Crítica**.
5. **Comparação às cegas** no fim de cada tema: dois caminhos (A e B, em ordem
   sorteada), um de cada candidato; os nomes só aparecem depois da escolha.
6. **"✓ CHECADO!"**: carimbo com o lado de maior afinidade no tema, por exemplo
   "você está mais para Lula · 67%". A afinidade soma a proporção de cartas de cada
   candidato marcadas como "Boa" (proporção, para o lado com mais cartas não levar
   vantagem) e +1 para quem venceu a comparação. Empate aparece como "dividido".
   Logo abaixo, **"O que está em jogo para você"**: o que o plano do Lula garante
   no tema e o que o plano do Flávio diz sobre o mesmo ponto (`emJogo` em `src/data.ts`).
7. **Resultado**, conforme as escolhas:
   - mais Lula: placar, "o que está em jogo", compartilhar o jogo e comunidade no WhatsApp;
   - empate ou mais Flávio: destaca os temas em que a pessoa concorda com o Lula, mostra
     "o que está em jogo" e convida a enviar o jogo a quem ainda não decidiu.
8. **Compartilhar**: botão na tela inicial, na de temas e no resultado. No celular abre o
   menu de compartilhar do aparelho; no computador copia o convite com https://vireacarta.vercel.app/.

## Baralho

36 cartas em 6 temas: Trabalho e salário, Seu bolso (economia e custo de vida),
Segurança, Saúde, Educação e Proteção e democracia.

- **Textos fiéis aos programas de governo registrados no TSE**, com a página de
  cada proposta (`src/data.ts`). Documento de trabalho com trechos literais e
  comparações: `Propostas eleicoes/baralho-por-temas.md` (fora do repositório).
- **Reportagens** em `src/fontes.ts`, geradas a partir da planilha
  `vire_a_carta_fontes.xlsx`, conferida pelo responsável pelo conteúdo. As
  cartas 23 e 31 a 36 têm links de busca que ainda precisam de conferência.
- Os testes garantem 6 cartas por tema (4 + 2), páginas dentro dos programas e
  pelo menos uma reportagem por carta.

## Avisos

- **Conteúdo feito com IA**: a tela de Ajustes (Avisos) informa que as fotos e os
  vídeos dos candidatos foram feitos com inteligência artificial.
- **Música de fundo** (`public/audio/musica-inicio.m4a`): trilha original
  "Vire a Carta — Arena", criada com Suno (uso público exige faixa gerada em plano
  pago). O crédito fica em `CREDITO_MUSICA`, em `src/main.ts`, e aparece em Ajustes.
  Volumes em `VOLUME`: tela inicial, partida e durante os vídeos.

## Estrutura

```
index.html            casca HTML (fundo com raios e faíscas)
src/main.ts           telas, eventos, estado, música e métricas da interface
src/engine.ts         regras puras: partida, baralho por tema, afinidade (testada)
src/data.ts           36 cartas, temas, comparações às cegas, links dos programas
src/fontes.ts         reportagens por carta (gerado da planilha)
src/metricas.ts       Umami (só em produção)
src/avatar.ts         avatares SVG de reserva + ícones dos temas
src/arena.ts          cenário de fundo
src/audio.ts          efeitos sonoros (Web Audio)
src/style.css         design system
tests/                engine.test.ts e arena.test.ts
public/art/           fotos, vídeos e pôsteres dos candidatos, cenário
public/audio/         música de fundo
vercel.json           cabeçalhos de segurança e cache
```

## Privacidade

- Sem cookies, conta ou dado pessoal.
- O aparelho guarda só preferências (animações, sons, música) e **quais** temas
  foram checados. O lado e a porcentagem de cada tema ficam só na sessão.
- O aviso de privacidade fica na tela de Ajustes.

## Métricas de uso (Umami)

Métricas anônimas, sem cookies, em `src/metricas.ts`. Ligam só no build de produção
(Vercel), com o Website ID do site "Vire a Carta" no Umami Cloud já definido no código.
Em `npm run dev` nada é enviado. Para usar outro site do Umami, defina
`VITE_UMAMI_WEBSITE_ID` na Vercel (ver `.env.example`) e faça um novo deploy.

| Evento | Dados | Quando |
| --- | --- | --- |
| `jogo_iniciado` | `temas` (id do tema, `rapido` ou `todos`) | escolha de um tema, do teste rápido ou de "Todos os temas" |
| `tema_iniciado` | `tema` | início das cartas de cada tema |
| `opiniao` | `carta`, `opiniao` (boa/ruim) | escolha de Boa/Ruim |
| `palpite` | `carta`, `resultado` (acertou/errou) | escolha do candidato |
| `comparacao` | `tema`, `escolha`, `afinidade` | escolha na comparação às cegas |
| `partida_concluida` | `temas`, `lula`, `acertos`, `cartas` | fim do teste rápido ou de "Todos os temas" |
| `abandono` | `tema`, `carta_numero` | sair no meio da partida ou fechar a aba |
| `clique_fonte` | `carta`, `tipo` (programa/imprensa) | toque em um link de evidência |
| `clique_whatsapp` | — | toque no botão da comunidade |
| `compartilhar` | `onde` (tela) | toque em compartilhar o jogo |
| `popup_rapido` | — | popup do teste rápido exibido |

Visitas (acessos, país, dispositivo, origem) são contadas automaticamente pelo Umami.

## Segurança e publicação

`vercel.json` define CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
`Permissions-Policy` e cache para `/assets` e `/art`. Cada push na `main` gera um
deploy na Vercel; outras branches geram links de prévia.
