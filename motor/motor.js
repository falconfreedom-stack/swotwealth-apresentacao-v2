// Motor de cálculo da apresentação (v2). Recebe a base publicada (dados/base.json) e devolve todos os
// números que aparecem na tela, no material e no painel. Nenhum número da tela é digitado à mão.
// Projetos: 1 · catálogo de KPIs (FIN8.2) · 2 · segregação de funções (FIN5.11) · 3 · capital de giro e
// custo do dinheiro (FIN3.10). A rede é um exemplo montado com parâmetros públicos do setor.

const soma = (a) => a.reduce((s, x) => s + x, 0);
export const aa = (am) => (Math.pow(1 + am / 100, 12) - 1) * 100;            // % a.m. → % a.a.
export const am = (aaPct) => (Math.pow(1 + aaPct / 100, 1 / 12) - 1) * 100;   // % a.a. → % a.m.
const pmt = (pv, iPct, n) => { const i = iPct / 100; return n > 0 ? pv * i / (1 - Math.pow(1 + i, -n)) : pv * i; };

// ------------------------------------------------------------------------------------------ a rede
export function rede(base) {
  const r = base.rede;
  const mensalidades_mes = r.alunos.pagantes * r.ticket.faturado;
  const bruto_mes = mensalidades_mes + r.outras_receitas_mes;
  const bruto_ano = bruto_mes * 12;
  const liquida_ano = bruto_ano * (1 - r.deducoes_pct / 100);
  const cp = r.custos_pct_liquida;
  const custos = Object.fromEntries(Object.entries(cp).map(([k, v]) => [k, liquida_ano * v / 100]));
  const custos_total = soma(Object.values(custos));
  const ebitda_controladoria = liquida_ano - custos_total;
  const aluguel = custos.ocupacao * r.aluguel_parte_ocupacao_pct / 100;
  const ebitda_conselho = ebitda_controladoria + r.preoperacionais_12m + r.nao_recorrentes_12m;
  const ebitda_banco = ebitda_controladoria + aluguel;
  // o orçamento usou o ticket de tabela; a receita é medida pelo realizado
  const o = base.kpis.orcamento;
  const desvio_ticket_mes = r.alunos.pagantes * (r.ticket.tabela - r.ticket.realizado);
  const desvio_ytd = desvio_ticket_mes * o.meses_decorridos;
  const desvio_ano = desvio_ticket_mes * 12;
  return {
    mensalidades_mes, bruto_mes, bruto_ano, liquida_ano, custos, custos_total, aluguel,
    ebitda: { controladoria: ebitda_controladoria, conselho: ebitda_conselho, banco: ebitda_banco,
      ajustes_conselho: [{ t: "despesas pré-operacionais", v: r.preoperacionais_12m }, { t: "eventos não recorrentes", v: r.nao_recorrentes_12m }],
      ajustes_banco: [{ t: "aluguéis fora do EBITDA (IFRS 16)", v: aluguel }] },
    margem: { controladoria: 100 * ebitda_controladoria / liquida_ano, conselho: 100 * ebitda_conselho / liquida_ano, banco: 100 * ebitda_banco / liquida_ano },
    alunos: { ...r.alunos },
    ticket: { ...r.ticket, dif_tabela_realizado_pct: 100 * (r.ticket.tabela - r.ticket.realizado) / r.ticket.realizado },
    orcamento: { desvio_ticket_mes, desvio_ytd, desvio_ano, meses: o.meses_decorridos },
    cartao_mes: bruto_mes * r.meios_pct.cartao_recorrente / 100,
  };
}

// ------------------------------------------------------------------------------ Projeto 1 · KPIs
export function kpis(base) {
  const K = base.kpis, docs = K.documentos.map((d) => d.id);
  const linhas = K.indicadores.map((ind) => {
    const usos = docs.map((d) => ind.docs[d] || null);
    const divergente = usos.includes("d");
    return { nome: ind.nome, usos, divergente, dono: ind.dono, fonte: ind.fonte, n_docs: usos.filter(Boolean).length, n_div: usos.filter((u) => u === "d").length };
  });
  const celulas = soma(linhas.map((l) => l.n_docs));
  const celulas_div = soma(linhas.map((l) => l.n_div));
  const horas_mes = K.conciliacao_dias_mes * 8;
  return {
    docs: K.documentos, linhas, total: linhas.length,
    divergentes: linhas.filter((l) => l.divergente).length,
    sem_dono: linhas.filter((l) => !l.dono).length,
    sem_fonte: linhas.filter((l) => !l.fonte).length,
    celulas, celulas_div,
    conciliacao_dias_mes: K.conciliacao_dias_mes, conciliacao_dias_ano: K.conciliacao_dias_mes * 12, horas_mes,
    definicoes: K.definicoes,
  };
}

// ------------------------------------------------------------------ Projeto 2 · segregação de funções
export function segregacao(base) {
  const S = base.segregacao;
  const par = (a, b, x) => x.includes(a) && x.includes(b);
  const pessoas = S.pessoas.map((p) => {
    const conflitos = S.incompativeis.filter(([a, b]) => par(a, b, p.acessos));
    const caminho = (p.acessos.includes("C") || p.acessos.includes("B")) && p.acessos.includes("A") && p.acessos.includes("P");
    return { ...p, conflitos, n_conflitos: conflitos.length, caminho };
  });
  const pg = S.pagamentos_12m;
  const alt = soma(S.alteracoes_bancarias_mes), conf = soma(S.alteracoes_confirmadas_mes);
  return {
    passos: S.passos, pessoas,
    com_conflito: pessoas.filter((p) => p.n_conflitos > 0).length,
    caminho_inteiro: pessoas.filter((p) => p.caminho).length,
    conflitos_total: soma(pessoas.map((p) => p.n_conflitos)),
    pagamentos: { ...pg, pessoa_unica_pct: 100 * pg.pessoa_unica_valor / pg.valor, segregado_valor: pg.valor - pg.pessoa_unica_valor },
    alteracoes: { total: alt, confirmadas: conf, sem_confirmacao: alt - conf, mesmo_usuario_pagou: S.alteracoes_mesmo_usuario_pagou, por_mes: S.alteracoes_bancarias_mes, confirmadas_mes: S.alteracoes_confirmadas_mes },
    fracionamentos: S.fracionamentos, alcada: S.alcada_analista,
    usuarios_genericos: S.usuarios_genericos, acessos_desligados_ativos: S.acessos_desligados_ativos,
  };
}

// ------------------------------------------------------ Projeto 3 · capital de giro e custo do dinheiro
export function custoDoDinheiro(base) {
  const C = base.caixa, R = rede(base), s = base.setor;
  const fontes = C.dividas.map((d) => ({ ...d, taxa_aa: aa(d.taxa_am), custo_ano: d.saldo * aa(d.taxa_am) / 100 }));
  const cart = C.cartao;
  const antecipado_mes = R.cartao_mes * cart.antecipacao_pct_agenda / 100;
  const custo_antecipacao_ano = antecipado_mes * cart.taxa_antecipacao_am / 100 * (cart.prazo_recebimento_dias / 30) * 12;
  const mdr_excesso_ano = R.cartao_mes * 12 * (cart.mdr_efetivo_pct - cart.mdr_contratado_pct) / 100;
  const divida = soma(C.dividas.map((d) => d.saldo));
  const custo_divida_ano = soma(fontes.map((f) => f.custo_ano));
  const rend_aplicacao_aa = s.cdi_aa * C.aplicacao_pct_cdi / 100;
  const rendimento_ano = C.aplicacao * rend_aplicacao_aa / 100;
  const caixa_total = C.aplicacao + C.conta_movimento;
  const custo_total_ano = custo_divida_ano + custo_antecipacao_ano;
  const taxa_media_aa = 100 * custo_total_ano / (divida + antecipado_mes * cart.prazo_recebimento_dias / 30);
  const ebitda = R.ebitda.controladoria;
  return {
    fontes, divida, custo_divida_ano, antecipado_mes, custo_antecipacao_ano, taxa_antecipacao_aa: aa(cart.taxa_antecipacao_am),
    mdr_excesso_ano, cartao_mes: R.cartao_mes, custo_total_ano, taxa_media_aa,
    caixa_total, aplicacao: C.aplicacao, rend_aplicacao_aa, rendimento_ano,
    divida_liquida: divida - caixa_total, dl_ebitda: (divida - caixa_total) / ebitda,
    fonte_mais_cara: fontes.slice().sort((a, b) => b.taxa_am - a.taxa_am)[0],
  };
}

// Projeção diária de 91 dias a partir da data-base, somada por semana.
// opc: antecipacao_pct (0 a 100), quitar [nomes], amortizar {banco: valor}
export function projecao13(base, opc = {}) {
  const C = base.caixa, R = rede(base), r = base.rede, cart = C.cartao;
  const p = (opc.antecipacao_pct ?? cart.antecipacao_pct_agenda) / 100;
  const p0 = cart.antecipacao_pct_agenda / 100;
  const dias = 91, prazo = cart.prazo_recebimento_dias;
  const vendaDia = R.cartao_mes / 30;
  const mdr = cart.mdr_efetivo_pct / 100;
  const L = R.liquida_ano / 12, cp = r.custos_pct_liquida;
  // o que sai por mês, por natureza (cartões saem da receita líquida de MDR, não das despesas)
  const custoCartaoMes = R.cartao_mes * mdr;
  const mes = {
    folha: L * cp.folha / 100, ocupacao: L * cp.ocupacao / 100, energia_agua: L * cp.energia_agua / 100,
    fornecedores: L * (cp.manutencao + cp.vendas + cp.administrativo) / 100 - custoCartaoMes,
    tributos: R.bruto_mes * r.deducoes_pct / 100, capex: r.capex_mes, ir_cs: r.ir_cs_mes,
  };
  // dívida: serviço mensal depois das quitações e amortizações do plano
  let caixa0 = C.aplicacao + C.conta_movimento;
  const quitar = opc.quitar || [], amortizar = opc.amortizar || {};
  const servico = soma(C.dividas.map((d) => {
    let saldo = d.saldo;
    if (quitar.includes(d.nome)) { caixa0 -= saldo; return 0; }
    if (amortizar[d.banco] && d.nome === "Capital de giro") { caixa0 -= amortizar[d.banco]; saldo -= amortizar[d.banco]; }
    return pmt(saldo, d.taxa_am, d.parcelas);
  }));
  mes.divida = servico;
  // entradas: PIX, débito e boleto no próprio mês; outras receitas; cartão por agenda
  const outrosMeiosDia = (R.bruto_mes * (r.meios_pct.pix + r.meios_pct.debito + r.meios_pct.boleto) / 100) / 30;
  const saldo = []; let s = caixa0, custoAnt = 0;
  for (let d = 1; d <= dias; d++) {
    const dm = ((d - 1) % 30) + 1;
    let ent = outrosMeiosDia * (1 - 0.02);
    // cartão: vendas antes da data-base seguem a regra antiga; depois, a nova
    const vendaDoDiaAntigo = d - prazo <= 0;
    const pVelha = vendaDoDiaAntigo ? p0 : p;
    ent += vendaDia * (1 - pVelha) * (1 - mdr);                                   // parte não antecipada, D+prazo
    const fee = cart.taxa_antecipacao_am / 100 * (prazo / 30);
    ent += vendaDia * p * (1 - mdr) * (1 - fee);                                  // parte antecipada da venda de hoje, D+1
    custoAnt += vendaDia * p * (1 - mdr) * fee;
    let sai = 0;
    for (const [k, v] of Object.entries(mes)) for (const [dia, f] of C.calendario[k] || []) if (dia === dm) sai += v * f;
    s += ent - sai;
    saldo.push(s);
  }
  const semanas = [];
  for (let w = 0; w < 13; w++) { const fatia = saldo.slice(w * 7, w * 7 + 7); semanas.push({ fim: fatia[fatia.length - 1], min: Math.min(...fatia) }); }
  const minimo = Math.min(...saldo);
  const regra = C.saldo_minimo_proposto;
  return { semanas, saldo, minimo, caixa0, semanas_abaixo: semanas.filter((w) => w.min < regra).length, custo_antecipacao_13s: custoAnt, servico_mes: servico, antecipacao_pct: p * 100 };
}

// O plano de substituição de fontes: quitar a conta garantida, amortizar o Banco B, reduzir a antecipação
// até o menor percentual que mantém o saldo mínimo nas 13 semanas, contestar a taxa do cartão e cotar o resto.
export function planoFontes(base) {
  const C = base.caixa, CD = custoDoDinheiro(base), cart = C.cartao;
  const plano = C.plano;
  const opcBase = { quitar: plano.quitar, amortizar: plano.amortizar };
  const candidatos = [0, 5, 10, 15, 20, 25, 30, 40, 50].map((pc) => { const P = projecao13(base, { ...opcBase, antecipacao_pct: pc }); return { p: pc, minimo: P.minimo, abaixo: P.semanas_abaixo }; });
  const ok = candidatos.find((c) => c.minimo >= C.saldo_minimo_proposto) || candidatos[candidatos.length - 1];
  const escolhido = ok.p;
  const rendMes = CD.rend_aplicacao_aa / 12 / 100;
  const acoes = [];
  const gar = C.dividas.find((d) => d.nome === "Conta garantida");
  acoes.push({ id: "garantida", t: "Quitar a conta garantida com o caixa aplicado", v: gar.saldo * (aa(gar.taxa_am) - CD.rend_aplicacao_aa) / 100, tipo: "certo", quem: "empresa", quando: "semana 1" });
  const bb = C.dividas.find((d) => d.banco === "Banco B"), amB = plano.amortizar["Banco B"];
  acoes.push({ id: "amortizar", t: `Amortizar ${Math.round(amB / 1e6)} milhões do capital de giro do Banco B`, v: amB * (aa(bb.taxa_am) - CD.rend_aplicacao_aa) / 100, tipo: "dependente", quem: "empresa com o Banco B", quando: "semanas 2 a 4", nota: "depende de o contrato permitir amortização sem multa" });
  const reduz = (cart.antecipacao_pct_agenda - escolhido) / 100;
  const vAnt = CD.cartao_mes * reduz * (cart.taxa_antecipacao_am / 100 - rendMes) * 12;
  acoes.push({ id: "antecipacao", t: `Desligar a antecipação automática e antecipar ${escolhido}% da agenda, só por pedido`, v: vAnt, tipo: "certo", quem: "empresa", quando: "semana 1" });
  acoes.push({ id: "mdr", t: "Contestar a taxa do cartão acima do contrato e pedir o estorno", v: CD.mdr_excesso_ano, tipo: "certo", quem: "empresa com a credenciadora", quando: "semana 1" });
  const vCot = CD.cartao_mes * (escolhido / 100) * (cart.taxa_antecipacao_am - cart.taxa_cotada_registradora_am) / 100 * 12;
  acoes.push({ id: "cotar", t: "Cotar a antecipação restante com outros financiadores pela registradora", v: vCot, tipo: "dependente", quem: "financiadores", quando: "semanas 2 a 6" });
  const total = soma(acoes.map((a) => a.v)), certo = soma(acoes.filter((a) => a.tipo === "certo").map((a) => a.v));
  const hoje = projecao13(base);
  const depois = projecao13(base, { ...opcBase, antecipacao_pct: escolhido });
  return { candidatos, escolhido, acoes, total, certo, dependente: total - certo, hoje, depois, saldo_minimo: C.saldo_minimo_proposto };
}

// ------------------------------------------------------------------------------------------ tudo
export function calcular(base) {
  return { rede: rede(base), kpis: kpis(base), seg: segregacao(base), custo: custoDoDinheiro(base), plano: planoFontes(base) };
}

export const fmt = {
  n: (v, c = 0) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }),
  mi: (v, c = 1) => "R$ " + (v / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + " mi",
  mil: (v) => "R$ " + Math.round(v / 1000).toLocaleString("pt-BR") + " mil",
  pct: (v, c = 1) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + "%",
};
