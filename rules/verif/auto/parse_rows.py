# Extrae TODAS las filas de perfil (M WS BS S T W I A Ld Pts) de cualquier tabla de los libros: unidades, monturas, máquinas, tripulaciones.
import re,json,glob,os
os.chdir('/home/claude/tow/rules')
files=['fof.txt','rh.txt']+sorted(glob.glob('new/aj_*.txt'))+sorted(glob.glob('new/leg_*.txt'))+['new/cathay_aj.txt','new/cathay_dawn.txt','new/faq_rh.txt','new/faq_fof.txt','new/faq_cathay.txt']
HDR=re.compile(r'M\s+WS\s+BS\s+S\s+T\s+W\s+I\s+A\s+Ld(\s+(Po|Pts|Points))?')
TOK=re.compile(r'^(-|\*|\d+\+?|\d*D\d+(\+\d+)?|\+\d+|\(\+\d+\)|\d+")$')
rows=[]
for f in files:
    L=open(f,errors='ignore').read().split('\n')
    for i,l in enumerate(L):
        m=HDR.search(l)
        if not m: continue
        miss=0
        for j in range(i+1,min(len(L),i+14)):
            t=L[j].split()
            if len(t)<10: 
                miss+=1
                if miss>2 or (t and re.match(r'^(Troop|Base|Unit|Equipment|Options|Special)',L[j].strip())): break
                continue
            hit=None
            for k in range(len(t)-9,0,-1):
                tail=t[k:k+10]
                if len(tail)==10 and all(TOK.match(x) for x in tail): hit=k;break
            if hit is None: continue
            miss=0
            rows.append(dict(f=f,ln=j+1,name=' '.join(t[:hit]),st=t[hit:hit+9],pts=t[hit+9]))
json.dump(rows,open('/home/claude/tow/rules/verif/auto/out/rows.json','w'),ensure_ascii=False)
print(len(rows),len({(r['f'].replace('new/',''),r['ln']) for r in rows}))
