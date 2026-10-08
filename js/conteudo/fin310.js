import { F } from "../util.js?v=202610081530";
import { r1, mi, mil, pc } from "./formato.js?v=202610081530";

// ================================================================== FIN3.10 · capital de giro e custo do dinheiro
// A lente que conduz a peça (roteiro v1, estudo/roteiro/50-roteiro-v1.md, cenas 3 a 9). Todos os números vêm de
// R.fin310 (motor/fin310.js; memória de cálculo em estudo/modelo/30-auditoria-e-memoria.md) ou da base.
// Rótulos: economia anual ESTIMADA (potencial), recuperação única estimada ("uma vez"), dívida paga e caixa usado
// "não são ganho". Nada de "certos", "garantido", "perda" ou "resultado" para potencial.
// [K] texto-chave (os dois modos) · [L] legenda de leitura (só no modo assistir: classe so-assistir) · " / " = quebra.
const QUEM = { empresa: "depende da empresa", credenciadora: "depende da credenciadora" };
const quem = (a) => QUEM[a.quem_decide] || (a.quem_decide.startsWith("financiadores") ? "depende dos financiadores" : `depende de ${a.quem_decide}`);
const CURTO_ACAO = { garantida: "Caixa único e conta garantida quitada", pedido: "Antecipar só por pedido, pela regra", cotar: "Cotar a antecipação pela registradora", mdr: "MDR do contrato em 7 a 10 parcelas" };
// os nomes curtos das decisões na cena `conta` (6.2)
const DECISAO = { garantida: "caixa único, garantida quitada", pedido: "antecipar só por pedido", cotar: "cotar com outros financiadores", mdr: "MDR do contrato" };
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MES_LONGO = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const mesCurto = (iso) => MES[Number(iso.slice(5, 7)) - 1];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const lista = (a) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} e ${a[a.length - 1]}` : String(a[0]));
const dm = (iso) => `${Number(iso.slice(8, 10))}/${iso.slice(5, 7)}`;
// R$ em milhões: 1 casa a partir de R$ 10 mi, 2 abaixo (roteiro, seção 8.1)
const miA = (v) => mi(v, Math.abs(v) >= 10e6 ? 1 : 2);
// Mercado (Abióptica): de base.setor.mercado; enquanto a base não o trouxer, vale o padrão copiado de
// estudo/pesquisa/10-setor-optico.md (julho/2026: −11% sobre julho/2025, release da Abióptica). Pedido ao
// integrador: levar `mes_fraco` para dados/base.json → setor.mercado.
export const MES_FRACO_PADRAO = { mes: "julho de 2026", base: "julho de 2025", curto: "jul/26 × jul/25", var_pct: -11, fonte: "Abióptica" };
// Ofertas comerciais de antecipação (credenciadoras e plataformas), referência da persona (estudo/pesquisa/
// 11-persona.md, cena 5: "~1,3% a ~3,5% a.m.", P). Pedido ao integrador: levar para base.fin310.mercado.
export const OFERTAS_PADRAO = { min: 1.3, max: 3.5 };

export function projeto3(base, R, proj, dataBase) {
  const Z = R.fin310, B = base.fin310, H = Z.custoDoDinheiro.hoje, cart = B.cartao, G = B.conta_garantida, S = B.saidas || {};
  const cp = Z.caixaParado.hoje, an = Z.antecipacao, tot = Z.totais, ag = Z.agenda, ex = Z.exemploVenda;
  const fonteById = Object.fromEntries(H.fontes.map((f) => [f.id, f]));
  const fGar = fonteById.garantida || { taxa_efetiva_aa: 0, saldo_medio: 0 };
  const agTot = ag.total ?? ag.meses.reduce((s, m) => s + m.total, 0), agAnt = ag.antecipado ?? ag.meses.reduce((s, m) => s + m.antecipado, 0), agCed = ag.cedido ?? ag.meses.reduce((s, m) => s + m.cedido, 0);
  const P13 = Z.projecao13, minHoje = P13.hoje.minimo, minPlano = P13.plano.minimo, regra = P13.saldo_minimo_regra ?? B.plano.saldo_minimo;
  const ev = Z.estresses.vendas.plano, ec = Z.estresses.concentrados.plano;
  const quedaVendas = (B.estresses && B.estresses.vendas && B.estresses.vendas.queda_pct) ?? 15;
  const dias = Z.meta && Z.meta.horizonte ? Z.meta.horizonte.dias : 365;
  const mercado = (base.setor && base.setor.mercado) || {};
  const mesFraco = mercado.mes_fraco || MES_FRACO_PADRAO;
  const dataBaseIso = (Z.meta && Z.meta.data_base) || B.data_base || "2026-08-31";
  // os extratos são de seis meses até a data-base (o insumo do card), qualquer que seja a janela do modelo
  const mesBase = Number(dataBaseIso.slice(5, 7)) - 1, iniHist = MES_LONGO[(mesBase - 5 + 12) % 12];

  // ------------------------------------------------------------------ formulário (insumos 3.3 e material)
  const diasDe = (meses) => `${lista((meses || []).map((m) => 30 * m))} dias`;
  const venc = [...new Set(B.dividas.map((d) => d.dia_vencimento).filter(Boolean))].sort((a, b) => a - b);
  const fol = S.folha || {}, ocu = S.ocupacao || {};
  const formulario = {
    cab: `Checklist de insumos · ${proj.codigo} · ${proj.nome}`,
    titulo: "O que a rede entrega.", sub: "Os quatro documentos, como já existem.",
    blocos: [
      { titulo: "Contratos de dívida", origem: "pasta de contratos", largo: true, tabela: {
        cab: ["contrato", "credor", "saldo", "taxa ao mês", "parcelas", "garantia"],
        linhas: [...B.dividas.map((d) => [d.nome, d.credor, mi(d.saldo), pc(d.taxa_am, 2), String(d.parcelas_restantes), (d.garantia || "").split(/[;,]/)[0]]),
          [G.nome, G.credor, mi(G.sacado_data_base), pc(G.taxa_am, 2), "rotativo", `limite de ${mi(G.limite)}`]] } },
      { titulo: "Extratos de seis meses", origem: `extratos do banco, ${iniHist} a ${MES_LONGO[mesBase]}`, campos: [
        { l: `Aplicação em ${dm(dataBaseIso)}`, v: mi(B.caixa.aplicacao_data_base) }, { l: "Rendimento da aplicação", v: `${B.caixa.aplicacao_pct_cdi}% do CDI` },
        { l: "Conta garantida sacada", v: mi(G.sacado_data_base) }, { l: "Limite da conta garantida", v: mi(G.limite) } ] },
      { titulo: "Agenda da credenciadora", origem: "portal da credenciadora", campos: [
        { l: "Vendas no crédito por mês", v: mi(Math.round(Z.rede.venda_credito_ano / 12), 2) },
        { l: "Antecipação automática", v: `${cart.antecipacao_automatica.pct_da_parte_livre}% da agenda livre` },
        { l: "Taxa de antecipação", v: `${pc(cart.antecipacao_automatica.taxa_am, 2)} ao mês` }, { l: "Cedido ao Banco B (trava)", v: `${cart.trava_banco_b_pct}%`, t: "texto" },
        { l: "MDR em 7 a 10x, no contrato", v: pc(cart.mdr_contratado_pct.credito_7_10x, 2) }, { l: "MDR em 7 a 10x, no extrato", v: pc(cart.mdr_cobrado_pct.credito_7_10x, 2) } ] },
      { titulo: "Contas a pagar e a receber", origem: "contas a pagar do sistema", campos: [
        { l: "Armações", v: diasDe((S.armacoes || {}).parcelas_meses), t: "texto" }, { l: "Lentes e blocos do laboratório", v: diasDe((S.lentes_blocos || {}).parcelas_meses), t: "texto" },
        { l: "Aluguel dos shoppings", v: `dia ${ocu.dia}${ocu.dezembro_dobra_minimo ? "; dobrado em dezembro" : ""}`, t: "texto" },
        { l: "Folha", v: `${fol.dia_util_pagamento}º dia útil e dia ${fol.dia_adiantamento}`, t: "texto" }, { l: "Parcelas das dívidas", v: `dias ${lista(venc)}`, t: "texto" } ] },
    ],
    selo: "Recebido em 1º/09/2026: os contratos, extratos de seis meses, a agenda da credenciadora e as contas a pagar. Marco inicial confirmado por escrito em 2/09/2026; a contagem dos dez dias começa em 3/09.",
  };
  formulario.total = formulario.blocos.reduce((s, b) => s + (b.tabela ? b.tabela.linhas.length : 0) + (b.campos ? b.campos.length : 0), 0);

  // ------------------------------------------------------------------ cena 3 · insumos
  const insumos = {
    docs: proj.usa.map(cap),
    pedaco: "Cada relatório vê / um pedaço.",
    rotulo: `${proj.codigo} · ${proj.nome}`,
    junta: "Um projeto / junta os quatro.",
    // 3.3 (roteiro v2, D5): o esforço da equipe no lugar dos três focos; o "cerca de um dia" é o que a SWOT já
    // afirmava na versão anterior (a confirmar pelos sócios)
    esforco: "Os quatro documentos, como já existem: / cerca de um dia da equipe.",
    origens: "portal da credenciadora · extratos do banco · pasta de contratos · contas a pagar do sistema",
  };

  // ------------------------------------------------------------------ cena 4 · cruzamento (grafo sem números)
  // nós na "parede" (x 0–1920, y 240–660, ver mundo.prepararGrafo): entradas → meio → saídas (ouro) → plano
  const parede = { nos: [
    { x: 260, y: 300, t: "contratos" }, { x: 260, y: 390, t: "extratos" }, { x: 260, y: 480, t: "agenda" }, { x: 260, y: 570, t: "contas a pagar e a receber" },
    { x: 640, y: 360, t: "custo efetivo de cada fonte" }, { x: 640, y: 520, t: `${dias} dias, dia a dia` },
    { x: 1000, y: 290, t: "custo do dinheiro", ouro: 1 }, { x: 1000, y: 385, t: "aplicação e garantida", ouro: 1 }, { x: 1000, y: 480, t: "antecipação", ouro: 1 }, { x: 1000, y: 580, t: "saldo mínimo", ouro: 1 },
    { x: 1360, y: 440, t: "plano de fontes", ouro: 1 },
  ], lig: [[0, 4], [2, 4], [1, 5], [2, 5], [3, 5], [4, 6], [4, 8], [5, 7], [5, 8], [5, 9], [6, 10], [7, 10], [8, 10], [9, 10]],
  colunas: [[0, 1, 2, 3], [4, 5], [6, 7, 8, 9, 10]] };
  const cruzamento = { titulo: "Além da conciliação: / o custo, dia a dia.", legenda: "Toda conta tem memória. / Nenhum valor é contado duas vezes." };

  // ------------------------------------------------------------------ cena 5 · descoberta
  const ROT = { antecipacao: "antecipação", giro_a: "giro · Banco A", giro_b: "giro · Banco B", equip_c: "equipamentos", garantida: "conta garantida" };
  const fontesGraf = H.fontes.map((f) => ({ id: f.id, rot: ROT[f.id] || f.nome, saldo: f.saldo_medio, taxa: f.taxa_efetiva_aa, custo: f.custo_anual })).sort((a, b) => b.taxa - a.taxa);
  const maiorCusto = [...H.fontes].sort((a, b) => b.custo_anual - a.custo_anual)[0];
  const descoberta = {
    mapa: { titulo: `Custo do dinheiro: / ${mi(H.custo_dinheiro_anual, 2)} por ano.`,
      legenda: `${pc(H.taxa_media_ponderada_aa)} ao ano, em média. / Largura: quanto a rede usa; altura: quanto custa.`,
      fontes: fontesGraf, rendimento: H.aplicacao.taxa_aa,
      // 5.1 (v2, D2): a barra da antecipação é a mesma do custo do ano (cena 2.4)
      antRot: `a mesma de antes · ${mi(an.custo_anual_hoje, 2)}` },
    // 5.2 (v2, D3): a equivalência da taxa, colada à barra
    antecipacao: { rotulo: `${pc(cart.antecipacao_automatica.taxa_am, 2)} ao mês de desconto = ${pc(an.hoje.taxa_efetiva_aa)} ao ano efetivos`,
      legenda: `${maiorCusto.id === "antecipacao" ? "A maior fonte" : "Uma das maiores fontes"}: a agenda antecipada / no dia seguinte a cada venda.` },
    sobreposicao: { valida: cp.dias_com_aplicacao_e_garantida >= 30,
      garantida: `garantida · ${pc(fGar.taxa_efetiva_aa)} ao ano, com IOF`, aplicacao: `aplicação · ${pc(H.aplicacao.taxa_aa)} ao ano`,
      titulo: `${cp.dias_com_aplicacao_e_garantida} dias: / aplicação e garantida juntas.`,
      // a ressalva é obrigatória (persona, cena 6, risco alto): fica na tela nos dois modos
      ressalva: "Pode haver razão: reserva, covenant, CNPJs. / O cruzamento mostra o custo." },
    semanas: { valida: P13.hoje.garantida_max > 0 && minHoje > regra,
      rotulo: "13 semanas · do jeito atual", titulo: `Caixa nunca abaixo / de ${miA(minHoje)}.`,
      maxRot: `garantida sacada: até ${miA(P13.hoje.garantida_max)}`,
      legenda: "Mesmo assim, a garantida é sacada / e a agenda segue antecipada toda semana.",
      semanas: P13.hoje.semanas.map((w) => w.saldo_minimo), garantida: P13.hoje.semanas.map((w) => w.garantida_max) },
  };

  // ------------------------------------------------------------------ cena 6 · conta
  const qd = tot.por_quem_decide;
  // 6.1 (v2, D2): de onde sai a economia, com o número da pergunta de 2.5 (custo de transformar vendas em caixa)
  const somaAcoes = (ids) => Z.acoes.filter((a) => ids.includes(a.id)).reduce((s, a) => s + a.valor_anual, 0);
  const ofertas = (B.mercado && B.mercado.ofertas_antecipacao_am) || OFERTAS_PADRAO;
  const mdrDesde = MES_LONGO[Number(String(cart.mdr_divergencia_desde || "2026-03").slice(5, 7)) - 1];
  const conta = {
    revela: "O que a lente revela",
    origem: `${mi(somaAcoes(["pedido", "cotar", "mdr"]), 2)} vêm dos ${mi(H.custo_converter_vendas_anual, 2)}, já descontado o rendimento menor · ${mi(somaAcoes(["garantida"]), 2)}, da garantida (juros e IOF)`,
    condicaoGarantida: "se contratos, covenants e CNPJs permitirem",
    notaCotar: `referência: bancos, ${pc(B.mercado.bcb_antecipacao_cartao_am, 2)} ao mês em média (BCB, ago/26); ofertas comerciais de ~${pc(ofertas.min, 1)} a ~${pc(ofertas.max, 1)} ao mês; não é cotação`,
    numero: tot.economia_anual_estimada, numeroFmt: (v) => mi(v, 2), porAno: "por ano",
    natureza: "economia estimada, se o plano for executado",
    decisoes: "Quatro decisões. / De quem depende cada uma.",
    acoes: Z.acoes.map((a) => ({ id: a.id, t: DECISAO[a.id] || a.titulo, v: a.valor_anual, grupo: a.quem_decide === "empresa" ? "empresa" : a.quem_decide === "credenciadora" ? "credenciadora" : "financiadores" })),
    grupos: [["empresa", `só da empresa · ${mil(qd.empresa)}`], ["financiadores", `de financiadores · ${mil(qd.financiadores)}`], ["credenciadora", `da credenciadora · ${mil(qd.credenciadora)}`]],
    totalRot: `${mi(tot.economia_anual_estimada, 2)} · por ano, estimada`,
    ladrilhos: [
      { tipo: "estimada", v: `${mi(tot.economia_anual_estimada, 2)} por ano`, t: "economia estimada" },
      { tipo: "uma-vez", v: `${mil(Z.recuperacaoMdr.valor)}, uma vez`, t: `diferença de MDR desde ${mdrDesde}, a contestar` },
      { tipo: "nao-ganho", v: `${mi(tot.por_tipo["caixa liberado / redução de dívida"].garantida_quitada, 1)} · ${F.n(tot.por_tipo["caixa liberado / redução de dívida"].caixa_medio_usado / 1e6, 1)} mi`, t: "não são ganho: dívida quitada · caixa médio menor (já inclui a quitação)" },
    ],
  };

  // ------------------------------------------------------------------ cena 7 · semanas
  const varMes = Math.abs(mesFraco.var_pct);
  const semanas = {
    pergunta: "Antecipando menos, / o caixa aguenta um mês fraco?",
    legPergunta: `No país, ${mesFraco.mes} vendeu ${varMes}% ${mesFraco.var_pct < 0 ? "menos" : "mais"} / que ${mesFraco.base} (${mesFraco.fonte}).`,
    fontePergunta: `${mesFraco.fonte}, ${mesFraco.curto}`,                                   // 7.1 (v2, S4): nos dois modos
    notaRegra: "mínimo da rede ilustrativa; no diagnóstico, definido com a tesouraria",   // 7.2 (v2, S5)
    regraRot: `regra · ${mi(regra, 0)}`,
    minRot: (v) => `mínimo: ${miA(v)}`,
    regraTit: `Com uma regra: / nunca abaixo de ${mi(regra, 0)}.`,
    regraLeg: `Antecipar só na semana em que falta: / a diferença e mais ${B.plano.folga_pct}%.`,
    plano: P13.plano.semanas.map((w) => w.saldo_minimo), minPlano,
    vendas: { serie: ev.semanas_min, minimo: ev.minimo_13s, legenda: `vendas ${quedaVendas}% menores`,
      titulo: `Vendas ${quedaVendas}% menores: / + ${mi(ev.antecipado_a_mais_13s, 2)} antecipados.`,
      leg: ev.respeita_minimo && !(ev.garantida_max_13s > 0) ? "O caixa segue acima do mínimo, sem conta garantida." : "O caixa fica perto do mínimo." },
    natal: { serie: ec.semanas_min, minimo: ec.minimo_13s, legenda: "13º e Natal juntos",
      titulo: `13º e Natal juntos: / + ${mi(ec.antecipado_a_mais_13s, 2)} antecipados.`,
      leg: ec.respeita_minimo ? "13º inteiro em novembro e compras de Natal à vista: o mínimo se mantém." : "13º inteiro em novembro e compras de Natal à vista: o mínimo fica no limite." },
    serieRot: "com a regra", regra,
  };

  // ------------------------------------------------------------------ quadros (material e diagnóstico legado)
  const acoes = Z.acoes.map((a) => ({ id: a.id, t: CURTO_ACAO[a.id] || a.titulo, longo: a.titulo, v: a.valor_anual, quem: quem(a), empresa: a.quem_decide === "empresa", prazo: a.prazo, memoria: a.memoria, condicao: a.condicao }));
  const quadros = [
    { id: "agenda", titulo: `${mi(agTot)} já vendidos ainda vão entrar nos próximos meses.`, tituloL: `${mi(agTot)} já vendidos / ainda vão entrar.`,
      sub: `${pc(100 * agAnt / agTot, 0)} já antecipados; ${pc(100 * agCed / agTot, 0)} cedidos ao Banco B. O resto chega na data.`,
      meses: ag.meses.map((m) => ({ mes: mesCurto(m.mes), total: m.total, antecipado: m.antecipado, cedido: m.cedido, livre: m.livre })),
      valorRot: (v) => `R$ ${r1(v)} mi`, legenda: [["o", "já antecipado"], ["g", "cedido ao Banco B"], ["", "livre, chega na data"]] },
    { id: "fontes", titulo: `A rede paga ${mi(H.custo_dinheiro_anual, 2)} por ano pelo dinheiro que usa.`, tituloL: `A rede paga ${mi(H.custo_dinheiro_anual, 2)} por ano / pelo dinheiro que usa.`,
      sub: `Largura: saldo médio. Altura: taxa efetiva ao ano. A maior fonte é a antecipação automática: ${mi(an.custo_anual_hoje, 2)} por ano.`,
      fontes: fontesGraf, rendimento: H.aplicacao.taxa_aa, rendimentoRot: "rende a aplicação", destaque: "antecipacao", custoRot: (v) => mi(v, 2) },
    { id: "hoje", titulo: `Em ${cp.dias_com_aplicacao_e_garantida} dias do ano, havia dinheiro aplicado e conta garantida sacada ao mesmo tempo.`, tituloL: `Aplicação a ${pc(H.aplicacao.taxa_aa)}, / garantida a ${pc(fGar.taxa_efetiva_aa)} com IOF.`,
      sub: `Nas 13 semanas, o caixa nunca desce de ${miA(minHoje)} e a garantida chega a ${miA(P13.hoje.garantida_max)}. Pode haver razão: reserva mínima, covenant, CNPJs separados.`,
      semanas: P13.hoje.semanas.map((w) => w.saldo_minimo), garantida: P13.hoje.semanas.map((w) => w.garantida_max),
      linha: regra, linhaRot: `saldo mínimo de referência · ${mi(regra, 0)}`, semanaRot: "sem.", serieRot: "caixa mínimo da semana", ladoRot: "garantida sacada (máximo)",
      minRot: miA, minLeg: "menor caixa", maxLeg: "garantida" },
    { id: "depois", titulo: `Com uma regra, o caixa fica acima de ${mi(regra, 0)} nas treze semanas.`, tituloL: `Com uma regra, o caixa fica / acima de ${mi(regra, 0)} nas 13 semanas.`,
      sub: `Antecipar só na semana em que falta, a diferença e mais ${B.plano.folga_pct}%. Com vendas ${quedaVendas}% menores, a regra antecipa ${mi(ev.antecipado_a_mais_13s, 2)} a mais e o mínimo se mantém.`,
      semanas: P13.plano.semanas.map((w) => w.saldo_minimo), estresse: ev.semanas_min, estresseRot: `vendas ${quedaVendas}% menores`,
      linha: regra, linhaRot: `saldo mínimo · ${mi(regra, 0)}`, semanaRot: "sem.", serieRot: "com a regra", ladoRot: `vendas ${quedaVendas}% menores`,
      minRot: miA, minLeg: "mínimo", maxLeg: "" },
    { id: "custo", titulo: `O que isso pode valer: ${mi(tot.economia_anual_estimada, 2)} por ano, estimados.`, tituloL: `O que isso pode valer: / ${mi(tot.economia_anual_estimada, 2)} por ano, estimados.`,
      sub: "Quatro ações, somadas em cascata, sem contar nada duas vezes. Ao lado de cada uma, de quem depende.",
      acoes, total: tot.economia_anual_estimada, empresa: tot.por_quem_decide.empresa,
      recuperacao: Z.recuperacaoMdr.valor, divida: tot.por_tipo["caixa liberado / redução de dívida"].garantida_quitada, caixaUsado: tot.por_tipo["caixa liberado / redução de dívida"].caixa_medio_usado,
      valorRot: (v) => `R$ ${F.n(Math.round(v / 1000))} mil`,
      totalHTML: `<b class="num">${mi(tot.economia_anual_estimada, 2)}</b> por ano, estimados · <b class="num ouro">${mi(tot.por_quem_decide.empresa, 2)}</b> dependem só da empresa`,
      notaHTML: `Uma vez: ${mil(Z.recuperacaoMdr.valor)} a contestar. Não são ganho: ${mi(tot.por_tipo["caixa liberado / redução de dívida"].garantida_quitada, 1)} de dívida quitada e ${mi(tot.por_tipo["caixa liberado / redução de dívida"].caixa_medio_usado, 1)} de caixa médio usado.` },
  ];

  // ------------------------------------------------------------------ cena 8 · entrega (e material)
  const linhasMapa = fontesGraf.map((f) => [f.rot, mi(f.saldo, 1), pc(f.taxa), mi(f.custo, 2)]);
  const iMinPlano = P13.plano.semanas.reduce((k, w, i, a) => (w.saldo_minimo < a[k].saldo_minimo ? i : k), 0);
  const devolutiva = "devolutiva · dia 9";
  const entrega = {
    abre: "Dez dias. / Três documentos.", abreLeg: "e uma devolutiva com os sócios da rede no nono dia.",
    pecas: {
      capa: { titulo: proj.nome, sub: `Diagnóstico e direcionamento · rede ilustrativa · ${dataBase}`,
        indice: ["Mapa do custo do dinheiro", "Projeção de 13 semanas", "Plano de substituição de fontes", "Memória de cálculo"] },
      mapa: { k: "O mapa do custo do dinheiro", l: "cada fonte, com saldo, taxa efetiva e custo",
        titulo: "Mapa do custo do dinheiro", sub: `12 meses a partir de ${dm(Z.meta.horizonte.inicio)}/${Z.meta.horizonte.inicio.slice(0, 4)} · saldo médio, taxa efetiva e custo`,
        cab: ["fonte", "saldo médio", "taxa ao ano", "custo no ano"],
        linhas: [...linhasMapa.map((v) => ({ v })), { v: ["total", mi(H.saldo_medio_total, 1), pc(H.taxa_media_ponderada_aa), mi(H.custo_dinheiro_anual, 2)], total: true, dest: true }],
        rodape: `A aplicação rende ${pc(H.aplicacao.taxa_aa)} ao ano (${mi(H.aplicacao.rendimento_anual, 2)} no ano). Antes de IR/CSLL.` },
      projecao: { k: "A projeção de 13 semanas", l: "refeita toda segunda-feira; fica com a rede",
        arquivo: "projecao_13_semanas.xlsx", cab: ["semana", "hoje", "com a regra", `vendas −${quedaVendas}%`],
        linhas: P13.hoje.semanas.map((w, i) => [`${i + 1}`, mi(w.saldo_minimo, 2), mi(P13.plano.semanas[i].saldo_minimo, 2), mi(ev.semanas_min[i], 2)]),
        destaque: iMinPlano },
      plano: { k: "O plano de substituição de fontes", l: "cada decisão com valor, de quem depende, prazo / e memória de cálculo",
        titulo: "Plano de substituição de fontes", sub: "em ordem de execução · valores anuais estimados",
        linhas: acoes.map((a) => ({ t: a.t, q: `${a.quem} · ${a.prazo}`, v: mil(a.v) })),
        totalRot: "Total estimado por ano", total: mi(tot.economia_anual_estimada, 2),
        rodape: `Uma vez, a contestar: ${mil(Z.recuperacaoMdr.valor)}. Dívida quitada e caixa usado não são ganho. Memória de cálculo de cada valor no anexo.` },
      devolutiva: { t: devolutiva },
    },
    sabe: "No décimo dia, a rede sabe:",
    // 8.4: a recapitulação dos três documentos que acabaram de passar, em itens de até 6 palavras (42-ritmo-final.md, A3)
    sabeLista: ["o custo de cada fonte;", "quanto antecipar, semana a semana;", "que decidir, e de quem depende."],
  };
  // estrutura que o material.html lê (capa, folhas, planilha)
  const entregavel = {
    capa: { titulo: proj.nome, sub: `Diagnóstico e direcionamento · ${dataBase} · versão 1.0`,
      indice: ["Mapa do custo do dinheiro", "Projeção de 13 semanas", "Regra de antecipação e saldo mínimo", "Plano de substituição de fontes", "Contestação do MDR cobrado a mais", "Memória de cálculo"] },
    folhas: [
      { id: "plano", titulo: "Plano de substituição de fontes", sub: "em ordem de execução; valores anuais estimados",
        linhas: acoes.map((a) => [a.t, mil(a.v), `${a.quem} · ${a.prazo}`]) },
      { id: "regra", titulo: "Regra de antecipação e saldo mínimo", sub: "para aprovar em ata",
        itens: [`Saldo mínimo de ${mi(regra, 0)}, medido todo dia; projeção de 13 semanas refeita toda segunda-feira.`, "Antecipação automática desligada; antecipar só por pedido, na semana em que a projeção mostrar falta.", `Antecipar a diferença mais ${B.plano.folga_pct}%, começando pelas parcelas livres que vencem primeiro.`, "Antes de antecipar, cotar com dois financiadores pela registradora; a parte cedida ao Banco B fica fora.", "Caixa e aplicação num caixa só; conta garantida só para emergência, com aviso à diretoria."] },
      { id: "mapa", titulo: "Mapa do custo do dinheiro", sub: "12 meses a partir de 1º/09/2026; saldo médio, taxa efetiva e custo",
        linhas: [...linhasMapa, ["total", mi(H.saldo_medio_total, 1), pc(H.taxa_media_ponderada_aa), mi(H.custo_dinheiro_anual, 2)]] },
    ],
    planilha: { titulo: "projecao_13_semanas.xlsx", cab: ["semana", "hoje", "com a regra", `vendas −${quedaVendas}%`],
      linhas: P13.hoje.semanas.map((w, i) => [`${i + 1}`, mi(w.saldo_minimo, 2), mi(P13.plano.semanas[i].saldo_minimo, 2), mi(ev.semanas_min[i], 2)]) },
    // compatibilidade com as peças antigas de js/cenas/comum.js (PECAS, htmlPeca, LEGENDAS)
    legendas: { f0: ["O plano", "Cada ação com o valor estimado, de quem depende e quando."], f1: ["A regra", "Saldo mínimo e antecipação por pedido, prontos para aprovar."] },
    painel: { titulo: "Saldo semanal", tipo: "semanas", valores: P13.plano.semanas.map((w) => w.saldo_minimo), linha: regra },
    devolutiva: "Dia 9 · devolutiva de 1h30 com os sócios da rede e a tesouraria",
  };

  // ------------------------------------------------------------------ cena 9 · um projeto
  const umProjeto = { titulo: "Isto é um projeto.", codigo: proj.codigo };

  return { proj, n: 3, formulario, insumos, parede, cruzamento, descoberta, conta, semanas, entrega, umProjeto, quadros, entregavel,
    exemplo: ex, custoPorHora: Z.custoPorHora, cabDiag: `Diagnóstico · ${proj.codigo} · ${proj.nome} · rede ilustrativa · ${dataBase}` };
}
