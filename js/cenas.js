// As cenas, na ordem da peça. Cada cena monta a sua camada de texto, move câmera e luz dentro da própria linha
// do tempo GSAP e marca os pontos para onde o espaço salta (ver js/cenas/*.js).
import { abertura, historia } from "./cenas/abertura.js?v=202610071930";
import { formulario, analise, diagnostico, entregavel, resultado } from "./cenas/lente.js?v=202610071930";
import { oferta } from "./cenas/oferta.js?v=202610071930";
import { top3Cena } from "./cenas/top3.js?v=202610071930";
import { projetos208, fecho } from "./cenas/ecossistema.js?v=202610071930";

export const ORDEM = [
  { id: "abertura", f: abertura, nome: "Abertura" },
  { id: "projetos208", f: projetos208, nome: "Os 208 projetos" },
  { id: "historia", f: historia, nome: "O cenário" },
  { id: "top3", f: top3Cena, nome: "O Top 3 e a escolha" },
  { id: "formulario", f: formulario, nome: "O formulário se preenche", projeto: true },
  { id: "analise", f: analise, nome: "A análise", projeto: true },
  { id: "diagnostico", f: diagnostico, nome: "O diagnóstico", projeto: true },
  { id: "entregavel", f: entregavel, nome: "O entregável", projeto: true },
  { id: "resultado", f: resultado, nome: "O resultado", projeto: true },
  { id: "oferta", f: oferta, nome: "A oferta" },
  { id: "fecho", f: fecho, nome: "Fecho" },
];
