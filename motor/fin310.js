// Origem: estudo/modelo/fin310.mjs (agente A4), com testes em estudo/modelo/teste_fin310.mjs. Entrada: base.fin310.
// FIN3.10 · Capital de giro e custo do dinheiro — modelo do varejo óptico (rede ILUSTRATIVA, não é empresa real).
// Módulo ES puro, sem dependências; roda em Node 18+ e no navegador. Entrada: base_fin310.json. Saída: calcularFin310(base).
//
// Convenções (detalhe e memória de cálculo em 30-auditoria-e-memoria.md):
//  · Datas são dias seriais UTC (inteiros); calendário bancário de São Paulo (feriados nacionais, 25/01, 09/07 e 31/12).
//  · Dívidas: % a.m. capitalizada por mês, tabela Price; taxa efetiva a.a. = (1 + i)^12 − 1.
//  · Antecipação: desconto simples por dia corrido, desconto = valor × taxa_am × dias / 30 (convenção das credenciadoras).
//    A taxa efetiva anual equivalente cresce com o prazo: (1 / (1 − taxa_am × dias / 30))^(365 / dias) − 1.
//  · Conta garantida: juros simples por dia corrido (taxa_am / 30) sobre o saldo do fim do dia; IOF de 0,0082% a.d. sobre o
//    saldo e 0,38% sobre cada acréscimo; juros e IOF debitados no 1º dia útil do mês seguinte.
//  · Aplicação: rende X% do CDI por dia útil sobre o saldo de abertura.
//  · Todo valor anual sai da simulação diária de 365 dias (01/09/2026 a 31/08/2027). As 13 semanas são os 91 primeiros dias
//    da mesma simulação. Nenhum valor anual é obtido multiplicando 13 semanas.
//  · R$ nominais, antes de IR/CSLL.

export const VERSAO = "1.0.0";

// ================================================================================================ números e datas
const DIA_MS = 86400000;
const soma = (a, f = (x) => x) => a.reduce((s, x) => s + f(x), 0);
export const aa = (amPct) => (Math.pow(1 + amPct / 100, 12) - 1) * 100;          // % a.m. composta → % a.a.
export const am = (aaPct) => (Math.pow(1 + aaPct / 100, 1 / 12) - 1) * 100;     // % a.a. → % a.m. composta
export function equivAnualDesconto(taxaAmPct, dias) {                             // desconto simples → taxa efetiva a.a.
  const d = taxaAmPct / 100 * dias / 30;
  return (Math.pow(1 / (1 - d), 365 / dias) - 1) * 100;
}
export function serial(isoStr) { const [a, m, d] = isoStr.split("-").map(Number); return Math.round(Date.UTC(a, m - 1, d) / DIA_MS); }
export function iso(n) { return new Date(n * DIA_MS).toISOString().slice(0, 10); }
const semana = (n) => (((n + 4) % 7) + 7) % 7;                                    // 0 = domingo (1970-01-01 foi quinta)
function partes(n) { const t = new Date(n * DIA_MS); return { a: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; }
function normMes(a, m) { const k = a * 12 + (m - 1); return { a: Math.floor(k / 12), m: (((k % 12) + 12) % 12) + 1 }; }
const diasNoMes = (a, m) => { const x = normMes(a, m); return new Date(Date.UTC(x.a, x.m, 0)).getUTCDate(); };
function dataDe(a, m, d) { const x = normMes(a, m); return Math.round(Date.UTC(x.a, x.m - 1, Math.min(d, diasNoMes(x.a, x.m))) / DIA_MS); }
const chaveMes = (a, m) => { const x = normMes(a, m); return `${x.a}-${String(x.m).padStart(2, "0")}`; };
const pad2 = (v) => String(v).padStart(2, "0");

// TIR anual (base 365) de fluxos [{ n, v }] — v > 0 entra no caixa da empresa, v < 0 sai. Bisseção.
export function taxaEfetivaAA(fluxosBrutos) {
  if (!fluxosBrutos.length) return null;
  const ag = new Map(); for (const f of fluxosBrutos) ag.set(f.n, (ag.get(f.n) || 0) + f.v);   // agrega por data
  const fluxos = [...ag].map(([n, v]) => ({ n, v }));
  const n0 = Math.min(...fluxos.map((f) => f.n));
  const vpl = (r) => soma(fluxos, (f) => f.v * Math.pow(1 + r, -(f.n - n0) / 365));
  let lo = -0.5, hi = 5, flo = vpl(lo), fhi = vpl(hi);
  if (flo * fhi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2, fm = vpl(mid);
    if (Math.abs(fm) < 1e-7) { lo = hi = mid; break; }
    if (flo * fm <= 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
  }
  return ((lo + hi) / 2) * 100;
}

// ================================================================================================ calendário
function pascoa(a) {                                                               // algoritmo anônimo gregoriano
  const A = a % 19, b = Math.floor(a / 100), c = a % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * A + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, mm = Math.floor((A + 11 * h + 22 * l) / 451);
  return dataDe(a, Math.floor((h + l - 7 * mm + 114) / 31), ((h + l - 7 * mm + 114) % 31) + 1);
}

export function criarCalendario(base, aIni, aFim) {
  const fer = new Set();
  for (let a = aIni; a <= aFim; a++) {
    for (const md of base.calendario.feriados_fixos) { const [m, d] = md.split("-").map(Number); fer.add(dataDe(a, m, d)); }
    const p = pascoa(a);
    for (const off of base.calendario.feriados_moveis_dias_da_pascoa) fer.add(p + off);
  }
  const util = (n) => { const s = semana(n); return s !== 0 && s !== 6 && !fer.has(n); };
  const prox = (n) => { while (!util(n)) n++; return n; };
  const ant = (n) => { while (!util(n)) n--; return n; };
  const nUtil = (a, m, k) => { let n = dataDe(a, m, 1), c = 0; for (;;) { if (util(n) && ++c === k) return n; n++; } };
  const ultimoUtil = (a, m) => ant(dataDe(a, m + 1, 1) - 1);
  return { util, prox, ant, nUtil, ultimoUtil, feriados: fer };
}

// ================================================================================================ vendas
function eventosDoAno(a) {
  const segundoDomingo = (m) => { let n = dataDe(a, m, 1); while (semana(n) !== 0) n++; return n + 7; };
  let q = dataDe(a, 11, 1); while (semana(q) !== 4) q++;
  return [segundoDomingo(5), segundoDomingo(8), q + 21 + 1, dataDe(a, 12, 24)];      // mães, pais, Black Friday, Natal
}

// Venda diária planejada do mês (a, m): total do mês × peso do dia ÷ soma dos pesos do mês.
function vendasDoMes(base, a, m, fator) {
  const R = base.rede, x = normMes(a, m), total = R.vendas_mensais[pad2(x.m)] * fator;
  const n1 = dataDe(x.a, x.m, 1), nd = diasNoMes(x.a, x.m);
  const fechadas = new Set(base.calendario.lojas_fechadas), evs = eventosDoAno(x.a);
  const J = R.eventos.janela_dias, F = R.eventos.fator, pesos = [];
  for (let i = 0; i < nd; i++) {
    const n = n1 + i, p = partes(n);
    let w = fechadas.has(`${pad2(p.m)}-${pad2(p.d)}`) ? 0 : R.peso_dia_semana[semana(n)];
    if (evs.some((e) => n <= e && n > e - J)) w *= F;
    pesos.push(w);
  }
  const sw = soma(pesos);
  return pesos.map((w, i) => ({ n: n1 + i, total: total * w / sw }));
}

function distribuicaoParcelas(base, estresse) {
  const p = {}; for (let N = 2; N <= 10; N++) p[N] = base.rede.parcelas_pct[N] || 0;
  if (estresse && estresse.pp_para_10x) {
    const resto = 100 - p[10], novo = Math.max(0, resto - estresse.pp_para_10x);
    for (let N = 2; N <= 9; N++) p[N] = p[N] * novo / resto;
    p[10] = 100 - novo;
  }
  return p;
}

function dividirMeios(base, n, total, parcPct) {
  const mx = base.rede.mix_pct, v = { n, total, pix: total * mx.pix / 100, dinheiro: total * mx.dinheiro / 100,
    debito: total * mx.debito / 100, c1: total * mx.credito_vista / 100, parc: new Array(11).fill(0) };
  const tp = total * mx.credito_parcelado / 100;
  for (let N = 2; N <= 10; N++) v.parc[N] = tp * parcPct[N] / 100;
  return v;
}

// ================================================================================================ contexto comum
export function prepararContexto(base) {
  const nDB = serial(base.data_base), n0 = nDB + 1, n1 = nDB + base.dias_horizonte, nh0 = nDB - base.dias_historico + 1;
  const a0 = partes(nh0).a - 1, a1 = partes(n1).a + 2;
  const cal = criarCalendario(base, a0, a1);
  const nP = serial(base.plano.inicio);
  // venda planejada (sem estresse), por dia, de nh0 até o fim do mês de n1
  const plano = new Map(), mensalPlano = new Map();
  const pI = partes(nh0), pF = partes(n1);
  for (let k = 0; ; k++) {
    const x = normMes(pI.a, pI.m + k);
    if (x.a * 12 + x.m > pF.a * 12 + pF.m + 1) break;
    const fator = Math.pow(1 + (base.rede.crescimento_aa_pct || 0) / 100, dataDe(x.a, x.m, 1) >= n0 ? 1 : 0);
    const dias = vendasDoMes(base, x.a, x.m, fator);
    for (const d of dias) plano.set(d.n, d.total);
    mensalPlano.set(chaveMes(x.a, x.m), soma(dias, (d) => d.total));
  }
  return { base, cal, nDB, n0, n1, nh0, nP, nFimProj: n0 + base.dias_projecao - 1, plano, mensalPlano, nMdrDesde: serial(base.cartao.mdr_divergencia_desde) };
}

// Venda real do cenário (com estresse), dividida por meio de pagamento.
function vendasDoCenario(ctx, cen) {
  const { base, nh0, n1, n0, nFimProj } = ctx, e = cen.estresse ? base.estresses[cen.estresse] : null;
  const parcBase = distribuicaoParcelas(base, null), parcEst = distribuicaoParcelas(base, e && e.pp_para_10x ? e : null);
  const v = new Map();
  for (const [n, total0] of ctx.plano) {
    if (n < nh0) continue;
    const naJanela = n >= n0 && n <= nFimProj;
    const total = e && e.queda_pct && naJanela ? total0 * (1 - e.queda_pct / 100) : total0;
    v.set(n, dividirMeios(base, n, total, e && e.pp_para_10x && naJanela ? parcEst : parcBase));
  }
  return v;
}

// ================================================================================================ recebíveis (URs)
function faixaMdr(N) { return N === 1 ? "credito_1x" : N <= 6 ? "credito_2_6x" : "credito_7_10x"; }
function taxaMdr(ctx, cen, faixa, nVenda) {
  const C = ctx.base.cartao;
  const contratoVale = cen.mdr === "contratado" && nVenda >= ctx.nP;
  if (contratoVale || nVenda < ctx.nMdrDesde) return C.mdr_contratado_pct[faixa];
  return C.mdr_cobrado_pct[faixa];
}

function gerarURs(ctx, cen, vendas) {
  const { base, cal, n0 } = ctx, trava = base.cartao.trava_banco_b_pct / 100, urs = [];
  for (const v of vendas.values()) {
    for (let N = 1; N <= 10; N++) {
      const valor = N === 1 ? v.c1 : v.parc[N];
      if (!valor) continue;
      const mdr = taxaMdr(ctx, cen, faixaMdr(N), v.n);
      for (let k = 1; k <= N; k++) {
        const vence = cal.prox(v.n + base.cartao.liquidacao.credito_dias_corridos_por_parcela * k);
        if (vence < n0) continue;                                                  // liquidada antes da data-base
        const bruto = valor / N, liq = bruto * (1 - mdr / 100), ced = liq * trava;
        urs.push({ venda: v.n, vence, N, k, bruto, mdr, liq, ced, livre: liq - ced, ant: 0, antHist: 0 });
      }
    }
  }
  urs.sort((x, y) => x.vence - y.vence || x.venda - y.venda || x.N - y.N || x.k - y.k);
  return urs;
}

// ================================================================================================ contas a pagar
const GRUPO = {
  armacoes: "fornecedores", lentes_blocos: "fornecedores", laboratorios_terceiros: "fornecedores", lc_solares_acessorios: "fornecedores",
  salarios: "folha", decimo_terceiro: "folha", encargos: "folha", beneficios: "folha",
  ocupacao: "ocupacao", marketing: "outras", servicos: "outras", capex: "outras",
  icms: "impostos", pis_cofins: "impostos", ir_cs: "impostos", tarifas: "financeiro",
};

function gerarObrigacoes(ctx, cen, vendas) {
  const { base, cal, nDB, n0, n1 } = ctx, S = base.saidas, e = cen.estresse ? base.estresses[cen.estresse] : null;
  const real = new Map();
  for (const v of vendas.values()) { const p = partes(v.n), k = chaveMes(p.a, p.m); real.set(k, (real.get(k) || 0) + v.total); }
  const planoM = (a, m) => { const k = chaveMes(a, m); if (ctx.mensalPlano.has(k)) return ctx.mensalPlano.get(k); const x = normMes(a, m); return base.rede.vendas_mensais[pad2(x.m)]; };
  const realM = (a, m) => real.get(chaveMes(a, m)) ?? planoM(a, m);
  const anualPlano = soma(Object.values(base.rede.vendas_mensais));
  const out = new Map();
  const add = (n, v, nat) => { if (n < n0 || n > n1 || !(v > 0)) return; if (!out.has(n)) out.set(n, []); out.get(n).push({ v, nat }); };
  const { a: aDB, m: mDB } = partes(nDB), F = S.folha, O = S.ocupacao, pF = partes(n1);
  const kMax = (pF.a * 12 + pF.m) - (aDB * 12 + mDB) + 1;
  for (let k = -4; k <= kMax; k++) {
    const { a, m } = normMes(aDB, mDB + k), vReal = realM(a, m), vPlano = planoM(a, m);
    // armações: compra no mês m para a venda planejada de m + 1; 30/60/90 (estresse c: compra maior e à vista em 30 dias)
    const conc = e && e.meses_compra && e.meses_compra.includes(m);
    const compra = S.armacoes.pct_vendas / 100 * planoM(a, m + S.armacoes.compra_meses_antes) * (conc ? e.fator_compras : 1);
    const parcA = conc ? e.parcelas_meses : S.armacoes.parcelas_meses;
    for (const j of parcA) add(cal.prox(dataDe(a, m + j, S.armacoes.dia_compra)), compra / parcA.length, "armacoes");
    for (const nat of ["lentes_blocos", "laboratorios_terceiros", "lc_solares_acessorios"]) {
      const it = S[nat], tot = it.pct_vendas / 100 * vReal;
      for (const j of it.parcelas_meses) add(cal.prox(dataDe(a, m + j, it.dia)), tot / it.parcelas_meses.length, nat);
    }
    // folha: adiantamento no dia 20; saldo, comissões e terço de férias no 5º dia útil; encargos no dia 20 do mês seguinte
    const W = F.salarios_mes, com = F.comissao_pct_vendas / 100 * vReal, fer = W * F.ferias_terco_pct_salarios / 100;
    add(cal.ant(dataDe(a, m, F.dia_adiantamento)), W * F.adiantamento_pct / 100, "salarios");
    add(cal.nUtil(a, m + 1, F.dia_util_pagamento), W * (1 - F.adiantamento_pct / 100) + com + fer, "salarios");
    add(cal.ant(dataDe(a, m + 1, F.dia_encargos)), F.encargos_pct / 100 * (W + com + fer), "encargos");
    add(cal.nUtil(a, m, 1), F.beneficios_mes, "beneficios");
    if (m === 11 || m === 12) {
      const base13 = W + F.comissao_pct_vendas / 100 * anualPlano / 12;
      const [m1, d1] = F.decimo_terceiro_primeira.split("-").map(Number);
      const seg = e && e.decimo_terceiro_segunda ? e.decimo_terceiro_segunda : F.decimo_terceiro_segunda;
      const [m2, d2] = seg.split("-").map(Number), [me, de] = F.decimo_terceiro_segunda.split("-").map(Number);
      if (m === 11) { add(cal.ant(dataDe(a, m1, d1)), base13 / 2, "decimo_terceiro"); add(cal.ant(dataDe(a, m2, d2)), base13 / 2, "decimo_terceiro"); }
      if (m === 12) add(cal.ant(dataDe(a, me, de)), F.encargos_pct / 100 * base13, "encargos");
    }
    // ocupação: mínimo (dobrado em dezembro), condomínio e fundo, rua/laboratório/escritório no dia 10; percentual no mês seguinte
    const minimo = O.aluguel_minimo_shopping_mes * (m === 12 && O.dezembro_dobra_minimo ? 2 : 1);
    add(cal.prox(dataDe(a, m, O.dia)), minimo + O.condominio_fpp_mes + O.aluguel_rua_lab_escritorio_mes, "ocupacao");
    add(cal.prox(dataDe(a, m + 1, O.dia)), O.aluguel_percentual_pct_vendas / 100 * vReal, "ocupacao");
    if (O.iptu_meses.includes(m)) add(cal.prox(dataDe(a, m, O.dia_iptu)), O.iptu_outros_ano / O.iptu_meses.length, "ocupacao");
    add(cal.prox(dataDe(a, m, S.dia_marketing)), S.marketing_ano * vPlano / anualPlano, "marketing");
    for (const d of S.dias_servicos) add(cal.prox(dataDe(a, m, d)), S.servicos_mes / S.dias_servicos.length, "servicos");
    const T = S.tributos_vendas;
    add(cal.ant(dataDe(a, m + 1, T.dia_icms)), T.icms_pct / 100 * vReal, "icms");
    add(cal.ant(dataDe(a, m + 1, T.dia_pis_cofins)), T.pis_cofins_pct / 100 * vReal, "pis_cofins");
    add(cal.ultimoUtil(a, m + 1), S.ir_cs_pct_vendas / 100 * vReal, "ir_cs");
    add(cal.prox(dataDe(a, m, S.dia_capex)), S.capex_mes, "capex");
    add(cal.nUtil(a, m, 1), S.tarifas_mes, "tarifas");
  }
  return out;
}

// ================================================================================================ dívidas (Price)
export function cronogramaDividas(ctx) {
  const { base, cal, nDB, n0, n1 } = ctx, { a, m } = partes(nDB), out = [];
  for (const d of base.dividas) {
    const i = d.taxa_am / 100, n = d.parcelas_restantes, pmt = d.saldo * i / (1 - Math.pow(1 + i, -n));
    let saldo = d.saldo; const parcelas = [];
    for (let j = 1; j <= n; j++) {
      const vence = cal.prox(dataDe(a, m + j, d.dia_vencimento)), juros = saldo * i, principal = pmt - juros;
      parcelas.push({ vence, juros, principal, saldoDepois: saldo - principal });
      saldo -= principal;
    }
    // saldo médio diário no horizonte (degrau: cai no dia do pagamento)
    let s = d.saldo, idx = 0, acum = 0;
    for (let t = n0; t <= n1; t++) { while (idx < parcelas.length && parcelas[idx].vence <= t) s = parcelas[idx++].saldoDepois; acum += s; }
    const noAno = parcelas.filter((p) => p.vence >= n0 && p.vence <= n1);
    out.push({ id: d.id, nome: d.nome, credor: d.credor, garantia: d.garantia, taxa_am: d.taxa_am, saldo_inicial: d.saldo, pmt,
      parcelas, saldo_medio: acum / (n1 - n0 + 1), juros_ano: soma(noAno, (p) => p.juros), principal_ano: soma(noAno, (p) => p.principal) });
  }
  return out;
}

// ================================================================================================ simulação diária
export const CENARIOS = {
  hoje: { id: "hoje", tesouraria: "hoje", quitarGarantida: false, antecipacao: "automatica", fontePedido: "credenciadora", mdr: "cobrado" },
  s1: { id: "s1", tesouraria: "plano", quitarGarantida: true, antecipacao: "automatica", fontePedido: "credenciadora", mdr: "cobrado" },
  s2: { id: "s2", tesouraria: "plano", quitarGarantida: true, antecipacao: "pedido", fontePedido: "credenciadora", mdr: "cobrado" },
  s3: { id: "s3", tesouraria: "plano", quitarGarantida: true, antecipacao: "pedido", fontePedido: "cotada", mdr: "cobrado" },
  plano: { id: "plano", tesouraria: "plano", quitarGarantida: true, antecipacao: "pedido", fontePedido: "cotada", mdr: "contratado" },
};
const ENTRADAS = ["pix", "dinheiro", "debito", "agenda", "antecipacao", "rendimento", "garantida_saque"];
const SAIDAS = ["devolucoes", ...Object.keys(GRUPO), "divida_juros", "divida_principal", "garantida_juros", "garantida_iof", "garantida_amortizacao"];

export function simular(base, cen, ctxIn, janela) {
  const ctx = ctxIn || prepararContexto(base);
  const { cal, nDB, n0, n1, nP } = ctx, C = base.cartao, P = base.plano, Cx = base.caixa, G = base.conta_garantida;
  const iofP = base.mercado.iof_credito_pj, H = Cx.regra_hoje;
  const vendas = vendasDoCenario(ctx, cen), urs = gerarURs(ctx, cen, vendas), obrig = gerarObrigacoes(ctx, cen, vendas);
  const dividas = cronogramaDividas(ctx), parcDiv = new Map();
  for (const d of dividas) for (const p of d.parcelas) if (p.vence >= n0 && p.vence <= n1) { if (!parcDiv.has(p.vence)) parcDiv.set(p.vence, []); parcDiv.get(p.vence).push({ ...p, id: d.id }); }
  const fAuto = C.antecipacao_automatica, Y = fAuto.pct_da_parte_livre / 100;
  const fPedido = cen.fontePedido === "cotada" ? C.antecipacao_cotada : cen.fontePedido === "banco_iof" ? C.antecipacao_cotada_banco_com_iof : C.antecipacao_por_pedido_credenciadora;
  const planoTes = cen.tesouraria === "plano", autoLigada = (t) => cen.antecipacao === "automatica" || t < nP;
  const rendDia = (Math.pow(1 + base.mercado.cdi_aa / 100, 1 / 252) - 1) * Cx.aplicacao_pct_cdi / 100;
  const gJ = G.taxa_am / 100 / 30, gIofD = G.iof ? iofP.diario_pct / 100 : 0, gIofA = G.iof ? iofP.adicional_pct / 100 : 0;
  const des = P.desconto_previsao_vendas_pct / 100, mx = base.rede.mix_pct, devol = base.rede.devolucoes_pct / 100;
  const mdrDeb = C.mdr_cobrado_pct.debito / 100;

  // índices das URs
  const porVenda = new Map(), porVence = new Map();
  urs.forEach((u, i) => { if (!porVenda.has(u.venda)) porVenda.set(u.venda, []); porVenda.get(u.venda).push(i); if (!porVence.has(u.vence)) porVence.set(u.vence, [i, i + 1]); else porVence.get(u.vence)[1] = i + 1; });
  const primeiroComVence = (nMin) => { let lo = 0, hi = urs.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (urs[mid].vence < nMin) lo = mid + 1; else hi = mid; } return lo; };

  // histórico: antecipação automática das vendas cujo crédito caiu antes da data-base (sem efeito de caixa no horizonte)
  const historico = [];
  for (const u of urs) {
    if (u.venda > nDB) continue;
    const c = cal.prox(u.venda + fAuto.credito_dias_uteis);
    if (c >= n0) continue;
    const x = Y * u.livre, desc = x * fAuto.taxa_am / 100 * (u.vence - c) / 30;
    u.ant = x; u.antHist = x; historico.push({ n: c, vence: u.vence, face: x, liq: x - desc });
  }
  const agendaDataBase = resumirAgenda(urs, nDB);

  // estado
  let M = Cx.movimento_data_base, A = Cx.aplicacao_data_base, CG = G.sacado_data_base;
  let acJ = CG * gJ * 31, acI = CG * gIofD * 31;                                    // juros e IOF de agosto, cobrados em 1º/09
  const registros = [], diario = [], pend = new Map(), alertas = { garantida_no_plano: 0, saldo_abaixo_minimo: 0, limite_estourado: 0, sem_recebivel_livre: 0, emergencias: 0 };
  const addPend = (n, k, v) => { if (!pend.has(n)) pend.set(n, { debito: 0, dinheiro: 0 }); pend.get(n)[k] += v; };
  for (let s = n0 - 10; s < n0; s++) { const v = vendas.get(s); if (!v) continue; const nd = cal.prox(s + 1); if (nd >= n0) { addPend(nd, "debito", v.debito * (1 - mdrDeb)); addPend(nd, "dinheiro", v.dinheiro); } }
  let sAuto = n0 - 10; while (sAuto < n0 && cal.prox(sAuto + fAuto.credito_dias_uteis) < n0) sAuto++;
  let iLiq = 0; while (iLiq < urs.length && urs[iLiq].vence < n0) iLiq++;

  const antecipar = (alvoLiq, minVence, t, tipo, fonte, ent) => {
    let obtido = 0;
    for (let i = primeiroComVence(minVence); i < urs.length && obtido < alvoLiq - 0.005; i++) {
      const u = urs[i], disp = u.livre - u.ant;                                   // só a parte livre (nunca a cedida ao Banco B)
      if (disp <= 0.005) continue;
      const dias = u.vence - t, fJ = fonte.taxa_am / 100 * dias / 30, fI = fonte.iof ? iofP.adicional_pct / 100 + iofP.diario_pct / 100 * Math.min(dias, 365) : 0;
      const lpr = 1 - fJ - fI; if (lpr <= 0) continue;
      const x = Math.min(disp, (alvoLiq - obtido) / lpr);
      u.ant += x; obtido += x * lpr;
      registros.push({ n: t, vence: u.vence, face: x, juros: x * fJ, iof: x * fI, liq: x * lpr, taxa_am: fonte.taxa_am, iofSim: !!fonte.iof, tipo, dias, N: u.N, k: u.k, venda: u.venda });
    }
    ent.antecipacao += obtido;
    return obtido;
  };
  // Fluxo líquido previsto do dia j, visto no dia t. O que já aconteceu hoje (PIX, devoluções, débito e dinheiro de ontem,
  // juros da garantida) entra no saldo de partida da regra; aqui só o que ainda vai acontecer: agenda conhecida, contas a
  // pagar, dívida e, para os dias seguintes, a venda PLANEJADA com desconto de prudência (a regra não conhece o estresse).
  const previsto = (j, t) => {
    let f = 0;
    if (j > t) { const vp = ctx.plano.get(j) || 0; f += vp * mx.pix / 100 * (1 - des) - vp * devol; }
    if (cal.util(j)) {
      if (j > t) {
        const p = pend.get(j); if (p) f += p.debito + p.dinheiro;               // vendas reais até hoje, já conhecidas
        for (let s = Math.max(t + 1, j - 10); s < j; s++) if (cal.prox(s + 1) === j) { const vs = ctx.plano.get(s) || 0; f += vs * (mx.debito / 100 * (1 - mdrDeb) + mx.dinheiro / 100) * (1 - des); }
        const pj = partes(j); if (j === cal.nUtil(pj.a, pj.m, 1)) f -= acJ + acI;
      }
      const r = porVence.get(j); if (r) for (let i = r[0]; i < r[1]; i++) f += urs[i].liq - urs[i].ant;
      for (const o of obrig.get(j) || []) f -= o.v;
      for (const pd of parcDiv.get(j) || []) f -= pd.juros + pd.principal;
    }
    return f;
  };

  for (let t = n0; t <= n1; t++) {
    const ent = Object.fromEntries(ENTRADAS.map((k) => [k, 0])), sai = Object.fromEntries(SAIDAS.map((k) => [k, 0]));
    const util = cal.util(t), v = vendas.get(t), pt = partes(t);
    const M0 = M, A0 = A, rd = { jd: 0, jg: 0, ig: 0, tar: 0, rend: 0 };   // resultado financeiro do dia (competência)
    // vendas do dia: PIX entra hoje; débito e dinheiro no próximo dia útil; crédito vira agenda (URs)
    ent.pix += v.pix; sai.devolucoes += v.total * devol;
    const nd = cal.prox(t + 1); addPend(nd, "debito", v.debito * (1 - mdrDeb)); addPend(nd, "dinheiro", v.dinheiro);
    if (util) {
      const p = pend.get(t); if (p) { ent.debito += p.debito; ent.dinheiro += p.dinheiro; pend.delete(t); }
      if (t === cal.nUtil(pt.a, pt.m, 1)) { sai.garantida_juros += acJ; sai.garantida_iof += acI; acJ = 0; acI = 0; }
      // antecipação automática (D+1 útil) das vendas até ontem
      for (; sAuto < t; sAuto++) {
        if (!autoLigada(t)) continue;
        for (const i of porVenda.get(sAuto) || []) {
          const u = urs[i], x = Y * u.livre - u.ant; if (x <= 0.005) continue;
          const dias = u.vence - t, fJ = fAuto.taxa_am / 100 * dias / 30;
          u.ant += x; ent.antecipacao += x * (1 - fJ);
          registros.push({ n: t, vence: u.vence, face: x, juros: x * fJ, iof: 0, liq: x * (1 - fJ), taxa_am: fAuto.taxa_am, iofSim: false, tipo: "automatica", dias, N: u.N, k: u.k, venda: u.venda });
        }
      }
      if (planoTes && cen.quitarGarantida && t === cal.prox(nP) && CG > 0) { sai.garantida_amortizacao += CG; M -= CG; CG = 0; }
      // regra semanal do plano: no 1º dia útil de cada bloco de 7 dias, projetar e antecipar a falta + folga
      if (planoTes && cen.antecipacao !== "automatica" && t >= nP) {
        const b = Math.floor((t - n0) / 7), ini = n0 + 7 * b, fim = Math.min(ini + 6, n1);
        let f = ini; while (f <= fim && !cal.util(f)) f++;
        if (t === f) {
          // saldo de partida = abertura (já sem a garantida quitada) + o que já entrou e saiu hoje antes da regra
          let s = M + A + ent.pix + ent.debito + ent.dinheiro + ent.antecipacao - sai.devolucoes - sai.garantida_juros - sai.garantida_iof, minS = Infinity;
          for (let j = t; j <= fim; j++) { s += previsto(j, t); if (s < minS) minS = s; }
          const falta = P.saldo_minimo - minS;
          if (falta > 0) {
            const got = antecipar(falta + Math.max(P.folga_minima, falta * P.folga_pct / 100), fim + 1, t, "regra", fPedido, ent);
            if (got < falta - 1) alertas.sem_recebivel_livre++;
          }
        }
      }
      // agenda que vence hoje (parte não antecipada; a parte cedida ao Banco B também cai no caixa enquanto o contrato está em dia)
      for (; iLiq < urs.length && urs[iLiq].vence === t; iLiq++) ent.agenda += urs[iLiq].liq - urs[iLiq].ant;
      for (const o of obrig.get(t) || []) { sai[o.nat] += o.v; if (o.nat === "tarifas") rd.tar += o.v; }
      for (const pd of parcDiv.get(t) || []) { sai.divida_juros += pd.juros; sai.divida_principal += pd.principal; rd.jd += pd.juros; }
      const baseRend = planoTes ? Math.max(0, M0 + A0 - P.movimento_alvo) : A0;
      ent.rendimento += baseRend * rendDia; rd.rend += baseRend * rendDia;
    }
    // aplica os fluxos do dia (o rendimento fica na aplicação; o resto passa pela conta movimento)
    const liqDia = soma(ENTRADAS, (k) => ent[k]) - ent.rendimento - (soma(SAIDAS, (k) => sai[k]) - sai.garantida_amortizacao);
    A += ent.rendimento; M += liqDia;
    // fechamento da tesouraria
    if (!planoTes) {
      const gatilho = G.limite * H.resgate_gatilho_pct_limite / 100, alvoG = G.limite * H.resgate_alvo_pct_limite / 100;
      if (M < 0 && CG - M > gatilho && A > 0) {                                    // resgata antes de sacar: o resgatado não paga IOF
        const r = Math.min(A, CG - M - alvoG); A -= r; M += r;
        if (M > 0 && CG > 0) { const x = Math.min(M, CG); CG -= x; M -= x; sai.garantida_amortizacao += x; }
      }
      if (M < 0) { const x = -M; CG += x; M = 0; ent.garantida_saque += x; acI += x * gIofA; rd.ig += x * gIofA; }
      else if (CG > 0) { const x = Math.min(M, CG); CG -= x; M -= x; sai.garantida_amortizacao += x; }
      if (util && t === cal.ultimoUtil(pt.a, pt.m) && M > H.movimento_alvo) { A += M - H.movimento_alvo; M = H.movimento_alvo; }
      if (CG > gatilho && A > 0) { const x = Math.min(A, CG - alvoG); A -= x; CG -= x; sai.garantida_amortizacao += x; }
      if (CG > G.limite + 1) alertas.limite_estourado++;
    } else {
      let B = M + A;
      if (util && B < P.saldo_minimo && t >= nP) {                                 // reforço do dia: antecipar no mesmo dia
        const falta = P.saldo_minimo - B, b = Math.floor((t - n0) / 7), fim = Math.min(n0 + 7 * b + 6, n1);
        const got = antecipar(falta + Math.max(P.folga_minima, falta * P.folga_pct / 100), Math.max(fim + 1, t + 1), t, "reforco", fPedido, ent);
        if (got > 0) alertas.emergencias++;
        B += got;
      }
      if (B < 0) { const x = -B; CG += x; B = 0; ent.garantida_saque += x; acI += x * gIofA; rd.ig += x * gIofA; alertas.garantida_no_plano++; }
      else if (CG > 0 && B > P.saldo_minimo) { const x = Math.min(CG, B - P.saldo_minimo); CG -= x; B -= x; sai.garantida_amortizacao += x; }
      if (t >= nP && B < P.saldo_minimo - 1) alertas.saldo_abaixo_minimo++;
      M = Math.min(B, P.movimento_alvo); A = B - M;
    }
    // juros e IOF da garantida por dia corrido sobre o saldo do fim do dia
    acJ += CG * gJ; acI += CG * gIofD; rd.jg += CG * gJ; rd.ig += CG * gIofD;
    diario.push({ n: t, M, A, CG, saldo: M + A, liquido: M + A - CG, ent, sai, M0, A0, rd });
  }

  return resumirSimulacao(ctx, cen, { vendas, urs, registros, historico, diario, dividas, alertas, agendaDataBase }, janela);
}

// ================================================================================================ resumos
function resumirAgenda(urs, nDB) {
  const meses = new Map();
  for (const u of urs) {
    if (u.venda > nDB) continue;
    const p = partes(u.vence), k = chaveMes(p.a, p.m);
    if (!meses.has(k)) meses.set(k, { mes: k, total: 0, antecipado: 0, cedido: 0, livre: 0 });
    const r = meses.get(k); r.total += u.liq; r.antecipado += u.ant; r.cedido += u.ced; r.livre += u.livre - u.ant;
  }
  const lista = [...meses.values()].sort((a, b) => a.mes.localeCompare(b.mes));
  const tot = { total: soma(lista, (r) => r.total), antecipado: soma(lista, (r) => r.antecipado), cedido: soma(lista, (r) => r.cedido), livre: soma(lista, (r) => r.livre) };
  return { meses: lista, ...tot };
}

function resumirSimulacao(ctx, cen, x, janela) {
  const { base, n0, n1 } = ctx, C = base.cartao;
  const w0 = janela ? janela.w0 : n0, w1 = janela ? janela.w1 : n1;               // janela de medição (padrão: o ano todo)
  const D = x.diario.filter((d) => d.n >= w0 && d.n <= w1), nd = D.length;
  const regs = x.registros.filter((r) => r.n >= w0 && r.n <= w1);
  // Custo de antecipação por competência: o desconto de cada operação é distribuído pelos dias entre o crédito e o
  // vencimento; entra na janela só a parte desses dias que cai nela (inclusive das antecipações feitas antes da
  // data-base, iguais em todos os cenários). Assim, o desconto pago adiantado por uma parcela longa vendida perto do fim
  // do ano não "barateia" nem "encarece" o ano em que foi pago.
  const apropriar = (n, vence, desc) => { const vida = vence - n; if (vida <= 0) return 0; const dentro = Math.max(0, Math.min(vence, w1 + 1) - Math.max(n, w0)); return desc * dentro / vida; };
  const antecipacao_historico = soma(x.historico, (h) => apropriar(h.n, h.vence, h.face - h.liq));
  const antecipacao = antecipacao_historico + soma(x.registros, (r) => apropriar(r.n, r.vence, r.juros + r.iof));
  const antecipacao_caixa = soma(regs, (r) => r.juros + r.iof);
  const rf = { juros_dividas: soma(D, (d) => d.rd.jd), juros_garantida: soma(D, (d) => d.rd.jg), iof_garantida: soma(D, (d) => d.rd.ig),
    tarifas: soma(D, (d) => d.rd.tar), rendimento: soma(D, (d) => d.rd.rend), antecipacao_caixa, antecipacao_historico,
    antecipacao_juros_caixa: soma(regs, (r) => r.juros), antecipacao_iof_caixa: soma(regs, (r) => r.iof) };
  const resultado_financeiro = antecipacao + rf.juros_dividas + rf.juros_garantida + rf.iof_garantida + rf.tarifas - rf.rendimento;
  const resultado_financeiro_caixa = antecipacao_caixa + rf.juros_dividas + rf.juros_garantida + rf.iof_garantida + rf.tarifas - rf.rendimento;
  // MDR por competência das vendas da janela
  let mdr = 0, vendas = 0, venda710 = 0, credito = 0;
  for (const v of x.vendas.values()) {
    if (v.n < w0 || v.n > w1) continue;
    vendas += v.total;
    mdr += v.debito * C.mdr_cobrado_pct.debito / 100 + v.c1 * taxaMdr(ctx, cen, "credito_1x", v.n) / 100;
    for (let N = 2; N <= 10; N++) mdr += v.parc[N] * taxaMdr(ctx, cen, faixaMdr(N), v.n) / 100;
    for (let N = 7; N <= 10; N++) venda710 += v.parc[N];
    credito += v.c1 + soma(v.parc.slice(2));
  }
  // estoque antecipado por dia (líquido recebido e valor de face), inclusive o que veio do histórico
  const dLiq = new Float64Array(nd + 1), dFace = new Float64Array(nd + 1);
  const marca = (n, vence, liq, face) => { const i0 = Math.max(0, n - w0), i1 = Math.min(nd, vence - w0); if (i1 <= i0) return; dLiq[i0] += liq; dLiq[i1] -= liq; dFace[i0] += face; dFace[i1] -= face; };
  for (const h of x.historico) marca(h.n, h.vence, h.liq, h.face);
  for (const r of x.registros) marca(r.n, r.vence, r.liq, r.face);
  let accL = 0, accF = 0, somaL = 0, somaF = 0;
  for (let i = 0; i < nd; i++) { accL += dLiq[i]; accF += dFace[i]; somaL += accL; somaF += accF; }
  const fluxosAnt = [];
  for (const r of regs) { fluxosAnt.push({ n: r.n, v: r.liq }); fluxosAnt.push({ n: r.vence, v: -r.face }); }
  const media = (f) => soma(D, f) / nd;
  const minimo = base.plano.saldo_minimo;
  const somaEnt = soma(D, (d) => soma(ENTRADAS, (k) => d.ent[k])), somaSai = soma(D, (d) => soma(SAIDAS, (k) => d.sai[k]));
  const faceRegs = soma(regs, (r) => r.face);
  const porTipo = {}; for (const k of ["automatica", "regra", "reforco"]) porTipo[k] = { face: 0, custo: 0, operacoes: 0 };
  for (const r of regs) { const o = porTipo[r.tipo]; o.face += r.face; o.custo += r.juros + r.iof; o.operacoes++; }
  return {
    cenario: cen, janela: { inicio: iso(w0), fim: iso(w1), dias: nd }, diario: x.diario, registros: x.registros, urs: x.urs, alertas: x.alertas, agendaDataBase: x.agendaDataBase, dividas: x.dividas,
    rf: { ...rf, antecipacao, resultado_financeiro, resultado_financeiro_caixa },
    mdr: { total: mdr, vendas, venda_7_10x: venda710, venda_credito: credito },
    custo_total: resultado_financeiro + mdr,
    custo_converter_vendas: mdr + antecipacao,
    antecipacao: {
      face: faceRegs, liquido: soma(regs, (r) => r.liq), custo: antecipacao, custo_caixa: antecipacao_caixa,
      operacoes: regs.length, prazo_medio_dias: soma(regs, (r) => r.face * r.dias) / Math.max(1, faceRegs),
      estoque_medio_liquido: somaL / nd, estoque_medio_face: somaF / nd, taxa_efetiva_aa: taxaEfetivaAA(fluxosAnt), por_tipo: porTipo,
    },
    caixa: { medio: media((d) => d.saldo), aplicacao_media: media((d) => d.A), garantida_media: media((d) => d.CG), garantida_max: Math.max(...D.map((d) => d.CG)),
      liquido_medio: media((d) => d.liquido), minimo: Math.min(...D.map((d) => d.saldo)), acima_do_minimo_medio: media((d) => Math.max(0, d.saldo - minimo)),
      aplicacao_e_garantida_juntas_medio: media((d) => Math.min(d.A, d.CG)), dias_com_aplicacao_e_garantida: D.filter((d) => d.A > 1 && d.CG > 1).length,
      saques_garantida: soma(D, (d) => d.ent.garantida_saque),
      inicial: D[0].M0 + D[0].A0, final: D[nd - 1].saldo, garantida_final: D[nd - 1].CG },
    conservacao: { entradas: somaEnt, saidas: somaSai, delta_saldo: D[nd - 1].saldo - (D[0].M0 + D[0].A0) },
  };
}

// 13 semanas: os 91 primeiros dias da simulação anual, agrupados por bloco de 7 dias a partir de 1º/09.
const GRUPO_ENT = { pix: "vendas_a_vista", dinheiro: "vendas_a_vista", debito: "vendas_a_vista", agenda: "agenda_cartao", antecipacao: "antecipacoes", rendimento: "rendimento", garantida_saque: "garantida" };
function grupoSai(k) { if (GRUPO[k]) return GRUPO[k] === "financeiro" ? "divida_e_bancos" : GRUPO[k]; if (k === "devolucoes") return "devolucoes"; return "divida_e_bancos"; }
export function semanas13(sim, ctx) {
  const D = sim.diario.slice(0, ctx.base.dias_projecao), out = [];
  for (let w = 0; w < 13; w++) {
    const fat = D.slice(w * 7, w * 7 + 7); if (!fat.length) break;
    const ent = {}, sai = {};
    for (const d of fat) {
      for (const k of ENTRADAS) ent[GRUPO_ENT[k]] = (ent[GRUPO_ENT[k]] || 0) + d.ent[k];
      for (const k of SAIDAS) { const g = grupoSai(k); sai[g] = (sai[g] || 0) + d.sai[k]; }
    }
    const regs = sim.registros.filter((r) => r.n >= fat[0].n && r.n <= fat[fat.length - 1].n);
    out.push({ semana: w + 1, inicio: iso(fat[0].n), fim: iso(fat[fat.length - 1].n),
      saldo_inicial: fat[0].M0 + fat[0].A0, saldo_final: fat[fat.length - 1].saldo, saldo_minimo: Math.min(...fat.map((d) => d.saldo)),
      garantida_max: Math.max(...fat.map((d) => d.CG)), liquido_minimo: Math.min(...fat.map((d) => d.liquido)),
      entradas: ent, saidas: sai, antecipado_face: soma(regs, (r) => r.face), custo_antecipacao: soma(regs, (r) => r.juros + r.iof) });
  }
  return { semanas: out, dias: D.map((d) => ({ data: iso(d.n), saldo: d.saldo, garantida: d.CG, liquido: d.liquido })),
    minimo: Math.min(...D.map((d) => d.saldo)), liquido_minimo: Math.min(...D.map((d) => d.liquido)),
    antecipado_face: soma(out, (s) => s.antecipado_face), custo_antecipacao: soma(out, (s) => s.custo_antecipacao),
    garantida_max: Math.max(...D.map((d) => d.CG)) };
}

function porMes(sim) {
  const m = new Map();
  for (const d of sim.diario) {
    const p = partes(d.n), k = chaveMes(p.a, p.m);
    if (!m.has(k)) m.set(k, { mes: k, saldo_minimo: Infinity, saldo_medio: 0, garantida_media: 0, dias: 0, antecipado_face: 0, custo_antecipacao: 0 });
    const r = m.get(k); r.saldo_minimo = Math.min(r.saldo_minimo, d.saldo); r.saldo_medio += d.saldo; r.garantida_media += d.CG; r.dias++;
  }
  for (const r of sim.registros) { const p = partes(r.n), k = chaveMes(p.a, p.m); if (m.has(k)) { m.get(k).antecipado_face += r.face; m.get(k).custo_antecipacao += r.juros + r.iof; } }
  return [...m.values()].map((r) => ({ ...r, saldo_medio: r.saldo_medio / r.dias, garantida_media: r.garantida_media / r.dias }));
}

// ================================================================================================ exemplo de venda e custo por hora
export function exemploVenda(base, valor = base.exemplo_venda.valor, parcelas = base.exemplo_venda.parcelas, opc = {}) {
  const ctx = opc.ctx || prepararContexto(base), cal = ctx.cal, C = base.cartao;
  const n = serial(opc.data || base.exemplo_venda.data), faixa = faixaMdr(parcelas);
  const mdr = taxaMdr(ctx, CENARIOS.hoje, faixa, n), credito = cal.prox(n + C.antecipacao_automatica.credito_dias_uteis);
  const tAtual = C.antecipacao_automatica.taxa_am, tCot = C.antecipacao_cotada.taxa_am;
  const linhas = [];
  for (let k = 1; k <= parcelas; k++) {
    const vence = cal.prox(n + C.liquidacao.credito_dias_corridos_por_parcela * k), bruto = valor / parcelas, liq = bruto * (1 - mdr / 100), dias = vence - credito;
    linhas.push({ parcela: k, vence: iso(vence), bruto, mdr: bruto - liq, liquido: liq, dias, desconto_atual: liq * tAtual / 100 * dias / 30, desconto_cotada: liq * tCot / 100 * dias / 30 });
  }
  const liqTot = soma(linhas, (l) => l.liquido), dA = soma(linhas, (l) => l.desconto_atual), dC = soma(linhas, (l) => l.desconto_cotada);
  const tir = (campo) => taxaEfetivaAA([{ n: credito, v: liqTot - soma(linhas, (l) => l[campo]) }, ...linhas.map((l) => ({ n: serial(l.vence), v: -l.liquido }))]);
  return {
    descricao: opc.descricao || base.exemplo_venda.descricao, data_venda: iso(n), valor, parcelas, valor_parcela: valor / parcelas,
    mdr: { faixa, pct: mdr, valor: valor - liqTot }, liquido_na_agenda: liqTot, data_credito_antecipado: iso(credito), linhas,
    antecipar_tudo_taxa_atual: { taxa_am: tAtual, desconto: dA, pct_venda: 100 * dA / valor, recebe: liqTot - dA, taxa_efetiva_aa: tir("desconto_atual") },
    antecipar_tudo_taxa_cotada: { taxa_am: tCot, desconto: dC, pct_venda: 100 * dC / valor, recebe: liqTot - dC, taxa_efetiva_aa: tir("desconto_cotada") },
    custo_total_atual: { valor: valor - liqTot + dA, pct_venda: 100 * (valor - liqTot + dA) / valor, rotulo: "MDR mais antecipação de todas as parcelas no dia seguinte" },
  };
}

export function custoPorHora(custoAnual, rotulo) {
  return { valor_hora: custoAnual / 8760, custo_anual: custoAnual, horas_ano: 8760, rotulo };
}

// ================================================================================================ formatos (pt-BR)
export const fmt = {
  brl: (v) => "R$ " + Math.round(v).toLocaleString("pt-BR"),
  mil: (v) => "R$ " + Math.round(v / 1000).toLocaleString("pt-BR") + " mil",
  mi: (v, c = 1) => "R$ " + (v / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + " mi",
  pct: (v, c = 2) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + "%",
  n: (v, c = 0) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }),
};
const dataBR = (isoStr) => { const [a, m, d] = isoStr.split("-"); return `${d}/${m}/${a}`; };

// ================================================================================================ sensibilidades
// Segundo ano (em regime): simula 730 dias e mede de 01/09/2027 a 31/08/2028, quando a agenda antecipada antes da data-base
// já venceu e cada cenário só carrega as antecipações que ele mesmo fez. Não entra no contrato da tela; serve para a memória.
export function emRegime(base) {
  const b2 = { ...base, dias_horizonte: 2 * base.dias_horizonte }, ctx = prepararContexto(b2);
  const janela = { w0: ctx.n0 + base.dias_horizonte, w1: ctx.n1 };
  const ordem = ["hoje", "s1", "s2", "s3", "plano"], S = {};
  for (const k of ordem) S[k] = simular(b2, CENARIOS[k], ctx, janela);
  const acoes = ["garantida", "pedido", "cotar", "mdr"].map((id, i) => ({ id, valor_anual: S[ordem[i]].custo_total - S[ordem[i + 1]].custo_total }));
  return { janela: S.hoje.janela, acoes, total: S.hoje.custo_total - S.plano.custo_total,
    hoje: { rf: S.hoje.rf.resultado_financeiro, antecipacao: S.hoje.rf.antecipacao, caixa_medio: S.hoje.caixa.medio, garantida_media: S.hoje.caixa.garantida_media },
    plano: { rf: S.plano.rf.resultado_financeiro, antecipacao: S.plano.rf.antecipacao, caixa_medio: S.plano.caixa.medio, minimo: S.plano.caixa.minimo, alertas: S.plano.alertas } };
}

// Cascata rápida para uma base alterada (usada nas sensibilidades da memória de cálculo).
export function cascata(base) {
  const ctx = prepararContexto(base), ordem = ["hoje", "s1", "s2", "s3", "plano"], S = {};
  for (const k of ordem) S[k] = simular(base, CENARIOS[k], ctx);
  return { acoes: ["garantida", "pedido", "cotar", "mdr"].map((id, i) => ({ id, valor_anual: S[ordem[i]].custo_total - S[ordem[i + 1]].custo_total })),
    total: S.hoje.custo_total - S.plano.custo_total, antecipacao_hoje: S.hoje.rf.antecipacao, antecipacao_plano: S.plano.rf.antecipacao,
    rf_hoje: S.hoje.rf.resultado_financeiro, rf_plano: S.plano.rf.resultado_financeiro, caixa_medio_hoje: S.hoje.caixa.medio, caixa_medio_plano: S.plano.caixa.medio,
    garantida_media_hoje: S.hoje.caixa.garantida_media, minimo_plano: S.plano.caixa.minimo, alertas_plano: S.plano.alertas };
}

// ================================================================================================ o cálculo inteiro
// calcularFin310(base) → { meta, rede, custoDoDinheiro{hoje,plano}, agenda, projecao13{hoje,plano}, estresses, caixaParado,
//   antecipacao, cenarios, acoes[4], recuperacaoMdr, totais, porMes, exemploVenda, custoPorHora, rotulos, fontes }.
// Campos e unidades: 30-auditoria-e-memoria.md, seção 6. R$ nominais, % em pontos (1,89 = 1,89%), datas ISO, antes de IR/CSLL.
// `_sim` (diário, URs, registros) fica fora do JSON (não enumerável). Cerca de 2,5 s em Node: calcular uma vez e guardar.
export function calcularFin310(base) {
  const ctx = prepararContexto(base), C = base.cartao, G = base.conta_garantida, P = base.plano;
  const S = {}; for (const k of Object.keys(CENARIOS)) S[k] = simular(base, CENARIOS[k], ctx);
  const est = {};
  for (const k of Object.keys(base.estresses)) est[k] = { plano: simular(base, { ...CENARIOS.plano, id: `plano_${k}`, estresse: k }, ctx), hoje: simular(base, { ...CENARIOS.hoje, id: `hoje_${k}`, estresse: k }, ctx) };
  const p13 = { hoje: semanas13(S.hoje, ctx), plano: semanas13(S.plano, ctx) };

  // ---------------------------------------------------------------- cascata (ordem fixa; cada ação = diferença entre estados)
  const ordem = ["hoje", "s1", "s2", "s3", "plano"], H = S.hoje, PL = S.plano;
  const comp = (s) => ({ antecipacao: s.rf.antecipacao, juros_dividas: s.rf.juros_dividas, juros_garantida: s.rf.juros_garantida, iof_garantida: s.rf.iof_garantida, tarifas: s.rf.tarifas, rendimento_perdido: -s.rf.rendimento, mdr: s.mdr.total });
  const delta = (a, b) => { const ca = comp(a), cb = comp(b); return Object.fromEntries(Object.keys(ca).map((k) => [k, ca[k] - cb[k]])); };
  const recMdrIni = serial(C.mdr_divergencia_desde), nDB = ctx.nDB;
  let venda710Hist = 0;
  for (const [n, tot] of ctx.plano) if (n >= recMdrIni && n <= nDB) { const v = dividirMeios(base, n, tot, distribuicaoParcelas(base, null)); for (let N = 7; N <= 10; N++) venda710Hist += v.parc[N]; }
  const difMdr = C.mdr_cobrado_pct.credito_7_10x - C.mdr_contratado_pct.credito_7_10x;
  const recuperacao = venda710Hist * difMdr / 100;
  const dCG = delta(S.hoje, S.s1), dPed = delta(S.s1, S.s2), dCot = delta(S.s2, S.s3), dMdr = delta(S.s3, S.plano);
  const v = (i) => S[ordem[i]].custo_total - S[ordem[i + 1]].custo_total;
  const f = fmt;
  const acoes = [
    { id: "garantida", ordem: 1, titulo: "Juntar conta e aplicação num caixa só e quitar a conta garantida com o caixa parado",
      tipo: "economia anual estimada de custo financeiro", valor_anual: v(0), decomposicao: dCG,
      quem_decide: "empresa", quem_executa: "tesouraria (resgate da aplicação e amortização no Banco A)", prazo: "semana 1",
      condicao: "o contrato da garantida não cobra multa nem tarifa por não uso; o limite continua aberto para emergência",
      efeitos_balanco: [{ tipo: "redução de dívida (principal não é ganho)", valor: G.sacado_data_base }],
      memoria: `Hoje a garantida do Banco A fica sacada em média ${f.mi(H.caixa.garantida_media, 2)} (máximo ${f.mi(H.caixa.garantida_max, 2)}), a ${f.pct(G.taxa_am)} a.m. mais IOF de 0,0082% ao dia e 0,38% sobre cada novo saque: ${f.mil(H.rf.juros_garantida)} de juros e ${f.mil(H.rf.iof_garantida)} de IOF em 12 meses. Na mesma época a aplicação tem saldo médio de ${f.mi(H.caixa.aplicacao_media)} a ${base.caixa.aplicacao_pct_cdi}% do CDI; em ${H.caixa.dias_com_aplicacao_e_garantida} dos 365 dias havia dinheiro aplicado e garantida sacada ao mesmo tempo. Com caixa único e a garantida quitada em 1º/09 (${f.mi(G.sacado_data_base, 1)} de principal, pago com caixa que já era da rede), juros e IOF caem ${f.mil(dCG.juros_garantida + dCG.iof_garantida)} e o rendimento cai ${f.mil(-dCG.rendimento_perdido)}. Economia = ${f.mil(v(0))} por ano.` },
    { id: "pedido", ordem: 2, titulo: "Desligar a antecipação automática e antecipar só por pedido, pela regra do saldo mínimo",
      tipo: "economia anual estimada de custo financeiro", valor_anual: v(1), decomposicao: dPed,
      quem_decide: "empresa", quem_executa: "tesouraria; a credenciadora processa o desligamento (Res. BCB 264/2022, alterada pela 349/2023)", prazo: "semanas 1 e 2",
      condicao: "o contrato não amarra a taxa de MDR à antecipação automática; a tesouraria roda a projeção toda semana",
      efeitos_balanco: [{ tipo: "caixa médio usado no lugar de antecipação (não é ganho)", valor: S.s1.caixa.medio - S.s2.caixa.medio }, { tipo: "recebíveis que deixam de ser vendidos, em média (chegam na data original)", valor: S.s1.antecipacao.estoque_medio_face - S.s2.antecipacao.estoque_medio_face }],
      memoria: `Hoje a credenciadora antecipa ${C.antecipacao_automatica.pct_da_parte_livre}% da parte livre de toda venda no crédito no dia útil seguinte, inclusive a 10ª parcela: ${f.mi(S.s1.antecipacao.face)} de agenda vendida em 12 meses, com prazo médio de ${f.n(S.s1.antecipacao.prazo_medio_dias)} dias e ${f.mi(S.s1.antecipacao.custo, 2)} de desconto a ${f.pct(C.antecipacao_automatica.taxa_am)} a.m. Com a regra (saldo mínimo de ${f.mi(P.saldo_minimo)}; antecipar só na semana em que a projeção mostra falta, a diferença mais ${P.folga_pct}%, começando pelas parcelas livres que vencem primeiro), a rede antecipa ${f.mi(S.s2.antecipacao.face)} com prazo médio de ${f.n(S.s2.antecipacao.prazo_medio_dias)} dias e paga ${f.mi(S.s2.antecipacao.custo, 2)}. O caixa médio desce de ${f.mi(S.s1.caixa.medio)} para ${f.mi(S.s2.caixa.medio)} e o rendimento cai ${f.mil(-dPed.rendimento_perdido)}. Economia = ${f.mil(dPed.antecipacao)} − ${f.mil(-dPed.rendimento_perdido)}${Math.abs(dPed.juros_garantida + dPed.iof_garantida) > 500 ? ` ${dPed.juros_garantida + dPed.iof_garantida >= 0 ? "+" : "−"} ${f.mil(Math.abs(dPed.juros_garantida + dPed.iof_garantida))} de garantida` : ""} = ${f.mil(v(1))} por ano.` },
    { id: "cotar", ordem: 3, titulo: "Cotar a antecipação que continua necessária com outros financiadores pela registradora",
      tipo: "economia anual estimada de custo financeiro", valor_anual: v(2), decomposicao: dCot,
      quem_decide: "financiadores (bancos, FIDCs) ou a credenciadora, ao cobrir a cotação", quem_executa: "tesouraria, com as cotações", prazo: "semanas 2 a 6",
      condicao: `cotação all-in (com IOF, se for banco) de até ${f.pct(C.antecipacao_cotada.taxa_am)} a.m. para os prazos que a regra usa; só a parte livre da agenda (${C.trava_banco_b_pct}% está cedida ao Banco B)`,
      efeitos_balanco: [],
      memoria: `A regra antecipa ${f.mi(S.s2.antecipacao.face)} por ano. A ${f.pct(C.antecipacao_por_pedido_credenciadora.taxa_am)} a.m. o desconto é ${f.mi(S.s2.antecipacao.custo, 2)}; cotado a ${f.pct(C.antecipacao_cotada.taxa_am)} a.m. all-in, ${f.mi(S.s3.antecipacao.custo, 2)}. Diferença com o pequeno efeito no saldo e no rendimento = ${f.mil(v(2))} por ano. Os ${C.trava_banco_b_pct}% cedidos ao Banco B ficam fora.` },
    { id: "mdr", ordem: 4, titulo: "Fazer a credenciadora cobrar o MDR do contrato na faixa de 7 a 10 parcelas",
      tipo: "economia anual estimada de custo financeiro", valor_anual: v(3), decomposicao: dMdr,
      quem_decide: "credenciadora", quem_executa: "tesouraria, com a conciliação dos extratos", prazo: "30 a 60 dias",
      condicao: "a conciliação confirma a cobrança acima do contrato e a credenciadora corrige a tabela",
      efeitos_balanco: [],
      memoria: `Na faixa 7–10x o extrato cobra ${f.pct(C.mdr_cobrado_pct.credito_7_10x)} e o contrato diz ${f.pct(C.mdr_contratado_pct.credito_7_10x)} (desde ${dataBR(C.mdr_divergencia_desde)}). Vendas de 7 a 10 parcelas em 12 meses: ${f.mi(PL.mdr.venda_7_10x)} × ${f.pct(difMdr)} = ${f.mil(dMdr.mdr)}; com o efeito no caixa, ${f.mil(v(3))} por ano.` },
  ];
  const totalCascata = soma(acoes, (a) => a.valor_anual), totalDireto = H.custo_total - PL.custo_total;
  const recuperacaoMdr = { id: "mdr_recuperacao", tipo: "recuperação única estimada", valor: recuperacao, quem_decide: "credenciadora", quem_executa: "tesouraria",
    prazo: "60 a 120 dias", condicao: "contestação aceita pela credenciadora; o valor sai dos extratos dos seis meses",
    memoria: `Vendas de 7 a 10 parcelas de ${dataBR(C.mdr_divergencia_desde)} a ${dataBR(base.data_base)}: ${f.mi(venda710Hist)} × ${f.pct(difMdr)} = ${f.mil(recuperacao)}, uma vez.` };

  // ---------------------------------------------------------------- mapa do custo do dinheiro (HOJE e PLANO)
  const mapa = (s) => {
    const fontes = [
      { id: "antecipacao", nome: s.cenario.antecipacao === "automatica" ? "Antecipação automática da credenciadora" : "Antecipação por pedido", quem: s.cenario.antecipacao === "automatica" ? "credenciadora" : (s.cenario.fontePedido === "cotada" ? "financiadores pela registradora" : "credenciadora"),
        saldo_medio: s.antecipacao.estoque_medio_liquido, taxa_efetiva_aa: s.antecipacao.taxa_efetiva_aa, custo_anual: s.rf.antecipacao, nota: "saldo médio = dinheiro adiantado ainda não vencido; custo = descontos pagos no ano; taxa = TIR das antecipações do ano" },
      ...s.dividas.map((d) => ({ id: d.id, nome: `${d.nome} · ${d.credor}`, quem: d.credor, saldo_medio: d.saldo_medio, taxa_efetiva_aa: aa(d.taxa_am), custo_anual: d.juros_ano, nota: d.garantia })),
      { id: "garantida", nome: `Conta garantida · ${G.credor}`, quem: G.credor, saldo_medio: s.caixa.garantida_media, taxa_efetiva_aa: s.caixa.garantida_media > 1 ? 100 * (s.rf.juros_garantida + s.rf.iof_garantida) / s.caixa.garantida_media : aa(G.taxa_am), custo_anual: s.rf.juros_garantida + s.rf.iof_garantida, nota: "juros e IOF sobre o saldo usado" },
    ];
    const custo = soma(fontes, (x) => x.custo_anual), saldo = soma(fontes, (x) => x.saldo_medio);
    return { fontes, custo_dinheiro_anual: custo, saldo_medio_total: saldo, taxa_media_ponderada_aa: 100 * custo / saldo,
      aplicacao: { saldo_medio: s.caixa.aplicacao_media, rendimento_anual: s.rf.rendimento, taxa_aa: (Math.pow(1 + (Math.pow(1 + base.mercado.cdi_aa / 100, 1 / 252) - 1) * base.caixa.aplicacao_pct_cdi / 100, 252) - 1) * 100 },
      tarifas: s.rf.tarifas, resultado_financeiro_anual: s.rf.resultado_financeiro, mdr_anual: s.mdr.total,
      custo_converter_vendas_anual: s.custo_converter_vendas, pct_vendas: 100 * s.custo_converter_vendas / s.mdr.vendas };
  };

  // ---------------------------------------------------------------- estresses
  const resumoEst = (k) => {
    const e = est[k], pe = semanas13(e.plano, ctx), he = semanas13(e.hoje, ctx);
    return { titulo: base.estresses[k].titulo,
      plano: { minimo_13s: pe.minimo, respeita_minimo: pe.minimo >= P.saldo_minimo - 1 && pe.garantida_max < 1, antecipado_13s: pe.antecipado_face, custo_antecipacao_13s: pe.custo_antecipacao,
        antecipado_a_mais_13s: pe.antecipado_face - p13.plano.antecipado_face, custo_a_mais_13s: pe.custo_antecipacao - p13.plano.custo_antecipacao,
        reforcos_no_dia: e.plano.alertas.emergencias, garantida_max_13s: pe.garantida_max, semanas_min: pe.semanas.map((w) => w.saldo_minimo), dias: pe.dias },
      hoje: { minimo_13s: he.minimo, liquido_minimo_13s: he.liquido_minimo, garantida_max_13s: he.garantida_max, semanas_min: he.semanas.map((w) => w.saldo_minimo) } };
  };

  // ---------------------------------------------------------------- totais
  const porQuem = {}; for (const a of acoes) porQuem[a.quem_decide.split(" ")[0]] = (porQuem[a.quem_decide.split(" ")[0]] || 0) + a.valor_anual;
  const caixaUsado = H.caixa.medio - PL.caixa.medio;
  const ex = exemploVenda(base, undefined, undefined, { ctx });

  const out = {
    meta: { versao: VERSAO, data_base: base.data_base, horizonte: { inicio: iso(ctx.n0), fim: iso(ctx.n1), dias: ctx.n1 - ctx.n0 + 1 }, projecao: { inicio: iso(ctx.n0), fim: iso(ctx.nFimProj), dias: base.dias_projecao },
      natureza: base.natureza, unidades: "R$ nominais; taxas em % (1,89 = 1,89%); datas ISO", antes_de_impostos: true,
      convencoes: { divida: "% a.m. composta, Price; efetiva a.a. = (1+i)^12 − 1", antecipacao: "desconto simples: valor × taxa_am × dias/30; efetiva a.a. pela TIR", garantida: "juros simples por dia corrido (taxa/30) + IOF 0,0082% a.d. + 0,38% por acréscimo", aplicacao: `${base.caixa.aplicacao_pct_cdi}% do CDI por dia útil` } },
    rede: { lojas: base.rede.lojas, faturamento_bruto_ano: H.mdr.vendas, mix_pct: base.rede.mix_pct, parcelas_pct: base.rede.parcelas_pct,
      parcelas_media_ponderada: soma(Object.entries(base.rede.parcelas_pct), ([N, p]) => Number(N) * p) / 100, venda_credito_ano: H.mdr.venda_credito },
    custoDoDinheiro: { hoje: mapa(H), plano: mapa(PL) },
    agenda: { data_base: base.data_base, ...H.agendaDataBase, trava_banco_b_pct: C.trava_banco_b_pct },
    projecao13: { hoje: p13.hoje, plano: p13.plano, saldo_minimo_regra: P.saldo_minimo },
    estresses: Object.fromEntries(Object.keys(base.estresses).map((k) => [k, resumoEst(k)])),
    caixaParado: { hoje: H.caixa, plano: PL.caixa, caixa_medio_usado_pelo_plano: caixaUsado },
    antecipacao: { hoje: H.antecipacao, plano: PL.antecipacao, custo_anual_hoje: H.rf.antecipacao, custo_anual_plano: PL.rf.antecipacao,
      fracao_evitavel_pct: 100 * (H.rf.antecipacao - PL.rf.antecipacao) / H.rf.antecipacao,
      equivalencia: [30, 90, 150, 300].map((d) => ({ dias: d, desconto_pct: C.antecipacao_automatica.taxa_am * d / 30, efetiva_aa: equivAnualDesconto(C.antecipacao_automatica.taxa_am, d) })) },
    cenarios: Object.fromEntries(ordem.map((k) => [k, { id: k, rf: S[k].rf, mdr: S[k].mdr.total, custo_total: S[k].custo_total, caixa_medio: S[k].caixa.medio, garantida_media: S[k].caixa.garantida_media, antecipado_face: S[k].antecipacao.face, alertas: S[k].alertas }])),
    acoes, recuperacaoMdr,
    totais: {
      economia_anual_estimada: totalCascata, conferencia_hoje_menos_plano: totalDireto,
      por_tipo: { "economia anual estimada de custo financeiro": totalCascata, "recuperação única estimada": recuperacao,
        "caixa liberado / redução de dívida": { garantida_quitada: G.sacado_data_base, caixa_medio_usado: caixaUsado, recebiveis_preservados_medio: H.antecipacao.estoque_medio_face - PL.antecipacao.estoque_medio_face, nota: "principal e caixa não são ganho" } },
      por_quem_decide: porQuem,
      resultado_financeiro: { hoje: H.rf.resultado_financeiro, plano: PL.rf.resultado_financeiro },
    },
    porMes: { hoje: porMes(H), plano: porMes(PL) },
    exemploVenda: ex,
    custoPorHora: {
      antecipacao_hoje: custoPorHora(H.rf.antecipacao, "custo financeiro da rede do exemplo com antecipação, por hora (não é perda)"),
      resultado_financeiro_hoje: custoPorHora(H.rf.resultado_financeiro, "resultado financeiro líquido da rede do exemplo, por hora"),
      economia_estimada: custoPorHora(totalCascata, "economia anual estimada do plano, por hora (potencial, depende da execução)"),
    },
    rotulos: {
      economia: "economia anual estimada (potencial; depende de executar o plano e das condições de cada ação)",
      recuperacao: "recuperação única estimada (depende de a credenciadora aceitar a contestação)",
      balanco: "dívida paga e caixa usado (não são ganho)",
      caso: "rede ilustrativa; simulação, não caso realizado",
      evitar: ["certos", "garantido", "resultado (para potencial)", "perda (para custo financeiro)"],
    },
    fontes: base.origem,
  };
  // dados internos da simulação (diário, URs, registros): disponíveis para testes, fora da serialização
  Object.defineProperty(out, "_sim", { value: { S, est, ctx }, enumerable: false });
  return out;
}
