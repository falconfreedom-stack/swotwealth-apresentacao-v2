// Textos das cenas de abertura (bloco S1), pelo roteiro v1 (estudo/roteiro/50-roteiro-v1.md, cenas 0–2):
// a abertura (sem texto), a venda que vira caixa e o retrato da rede ilustrativa.
// Todo número da rede e do exemplo vem do motor (R.fin310) ou da base; o texto não fixa valor.
// [K] = texto-chave (os dois modos); [L] = legenda de leitura (só no modo assistir: classe so-assistir).
// Mercado (Abióptica): vem de base.setor.mercado; enquanto a base não o trouxer, vale SETOR_PADRAO, copiado de
// estudo/pesquisa/12-parametros.json (mercado_otico_brasil), com fonte e período. Pedido ao integrador: levar
// este bloco para dados/base.json → setor. Quebras de linha autorais: " / ".
import { F } from "../util.js?v=202610081530";
import { mi, pc } from "./formato.js?v=202610081530";

const EXTENSO = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze"];
const serial = (iso) => { const [a, m, d] = String(iso).slice(0, 10).split("-").map(Number); return Date.UTC(a, m - 1, d) / 864e5; };

// Referência pública (A1, acesso em 07/10/2026): vendas do varejo óptico e participação de SP (um mês: jan/2026).
export const SETOR_PADRAO = {
  mercado: { vendas_ano: 28.079e9, ano: 2025, pontos_de_venda: 71226, sp_pct: 37.6, sp_periodo: "jan/26",
    fonte: "Abióptica, via Diário do Comércio (18/02/2026) e Movimento Econômico (11/03/2026)" },
};

export function ABERTURA(base, R) {
  const Z = R.fin310, ex = Z.exemploVenda, rede = Z.rede, H = Z.custoDoDinheiro.hoje, an = Z.antecipacao, ag = Z.agenda;
  const M = (base && base.setor && base.setor.mercado) || SETOR_PADRAO.mercado;
  const n = ex.parcelas;
  // a lente vai ao laboratório e é paga na primeira parcela do fornecedor (base.fin310.saidas.lentes_blocos)
  const mesesLente = ((base.fin310.saidas || {}).lentes_blocos || {}).parcelas_meses?.[0] ?? 1;
  const diasUltima = Math.round(serial(ex.linhas[n - 1].vence) - serial(ex.data_venda));
  const vezes = Math.floor(ex.antecipar_tudo_taxa_atual.desconto / ex.mdr.valor);
  const pctSP = 100 * rede.faturamento_bruto_ano / (M.vendas_ano * M.sp_pct / 100);
  const pctCusto = H.pct_vendas;
  return {
    venda: {
      n, dataVenda: ex.data_venda,
      // [K] 1.1 · rótulos do aro (hora → texto) · [L] 1.1
      titulo: `Multifocal: / ${F.brl(ex.valor)} em ${n}× sem juros.`,
      aro: [[0, "hoje"], [3, "3 meses"], [6, "6 meses"], [9, "9 meses"]],
      legHora: "Cada hora do mostrador é um mês.",
      // 1.2
      ciclo: `Paga em ${mesesLente === 1 ? "um mês" : `${EXTENSO[mesesLente]} meses`}. / Recebe em ${EXTENSO[n] || n}.`,
      mesLente: mesesLente, rotLente: "lente paga", rotUltima: "última parcela",
      legCiclo: `A lente é paga em 30 e 60 dias; / a última parcela chega em ${diasUltima}.`,
      // 1.3
      antecipa: "Para ter hoje, / a rede antecipa.",
      legAntecipa: "Cada parcela volta do futuro com desconto: / quanto mais longe, maior.",
      // 1.4 (o desconto de cada parcela, em fração da parcela: a altura da lasca)
      lascas: ex.linhas.map((l) => l.desconto_atual / ex.valor_parcela),
      tudoHoje: "Tudo hoje:", heroi: F.brl(ex.antecipar_tudo_taxa_atual.desconto), pctVenda: `${pc(ex.antecipar_tudo_taxa_atual.pct_venda)} da venda`,
      legVezes: vezes >= 2 ? `mais de ${vezes} vezes a taxa da maquininha` : "",
      // roteiro v2 (D3): a taxa que dá o desconto, visível nos dois modos
      notaTaxa: `antecipação a ${pc(base.fin310.cartao.antecipacao_automatica.taxa_am, 2)} ao mês · premissa da rede ilustrativa`,
    },
    retrato: {
      rotulo: "rede ilustrativa · São Paulo",
      titulo: `${rede.lojas} lojas. / R$ ${F.n(rede.faturamento_bruto_ano / 1e6)} milhões por ano.`,
      legPorte: `≈ ${pc(pctSP)} do varejo óptico paulista.`,
      nota: `Mercado: Abióptica — R$ ${F.n(M.vendas_ano / 1e9, 2)} bi em ${M.ano}; SP, ${pc(M.sp_pct)} das vendas (${M.sp_periodo}). ${pc(pctSP)} é estimativa. Nenhum número do caso vem de empresa real.`,
      agenda: {
        titulo: `Parcelas a vencer: ${mi(ag.total)}. / ${pc(100 * ag.antecipado / ag.total, 0)} já antecipadas.`,
        legenda: [["o", "já antecipado"], ["g", `cedido ao banco, ${pc(100 * ag.cedido / ag.total, 0)}`], ["m", "livre"]],
        leg: "Antecipação automática: / no dia seguinte a cada venda no crédito.",
        meses: ag.meses.map((m) => ({ mes: m.mes, total: m.total, partes: [m.antecipado, m.cedido, m.livre] })),
      },
      palpite: {
        pergunta: "Que fatia da venda se gasta / para virar dinheiro disponível?",
        faixas: ["até 2%", "de 2% a 3%", "mais de 3%"],
        certa: pctCusto <= 2 ? 0 : pctCusto <= 3 ? 1 : 2,
      },
      custoAno: {
        valor: H.custo_converter_vendas_anual, fmt: (v) => mi(v, 2), pct: `${pc(pctCusto)} da venda`, sufixo: "por ano",
        // roteiro v2 (D2): cada parte da barra com o seu valor
        partes: [{ t: `taxa da maquininha · ${mi(H.mdr_anual, 2)}`, v: H.mdr_anual }, { t: `antecipação · ${mi(an.custo_anual_hoje, 2)}`, v: an.custo_anual_hoje }],
      },
      pergunta: "Quanto desse custo / é pago sem precisar?",
    },
  };
}
