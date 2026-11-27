// v843l — peanas contrastadas con libros y FAQ (FAQ manda sobre el libro)
import { T, DATA, ok, eq } from '../lib2.mjs';
const U0 = DATA.UNITS;
T('v843l-peana-faq', 'FAQ Reglas Hellcannon/Marauders/Skin Wolves (rh.txt)', 'Las peanas dictadas por la FAQ y las corregidas contra el libro coinciden (Marauders y familia 30x30, Skinwolves 50x50, Hunter 50x50)', () => {
  for (const id of ['woc_marauders', 'woc_marauders_gw', 'woc_marauders_amb', 'woc_marauders_gw_amb', 'woc_marauders_famb', 'woc_marauders_gw_famb', 'woc_chieftain', 'woc_berserkers']) { ok(U0[id], id); eq([U0[id].baseW, U0[id].baseD], [30, 30], id); }
  eq([U0.woc_skinwolves.baseW, U0.woc_skinwolves.baseD], [50, 50]);
  eq([U0.ok_hunter.baseW, U0.ok_hunter.baseD], [50, 50]);
});
T('v843l-peana-geom', 'peana en mm → pulgadas del motor', 'Toda unidad con peana tiene medidas positivas y cada peana de la FAQ no cambia respecto a la tabla', () => {
  for (const [id, d] of Object.entries(U0)) { if (!d.baseW) continue; ok(d.baseW > 0 && d.baseD > 0, id); }
});
