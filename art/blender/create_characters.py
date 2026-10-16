"""Capitaes ficticios: geometria original, materiais e luz iguais, sem assets externos.
Blender --background --python art/blender/create_characters.py -- --size 1024
"""
import argparse
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument('--size', type=int, default=1024)
args.add_argument('--samples', type=int, default=48)
args.add_argument('--outdir', default=str(Path(__file__).resolve().parents[1] / 'renders/personagens'))
opt = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
out = Path(opt.outdir).resolve()
out.mkdir(parents=True, exist_ok=True)
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)

def material(name, hexcolor, rough=.45, metal=0):
    rgb = [int(hexcolor[i:i+2], 16)/255 for i in (0,2,4)]
    rgb = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*rgb,1)
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    return m

pele = material('Pele', 'DFA979', .5)
labio = material('Sorriso', '925B48')
terno = material('Terno_azul_grafite', '29334F', .36)
lapela = material('Lapelas_acetinadas', '3B4866', .3)
camisa = material('Camisa', 'E8EDF6')
branco = material('Cabelo_prateado', 'DCE1EB')
escuro = material('Cabelo_castanho', '362B28')
olho = material('Olhos', 'F5F2ED', .24)
iris = material('Iris', '564438', .28)
pupila = material('Pupila', '141B25', .18)
cores = {t: material('Gravata_'+t, c, .32) for t,c in [('aurora','735CFF'),('orbita','34D5F3')]}

current = None
def attach(obj, name, mat):
    obj.name = name
    for col in list(obj.users_collection): col.objects.unlink(obj)
    current.objects.link(obj)
    obj.data.materials.append(mat)
    if obj.type == 'MESH':
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def ell(name, loc, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, location=loc)
    obj = attach(bpy.context.object,name,mat)
    obj.scale = scale
    return obj

def path(name, coords, width, mat):
    curve = bpy.data.curves.new(name,'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = width
    curve.bevel_resolution = 4
    spl = curve.splines.new('BEZIER')
    spl.bezier_points.add(len(coords)-1)
    for p, co in zip(spl.bezier_points, coords):
        p.co = co
        p.handle_left_type = p.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name,curve)
    current.objects.link(obj)
    curve.materials.append(mat)
    return obj

def panel(name, vertices, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], [tuple(range(len(vertices)))])
    obj = bpy.data.objects.new(name,mesh)
    current.objects.link(obj)
    mesh.materials.append(mat)
    sol = obj.modifiers.new('Espessura','SOLIDIFY'); sol.thickness = .025
    bevel = obj.modifiers.new('Bordas_suaves','BEVEL'); bevel.width=.025; bevel.segments=3
    obj.modifiers.new('Normais','WEIGHTED_NORMAL')
    return obj

collections = {}
for team in ('aurora','orbita'):
    current = bpy.data.collections.new('Capitao_'+team)
    bpy.context.scene.collection.children.link(current)
    collections[team] = current
    hair = branco if team == 'aurora' else escuro
    ell('Tronco', (0,.08,.32),(.85,.38,.76),terno)
    for sign in (-1,1):
        arm = ell('Ombro', (sign*.71,.04,.40),(.32,.34,.51),terno)
        arm.rotation_euler[1] = sign*-.23
    ell('Pescoco',(0,0,1.02),(.23,.23,.37),pele)
    panel('Camisa',[(-.30,-.305,.97),(.30,-.305,.97),(.22,-.405,.08),(-.22,-.405,.08)],camisa)
    for s in (-1,1):
        panel('Lapela',[(s*.30,-.33,1.02),(s*.59,-.32,.80),(s*.43,-.405,.61),(s*.49,-.415,.52),(s*.09,-.43,.04)],lapela)
        panel('Gola',[(s*.23,-.35,1.05),(0,-.43,.89),(s*.17,-.46,.71),(s*.32,-.38,.94)],camisa)
    ell('No_gravata',(0,-.45,.83),(.10,.065,.105),cores[team])
    panel('Gravata',[(-.055,-.457,.77),(.055,-.457,.77),(.105,-.455,.18),(0,-.46,.08),(-.105,-.455,.18)],cores[team])
    ell('Cabeca',(0,0,1.64),(.48,.37,.61),pele)
    ell('Queixo',(0,-.075,1.30),(.32,.285,.24),pele)
    for s in (-1,1):
        ell('Orelha',(s*.472,0,1.57),(.095,.085,.155),pele)
        ell('Interior_orelha',(s*.489,-.069,1.57),(.043,.023,.09),labio)
        ell('Bochecha',(s*.25,-.28,1.49),(.16,.055,.13),pele)
        ell('Olho',(s*.195,-.343,1.72),(.115,.049,.086),olho)
        ell('Iris',(s*.185,-.389,1.715),(.052,.016,.058),iris)
        ell('Pupila',(s*.185,-.403,1.715),(.025,.008,.034),pupila)
        ell('Reflexo',(s*.185-.014,-.412,1.738),(.012,.004,.013),olho)
        path('Palpebra',[(s*.09,-.354,1.75),(s*.19,-.384,1.805),(s*.30,-.337,1.75)],.016,pele)
        path('Sobrancelha',[(s*.09,-.343,1.87),(s*.19,-.354,1.90),(s*.30,-.305,1.87)],.026,hair)
    ell('Nariz_ponte',(0,-.35,1.63),(.065,.083,.16),pele)
    ell('Nariz_ponta',(0,-.425,1.55),(.094,.09,.07),pele)
    # Cabelo: calota com linha frontal alta e costeletas, sem atravessar a testa.
    verts=[]; faces=[]; n=64; rows=16
    for j in range(rows+1):
        for i in range(n):
            a=2*math.pi*i/n
            front=(1-math.sin(a))/2
            end=1.63-.58*front
            t=.001+(end-.001)*j/rows
            verts.append((.495*math.sin(t)*math.cos(a),.385*math.sin(t)*math.sin(a),1.64+.635*math.cos(t)))
    for j in range(rows):
        for i in range(n):
            a=j*n+i; b=j*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    mesh=bpy.data.meshes.new('Cabelo'); mesh.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new('Cabelo',mesh); current.objects.link(obj); mesh.materials.append(hair)
    for p in mesh.polygons:p.use_smooth=True
    # Mechas esculpidas sobre a calota.
    for i in range(7):
        x=-.33+i*.10
        obj=ell('Mecha',(x,-.15,2.15+ .07*(1-abs(x)/.4)),(.125,.26,.10),hair)
        obj.rotation_euler[1]=-.18
        obj.rotation_euler[2]=-.28
    if team=='aurora':
        path('Barba_contorno',[(-.385,-.20,1.50),(-.32,-.295,1.31),(-.18,-.31,1.20),(0,-.32,1.19),(.18,-.31,1.20),(.32,-.295,1.31),(.385,-.20,1.50)],.072,hair)
        path('Bigode',[(-.16,-.352,1.43),(-.09,-.39,1.46),(0,-.405,1.45),(.09,-.39,1.46),(.16,-.352,1.43)],.035,hair)
    path('Sorriso',[(-.15,-.351,1.39),(-.075,-.379,1.365),(0,-.387,1.357),(.075,-.379,1.365),(.15,-.351,1.39)],.012,labio)

scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=opt.samples
scene.cycles.use_denoising=True
scene.render.resolution_x=scene.render.resolution_y=opt.size
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.world.color=(.18,.18,.18)
scene.view_settings.view_transform='AgX'

def aim(obj,at):obj.rotation_euler=(Vector(at)-obj.location).to_track_quat('-Z','Y').to_euler()
for name,loc,power,color,size in [
    ('Luz_principal',(-3,-4,5),500,(1,.91,.82),4),
    ('Preenchimento',(3,-3,2.8),330,(.68,.75,1),3),
    ('Recorte_ciano',(2,2,3.5),650,(.20,.82,1),2),
    ('Recorte_violeta',(-2,1,2.5),400,(.45,.28,1),2)]:
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.color=color; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj); obj.location=loc; aim(obj,(0,0,1.2))
bpy.ops.object.camera_add(location=(0,-7,2.05))
cam=bpy.context.object; cam.name='CAM_Busto'; aim(cam,(0,0,1.27)); cam.data.type='ORTHO'; cam.data.ortho_scale=2.6
scene.camera=cam
for team,col in collections.items():
    for key,c in collections.items():c.hide_render=key!=team
    scene.render.filepath=str(out/f'busto_{team}.png')
    bpy.ops.render.render(write_still=True)
# Os dois modelos ficam editaveis; Aurora visivel inicialmente.
collections['aurora'].hide_render=False
collections['orbita'].hide_render=True
collections['orbita'].hide_viewport=True
bpy.ops.wm.save_as_mainfile(filepath=str(out/'vire_a_carta_personagens.blend'))
print('CONCLUIDO: dois bustos e arquivo Blender editavel')
