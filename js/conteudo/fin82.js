import { F } from "../util.js?v=202610071930";
import { r1, mi, pc } from "./formato.js?v=202610071930";

const CURTO = { "despesas pré-operacionais": "pré-operacionais", "eventos não recorrentes": "não recorrentes", "aluguel fixo fora do EBITDA (IFRS 16)": "aluguel fixo (IFRS 16)" };

// ================================================================== FIN8.2 · catálogo de indicadores (rede de óticas)
// A divergência própria da ótica: o painel conta o pedido no dia da venda; o DRE reconhece a receita na entrega
// dos óculos, sem os cancelados. Nada disso é perda de caixa: é o orçamento medindo uma coisa e o DRE outra.
export function projeto1(base, R, proj, dataBase) {
  const r = R.rede, K = R.kpis, e = r.ebitda, v = r.venda;
  const docs = K.docs;
  const usosDoc = docs.map((d, i) => K.linhas.filter((l) => l.usos[i]).length);
  const pl = (x) => Math.round(x / 1000);           // R$ mil por loja e mês
  const fpa = base.referencias.fpa_tempo_dados_pct;
  const formulario = {
    total: 31,
    blocos: [
      { titulo: "Documentos recebidos", origem: "enviados pela diretoria financeira", largo: true, tabela: {
        cab: ["documento", "cadência", "quem prepara", "indicadores"],
        linhas: docs.map((d, i) => [d.nome, d.cadencia, d.quem, String(usosDoc[i])]) } },
      { titulo: "EBITDA de 12 meses", origem: "pela definição de cada documento", campos: [
        { l: "DRE gerencial", v: mi(e.controladoria) }, { l: "Pacote do conselho", v: mi(e.conselho) }, { l: "Relatório de covenants", v: mi(e.banco) }, { l: "Definição escrita", v: "não existe", t: "texto", alerta: true } ] },
      { titulo: "Venda de janeiro a agosto", origem: "como aparece em cada documento", campos: [
        { l: "Painel de vendas", v: mi(v.pedidos) }, { l: "Pacote do conselho", v: mi(v.conselho) }, { l: "DRE gerencial", v: mi(v.receita) }, { l: "Definição escrita", v: "não existe", t: "texto", alerta: true } ] },
      { titulo: "Do pedido à entrega", origem: "sistema das lojas e do laboratório", campos: [
        { l: "Cancelados antes da entrega", v: mi(v.cancelados) }, { l: "Óculos a entregar em 31/08", v: mi(v.a_entregar_fim) },
        { l: "Prazo médio até a entrega", v: "7 dias corridos", t: "texto" }, { l: "Meta e orçamento medidos em", v: "pedidos", t: "texto", alerta: true } ] },
      { titulo: "Rotina de fechamento", origem: "entrevista com a controladoria", campos: [
        { l: "Dias por mês conciliando versões", v: `${K.conciliacao_dias_mes} dias` }, { l: "Analistas envolvidos", v: String(base.kpis.analistas_controladoria) },
        { l: "Quem concilia painel e DRE", v: "ninguém nomeado", t: "texto", alerta: true }, { l: "Aprovação de indicador novo", v: "não existe", t: "texto", alerta: true } ] },
    ],
    selo: "Recebido em 1º/09/2026: cinco documentos, as planilhas de origem e a exportação de pedidos do sistema das lojas. Marco inicial confirmado por escrito em 2/09/2026; a contagem dos dez dias começa em 3/09.",
  };
  const parede = { nos: [
    ...docs.map((d, i) => ({ x: 250, y: 300 + i * 62, t: `${d.nome} · ${usosDoc[i]} indicadores` })),
    { x: 640, y: 424, t: `${K.celulas} usos de ${K.total} indicadores` },
    { x: 1000, y: 280, t: `EBITDA · ${r1(e.controladoria)} · ${r1(e.conselho)} · ${r1(e.banco)} mi`, ouro: 1 },
    { x: 1000, y: 380, t: `venda jan a ago · ${r1(v.pedidos)} · ${r1(v.conselho)} · ${r1(v.receita)} mi`, ouro: 1 },
    { x: 1330, y: 330, t: `desvio do orçamento, jan a ago · ${mi(r.orcamento.desvio_ytd)}`, ouro: 1 },
    { x: 1000, y: 490, t: `mais de uma definição · ${K.divergentes} de ${K.total}`, ouro: 1 },
    { x: 1000, y: 580, t: `sem dono ${K.sem_dono} · sem fonte ${K.sem_fonte}` },
    { x: 1360, y: 540, t: `conciliação · ${K.conciliacao_dias_mes} dias por mês`, ouro: 1 },
  ], lig: [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 6], [5, 7], [7, 8], [5, 9], [5, 10], [9, 11], [6, 11]] };

  const qEbitda = { id: "ebitda", titulo: "O EBITDA de doze meses tem três números.",
    sub: "Mesma base. O conselho exclui pré-operacionais e não recorrentes; o banco, o aluguel fixo das lojas (IFRS 16). Nenhum documento escreve isso.",
    barras: [
      { rot: "DRE gerencial", base: e.controladoria, partes: [] },
      { rot: "pacote do conselho", base: e.controladoria, partes: e.ajustes_conselho.map((a) => ({ t: CURTO[a.t] || a.t, v: a.v })) },
      { rot: "relatório ao banco", base: e.controladoria, partes: e.ajustes_banco.map((a) => ({ t: CURTO[a.t] || a.t, v: a.v })) } ],
    fmt: (x) => r1(x), unidade: "R$ milhões" };
  const qVenda = { id: "venda", titulo: "As lojas bateram a meta. O DRE ficou abaixo do orçamento.",
    sub: "O painel conta o pedido no dia da venda; o DRE, os óculos entregues, sem cancelados. O desvio vem da definição.",
    barras: [["orçamento", pl(v.por_loja_mes.orcamento), "soma das metas das lojas"], ["painel de vendas", pl(v.por_loja_mes.pedidos), "pedidos, no dia da venda"], ["DRE gerencial", pl(v.por_loja_mes.receita), "óculos entregues"]],
    gapRot: "por loja, todo mês", numero: r.orcamento.desvio_ytd, numeroRot: "de desvio no orçamento, jan a ago" };
  const qMatriz = { id: "matriz", titulo: `${K.divergentes} dos ${K.total} indicadores têm mais de uma definição.`,
    sub: `${K.sem_dono} não têm dono e ${K.sem_fonte} não têm fonte registrada. Cada ponto é um indicador em um documento; os dourados divergem.`,
    docs: docs.map((d) => d.nome), linhas: K.linhas };
  const tDef = { v: mi(r.orcamento.desvio_ytd), t: "de desvio no orçamento que vem só da definição de venda", e: "realizado, jan a ago; não é perda de caixa", d: 1 };
  const tConc = { v: `${K.conciliacao_dias_mes} dias`, t: `por mês da controladoria conciliando versões; ${K.conciliacao_dias_ano} dias no ano`, e: "realizado" };
  const quadros = [qEbitda, qVenda, qMatriz,
    { id: "custo", titulo: "O que está em jogo.",
      sub: "Cada valor diz de onde vem: o que já aconteceu na rede e o que é referência de mercado.",
      tiles: [
        { v: "3", t: "valores para o EBITDA de doze meses, sem definição escrita", e: "posição na data-base" }, tDef, tConc,
        { v: pc(fpa.v, 0), t: "do tempo das equipes de planejamento vai para coletar e validar dados", e: `referência: ${fpa.fonte}` } ] },
  ];
  // versão compacta, para a lente opcional depois da oferta (~45 s)
  const compacto = [
    { ...qEbitda, sub: "O conselho exclui pré-operacionais e não recorrentes; o banco, o aluguel fixo (IFRS 16).", dur: 15 },
    { ...qVenda, sub: "O painel conta o pedido; o DRE, os óculos entregues. O desvio vem da definição.", dur: 15 },
    { id: "custo", titulo: "Cada número ganha uma definição, um dono e uma fonte.",
      sub: "Em dez dias: catálogo de 26 indicadores, as duas pontes e a regra para mudar um indicador.", dur: 11,
      tiles: [{ v: `${K.divergentes} de ${K.total}`, t: `indicadores com mais de uma definição; ${K.sem_dono} sem dono`, e: "posição na data-base", d: 1 }, tConc] },
  ];
  const catalogo = K.linhas.map((l) => [l.nome, l.divergente ? "a definir" : "ok", l.dono ? "nomeado" : "a nomear", l.fonte ? "registrada" : "a registrar"]);
  const entregavel = {
    capa: { titulo: proj.nome, sub: `Diagnóstico e direcionamento · ${dataBase} · versão 1.0`,
      indice: ["Catálogo de 26 indicadores", "Ponte entre as versões do EBITDA", "Ponte entre a venda do painel e a receita do DRE", "Ficha de cada indicador", "Regra para criar ou mudar um indicador", "Donos, cadência e plano de 90 dias"] },
    folhas: [
      { id: "ponte", titulo: "Ponte entre as versões do EBITDA", sub: "doze meses até agosto de 2026",
        linhas: [["EBITDA gerencial (DRE)", mi(e.controladoria)], ...e.ajustes_conselho.map((a) => [`+ ${a.t}`, mi(a.v)]), ["= EBITDA ajustado do conselho", mi(e.conselho)], ...e.ajustes_banco.map((a) => [`+ ${a.t}, a partir do gerencial`, mi(a.v)]), ["= EBITDA do relatório ao banco", mi(e.banco)]] },
      { id: "ficha", titulo: "Ficha do indicador", sub: "exemplo: receita bruta",
        linhas: [["nome oficial", "Receita bruta"], ["fórmula", "valor dos óculos e produtos entregues no mês, antes de impostos e devoluções"], ["reconhecida", "na entrega ao cliente (ordem de serviço encerrada)"], ["não inclui", "pedidos cancelados e óculos no laboratório ou à espera de retirada"], ["fonte", "sistema das lojas, ordens encerradas, conciliado com o razão"], ["dono", "controladoria"], ["cadência", "mensal, até o 5º dia útil; parcial toda segunda-feira"], ["versões aceitas", "venda do painel (pedidos), sempre com a ponte até a receita"]] },
      { id: "ponte_venda", titulo: "Ponte entre a venda e a receita", sub: "janeiro a agosto de 2026",
        linhas: [["Pedidos no painel", mi(v.pedidos)], [`− pedidos cancelados antes da entrega (${pc(v.cancel_pct)})`, mi(v.cancelados)], ["− aumento dos óculos a entregar, de 31/12 a 31/08", mi(v.aumento_a_entregar)], ["= receita bruta no DRE gerencial", mi(v.receita)], ["Orçamento de receita (soma das metas)", mi(v.orcamento)], ["Desvio que vem só da definição", mi(r.orcamento.desvio_ytd)], ["Por loja, por mês, em média", `R$ ${F.n(pl(v.gap_por_loja_mes))} mil`]] },
      { id: "regra", titulo: "Regra para criar ou mudar um indicador", sub: "para aprovar em ata",
        itens: ["Nenhum indicador entra em reporte sem ficha no catálogo.", "Mudança de fórmula exige ficha nova, data de início e a série refeita para trás.", "Toda versão ajustada vem com a ponte até a oficial.", "A meta das lojas continua em pedidos; o orçamento de receita desconta a taxa esperada de cancelamento e a variação dos óculos a entregar, com a ponte publicada todo mês.", "O dono do indicador responde pelo número e pela data de publicação.", "Revisão do catálogo a cada seis meses."] },
    ],
    legendas: { f0: ["A ponte", "Cada versão do EBITDA, com o que somou."], f1: ["A ficha", "A definição oficial, pronta para aprovar em ata."] },
    planilha: { titulo: "catálogo.xlsx", cab: ["indicador", "definição", "dono", "fonte"], linhas: catalogo },
    painel: { titulo: "EBITDA oficial", tipo: "ebitda", valores: [e.controladoria, e.conselho, e.banco] },
    devolutiva: "Dia 9 · devolutiva de 1h30 com os sócios e as diretorias financeira e comercial",
  };
  const resultado = { numero: `${K.total}`, legenda: "indicadores com uma definição, um dono e uma fonte", sub: `${mi(r.orcamento.desvio_ytd)} de desvio do orçamento explicados pela ponte entre pedido e entrega.` };
  return { proj, n: 1, formulario, parede, quadros, compacto, entregavel, resultado, cabDiag: `Diagnóstico · ${proj.codigo} · ${proj.nome} · ${dataBase}` };
}
