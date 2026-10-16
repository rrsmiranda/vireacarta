# VIRE A CARTA — Prompts de produção 3D (Blender + IA)

**Versão:** 1.0 — 15/10/2026
**Ambiente:** Mac, Blender 4.2 ou superior, Claude Desktop com Blender MCP conectado
**Uso:** rode os prompts na ordem. Cada um é independente: copie do `INÍCIO` ao `FIM`.

| # | Prompt | Onde colar | Resultado |
|---|---|---|---|
| 1 | Cenário da arena | Claude Desktop (com Blender MCP) | Cena montada e renderizada em camadas WebP |
| 2 | Arte conceitual dos personagens | Gerador de imagem (ou briefing para ilustrador) | 2 ilustrações frontais no mesmo estilo |
| 3 | Imagem → 3D | Meshy, Tripo, Rodin ou Hunyuan3D | 2 modelos `.glb` |
| 4 | Personagens no Blender | Claude Desktop (com Blender MCP) | Sprites PNG transparentes e sprite sheet do idle |
| Extra | Sem MCP | Qualquer chat de IA | Script Python para colar na aba Scripting |

Etapa manual entre o Prompt 3 e o 4: enviar cada `.glb` ao **Mixamo** (mixamo.com), aplicar o auto-rig, baixar as animações listadas no Prompt 4 em **FBX, Skin, 24 fps**.

---

## PROMPT 1 — Cenário da arena

> **INÍCIO**
>
> Você está controlando o Blender no meu Mac pelo Blender MCP. Monte o cenário do jogo **VIRE A CARTA**, um jogo de cartas educativo sobre propostas eleitorais. A cena é uma **arena digital de conhecimento**: um estádio de e-sports futurista, noturno, com neon ciano e violeta. Ela será usada como **fundo** de um webapp; a carta, os botões e os personagens entram por cima, no navegador.
>
> **Regras de trabalho**
> 1. Antes de criar qualquer coisa, consulte a cena atual e a versão do Blender. Apague o cubo, a câmera e a luz padrão.
> 2. Trabalhe em etapas. Ao fim de cada etapa, tire um screenshot da viewport, me mostre e espere meu "ok" antes de seguir.
> 3. Use só geometria procedural e materiais criados por você. Não baixe modelos, texturas ou HDRIs de terceiros sem me perguntar.
> 4. Mantenha a cena leve: abaixo de 300 mil polígonos. Use instâncias (Collection Instance ou Geometry Nodes) para elementos repetidos.
> 5. Unidade: metros. Eixo Z para cima. Nomeie todos os objetos e coleções em português, sem acentos.
>
> **Neutralidade visual (obrigatório)**
> - Nada de vermelho de um lado e azul do outro. Os dois lados da arena são **espelhados e idênticos**.
> - Sem bandeiras, estrelas, logotipos de partidos, símbolos nacionais ou textos.
> - Paleta única para a cena inteira:
>   - Fundo profundo `#111426`
>   - Superfície `#1D2240`
>   - Violeta `#735CFF`
>   - Ciano `#34D5F3`
>   - Dourado `#FFC66D` (só em detalhes pequenos)
>
> **Etapa 1 — Coleções**
> Crie as coleções: `BG_Arquibancada`, `BG_Estrutura`, `PALCO`, `LUZES`, `FX`, `CAMERAS`.
>
> **Etapa 2 — Palco central (`PALCO`)**
> - Plataforma circular com 8 m de diâmetro e 0,4 m de altura, em dois degraus.
> - Material escuro (`#1D2240`), metálico 0,6, rugosidade 0,35.
> - Borda de cada degrau com uma faixa fina de emissão ciano (força 6).
> - Centro do palco **vazio**: é onde a carta fica no webapp.
> - Chão da arena: plano de 80 × 80 m com grade neon. Use um shader com textura Brick ou Wave e Math para gerar linhas de emissão violeta finas (força 2), que desaparecem com a distância.
>
> **Etapa 3 — Estrutura (`BG_Estrutura`)**
> - Anel de arquibancada em semicírculo atrás do palco, com 3 níveis, raio de 18 a 30 m.
> - 4 torres de luz simétricas (2 por lado): pilares finos com faixas de LED em emissão violeta.
> - 2 telões retangulares (16:9) nas laterais, espelhados. Tela com emissão em gradiente violeta → ciano, sem nenhuma imagem ou texto.
> - Arco luminoso sobre o palco: um toro achatado com emissão dourada fraca (força 1,5).
>
> **Etapa 4 — Público (`BG_Arquibancada`)**
> - Silhuetas de público estilizadas: cápsula + esfera, cor `#0A0C1A`, sem rosto.
> - Distribua cerca de 1.500 instâncias nas arquibancadas com Geometry Nodes, com variação aleatória de escala (0,9 a 1,1) e rotação.
> - Algumas silhuetas (5%) com um ponto de emissão ciano ou violeta, simulando telas de celular.
>
> **Etapa 5 — Luzes (`LUZES`)**
> - Iluminação de show noturno: 2 spots ciano e 2 spots violeta, cruzando sobre o palco, simétricos.
> - Luz de recorte (rim) atrás do palco, branca fria.
> - World: cor `#0A0C1A`, força 0,2.
> - Volumetria leve: um cubo com Volume Scatter (densidade 0,01) envolvendo a arena, para os feixes aparecerem.
>
> **Etapa 6 — Render e câmeras (`CAMERAS`)**
> - Engine EEVEE. Ative Raytracing se disponível.
> - Bloom: no Blender 4.2 ou superior, crie no Compositor um nó **Glare** do tipo Fog Glow, com threshold 0,8 e size 7.
> - View Transform: AgX, look Medium High Contrast.
> - `CAM_Mobile`: 1080 × 1920 (9:16), lente 35 mm, a cerca de 1,6 m de altura. O palco ocupa o terço inferior e o arco aparece no topo.
> - `CAM_Desktop`: 1920 × 1080 (16:9), mesma composição, lente 28 mm.
> - Profundidade de campo leve: foco no palco, f/4. A arquibancada fica um pouco desfocada.
>
> **Etapa 7 — Exportação em camadas (parallax)**
> Para **cada câmera**, renderize 3 arquivos com fundo transparente (Film → Transparent), escondendo as outras coleções:
> 1. `fundo` = `BG_Arquibancada` + `BG_Estrutura` + World. Este é o único sem transparência.
> 2. `palco` = `PALCO` (com as luzes ativas).
> 3. `fx` = `FX`: partículas de poeira brilhante flutuando (ponto de emissão, cerca de 200 unidades) e os feixes de luz.
>
> - Salve em PNG RGBA de 16 bits em `~/Desktop/vire_a_carta_renders/cenario/`, com os nomes `mobile_fundo.png`, `mobile_palco.png`, `mobile_fx.png`, `desktop_fundo.png`, e assim por diante.
> - Salve também um `cenario_completo_mobile.png` com tudo junto, para referência.
> - Salve o arquivo `.blend` em `~/Desktop/vire_a_carta_renders/vire_a_carta_cenario.blend`.
>
> Ao terminar, me mostre o render completo mobile e liste os arquivos gerados.
>
> **FIM**

---

## PROMPT 2 — Arte conceitual dos personagens

Rode uma vez para cada personagem, com a mesma semente e as mesmas configurações. Alguns geradores recusam pessoas reais, ainda mais em período eleitoral. Nesse caso, envie este texto como briefing para um ilustrador humano, que é o caminho mais seguro juridicamente.

> **INÍCIO — Personagem A**
>
> Ilustração de personagem para jogo educativo, estilo cartoon 2.5D estilizado, inspirado em animação 3D de longa-metragem. **Não é fotorrealista.** Proporções levemente estilizadas, com a cabeça um pouco maior.
>
> - **Personagem:** homem idoso brasileiro, cabelo e barba brancos bem aparados, rosto gentil, sorriso suave e sereno.
> - **Roupa:** terno escuro cinza-azulado, camisa branca, gravata cinza-grafite neutra.
> - **Pose:** corpo inteiro, de frente para a câmera, em **A-pose** (braços abertos a cerca de 45°, palmas para baixo), pernas levemente afastadas, expressão neutra e simpática.
> - **Iluminação:** de estúdio, suave e uniforme, sem sombras duras.
> - **Fundo:** cinza neutro liso `#808080`.
> - Sem texto, sem logotipos, sem bandeiras, sem broches, sem símbolos de partido.
> - Saída em alta resolução, 2048 × 2048, personagem centralizado ocupando 85% da altura.
>
> **FIM**

> **INÍCIO — Personagem B**
>
> Ilustração de personagem para jogo educativo, estilo cartoon 2.5D estilizado, inspirado em animação 3D de longa-metragem. **Não é fotorrealista.** Proporções levemente estilizadas, com a cabeça um pouco maior.
>
> - **Personagem:** homem brasileiro de meia-idade, cabelo escuro curto penteado para o lado, barba feita, rosto calmo, sorriso discreto e sereno.
> - **Roupa:** terno escuro cinza-azulado, camisa branca, gravata cinza-grafite neutra.
> - **Pose:** corpo inteiro, de frente para a câmera, em **A-pose** (braços abertos a cerca de 45°, palmas para baixo), pernas levemente afastadas, expressão neutra e simpática.
> - **Iluminação:** de estúdio, suave e uniforme, sem sombras duras.
> - **Fundo:** cinza neutro liso `#808080`.
> - Sem texto, sem logotipos, sem bandeiras, sem broches, sem símbolos de partido.
> - Saída em alta resolução, 2048 × 2048, personagem centralizado ocupando 85% da altura.
>
> **FIM**

**Checagem de simetria antes de seguir:**
- mesmo estilo e mesmo nível de detalhe;
- mesma pose, roupa, enquadramento e luz;
- nenhum dos dois com expressão mais "heroica" ou mais "caricata" que o outro.

---

## PROMPT 3 — Imagem → 3D

Use a mesma ferramenta e as mesmas configurações para os dois personagens.

> **INÍCIO**
>
> Gerar modelo 3D a partir da imagem anexada.
>
> - **Topologia:** quad, low-poly, alvo de 30 a 50 mil faces.
> - **Simetria:** ligada.
> - **Pose:** manter a A-pose da imagem (necessária para o auto-rig).
> - **Textura:** PBR, 2048 px, estilo pintado/estilizado igual à imagem. Sem iluminação embutida na textura (delighting ligado).
> - **Formato:** `.glb`, escala real, aproximadamente 1,75 m de altura.
> - **Nomes dos arquivos:** `personagem_a.glb` e `personagem_b.glb`.
>
> **FIM**

**Etapa manual — Mixamo:**
1. Envie cada `.glb` (converta para FBX no Blender se o Mixamo recusar) e marque queixo, pulsos, cotovelos, joelhos e virilha.
2. Baixe para **cada** personagem as mesmas 4 animações: **Breathing Idle**, **Walking** (entrada), **Thinking** (selecionado) e **Happy Idle** (revelação). Formato FBX, With Skin, 24 fps.
3. Salve em `~/Desktop/vire_a_carta_renders/personagens/fbx/`.

---

## PROMPT 4 — Personagens no Blender e renders para o jogo

> **INÍCIO**
>
> Você está controlando o Blender no meu Mac pelo Blender MCP. Em um **arquivo novo**, prepare os dois personagens do jogo VIRE A CARTA e renderize os sprites para o webapp.
>
> **Regras**
> - Os dois personagens (`personagem_a` e `personagem_b`) recebem **exatamente o mesmo tratamento**: mesma escala, luz, câmera, material, número de animações e duração de cada loop. Qualquer ajuste feito em um deve ser repetido no outro.
> - Trabalhe em etapas. Mostre um screenshot ao fim de cada uma e espere meu "ok".
>
> **Etapa 1 — Importação**
> - Importe os FBX de `~/Desktop/vire_a_carta_renders/personagens/fbx/`.
> - Normalize: os dois com 1,75 m de altura, pés em Z = 0, centralizados na origem.
> - Junte as 4 animações de cada personagem como Actions no mesmo armature: `idle`, `entrada`, `selecionado`, `revelacao`.
> - Ajuste cada Action para loop limpo: `idle` com 72 frames (3 s a 24 fps); as outras com no máximo 48 frames.
>
> **Etapa 2 — Material estilizado**
> - Mantenha as texturas, mas troque o shader por um visual cel-shading leve: Shader to RGB + Color Ramp com 3 tons.
> - Adicione um rim light por shader (Fresnel → emissão ciano `#34D5F3` com força 0,6) **igual nos dois**.
> - Contorno fino: modificador Solidify com normais invertidas, material preto, espessura 0,004.
>
> **Etapa 3 — Luz e câmera**
> - Luz de três pontos idêntica para ambos:
>   - key branca fria a 45° à frente;
>   - fill violeta `#735CFF` com 30% de força;
>   - rim ciano por trás.
> - `CAM_Busto`: enquadramento da cintura para cima, 1024 × 1024, lente 50 mm, câmera na altura dos olhos.
> - `CAM_Corpo`: corpo inteiro, 1024 × 1536, lente 50 mm.
> - Engine EEVEE, Film → Transparent, View Transform AgX.
>
> **Etapa 4 — Renders estáticos (fallback do jogo)**
> - Para cada personagem, com as duas câmeras, renderize 1 frame da `idle` em PNG RGBA.
> - Nomes:
>   - `~/Desktop/vire_a_carta_renders/personagens/personagem_a_busto.png`
>   - `~/Desktop/vire_a_carta_renders/personagens/personagem_a_corpo.png`
>   - os mesmos dois para o `personagem_b`.
>
> **Etapa 5 — Sequências animadas**
> - Para cada personagem e cada Action, renderize a sequência de frames com a `CAM_Busto` a 512 × 512.
> - Pasta: `~/Desktop/vire_a_carta_renders/personagens/<personagem>/<acao>/0001.png …`
> - Depois de renderizar, gere um **sprite sheet** por ação com um script Python (biblioteca PIL; instale com pip, se faltar):
>   - grade de 8 colunas;
>   - salvo como `<personagem>_<acao>_sheet.png`;
>   - acompanhado de um `<personagem>_<acao>_sheet.json` com `frameWidth`, `frameHeight`, `columns`, `frames` e `fps: 24`.
>
> **Etapa 6 — Entrega**
> - Salve o `.blend` como `~/Desktop/vire_a_carta_renders/vire_a_carta_personagens.blend`.
> - Liste todos os arquivos gerados com o tamanho de cada um.
> - Me mostre lado a lado o busto dos dois personagens, para eu conferir a simetria.
>
> **FIM**

---

## EXTRA — Sem Blender MCP (script para colar)

Use em qualquer chat de IA. Cole o resultado em **Blender → Scripting → New → Run Script**.

> **INÍCIO**
>
> Escreva **um único script Python** (`bpy`) para Blender 4.2 ou superior que execute integralmente as etapas 1 a 6 do prompt abaixo, sem interação.
>
> - Use apenas a API `bpy` e módulos padrão do Python.
> - Comente cada bloco em português.
> - No início, apague a cena padrão.
> - No fim, configure as câmeras, mas **não** dispare o render. Eu renderizo manualmente depois de conferir.
> - Se alguma API mudou entre versões, por exemplo o bloom do EEVEE, trate com `try/except` e use a alternativa via Compositor.
>
> [cole aqui o PROMPT 1 inteiro]
>
> **FIM**

---

## Depois dos renders

Envie para o chat do VIRE A CARTA:
- os 3 PNGs de camada do cenário mobile e os 3 do desktop;
- os 2 bustos (`personagem_a_busto.png` e `personagem_b_busto.png`);
- os sprite sheets do `idle` com os respectivos `.json`.

Com esses arquivos, o webapp recebe o fundo em parallax, os avatares com respiração animada e a versão estática para o modo de animações desligadas.
