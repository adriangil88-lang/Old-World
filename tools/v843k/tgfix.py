import sys,json,base64; sys.path.insert(0,'.')
import figkit, numpy as np
TH=0.1; H='/home/claude/tow/app/hd/'
def cut(P,U,I,mn,mx):
    pos=mn+P/65535*(mx-mn); tri=I.reshape(-1,3).astype(np.int64); keep=pos[tri][:,:,1].max(1)>=TH
    t=tri[keep]; used=np.unique(t); rm=-np.ones(len(P),np.int64); rm[used]=np.arange(len(used))
    return P[used],U[used],rm[t].reshape(-1).astype('<u2')
for pk in ('xh','xu'):
    f=H+f'{pk}_vc.dat.wasm'; D=figkit.read_bin(f); m=D['vc_terrorgheist']; mn=np.array(m['min']);mx=np.array(m['max'])
    m['parts']=[cut(P,U,I,mn,mx) for P,U,I in m['parts']]; print(pk,[(len(p[0]),len(p[2])//3) for p in m['parts']]); figkit.write_bin(f,D)
f=H+'xp_vc.json'; x=json.load(open(f)); m=x['m']['vc_terrorgheist']; mn=np.array(m['min']);mx=np.array(m['max'])
for p in m['parts']:
    P=np.frombuffer(base64.b64decode(p['p']),'<u2').reshape(-1,3); U=np.frombuffer(base64.b64decode(p['u']),'<u2').reshape(-1,2); I=np.frombuffer(base64.b64decode(p['i']),'<u2')
    P,U,I=cut(P,U,I,mn,mx); p['p']=base64.b64encode(P.astype('<u2').tobytes()).decode(); p['u']=base64.b64encode(U.astype('<u2').tobytes()).decode(); p['i']=base64.b64encode(I.tobytes()).decode(); p['n']=int(len(P)); print('xp',len(P),len(I)//3)
json.dump(x,open(f,'w'),separators=(',',':'))
