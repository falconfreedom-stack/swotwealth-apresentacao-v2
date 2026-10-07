// O cenário (a ser substituído pela rede de óticas).
import { F } from "../util.js?v=202610071930";
import { mi, pc } from "./formato.js?v=202610071930";

// ------------------------------------------------------------------------------ a história
export function HISTORIA(base, R) {
  const r = R.rede, s = base.setor, seg = R.seg, c = R.custo;
  const gar = base.caixa.dividas.find((d) => d.nome === "Conta garantida");
  return {
    retrato: {
      topo: "Uma rede de academias de preço médio.",
      titulo: `${base.rede.unidades} unidades, ${F.n(Math.round(base.rede.alunos.pagantes / 1000))} mil alunos, R$ ${F.n(Math.round(r.bruto_ano / 1e6))} milhões por ano.`,
      fatos: [
        [`R$ ${r.ticket.faturado}`, `de ticket médio; no setor, de R$ ${F.n(s.ticket_convencional[0])} a R$ ${F.n(s.ticket_convencional[1])}`],
        [`${F.n(base.rede.churn_mensal_pct)}%`, `dos alunos saem por mês; no setor, de ${F.pct(s.churn_mensal_pct[0])} a ${F.pct(s.churn_mensal_pct[1])}`],
        [`${base.rede.meios_pct.cartao_recorrente}%`, "das mensalidades no cartão recorrente"],
      ],
      fonte: "Fontes do setor: Panorama Setorial Fitness Brasil 2026, Pacto e Banco Central.",
    },
    ebitda: { titulo: "Na reunião do conselho, o EBITDA dos últimos doze meses aparece com três números.",
      valores: [["DRE gerencial", r.ebitda.controladoria], ["pacote do conselho", r.ebitda.conselho], ["relatório ao banco", r.ebitda.banco]] },
    pagamentos: { titulo: `O financeiro faz ${F.n(seg.pagamentos.titulos)} pagamentos por ano. Em ${mi(seg.pagamentos.pessoa_unica_valor)}, a mesma pessoa cadastrou, aprovou e liberou.`,
      pct: seg.pagamentos.pessoa_unica_pct },
    caixa: { titulo: `No banco, ${mi(c.caixa_total)} parados rendem ${pc(c.rend_aplicacao_aa)} ao ano. No mesmo banco, a conta garantida custa ${pc(gar ? ((Math.pow(1 + gar.taxa_am / 100, 12) - 1) * 100) : 0)}.`,
      rend: c.rend_aplicacao_aa, custo: (Math.pow(1 + gar.taxa_am / 100, 12) - 1) * 100 },
    dor: "Quanto dinheiro a sua empresa deixa na mesa por ineficiência, falha ou ponto cego?",
    faixa: [["3", "números para o mesmo EBITDA"], [mi(seg.pagamentos.pessoa_unica_valor), "pagos sem segunda pessoa"], [mi(c.caixa_total), "parados enquanto a dívida custa até 35% ao ano"]],
  };
}
