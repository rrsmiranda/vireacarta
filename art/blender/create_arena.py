# -*- coding: utf-8 -*-
"""
VIRE A CARTA — Cenário da arena neon (Prompt 1), para Blender 4.2+.
Roda em modo silencioso, sem interação:

  /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python art/blender/create_arena.py -- \
      --outdir "$HOME/Desktop/vire_a_carta_renders/cenario" \
      --cam mobile --engine CYCLES

Opções (depois de "--"):
  --outdir PATH    pasta de saída (padrão: ~/Desktop/vire_a_carta_renders/cenario)
  --cam mobile|desktop|both
  --engine CYCLES|EEVEE   (padrão CYCLES, que roda confiável em background no Mac)
  --samples N      amostras por frame (padrão 48; preview usa menos)
  --preview        resolução pequena só para conferir a composição
  --no-volume      desliga o cubo de Volume Scatter (preview mais rápido)

Neutridade: lados espelhados, sem bandeiras, estrelas, símbolos ou textos.
Paleta única: fundo #111426 · superfície #1D2240 · violeta #735CFF ·
ciano #34D5F3 · dourado #FFC66D (só detalhes).
"""

import bpy
import bmesh
import math
import sys
import os
from mathutils import Vector

# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def args_apos_sep():
    argv = sys.argv
    return argv[argv.index("--") + 1:] if "--" in argv else []


def arg(nome, padrao=None):
    a = args_apos_sep()
    if nome in a:
        return a[a.index(nome) + 1]
    return padrao


def flag(nome):
    return nome in args_apos_sep()


def limpar_cena():
    """Apaga tudo que vem de fábrica (cubo, câmera, luz)."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for bloco in (bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                  bpy.data.cameras, bpy.data.node_groups):
        for item in list(bloco):
            if item.users == 0:
                bloco.remove(item)


def colecao(nome):
    col = bpy.data.collections.get(nome)
    if col is None:
        col = bpy.data.collections.new(nome)
        bpy.context.scene.collection.children.link(col)
    return col


def linkar(obj, nome_col):
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    colecao(nome_col).objects.link(obj)


def srgb_para_linear(hexstr):
    """#RRGGBB -> float linear (aproximação sRGB->linear por canal)."""
    h = hexstr.lstrip('#')
    canal = lambda i: int(h[i:i + 2], 16) / 255.0
    conv = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (conv(canal(0)), conv(canal(2)), conv(canal(4)), 1.0)


CORES = {
    'fundo': '#111426',
    'superficie': '#1D2240',
    'violeta': '#735CFF',
    'ciano': '#34D5F3',
    'ouro': '#FFC66D',
    'publico': '#0A0C1A',
    'frio': '#DCE6FF',
}


def mat_principled(nome, hexstr, metalico=0.0, rugosidade=0.5):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = srgb_para_linear(hexstr)
    bsdf.inputs['Metallic'].default_value = metalico
    bsdf.inputs['Roughness'].default_value = rugosidade
    return m


def mat_emissao(nome, hexstr, forca):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    nt = m.node_tree
    for no in list(nt.nodes):
        nt.nodes.remove(no)
    saida = nt.nodes.new('ShaderNodeOutputMaterial')
    emis = nt.nodes.new('ShaderNodeEmission')
    emis.inputs['Color'].default_value = srgb_para_linear(hexstr)
    emis.inputs['Strength'].default_value = forca
    nt.links.new(emis.outputs['Emission'], saida.inputs['Surface'])
    return m


def mat_chao_grade():
    """Chão 80x80 com linhas finas de emissão violeta que somem com a distância."""
    m = bpy.data.materials.new('MAT_chao_grade')
    m.use_nodes = True
    nt = m.node_tree
    for no in list(nt.nodes):
        nt.nodes.remove(no)

    saida = nt.nodes.new('ShaderNodeOutputMaterial')
    mistura = nt.nodes.new('ShaderNodeMixShader')
    base = nt.nodes.new('ShaderNodeBsdfPrincipled')
    base.inputs['Base Color'].default_value = srgb_para_linear(CORES['fundo'])
    base.inputs['Roughness'].default_value = 0.8
    emis = nt.nodes.new('ShaderNodeEmission')
    emis.inputs['Color'].default_value = srgb_para_linear(CORES['violeta'])
    emis.inputs['Strength'].default_value = 2.0

    coord = nt.nodes.new('ShaderNodeTexCoord')
    onda_x = nt.nodes.new('ShaderNodeTexWave')
    onda_x.wave_type = 'BANDS'
    onda_x.bands_direction = 'X'
    onda_x.inputs['Scale'].default_value = 1.1
    onda_y = nt.nodes.new('ShaderNodeTexWave')
    onda_y.wave_type = 'BANDS'
    onda_y.bands_direction = 'Y'
    onda_y.inputs['Scale'].default_value = 1.1

    fino = lambda: nt.nodes.new('ShaderNodeMath')
    tx = fino(); tx.operation = 'LESS_THAN'; tx.inputs[1].default_value = 0.035
    ty = fino(); ty.operation = 'LESS_THAN'; ty.inputs[1].default_value = 0.035
    combina = nt.nodes.new('ShaderNodeMath'); combina.operation = 'MAXIMUM'
    nt.links.new(coord.outputs['Object'], onda_x.inputs['Vector'])
    nt.links.new(coord.outputs['Object'], onda_y.inputs['Vector'])
    nt.links.new(onda_x.outputs['Fac'], tx.inputs[0])
    nt.links.new(onda_y.outputs['Fac'], ty.inputs[0])
    nt.links.new(tx.outputs['Value'], combina.inputs[0])
    nt.links.new(ty.outputs['Value'], combina.inputs[1])

    # desvanecimento com a distância ao centro
    comprimento = nt.nodes.new('ShaderNodeVectorMath'); comprimento.operation = 'LENGTH'
    desvio = nt.nodes.new('ShaderNodeMapRange')
    desvio.inputs['From Min'].default_value = 8.0
    desvio.inputs['From Max'].default_value = 38.0
    desvio.inputs['To Min'].default_value = 1.0
    desvio.inputs['To Max'].default_value = 0.0
    desvio.clamp = True
    nt.links.new(coord.outputs['Object'], comprimento.inputs[0])
    nt.links.new(comprimento.outputs['Value'], desvio.inputs['Value'])

    mult = nt.nodes.new('ShaderNodeMath'); mult.operation = 'MULTIPLY'
    nt.links.new(combina.outputs['Value'], mult.inputs[0])
    nt.links.new(desvio.outputs['Result'], mult.inputs[1])

    nt.links.new(mult.outputs['Value'], mistura.inputs['Fac'])
    nt.links.new(base.outputs['BSDF'], mistura.inputs[1])
    nt.links.new(emis.outputs['Emission'], mistura.inputs[2])
    nt.links.new(mistura.outputs['Shader'], saida.inputs['Surface'])
    return m


def mat_tela():
    """Tela dos telões: gradiente violeta → ciano, sem imagem nem texto."""
    m = bpy.data.materials.new('MAT_tela')
    m.use_nodes = True
    nt = m.node_tree
    for no in list(nt.nodes):
        nt.nodes.remove(no)
    saida = nt.nodes.new('ShaderNodeOutputMaterial')
    emis = nt.nodes.new('ShaderNodeEmission')
    emis.inputs['Strength'].default_value = 3.0
    grad = nt.nodes.new('ShaderNodeTexGradient')
    mapeia = nt.nodes.new('ShaderNodeMapping')
    mapeia.inputs['Rotation'].default_value[2] = math.radians(90)
    coord = nt.nodes.new('ShaderNodeTexCoord')
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = srgb_para_linear(CORES['violeta'])
    ramp.color_ramp.elements[1].color = srgb_para_linear(CORES['ciano'])
    nt.links.new(coord.outputs['Generated'], mapeia.inputs['Vector'])
    nt.links.new(mapeia.outputs['Vector'], grad.inputs['Vector'])
    nt.links.new(grad.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], emis.inputs['Color'])
    nt.links.new(emis.outputs['Emission'], saida.inputs['Surface'])
    return m


def mat_gradiente_fundo():
    """Pano de fundo atrás da arquibancada: brilho suave no horizonte
       escurecendo para o topo — dá profundidade e faz o público aparecer
       como silhueta."""
    m = bpy.data.materials.new('MAT_gradiente_fundo')
    m.use_nodes = True
    nt = m.node_tree
    for no in list(nt.nodes):
        nt.nodes.remove(no)
    saida = nt.nodes.new('ShaderNodeOutputMaterial')
    emis = nt.nodes.new('ShaderNodeEmission')
    emis.inputs['Strength'].default_value = 1.4
    grad = nt.nodes.new('ShaderNodeTexGradient')
    mapeia = nt.nodes.new('ShaderNodeMapping')
    mapeia.inputs['Rotation'].default_value[2] = math.radians(90)
    coord = nt.nodes.new('ShaderNodeTexCoord')
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = srgb_para_linear('#3A3F86')  # base (horizonte)
    ramp.color_ramp.elements[1].color = srgb_para_linear('#0A0C1A')  # topo (céu)
    nt.links.new(coord.outputs['Generated'], mapeia.inputs['Vector'])
    nt.links.new(mapeia.outputs['Vector'], grad.inputs['Vector'])
    nt.links.new(grad.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], emis.inputs['Color'])
    nt.links.new(emis.outputs['Emission'], saida.inputs['Surface'])
    return m


def mat_volume(densidade=0.01):
    m = bpy.data.materials.new('MAT_volume')
    m.use_nodes = True
    nt = m.node_tree
    for no in list(nt.nodes):
        nt.nodes.remove(no)
    saida = nt.nodes.new('ShaderNodeOutputMaterial')
    vol = nt.nodes.new('ShaderNodeVolumeScatter')
    vol.inputs['Color'].default_value = (0.55, 0.6, 0.9, 1.0)
    vol.inputs['Density'].default_value = densidade
    vol.inputs['Anisotropy'].default_value = 0.35
    nt.links.new(vol.outputs['Volume'], saida.inputs['Volume'])
    return m


def mat_feixe(hexstr, densidade=0.03):
    """Volume concentrado em cone: simula o feixe visível do spot."""
    m = bpy.data.materials.new('MAT_feixe')
    m.use_nodes = True
    nt = m.node_tree
    for no in list(nt.nodes):
        nt.nodes.remove(no)
    saida = nt.nodes.new('ShaderNodeOutputMaterial')
    vol = nt.nodes.new('ShaderNodeVolumeScatter')
    vol.inputs['Color'].default_value = srgb_para_linear(hexstr)
    vol.inputs['Density'].default_value = densidade
    vol.inputs['Anisotropy'].default_value = 0.5
    nt.links.new(vol.outputs['Volume'], saida.inputs['Volume'])
    return m


def novo_objeto(mesh, nome, col):
    obj = bpy.data.objects.new(nome, mesh)
    colecao(col).objects.link(obj)
    return obj


# ---------------------------------------------------------------------------
# Geometria
# ---------------------------------------------------------------------------

def arco_solido(nome, r_in, r_out, a0, z0, altura, passos, col):
    """Plataforma em arco (parte de coroa) sólida, de a0 até 180-a0 graus."""
    bm = bmesh.new()
    a1 = math.pi - a0
    angs = [a0 + (a1 - a0) * i / passos for i in range(passos + 1)]
    inferior, superior = [], []
    for a in angs:
        c, s = math.cos(a), math.sin(a)
        inferior.append((bm.verts.new((r_in * c, r_in * s, z0)),
                         bm.verts.new((r_out * c, r_out * s, z0))))
        superior.append((bm.verts.new((r_in * c, r_in * s, z0 + altura)),
                         bm.verts.new((r_out * c, r_out * s, z0 + altura))))
    for i in range(passos):
        bi0, bo0 = inferior[i]; bi1, bo1 = inferior[i + 1]
        ti0, to0 = superior[i]; ti1, to1 = superior[i + 1]
        bm.faces.new((ti0, to0, to1, ti1))   # topo
        bm.faces.new((bi0, bi1, bo1, bo0))   # base
        bm.faces.new((bo0, bo1, to1, to0))   # parede externa
        bm.faces.new((bi0, ti0, ti1, bi1))   # parede interna
    bm.faces.new((inferior[0][0], inferior[0][1], superior[0][1], superior[0][0]))
    bm.faces.new((inferior[-1][1], inferior[-1][0], superior[-1][0], superior[-1][1]))
    mesh = bpy.data.meshes.new(nome)
    bm.to_mesh(mesh)
    bm.free()
    return novo_objeto(mesh, nome, col)


def silhueta_base():
    """Cápsula + esfera: uma pessoa estilizada sem rosto."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=10,
                          radius1=0.17, radius2=0.15, depth=0.62,
                          matrix=__import__('mathutils').Matrix.Translation((0, 0, 0.31)))
    bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=8, radius=0.19,
                              matrix=__import__('mathutils').Matrix.Translation((0, 0, 0.74)))
    mesh = bpy.data.meshes.new('SilhuetaMesh')
    bm.to_mesh(mesh)
    bm.free()
    obj = novo_objeto(mesh, 'SilhuetaBase', 'BG_Arquibancada')
    obj.location = (0, -100, -50)  # fora da cena; é só modelo de instância
    return obj


def ponto_feixe(origem, alvo, cor, raio_base=2.6, nome='feixe'):
    """Cone de volume saindo do spot até o palco."""
    direcao = Vector(alvo) - Vector(origem)
    profundidade = direcao.length
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=raio_base, radius2=0.18,
                                    depth=profundidade, location=(0, 0, 0))
    cone = bpy.context.active_object
    cone.name = nome
    meio = (Vector(origem) + Vector(alvo)) / 2
    cone.location = meio
    cone.rotation_mode = 'QUATERNION'
    cone.rotation_quaternion = direcao.to_track_quat('Z', 'Y')
    cone.data.materials.append(mat_feixe(cor))
    linkar(cone, 'FX')
    return cone


# ---------------------------------------------------------------------------
# Montagem da cena
# ---------------------------------------------------------------------------

def montar():
    # ===== PALCO =====
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=4.0, depth=0.2, location=(0, 0, 0.1))
    degrau1 = bpy.context.active_object; degrau1.name = 'Palco_degrau1'
    degrau1.data.materials.append(mat_principled('MAT_superficie', CORES['superficie'], 0.6, 0.5))
    linkar(degrau1, 'PALCO')

    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=3.5, depth=0.2, location=(0, 0, 0.3))
    degrau2 = bpy.context.active_object; degrau2.name = 'Palco_degrau2'
    degrau2.data.materials.append(bpy.data.materials['MAT_superficie'])
    linkar(degrau2, 'PALCO')

    mat_borda = mat_emissao('MAT_borda_ciano', CORES['ciano'], 6.0)
    for raio, z, nome in ((4.0, 0.2, 'borda1'), (3.5, 0.4, 'borda2')):
        bpy.ops.mesh.primitive_torus_add(major_radius=raio, minor_radius=0.02,
                                         major_segments=64, minor_segments=8,
                                         location=(0, 0, z))
        aro = bpy.context.active_object; aro.name = f'Palco_{nome}'
        aro.data.materials.append(mat_borda)
        linkar(aro, 'PALCO')

    # chão da arena
    bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, 0))
    chao = bpy.context.active_object; chao.name = 'Chao_grade'
    chao.data.materials.append(mat_chao_grade())
    linkar(chao, 'PALCO')

    # arco luminoso dourado sobre o palco
    bpy.ops.mesh.primitive_torus_add(major_radius=4.6, minor_radius=0.1,
                                     major_segments=64, minor_segments=12,
                                     location=(0, 0, 6.2))
    arco = bpy.context.active_object; arco.name = 'Arco_dourado'
    arco.scale = (1, 1, 0.5)
    arco.data.materials.append(mat_emissao('MAT_ouro', CORES['ouro'], 1.5))
    linkar(arco, 'PALCO')

    # ===== ESTRUTURA =====
    mat_est = mat_principled('MAT_estrutura', CORES['superficie'], 0.4, 0.5)

    # pano de fundo com gradiente atrás de tudo (silhuetas do público)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 36, 11))
    pano = bpy.context.active_object; pano.name = 'Pano_de_fundo'
    pano.rotation_euler = (math.radians(90), 0, 0)
    pano.scale = (110, 30, 1)
    pano.data.materials.append(mat_gradiente_fundo())
    linkar(pano, 'BG_Estrutura')

    for nivel, (r_in, r_out, z0, alt) in enumerate(
            ((18.0, 21.0, 0.0, 1.6), (21.5, 25.0, 1.6, 3.2), (25.5, 30.0, 3.2, 4.8)), start=1):
        bancada = arco_solido(f'Arquibancada_nivel{nivel}', r_in, r_out, math.radians(18), z0, alt, 40, 'BG_Estrutura')
        bancada.data.materials.append(mat_est)

    # fitas de LED nas paredes internas dos níveis: criam o contraste que
    # faz o público aparecer como silhueta (como painel de estádio)
    fita_v = mat_emissao('MAT_fita_violeta', CORES['violeta'], 5.0)
    fita_c = mat_emissao('MAT_fita_ciano', CORES['ciano'], 5.0)
    for z, mat in ((1.0, fita_v), (2.5, fita_v), (3.3, fita_c), (4.1, fita_v)):
        fita = arco_solido(f'Fita_n2_{int(z * 10)}', 21.25, 21.6, math.radians(18), z, 0.15, 40, 'BG_Estrutura')
        fita.data.materials.append(mat)
    for z, mat in ((3.9, fita_c), (5.0, fita_v), (6.1, fita_c)):
        fita = arco_solido(f'Fita_n3_{int(z * 10)}', 25.25, 25.6, math.radians(18), z, 0.15, 40, 'BG_Estrutura')
        fita.data.materials.append(mat)

    # 4 torres de luz (2 por lado, espelhadas)
    mat_led = mat_emissao('MAT_led_violeta', CORES['violeta'], 4.0)
    for x in (-13, 13):
        for y in (-7, 9):
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, 6))
            torre = bpy.context.active_object
            torre.name = f'Torre_{"E" if x < 0 else "D"}_{"f" if y < 0 else "t"}'
            torre.scale = (0.35, 0.35, 6)
            torre.data.materials.append(mat_est)
            linkar(torre, 'BG_Estrutura')
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x - 0.36 * (1 if x > 0 else -1), y, 6))
            faixa = bpy.context.active_object
            faixa.name = torre.name + '_LED'
            faixa.scale = (0.05, 0.2, 5.6)
            faixa.data.materials.append(mat_led)
            linkar(faixa, 'BG_Estrutura')

    # 2 telões 16:9 espelhados
    mat_tela_c = mat_tela()
    for x in (-16, 16):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x, 3, 4.5))
        tela = bpy.context.active_object
        tela.name = f'Telao_{"E" if x < 0 else "D"}'
        tela.rotation_euler = (math.radians(90), 0, math.radians(-90 if x > 0 else 90))
        tela.scale = (6.0, 3.375, 1)
        tela.data.materials.append(mat_tela_c)
        linkar(tela, 'BG_Estrutura')
        moldura = tela.copy(); moldura.data = tela.data.copy()
        moldura.name = tela.name + '_moldura'
        moldura.scale = (6.3, 3.675, 1)
        moldura.location.x += 0.05 * (1 if x > 0 else -1)
        moldura.data.materials.clear()
        moldura.data.materials.append(mat_est)
        colecao('BG_Estrutura').objects.link(moldura)

    # ===== PÚBLICO (~1500 silhuetas) =====
    base = silhueta_base()
    mat_pub = mat_principled('MAT_publico', CORES['publico'], 0.0, 0.9)
    mat_tela_cel = mat_emissao('MAT_celular', CORES['ciano'], 6.0)
    mat_tela_cel_v = mat_emissao('MAT_celular_v', CORES['violeta'], 6.0)
    import random
    random.seed(20261015)
    niveis = ((19.5, 1.6), (23.2, 3.2), (27.7, 4.8))
    for r, z_topo in niveis:
        for _ in range(500):
            a = random.uniform(math.radians(20), math.radians(160))
            raio = r + random.uniform(-0.8, 0.8)
            escala = random.uniform(0.9, 1.1)
            clone = base.copy()  # instância: comparte a malha
            clone.data = base.data
            clone.location = (raio * math.cos(a), raio * math.sin(a), z_topo)
            clone.scale = (escala, escala, escala)
            clone.rotation_euler = (0, 0, a - math.pi / 2)
            clone.name = 'silhueta'
            colecao('BG_Arquibancada').objects.link(clone)
            if clone.data.materials:
                pass
            else:
                clone.data = base.data
            if random.random() < 0.05:  # 5% com "celular"
                cel = bpy.data.objects.new('celular', bpy.data.meshes.new('celularMesh'))
                bm = bmesh.new()
                bmesh.ops.create_uvsphere(bm, u_segments=6, v_segments=4, radius=0.045)
                bm.to_mesh(cel.data); bm.free()
                cel.location = clone.location + Vector((random.uniform(-0.2, 0.2), random.uniform(-0.2, 0.2), 0.75 * escala))
                cel.data.materials.append(mat_tela_cel if random.random() < 0.5 else mat_tela_cel_v)
                colecao('BG_Arquibancada').objects.link(cel)
    # material no modelo base (herdado pelas instâncias)
    base.data.materials.append(mat_pub)

    # ===== LUZES =====
    for nome, x, cor in (('Spot_ciano_E', -6, CORES['ciano']), ('Spot_ciano_D', 6, CORES['ciano']),
                         ('Spot_violeta_E', -6, CORES['violeta']), ('Spot_violeta_D', 6, CORES['violeta'])):
        dados = bpy.data.lights.new(nome, 'SPOT')
        dados.energy = 600
        dados.color = srgb_para_linear(cor)[:3]
        dados.spot_size = math.radians(34)
        dados.spot_blend = 0.4
        obj = bpy.data.objects.new(nome, dados)
        obj.location = (x, -5, 11)
        direcao = Vector((0, 0, 0.5)) - obj.location
        obj.rotation_mode = 'QUATERNION'
        obj.rotation_quaternion = direcao.to_track_quat('-Z', 'Y')
        colecao('LUZES').objects.link(obj)
        ponto_feixe(obj.location, (0, 0, 0.5), cor, nome='Feixe_' + nome)

    # luz forte mirando a arquibancada, para o público aparecer como silhueta
    luz_praca = bpy.data.lights.new('Fill_arquibancada', 'AREA')
    luz_praca.energy = 3800
    luz_praca.size = 26
    luz_praca.color = srgb_para_linear('#5A6AC0')[:3]
    fill = bpy.data.objects.new('Fill_arquibancada', luz_praca)
    fill.location = (0, 12, 17)
    direcao_fill = Vector((0, 24, 2)) - fill.location
    fill.rotation_mode = 'QUATERNION'
    fill.rotation_quaternion = direcao_fill.to_track_quat('-Z', 'Y')
    colecao('LUZES').objects.link(fill)

    dados = bpy.data.lights.new('Rim_traseira', 'AREA')
    dados.energy = 1500
    dados.size = 8
    dados.color = srgb_para_linear(CORES['frio'])[:3]
    rim = bpy.data.objects.new('Rim_traseira', dados)
    rim.location = (0, 9, 6)
    direcao = Vector((0, 0, 1)) - rim.location
    rim.rotation_mode = 'QUATERNION'
    rim.rotation_quaternion = direcao.to_track_quat('-Z', 'Y')
    colecao('LUZES').objects.link(rim)

    # cubo de volume global: só opt-in (--volume). Ele cobriria a tela inteira
    # nas camadas com transparência e sujaria o parallax do navegador.
    # Os feixes em cone (FX) já dão a volumetria visível.
    if flag('--volume'):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 5, 7))
        vol = bpy.context.active_object; vol.name = 'Volume_arena'
        vol.scale = (56, 56, 15)
        vol.data.materials.append(mat_volume(0.01))
        linkar(vol, 'LUZES')

    # ===== FX: poeira brilhante =====
    mat_ouro_fx = mat_emissao('MAT_poeira_ouro', CORES['ouro'], 8.0)
    mat_ciano_fx = mat_emissao('MAT_poeira_ciano', CORES['ciano'], 7.0)
    mat_violeta_fx = mat_emissao('MAT_poeira_violeta', CORES['violeta'], 7.0)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.03)
    mesh_poeira = bpy.data.meshes.new('PoeiraMesh')
    bm.to_mesh(mesh_poeira); bm.free()
    for materiais, quant in ((mat_ouro_fx, 120), (mat_ciano_fx, 40), (mat_violeta_fx, 40)):
        malha = mesh_poeira.copy()
        malha.materials.clear(); malha.materials.append(materiais)
        for _ in range(quant):
            p = bpy.data.objects.new('poeira', malha)
            p.location = (random.uniform(-8, 8), random.uniform(-7, 7), random.uniform(0.5, 8.5))
            colecao('FX').objects.link(p)

    # ===== CÂMERAS =====
    def camera(nome, lente, res, loc):
        dados = bpy.data.cameras.new(nome)
        dados.lens = lente
        obj = bpy.data.objects.new(nome, dados)
        obj.location = loc
        direcao = Vector((0, 0, 1.4)) - Vector(loc)
        obj.rotation_mode = 'QUATERNION'
        obj.rotation_quaternion = direcao.to_track_quat('-Z', 'Y')
        obj.data.dof.use_dof = True
        obj.data.dof.focus_distance = (Vector((0, 0, 0.5)) - Vector(loc)).length
        obj.data.dof.aperture_fstop = 4.0
        colecao('CAMERAS').objects.link(obj)
        return obj, res

    cam_m, res_m = camera('CAM_Mobile', 35, (1080, 1920), (0, -13.5, 1.6))
    cam_d, res_d = camera('CAM_Desktop', 28, (1920, 1080), (0, -15.5, 2.4))

    # ===== WORLD =====
    world = bpy.data.worlds.new('ArenaWorld')
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get('Background')
    bg.inputs['Color'].default_value = srgb_para_linear(CORES['publico'])
    bg.inputs['Strength'].default_value = 0.35

    return cam_m, res_m, cam_d, res_d


# ---------------------------------------------------------------------------
# Render em camadas
# ---------------------------------------------------------------------------

def visibilidade(somente):
    """Deixa visíveis só as coleções da lista (LUZES fica sempre)."""
    for nome in ('BG_Arquibancada', 'BG_Estrutura', 'PALCO', 'FX'):
        col = bpy.data.collections[nome]
        col.hide_render = nome not in somente


def configurar_engine(engine, samples):
    cena = bpy.context.scene
    if engine == 'EEVEE':
        for nome_engine in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
            try:
                cena.render.engine = nome_engine
                break
            except TypeError:
                continue
    else:
        cena.render.engine = 'CYCLES'
        try:
            cena.cycles.device = 'GPU'
            bpy.context.preferences.addons['cycles'].preferences.get_devices()
            for dev in bpy.context.preferences.addons['cycles'].preferences.devices:
                dev.use = dev.type in ('METAL', 'APPLE', 'CUDA', 'OPTIX')
        except Exception:
            cena.cycles.device = 'CPU'
        cena.cycles.samples = samples
        try:
            cena.cycles.use_denoising = True
        except Exception:
            pass
        cena.cycles.max_bounces = 4
        cena.cycles.volume_bounces = 1
        cena.cycles.caustics_reflective = False
        cena.cycles.caustics_refractive = False

    # AgX + look de alto contraste (nomes mudam entre versões)
    try:
        cena.view_settings.view_transform = 'AgX'
    except TypeError:
        pass
    for look in ('AgX - Medium High Contrast', 'Medium High Contrast'):
        try:
            cena.view_settings.look = look
            break
        except TypeError:
            continue

    # Glare Fog Glow no compositor (bloom).
    # Blender 5.x: compositor é um node group em cena.compositing_node_group.
    # Blender 4.x: cena.use_nodes + cena.node_tree + Composite.
    def _config_glare(glare):
        for tipo in ('FOG_GLOW', 'BLOOM'):
            try:
                glare.glare_type = tipo
                break
            except Exception:
                continue
        for attr, valor in (('threshold', 0.8), ('quality', 'MEDIUM')):
            try:
                setattr(glare, attr, valor)
            except Exception:
                pass
        for chave, valor in (('Threshold', 0.8), ('Smoothness', 0.1), ('Size', 0.78)):
            try:
                glare.inputs[chave].default_value = valor
            except Exception:
                pass

    try:
        if hasattr(cena, 'compositing_node_group'):
            ng = bpy.data.node_groups.new('ArenaComposite', 'CompositorNodeTree')
            cena.compositing_node_group = ng
            try:
                ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
            except Exception:
                pass
            rl = ng.nodes.new('CompositorNodeRLayers')
            glare = ng.nodes.new('CompositorNodeGlare')
            _config_glare(glare)
            saida = ng.nodes.new('NodeGroupOutput')
            ng.links.new(rl.outputs['Image'], glare.inputs['Image'])
            ng.links.new(glare.outputs['Image'], saida.inputs[0])
        else:
            cena.use_nodes = True
            nt = cena.node_tree
            for no in list(nt.nodes):
                nt.nodes.remove(no)
            rl = nt.nodes.new('CompositorNodeRLayers')
            glare = nt.nodes.new('CompositorNodeGlare')
            _config_glare(glare)
            comp = nt.nodes.new('CompositorNodeComposite')
            nt.links.new(rl.outputs['Image'], glare.inputs['Image'])
            nt.links.new(glare.outputs['Image'], comp.inputs['Image'])
    except Exception as e:
        print(' compositor indisponivel:', e)


def render_camada(caminho, fundo_opaco):
    cena = bpy.context.scene
    cena.render.film_transparent = not fundo_opaco
    if fundo_opaco:
        cena.render.image_settings.color_mode = 'RGB'
    else:
        cena.render.image_settings.color_mode = 'RGBA'
    cena.render.image_settings.color_depth = '16'
    cena.render.filepath = caminho
    bpy.ops.render.render(write_still=True)
    print('  salvo:', caminho)


def principal():
    outdir = arg('--outdir', os.path.expanduser('~/Desktop/vire_a_carta_renders/cenario'))
    cam = arg('--cam', 'mobile')
    engine = arg('--engine', 'CYCLES')
    samples = int(arg('--samples', '16' if flag('--preview') else '48'))
    os.makedirs(outdir, exist_ok=True)

    limpar_cena()
    cam_m, res_m, cam_d, res_d = montar()
    configurar_engine(engine, samples)

    escala = 0.25 if flag('--preview') else 1.0
    alvos = []
    if cam in ('mobile', 'both'):
        alvos.append(('mobile', cam_m, res_m))
    if cam in ('desktop', 'both'):
        alvos.append(('desktop', cam_d, res_d))

    camadas = (
        ('fundo', ('BG_Arquibancada', 'BG_Estrutura'), True),
        ('palco', ('PALCO',), False),
        ('fx', ('FX',), False),
    )

    for nome_cam, obj_cam, (rx, ry) in alvos:
        bpy.context.scene.camera = obj_cam
        bpy.context.scene.render.resolution_x = int(rx * escala)
        bpy.context.scene.render.resolution_y = int(ry * escala)
        for nome_camada, colecoes, opaco in camadas:
            visibilidade(colecoes)
            render_camada(os.path.join(outdir, f'{nome_cam}_{nome_camada}.png'), opaco)

    # referência com tudo junto (só mobile, só para conferência)
    if alvos and alvos[0][0] == 'mobile':
        nome_cam, obj_cam, (rx, ry) = alvos[0]
        bpy.context.scene.camera = obj_cam
        bpy.context.scene.render.resolution_x = int(rx * escala)
        bpy.context.scene.render.resolution_y = int(ry * escala)
        visibilidade(('BG_Arquibancada', 'BG_Estrutura', 'PALCO', 'FX'))
        render_camada(os.path.join(outdir, 'mobile_completo.png'), True)

    visibilidade(('BG_Arquibancada', 'BG_Estrutura', 'PALCO', 'FX'))
    try:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(outdir, 'vire_a_carta_cenario.blend'))
        print('  cena salva')
    except Exception as e:
        print('  nao foi possivel salvar o .blend:', e)
    print('CONCLUIDO')


principal()
