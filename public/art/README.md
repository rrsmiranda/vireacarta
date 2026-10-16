# Cenário atual — Brasília

`cenario_brasilia.webp` é o fundo ativo, convertido da imagem enviada pelo
usuário (77 KB). O app o exibe com `cover` e posição central, preservando o
Congresso no centro do recorte. Em celulares, as laterais são recortadas.
Uma camada CSS azul-escura melhora o contraste sem eliminar o aspecto diurno.
Não há parallax, partículas, grade ou feixes neon. Se a imagem falhar, aparece
um gradiente azul/verde. As imagens dos personagens mantêm seus fundos originais.

Os arquivos e as instruções abaixo registram a arena anterior, preservada para
edição futura; suas três camadas não são mais carregadas pelo jogo.

# Arte da arena — slots opcionais

Coloque aqui os renders gerados pelo script `art/blender/create_arena.py`
(pipeline do arquivo `vire_a_carta_prompts_blender.md`). O app detecta cada
arquivo e usa automaticamente; enquanto não existirem, o cenário procedural
(CSS) do app ocupa o lugar. Formats aceitos: **WebP** (preferido) ou **PNG**.

## Arquivos esperados (mobile 1080 × 1920)

| Slot | Camada | Transparência |
| --- | --- | --- |
| `cenario_fundo.webp` | arquibancada + estrutura + chão | não (fundo opaco) |
| `cenario_palco.webp` | plataforma central + bordas neon + arco | sim (RGBA) |
| `cenario_fx.webp` | poeira brilhante + feixes de luz | sim (RGBA) |

## Como gerar (uma vez, no Mac com Blender 5.x)

```sh
cd "pasta do projeto"
/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python art/blender/create_arena.py -- \
  --outdir "$HOME/Desktop/vire_a_carta_renders/cenario" \
  --cam mobile --engine CYCLES --samples 48
```

Isso salva os PNGs de 16 bits (e o `.blend`) na pasta do Desktop.

## Converter e instalar no app

```sh
cd "$HOME/Desktop/vire_a_carta_renders/cenario"
cwebp -q 82 mobile_fundo.png   -o "pasta do projeto/public/art/cenario_fundo.webp"
cwebp -q 82 -alpha_q 90 mobile_palco.png -o "pasta do projeto/public/art/cenario_palco.webp"
cwebp -q 82 -alpha_q 90 mobile_fx.png    -o "pasta do projeto/public/art/cenario_fx.webp"
```

Também funciona copiando o PNG direto com o nome de slot (ex.:
`cenario_fundo.png`) — o app testa WebP e depois PNG.

Dica: cada arquivo abaixo de ~400 KB deixa o carregamento no celular rápido.
O parallax usa as três camadas com velocidades diferentes (0.12 / 0.30 / 0.55).

## Personagens — renders Blender

Os capitães Aurora e Órbita foram modelados proceduralmente no Blender, com
materiais, câmera e iluminação equivalentes. Os bustos têm fundo transparente.

- `busto_aurora.webp` e `busto_orbita.webp`: imagens utilizadas pelo app.
- Originais PNG 1024 × 1024 e `.blend`: `art/renders/personagens/`.
- Script reprodutível: `art/blender/create_characters.py`.

O app tenta WebP, depois PNG, e mantém o SVG caso ambas as imagens falhem.
A respiração continua sendo a animação CSS existente, respeitando reduced-motion.
São bustos estáticos; não incluem corpo inteiro, rig ou Actions de animação.

Para gerar novamente:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python art/blender/create_characters.py -- --size 1024 --samples 48
cwebp -q 86 -alpha_q 100 art/renders/personagens/busto_aurora.png -o public/art/busto_aurora.webp
cwebp -q 86 -alpha_q 100 art/renders/personagens/busto_orbita.png -o public/art/busto_orbita.webp
```

Se o Blender encerrar na inicialização do Metal em modo background, execute o
script no console Python de uma cena nova da interface do Blender:

```python
p = '/caminho/do/projeto/art/blender/create_characters.py'
exec(compile(open(p).read(), p, 'exec'), {'__file__': p, '__name__': '__main__'})
```

O script substitui os objetos da cena ativa: use uma cena nova ou o próprio
arquivo de personagens. No `.blend`, ative a coleção desejada e desative a outra
na viewport e no render para alternar entre os capitães.

## Imagens atuais dos personagens (substituição solicitada pelo usuário)

- `personagem_aurora.jpeg`: primeira imagem fornecida, personagem com chapéu.
- `personagem_orbita.jpeg`: segunda imagem fornecida, personagem de cabelo escuro.

Os originais foram copiados sem alterações. O CSS enquadra rosto e tronco na
home e nos botões de escolha. Na revelação, `object-fit: contain` mostra a
imagem completa, incluindo os pés, preservando o fundo original. São imagens
com aparência 3D, não modelos 3D interativos. Os bustos Blender anteriores
permanecem disponíveis como fallback de carregamento, seguidos pelo SVG.
