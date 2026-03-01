#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os, math, random

COLORS = {
    'blue':(0,95,255),'blue_light':(71,143,255),'blue_dark':(0,60,180),
    'mint':(0,208,166),'mint_light':(80,230,200),'yellow':(255,200,0),
    'yellow_dark':(200,150,0),'red':(255,85,85),'red_dark':(200,50,50),
    'green':(50,200,100),'green_dark':(30,150,70),'purple':(130,80,200),
    'purple_light':(180,130,255),'orange':(255,140,0),'brown':(140,90,50),
    'white':(255,255,255),'black':(20,20,30),'gray':(160,165,180),
    'gray_light':(220,225,235),'stone':(140,145,160),'stone_dark':(100,105,120),
}
OUT='public/assets'
os.makedirs(OUT,exist_ok=True)
F=32

def c(n,a=255): return COLORS[n]+(a,)
def nf():
    img=Image.new('RGBA',(F,F),(0,0,0,0))
    return img,ImageDraw.Draw(img)

def archer(d,dy,mc,ac):
    cx=16
    d.rectangle([cx-5,14+dy,cx+4,26+dy],fill=c(mc))
    d.ellipse([cx-5,6+dy,cx+5,14+dy],fill=c('white'))
    d.rectangle([cx-5,6+dy,cx+5,10+dy],fill=c(ac))
    d.arc([cx-12,10+dy,cx-4,22+dy],0,180,fill=c('brown'),width=2)
    d.line([cx-8,16+dy,cx+2,16+dy],fill=c('yellow'),width=1)
    d.rectangle([cx-4,26+dy,cx-1,31+dy],fill=c(mc))
    d.rectangle([cx+1,26+dy,cx+4,31+dy],fill=c(mc))

def fixer(d,dy,mc,ac):
    cx=16
    d.rectangle([cx-5,14+dy,cx+5,26+dy],fill=c(mc))
    d.ellipse([cx-5,6+dy,cx+5,14+dy],fill=c('white'))
    d.rectangle([cx-5,6+dy,cx+5,10+dy],fill=c(ac))
    d.rectangle([cx-6,9+dy,cx+6,11+dy],fill=c(ac))
    d.rectangle([cx+4,16+dy,cx+9,18+dy],fill=c('gray'))
    d.ellipse([cx+8,14+dy,cx+11,20+dy],fill=c('gray'))
    d.rectangle([cx-4,26+dy,cx-1,31+dy],fill=c(mc))
    d.rectangle([cx+1,26+dy,cx+4,31+dy],fill=c(mc))

def farmer(d,dy,mc,ac):
    cx=16
    d.rectangle([cx-5,14+dy,cx+5,26+dy],fill=c(mc))
    d.ellipse([cx-5,6+dy,cx+5,14+dy],fill=c('white'))
    d.rectangle([cx-7,8+dy,cx+7,10+dy],fill=c(ac))
    d.rectangle([cx-4,5+dy,cx+4,9+dy],fill=c(ac))
    d.arc([cx+3,15+dy,cx+10,23+dy],180,360,fill=c('yellow_dark'),width=2)
    d.rectangle([cx-4,26+dy,cx-1,31+dy],fill=c(mc))
    d.rectangle([cx+1,26+dy,cx+4,31+dy],fill=c(mc))

def healer(d,dy,mc,ac):
    cx=16
    d.polygon([cx-6,14+dy,cx+6,14+dy,cx+8,28+dy,cx-8,28+dy],fill=c(mc))
    d.ellipse([cx-5,6+dy,cx+5,14+dy],fill=c('white'))
    d.ellipse([cx-6,5+dy,cx+6,13+dy],fill=c(ac))
    d.rectangle([cx+7,14+dy,cx+9,26+dy],fill=c('white'))
    d.rectangle([cx+5,17+dy,cx+11,19+dy],fill=c(ac))

NPCS=[(archer,'blue','yellow','mint','blue','purple','yellow'),
      (fixer,'orange','brown','blue','orange','purple','mint'),
      (farmer,'green','yellow','blue','green','purple','green'),
      (healer,'white','mint','blue','white','purple','yellow')]

def make_npc():
    sheet=Image.new('RGBA',(F*4,F*12),(0,0,0,0))
    row=0
    for fn,cm,ca,rm,ra,em,ea in NPCS:
        for mc,ac in [(cm,ca),(rm,ra),(em,ea)]:
            for fi,dy in enumerate([0,-1,0,1]):
                img,d=nf(); fn(d,dy,mc,ac)
                sheet.paste(img,(fi*F,row*F))
            row+=1
    sheet.save(f'{OUT}/npc-spritesheet.png')
    print(f'npc-spritesheet.png {sheet.width}x{sheet.height}')
make_npc()

def slime(d,frame):
    cx,cy=16,24; b=[-1,0,-1,0][frame]
    d.ellipse([cx-10,cy-12+b,cx+10,cy+4],fill=c('mint'))
    d.ellipse([cx-8,cy-14+b,cx+8,cy-2+b],fill=c('mint_light'))
    d.ellipse([cx-5,cy-12+b,cx-1,cy-8+b],fill=c('black'))
    d.ellipse([cx+1,cy-12+b,cx+5,cy-8+b],fill=c('black'))

def bat(d,frame):
    cx,cy=16,14; ws=[8,12,8,4][frame]
    d.polygon([cx,cy,cx-ws,cy-6,cx-2,cy+2],fill=c('purple'))
    d.polygon([cx,cy,cx+ws,cy-6,cx+2,cy+2],fill=c('purple'))
    d.ellipse([cx-5,cy-4,cx+5,cy+6],fill=c('purple_light'))
    d.ellipse([cx-3,cy-2,cx-1,cy],fill=c('red'))
    d.ellipse([cx+1,cy-2,cx+3,cy],fill=c('red'))

def orc(d,frame):
    wx=[-1,0,1,0][frame]; cx=16+wx
    d.rectangle([cx-8,14,cx+8,26],fill=c('green'))
    d.ellipse([cx-7,5,cx+7,16],fill=c('green_dark'))
    d.polygon([cx-6,7,cx-9,2,cx-3,7],fill=c('yellow_dark'))
    d.polygon([cx+6,7,cx+9,2,cx+3,7],fill=c('yellow_dark'))
    d.ellipse([cx-4,8,cx-1,11],fill=c('red'))
    d.ellipse([cx+1,8,cx+4,11],fill=c('red'))
    d.rectangle([cx+8,14,cx+10,24],fill=c('brown'))
    d.rectangle([cx-7,26,cx-3,31],fill=c('green_dark'))
    d.rectangle([cx+3,26,cx+7,31],fill=c('green_dark'))

def make_monsters():
    sheet=Image.new('RGBA',(F*4,F*3),(0,0,0,0))
    for row,fn in enumerate([slime,bat,orc]):
        for frame in range(4):
            img,d=nf(); fn(d,frame)
            sheet.paste(img,(frame*F,row*F))
    sheet.save(f'{OUT}/monster-spritesheet.png')
    print(f'monster-spritesheet.png {sheet.width}x{sheet.height}')
make_monsters()

def make_tileset():
    sheet=Image.new('RGBA',(F*4,F*2),(0,0,0,0))
    tiles=[]
    # inside
    img,d=nf(); d.rectangle([0,0,31,31],fill=c('gray_light'))
    for i in range(0,32,8): d.line([i,0,i,31],fill=c('gray')); d.line([0,i,31,i],fill=c('gray'))
    tiles.append(img)
    # wall
    img,d=nf(); d.rectangle([0,0,31,31],fill=c('stone'))
    for gy in range(0,32,8):
        off=8 if (gy//8)%2 else 0
        for gx in range(-off,32,16): d.rectangle([gx+1,gy+1,gx+13,gy+6],fill=c('stone_dark'))
    tiles.append(img)
    # grass
    img,d=nf(); d.rectangle([0,0,31,31],fill=c('green'))
    for i in range(5):
        gx=(i*7)%28; gy=(i*11)%24
        d.polygon([gx+4,gy+8,gx+2,gy+3,gx+6,gy+3],fill=c('green_dark'))
    tiles.append(img)
    # path
    img,d=nf(); d.rectangle([0,0,31,31],fill=c('brown')); d.rectangle([4,4,27,27],fill=c('yellow_dark'))
    tiles.append(img)
    for col,t in enumerate(tiles): sheet.paste(t,(col*F,0))
    # night versions
    NC=[(60,65,90),(80,85,100),(30,60,30),(80,55,30)]
    ND=[(80,85,110),(60,65,80),(20,40,20),(100,70,30)]
    for col in range(4):
        img,d=nf(); d.rectangle([0,0,31,31],fill=NC[col]+(255,))
        if col==1:
            for gy in range(0,32,8):
                off=8 if (gy//8)%2 else 0
                for gx in range(-off,32,16): d.rectangle([gx+1,gy+1,gx+13,gy+6],fill=ND[col]+(255,))
        sheet.paste(img,(col*F,F))
    sheet.save(f'{OUT}/tileset.png')
    print(f'tileset.png {sheet.width}x{sheet.height}')
make_tileset()

def make_effects():
    sheet=Image.new('RGBA',(F*4,F*3),(0,0,0,0))
    for row in range(3):
        for frame in range(4):
            img,d=nf(); cx,cy=16,16
            if row==0:
                a=[200,180,150,100][frame]; s=[4,6,8,10][frame]
                d.rectangle([cx-2,cy-s,cx+2,cy+s],fill=(50,200,100,a))
                d.rectangle([cx-s,cy-2,cx+s,cy+2],fill=(50,200,100,a))
            elif row==1:
                s=[2,5,8,6][frame]; a=[255,200,150,80][frame]
                for ang in range(0,360,45):
                    ex=int(cx+s*math.cos(math.radians(ang))); ey=int(cy+s*math.sin(math.radians(ang)))
                    d.line([cx,cy,ex,ey],fill=(255,85,85,a),width=2)
            else:
                a=[255,220,180,100][frame]; s=[5,4,3,2][frame]
                d.polygon([cx,cy-s,cx-s//2,cy,cx,cy+s,cx+s//2,cy],fill=(255,200,0,a))
            sheet.paste(img,(frame*F,row*F))
    sheet.save(f'{OUT}/effect-spritesheet.png')
    print(f'effect-spritesheet.png {sheet.width}x{sheet.height}')
make_effects()

def make_logo():
    img=Image.new('RGBA',(512,512),(0,0,0,0)); d=ImageDraw.Draw(img)
    d.ellipse([20,20,492,492],fill=(0,95,255,255))
    d.ellipse([24,24,488,488],fill=(0,75,220,255))
    wc=(200,205,220,255)
    d.rectangle([120,280,392,430],fill=wc)
    for mx in [120,180,240,300,360]: d.rectangle([mx,230,mx+40,285],fill=wc)
    d.polygon([220,300,292,300,292,370,256,410,220,370],fill=(0,95,255,255))
    d.arc([226,306,286,366],0,180,fill=(255,200,0,255),width=6)
    for sx,sy in [(150,160),(362,160),(140,350),(372,350)]:
        s=16; d.polygon([sx,sy-s,sx-s//2,sy,sx,sy+s,sx+s//2,sy],fill=(255,220,50,255))
    img.save(f'{OUT}/logo.png')
    print('logo.png 512x512')
make_logo()

def make_og():
    img=Image.new('RGBA',(1200,630),(0,60,180,255)); d=ImageDraw.Draw(img)
    d.rectangle([100,350,1100,600],fill=(40,45,70,255))
    d.rectangle([100,250,250,600],fill=(50,55,80,255))
    for mx in [100,150,200]: d.rectangle([mx,220,mx+30,260],fill=(50,55,80,255))
    d.rectangle([950,250,1100,600],fill=(50,55,80,255))
    for mx in [950,1000,1050]: d.rectangle([mx,220,mx+30,260],fill=(50,55,80,255))
    for mx in range(250,950,60): d.rectangle([mx,310,mx+40,360],fill=(40,45,70,255))
    d.ellipse([1050,60,1160,170],fill=(255,240,180,255))
    d.ellipse([1080,50,1175,145],fill=(0,60,180,255))
    random.seed(42)
    for _ in range(60):
        sx=random.randint(0,1200); sy=random.randint(0,280); s=random.randint(1,3)
        d.ellipse([sx-s,sy-s,sx+s,sy+s],fill=(255,255,255,180))
    try:
        logo=Image.open(f'{OUT}/logo.png').resize((140,140)); img.paste(logo,(530,80),logo)
    except: pass
    d.rectangle([0,580,1200,630],fill=(0,95,255,255))
    img.save(f'{OUT}/og-image.png')
    print('og-image.png 1200x630')
make_og()
print('Done')
for f in sorted(os.listdir(OUT)):
    if not f.startswith('.'): print(f'  {f} {os.path.getsize(f"{OUT}/{f}")}b')
