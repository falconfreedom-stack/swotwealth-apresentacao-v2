// Textos das cenas de abertura: a venda que vira caixa (a dor) e o retrato da rede e do porte.
// Todo número vem do motor (R) ou da base; nada digitado à mão. (Bloco do agente de cenas S1.)
import { F } from "../util.js?v=202610071930";
import { r1, mi, mil, pc } from "./formato.js?v=202610071930";

export function ABERTURA(base, R) {
  const Z = R.fin310, ex = Z.exemploVenda;
  return { exemplo: ex, custoAntecipacao: Z.antecipacao.custo_anual_hoje, custoConverter: Z.custoDoDinheiro.hoje.custo_converter_vendas_anual,
    pctConverter: Z.custoDoDinheiro.hoje.pct_vendas, rede: Z.rede };
}
