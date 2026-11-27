import struct, sys
COMMON = {}
_o = 0
for _n in ['AABB', 'AnimationClip', 'AnimationCurve', 'AnimationState', 'Array', 'Base', 'BitField', 'bitset', 'bool', 'char', 'ColorRGBA', 'Component', 'data', 'deque', 'double', 'dynamic_array', 'FastPropertyName', 'first', 'float', 'Font', 'GameObject', 'Generic Mono', 'GradientNEW', 'GUID', 'GUIStyle', 'int', 'list', 'long long', 'map', 'Matrix4x4f', 'MdFour', 'MonoBehaviour', 'MonoScript', 'm_ByteSize', 'm_Curve', 'm_EditorClassIdentifier', 'm_EditorHideFlags', 'm_Enabled', 'm_ExtensionPtr', 'm_GameObject', 'm_Index', 'm_IsArray', 'm_IsStatic', 'm_MetaFlag', 'm_Name', 'm_ObjectHideFlags', 'm_PrefabInternal', 'm_PrefabParentObject', 'm_Script', 'm_StaticEditorFlags', 'm_Type', 'm_Version', 'Object', 'pair', 'PPtr<Component>', 'PPtr<GameObject>', 'PPtr<Material>', 'PPtr<MonoBehaviour>', 'PPtr<MonoScript>', 'PPtr<Object>', 'PPtr<Prefab>', 'PPtr<Sprite>', 'PPtr<TextAsset>', 'PPtr<Texture>', 'PPtr<Texture2D>', 'PPtr<Transform>', 'Prefab', 'Quaternionf', 'Rectf', 'RectInt', 'RectOffset', 'second', 'set', 'short', 'size', 'SInt16', 'SInt32', 'SInt64', 'SInt8', 'staticvector', 'string', 'TextAsset', 'TextMesh', 'Texture', 'Texture2D', 'Transform', 'TypelessData', 'UInt16', 'UInt32', 'UInt64', 'UInt8', 'unsigned int', 'unsigned long long', 'unsigned short', 'vector', 'Vector2f', 'Vector3f', 'Vector4f', 'm_ScriptingClassIdentifier', 'Gradient', 'Type*', 'int2_storage', 'int3_storage', 'BoundsInt', 'm_CorrespondingSourceObject', 'm_PrefabInstance', 'm_PrefabAsset', 'FileSize', 'Hash128']:
    COMMON[_o] = _n; _o += len(_n) + 1
class Rd:
    def __init__(s, b, e='<'): s.b = b; s.p = 0; s.e = e
    def u(s, f, n): v = struct.unpack(s.e + f, s.b[s.p:s.p+n])[0]; s.p += n; return v
    def u8(s): return s.u('B', 1)
    def u16(s): return s.u('H', 2)
    def u32(s): return s.u('I', 4)
    def i32(s): return s.u('i', 4)
    def i64(s): return s.u('q', 8)
    def cs(s):
        e = s.b.index(0, s.p); v = s.b[s.p:e].decode('utf8', 'replace'); s.p = e + 1; return v
    def al(s): s.p = (s.p + 3) & ~3
def parse(data):
    r = Rd(data, '>')
    msize = r.u32(); fsize = r.u32(); ver = r.u32(); doff = r.u32()
    if ver >= 9: r.u8(); r.p += 3
    if ver >= 22: msize = r.u32(); fsize = r.i64(); doff = r.i64(); r.p += 8
    r.e = '<'
    uv = r.cs() if ver >= 7 else ''
    plat = r.u32() if ver >= 8 else 0
    tt = bool(r.u8()) if ver >= 13 else False
    nt = r.u32(); types = []
    for _ in range(nt):
        cid = r.i32(); t = {'cid': cid, 'nodes': None}
        if ver >= 16: r.u8()
        if ver >= 17: r.u16()
        if ver >= 13:
            if (ver < 16 and cid < 0) or (ver >= 16 and cid == 114): r.p += 16
            r.p += 16
        if tt:
            nn = r.u32(); sl = r.u32(); nodes = []
            for _ in range(nn):
                v = r.u16(); lv = r.u8(); ia = r.u8(); to = r.u32(); no = r.u32(); bs = r.i32(); ix = r.u32(); mf = r.u32()
                if ver >= 19: r.p += 8
                nodes.append([v, lv, ia, to, no, bs, ix, mf])
            sb = r.b[r.p:r.p+sl]; r.p += sl
            def gs(o):
                if o & 0x80000000: return COMMON.get(o & 0x7fffffff, '?')
                return sb[o:sb.index(0, o)].decode()
            t['nodes'] = [(n[1], gs(n[3]), gs(n[4]), n[5], n[7]) for n in nodes]
        types.append(t)
    nobj = r.u32(); objs = []
    for _ in range(nobj):
        if ver >= 14: r.al()
        pid = r.i64() if ver >= 14 else r.u32()
        bs = r.u32() if ver < 22 else r.i64(); sz = r.u32(); ti = r.i32()
        if ver < 16: r.u32()
        objs.append((pid, bs + doff, sz, types[ti] if ver >= 17 else None))
    return {'ver': ver, 'tt': tt, 'types': types, 'objs': objs}
def read_tree(nodes, data, p, idx=0):
    lv, ty, nm, bs, mf = nodes[idx]
    j = idx + 1
    while j < len(nodes) and nodes[j][0] > lv: j += 1
    def al(p): return (p + 3) & ~3
    if ty in ('SInt8', 'char'): v = struct.unpack_from('<b', data, p)[0]; p += 1
    elif ty in ('UInt8', 'bool'): v = data[p]; p += 1
    elif ty in ('SInt16', 'short'): v = struct.unpack_from('<h', data, p)[0]; p += 2
    elif ty in ('UInt16', 'unsigned short'): v = struct.unpack_from('<H', data, p)[0]; p += 2
    elif ty in ('SInt32', 'int'): v = struct.unpack_from('<i', data, p)[0]; p += 4
    elif ty in ('UInt32', 'unsigned int'): v = struct.unpack_from('<I', data, p)[0]; p += 4
    elif ty in ('SInt64', 'long long'): v = struct.unpack_from('<q', data, p)[0]; p += 8
    elif ty in ('UInt64', 'unsigned long long', 'FileSize'): v = struct.unpack_from('<Q', data, p)[0]; p += 8
    elif ty == 'float': v = struct.unpack_from('<f', data, p)[0]; p += 4
    elif ty == 'double': v = struct.unpack_from('<d', data, p)[0]; p += 8
    elif ty == 'string':
        n = struct.unpack_from('<I', data, p)[0]; v = data[p+4:p+4+n].decode('utf8', 'replace'); p = al(p + 4 + n); return v, p, j
    elif ty == 'TypelessData':
        n = struct.unpack_from('<I', data, p)[0]; v = data[p+4:p+4+n]; p = al(p + 4 + n); return v, p, j
    elif idx + 1 < len(nodes) and nodes[idx + 1][1] == 'Array' and nodes[idx + 1][0] == lv + 1:
        n = struct.unpack_from('<I', data, p)[0]; p += 4
        en = idx + 3
        ety = nodes[en][1]
        if ety in ('char', 'UInt8', 'SInt8') and en + 1 >= j:
            v = data[p:p+n]; p += n
        elif ety in ('float', 'UInt32', 'SInt32', 'unsigned int', 'int') and en + 1 >= j:
            v = list(struct.unpack_from('<%d' % n + {'float': 'f', 'UInt32': 'I', 'unsigned int': 'I', 'SInt32': 'i', 'int': 'i'}[ety], data, p)); p += 4 * n
        else:
            v = []
            for _ in range(n):
                x, p, _n = read_tree(nodes, data, p, en); v.append(x)
        if mf & 0x4000 or nodes[idx + 1][4] & 0x4000: p = al(p)
        return v, p, j
    else:
        v = {}
        k = idx + 1
        while k < j:
            x, p, k2 = read_tree(nodes, data, p, k); v[nodes[k][2]] = x; k = k2
        if mf & 0x4000: p = al(p)
        return v, p, j
    if mf & 0x4000: p = al(p)
    return v, p, j
def meshes(sf):
    d = parse(sf); out = []
    for pid, off, sz, t in d['objs']:
        if t and t['cid'] == 43:
            if not t['nodes']: out.append((pid, None)); continue
            v, p, _ = read_tree(t['nodes'], sf, off, 0)
            out.append((pid, v))
    return d, out
if __name__ == '__main__':
    sys.path.insert(0, '.')
    from ufs import open_bundle
    B = open_bundle(sys.argv[1])
    cab = [k for k in B if not k.endswith('.resS')][0]
    d, ms = meshes(B[cab])
    print('ver', d['ver'], 'tt', d['tt'], 'objs', len(d['objs']), 'classes', sorted({o[3]['cid'] for o in d['objs']}))
    for pid, m in ms:
        if m is None: print('mesh no tree'); continue
        print(pid, m.get('m_Name'), list(m.keys())[:30])
        vd = m['m_VertexData']; print(' verts', vd['m_VertexCount'], 'ch', [(c['stream'], c['offset'], c['format'], c['dimension']) for c in vd['m_Channels']], 'datasz', len(vd['_typelessdata']) if '_typelessdata' in vd else vd.keys(), 'idx', len(m['m_IndexBuffer']), 'fmt', m.get('m_IndexFormat'), 'sub', len(m['m_SubMeshes']), 'streamdata', m.get('m_StreamData'))
