import { F } from "../util.js?v=202610071930";
import { r1, mi, mil, pc } from "./formato.js?v=202610071930";

// ================================================================== FIN3.10 · capital de giro e custo do dinheiro
// A lente que conduz a peça. Todos os números vêm de R.fin310 (motor/fin310.js; memória de cálculo em
// estudo/modelo/30-auditoria-e-memoria.md). Rótulos: economia anual ESTIMADA (potencial), recuperação única
// estimada, e dívida paga / caixa usado (não são ganho). Nada de "certos", "garantido" ou "perda".
const QUEM = { empresa: "depende da empresa", credenciadora: "depende da credenciadora" };
const quem = (a) => QUEM[a.quem_decide] || (a.quem_decide.startsWith("financiadores") ? "depende dos financiadores" : `depende de ${a.quem_decide}`);
const CURTO_ACAO = { garantida: "Caixa único e conta garantida quitada", pedido: "Antecipar só por pedido, pela regra", cotar: "Cotar a antecipação pela registradora", mdr: "MDR do contrato em 7 a 10 parcelas" };
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const mesCurto = (iso) => MES[Number(iso.slice(5, 7)) - 1];

export function projeto3(base, R, proj, dataBase) {
  const Z = R.fin310, B = base.fin310, H = Z.custoDoDinheiro.hoje, cart = B.cartao, G = B.conta_garantida;
  const cp = Z.caixaParado.hoje, an = Z.antecipacao, tot = Z.totais, ag = Z.agenda, ex = Z.exemploVenda;
  const fonteById = Object.fromEntries(H.fontes.map((f) => [f.id, f]));
  const divida = B.dividas.reduce((s, d) => s + d.saldo, 0) + G.sacado_data_base;
  const agTot = ag.meses.reduce((s, m) => s + m.total, 0), agAnt = ag.meses.reduce((s, m) => s + m.antecipado, 0), agCed = ag.meses.reduce((s, m) => s + m.cedido, 0);
  const minHoje = Z.projecao13.hoje.minimo, minPlano = Z.projecao13.plano.minimo, regra = B.plano.saldo_minimo;
  const ev = Z.estresses.vendas.plano;

  const formulario = {
    total: 5 * 6 + 6 + 4 + 5,
    blocos: [
      { titulo: "Contratos de dívida", origem: "pasta de contratos, conferidos contra os extratos", largo: true, tabela: {
        cab: ["contrato", "credor", "saldo", "taxa ao mês", "parcelas", "garantia"],
        linhas: [...B.dividas.map((d) => [d.nome, d.credor, mi(d.saldo), pc(d.taxa_am, 2), String(d.parcelas_restantes), (d.garantia || "").split(";")[0]]),
          [G.nome, G.credor, mi(G.sacado_data_base), pc(G.taxa_am, 2), "rotativo", `limite de ${mi(G.limite)}`]] } },
      { titulo: "Credenciadora", origem: "contrato, extratos e agenda na registradora", campos: [
        { l: "Vendas no crédito por mês", v: mi(Z.rede.venda_credito_ano / 12) }, { l: "MDR contratado, 7 a 10x", v: pc(cart.mdr_contratado_pct.credito_7_10x, 2) },
        { l: "MDR cobrado no extrato, 7 a 10x", v: pc(cart.mdr_cobrado_pct.credito_7_10x, 2), alerta: true },
        { l: "Antecipação automática", v: `${cart.antecipacao_automatica.pct_da_parte_livre}% da agenda livre`, alerta: true },
        { l: "Taxa de antecipação", v: `${pc(cart.antecipacao_automatica.taxa_am, 2)} ao mês` }, { l: "Agenda cedida ao Banco B", v: `${cart.trava_banco_b_pct}%`, t: "texto" } ] },
      { titulo: "Caixa", origem: "extratos de seis meses", campos: [
        { l: "Aplicação em 31/08", v: mi(B.caixa.aplicacao_data_base) }, { l: "Rendimento", v: `${B.caixa.aplicacao_pct_cdi}% do CDI` },
        { l: "Conta garantida sacada", v: mi(G.sacado_data_base), alerta: true }, { l: "Saldo mínimo definido", v: "nenhum", t: "texto", alerta: true } ] },
      { titulo: "Contas a pagar", origem: "contas a pagar em aberto e calendário", campos: [
        { l: "Armações", v: "30, 60 e 90 dias", t: "texto" }, { l: "Lentes e blocos do laboratório", v: "30 e 60 dias", t: "texto" },
        { l: "Aluguel dos shoppings", v: "dia 10; dobrado em dezembro", t: "texto" }, { l: "Folha", v: "5º dia útil e dia 20", t: "texto" }, { l: "Dívidas", v: "dias 5, 15 e 25", t: "texto" } ] },
    ],
    selo: "Recebido em 1º/09/2026: os contratos, extratos de seis meses, a agenda da credenciadora e as contas a pagar. Marco inicial confirmado por escrito em 2/09/2026; a contagem dos dez dias começa em 3/09.",
  };
  const parede = { nos: [
    { x: 250, y: 300, t: `${B.dividas.length + 1} contratos · ${mi(divida)}` }, { x: 250, y: 370, t: `agenda · ${mi(agTot)} a receber` },
    { x: 250, y: 440, t: `antecipação automática · ${pc(cart.antecipacao_automatica.taxa_am, 2)} a.m.` }, { x: 250, y: 510, t: `aplicação de ${mi(B.caixa.aplicacao_data_base)} a ${B.caixa.aplicacao_pct_cdi}% do CDI` }, { x: 250, y: 580, t: "contas a pagar e calendário" },
    { x: 640, y: 350, t: "custo efetivo de cada fonte" }, { x: 640, y: 520, t: "365 dias simulados, dia a dia" },
    { x: 1000, y: 290, t: `custo do dinheiro · ${mi(H.custo_dinheiro_anual)} por ano`, ouro: 1 },
    { x: 1000, y: 390, t: `aplicação e garantida juntas · ${cp.dias_com_aplicacao_e_garantida} dias`, ouro: 1 },
    { x: 1000, y: 500, t: `antecipação · ${pc(an.hoje.taxa_efetiva_aa)} ao ano`, ouro: 1 },
    { x: 1000, y: 600, t: `regra · saldo mínimo de ${mi(regra)}`, ouro: 1 },
    { x: 1360, y: 450, t: `plano · ${mi(tot.economia_anual_estimada, 2)} por ano, estimados`, ouro: 1 },
  ], lig: [[0, 5], [2, 5], [1, 5], [5, 7], [3, 8], [0, 8], [2, 9], [1, 6], [4, 6], [6, 10], [7, 11], [8, 11], [9, 11], [10, 11]] };

  // fontes do mapa do custo do dinheiro, da mais cara para a mais barata (largura = saldo médio, altura = taxa efetiva)
  const ROT = { antecipacao: "antecipação", giro_a: "giro · Banco A", giro_b: "giro · Banco B", equip_c: "equipamentos", garantida: "conta garantida" };
  const fontesGraf = H.fontes.map((f) => ({ id: f.id, rot: ROT[f.id] || f.nome, saldo: f.saldo_medio, taxa: f.taxa_efetiva_aa, custo: f.custo_anual })).sort((a, b) => b.taxa - a.taxa);
  const acoes = Z.acoes.map((a) => ({ id: a.id, t: CURTO_ACAO[a.id] || a.titulo, longo: a.titulo, v: a.valor_anual, quem: quem(a), empresa: a.quem_decide === "empresa", prazo: a.prazo, memoria: a.memoria, condicao: a.condicao }));
  const quadros = [
    { id: "agenda", titulo: `${mi(agTot)} já vendidos ainda vão entrar nos próximos meses.`,
      sub: `${pc(100 * agAnt / agTot, 0)} já foram antecipados pela credenciadora; ${pc(100 * agCed / agTot, 0)} estão cedidos ao Banco B em garantia. O resto chega na data.`,
      meses: ag.meses.map((m) => ({ mes: mesCurto(m.mes), total: m.total, antecipado: m.antecipado, cedido: m.cedido, livre: m.livre })) },
    { id: "fontes", titulo: `A rede paga ${mi(H.custo_dinheiro_anual)} por ano pelo dinheiro que usa.`,
      sub: `A largura de cada barra é o saldo médio; a altura, a taxa efetiva ao ano. A antecipação automática é a maior fonte: ${mi(an.custo_anual_hoje, 2)} por ano.`,
      fontes: fontesGraf, rendimento: H.aplicacao.taxa_aa },
    { id: "hoje", titulo: `Em ${cp.dias_com_aplicacao_e_garantida} dias do ano, havia dinheiro aplicado e limite sacado ao mesmo tempo.`,
      sub: `A aplicação rende ${pc(H.aplicacao.taxa_aa)} ao ano; a conta garantida custa ${pc(fonteById.garantida ? fonteById.garantida.taxa_efetiva_aa : 0)} com o IOF de cada saque. O caixa nunca desce de ${mi(minHoje)}.`,
      semanas: Z.projecao13.hoje.semanas.map((w) => w.saldo_minimo), garantida: Z.projecao13.hoje.semanas.map((w) => w.garantida_max),
      linha: regra, linhaRot: `saldo mínimo proposto · ${mi(regra)}` },
    { id: "depois", titulo: `Com uma regra, o caixa fica acima de ${mi(regra)} nas treze semanas.`,
      sub: `Antecipar só na semana em que falta, a diferença e mais ${B.plano.folga_pct}%. Com vendas 15% menores, a regra antecipa ${mi(ev.antecipado_a_mais_13s)} a mais e o mínimo se mantém.`,
      semanas: Z.projecao13.plano.semanas.map((w) => w.saldo_minimo), estresse: ev.semanas_min, estresseRot: "vendas 15% menores",
      linha: regra, linhaRot: `saldo mínimo · ${mi(regra)}` },
    { id: "custo", titulo: `O que isso pode valer: ${mi(tot.economia_anual_estimada, 2)} por ano, estimados.`,
      sub: "Quatro ações, somadas em cascata, sem contar nada duas vezes. Ao lado de cada uma, de quem depende.",
      acoes, total: tot.economia_anual_estimada, empresa: tot.por_quem_decide.empresa,
      recuperacao: Z.recuperacaoMdr.valor, divida: tot.por_tipo["caixa liberado / redução de dívida"].garantida_quitada, caixaUsado: tot.por_tipo["caixa liberado / redução de dívida"].caixa_medio_usado },
  ];
  const linhasMapa = fontesGraf.map((f) => [f.rot, mi(f.saldo), pc(f.taxa), mi(f.custo, 2)]);
  const entregavel = {
    capa: { titulo: proj.nome, sub: `Diagnóstico e direcionamento · ${dataBase} · versão 1.0`,
      indice: ["Mapa do custo do dinheiro", "Projeção de 13 semanas", "Regra de antecipação e saldo mínimo", "Plano de substituição de fontes", "Contestação do MDR cobrado a mais", "Memória de cálculo"] },
    folhas: [
      { id: "plano", titulo: "Plano de substituição de fontes", sub: "em ordem de execução; valores anuais estimados",
        linhas: acoes.map((a) => [a.t, mil(a.v), `${a.quem} · ${a.prazo}`]) },
      { id: "regra", titulo: "Regra de antecipação e saldo mínimo", sub: "para aprovar em ata",
        itens: [`Saldo mínimo de ${mi(regra)}, medido todo dia; projeção de 13 semanas refeita toda segunda-feira.`, "Antecipação automática desligada; antecipar só por pedido, na semana em que a projeção mostrar falta.", `Antecipar a diferença mais ${B.plano.folga_pct}%, começando pelas parcelas livres que vencem primeiro.`, "Antes de antecipar, cotar com dois financiadores pela registradora; a parte cedida ao Banco B fica fora.", "Caixa e aplicação num caixa só; conta garantida só para emergência, com aviso à diretoria."] },
      { id: "mapa", titulo: "Mapa do custo do dinheiro", sub: "12 meses a partir de 1º/09/2026; saldo médio, taxa efetiva e custo",
        linhas: [...linhasMapa, ["total", mi(H.saldo_medio_total), pc(H.taxa_media_ponderada_aa), mi(H.custo_dinheiro_anual, 2)]] },
    ],
    legendas: { f0: ["O plano", "Cada ação com o valor estimado, de quem depende e quando."], f1: ["A regra", "Saldo mínimo e antecipação por pedido, prontos para aprovar."] },
    planilha: { titulo: "projecao_13_semanas.xlsx", cab: ["semana", "hoje", "com a regra", "vendas −15%"],
      linhas: Z.projecao13.hoje.semanas.map((w, i) => [`${i + 1}`, mi(w.saldo_minimo), mi(Z.projecao13.plano.semanas[i].saldo_minimo), mi(ev.semanas_min[i])]) },
    painel: { titulo: "Saldo semanal", tipo: "semanas", valores: Z.projecao13.plano.semanas.map((w) => w.saldo_minimo), linha: regra },
    devolutiva: "Dia 9 · devolutiva de 1h30 com os sócios e a tesouraria",
  };
  const resultado = { numero: mi(tot.economia_anual_estimada, 2), legenda: "por ano, estimados, se o plano for executado",
    sub: `${mil(tot.por_quem_decide.empresa)} dependem só de decisões da empresa; o restante, de financiadores e da credenciadora. Mais ${mil(Z.recuperacaoMdr.valor)} a contestar, uma vez.` };
  return { proj, n: 3, formulario, parede, quadros, entregavel, resultado, exemplo: ex, custoPorHora: Z.custoPorHora,
    cabDiag: `Diagnóstico · ${proj.codigo} · ${proj.nome} · ${dataBase}` };
}
