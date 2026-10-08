// Conteúdo das cenas. Todo número vem do motor (calcular(base)); o texto fica nos módulos de js/conteudo/.
// Projetos do Top 3: 1 · FIN8.2 catálogo de indicadores · 2 · FIN5.11 segregação de funções ·
// 3 · FIN3.10 capital de giro e custo do dinheiro.
import { TOP3 } from "./conteudo/comum.js?v=202610071930";
import { projeto1 } from "./conteudo/fin82.js?v=202610071930";
import { projeto2 } from "./conteudo/fin511.js?v=202610071930";
import { projeto3 } from "./conteudo/fin310.js?v=202610071930";
export { SOCIOS, DIAS, FASES, AMOSTRA, TOP3_CODIGOS, NOMES, TOP3, top3 } from "./conteudo/comum.js?v=202610071930";
export { ABERTURA } from "./conteudo/abertura.js?v=202610071930";
export { FIM } from "./conteudo/fim.js?v=202610071930";

// ------------------------------------------------------------------------------ por projeto
export function conteudo(base, R, n) {
  const proj = TOP3[n - 1];
  const dataBase = "data-base 31 de agosto de 2026";
  if (n === 1) return projeto1(base, R, proj, dataBase);
  if (n === 2) return projeto2(base, R, proj, dataBase);
  return projeto3(base, R, proj, dataBase);
}
