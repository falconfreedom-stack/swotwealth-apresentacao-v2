import { F } from "../util.js?v=202610081530";
import { mi, pc } from "./formato.js?v=202610081530";

// ================================================================== FIN5.11 · segregação de funções (rede de óticas)
// O financeiro central (16 pessoas, 6 passos do pagamento) e um ângulo de loja (estornos de venda), sem mudar a matriz.
export function projeto2(base, R, proj, dataBase) {
  const S = R.seg, L = S.lojas || base.segregacao.lojas, ref = base.referencias;
  const passos = S.passos;
  const n = (x) => F.n(x);
  const formulario = {
    total: 30,
    blocos: [
      { titulo: "Perfis de acesso", origem: "relatório de usuários e rotinas do sistema financeiro", largo: true, matriz: {
        passos: passos.map((p) => p.nome), pessoas: S.pessoas.map((p) => ({ cargo: p.cargo, acessos: passos.map((q) => p.acessos.includes(q.id)) })) } },
      { titulo: "Pagamentos, 12 meses", origem: "sistema financeiro", campos: [
        { l: "Títulos pagos", v: n(S.pagamentos.titulos) }, { l: "Valor pago a fornecedores", v: mi(S.pagamentos.valor) }, { l: "Fluxos de pessoa única", v: n(S.pagamentos.pessoa_unica_titulos) } ] },
      { titulo: "Alçadas", origem: "política financeira", campos: [
        { l: "Analista aprova até", v: F.brl(S.alcada) }, { l: "Acima disso", v: "gerente financeiro", t: "texto" }, { l: "O sistema trava acima da alçada?", v: "não", t: "texto", alerta: true } ] },
      { titulo: "Cadastro de fornecedores", origem: "histórico de alterações do sistema", campos: [
        { l: "Trocas de conta bancária", v: n(S.alteracoes.total) }, { l: "Confirmadas por outro canal", v: n(S.alteracoes.confirmadas) }, { l: "Usuários genéricos ativos", v: n(S.usuarios_genericos), alerta: true }, { l: "Acessos de desligados ativos", v: n(S.acessos_desligados_ativos), alerta: true } ] },
      { titulo: "Lojas: estornos de venda", origem: "registro de cancelamentos do sistema das lojas", campos: [
        { l: "Estornos de venda paga", v: n(L.estornos_12m.total) }, { l: "Valor estornado", v: mi(L.estornos_12m.valor) }, { l: "Feitos e aprovados pelo mesmo usuário", v: n(L.estornos_mesmo_usuario.total), alerta: true }, { l: "Senha do gerente em uso simultâneo", v: `${L.lojas_com_senha_de_gerente_em_uso_simultaneo} lojas`, t: "texto", alerta: true } ] },
    ],
    selo: "Recebido em 1º/09/2026: organograma, exportação de perfis dos dois sistemas e histórico de 12 meses. Marco inicial confirmado por escrito em 2/09/2026; a contagem dos dez dias começa em 3/09.",
  };
  const parede = { nos: [
    { x: 250, y: 290, t: `${S.pessoas.length} pessoas · ${passos.length} passos` }, { x: 250, y: 350, t: "perfis de acesso dos sistemas" },
    { x: 250, y: 410, t: `${n(S.pagamentos.titulos)} pagamentos · ${mi(S.pagamentos.valor)}` }, { x: 250, y: 470, t: `${S.alteracoes.total} trocas de conta bancária` },
    { x: 250, y: 530, t: `alçada de ${F.brl(S.alcada)}` }, { x: 250, y: 590, t: `${n(L.estornos_12m.total)} estornos nas lojas` },
    { x: 640, y: 420, t: "matriz pessoa × passo" },
    { x: 1000, y: 290, t: `${S.conflitos_total} conflitos em ${S.com_conflito} pessoas` },
    { x: 1000, y: 380, t: `caminho inteiro · ${S.caminho_inteiro} pessoas`, ouro: 1 },
    { x: 1360, y: 330, t: `fluxo de pessoa única · ${mi(S.pagamentos.pessoa_unica_valor)}`, ouro: 1 },
    { x: 1000, y: 490, t: `trocas sem confirmação · ${S.alteracoes.sem_confirmacao}`, ouro: 1 },
    { x: 1360, y: 470, t: `trocadas e pagas pela mesma pessoa · ${S.alteracoes.mesmo_usuario_pagou}` },
    { x: 1000, y: 590, t: `fracionados abaixo da alçada · ${S.fracionamentos.casos}`, ouro: 1 },
    { x: 1360, y: 600, t: `estorno sem segunda pessoa · ${n(L.estornos_mesmo_usuario.total)}`, ouro: 1 },
  ], lig: [[0, 6], [1, 6], [6, 7], [7, 8], [8, 9], [2, 9], [3, 10], [10, 11], [4, 12], [2, 12], [5, 13], [1, 13]] };

  const qPessoas = { id: "pessoas", titulo: `${S.caminho_inteiro === 3 ? "Três" : S.caminho_inteiro} pessoas conseguem fazer sozinhas o caminho inteiro do pagamento.`,
    sub: "Cadastrar ou trocar a conta do fornecedor, aprovar e liberar no banco. Os pontos dourados são acessos incompatíveis entre si.",
    passos: passos.map((p) => p.nome), pessoas: S.pessoas };
  const qFluxo = { id: "fluxo", titulo: `${mi(S.pagamentos.pessoa_unica_valor)} pagos em doze meses passaram por uma pessoa só.`,
    sub: `São ${n(S.pagamentos.pessoa_unica_titulos)} títulos, ${pc(S.pagamentos.pessoa_unica_pct)} do valor pago. Metade é o aluguel mínimo dos shoppings: uma pessoa lança, aprova e libera.`,
    partes: [["com segunda pessoa", S.pagamentos.segregado_valor], ["uma pessoa só", S.pagamentos.pessoa_unica_valor]] };
  const qMeses = { id: "meses", titulo: `${S.alteracoes.total} contas bancárias de fornecedor trocadas. ${S.alteracoes.sem_confirmacao} sem confirmação.`,
    sub: `Em ${S.alteracoes.mesmo_usuario_pagou} casos, quem trocou a conta liberou o pagamento seguinte. Trocas por cessão a factoring são legítimas e também pedem confirmação.`,
    meses: ["set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago"], total: S.alteracoes.por_mes, conf: S.alteracoes.confirmadas_mes };
  const quadros = [qPessoas, qFluxo, qMeses,
    { id: "custo", titulo: "O que está exposto.",
      sub: "Cada valor diz de onde vem: o que já aconteceu na rede e o que é referência de mercado.",
      tiles: [
        { v: mi(S.pagamentos.pessoa_unica_valor), t: "por ano em pagamentos sem segunda pessoa", e: "realizado, 12 meses", d: 1 },
        { v: n(L.estornos_mesmo_usuario.total), t: `estornos de venda feitos e aprovados pelo mesmo usuário nas lojas; ${mi(L.estornos_mesmo_usuario.valor)}`, e: "realizado, 12 meses" },
        { v: n(S.fracionamentos.casos), t: `grupos de pagamentos ao mesmo fornecedor, no mesmo dia, cada um logo abaixo da alçada; ${mi(S.fracionamentos.valor)}`, e: "realizado, 12 meses; a conferir um a um" },
        { v: `${ref.acfe_faturamento_duracao_meses.v} meses`, t: `é quanto um esquema de pagamento a fornecedor dura, em mediana, até ser descoberto`, e: "referência: ACFE, 2026" } ] },
  ];
  // versão compacta, para a lente opcional (roteiro v1, seção 4.2, L2.0 a L2.3): [K] = k, [L] = l, parada com o
  // nome do roteiro; no quadro das trocas, sem o número em cada barra (≤ 3 números novos por tela).
  const intro = { rotulo: `${proj.codigo} · ${proj.nome}`, k: "Quem consegue pagar sozinho." };
  const compacto = [
    { ...qPessoas, k: qPessoas.titulo.replace(" o caminho", " / o caminho"), l: "Cadastrar ou trocar a conta do fornecedor, aprovar e liberar no banco. Dourado: acessos incompatíveis.", parada: "l2-pessoas" },
    { ...qFluxo, k: qFluxo.titulo.replace(" passaram", " / passaram"), l: "Metade é aluguel de shopping: uma pessoa lança, aprova e libera.", parada: "l2-fluxo" },
    { ...qMeses, k: qMeses.titulo.replace(" trocadas. ", " trocadas. / "), l: `Em ${S.alteracoes.mesmo_usuario_pagou} casos, quem trocou a conta liberou o pagamento.`, parada: "l2-fim", semValores: true },
  ];
  const acessos = S.pessoas.filter((p) => p.n_conflitos > 0).map((p) => {
    const tirar = [];
    if (p.caminho) tirar.push(p.acessos.includes("P") ? "liberar no banco" : "aprovar");
    if (p.acessos.includes("B") && !p.cargo.startsWith("Analista de cadastro")) tirar.push("alterar conta bancária");
    if (p.acessos.includes("P") && p.acessos.includes("Q")) tirar.push("conciliar");
    if (p.acessos.includes("L") && p.acessos.includes("A") && !p.caminho) tirar.push(p.acessos.includes("C") ? "aprovar" : "aprovar o que lançou");
    return [p.cargo, [...new Set(tirar)].join(", ") || "manter, com controle compensatório"];
  });
  const entregavel = {
    capa: { titulo: proj.nome, sub: `Diagnóstico e direcionamento · ${dataBase} · versão 1.0`,
      indice: ["Matriz de funções do pagamento", "Acessos a retirar nos sistemas", "Controles compensatórios", "Regra para trocar conta bancária de fornecedor", "Estornos e descontos nas lojas", "Plano de 30, 60 e 90 dias"] },
    folhas: [
      { id: "acessos", titulo: "Acessos a retirar", sub: "a TI executa; o gerente financeiro confere", linhas: acessos },
      { id: "regra", titulo: "Troca de conta bancária de fornecedor", sub: "regra para aprovar em ata",
        itens: ["Pedido só pelo portal do fornecedor ou por documento assinado; cessão a factoring, só com a notificação de cessão.", "Confirmação por telefone ao contato já cadastrado, nunca ao número que veio no pedido.", "Quem troca a conta não aprova nem libera o pagamento seguinte.", "Primeiro pagamento para conta nova passa por segunda aprovação.", "Relatório mensal de trocas conferido pela controladoria."] },
      { id: "compensa", titulo: "Controles compensatórios", sub: "onde o quadro não permite separar",
        linhas: [["tesouraria libera e concilia", "conciliação mensal conferida pela controladoria"], ["gerente financeiro libera o aluguel dos shoppings", "lista de boletos do mês aprovada pela diretora antes da liberação"], ["retaguarda cadastra prestadores das lojas", "amostra mensal de 30 notas conferida pelo contas a pagar"], ["gerente de loja aprova estorno e desconto", "senha pessoal por gerente; relatório diário de estornos; acima de R$ 1.000, segunda aprovação"], ["analista sênior cobre férias", "acessos temporários com data de fim, revistos na volta"]] },
    ],
    legendas: { f0: ["A lista", "Cada acesso a retirar, por pessoa, para a TI executar."], f1: ["A regra", "Pronta para aprovar em ata e colocar no sistema."] },
    planilha: { titulo: "matriz_de_funcoes.xlsx", cab: ["pessoa", ...passos.map((p) => p.nome)], linhas: S.pessoas.map((p) => [p.cargo, ...passos.map((q) => (p.acessos.includes(q.id) ? "●" : ""))]) },
    painel: { titulo: "Pagamentos por fluxo", tipo: "fluxo", valores: [S.pagamentos.segregado_valor, S.pagamentos.pessoa_unica_valor] },
    devolutiva: "Dia 9 · devolutiva de 1h30 com os sócios da rede, a diretoria financeira e a TI",
  };
  const resultado = { numero: `${S.caminho_inteiro} → 0`, legenda: "pessoas com o caminho inteiro do pagamento, no desenho entregue", sub: `${S.conflitos_total} conflitos mapeados, cada um com o acesso a retirar ou o controle a declarar. A TI da rede executa a lista.` };
  return { proj, n: 2, formulario, parede, quadros, compacto, intro, entregavel, resultado, cabDiag: `Diagnóstico · ${proj.codigo} · ${proj.nome} · rede ilustrativa · ${dataBase}` };
}
