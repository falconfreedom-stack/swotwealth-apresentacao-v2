// As cenas, na ordem da peça. Cada cena monta a sua camada de texto, move câmera e luz dentro da própria linha
// do tempo GSAP e marca os pontos para onde o espaço salta (ver js/cenas/*.js).
import { abertura, historia } from "./cenas/abertura.js?v=202610071930";
import { formulario, analise, diagnostico, entregavel, resultado } from "./cenas/lente.js?v=202610071930";
import { oferta } from "./cenas/oferta.js?v=202610071930";
import { top3Cena } from "./cenas/top3.js?v=202610071930";
import { projetos208, fecho } from "./cenas/ecossistema.js?v=202610071930";
import { calendario } from "./cenas/prototipo.js?v=202610071930";

// Percurso principal: a dor, a lente FIN3.10 inteira, a oferta; depois o Top 3 como hub (as outras duas lentes são
// percursos opcionais que voltam a ele), o ecossistema e o fecho. (Esqueleto provisório com as cenas antigas.)
export const ORDEM = [
  { id: "abertura", f: abertura, nome: "Abertura" },
  { id: "formulario", f: formulario, nome: "Os insumos", projeto: 3 },
  { id: "analise", f: analise, nome: "O cruzamento", projeto: 3 },
  { id: "diagnostico", f: diagnostico, nome: "O diagnóstico", projeto: 3 },
  { id: "entregavel", f: entregavel, nome: "O entregável", projeto: 3 },
  { id: "resultado", f: resultado, nome: "O resultado", projeto: 3 },
  { id: "oferta", f: oferta, nome: "A oferta" },
  { id: "top3", f: top3Cena, nome: "O Top 3: mais duas lentes", hub: true },
  { id: "lente1", f: diagnostico, nome: "Lente FIN8.2", projeto: 1, opcional: "lente1", compacto: true },
  { id: "lente2", f: diagnostico, nome: "Lente FIN5.11", projeto: 2, opcional: "lente2", compacto: true },
  { id: "projetos208", f: projetos208, nome: "Os 208 projetos" },
  { id: "fecho", f: fecho, nome: "Fecho" },
  { id: "proto", f: calendario, nome: "Protótipo: calendário", opcional: "proto" },
];
