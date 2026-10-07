// Formatos de número usados nos textos.
import { F } from "../util.js?v=202610071930";

export const r1 = (v) => F.n(v / 1e6, 1);            // milhões com uma casa
export const mi = (v) => `R$ ${r1(v)} mi`;
export const mil = (v) => `R$ ${F.n(Math.round(v / 1000))} mil`;
export const pc = (v, c = 1) => F.pct(v, c);
