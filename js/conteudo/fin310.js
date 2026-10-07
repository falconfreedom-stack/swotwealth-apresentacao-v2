import { F } from "../util.js?v=202610071930";
import { r1, mi, mil, pc } from "./formato.js?v=202610071930";

// ================================================================== Projeto 3 · capital de giro e custo do dinheiro
export function projeto3(base, R, proj, dataBase) {
  const C = R.custo, P = R.plano, cart = base.caixa.cartao, s = base.setor;
  const formulario = {
    total: 4 * 5 + 6 + 4,
    blocos: [
      { titulo: "Contratos de dívida", origem: "pasta de contratos, conferidos contra os extratos", largo: true, tabela: {
        cab: ["contrato", "banco", "saldo", "taxa ao mês", "parcelas", "garantia"],
        linhas: C.fontes.map((f) => [f.nome, f.banco, mi(f.saldo), pc(f.taxa_am, 2), f.parcelas ? String(f.parcelas) : "rotativo", f.garantia.split(";")[0]]) } },
      { titulo: "Cartão", origem: "portal da credenciadora", campos: [
        { l: "Vendas no cartão por mês", v: mi(C.cartao_mes) }, { l: "Taxa contratada", v: pc(cart.mdr_contratado_pct, 2) }, { l: "Taxa cobrada no extrato", v: pc(cart.mdr_efetivo_pct, 2), alerta: true },
        { l: "Antecipação automática", v: `${cart.antecipacao_pct_agenda}% da agenda`, alerta: true }, { l: "Taxa de antecipação", v: `${pc(cart.taxa_antecipacao_am, 2)} ao mês` } ] },
      { titulo: "Caixa", origem: "extratos de seis meses", campos: [
        { l: "Conta movimento", v: mi(base.caixa.conta_movimento) }, { l: "Aplicação", v: mi(base.caixa.aplicacao) }, { l: "Rendimento", v: `${base.caixa.aplicacao_pct_cdi}% do CDI` },
        { l: "Saldo mínimo definido", v: "nenhum", t: "texto", alerta: true } ] },
      { titulo: "Calendário de pagamentos", origem: "contas a pagar", campos: [
        { l: "Folha", v: "dias 5 e 20", t: "texto" }, { l: "Aluguéis", v: "dia 10", t: "texto" }, { l: "Fornecedores", v: "dias 15 e 28", t: "texto" }, { l: "Dívida", v: "dia 25", t: "texto" } ] },
    ],
    selo: "Recebido em 1º/09/2026: quatro contratos, extratos de seis meses e a agenda da credenciadora. Marco inicial confirmado por escrito em 2/09/2026; a contagem dos dez dias começa em 3/09.",
  };
  const parede = { nos: [
    { x: 250, y: 300, t: `${C.fontes.length} contratos · ${mi(C.divida)}` }, { x: 250, y: 370, t: `cartão · ${mi(C.cartao_mes)} por mês` },
    { x: 250, y: 440, t: `antecipação de ${cart.antecipacao_pct_agenda}% a ${pc(cart.taxa_antecipacao_am, 2)} a.m.` }, { x: 250, y: 510, t: `caixa de ${mi(C.caixa_total)} a ${base.caixa.aplicacao_pct_cdi}% do CDI` }, { x: 250, y: 580, t: "calendário de pagamentos" },
    { x: 640, y: 350, t: "custo efetivo de cada fonte" }, { x: 640, y: 520, t: "projeção de 13 semanas" },
    { x: 1000, y: 290, t: `custo do dinheiro · ${mi(C.custo_total_ano)} por ano`, ouro: 1 },
    { x: 1000, y: 390, t: `taxa do cartão acima do contrato · ${mil(C.mdr_excesso_ano)} por ano`, ouro: 1 },
    { x: 1000, y: 500, t: `saldo nunca abaixo de ${mi(P.hoje.minimo)}`, ouro: 1 },
    { x: 1000, y: 600, t: `antecipar ${P.escolhido}% basta`, ouro: 1 },
    { x: 1360, y: 450, t: `plano de fontes · ${mi(P.total)} por ano`, ouro: 1 },
  ], lig: [[0, 5], [2, 5], [1, 5], [5, 7], [1, 8], [3, 6], [4, 6], [2, 6], [6, 9], [6, 10], [7, 11], [9, 11], [10, 11], [8, 11]] };

  const antecipadoSaldo = C.antecipado_mes * cart.prazo_recebimento_dias / 30;
  const fontesGraf = [...C.fontes.map((f) => ({ rot: f.nome === "Capital de giro" ? `giro · ${f.banco}` : f.nome.toLowerCase(), saldo: f.saldo, taxa: f.taxa_aa, custo: f.custo_ano })),
    { rot: "antecipação", saldo: antecipadoSaldo, taxa: C.taxa_antecipacao_aa, custo: C.custo_antecipacao_ano }].sort((a, b) => b.taxa - a.taxa);
  const quadros = [
    { id: "fontes", titulo: `A rede paga ${mi(C.custo_total_ano)} por ano pelo dinheiro que usa.`,
      sub: "A largura de cada barra é o saldo; a altura, a taxa ao ano. A área é o custo.",
      fontes: fontesGraf, rendimento: C.rend_aplicacao_aa },
    { id: "hoje", titulo: `Em treze semanas, o saldo nunca desce de ${mi(P.hoje.minimo)}.`,
      sub: `Enquanto isso, ${mi(C.caixa_total)} rendem ${pc(C.rend_aplicacao_aa)} ao ano e a conta garantida custa ${pc(C.fontes.find((f) => f.nome === "Conta garantida").taxa_aa)}.`,
      semanas: P.hoje.semanas.map((w) => w.min), linha: P.saldo_minimo, linhaRot: `saldo mínimo proposto · ${mi(P.saldo_minimo)}` },
    { id: "depois", titulo: `Antecipar ${P.escolhido}% da agenda basta.`,
      sub: `Com a conta garantida quitada e parte do giro amortizada, o saldo fica acima de ${mi(P.saldo_minimo)} nas treze semanas.`,
      semanas: P.depois.semanas.map((w) => w.min), linha: P.saldo_minimo, linhaRot: `saldo mínimo · ${mi(P.saldo_minimo)}`,
      candidatos: P.candidatos.filter((c) => [0, 10, 15, 20, P.escolhido, 50].includes(c.p)) },
    { id: "custo", titulo: "O que isso vale.",
      sub: "O que depende só da empresa vem em ouro. Nenhum ganho foi contado duas vezes.",
      acoes: P.acoes, total: P.total, certo: P.certo },
  ];
  const entregavel = {
    capa: { titulo: proj.nome, sub: `Diagnóstico e direcionamento · ${dataBase} · versão 1.0`,
      indice: ["Mapa do custo do dinheiro", "Plano de substituição de fontes", "Regra de antecipação e saldo mínimo", "Projeção de 13 semanas", "Indicadores e rotina semanal", "Memória de cálculo"] },
    folhas: [
      { id: "plano", titulo: "Plano de substituição de fontes", sub: "em ordem de execução", linhas: P.acoes.map((a) => [a.t, mil(a.v), a.quando]) },
      { id: "regra", titulo: "Regra de antecipação e saldo mínimo", sub: "aprovada pela diretoria",
        itens: [`Saldo mínimo de ${mi(P.saldo_minimo)}, medido toda segunda-feira.`, "Antecipação só por pedido, na semana em que a projeção acusar falta, no valor da diferença mais 10%.", "Acima de 40% da agenda, a antecipação exige a diretoria.", "Antes de antecipar, cotar com dois financiadores pela registradora.", "Revisão da regra a cada seis meses."] },
      { id: "memoria", titulo: "Memória de cálculo", sub: "cada linha com a sua conta",
        linhas: P.acoes.map((a) => [a.t, mil(a.v), a.tipo === "certo" ? "certo" : "depende de terceiros"]) },
    ],
    planilha: { titulo: "projecao_13_semanas.xlsx", cab: ["semana", "hoje", "com o plano"], linhas: P.hoje.semanas.map((w, i) => [`${i + 1}`, mi(w.min), mi(P.depois.semanas[i].min)]) },
    painel: { titulo: "Saldo semanal", tipo: "semanas", valores: P.depois.semanas.map((w) => w.min), linha: P.saldo_minimo },
    devolutiva: "Dia 9 · devolutiva de 1h30 com os sócios e a tesouraria",
  };
  const resultado = { numero: mi(P.total), legenda: "por ano, com o plano de fontes", sub: `${mi(P.certo)} certos, que dependem só da empresa. O restante depende de banco e credenciadora.` };
  return { proj, n: 3, formulario, parede, quadros, entregavel, resultado, cabDiag: `Diagnóstico · Projeto 3 · ${proj.nome} · ${dataBase}` };
}
