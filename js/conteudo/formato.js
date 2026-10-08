// Formatos de número usados nos textos.
import { F } from "../util.js?v=202610081530";

export const r1 = (v) => F.n(v / 1e6, 1);            // milhões com uma casa
export const mi = (v, c = 1) => `R$ ${F.n(v / 1e6, c)} mi`;          // casas como argumento (padrão 1)
export const mil = (v) => `R$ ${F.n(Math.round(v / 1000))} mil`;
export const pc = (v, c = 1) => F.pct(v, c);
