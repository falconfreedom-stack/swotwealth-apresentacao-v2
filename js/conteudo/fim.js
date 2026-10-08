// Textos das cenas finais (roteiro v1, cenas 10 a 14; telas 4.1 a 4.5): a oferta, o hub do Top 3, quem conduz, os
// 208 projetos e o fecho. (Bloco do agente S3.)
// Nada de número digitado à mão: o preço e o prazo são as condições do diagnóstico (fixos pelo briefing); as
// perguntas dos cartões vêm do TOP3, as biografias de SOCIOS (literais), as fases de FASES. Fica de fora, de
// propósito: retorno, "se paga", desconto, validade, garantia, reembolso, mensalidade, implantação; a palavra
// "garantido" não aparece. Quebras de linha autorais com " / " (js/cenas/comum.js: linhas).
import { F } from "../util.js?v=202610071930";
import { TOP3, SOCIOS, FASES, AMOSTRA } from "./comum.js?v=202610071930";

const POR_EXTENSO = { 4: "quatro", 10: "dez" };

export function FIM(base, R) {
  const preco = 10000, dias = 10;                      // um projeto, R$ 10 mil, dez dias (decisões do briefing)
  const p310 = TOP3.find((p) => p.codigo === "FIN3.10");
  const docs = POR_EXTENSO[p310.usa.length] || String(p310.usa.length);   // os quatro documentos do cartão
  const Dez = POR_EXTENSO[dias].charAt(0).toUpperCase() + POR_EXTENSO[dias].slice(1);

  // 4.1 · a oferta: O1 o que é e o que recebe · O2 quem faz e o que fica fora · O3 a pergunta · O4 a resposta
  const oferta = {
    preco: `Um projeto. / R$ ${F.n(preco)}. / ${Dez} dias.`,
    ficha1: [
      ["A rede recebe", "o mapa do custo do dinheiro, a projeção de 13 semanas e o plano de substituição de fontes, com memória de cálculo."],
      // roteiro v2 (D5): o esforço com o que a própria SWOT já afirmava (a confirmar pelos sócios)
      ["A equipe", `separa os ${docs} documentos (cerca de um dia) e participa de duas sessões: a de decisão, entre o 4º e o 6º dia, e a devolutiva de 1h30, no 9º.`],
      ["Prazo", `${POR_EXTENSO[dias]} dias corridos, a partir dos documentos completos; devolutiva no nono dia.`],
    ],
    ficha2: [
      ["Quem executa", "a tesouraria da rede. Cada ação diz se depende da empresa, de financiadores ou da credenciadora."],
      ["Não inclui", "implantação, negociação com banco ou credenciadora, contratações."],
      ["Os valores", "são estimativas, com memória de cálculo; não prometemos um número."],
    ],
    pergunta: "E se não houver / oportunidade relevante?",
    resposta: { titulo: "Mesmo assim, a rede sai com:",
      itens: ["o custo de cada fonte, medido;", "a projeção para decidir a antecipação, semana a semana;", "a confirmação, ou não, da estrutura atual."] },
  };

  // 4.2 · o hub: as outras duas lentes do Top 3 (tecla de cada cartão = app.js, TOP3_TECLA)
  const TECLA = { "FIN3.10": 1, "FIN8.2": 2, "FIN5.11": 3 };
  const CURTO = { "FIN3.10": "Custo do dinheiro", "FIN8.2": "Catálogo de indicadores", "FIN5.11": "Segregação de funções" };
  const hub = {
    titulo: "A mesma rede, / outras duas lentes.",
    cartoes: ["FIN3.10", "FIN8.2", "FIN5.11"].map((cod) => { const p = TOP3.find((x) => x.codigo === cod); return { n: p.n, tecla: TECLA[cod], codigo: cod, nome: CURTO[cod], pergunta: p.pergunta }; }),
    visto: "visto",
    duracao: "≈ 45 s",
    dica: "Toque num cartão ou tecle 2 ou 3.",
  };

  // 4.3 · quem conduz (roteiro v2, P10): os quatro nomes, cada um com UMA linha de credencial tirada literalmente
  // da biografia de SOCIOS (um trecho contínuo de uma frase; só a primeira letra vai para maiúscula). A biografia
  // inteira fica no material. Se o trecho não for achado na biografia, a linha sai vazia (nada inventado).
  const TRECHO = { joao: "engenharia de software no JP Morgan", brendon: "Cinco pós-graduações na Saint Paul",
    guilherme: "modelagem financeira em fundo de investimento", ryan: "Contador e empresário, Vava Contadores" };
  const credencial = (k) => { const s = SOCIOS[k], t = TRECHO[k], i = s.hist.toLowerCase().indexOf(t.toLowerCase());
    if (i < 0) return ""; const lit = s.hist.slice(i, i + t.length); return lit.charAt(0).toUpperCase() + lit.slice(1); };
  const socios = { rotulo: "Quem conduz o diagnóstico.",
    pessoas: ["joao", "brendon", "guilherme", "ryan"].map((k) => ({ nome: SOCIOS[k].nome, credencial: credencial(k) })) };

  // 4.4 · os 208 (v2, P11): só os nomes das fases ancorados (as contagens ficam como textura: os traços acesos de
  // cada setor); o Top 3 em ouro; amostras só na exploração (toque numa fase)
  const eco = { titulo: "208 projetos, / em dez fases.", sub: "Cada projeto é uma lente / sobre uma parte da empresa.", fases: FASES, amostras: AMOSTRA, selo: "Top 3" };

  // 4.5 · o fecho: o próximo passo
  const fecho = {
    rotulo: "Próximo passo",
    titulo: `Os números da sua rede, / em ${POR_EXTENSO[dias]} dias.`,
    acoes: ["Aprovar o diagnóstico.", `Indicar quem reúne os ${docs} documentos.`, "Marcar a data de entrega dos documentos."],
    rodape: "Documento do projeto e lista de documentos: entregues ao final.",     // v2, P12 (o apresentador usa a tecla M)
  };

  return { preco, dias, oferta, hub, socios, eco, fecho };
}
