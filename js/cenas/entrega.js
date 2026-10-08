// A entrega e "Isto é um projeto." (roteiro v1, cenas 8 e 9; v2: P6 e P8). Bloco do agente S4.
// 8.0 · o gráfico das semanas sai; as peças pousam sobre o vidro enquanto o ponteiro corre os dez dias de trabalho:
//   "Dez dias. / Três documentos."
// 8.1–8.3 · a câmera desce de frente para cada documento (o mapa, a projeção, o plano): uma folha legível por vez,
//   as vizinhas voltam a ser vidro apagado, e uma linha com número ganha o ouro do achado.
// 8.4 · a câmera volta à vista do instrumento, as peças inteiras: "No décimo dia, a rede sabe:".
// 9.1 · as peças se apagam, a câmera sobe ao mostrador inteiro (os 208 índices seguem como traços apagados) e, no
//   trajeto, só o do FIN3.10 acende em ouro: "Isto é um projeto." (a oferta começa desse mesmo quadro).
// Ritmo (estudo/pesquisa/20-pitch-e-motion.md B.3 e C.2; estudo/revisoes/40-ritmo-original.md, item 9): cada bloco
// no tempo de leitura (leitor), a parada no fim das entradas e o hold só de leitura; [L] = legenda só do modo assistir.
// Textos e números: ctx.C.entrega (js/conteudo/fin310.js); o que faltar é montado aqui, com as mesmas contas, a partir
// de ctx.R.fin310. Nada de número digitado à mão.
import { mi, mil, pc } from "../conteudo/formato.js?v=202610071930";
import * as K from "./comum.js?v=202610071930";
const { gsap, folha, parada, leitor, linhas, revelar, recolher, aparecer } = K;

const TAU = Math.PI * 2;
const LOGO = K.LOGO_ESC || "midia/marca/logo_horizontal.svg", LOGO_CLARO = "midia/marca/logo_horizontal_claro.svg";
// O instrumento à direita, as peças deitadas na metade de baixo do mostrador; a coluna da esquerda, no escuro, é do texto.
export const VISTA = { x: -1.0, y: 3.7, z: 0.9, tx: -0.95, ty: 0, tz: 0.12, fov: 34 };
// "Isto é um projeto.": o mostrador inteiro, de cima (o mesmo plano em que a oferta começa).
const PLANO_UM = K.PLANO_UM || { x: -0.42, y: 4.2, z: 0.55, tx: -0.42, ty: 0, tz: 0.06, fov: 34 };
// a luz: a das semanas (onde a cena anterior termina), a da entrega e a da oferta (1,0 rad, aqui uma volta inteira
// adiante: o mesmo ângulo, sem girar para trás)
const LUZ_SEM = 6.4, LUZ = 7.0, LUZ_OFERTA = 1.0 + TAU;

// ---------------------------------------------------------------------------------------------- as peças
// A capa, os três documentos do card e a etiqueta escura da devolutiva, deitadas sobre o vidro em volta do centro
// (os ponteiros, a marca e o 12 continuam à vista). Medidas no mundo; cada folha é montada no tamanho em que é lida
// de frente (FOLHA_PX de altura no palco, 74% da tela), para o texto sair nítido e com ≥ 22 px.
const ALT = 0.5, FOLHA_PX = 800, OCUPA = FOLHA_PX / 1080, FOV_DOC = 26;
const PECAS = [
  { id: "capa", x: -0.70, z: 0.04, w: 0.40, h: ALT, giro: 0.08, y: 0.021 },
  { id: "mapa", x: -0.42, z: 0.53, w: 0.40, h: ALT, giro: -0.05, y: 0.024 },
  { id: "projecao", x: 0.04, z: 0.66, w: 0.42, h: ALT, giro: 0.04, y: 0.027 },
  { id: "plano", x: 0.50, z: 0.50, w: 0.40, h: ALT, giro: -0.07, y: 0.030 },
  { id: "devolutiva", x: 0.66, z: -0.08, w: 0.50, h: 0.13, giro: 0.05, y: 0.033, escura: true },
];
const DOCS = ["mapa", "projecao", "plano"];
// de frente, a folha lida fica à direita (centro a ~1425 px); a coluna da esquerda fica para o [K] e o [L]
const DESLOC_PX = 465;
const camDoc = (M, p) => M.planoFrente(p.para, OCUPA, FOV_DOC, -DESLOC_PX * p.h / FOLHA_PX, 0);
// a tinta das folhas: na vista do instrumento elas são textura (texto a ~6 px, impresso claro); de frente, a folha
// lida ganha a tinta inteira (o resto do documento continua atenuado, classe `at`, e a linha destacada, `fo`,
// só acende com o ouro)
const TINTA_LONGE = 0.42;

// quebras autorais dos títulos [K] que chegam sem " / " (cada linha cabe na coluna da esquerda)
const QUEBRAS = { "O mapa do custo do dinheiro": "O mapa do custo / do dinheiro", "A projeção de 13 semanas": "A projeção / de 13 semanas",
  "O plano de substituição de fontes": "O plano de substituição / de fontes", "Isto é um projeto.": "Isto é / um projeto." };
const quebra = (s) => QUEBRAS[s] || s;
// Um bloco de texto da coluna: fica escondido até a sua vez (nenhuma ponta de letra aparece na máscara antes de
// entrar), entra por linha (revelar) e sai pelo alto da máscara (recolher), sumindo em seguida para nenhuma ponta de
// letra (ç, p, j) ficar sob o texto que entra no mesmo lugar.
const mostrar = (tl, bloco, t) => tl.set(bloco, { opacity: 1 }, t);
const tirar = (tl, bloco, t) => { recolher(tl, [...bloco.querySelectorAll("h1, .t-lead")], t); tl.to(bloco, { opacity: 0, duration: 0.15, ease: "none" }, t + 0.4); };

// ---------------------------------------------------------------------------------------------- os dados
// ctx.C.entrega (fin310.js); cada pedaço que faltar sai de ctx.R.fin310 com as contas de fin310.js.
// Três ajustes de texto, aqui e não no conteúdo: a legenda da projeção leva a fala de 8.2 do roteiro v2 (P8: quem
// atualiza a planilha; a cadência fica na aba da planilha); a legenda do plano fica em ≤ 50 caracteres
// (40-ritmo-original.md, item 9); o rodapé do plano diz "caixa médio menor" (v2, P6).
function dados(ctx) {
  const C = ctx.C || {}, E = C.entrega || {}, P = E.pecas || {}, Z = (ctx.R && ctx.R.fin310) || {}, proj = C.proj || { codigo: "FIN3.10", nome: "Capital de giro e custo do dinheiro", curto: "Custo do dinheiro" };
  const H = (Z.custoDoDinheiro || {}).hoje || {}, P13 = Z.projecao13 || {}, ev = ((Z.estresses || {}).vendas || {}).plano || {}, tot = Z.totais || {};
  const ROT = { antecipacao: "antecipação", giro_a: "giro · Banco A", giro_b: "giro · Banco B", equip_c: "equipamentos", garantida: "conta garantida" };
  const fontes = () => [...(H.fontes || [])].sort((a, b) => b.taxa_efetiva_aa - a.taxa_efetiva_aa);
  const mapa = P.mapa || { k: "O mapa do custo do dinheiro", l: "cada fonte, com saldo, taxa efetiva e custo", titulo: "Mapa do custo do dinheiro",
    sub: "12 meses · saldo médio, taxa efetiva e custo", cab: ["fonte", "saldo médio", "taxa ao ano", "custo no ano"],
    linhas: [...fontes().map((f) => ({ v: [ROT[f.id] || f.nome, mi(f.saldo_medio, 1), pc(f.taxa_efetiva_aa), mi(f.custo_anual, 2)] })),
      { v: ["total", mi(H.saldo_medio_total, 1), pc(H.taxa_media_ponderada_aa), mi(H.custo_dinheiro_anual, 2)], total: true, dest: true }],
    rodape: H.aplicacao ? `A aplicação rende ${pc(H.aplicacao.taxa_aa)} ao ano. Antes de IR/CSLL.` : "" };
  const sem = (P13.plano || {}).semanas || [], iMin = sem.reduce((k, w, i, a) => (w.saldo_minimo < a[k].saldo_minimo ? i : k), 0);
  const projecao = { ...(P.projecao || { k: "A projeção de 13 semanas", arquivo: "projecao_13_semanas.xlsx", cab: ["semana", "hoje", "com a regra", "vendas −15%"],
    linhas: ((P13.hoje || {}).semanas || []).map((w, i) => [`${i + 1}`, mi(w.saldo_minimo, 2), mi(sem[i].saldo_minimo, 2), mi((ev.semanas_min || [])[i] || 0, 2)]), destaque: iMin }),
    l: "a tesouraria atualiza; a devolutiva mostra como", nota: "refeita toda segunda-feira" };
  const plano0 = P.plano || { k: "O plano de substituição de fontes", titulo: "Plano de substituição de fontes", sub: "em ordem de execução · valores anuais estimados",
    linhas: (Z.acoes || []).map((a) => ({ t: a.titulo, q: a.prazo, v: mil(a.valor_anual) })), totalRot: "Total estimado por ano", total: mi(tot.economia_anual_estimada || 0, 2),
    rodape: "Memória de cálculo de cada valor no anexo." };
  const plano = { ...plano0, l: "valor, de quem depende, prazo e memória de cálculo", rodape: String(plano0.rodape || "").replace("caixa usado", "caixa médio menor") };
  const capa = P.capa || { titulo: proj.nome, sub: "Diagnóstico e direcionamento · rede ilustrativa", indice: ["Mapa do custo do dinheiro", "Projeção de 13 semanas", "Plano de substituição de fontes", "Memória de cálculo"] };
  return { proj, capa, mapa, projecao, plano,
    devolutiva: (P.devolutiva && P.devolutiva.t) || "devolutiva · dia 9",
    abre: E.abre || "Dez dias. / Três documentos.", abreLeg: E.abreLeg || "e uma devolutiva com os sócios no nono dia.",
    sabe: E.sabe || "No décimo dia, a rede sabe:",
    sabeLista: E.sabeLista || ["quanto custa cada fonte de dinheiro;", "quanto antecipar em cada semana;", "que decisões tomar, e de quem depende cada uma."] };
}

// ---------------------------------------------------------------------------------------------- o HTML das folhas
// De frente, lê-se o rótulo da rede ilustrativa e, quando o ouro chega, a linha destacada (`fo`; na planilha, com o
// cabeçalho, que diz o que é cada número). O resto do documento fica atenuado (`at`, opacidade 0,4): a textura do
// documento inteiro, sem pedir leitura; o título da folha também, porque o [K] da coluna já o diz (e a legenda do
// mapa diz as colunas).
const cab = (E) => `<div class="cab"><img src="${LOGO}" alt=""><span>${E.proj.codigo} · rede ilustrativa</span></div>`;
const HTML = {
  capa: (E) => `<div class="en-capa"><div class="tinta"><img src="${LOGO_CLARO}" alt="SWOT WEALTH"><p class="cod">${E.proj.codigo}</p><h2>${E.capa.titulo}</h2>
    <p class="sub">${E.capa.sub}</p><ol>${E.capa.indice.map((x) => `<li>${x}</li>`).join("")}</ol></div></div>`,
  mapa: (E) => { const m = E.mapa;
    const lin = (l) => `<div class="lin${l.total ? " tot fo" : " at"}">${l.v.map((v) => `<span>${v}</span>`).join("")}${l.total ? `<i class="risco"></i>` : ""}</div>`;
    return `<div class="en-pg en-mapa"><div class="tinta">${cab(E)}<h2 class="at">${m.titulo}</h2><p class="sub at">${m.sub}</p>
      <div class="tab"><div class="lin cabt at">${m.cab.map((h) => `<span>${h}</span>`).join("")}</div>${m.linhas.map(lin).join("")}</div><p class="rod at">${m.rodape}</p></div></div>`; },
  projecao: (E) => { const p = E.projecao;
    const lin = (l, i) => `<div class="lin${i === p.destaque ? " dest fo" : " at"}">${i === p.destaque ? `<i class="faixa"></i>` : ""}<span class="n">${i + 2}</span>${l.map((v) => `<span>${v}</span>`).join("")}</div>`;
    return `<div class="en-xl"><div class="tinta"><div class="xl-t"><i></i><b class="at">${p.arquivo}</b><span>${E.proj.codigo} · rede ilustrativa</span></div>
      <div class="xl-g"><div class="lin cabt fo"><span class="n">1</span>${p.cab.map((h) => `<span>${h}</span>`).join("")}</div>${p.linhas.map(lin).join("")}</div>
      <div class="xl-aba at"><b>13 semanas</b><span>${p.nota}</span></div></div></div>`; },
  plano: (E) => { const p = E.plano;
    return `<div class="en-pg en-plano"><div class="tinta">${cab(E)}<h2 class="at">${p.titulo}</h2><p class="sub at">${p.sub}</p><div class="acoes">
      ${p.linhas.map((l) => `<div class="ac at"><div class="t">${l.t}<span>${l.q}</span></div><b>${l.v}</b></div>`).join("")}
      <div class="ac tot fo"><div class="t">${p.totalRot}</div><b>${p.total}</b><i class="risco"></i></div></div><p class="rod at">${p.rodape}</p></div></div>`; },
  devolutiva: (E) => `<div class="en-tag"><span>${E.devolutiva}</span></div>`,
};

// As peças no mostrador: a pose final (deitada) e a de onde pousam (um palmo acima, um pouco à direita e mais girada,
// como folhas postas sobre a mesa). A etiqueta da devolutiva é montada no tamanho em que aparece na VISTA (lida ali).
function montarPecas(c, M, E) {
  return PECAS.map((p, i) => {
    const para = M.poseDeitada(M.v3(p.x, p.y, p.z), p.w, p.h, p.giro);
    const de = M.poseDeitada(M.v3(p.x + 0.10, p.y + 0.42, p.z - 0.06), p.w, p.h, p.giro + 0.18);
    M.definirLamina(i, de, para, p.escura ? { raio: 0.014, escuro: 0.9, ouro: 0.45 } : { raio: 0.006, ouro: 0.08 });
    let w = Math.round(FOLHA_PX * p.w / p.h), h = FOLHA_PX;
    if (p.escura) {
      const ld = M.v3(1, 0, 0).applyQuaternion(para.quat).multiplyScalar(p.w / 2), al = M.v3(0, 1, 0).applyQuaternion(para.quat).multiplyScalar(p.h / 2);
      const T = (v) => M.naTela(v, VISTA), a = T(para.pos.clone().sub(ld)), b = T(para.pos.clone().add(ld)), cc = T(para.pos.clone().add(al)), d = T(para.pos.clone().sub(al));
      w = Math.round(Math.hypot(b.x - a.x, b.y - a.y)); h = Math.round(Math.hypot(cc.x - d.x, cc.y - d.y));
    }
    const el = folha(c, M, i, w, h, `en-peca en-${p.id}`, HTML[p.id](E));
    el.style.opacity = "0";
    const tinta = el.querySelector(".tinta");
    if (tinta) tinta.style.opacity = String(TINTA_LONGE);
    return { ...p, i, de, para, el, tinta, foco: [...el.querySelectorAll(".fo")], marca: el.querySelector(".risco, .faixa") };
  });
}

// O quadro em que a cena anterior termina (semanas, js/cenas/lente.js: o plano PLANO_SEM e as três séries das 13
// semanas, com a linha do saldo mínimo), montado com a mesma geometria para o gráfico sair sem corte em 8.0.
// Se a geometria de lá mudar, este trecho acompanha; sem os dados das semanas, a cena começa sem o gráfico.
const PLANO_SEM = { x: 0.06, y: 0.40, dist: 4.6, fov: 20, alt: 0.95 };
function graficoSemanas(M, C, G) {
  const W = C && C.semanas;
  if (!W || !W.plano || !W.vendas || !W.natal) return null;
  const todos = [...W.plano, ...W.vendas.serie, ...W.natal.serie], sy = 0.62 / Math.max(...todos), x0 = -0.9, dx = 0.15, wP = 0.07, wL = 0.024;
  const lat = [{ v: W.vendas.serie, cor: "grafite", cheio: 0.95 }, { v: W.natal.serie, cor: "marfim", cheio: 0.8 }], nl = lat.length, specs = [];
  W.plano.forEach((v, i) => specs.push({ x: x0 + i * dx - nl * 0.016, y0: 0, h: v * sy, w: wP, cor: "verde", cheio: 0.72 }));
  lat.forEach((L, j) => L.v.forEach((v, i) => { if (v > 1000) specs.push({ x: x0 + i * dx + wP / 2 - nl * 0.016 + 0.006 + wL / 2 + j * (wL + 0.006), y0: 0, h: v * sy, w: wL, cor: L.cor, cheio: L.cheio, topo: 0 }); }));
  const B = M.definirBarras(G, specs);
  const linha = M.definirLinhas(G, [{ pts: [[x0 - 0.08, W.regra * sy], [x0 + 12 * dx + 0.08, W.regra * sy]], cor: "ouro", tracejada: true }])[0];
  return { B, linha };
}

// ============================================================================ 8 · a entrega
export function entrega(c, ctx) {
  const M = ctx.mundo, E = dados(ctx);
  c.className = "cena c-entrega";
  const bloco = (cls, k, l) => `<div class="en-k ${cls}" style="opacity:0"><h1 class="t-titulo">${linhas(k)}</h1>${l ? `<p class="t-lead so-assistir">${linhas(l)}</p>` : ""}</div>`;
  c.innerHTML = `<div class="en-veu" style="opacity:0"></div>${bloco("en-k0", E.abre, E.abreLeg)}${DOCS.map((id, k) => bloco(`en-d en-d${k + 1}`, quebra(E[id].k), E[id].l)).join("")}
    <div class="en-k en-k4" style="opacity:0"><h1 class="t-titulo">${linhas(E.sabe)}</h1><ul>${E.sabeLista.map((x) => `<li>${x}</li>`).join("")}</ul></div>`;
  const q = (s) => c.querySelector(s), h1 = (b) => b.querySelector("h1"), lead = (b) => b.querySelector(".t-lead");
  const K0 = q(".en-k0"), Kd = [1, 2, 3].map((k) => q(`.en-d${k}`)), K4 = q(".en-k4"), veu = q(".en-veu");
  const tl = gsap().timeline({ paused: true });
  // começa no quadro das 13 semanas (os 208 índices seguem apagados: acendem só no fim da peça)
  const G = M.grafico({ origem: M.v3(0, 0.02, 0.5) });
  M.base(tl, { cam: M.planoGrafico(G, PLANO_SEM), disco: { acesos: 0 }, luz: { a: LUZ_SEM, expo: 1 } });
  const graf = graficoSemanas(M, ctx.C, G);
  const PZ = montarPecas(c, M, E), por = Object.fromEntries(PZ.map((p) => [p.id, p]));
  const Lr = leitor();

  // ---- 8.0 · ponte: o gráfico sai (as barras voltam ao vidro); a câmera recua à vista do instrumento; as peças
  // pousam sobre o vidro, uma a uma, e o ponteiro corre os dez dias de trabalho. O título entra quando as peças
  // pousaram e o relógio já assenta (não concorre com folhas voando).
  if (graf) {
    tl.set(graf.B, { a: 1, k: 1 }, 0); tl.set(graf.linha, { a: 0.95, desenho: 1 }, 0);
    tl.to(graf.B, { k: 0, a: 0, duration: 0.45, ease: "power2.inOut", stagger: 0.006 }, 0.0);
    tl.to(graf.linha, { a: 0, duration: 0.3, ease: "power1.in" }, 0.0);
  }
  M.irPara(tl, VISTA, 1.5, 0.25, {}, "power3.out");
  M.luzPara(tl, { a: LUZ }, 1.5, 0.25);
  M.correrRelogio(tl, 2.4, 2.4, 0.25);
  PZ.forEach((p, k) => {
    const t0 = 0.4 + 0.12 * k;
    tl.to(M.laminas[p.i], { a: 1, duration: 0.25, ease: "power1.out" }, t0);
    tl.to(M.laminas[p.i], { p: 1, duration: 0.9, ease: "power3.out" }, t0);
    if (!p.escura) tl.to(M.laminas[p.i], { branco: 1, duration: 0.45, ease: "power1.inOut" }, t0 + 0.2);
    tl.to(p.el, { opacity: 1, duration: 0.35, ease: "power1.out" }, t0 + 0.55);
  });
  mostrar(tl, K0, 1.7);
  revelar(tl, h1(K0), 1.7); Lr.ler(1.7, E.abre, { depoisDeCamera: true });
  revelar(tl, lead(K0), 2.6); Lr.ler(2.6, E.abreLeg);
  let t = Lr.fim + 0.4;

  // ---- 8.1–8.3 · um documento por vez, de frente. A folha que sai some antes de a seguinte ficar legível; as
  // vizinhas voltam a ser vidro apagado (sem texto); a folha lida ganha a tinta quando a câmera chega; o cabeçalho e
  // a linha destacada acendem com o ouro, depois do título e da legenda.
  const apagar = (o, t0) => {
    tl.to(o.el, { opacity: 0, duration: 0.3, ease: "power1.in" }, t0);
    tl.to(M.laminas[o.i], { a: 0.3, branco: 0, duration: 0.6, ease: "power2.inOut" }, t0);
    if (o.tinta) tl.set(o.tinta, { opacity: TINTA_LONGE }, t0 + 0.35);      // volta a ser textura (já invisível)
  };
  const acender = (o, t0, tTexto) => { tl.to(M.laminas[o.i], { a: 1, branco: o.escura ? 0 : 1, duration: 0.6, ease: "power2.inOut" }, t0); tl.to(o.el, { opacity: 1, duration: 0.4, ease: "power1.out" }, tTexto); };
  const PARADA = { mapa: "doc-mapa", projecao: "doc-projecao", plano: "doc-plano" };
  DOCS.forEach((id, k) => {
    const p = por[id], d = E[id], bl = Kd[k], T = t, dc = k ? 1.2 : 1.5;
    tirar(tl, k ? Kd[k - 1] : K0, T);
    if (k === 0) { PZ.forEach((o) => { if (o.id !== id) apagar(o, T + 0.05); }); tl.to(veu, { opacity: 1, duration: 1.0, ease: "power1.inOut" }, T + 0.2); }
    else { apagar(por[DOCS[k - 1]], T); acender(p, T + 0.2, T + 0.5); }
    M.irPara(tl, camDoc(M, p), dc, T + 0.1, {}, "power2.inOut");
    tl.to(p.tinta, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, T + dc - 0.5);
    const tK = T + 0.1 + dc - 0.25;
    mostrar(tl, bl, tK);
    revelar(tl, h1(bl), tK); Lr.zerar(tK); Lr.ler(tK, d.k, { depoisDeCamera: true });
    revelar(tl, lead(bl), tK + 0.7); Lr.ler(tK + 0.7, d.l);
    // o destaque: o cabeçalho e a linha acendem, e o ouro corre — o sublinhado do total (mapa, plano) ou a faixa
    // da semana mais apertada (projeção); "1 linha destacada com número"
    const tD = tK + 1.5;
    tl.to(p.foco, { opacity: 1, duration: 0.4, ease: "power2.out" }, tD);
    if (p.marca) tl.fromTo(p.marca, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out", immediateRender: false }, tD + 0.1);
    Lr.olhar(tD, 2.5);
    const tP = tD + 0.7;
    parada(tl, ctx, PARADA[id], tP, Lr.hold(tP));
    t = tP + Lr.hold(tP);
  });

  // ---- 8.4 · a vista do instrumento, as peças inteiras (de novo textura); o que a rede sabe no décimo dia
  const T4 = t;
  tirar(tl, Kd[2], T4);
  M.irPara(tl, VISTA, 1.6, T4 + 0.1, {}, "power2.inOut");
  tl.to(veu, { opacity: 0, duration: 0.8, ease: "power1.inOut" }, T4 + 0.3);
  tl.to(por.plano.tinta, { opacity: TINTA_LONGE, duration: 0.6, ease: "power1.inOut" }, T4 + 0.2);
  PZ.forEach((o) => { if (o.id !== "plano") acender(o, T4 + 0.3, T4 + 0.8); });
  const tS = T4 + 1.4;
  mostrar(tl, K4, tS);
  revelar(tl, h1(K4), tS); Lr.zerar(tS); Lr.ler(tS, E.sabe, { depoisDeCamera: true });
  const itens = [...K4.querySelectorAll("li")];
  aparecer(tl, itens, tS + 0.8, 0.5, 0.6, 10);                          // uma linha por vez
  itens.forEach((li, j) => Lr.ler(tS + 0.8 + 0.6 * j, li.textContent));
  const pS = tS + 0.8 + 0.6 * (itens.length - 1) + 0.5;
  parada(tl, ctx, "sabe", pS, Lr.hold(pS));
  tl.to({}, { duration: 0.4 }, pS + Lr.hold(pS));
  return tl;
}

// ============================================================================ 9 · isto é um projeto
// Transição de ato: as peças se apagam; a câmera sobe ao mostrador inteiro, onde os 208 índices são traços apagados;
// no trajeto, só o do FIN3.10 acende em ouro. O nome curto do projeto fica ao lado do índice (os dois modos): a lente
// sobre uma parte da empresa. Termina no quadro em que a oferta começa (PLANO_UM, acesos 0, destaque 1).
export function umProjeto(c, ctx) {
  const M = ctx.mundo, E = dados(ctx), U = (ctx.C && ctx.C.umProjeto) || { titulo: "Isto é um projeto.", codigo: E.proj.codigo };
  c.className = "cena c-um-projeto";
  const nome = `${U.codigo} · ${String(E.proj.curto || E.proj.nome).toLowerCase()}`;
  c.innerHTML = `<h1 class="t-display up-k" style="opacity:0">${linhas(quebra(U.titulo))}</h1>`;
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: VISTA, disco: { acesos: 0 }, luz: { a: LUZ, expo: 1 } });
  // as peças como a entrega as deixou: inteiras, sobre o vidro. O estado delas no tempo 0 substitui o da base (que
  // zera as seis lâminas no mesmo instante): dois "set" no mesmo alvo e no mesmo tempo se desfazem na ordem inversa
  // quando a linha do tempo volta ao 0 (← no apresentador), e as peças sumiriam.
  const PZ = montarPecas(c, M, E);
  PZ.forEach((p) => {
    tl.getTweensOf(M.laminas[p.i]).forEach((tw) => tw.kill());
    tl.set(M.laminas[p.i], { p: 1, a: 1, e: 0, branco: p.escura ? 0 : 1 }, 0);
    p.el.style.opacity = "1"; p.foco.forEach((f) => { f.style.opacity = "1"; });
    if (p.marca) p.marca.style.transform = "scaleX(1)";
  });
  PZ.forEach((p) => { tl.to(p.el, { opacity: 0, duration: 0.35, ease: "power1.in" }, 0.05); tl.to(M.laminas[p.i], { a: 0, duration: 0.8, ease: "power1.in" }, 0.1); });
  M.irPara(tl, PLANO_UM, 2.6, 0.2, {}, "power2.inOut");
  M.luzPara(tl, { a: LUZ_OFERTA }, 2.6, 0.2);
  tl.fromTo(M.disco, { destaque: 0 }, { destaque: 1, duration: 0.7, ease: "power2.out", immediateRender: false }, 2.2);
  const Lr = leitor(), k = c.querySelector(".up-k");
  mostrar(tl, k, 2.6);
  revelar(tl, k, 2.6); Lr.ler(2.6, U.titulo, { depoisDeCamera: true });
  // o nome do projeto fora da caixa, ligado ao índice aceso por um fio de ouro (a direção é a do plano final)
  const pIdx = M.naTela(M.posIndice(U.codigo, 0.935, 0.01), PLANO_UM), pRot = M.naTela(M.posIndice(U.codigo, 1.13, 0.01), PLANO_UM);
  const fio = `<i style="width:${Math.round(Math.hypot(pIdx.x - pRot.x, pIdx.y - pRot.y))}px;transform:rotate(${(Math.atan2(pIdx.y - pRot.y, pIdx.x - pRot.x) * 180 / Math.PI).toFixed(1)}deg)"></i>`;
  const rotulo = K.rot(c, M, M.posIndice(U.codigo, 1.13, 0.01), "up-rot", `${fio}<span>${nome}</span>`, 0, 0);
  aparecer(tl, rotulo, 3.1, 0.5, 0, 6);
  Lr.olhar(3.1, 1.2);
  const pU = 3.6;
  parada(tl, ctx, "um-projeto", pU, Lr.hold(pU));
  tl.to({}, { duration: 0.4 }, pU + Lr.hold(pU));
  return tl;
}
