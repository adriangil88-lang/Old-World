# uso: exw.py archivo.7z outdir [ext1,ext2|*] [namefile]  -> extrae por extension o lista de stems
import sys,os,struct,importlib.util
spec=importlib.util.spec_from_file_location('un7z','/tmp/claude-0/-home-claude/94e45a55-dabc-5271-89e3-07c7bc86c486/scratchpad/un7z.py'); u=importlib.util.module_from_spec(spec); spec.loader.exec_module(u)
def extract(path,outdir,pred):
    b=open(path,'rb').read()
    nho,nhs,nhc=struct.unpack('<QQI',b[12:32]); hdr=b[32+nho:32+nho+nhs]
    while hdr[0]==0x17:
        r=u.R(hdr); r.byte(); st=u.parse_streams(r); f=st['folders'][0]; off=32+st['packPos']
        hdr=u.decode_folder(f,[b[off:off+st['packSizes'][0]]])
    streams,files=u.parse_header(hdr,0)
    folders=streams['folders']; nums,sizes=streams['substreams']
    off=32+streams['packPos']; pki=0; si=0
    datafiles=[f for f in files if not f['empty']]; di=0; got=[]
    for fo,n in zip(folders,nums):
        npk=len(fo['packed']) or 1; packs=[]
        for _ in range(npk):
            sz=streams['packSizes'][pki]; packs.append(b[off:off+sz]); off+=sz; pki+=1
        fl=[]; pos=0
        for k in range(n):
            f=datafiles[di]; di+=1; f['size']=sizes[si]; si+=1; f['pos']=pos; pos+=f['size']; fl.append(f)
        want=[f for f in fl if pred(os.path.basename(f['name'])) and f['size']>0]
        if want:
            out=u.decode_folder(fo,packs)
            for f in want:
                p=os.path.join(outdir,os.path.basename(f['name'])); open(p,'wb').write(out[f['pos']:f['pos']+f['size']]); got.append(p)
            del out
    return got
if __name__=='__main__':
    os.makedirs(sys.argv[2],exist_ok=True)
    spec_=sys.argv[3]
    if spec_=='*': pred=lambda n:True
    elif spec_.startswith('@'):
        S=set(l.strip() for l in open(spec_[1:]) if l.strip()); pred=lambda n:os.path.splitext(n)[0] in S
    else:
        E=tuple(spec_.split(',')); pred=lambda n:n.lower().endswith(E)
    g=extract(sys.argv[1],sys.argv[2],pred); print(len(g),'ficheros')
