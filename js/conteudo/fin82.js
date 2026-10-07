import { F } from "../util.js?v=202610071930";
import { r1, mi, mil, pc } from "./formato.js?v=202610071930";

const CURTO = { "despesas pré-operacionais": "pré-operacionais", "eventos não recorrentes": "não recorrentes", "aluguéis fora do EBITDA (IFRS 16)": "aluguéis (IFRS 16)" };

// ================================================================== Projeto 1 · catálogo de indicadores
export function projeto1(base, R, proj, dataBase) {
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
