import re,json,sys
# Reconstruye las dos columnas de cada FAQ y extrae entradas "Nombre: Change/Add/Remove/Replace ..." con número de línea
files=['faq_fof.txt','faq_rh.txt','faq_core.txt','faq_cathay.txt']
out=[]
for f in files:
    L=open('/home/claude/tow/rules/new/'+f,encoding='utf8').read().split('\n')
    cols={0:[],1:[]}
    for n,l in enumerate(L,1):
        segs=[(m.start(),m.group().rstrip()) for m in re.finditer(r'\S.*?(?=\s{3,}|$)',l)]
        for st,t in segs:
            c=1 if st>=62 else 0
            cols[c].append((n,t))
    for c in (0,1):
        txt=[]
        for n,t in cols[c]:
            txt.append((n,t))
        # une líneas; nuevo item cuando la línea empieza con "Nombre:" 
        cur=None;items=[]
        for n,t in txt:
            if re.match(r"^(Page \d+|Q:|A:)",t) and not t.startswith('Page') :
                pass
            m=re.match(r"^([A-Z][^:]{1,60}):\s+(Change|Add|Remove|Replace|Delete|Insert|Amend)\b",t)
            if m or re.match(r'^Page \d+',t):
                if cur:items.append(cur)
                cur={'f':f,'ln':n,'text':t}
            elif cur: cur['text']+=' '+t
        if cur:items.append(cur)
        out+= [i for i in items if re.match(r"^[A-Z][^:]{1,60}:\s+(Change|Add|Remove|Replace|Delete|Insert|Amend)",i['text'])]
json.dump(out,open('out/faq_entries.json','w'),ensure_ascii=False,indent=0)
print(len(out))
for i in out[:6]:print(i['f'],i['ln'],i['text'][:200])
