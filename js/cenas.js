// As cenas, na ordem da peça (roteiro em estudo/roteiro/). Cada cena monta a sua camada de texto, move câmera e
// luz dentro da própria linha do tempo GSAP e marca os pontos para onde o espaço salta (ver js/cenas/*.js).
// Os módulos entram como espaços de nome: uma cena que falte no seu arquivo vira provisória, e a peça continua rodando.
import * as A from "./cenas/abertura.js?v=202610071930";
import * as L from "./cenas/lente.js?v=202610071930";
import * as O from "./cenas/oferta.js?v=202610071930";
import * as T from "./cenas/top3.js?v=202610071930";
import * as E from "./cenas/ecossistema.js?v=202610071930";
import * as N from "./cenas/entrega.js?v=202610071930";
import { cenaProvisoria } from "./cenas/comum.js?v=202610071930";

const ou = (...fs) => { const titulo = fs.pop(); const f = fs.find((x) => typeof x === "function"); return f || ((c, ctx) => cenaProvisoria(c, ctx, titulo, "Cena provisória.", 5)); };

// Percurso principal: a venda que vira caixa, o retrato da rede, a lente FIN3.10 (insumos → cruzamento →
// descoberta → conta → semanas → entrega), "isto é um projeto", a oferta; depois o Top 3 como hub (as outras duas
// lentes são percursos opcionais que voltam a ele), quem conduz, os 208 projetos e o próximo passo.
export const ORDEM = [
  { id: "abertura", f: ou(A.abertura, "Abertura"), nome: "Abertura" },
  { id: "venda", f: ou(A.venda, "A venda que vira caixa"), nome: "A venda que vira caixa" },
  { id: "retrato", f: ou(A.retrato, "A rede e o porte"), nome: "A rede e o porte" },
  { id: "insumos", f: ou(L.insumos, "Os quatro documentos"), nome: "Os quatro documentos", projeto: 3 },
  { id: "cruzamento", f: ou(L.cruzamento, "O cruzamento"), nome: "O cruzamento", projeto: 3 },
  { id: "descoberta", f: ou(L.descoberta, "O que o cruzamento mostra"), nome: "O que o cruzamento mostra", projeto: 3 },
  { id: "conta", f: ou(L.conta, "O que a lente revela"), nome: "O que a lente revela", projeto: 3 },
  { id: "semanas", f: ou(L.semanas, "E no mês fraco?"), nome: "E no mês fraco?", projeto: 3 },
  { id: "entrega", f: ou(N.entrega, "A entrega"), nome: "A entrega", projeto: 3 },
  { id: "um-projeto", f: ou(N.umProjeto, "Isto é um projeto."), nome: "Isto é um projeto", projeto: 3 },
  { id: "oferta", f: ou(O.oferta, "A oferta"), nome: "A oferta" },
  { id: "top3", f: ou(T.top3Cena, "Mais duas lentes"), nome: "Mais duas lentes", hub: true },
  { id: "lente1", f: ou(L.diagnostico, "Lente FIN8.2"), nome: "Lente FIN8.2", projeto: 1, opcional: "lente1", compacto: true },
  { id: "lente2", f: ou(L.diagnostico, "Lente FIN5.11"), nome: "Lente FIN5.11", projeto: 2, opcional: "lente2", compacto: true },
  { id: "socios", f: ou(E.socios, "Quem conduz o diagnóstico"), nome: "Quem conduz o diagnóstico" },
  { id: "projetos208", f: ou(E.projetos208, "208 projetos"), nome: "208 projetos, em dez fases" },
  { id: "fecho", f: ou(E.fecho, "Próximo passo"), nome: "Próximo passo" },
];
