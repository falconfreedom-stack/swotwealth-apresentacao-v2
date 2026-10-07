// Conteúdo comum: sócios, dez dias, fases e amostras dos 208 projetos, o Top 3.
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

export const TOP3 = [
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
