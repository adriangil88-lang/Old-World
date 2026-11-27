import re,json,glob,os
os.chdir('/home/claude/tow/rules')
files=['fof.txt','rh.txt']+sorted(glob.glob('aj_*.txt'))+sorted(glob.glob('new/aj_*.txt'))+sorted(glob.glob('new/leg_*.txt'))+['new/cathay_aj.txt','new/cathay_dawn.txt']
HDR=re.compile(r'^\s*M\s+WS\s+BS\s+S\s+T\s+W\s+I\s+A\s+Ld\s+(Po|Pts|Points)')
def cut(s,p):
    s=s[p:] if len(s)>p else ''
    m=re.search(r'\s{4,}',s.strip('\n'))
    t=s.lstrip(); 
    # cut at first big gap after content
    m=re.search(r'\S\s{4,}\S',s)
    return (s[:m.start()+1] if m else s).strip()
blocks=[]
for f in files:
    L=open(f,errors='ignore').read().split('\n')
    for i,l in enumerate(L):
        if not re.match(r'^\s*Troop Type:',l): continue
        # find header above
        h=None
        for j in range(i-1,max(0,i-14),-1):
            if HDR.match(L[j]): h=j;break
        if h is None: continue
        rows=[]
        for j in range(h+1,i):
            t=L[j].split()
            if len(t)<11: continue
            # strip trailing right-column text: take first 10 tokens after name — find last index where tail of 10 tokens fits stats
            m=re.match(r'^\s*(.*?)\s{2,}((?:\S+\s+){9}\S+)',L[j]) if False else None
            for k in range(len(t)-10,0,-1):
                tail=t[k:k+10]
                if all(re.fullmatch(r'-|\*|\d+\+?|D\d|\d*D\d+|\d+"?|\+\d+',x) for x in tail): 
                    rows.append(dict(name=' '.join(t[:k]),st=tail[:9],pts=tail[9]));break
        if not rows: continue
        blk=dict(f=f,ln=i+1,hdr=h+1,rows=rows,base=None,size=None,troop=None)
        tt=L[i]; blk['troop']=re.sub(r'^\s*Troop Type:\s*','',tt).split('  ')[0].strip()
        end=min(len(L),i+45)
        p=L[i].find('Troop Type:')
        sr=None;opt=[];inopt=False;eq=[]
        for j in range(i+1,end):
            ln=L[j]
            if re.match(r'^\s*Troop Type:',ln) or HDR.match(ln): break
            mm=re.match(r'^(\s*)Base Size:\s*(.*)$',ln)
            if mm: blk['base']=cut(ln,ln.find('Base Size:')+10) 
            mm=re.search(r'Unit Size:\s*(.*)$',ln)
            if mm and blk['size'] is None: blk['size']=cut(ln,ln.find('Unit Size:')+10)
            if 'Armour Value:' in ln: blk['av']=cut(ln,ln.find('Armour Value:')+13)
            if re.search(r'^\s*Options:',ln[p:] if p>=0 else ln) or 'Options:' in ln[:p+20]: inopt=True; continue
            if 'Special Rules:' in ln:
                q=ln.find('Special Rules:'); txt=cut(ln,q+14); k=j+1
                while k<end and txt.rstrip().endswith(','):
                    s=L[k]
                    if len(s)<=q+15 or s[q:q+15].strip()!='': break
                    c=cut(s,q+15)
                    if not c: break
                    txt+=' '+c;k+=1
                sr=txt;blk['sr_raw']=txt;break
            if inopt:
                c=cut(ln,max(0,p)) if p>=0 else ln.strip()
                if c: opt.append(c)
        blk['opts']=opt; blk['sr']=[x.strip() for x in re.split(r',(?![^()]*\))',sr)] if sr else None
        blocks.append(blk)
json.dump(blocks,open('/home/claude/tow/rules/verif/auto/out/blocks.json','w'),ensure_ascii=False)
print(len(blocks),sum(1 for b in blocks if b['sr']),sum(1 for b in blocks if b['size']),sum(1 for b in blocks if b['base']))
