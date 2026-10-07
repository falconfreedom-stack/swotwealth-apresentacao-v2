// Motor de cálculo da apresentação (v3, rede de óticas). Recebe a base publicada (dados/base.json) e devolve todos os
// números que aparecem na tela, no material e no painel. Nenhum número da tela é digitado à mão.
// Projetos: FIN3.10 capital de giro e custo do dinheiro (conduz a peça) · FIN8.2 catálogo de indicadores ·
// FIN5.11 segregação de funções. A rede é ILUSTRATIVA, montada com premissas explícitas (ver base.natureza).
//
// O FIN3.10 simula 365 dias, dia a dia, em onze cenários (alguns segundos): o resultado fica gravado em
// dados/calculado.json, gerado por `node motor/gerar.mjs`, com a impressão digital da base. Se a base mudar e o
// arquivo não for gerado de novo, o cálculo roda no navegador (mais lento) e um aviso vai ao console.
import { calcularFin310 } from "./fin310.js?v=202610071930";

const soma = (a) => a.reduce((s, x) => s + x, 0);
export const aa = (am) => (Math.pow(1 + am / 100, 12) - 1) * 100;            // % a.m. → % a.a.
export const am = (aaPct) => (Math.pow(1 + aaPct / 100, 1 / 12) - 1) * 100;   // % a.a. → % a.m.

// ------------------------------------------------------------------------------------------ a rede: resultado
// EBITDA em três definições e a venda em três medidas (pedido no painel, conselho, óculos entregues no DRE).
export function resultadoRede(base) {
  const P = base.rede_p_l, V = P.venda_jan_ago;
  const bruto_ano = P.receita_bruta_12m;
  const liquida_ano = bruto_ano - P.deducoes_12m;
  const custos = { ...P.custos_12m }, custos_total = soma(Object.values(custos));
  const ebitda_controladoria = liquida_ano - custos_total;
  const aluguel = P.ocupacao_12m.aluguel_fixo_ifrs16;
  const ebitda_conselho = ebitda_controladoria + P.preoperacionais_12m + P.nao_recorrentes_12m;
  const ebitda_banco = ebitda_controladoria + aluguel;
  const pedidos = soma(V.pedidos_painel_mes), cancelados = soma(V.cancelados_mes);
  const receita = soma(V.receita_dre_mes), orcamento = soma(V.orcamento_mes);
  const aumento_a_entregar = V.a_entregar_fim_mes[V.a_entregar_fim_mes.length - 1] - V.a_entregar_inicio;
  const lojas_mes = soma(V.lojas_mes), porLoja = (v) => v / lojas_mes;
  return {
    perfil: P.perfil, bruto_ano, liquida_ano, custos, custos_total, aluguel,
    mensal: P.receita_bruta_mensal_12m,
    ebitda: { controladoria: ebitda_controladoria, conselho: ebitda_conselho, banco: ebitda_banco,
      ajustes_conselho: [{ t: "despesas pré-operacionais", v: P.preoperacionais_12m }, { t: "eventos não recorrentes", v: P.nao_recorrentes_12m }],
      ajustes_banco: [{ t: "aluguel fixo fora do EBITDA (IFRS 16)", v: aluguel }] },
    margem: { controladoria: 100 * ebitda_controladoria / liquida_ano, conselho: 100 * ebitda_conselho / liquida_ano, banco: 100 * ebitda_banco / liquida_ano },
    venda: { orcamento, pedidos, conselho: pedidos - cancelados, receita, cancelados, aumento_a_entregar, lojas_mes,
      a_entregar_fim: V.a_entregar_fim_mes[V.a_entregar_fim_mes.length - 1],
      por_loja_mes: { orcamento: porLoja(orcamento), pedidos: porLoja(pedidos), conselho: porLoja(pedidos - cancelados), receita: porLoja(receita) },
      gap_por_loja_mes: porLoja(pedidos - receita), cancel_pct: 100 * cancelados / pedidos },
    orcamento: { desvio_ytd: pedidos - receita, desvio_orcamento_ytd: orcamento - receita, meses: V.meses.length },
  };
}

// ------------------------------------------------------------------------------ FIN8.2 · catálogo de indicadores
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

// ------------------------------------------------------------------ FIN5.11 · segregação de funções
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
    lojas: S.lojas,
  };
}

// ------------------------------------------------------------------------------------------ impressão digital
// FNV-1a de 32 bits sobre a base em JSON canônico (a mesma conta no Node e no navegador).
export function impressao(base) {
  const s = JSON.stringify(base);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

// ------------------------------------------------------------------------------------------ tudo
// `calculado` (opcional) = conteúdo de dados/calculado.json; vale se a impressão digital bater com a base.
export function calcular(base, calculado) {
  let fin310;
  if (calculado && calculado.impressao === impressao(base) && calculado.fin310) fin310 = calculado.fin310;
  else {
    if (calculado) console.warn("dados/calculado.json não corresponde à base: o FIN3.10 foi calculado agora (rode `node motor/gerar.mjs`).");
    fin310 = JSON.parse(JSON.stringify(calcularFin310(base.fin310)));
  }
  return { rede: resultadoRede(base), kpis: kpis(base), seg: segregacao(base), fin310 };
}

export const fmt = {
  n: (v, c = 0) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }),
  mi: (v, c = 1) => "R$ " + (v / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + " mi",
  mil: (v) => "R$ " + Math.round(v / 1000).toLocaleString("pt-BR") + " mil",
  pct: (v, c = 1) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + "%",
};
