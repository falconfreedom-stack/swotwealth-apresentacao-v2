// A lente FIN3.10 em funcionamento (roteiro v1, cenas 3 a 9): os quatro documentos (insumos), o cruzamento, a
// descoberta, a conta, as treze semanas, a entrega e "isto é um projeto". Mais o motor do diagnóstico, usado pelas
// lentes opcionais (FIN8.2 e FIN5.11, em versão compacta) e pelo diagnóstico legado do FIN3.10.
// Ritmo: estudo/pesquisa/20-pitch-e-motion.md (B.3, C.2). Cada batida entra uma coisa por vez; a parada cai no fim
// das entradas e o hold é o tempo de leitura (leitor), nunca animação. [L] = legenda só do modo assistir.
import { F, contar } from "../util.js?v=202610081530";
import { gsap, marco, LOGO_ESC, ancora, rot, aparecer, sumir, folha, crescer, apagar, parada, leitura, leitor, linhas, revelar, recolher, atenuar, focar,
  holdGrafico, caminho, uniformeLamina, PLANO_FOLHA, RET_FOLHA, poseFolha, lamT3, blocoHTML, ladosDoGrafo, montarQuadro, PECAS, htmlPeca } from "./comum.js?v=202610081530";

const L_ = (t) => `<span class="so-assistir">${t}</span>`;   // legenda [L] dentro de um bloco

// ============================================================================ 3 · insumos
// 3.1 íris: a câmera atravessa o vidro; quatro lâminas sobem do mostrador e param lado a lado (um documento cada).
// 3.2 as quatro deslizam umas sobre as outras e viram uma só: a lente. 3.3 a lente vira a folha do checklist;
// os campos se preenchem (textura de dado) e a folha vai para o lado: o esforço da equipe (roteiro v2, D5).
// PLANO_CAL = o plano em que o retrato (S1, js/cenas/abertura.js: CAL2) termina, para a íris partir do mesmo quadro;
// PLANO_INS = o plano da fila das lâminas.
export const PLANO_CAL = { x: -0.78, y: 3.939, z: 3.546, tx: -0.78, ty: 0, tz: 0, fov: 30 };
export const PLANO_INS = { x: 0, y: 1.55, z: 2.75, tx: 0, ty: 0.32, tz: 0, fov: 34 };
const RET_DOC = [0, 1, 2, 3].map((k) => ({ left: 226 + k * 376, top: 300, width: 340, height: 440 }));
const RET_PILHA = (k) => ({ left: 790 + k * 7, top: 300 - k * 7, width: 340, height: 440 });
const RET_FOLHA_LADO = { left: 850, top: 262, width: 960, height: 549 };       // a folha do checklist ao lado do texto (mesma proporção)
// o que cada documento "vê": um traço só, sem texto (contratos: a taxa; extratos: o saldo do dia; agenda: as
// parcelas a vencer; contas: os vencimentos)
const VE = [
  `<svg viewBox="0 0 120 64"><circle cx="34" cy="20" r="9"/><circle cx="86" cy="46" r="9"/><path d="M92 12 28 52"/></svg>`,
  `<svg viewBox="0 0 120 64"><path d="M6 50 L26 38 L44 44 L64 22 L82 30 L114 10"/></svg>`,
  `<svg viewBox="0 0 120 64"><g class="o">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${8 + i * 18}" y="${10 + i * 8}" width="12" height="${50 - i * 8}" rx="2"/>`).join("")}</g></svg>`,
  `<svg viewBox="0 0 120 64"><rect x="8" y="8" width="104" height="50" rx="6"/><path d="M8 22h104"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle class="${i === 1 || i === 4 ? "o" : ""}" cx="${20 + i * 13.5}" cy="40" r="3.4"/>`).join("")}</svg>`,
];

export function insumos(c, ctx) {
  const M = ctx.mundo, C = ctx.C, I = C.insumos, f = C.formulario;
  c.className = "cena c-ins";
  c.innerHTML = `<div class="iris"></div>
  <h1 class="t-titulo in-k1">${linhas(I.pedaco)}</h1>
  <div class="in-k2"><p class="rotulo">${I.rotulo}</p><h1 class="t-titulo">${linhas(I.junta)}</h1></div>
  <div class="in-k3"><h1 class="t-titulo">${linhas(I.esforco)}</h1><p class="t-lead so-assistir">${I.origens}</p></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: PLANO_CAL, disco: { acesos: 0 }, luz: { a: 1.2, expo: 0.45 } });     // o retrato termina com o mundo atenuado
  tl.to(M.luz, { expo: 1, duration: 1.2, ease: "power2.out" }, 0.1);
  // ---- lâminas: do mostrador à fila, da fila à pilha; a de cima segue até a folha
  const doDisco = [-0.45, -0.15, 0.15, 0.45].map((x) => M.poseDeitada(M.v3(x, 0.006, 0.22), 0.05, 0.065, 0));
  const cams = I.docs.map((_, k) => {
    const poses = [doDisco[k], M.poseRet(RET_DOC[k], PLANO_INS, 1.9), M.poseRet(RET_PILHA(k), PLANO_INS, 1.9 - k * 0.004)];
    if (k === 3) poses.push(poseFolha(M), M.poseRet(RET_FOLHA_LADO, PLANO_FOLHA, 2.6));     // a folha, e a folha ao lado do texto
    const cm = caminho(M, poses);
    M.definirLamina(k, cm.viva, cm.viva, { raio: 0.014, ouro: 0.25, escuro: 0.84 });
    tl.set(cm.st, { s: 0 }, 0);
    tl.set(M.laminas[k], { p: 1, a: 0, e: 0, branco: 0 }, 0);
    return cm;
  });
  const docs = I.docs.map((d, k) => folha(c, M, k, RET_DOC[k].width, RET_DOC[k].height, "in-doc", `<div class="lin"><i></i><i></i><i></i><i class="c"></i></div><b>${d}</b><div class="ve">${VE[k]}</div>`));
  // a folha do checklist cola na lâmina 3 (a de cima da pilha), no tamanho da leitura
  const form = folha(c, M, 3, RET_FOLHA.width, RET_FOLHA.height, "papel form in-form",
    `<div class="cab"><img src="${LOGO_ESC}" alt="SWOT WEALTH"><span>${f.cab} · rede ilustrativa</span></div>
    <div class="titulo"><h1>${f.titulo}</h1><div class="prog"><b><span class="cnt">0</span> de ${f.total}</b><span>campos</span><i style="--p:0%"></i></div></div>
    <div class="blocos p3">${f.blocos.map(blocoHTML).join("")}</div>`);
  [...docs, form].forEach((d) => { d.style.opacity = "0"; });
  const Lr = leitor();

  // ---- 3.1 · íris e as quatro lâminas
  const iris = q(".iris");
  tl.fromTo(iris, { "--r": "390px", opacity: 1 }, { "--r": "1750px", duration: 1.4, ease: "power2.in", immediateRender: false }, 0.05);
  tl.set(iris, { opacity: 0 }, 1.5);
  // o empurrão (FOV −3°) e a descida para o plano da fila, num movimento só
  M.irPara(tl, { ...PLANO_CAL, fov: 27, y: PLANO_CAL.y - 0.25, z: PLANO_CAL.z - 0.25 }, 0.9, 0, {}, "power2.in");
  M.irPara(tl, PLANO_INS, 1.5, 0.85, {}, "power2.out");
  M.luzPara(tl, { a: 1.9 }, 1.5, 0.85);
  const tSobe = (k) => 0.55 + 0.35 * k;
  cams.forEach((cm, k) => {
    tl.to(M.laminas[k], { a: 1, duration: 0.3 }, tSobe(k));
    cm.ir(tl, 0, 1, 1.4, tSobe(k));
    tl.to(docs[k], { opacity: 1, duration: 0.4, ease: "power2.out" }, tSobe(k) + 1.15);
    Lr.olhar(tSobe(k) + 1.15, 1.2);                  // o nome do documento é rótulo curto (pré-treino)
  });
  const tK1 = tSobe(3) + 1.5;
  revelar(tl, q(".in-k1"), tK1);
  Lr.ler(tK1, I.pedaco);
  const pPedaco = tK1 + 0.9;
  parada(tl, ctx, "pedaco", pPedaco, Lr.hold(pPedaco));

  // ---- 3.2 · a lente: as quatro viram uma só
  let t = pPedaco + Lr.hold(pPedaco);
  recolher(tl, q(".in-k1"), t);
  sumir(tl, docs, t + 0.05, 0.4);
  cams.forEach((cm, k) => cm.ir(tl, 1, 2, 1.4, t + 0.2 + 0.05 * (3 - k), "power2.inOut"));
  // o vidro empilhado acende: borda de ouro e corpo mais claro (a lente)
  [0, 1, 2, 3].forEach((k) => { uniformeLamina(tl, M, k, "uOuro", 0.25, 1.0, 0.8, t + 1.4); uniformeLamina(tl, M, k, "uEscuro", 0.84, 0.62, 0.8, t + 1.4); });
  aparecer(tl, q(".in-k2 .rotulo"), t + 1.6, 0.5);
  revelar(tl, q(".in-k2 h1"), t + 1.9);
  Lr.zerar(t + 1.6); Lr.olhar(t + 1.6, 2.4); Lr.ler(t + 1.9, I.junta);       // o rótulo do projeto é reconhecido, não lido
  const pJunta = t + 2.6;
  parada(tl, ctx, "junta", pJunta, Lr.hold(pJunta));
  t = pJunta + Lr.hold(pJunta);

  // ---- 3.3 · o checklist
  sumir(tl, q(".in-k2 .rotulo"), t, 0.35); recolher(tl, q(".in-k2 h1"), t);
  [0, 1, 2].forEach((k) => tl.to(M.laminas[k], { a: 0, duration: 0.4, ease: "power1.in" }, t + 0.1));
  M.irPara(tl, PLANO_FOLHA, 1.6, t + 0.1, {}, "power2.inOut");
  M.luzPara(tl, { a: 3.2, expo: 0.8 }, 1.6, t + 0.1);
  cams[3].ir(tl, 2, 3, 1.6, t + 0.1, "power2.inOut");
  // a lente vira papel enquanto pousa; o texto chega junto com o branco (sem clarão de folha vazia)
  tl.to(M.laminas[3], { branco: 1, duration: 1.1, ease: "power1.inOut" }, t + 0.5);
  uniformeLamina(tl, M, 3, "uOuro", 1.0, 0.1, 0.8, t + 0.5);
  tl.to(form, { opacity: 1, duration: 0.5, ease: "power1.out" }, t + 1.15);
  // preenchimento em ~5 s: linhas da tabela e campos em sequência; o contador leva a mensagem
  const blocos = [...form.querySelectorAll(".bloco")], cnt = form.querySelector(".cnt"), prog = form.querySelector(".prog i");
  const itens = blocos.flatMap((b) => [...b.querySelectorAll("tr.vazia, .campo .v")]);
  const t0 = t + 2.2, passo = 5.0 / Math.max(1, itens.length);
  itens.forEach((el, k) => { el.style.opacity = "0"; tl.fromTo(el, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out", immediateRender: false }, t0 + k * passo); });
  const contador = { n: 0 };
  tl.fromTo(contador, { n: 0 }, { n: f.total, duration: itens.length * passo, ease: "none", immediateRender: false,
    onUpdate: () => { const n = Math.round(contador.n); cnt.textContent = n; prog.style.setProperty("--p", `${(100 * n / f.total).toFixed(0)}%`); } }, t0);
  // o esforço (roteiro v2, D5): a folha vai para o lado, menor (vira textura), e a frase ocupa a coluna da esquerda
  const tE = t0 + itens.length * passo + 0.5;
  cams[3].ir(tl, 3, 4, 1.0, tE, "power2.inOut");
  revelar(tl, q(".in-k3 h1"), tE + 0.8);
  Lr.zerar(tE + 0.8); Lr.ler(tE + 0.8, I.esforco, { depoisDeCamera: true });
  const tOr = Lr.fim - 0.3;                                              // a legenda entra quando a frase foi lida (janelas ≤ 9 s)
  aparecer(tl, q(".in-k3 .t-lead"), tOr, 0.6);
  Lr.ler(tOr, I.origens, { v: 17 });
  const pIns = tOr + 0.6;
  parada(tl, ctx, "insumos", pIns, Lr.hold(pIns));
  tl.to({}, { duration: 0.4 }, pIns + Lr.hold(pIns));
  return tl;
}

// ============================================================================ 4 · cruzamento
// 4.1 A folha volta a ser vidro e se desfaz em pontos; os pontos convergem nos nós e as ligações se desenham.
// Rótulos por coluna (entradas → meio → saídas em ouro); quando as saídas entram, entradas e meio caem a 40%.
// Sem números no grafo (os números chegam um a um na descoberta) e sem deriva de câmera.
export function cruzamento(c, ctx) {
  const M = ctx.mundo, C = ctx.C, PR = C.parede, X = C.cruzamento, nos = PR.nos;
  c.className = "cena c-cruz";
  c.innerHTML = `<h1 class="t-titulo cz-k">${linhas(X.titulo)}</h1>
  ${nos.map((no) => ancora(`no ${no.ouro ? "ouro" : ""}`, no.ouro ? `<b>${no.t}</b>` : `<span>${no.t}</span>`)).join("")}
  <p class="t-lead cz-l so-assistir">${linhas(X.legenda)}</p>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: PLANO_FOLHA, disco: { acesos: 0 }, luz: { a: 3.2, expo: 0.8 } });
  // a folha do checklist (como a cena anterior a deixou) vira vidro e se desfaz em pontos
  const flut = M.poseRet({ left: 1330, top: 290, width: 420, height: 540 }, "analise", 2.2);
  M.definirLamina(3, poseFolha(M), flut, { raio: 0.02 });
  tl.set(M.laminas[3], { p: 0, a: 1, e: 0, branco: 1 }, 0);
  tl.to(M.laminas[3], { p: 1, duration: 1.3, ease: "power3.inOut" }, 0.1);
  tl.to(M.laminas[3], { branco: 0, duration: 0.9, ease: "power1.out" }, 0.4);
  M.irPara(tl, "analise", 1.8, 0.1, {}, "power2.inOut");
  M.luzPara(tl, { a: 4.2, expo: 1 }, 1.8, 0.1);
  const plano = M.plano("analise");
  const P = M.prepararGrafo(PR, flut);
  const ancs = [...c.querySelectorAll(".no")], mi = ancs.map((a) => a.querySelector(".miolo"));
  const PCT = { "": [0, -50], esq: [-100, -50], cima: [-50, -100], baixo: [-50, 0] };
  ladosDoGrafo(M, P, PR, ancs, plano).forEach(([cls, dx, dy], i) => { if (cls) ancs[i].classList.add(cls); gsap().set(mi[i], { xPercent: PCT[cls][0], yPercent: PCT[cls][1] }); M.ancorar(ancs[i], P[i], dx, dy); });
  mi.forEach((m) => { m.style.opacity = "0"; });
  tl.set(M.dados, { fase: 0, a: 0 }, 0);
  tl.to(M.dados, { a: 1, duration: 0.5 }, 1.2);
  tl.to(M.laminas[3], { a: 0, duration: 0.5 }, 1.5);
  tl.to(M.dados, { fase: 1, duration: 1.6, ease: "power2.inOut" }, 1.3);
  tl.to(M.dados, { fase: 2, duration: 2.0, ease: "power2.inOut" }, 2.9);
  const Lr = leitor();
  revelar(tl, q(".cz-k"), 1.8);
  Lr.ler(1.8, X.titulo, { depoisDeCamera: true });
  // o grafo: nós em 1,6 s, ligações em 2,2 s; rótulos por coluna
  tl.set(M.grafo, { a: 1 }, 4.0);
  tl.fromTo(M.grafo, { nos: 0 }, { nos: 1, duration: 1.6, ease: "none", immediateRender: false }, 4.1);
  tl.fromTo(M.grafo, { desenho: 0 }, { desenho: 1, duration: 2.2, ease: "power1.inOut", immediateRender: false }, 4.5);
  const [colE, colM, colS] = PR.colunas.map((ks) => ks.map((k) => mi[k]));
  // por coluna, no máximo 3 rótulos entrando a cada 0,5 s; as saídas só entram depois de o meio ser lido
  const tE = 4.3, tM = 5.3, tS = 7.8;
  tl.fromTo(colE, { opacity: 0, x: -6 }, { opacity: 0.85, x: 0, duration: 0.45, stagger: 0.25, ease: "power2.out", immediateRender: false }, tE);
  tl.fromTo(colM, { opacity: 0, x: -6 }, { opacity: 0.85, x: 0, duration: 0.45, stagger: 0.25, ease: "power2.out", immediateRender: false }, tM);
  atenuar(tl, [...colE, ...colM], tS, 0.45, 0.5);
  tl.fromTo(colS, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.3, ease: "power2.out", immediateRender: false }, tS);
  Lr.olhar(tE, 1.5);                                 // entradas e meio: textura de processo (nomes já vistos)
  Lr.olhar(tS, 0.6 * colS.length);                   // as saídas: leitura curta, uma a uma
  const tL = tS + 0.3 * colS.length + 0.6;
  revelar(tl, q(".cz-l"), tL);
  Lr.ler(tL, X.legenda, { v: 17 });
  const pCruza = tL + 0.7;
  parada(tl, ctx, "cruza", pCruza, Lr.hold(pCruza));
  tl.to({}, { duration: 0.4 }, pCruza + Lr.hold(pCruza));
  return tl;
}

// ============================================================================ peças de gráfico das cenas 5 a 7
// O mesmo plano de gráfico do diagnóstico (barras de vidro em pé diante do mostrador, lidas de frente).
const origemGrafico = (M) => M.grafico({ origem: M.v3(0, 0.02, 0.5) });
// barra com "gêmea" em ouro no mesmo lugar: o foco troca o vidro marfim pelo ouro (cruzando a opacidade)
function barraComFoco(specs, s) { specs.push(s); const i = specs.length - 1; specs.push({ ...s, cor: "ouro", cheio: 0.82, ouro: 0.7 }); return [i, i + 1]; }
// rótulo de texto preso a um ponto do gráfico, nascendo invisível
const rotulo = (c, M, v, cls, html, dx = 0, dy = 0) => rot(c, M, v, cls, html, dx, dy);
// a régua (base) de um gráfico de largura xa..xb
function reguaG(c, M, G, xa, xb, plano, dy = 26) { const m = rotulo(c, M, G.ponto((xa + xb) / 2, 0), "regua c", "", 0, dy); m.style.width = `${Math.round((xb - xa + 0.12) * M.pxPorUnidade(plano.dist, plano.fov))}px`; return m; }
// as 13 semanas: barra larga (série principal) e até duas séries finas ao lado; devolve os índices das barras
function semanas13(specs, principal, laterais, sy, x0 = -0.9, dx = 0.15) {
  const nl = laterais.length, wP = nl ? 0.07 : 0.1, wL = 0.024, idx = { principal: [], laterais: laterais.map(() => []) };
  principal.v.forEach((v, i) => { const x = x0 + i * dx - nl * 0.016; specs.push({ x, y0: 0, h: v * sy, w: wP, cor: principal.cor, cheio: 0.72 }); idx.principal.push(specs.length - 1); });
  laterais.forEach((L, j) => L.v.forEach((v, i) => { if (!(v > 1000)) { idx.laterais[j].push(null); return; } specs.push({ x: x0 + i * dx + wP / 2 - nl * 0.016 + 0.006 + wL / 2 + j * (wL + 0.006), y0: 0, h: v * sy, w: wL, cor: L.cor, cheio: L.cheio ?? 0.9, topo: 0 }); idx.laterais[j].push(specs.length - 1); }));
  return idx;
}

// a geometria do mapa do custo do dinheiro (descoberta 5.1–5.3; a conta a reconstrói para sair dele sem corte)
function geometriaMapa(Mp) {
  const F5 = Mp.fontes, L = 2.0, gap = 0.03, tot = F5.reduce((s, f) => s + f.saldo, 0), sx = L / tot, sy = 0.66 / Math.max(36, ...F5.map((f) => f.taxa));
  let x = -L / 2 - gap * (F5.length - 1) / 2;
  const itens = F5.map((f) => { const w = Math.max(0.05, f.saldo * sx), cx = x + w / 2; x += w + gap; return { f, cx, w, h: f.taxa * sy }; });
  return { L, sy, itens, iAnt: itens.findIndex((m) => m.f.id === "antecipacao"), iGar: itens.findIndex((m) => m.f.id === "garantida") };
}
const PLANO_MAPA = { x: 0.0, y: 0.47, dist: 4.6, fov: 20, alt: 0.3 };

// ============================================================================ 5 · descoberta
// 5.1 o mapa do custo do dinheiro (largura = saldo médio; altura = taxa efetiva), da fonte mais cara à mais barata;
// a barra da antecipação é "a mesma de antes" (o custo do ano visto na cena 2). 5.2 foco na antecipação: a
// equivalência da taxa. 5.3 foco na garantida × aplicação (o único lugar dessa sobreposição), com a ressalva na tela
// nos dois modos. As 13 semanas do jeito atual saíram do percurso (roteiro v2, D1).
export function descoberta(c, ctx) {
  const M = ctx.mundo, C = ctx.C, D = C.descoberta, Mp = D.mapa, Sb = D.sobreposicao;
  c.className = "cena c-desc";
  c.innerHTML = `<div class="ds-txt ds-a"><h1 class="t-titulo">${linhas(Mp.titulo)}</h1><p class="t-lead so-assistir">${linhas(Mp.legenda)}</p></div>
  <p class="t-lead so-assistir ds-lb">${linhas(D.antecipacao.legenda)}</p>
  <div class="ds-txt ds-c"><h1 class="t-titulo">${linhas(Sb.titulo)}</h1><p class="t-lead ressalva">${linhas(Sb.ressalva)}</p></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "analise", disco: { acesos: 0 }, luz: { a: 4.2, expo: 1 } });
  // o grafo da cena anterior sai devagar (continuidade), em vez de sumir no corte
  tl.set(M.grafo, { a: 1, nos: 1, desenho: 1 }, 0); tl.set(M.dados, { fase: 2, a: 1 }, 0);
  tl.to([M.grafo, M.dados], { a: 0, duration: 0.6, ease: "power1.in" }, 0.05);
  const G = origemGrafico(M), P = G.ponto;
  const specs = [];
  const GM = geometriaMapa(Mp), L = GM.L, sy = GM.sy, iAnt = GM.iAnt, iGar = GM.iGar;
  const mapa = GM.itens.map((m) => { const [b, bo] = barraComFoco(specs, { x: m.cx, y0: 0, h: m.h, w: m.w, cor: "marfim", cheio: 0.6 }); return { ...m, b, bo }; });
  const B = M.definirBarras(G, specs);
  const linhaRend = M.definirLinhas(G, [{ pts: [[-L / 2 - 0.1, Mp.rendimento * sy], [L / 2 + 0.12, Mp.rendimento * sy]], cor: "marfim", tracejada: true }])[0];
  const planoMapa = PLANO_MAPA;
  // rótulos: nomes sob as barras; "a mesma de antes" dentro da barra da antecipação; os focos colados às barras
  const reg = reguaG(c, M, G, -L / 2, L / 2, planoMapa);
  const nomes = mapa.map((m) => rotulo(c, M, P(m.cx, 0), "cat c", m.f.rot, 0, 54));
  const rMesma = rotulo(c, M, P(mapa[iAnt].cx, mapa[iAnt].h + 0.02), "foco c", Mp.antRot, 0, -24);   // colado à barra, por cima (o vidro claro não dá contraste ao texto escuro)
  const rAnt = rotulo(c, M, P(mapa[iAnt].cx, mapa[iAnt].h + 0.02), "foco c", D.antecipacao.rotulo, 0, -24);
  const rGar = rotulo(c, M, P(mapa[iGar].cx - mapa[iGar].w / 2, mapa[iGar].h + 0.02), "foco e", Sb.garantida, 0, -24);
  // o rótulo da aplicação fica sobre a linha, por cima da barra larga da antecipação (já atenuada): à direita, sairia da tela
  const rApl = rotulo(c, M, P(mapa[iAnt].cx - mapa[iAnt].w / 2 + 0.06, Mp.rendimento * sy), "seg", Sb.aplicacao, 0, -22);
  const Lr = leitor();
  const blocoA = q(".ds-a"), blocoC = q(".ds-c");
  blocoC.querySelector(".t-lead").style.opacity = "0";

  // ---- 5.1 · o mapa
  M.irPara(tl, M.planoGrafico(G, planoMapa), 1.6, 0.1, {}, "power2.inOut");
  M.luzPara(tl, { a: 5.0 }, 1.6, 0.1);
  aparecer(tl, reg, 1.4, 0.4, 0);
  crescer(tl, mapa.map((m) => B[m.b]), 1.8, 1.0, 0.12);
  aparecer(tl, nomes, 2.8, 0.5, 0.2, 6);
  revelar(tl, blocoA.querySelector("h1"), 3.3);
  aparecer(tl, rMesma, 4.1, 0.5);
  Lr.olhar(2.8, 1.0); Lr.ler(3.3, Mp.titulo); Lr.olhar(4.1, 1.2);
  const tLa = Lr.fim - 0.3;                                              // a legenda entra quando o título e o rótulo foram lidos
  revelar(tl, blocoA.querySelector(".t-lead"), tLa);
  Lr.ler(tLa, Mp.legenda, { v: 17 });
  let t = tLa + 0.6;
  parada(tl, ctx, "mapa", t, Lr.hold(t));
  t += Lr.hold(t);

  // ---- 5.2 · a antecipação: o resto cai a 32%, a barra ganha ouro e uma varredura de luz
  recolher(tl, blocoA.querySelector(".t-lead"), t); sumir(tl, rMesma, t, 0.3);
  mapa.forEach((m, k) => { if (k !== iAnt) tl.to(B[m.b], { a: 0.32, duration: 0.5, ease: "power2.out" }, t + 0.1); });
  atenuar(tl, nomes.filter((_, k) => k !== iAnt), t + 0.1, 0.32);
  tl.set(B[mapa[iAnt].bo], { k: 1 }, t + 0.2);
  tl.fromTo(B[mapa[iAnt].bo], { a: 0 }, { a: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, t + 0.2);
  tl.to(B[mapa[iAnt].b], { a: 0, duration: 0.5 }, t + 0.2);
  M.luzPara(tl, { a: 5.8 }, 0.6, t + 0.3, "power2.inOut");
  aparecer(tl, rAnt, t + 0.8, 0.5);
  revelar(tl, q(".ds-lb"), t + 1.4);
  Lr.zerar(t + 0.8); Lr.ler(t + 0.8, D.antecipacao.rotulo); Lr.ler(t + 1.4, D.antecipacao.legenda, { v: 17 });
  const pAnt = t + 2.0;
  parada(tl, ctx, "antecipacao", pAnt, Lr.hold(pAnt));
  t = pAnt + Lr.hold(pAnt);

  // ---- 5.3 · aplicação × garantida (a ressalva fica na tela nos dois modos)
  recolher(tl, [blocoA.querySelector("h1"), q(".ds-lb")], t); sumir(tl, rAnt, t, 0.35);
  tl.to(B[mapa[iAnt].bo], { a: 0, duration: 0.5 }, t + 0.1); tl.to(B[mapa[iAnt].b], { a: 0.32, duration: 0.5 }, t + 0.1);
  atenuar(tl, nomes[iAnt], t + 0.1, 0.32);
  tl.set(B[mapa[iGar].bo], { k: 1 }, t + 0.3);
  tl.fromTo(B[mapa[iGar].bo], { a: 0 }, { a: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, t + 0.3);
  tl.to(B[mapa[iGar].b], { a: 0, duration: 0.5 }, t + 0.3); focar(tl, nomes[iGar], t + 0.3);
  tl.set(linhaRend, { a: 0.9 }, t + 0.6); tl.fromTo(linhaRend, { desenho: 0 }, { desenho: 1, duration: 0.9, ease: "power2.inOut", immediateRender: false }, t + 0.6);
  aparecer(tl, rGar, t + 0.9, 0.5);
  aparecer(tl, rApl, t + 1.6, 0.5);
  revelar(tl, blocoC.querySelector("h1"), t + 2.2);
  revelar(tl, blocoC.querySelector(".t-lead"), t + 3.1);
  tl.fromTo(blocoC.querySelector(".t-lead"), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, t + 3.1);   // a borda da ressalva só com o texto
  Lr.zerar(t + 0.9); Lr.olhar(t + 0.9, 0.8); Lr.olhar(t + 1.6, 0.8); Lr.ler(t + 2.2, Sb.titulo); Lr.ler(t + 3.1, Sb.ressalva);
  const pSob = t + 3.7;
  parada(tl, ctx, "sobreposicao", pSob, Lr.hold(pSob));
  tl.to({}, { duration: 0.4 }, pSob + Lr.hold(pSob));
  return tl;
}

// ============================================================================ 6 · conta
// 6.1 o que a lente revela: o número conta, com halo e varredura; a natureza e de onde ele sai (v2) nos dois modos.
// 6.2 o número viaja e vira o total; quatro decisões em barras (ouro = só da empresa; marfim = terceiros), com
// colchetes por quem decide e a nota de referência do "cotar". 6.3 as barras caem; três ladrilhos com os símbolos
// fixos (contorno tracejado de ouro · ouro cheio · grafite); o total viaja para o primeiro.
// Posições do número (px do palco, origem do transform no canto): herói, total no alto à direita, 1º ladrilho.
const NUM = { left: 112, top: 318 }, NUM_TOT = { left: 1388, top: 96, esc: 0.42 }, NUM_LAD = { left: 146, top: 450, esc: 0.47 };
let _medNum;
const larguraNum = (t) => { const k = _medNum || (_medNum = document.createElement("canvas").getContext("2d")); k.font = "600 136px 'Inter Tight'"; return k.measureText(t).width * 0.97; };
export function conta(c, ctx) {
  const M = ctx.mundo, C = ctx.C, K = C.conta, Mp = C.descoberta.mapa;
  c.className = "cena c-conta";
  const final = K.numeroFmt(K.numero);
  c.innerHTML = `<div class="ct-heroi"><p class="rotulo so-assistir">${K.revela}</p><div class="ct-l1"><b class="num ct-por" style="left:${Math.round(larguraNum(final) + 26)}px">${K.porAno}</b></div>
    <p class="ct-nat">${K.natureza}</p><p class="ct-orig">${K.origem}</p></div>
  <div class="ct-halo"></div><b class="num ct-num" data-t="${final}">${final}</b>
  <p class="ct-tot">${K.totalRot.replace(final, "").replace(/^\s*·\s*/, "")}</p>
  <h1 class="t-titulo ct-k">${linhas(K.decisoes)}</h1>
  <p class="ct-nota">* ${K.notaCotar}</p>
  <div class="ct-lad">${K.ladrilhos.map((l, k) => `<div class="lad ${l.tipo}"><b class="num">${k === 0 ? "&nbsp;" : l.v}</b><span>${l.t}</span></div>`).join("")}</div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  const G = origemGrafico(M), P = G.ponto, specs = [];
  M.base(tl, { cam: M.planoGrafico(G, PLANO_MAPA), disco: { acesos: 0 }, luz: { a: 5.8, expo: 1 } });
  // o mapa como a descoberta o deixou (atenuado, a garantida em ouro), para sair sem corte
  const GM = geometriaMapa(Mp);
  const mapa = GM.itens.map((m, k) => { const [b, bo] = barraComFoco(specs, { x: m.cx, y0: 0, h: m.h, w: m.w, cor: "marfim", cheio: 0.6 }); return { b, bo, foco: k === GM.iGar }; });
  // as quatro decisões, em barras horizontais
  const yLin = (i) => 0.80 - 0.13 * i, x0 = -0.30, max = Math.max(...K.acoes.map((a) => a.v)), sx = 0.85 / max;
  const barras = K.acoes.map((a, i) => { specs.push({ x: x0 + a.v * sx / 2, y0: yLin(i) - 0.035, h: 0.07, w: a.v * sx, cor: a.grupo === "empresa" ? "ouro" : "marfim", cheio: a.grupo === "empresa" ? 0.78 : 0.6, hor: true, topo: 0 }); return specs.length - 1; });
  const B = M.definirBarras(G, specs);
  const linhaRend = M.definirLinhas(G, [{ pts: [[-GM.L / 2 - 0.1, Mp.rendimento * GM.sy], [GM.L / 2 + 0.12, Mp.rendimento * GM.sy]], cor: "marfim", tracejada: true }])[0];
  mapa.forEach((m) => { tl.set(B[m.b], { k: 1, a: m.foco ? 0 : 0.32 }, 0); tl.set(B[m.bo], { k: 1, a: m.foco ? 1 : 0 }, 0); });
  tl.set(linhaRend, { a: 0.9, desenho: 1 }, 0);
  apagar(tl, mapa.flatMap((m) => [B[m.b], B[m.bo]]), 0.05, 0.5); tl.to(linhaRend, { a: 0, duration: 0.5 }, 0.05);
  const planoConta = { x: 0.04, y: 0.55, dist: 4.5, fov: 20, alt: 0.25 };
  M.irPara(tl, M.planoGrafico(G, planoConta), 1.2, 0.1, {}, "power2.inOut");
  M.luzPara(tl, { a: 6.4 }, 1.2, 0.1);
  // rótulos das decisões (à esquerda das barras) e colchetes por quem decide (à direita)
  const pxU = M.pxPorUnidade(planoConta.dist, planoConta.fov);
  const rAcao = K.acoes.map((a, i) => rotulo(c, M, P(x0 - 0.04, yLin(i)), "acao", `${a.t}${a.id === "cotar" ? "*" : ""}${a.id === "garantida" ? `<span>${K.condicaoGarantida}</span>` : ""}`, 0, 0));
  const xb = x0 + 0.88;
  const rGrupo = K.grupos.map(([g, rotG]) => {
    const is = K.acoes.map((a, i) => (a.grupo === g ? i : -1)).filter((i) => i >= 0);
    if (!is.length) return null;
    const y = (yLin(is[0]) + yLin(is[is.length - 1])) / 2, hpx = Math.round((yLin(is[0]) - yLin(is[is.length - 1]) + 0.07) * pxU);
    return rotulo(c, M, P(xb, y), "colchete", `<i style="height:${hpx}px"></i><span>${rotG}</span>`, 0, 0);
  }).filter(Boolean);
  const Lr = leitor();
  const heroi = q(".ct-heroi"), num = q(".ct-num"), halo = q(".ct-halo");
  [num, halo, q(".ct-tot"), q(".ct-nota"), ...heroi.children, ...c.querySelectorAll(".lad")].forEach((e) => { e.style.opacity = "0"; });

  // ---- 6.1 · o que a lente revela (número-herói 2 de 2: contagem de 0,9 s, varredura e halo ≤ 0,8 s)
  aparecer(tl, heroi.querySelector(".rotulo"), 0.8, 0.5);
  tl.set(num, { opacity: 1 }, 1.2);
  contar(tl, num, K.numero, K.numeroFmt, 0.9, 1.2);
  // a varredura de luz corre num pseudo-elemento por cima do número (::after), só durante 0,7 s; o número mantém
  // a cor de verdade e não há texto duplicado
  tl.set(num, { "--brilho": 0, "--bp": "120%" }, 0);
  tl.set(num, { "--brilho": 1 }, 2.15);
  tl.fromTo(num, { "--bp": "120%" }, { "--bp": "-20%", duration: 0.7, ease: "power1.inOut", immediateRender: false }, 2.15);
  tl.set(num, { "--brilho": 0 }, 2.86);
  tl.fromTo(halo, { opacity: 0 }, { opacity: 0.8, duration: 0.3, ease: "power2.out", immediateRender: false }, 2.1);
  tl.to(halo, { opacity: 0, duration: 0.5, ease: "power1.in" }, 2.4);
  aparecer(tl, heroi.querySelector(".ct-l1"), 2.1, 0.5);
  aparecer(tl, heroi.querySelector(".ct-nat"), 2.4, 0.6);
  Lr.olhar(1.2, 1.2); Lr.ler(2.4, K.natureza);                                // o número se lê na contagem
  const pMesa = 3.0;
  parada(tl, ctx, "na-mesa", pMesa, Lr.hold(pMesa));
  let t = pMesa + Lr.hold(pMesa);
  // 6.1b · de onde sai (roteiro v2, D2): a linha da origem, na sua própria batida
  aparecer(tl, heroi.querySelector(".ct-orig"), t, 0.6);
  Lr.zerar(t); Lr.ler(t, K.origem);
  const pOrig = t + 0.6;
  parada(tl, ctx, "origem", pOrig, Lr.hold(pOrig));
  t = pOrig + Lr.hold(pOrig);

  // ---- 6.2 · quatro decisões: o número viaja (FLIP) e vira o total
  sumir(tl, [...heroi.children], t, 0.35);
  tl.to(num, { x: NUM_TOT.left - NUM.left, y: NUM_TOT.top - NUM.top, scale: NUM_TOT.esc, duration: 0.8, ease: "power2.inOut" }, t + 0.1);
  aparecer(tl, q(".ct-tot"), t + 0.8, 0.4);
  revelar(tl, q(".ct-k"), t + 0.9);
  // 6.2a · as quatro decisões: barras e rótulos, uma por vez (sem os colchetes ainda)
  K.acoes.forEach((_, i) => { const ti = t + 1.5 + 0.35 * i; crescer(tl, [B[barras[i]]], ti, 0.8, 0); aparecer(tl, rAcao[i], ti + 0.25, 0.45); });
  const tUlt = t + 1.5 + 0.35 * (K.acoes.length - 1) + 0.7;
  Lr.zerar(t + 0.9); Lr.ler(t + 0.9, K.decisoes); K.acoes.forEach((_, i) => Lr.olhar(t + 1.75 + 0.35 * i, 1.2));
  const pDecisoes = tUlt + 0.3;
  parada(tl, ctx, "decisoes", pDecisoes, Lr.hold(pDecisoes));
  t = pDecisoes + Lr.hold(pDecisoes);
  // 6.2b · de quem depende cada uma: os colchetes com os três valores e a nota de referência do "cotar"
  aparecer(tl, rGrupo, t, 0.5, 0.3);
  aparecer(tl, q(".ct-nota"), t + 1.2, 0.5);
  // a nota de fonte se olha, não se lê inteira (é referência; o apresentador a cita se perguntarem)
  Lr.zerar(t); rGrupo.forEach((_, k) => Lr.olhar(t + 0.3 * k, 1.5)); Lr.olhar(t + 1.2, 2.6);
  const pDec = t + 1.7;
  parada(tl, ctx, "quem-decide", pDec, Lr.hold(pDec));
  t = pDec + Lr.hold(pDec);

  // ---- 6.3 · as três naturezas
  recolher(tl, q(".ct-k"), t); sumir(tl, [q(".ct-nota"), q(".ct-tot")], t, 0.35);
  barras.forEach((k) => tl.to(B[k], { a: 0.2, duration: 0.5 }, t + 0.1));
  atenuar(tl, [...rAcao, ...rGrupo], t + 0.1, 0.1);                       // ficam sob os ladrilhos
  const lad = [...c.querySelectorAll(".lad")];
  tl.to(num, { x: NUM_LAD.left - NUM.left, y: NUM_LAD.top - NUM.top, scale: NUM_LAD.esc, duration: 0.8, ease: "power2.inOut" }, t + 0.5);   // o total viaja para o 1º ladrilho
  // um ladrilho por vez: o seguinte entra quando o anterior foi lido (valor + natureza); nenhuma janela longa parada
  let tLad = t + 0.5;
  Lr.zerar(tLad);
  lad.forEach((el, k) => { aparecer(tl, el, tLad, 0.6); Lr.ler(tLad, `${K.ladrilhos[k].v} ${K.ladrilhos[k].t}`); if (k < lad.length - 1) tLad = Lr.fim; });
  const pNat = tLad + 0.7;
  parada(tl, ctx, "naturezas", pNat, Lr.hold(pNat));
  tl.to({}, { duration: 0.4 }, pNat + Lr.hold(pNat));
  return tl;
}

// ============================================================================ 7 · semanas
// 7.1 a pergunta do mês fraco, sozinha, com o mundo atenuado; 7.2 a régua, a linha do saldo mínimo e, com o
// relógio correndo como cursor das 13 semanas, uma barra verde por semana (caixa mínimo com a regra); 7.3 ao lado,
// a série fina das vendas 15% menores (grafite); 7.4 a terceira série, 13º e Natal juntos (marfim).
const PLANO_SEM = { x: 0.06, y: 0.40, dist: 4.6, fov: 20, alt: 0.95 };
export function semanas(c, ctx) {
  const M = ctx.mundo, C = ctx.C, W = C.semanas;
  c.className = "cena c-sem";
  c.innerHTML = `<div class="sm-txt sm-q"><h1 class="t-titulo">${linhas(W.pergunta)}</h1><p class="t-lead so-assistir">${linhas(W.legPergunta)}</p><p class="nota">${W.fontePergunta}</p></div>
  <div class="sm-txt sm-r"><h1 class="t-titulo">${linhas(W.regraTit)}</h1><p class="t-lead so-assistir">${linhas(W.regraLeg)}</p><p class="nota">${W.notaRegra}</p></div>
  <div class="sm-txt sm-v"><h1 class="t-titulo">${linhas(W.vendas.titulo)}</h1><p class="t-lead so-assistir">${linhas(W.vendas.leg)}</p></div>
  <div class="sm-txt sm-n"><h1 class="t-titulo">${linhas(W.natal.titulo)}</h1><p class="t-lead so-assistir">${linhas(W.natal.leg)}</p></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  const G = origemGrafico(M), P = G.ponto, specs = [];
  M.base(tl, { cam: M.planoGrafico(G, { x: 0.04, y: 0.55, dist: 4.5, fov: 20, alt: 0.25 }), disco: { acesos: 0 }, luz: { a: 6.4, expo: 1 } });
  // as três séries: principal (com a regra, verde) e duas finas ao lado (vendas −15% em grafite; 13º e Natal em marfim)
  const todos = [...W.plano, ...W.vendas.serie, ...W.natal.serie], sy = 0.62 / Math.max(...todos);
  const S13 = semanas13(specs, { v: W.plano, cor: "verde" }, [{ v: W.vendas.serie, cor: "grafite", cheio: 0.95 }, { v: W.natal.serie, cor: "marfim", cheio: 0.8 }], sy);
  const B = M.definirBarras(G, specs);
  const x0 = -0.9, dx = 0.15, xs = (i) => x0 + i * dx;
  const linhaMin = M.definirLinhas(G, [{ pts: [[x0 - 0.08, W.regra * sy], [x0 + 12 * dx + 0.08, W.regra * sy]], cor: "ouro", tracejada: true }])[0];
  const reg = reguaG(c, M, G, x0, x0 + 12 * dx, PLANO_SEM);
  const sem = [0, 12].map((i) => rotulo(c, M, P(xs(i), 0), "cat c", `sem. ${i + 1}`, 0, 54));
  const rRegra = rotulo(c, M, P(x0 + 12 * dx + 0.08, W.regra * sy), "seg", W.regraRot, 12, 0);
  const iMin = (v) => v.indexOf(Math.min(...v));
  const acima = (i) => Math.max(W.plano[i], W.vendas.serie[i], W.natal.serie[i]) * sy + 0.02;
  const kP = iMin(W.plano), kV = iMin(W.vendas.serie);
  const rMinP = rotulo(c, M, P(xs(kP), acima(kP)), "foco c", W.minRot(W.minPlano), 0, -24);
  const rMinV = rotulo(c, M, P(xs(kV) + 0.04, acima(kV)), "foco c", W.minRot(W.vendas.minimo), 0, -58);
  const legs = [["v", W.serieRot], ["g", W.vendas.legenda], ["m", W.natal.legenda]].map(([cls, t], k) => rotulo(c, M, P(x0 + 12 * dx + 0.06, 0.95 - k * 0.055), "leg d", `<i class="${cls}"></i>${t}`, 0, 0));
  const Lr = leitor();
  const bq = q(".sm-q"), br = q(".sm-r"), bv = q(".sm-v"), bn = q(".sm-n");
  [bq, br, bv, bn].forEach((b) => b.querySelectorAll(".nota").forEach((n) => { n.style.opacity = "0"; }));

  // ---- 7.1 · a pergunta, sozinha (o mundo cai; a câmera já vai ao plano do gráfico, ainda vazio)
  M.irPara(tl, M.planoGrafico(G, PLANO_SEM), 1.4, 0.1, {}, "power2.inOut");
  M.luzPara(tl, { expo: 0.45 }, 0.8, 0.2);
  revelar(tl, bq.querySelector("h1"), 1.3);
  aparecer(tl, bq.querySelector(".nota"), 2.0, 0.5);                     // a fonte, visível nos dois modos
  Lr.ler(1.3, W.pergunta, { depoisDeCamera: true });
  const tLm = Lr.fim - 0.3;                                              // a legenda [L] entra quando a pergunta foi lida
  revelar(tl, bq.querySelector(".t-lead"), tLm);
  Lr.ler(tLm, W.legPergunta, { v: 17 }); Lr.olhar(tLm, 1.5);             // pergunta: + 1,5 s para pensar (no apresentar, a espera é do apresentador)
  const pMes = tLm + 0.7;
  parada(tl, ctx, "mes-fraco", pMes, Lr.hold(pMes));
  let t = pMes + Lr.hold(pMes);

  // ---- 7.2 · a regra: régua, a linha do mínimo e as 13 semanas com o relógio como cursor
  recolher(tl, [bq.querySelector("h1"), bq.querySelector(".t-lead")], t); sumir(tl, bq.querySelector(".nota"), t, 0.3);
  M.luzPara(tl, { expo: 1 }, 0.6, t);
  revelar(tl, br.querySelector("h1"), t + 0.4);                         // o título primeiro; o gráfico cresce sob ele
  aparecer(tl, [reg, ...sem], t + 1.0, 0.4, 0.05);
  tl.set(linhaMin, { a: 0.95 }, t + 1.3); tl.fromTo(linhaMin, { desenho: 0 }, { desenho: 1, duration: 0.8, ease: "power2.inOut", immediateRender: false }, t + 1.3);
  aparecer(tl, rRegra, t + 1.7, 0.5);
  const tC = t + 2.3;
  M.correrRelogio(tl, 3.6, 3.2, tC);
  crescer(tl, S13.principal.map((k) => B[k]), tC + 0.1, 0.55, 0.22);
  aparecer(tl, rMinP, tC + 3.3, 0.5);
  revelar(tl, br.querySelector(".t-lead"), tC + 3.8);
  aparecer(tl, br.querySelector(".nota"), tC + 4.2, 0.5);
  Lr.zerar(t + 0.4); Lr.ler(t + 0.4, W.regraTit); Lr.olhar(t + 1.7, 1.0); Lr.olhar(tC + 3.3, 1.2); Lr.ler(tC + 3.8, W.regraLeg, { v: 17 }); Lr.olhar(tC + 4.2, 1.5);
  const pRegra = tC + 4.7;
  parada(tl, ctx, "regra", pRegra, Lr.hold(pRegra));
  t = pRegra + Lr.hold(pRegra);

  // ---- 7.3 · vendas 15% menores (série fina grafite)
  recolher(tl, [br.querySelector("h1"), br.querySelector(".t-lead")], t); sumir(tl, br.querySelector(".nota"), t, 0.3);
  sumir(tl, rMinP, t, 0.35);                                           // um "mínimo" por vez
  crescer(tl, S13.laterais[0].filter((k) => k != null).map((k) => B[k]), t + 0.3, 0.6, 0.06);
  aparecer(tl, legs.slice(0, 2), t + 1.0, 0.5, 0.15);
  aparecer(tl, rMinV, t + 1.6, 0.5);
  revelar(tl, bv.querySelector("h1"), t + 2.2);
  revelar(tl, bv.querySelector(".t-lead"), t + 3.0);
  Lr.zerar(t + 1.0); Lr.olhar(t + 1.0, 0.6); Lr.olhar(t + 1.6, 0.6); Lr.ler(t + 2.2, W.vendas.titulo); Lr.ler(t + 3.0, W.vendas.leg, { v: 17 });
  const pEst = t + 3.6;
  parada(tl, ctx, "estresse", pEst, Lr.hold(pEst));
  t = pEst + Lr.hold(pEst);

  // ---- 7.4 · 13º e Natal juntos (terceira série, marfim)
  recolher(tl, [bv.querySelector("h1"), bv.querySelector(".t-lead")], t);
  sumir(tl, rMinV, t, 0.35);
  crescer(tl, S13.laterais[1].filter((k) => k != null).map((k) => B[k]), t + 0.3, 0.6, 0.06);
  aparecer(tl, legs[2], t + 1.0, 0.5);
  revelar(tl, bn.querySelector("h1"), t + 1.6);
  revelar(tl, bn.querySelector(".t-lead"), t + 2.4);
  Lr.zerar(t + 1.0); Lr.olhar(t + 1.0, 0.8); Lr.ler(t + 1.6, W.natal.titulo); Lr.ler(t + 2.4, W.natal.leg, { v: 17 });
  const pDez = t + 3.0;
  parada(tl, ctx, "dezembro", pDez, Lr.hold(pDez));
  tl.to({}, { duration: 0.4 }, pDez + Lr.hold(pDez));
  return tl;
}

// ============================================================================ o diagnóstico (lentes opcionais e legado)
// Cada quadro: [K] título (o achado), o gráfico em estágios (régua e barras → nomes e valores → legenda e destaque;
// listas uma linha por vez) e a legenda [L]. A parada cai no fim das entradas; o hold é a leitura.
// Lente compacta (FIN8.2, FIN5.11): abre com o cartão do hub vindo à frente e o rótulo do projeto (L1.0/L2.0).
export function diagnostico(c, ctx) {
  const M = ctx.mundo, C = ctx.C, compacto = !!(ctx.compacto && C.compacto);
  const QD = compacto ? C.compacto : C.quadros, intro = compacto ? C.intro : null;
  c.className = `cena c-diag${compacto ? " compacto" : ""}`;
  const leg = (qd) => (qd.l ? `<p class="t-lead so-assistir">${qd.l}</p>` : qd.sub ? `<p class="t-lead">${qd.sub}</p>` : "");
  c.innerHTML = `<div class="cabd">${C.cabDiag}</div>${compacto ? `<p class="rotulo dg-rede">rede ilustrativa</p>` : ""}${intro ? `<div class="dg-intro"><p class="rotulo">${intro.rotulo}</p><h1 class="t-titulo">${linhas(intro.k)}</h1></div>` : ""}
    ${QD.map((qd, i) => `<div class="qtit q${i}"><h1 class="t-titulo">${linhas(qd.k || qd.tituloL || qd.titulo)}</h1>${leg(qd)}</div>`).join("")}`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: compacto ? "top3" : "analise", disco: { acesos: 0, top3: 1 }, luz: { a: 6.0, expo: 1 } });
  const G = M.grafico({ origem: M.v3(0, 0.02, 0.5) });
  const specs = [], rots = [], linhasG = [];
  const Q = QD.map((qd) => montarQuadro(qd, c, M, G, specs, rots, linhasG));
  const B = M.definirBarras(G, specs), Ls = M.definirLinhas(G, linhasG);
  const comMatriz = Q.find((s) => s.matriz), Mz = comMatriz ? M.definirMatriz(G, comMatriz.matriz) : null;
  tl.set([q(".cabd"), ...c.querySelectorAll(".qtit .t-lead")], { opacity: 0 }, 0);
  aparecer(tl, [q(".cabd"), q(".dg-rede")], 0.2, 0.6, 0.3);                 // o rótulo "rede ilustrativa" fica a lente inteira (roteiro v2, S8)
  const Lr = leitor();
  let t = 0.2;
  // ---- abertura da lente: o cartão vem à frente e se desfaz; o rótulo e a frase-chave
  if (intro) {
    const L0 = lamT3(M, C.n - 1), perto = M.poseRet({ left: 560, top: 150, width: 800, height: 760 }, "top3", 1.1);
    M.definirLamina(0, L0.para, perto, { raio: L0.raio, ouro: 0.25, escuro: 0.84 });
    tl.set(M.laminas[0], { p: 0, a: 1 }, 0);
    tl.to(M.laminas[0], { p: 1, duration: 1.2, ease: "power2.in" }, 0.1);
    tl.to(M.laminas[0], { a: 0, duration: 0.5, ease: "power1.in" }, 0.8);
    aparecer(tl, q(".dg-intro .rotulo"), 0.6, 0.5);
    revelar(tl, q(".dg-intro h1"), 0.9);
    t = 0.9 + Math.max(2.0, leitura(intro.k));                           // o título sozinho ≈ 2 s
    sumir(tl, [q(".dg-intro .rotulo"), q(".dg-intro h1")], t, 0.35);       // sai por opacidade (subindo, passava sob o rótulo de cima)
  }
  Q.forEach((S, i) => {
    const qd = QD[i], tit = q(`.q${i}`), h1 = tit.querySelector("h1"), lead = tit.querySelector(".t-lead");
    const dc = i === 0 && !intro ? 1.6 : 1.2;
    M.irPara(tl, M.planoGrafico(G, S.plano), dc, t + 0.15, {}, "power2.inOut");
    M.luzPara(tl, { a: 6.0 + 0.5 * (i + 1) }, dc, t + 0.15);
    const tT = t + 0.15 + dc - 0.3, tA = t + 0.15 + dc;
    revelar(tl, h1, tT);
    Lr.zerar(tT); Lr.ler(tT, qd.k || qd.tituloL || qd.titulo, { depoisDeCamera: true });
    // estágio 1: régua, barras, linhas e matriz
    aparecer(tl, S.g.regua, tA - 0.2, 0.4, 0);
    const seqB = new Set((S.seq || []).flatMap((s) => s.barras));
    const bs = S.barras.filter((k) => !seqB.has(k)).map((k) => B[k]);
    crescer(tl, bs, tA, 1.0, bs.length > 12 ? 0.05 : 0.12);
    S.linhas.forEach((k) => { tl.set(Ls[k], { a: 0.9 }, tA + 0.6); tl.fromTo(Ls[k], { desenho: 0 }, { desenho: 1, duration: 0.9, ease: "power2.inOut", immediateRender: false }, tA + 0.6); });
    if (S.matriz && Mz) { tl.set(Mz, { a: 1 }, tA); tl.fromTo(Mz, { n: 0 }, { n: 1, duration: 2.0, ease: "power1.inOut", immediateRender: false }, tA); }
    // estágio 2 (nomes e valores) e estágio 3 (legenda e destaque); listas uma linha por vez
    aparecer(tl, [...S.g.nomes, ...S.g.valores], tA + 1.0, 0.5, 0.03, 6);
    let tC = tA + 2.0;
    if (S.matriz) tC = tA + 2.2;
    aparecer(tl, [...S.g.legenda, ...S.g.destaque], tC, 0.5, 0.4, 6);
    let tFim = tC + 0.5;
    if (S.seq) {
      S.seq.forEach((it, k) => { const tk = tA + 0.2 + 1.3 * k; crescer(tl, it.barras.map((j) => B[j]), tk, 0.8, 0); aparecer(tl, it.rots, tk + 0.3, 0.45, 0.08, 6); tFim = tk + 0.8; });
      if (S.fim.length) { aparecer(tl, S.fim, tFim + 0.3, 0.5); tFim += 0.8; }
      if (S.nota.length) { aparecer(tl, S.nota, tFim + 0.4, 0.5); tFim += 0.9; }
    }
    // olhar o gráfico: com legenda, a comparação já está escrita nela (lida a seguir) e o olhar é só o dos rótulos
    // de destaque; sem legenda, vale o hold de gráfico inteiro (B.3)
    const nRot = qd.rotulos ?? Math.min(6, S.g.destaque.length + S.g.legenda.length);
    Lr.olhar(tA + 1.0, lead ? Math.min(3, 0.5 * nRot + 0.5) : holdGrafico(nRot + 2, qd.comparacoes ?? 1));
    if (S.seq) Lr.olhar(tFim, 1.0 * S.seq.length);
    // legenda [L] (ou o subtítulo, no legado)
    const tL = Math.max(tFim, tA + 2.4, Lr.fim - 0.3);                    // a legenda entra depois do título lido (janelas ≤ 9 s)
    if (lead) { aparecer(tl, lead, tL, 0.6); Lr.ler(tL, lead.textContent, { v: qd.l ? 17 : 15 }); }
    const tP = (lead ? tL : tFim) + 0.6, hold = Lr.hold(tP);
    parada(tl, ctx, qd.parada || `q${i + 1}`, tP, hold);
    t = tP + hold;
    if (i < Q.length - 1) {
      // a saída começa depois do fim do hold (o → do apresentar pula para ele); o título sai por opacidade
      const tS = t + 0.15;
      sumir(tl, [h1, lead, ...S.rots], tS, 0.35); apagar(tl, S.barras.map((k) => B[k]), tS, 0.4);
      S.linhas.forEach((k) => tl.to(Ls[k], { a: 0, duration: 0.4 }, tS));
      if (S.matriz && Mz) tl.to(Mz, { a: 0, duration: 0.4 }, tS);
      t = tS;
    }
  });
  tl.to({}, { duration: 0.4 }, t);
  return tl;
}
