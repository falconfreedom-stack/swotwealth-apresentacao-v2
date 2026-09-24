// Conteúdo das cenas (v2). Todo número vem do motor (calcular(base)); o texto fica aqui.
// Projetos do Top 3: 1 · FIN8.2 catálogo de indicadores · 2 · FIN5.11 segregação de funções ·
// 3 · FIN3.10 capital de giro e custo do dinheiro. A rede de academias é um exemplo do porte do cliente.
import { F } from "./util.js?v=202609232228";

const r1 = (v) => F.n(v / 1e6, 1);            // milhões com uma casa
const mi = (v) => `R$ ${r1(v)} mi`;
const mil = (v) => `R$ ${F.n(Math.round(v / 1000))} mil`;
const pc = (v, c = 1) => F.pct(v, c);

export const SOCIOS = {
  joao: { nome: "João Batista", hist: "Sistemas de Informação, USP. Engenharia de software no JP Morgan: internet banking, boletos e PIX." },
  brendon: { nome: "Brendon D'Angelo", hist: "Sistemas de Informação, USP. Cinco pós-graduações na Saint Paul, de finanças corporativas a controladoria. Sócio-administrador de uma rede de academias desde 2023." },
  guilherme: { nome: "Guilherme Falcão", hist: "Direito, USP. Pós-graduando em direito tributário, PUC-RS. Contencioso societário e modelagem financeira em fundo de investimento." },
  ryan: { nome: "Ryan Riscoti", hist: "Contador e empresário, Vava Contadores." },
};

export const DIAS = [["marco", "insumos completos, confirmados por escrito"], ["dias 1 a 3", "leitura e conferência"], ["4 a 6", "análise e sessão de decisão"], ["7 e 8", "redação e revisão"], ["9", "devolutiva com os sócios"], ["10", "entrega"]];
export const FASES = ["Fundação", "Processos", "Motor", "Eficiência", "Indicadores", "Influência", "Blindagem", "Estratégia", "Escala", "Perenidade"];
export const AMOSTRA = { 1: ["Enquadramento tributário e CNAE", "Política de cobrança e inadimplência", "LGPD aplicada aos dados financeiros"], 2: ["Régua de cobrança ativa", "Conciliação gerencial e contábil", "Fechamento contábil mensal"], 3: ["Política de crédito e limites", "Gestão de capital de giro", "Antecipação de recebíveis"], 4: ["Ponto de equilíbrio", "Política de preços", "Compras estratégicas"], 5: ["DRE gerencial padronizada", "Projeção de caixa de 13 semanas", "Segregação de funções"], 6: ["Educação financeira para gestores", "Reporte à diretoria e ao conselho", "Relacionamento com investidores"], 7: ["Planejamento tributário lícito", "Antifraude estruturado", "Programa de seguros corporativos"], 8: ["Catálogo oficial de indicadores", "Unit economics do negócio", "Análise de M&A e participações"], 9: ["Integração bancária (Open Finance)", "Agente de cobrança e negociação assistida", "Segurança da informação financeira"], 10: ["Comitê de finanças", "Plano de contingência financeira", "Gestão de pessoas-chave do financeiro"] };
export const TOP3_CODIGOS = { "FIN8.2": 1, "FIN5.11": 2, "FIN3.10": 3 };
export const NOMES = ["Catálogo de indicadores", "Segregação de funções", "Custo do dinheiro"];

const TOP3 = [
  { n: 1, codigo: "FIN8.2", nome: "Catálogo de indicadores financeiros", curto: NOMES[0],
    pergunta: "Os números que a diretoria, o banco e o conselho leem são os mesmos?",
    usa: ["pacote do conselho", "relatório de covenants ao banco", "DRE gerencial", "painel das unidades", "orçamento do ano"],
    recebe: ["catálogo com fórmula, fonte, dono e cadência de cada indicador", "ponte entre as versões do EBITDA", "regra para criar ou mudar um indicador"] },
  { n: 2, codigo: "FIN5.11", nome: "Segregação de funções", curto: NOMES[1],
    pergunta: "Quem cadastra, quem aprova e quem paga são pessoas diferentes?",
    usa: ["organograma do financeiro", "perfis de acesso do sistema", "alçadas de aprovação", "pagamentos e alterações de cadastro de 12 meses"],
    recebe: ["matriz de funções com cada conflito", "lista de acessos a retirar no sistema", "controle para cada conflito que o quadro não permite separar"] },
  { n: 3, codigo: "FIN3.10", nome: "Capital de giro e custo do dinheiro", curto: NOMES[2],
    pergunta: "Quanto custa o dinheiro que a empresa usa e quanto caixa ela deixa parado?",
    usa: ["contratos de dívida", "extratos de seis meses", "agenda da credenciadora", "contas a pagar e a receber"],
    recebe: ["mapa do custo do dinheiro", "projeção de 13 semanas", "plano de substituição de fontes com a memória de cálculo"] },
];
export function top3() { return TOP3; }

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

// ------------------------------------------------------------------------------ por projeto
export function conteudo(base, R, n) {
  const proj = TOP3[n - 1];
  const dataBase = "data-base 31 de agosto de 2026";
  if (n === 1) return projeto1(base, R, proj, dataBase);
  if (n === 2) return projeto2(base, R, proj, dataBase);
  return projeto3(base, R, proj, dataBase);
}

const CURTO = { "despesas pré-operacionais": "pré-operacionais", "eventos não recorrentes": "não recorrentes", "aluguéis fora do EBITDA (IFRS 16)": "aluguéis (IFRS 16)" };

// ================================================================== Projeto 1 · catálogo de indicadores
function projeto1(base, R, proj, dataBase) {
  const r = R.rede, K = R.kpis, e = r.ebitda, t = r.ticket, al = r.alunos;
  const docs = K.docs;
  const usosDoc = docs.map((d, i) => K.linhas.filter((l) => l.usos[i]).length);
  const formulario = {
    total: 31,
    blocos: [
      { titulo: "Documentos recebidos", origem: "enviados pela diretoria financeira", largo: true, tabela: {
        cab: ["documento", "cadência", "quem prepara", "indicadores"],
        linhas: docs.map((d, i) => [d.nome, d.cadencia, d.quem, String(usosDoc[i])]) } },
      { titulo: "EBITDA de 12 meses", origem: "como aparece em cada documento", campos: [
        { l: "DRE gerencial", v: mi(e.controladoria) }, { l: "Pacote do conselho", v: mi(e.conselho) }, { l: "Relatório de covenants", v: mi(e.banco) }, { l: "Definição escrita", v: "não existe", t: "texto", alerta: true } ] },
      { titulo: "Alunos ativos", origem: "como aparece em cada documento", campos: [
        { l: "Pacote do conselho", v: F.n(al.com_agregadores) }, { l: "Painel das unidades", v: F.n(al.matriculas_ativas) }, { l: "DRE gerencial", v: F.n(al.pagantes) }, { l: "Definição escrita", v: "não existe", t: "texto", alerta: true } ] },
      { titulo: "Ticket médio", origem: "como aparece em cada documento", campos: [
        { l: "Orçamento 2026", v: F.brl(t.tabela) }, { l: "Painel e conselho", v: F.brl(t.faturado) }, { l: "DRE gerencial", v: F.brl(t.realizado) }, { l: "Definição escrita", v: "não existe", t: "texto", alerta: true } ] },
      { titulo: "Rotina de fechamento", origem: "entrevista com a controladoria", campos: [
        { l: "Dias por mês conciliando versões", v: `${K.conciliacao_dias_mes} dias` }, { l: "Analistas envolvidos", v: String(base.kpis.analistas_controladoria) },
        { l: "Aprovação de indicador novo", v: "não existe", t: "texto", alerta: true } ] },
    ],
    selo: "Recebido em 1º/09/2026: cinco documentos e as planilhas de origem. Marco inicial confirmado por escrito em 2/09/2026; a contagem dos dez dias começa em 3/09.",
  };
  const parede = { nos: [
    ...docs.map((d, i) => ({ x: 250, y: 300 + i * 62, t: `${d.nome} · ${usosDoc[i]} indicadores` })),
    { x: 640, y: 424, t: `${K.celulas} usos de ${K.total} indicadores` },
    { x: 1000, y: 280, t: `EBITDA · ${r1(e.controladoria)} · ${r1(e.conselho)} · ${r1(e.banco)} mi`, ouro: 1 },
    { x: 1000, y: 380, t: `ticket · R$ ${t.tabela} · ${t.faturado} · ${t.realizado}`, ouro: 1 },
    { x: 1330, y: 330, t: `desvio do orçamento, jan a ago · ${mi(r.orcamento.desvio_ytd)}`, ouro: 1 },
    { x: 1000, y: 490, t: `mais de uma definição · ${K.divergentes} de ${K.total}`, ouro: 1 },
    { x: 1000, y: 580, t: `sem dono ${K.sem_dono} · sem fonte ${K.sem_fonte}` },
    { x: 1360, y: 540, t: `conciliação · ${K.conciliacao_dias_mes} dias por mês`, ouro: 1 },
  ], lig: [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 6], [5, 7], [7, 8], [5, 9], [5, 10], [9, 11], [6, 11]] };

  const quadros = [
    { id: "ebitda", titulo: "O EBITDA de doze meses tem três números.",
      sub: "A base é a mesma. Cada documento soma uma coisa diferente e nenhum diz o que somou.",
      barras: [
        { rot: "DRE gerencial", base: e.controladoria, partes: [] },
        { rot: "pacote do conselho", base: e.controladoria, partes: e.ajustes_conselho.map((a) => ({ t: CURTO[a.t] || a.t, v: a.v })) },
        { rot: "relatório ao banco", base: e.controladoria, partes: e.ajustes_banco.map((a) => ({ t: CURTO[a.t] || a.t, v: a.v })) } ],
      fmt: (v) => r1(v), unidade: "R$ milhões" },
    { id: "ticket", titulo: "O orçamento usou o ticket de tabela. A receita mede o que foi recebido.",
      sub: `R$ ${t.tabela - t.realizado} por aluno viram ${mi(r.orcamento.desvio_ytd)} de desvio de janeiro a agosto. Nenhuma unidade vendeu menos.`,
      barras: [["tabela", t.tabela, "preço cheio dos planos"], ["faturado", t.faturado, "depois de descontos"], ["recebido", t.realizado, "depois de inadimplência"]],
      numero: r.orcamento.desvio_ytd, numeroRot: "de desvio no orçamento, jan a ago" },
    { id: "matriz", titulo: `${K.divergentes} dos ${K.total} indicadores têm mais de uma definição.`,
      sub: `${K.sem_dono} não têm dono e ${K.sem_fonte} não têm fonte registrada. Cada ponto é um indicador em um documento; os dourados divergem.`,
      docs: docs.map((d) => d.nome), linhas: K.linhas },
    { id: "custo", titulo: "O que isso custa.",
      sub: "Cada valor diz de onde vem: o que já aconteceu na rede e o que é referência de mercado.",
      tiles: [
        { v: "3", t: "valores para o EBITDA de doze meses, sem definição escrita", e: "posição na data-base" },
        { v: mi(r.orcamento.desvio_ytd), t: "de desvio no orçamento que vem só da definição do ticket", e: "realizado, janeiro a agosto", d: 1 },
        { v: `${K.conciliacao_dias_mes} dias`, t: `por mês da controladoria conciliando versões; ${K.conciliacao_dias_ano} dias no ano`, e: "realizado" },
        { v: pc(base.setor.fpa_tempo_dados_pct, 0), t: "do tempo das equipes de planejamento vai para coletar e validar dados", e: "referência: FP&A Trends, 2025" } ] },
  ];
  const catalogo = K.linhas.map((l) => [l.nome, l.divergente ? "a definir" : "ok", l.dono ? "nomeado" : "a nomear", l.fonte ? "registrada" : "a registrar"]);
  const entregavel = {
    capa: { titulo: proj.nome, sub: `Diagnóstico e direcionamento · ${dataBase} · versão 1.0`,
      indice: ["Catálogo de 26 indicadores", "Ponte entre as versões do EBITDA", "Ficha de cada indicador", "Regra para criar ou mudar um indicador", "Donos e cadência", "Plano de 90 dias"] },
    folhas: [
      { id: "ficha", titulo: "Ficha do indicador", sub: "exemplo: EBITDA",
        linhas: [["nome oficial", "EBITDA gerencial"], ["fórmula", "receita líquida − custos e despesas operacionais, com aluguel como custo"], ["inclui", "despesas pré-operacionais das unidades novas"], ["fonte", "razão contábil, centros de custo 1 a 45"], ["dono", "diretoria financeira"], ["cadência", "mensal, até o 8º dia útil"], ["versões aceitas", "conselho (ajustado) e banco (IFRS 16), sempre com a ponte"]] },
      { id: "ponte", titulo: "Ponte entre as versões", sub: "doze meses até agosto de 2026",
        linhas: [["EBITDA gerencial", mi(e.controladoria)], ...e.ajustes_conselho.map((a) => [`+ ${a.t}`, mi(a.v)]), ["= EBITDA ajustado do conselho", mi(e.conselho)], ...e.ajustes_banco.map((a) => [`+ ${a.t}`, mi(a.v)]), ["= EBITDA do relatório ao banco (a partir do gerencial)", mi(e.banco)]] },
      { id: "regra", titulo: "Regra para criar ou mudar um indicador", sub: "aprovada pela diretoria",
        itens: ["Nenhum indicador entra em reporte sem ficha no catálogo.", "Mudança de fórmula exige ficha nova, data de início e a série refeita para trás.", "Toda versão ajustada vem com a ponte até a oficial.", "O dono do indicador responde pelo número e pela data de publicação.", "Revisão do catálogo a cada seis meses."] },
    ],
    planilha: { titulo: "catálogo.xlsx", cab: ["indicador", "definição", "dono", "fonte"], linhas: catalogo },
    painel: { titulo: "EBITDA oficial", tipo: "ebitda", valores: [e.controladoria, e.conselho, e.banco] },
    devolutiva: "Dia 9 · devolutiva de 1h30 com os sócios e a diretoria financeira",
  };
  const resultado = { numero: `${K.total}`, legenda: "indicadores com uma definição, um dono e uma fonte", sub: `${mi(r.orcamento.desvio_ytd)} de desvio do orçamento explicados pela ponte entre as definições.` };
  return { proj, n: 1, formulario, parede, quadros, entregavel, resultado, cabDiag: `Diagnóstico · Projeto 1 · ${proj.nome} · ${dataBase}` };
}

// ================================================================== Projeto 2 · segregação de funções
function projeto2(base, R, proj, dataBase) {
  const S = R.seg, s = base.setor;
  const passos = S.passos;
  const formulario = {
    total: 16 + 5 + 4,
    blocos: [
      { titulo: "Perfis de acesso", origem: "relatório de usuários e rotinas do sistema", largo: true, matriz: {
        passos: passos.map((p) => p.nome), pessoas: S.pessoas.map((p) => ({ cargo: p.cargo, acessos: passos.map((q) => p.acessos.includes(q.id)) })) } },
      { titulo: "Pagamentos, 12 meses", origem: "sistema financeiro", campos: [
        { l: "Títulos pagos", v: F.n(S.pagamentos.titulos) }, { l: "Valor pago a fornecedores", v: mi(S.pagamentos.valor) }, { l: "Fluxos de pessoa única", v: F.n(S.pagamentos.pessoa_unica_titulos) } ] },
      { titulo: "Alçadas", origem: "política financeira", campos: [
        { l: "Analista aprova até", v: F.brl(S.alcada) }, { l: "Acima disso", v: "gerente financeiro", t: "texto" }, { l: "O sistema trava acima da alçada?", v: "não", t: "texto", alerta: true } ] },
      { titulo: "Cadastro de fornecedores", origem: "histórico de alterações do sistema", campos: [
        { l: "Trocas de conta bancária", v: F.n(S.alteracoes.total) }, { l: "Confirmadas por outro canal", v: F.n(S.alteracoes.confirmadas) }, { l: "Usuários genéricos ativos", v: F.n(S.usuarios_genericos), alerta: true }, { l: "Acessos de desligados ativos", v: F.n(S.acessos_desligados_ativos), alerta: true } ] },
    ],
    selo: "Recebido em 1º/09/2026: organograma, exportação de perfis do sistema e histórico de 12 meses. Marco inicial confirmado por escrito em 2/09/2026; a contagem dos dez dias começa em 3/09.",
  };
  const parede = { nos: [
    { x: 250, y: 300, t: `${S.pessoas.length} pessoas · ${passos.length} passos` }, { x: 250, y: 370, t: "perfis de acesso do sistema" },
    { x: 250, y: 440, t: `${F.n(S.pagamentos.titulos)} pagamentos · ${mi(S.pagamentos.valor)}` }, { x: 250, y: 510, t: `${S.alteracoes.total} trocas de conta bancária` }, { x: 250, y: 580, t: `alçada de ${F.brl(S.alcada)}` },
    { x: 640, y: 400, t: "matriz pessoa × passo" },
    { x: 1000, y: 290, t: `${S.conflitos_total} conflitos em ${S.com_conflito} pessoas` },
    { x: 1000, y: 380, t: `caminho inteiro · ${S.caminho_inteiro} pessoas`, ouro: 1 },
    { x: 1360, y: 330, t: `fluxo de pessoa única · ${mi(S.pagamentos.pessoa_unica_valor)}`, ouro: 1 },
    { x: 1000, y: 490, t: `trocas sem confirmação · ${S.alteracoes.sem_confirmacao}`, ouro: 1 },
    { x: 1360, y: 470, t: `trocadas e pagas pela mesma pessoa · ${S.alteracoes.mesmo_usuario_pagou}` },
    { x: 1000, y: 590, t: `fracionados abaixo da alçada · ${S.fracionamentos.casos}`, ouro: 1 },
  ], lig: [[0, 5], [1, 5], [5, 6], [6, 7], [7, 8], [2, 8], [3, 9], [9, 10], [4, 11], [2, 11]] };

  const quadros = [
    { id: "pessoas", titulo: `${S.caminho_inteiro === 3 ? "Três" : S.caminho_inteiro} pessoas conseguem fazer sozinhas o caminho inteiro do pagamento.`,
      sub: "Cadastrar ou trocar a conta do fornecedor, aprovar e liberar no banco. Os pontos dourados são acessos incompatíveis entre si.",
      passos: passos.map((p) => p.nome), pessoas: S.pessoas },
    { id: "fluxo", titulo: `${mi(S.pagamentos.pessoa_unica_valor)} pagos em doze meses passaram por uma pessoa só.`,
      sub: `São ${F.n(S.pagamentos.pessoa_unica_titulos)} títulos, ${pc(S.pagamentos.pessoa_unica_pct)} do valor pago a fornecedores.`,
      partes: [["com segunda pessoa", S.pagamentos.segregado_valor], ["uma pessoa só", S.pagamentos.pessoa_unica_valor]] },
    { id: "meses", titulo: `${S.alteracoes.total} contas bancárias de fornecedor trocadas. ${S.alteracoes.sem_confirmacao} sem confirmação.`,
      sub: `Em ${S.alteracoes.mesmo_usuario_pagou} casos, quem trocou a conta liberou o pagamento seguinte.`,
      meses: ["set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago"], total: S.alteracoes.por_mes, conf: S.alteracoes.confirmadas_mes },
    { id: "custo", titulo: "O que está exposto.",
      sub: "Cada valor diz de onde vem: o que já aconteceu na rede e o que é referência de mercado.",
      tiles: [
        { v: mi(S.pagamentos.pessoa_unica_valor), t: "por ano em pagamentos sem segunda pessoa", e: "realizado, 12 meses", d: 1 },
        { v: F.n(S.alteracoes.sem_confirmacao), t: "trocas de conta bancária sem confirmação por outro canal", e: "realizado, 12 meses" },
        { v: F.n(S.fracionamentos.casos), t: `pagamentos fracionados logo abaixo da alçada, ${mi(S.fracionamentos.valor)} no total`, e: "realizado, 12 meses" },
        { v: `${s.acfe_faturamento_duracao_meses} meses`, t: `é quanto uma fraude de pagamento dura até ser descoberta; a perda mediana é de US$ ${s.acfe_mediana_usd_mil} mil`, e: "referência: ACFE, 2026" } ] },
  ];
  const acessos = S.pessoas.filter((p) => p.n_conflitos > 0).map((p) => {
    const tirar = [];
    if (p.caminho) tirar.push(p.acessos.includes("P") ? "liberar no banco" : "aprovar");
    if (p.acessos.includes("B") && !p.cargo.startsWith("Analista de cadastro")) tirar.push("alterar conta bancária");
    if (p.acessos.includes("P") && p.acessos.includes("Q")) tirar.push("conciliar");
    if (p.acessos.includes("L") && p.acessos.includes("A") && !p.caminho) tirar.push("aprovar o que lançou");
    return [p.cargo, [...new Set(tirar)].join(", ") || "manter, com controle compensatório"];
  });
  const entregavel = {
    capa: { titulo: proj.nome, sub: `Diagnóstico e direcionamento · ${dataBase} · versão 1.0`,
      indice: ["Matriz de funções por processo", "Acessos a retirar no sistema", "Controles compensatórios", "Regra para trocar conta bancária de fornecedor", "Alçadas travadas no sistema", "Plano de 30, 60 e 90 dias"] },
    folhas: [
      { id: "acessos", titulo: "Acessos a retirar", sub: "a TI executa; o gerente financeiro confere", linhas: acessos },
      { id: "regra", titulo: "Troca de conta bancária de fornecedor", sub: "regra aprovada pela diretoria",
        itens: ["Pedido só pelo portal do fornecedor ou por documento assinado.", "Confirmação por telefone ao contato já cadastrado, nunca ao número do pedido.", "Quem troca a conta não aprova nem libera o pagamento seguinte.", "Primeiro pagamento para conta nova passa por segunda aprovação.", "Relatório mensal de trocas conferido pela controladoria."] },
      { id: "compensa", titulo: "Controles compensatórios", sub: "onde o quadro não permite separar",
        linhas: [["tesouraria libera e concilia", "conciliação mensal conferida pela controladoria"], ["unidades aprovam compras locais", "amostra mensal de 30 notas pelo financeiro central"], ["gerente financeiro com acesso total", "log de uso revisado pela diretoria a cada trimestre"]] },
    ],
    planilha: { titulo: "matriz_de_funcoes.xlsx", cab: ["pessoa", ...passos.map((p) => p.nome)], linhas: S.pessoas.map((p) => [p.cargo, ...passos.map((q) => (p.acessos.includes(q.id) ? "●" : ""))]) },
    painel: { titulo: "Pagamentos por fluxo", tipo: "fluxo", valores: [S.pagamentos.segregado_valor, S.pagamentos.pessoa_unica_valor] },
    devolutiva: "Dia 9 · devolutiva de 1h30 com os sócios, a diretoria e a TI",
  };
  const resultado = { numero: `${S.caminho_inteiro} → 0`, legenda: "pessoas com o caminho inteiro do pagamento", sub: `${S.conflitos_total} conflitos mapeados, cada um com acesso retirado ou controle declarado.` };
  return { proj, n: 2, formulario, parede, quadros, entregavel, resultado, cabDiag: `Diagnóstico · Projeto 2 · ${proj.nome} · ${dataBase}` };
}

// ================================================================== Projeto 3 · capital de giro e custo do dinheiro
function projeto3(base, R, proj, dataBase) {
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
