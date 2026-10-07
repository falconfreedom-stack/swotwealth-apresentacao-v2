import { F } from "../util.js?v=202610071930";
import { r1, mi, mil, pc } from "./formato.js?v=202610071930";

// ================================================================== Projeto 2 · segregação de funções
export function projeto2(base, R, proj, dataBase) {
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
