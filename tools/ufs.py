import struct, lzma, sys
def lz4_block(src, usize):
    out = bytearray(); i = 0; n = len(src)
    while i < n:
        tok = src[i]; i += 1
        ll = tok >> 4
        if ll == 15:
            while True:
                b = src[i]; i += 1; ll += b
                if b != 255: break
        out += src[i:i+ll]; i += ll
        if i >= n: break
        off = src[i] | (src[i+1] << 8); i += 2
        ml = tok & 15
        if ml == 15:
            while True:
                b = src[i]; i += 1; ml += b
                if b != 255: break
        ml += 4
        st = len(out) - off
        if off >= ml: out += out[st:st+ml]
        else:
            for k in range(ml): out.append(out[st + k])
    return bytes(out)
def decomp(data, ctype, usize):
    if ctype == 0: return data
    if ctype == 1:
        d = lzma.LZMADecompressor(lzma.FORMAT_RAW, None, [{'id': lzma.FILTER_LZMA1, 'dict_size': struct.unpack('<I', data[1:5])[0], 'lc': (data[0] % 9), 'lp': (data[0] // 9) % 5, 'pb': data[0] // 45}])
        return d.decompress(data[5:], usize)
    return lz4_block(data, usize)
def cstr(b, p):
    e = b.index(0, p); return b[p:e].decode('utf8', 'replace'), e + 1
def open_bundle(path):
    b = open(path, 'rb').read()
    sig, p = cstr(b, 0)
    assert sig == 'UnityFS', sig
    ver = struct.unpack('>I', b[p:p+4])[0]; p += 4
    _, p = cstr(b, p); _, p = cstr(b, p)
    size, cbi, ubi, flags = struct.unpack('>QIII', b[p:p+20]); p += 20
    if ver >= 7: p = (p + 15) & ~15
    if flags & 0x80: bi = b[len(b)-cbi:]
    else: bi = b[p:p+cbi]; p += cbi
    bi = decomp(bi, flags & 0x3f, ubi)
    nb = struct.unpack('>I', bi[16:20])[0]; q = 20; blocks = []
    for _ in range(nb):
        u, c, f = struct.unpack('>IIH', bi[q:q+10]); q += 10; blocks.append((u, c, f))
    nn = struct.unpack('>I', bi[q:q+4])[0]; q += 4; nodes = []
    for _ in range(nn):
        off, sz, fl = struct.unpack('>QQI', bi[q:q+20]); q += 20
        name, q = cstr(bi, q); nodes.append((off, sz, fl, name))
    data = bytearray()
    for u, c, f in blocks:
        data += decomp(b[p:p+c], f & 0x3f, u); p += c
    return {n[3]: bytes(data[n[0]:n[0]+n[1]]) for n in nodes}
if __name__ == '__main__':
    for k, v in open_bundle(sys.argv[1]).items(): print(k, len(v))
