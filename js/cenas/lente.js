// A lente FIN3.10 em funcionamento (roteiro v1, cenas 3 a 9): os quatro documentos (insumos), o cruzamento, a
// descoberta, a conta, as treze semanas, a entrega e "isto é um projeto". Mais o motor do diagnóstico, usado pelas
// lentes opcionais (FIN8.2 e FIN5.11, em versão compacta) e pelo diagnóstico legado do FIN3.10.
// Ritmo: estudo/pesquisa/20-pitch-e-motion.md (B.3, C.2). Cada batida entra uma coisa por vez; a parada cai no fim
// das entradas e o hold é o tempo de leitura (leitor), nunca animação. [L] = legenda só do modo assistir.
import { F, contar } from "../util.js?v=202610071930";
import { gsap, marco, LOGO_ESC, ancora, rot, aparecer, sumir, folha, crescer, apagar, parada, leitura, leitor, linhas, revelar, recolher, atenuar, focar,
  holdGrafico, caminho, uniformeLamina, PLANO_FOLHA, RET_FOLHA, poseFolha, lamT3, blocoHTML, ladosDoGrafo, montarQuadro, PECAS, htmlPeca } from "./comum.js?v=202610071930";

const L_ = (t) => `<span class="so-assistir">${t}</span>`;   // legenda [L] dentro de um bloco

// ============================================================================ 3 · insumos
// 3.1 íris: a câmera atravessa o vidro; quatro lâminas sobem do mostrador e param lado a lado (um documento cada).
// 3.2 as quatro deslizam umas sobre as outras e viram uma só: a lente. 3.3 a lente vira a folha do checklist;
// os campos se preenchem (textura) e três acendem, um por vez.
// O plano CAL do bloco anterior (mostrador à direita, 12h no alto) e o plano da fila das lâminas.
export const PLANO_CAL = { x: -0.535, y: 4.3, z: 0.012, tx: -0.535, ty: 0, tz: 0, fov: 34 };
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
  M.base(tl, { cam: PLANO_CAL, disco: { acesos: 208 }, luz: { a: 1.2, expo: 1 } });
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
  M.irPara(tl, { ...PLANO_CAL, fov: 31, y: 4.0 }, 0.9, 0, {}, "power2.in");
  M.irPara(tl, PLANO_INS, 1.5, 0.85, {}, "power2.out");
  M.luzPara(tl, { a: 1.9 }, 1.5, 0.85);
  const tSobe = (k) => 0.55 + 0.35 * k;
  cams.forEach((cm, k) => {
    tl.to(M.laminas[k], { a: 1, duration: 0.3 }, tSobe(k));
    cm.ir(tl, 0, 1, 1.4, tSobe(k));
    tl.to(docs[k], { opacity: 1, duration: 0.4, ease: "power2.out" }, tSobe(k) + 1.15);
    Lr.ler(tSobe(k) + 1.15, I.docs[k]);
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
  Lr.zerar(t + 1.6); Lr.olhar(t + 1.6, 1.0); Lr.ler(t + 1.9, I.junta);       // o rótulo do projeto é reconhecido, não lido
  t = Lr.fim + 0.5;

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
  aparecer(tl, q(".in-k3 .t-lead"), tE + 1.7, 0.6);
  Lr.zerar(tE + 0.8); Lr.ler(tE + 0.8, I.esforco, { depoisDeCamera: true }); Lr.ler(tE + 1.7, I.origens);
  const pIns = tE + 2.3;
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
  M.base(tl, { cam: PLANO_FOLHA, disco: { acesos: 208 }, luz: { a: 3.2, expo: 0.8 } });
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
  const tE = 4.3, tM = 5.1, tS = 6.0;
  tl.fromTo(colE, { opacity: 0, x: -6 }, { opacity: 0.85, x: 0, duration: 0.45, stagger: 0.12, ease: "power2.out", immediateRender: false }, tE);
  tl.fromTo(colM, { opacity: 0, x: -6 }, { opacity: 0.85, x: 0, duration: 0.45, stagger: 0.15, ease: "power2.out", immediateRender: false }, tM);
  atenuar(tl, [...colE, ...colM], tS, 0.4, 0.5);
  tl.fromTo(colS, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.15, ease: "power2.out", immediateRender: false }, tS);
  Lr.olhar(tE, 1.5);                                 // entradas e meio: textura de processo (nomes já vistos)
  Lr.olhar(tS, 1.0 * colS.length);                   // as saídas pedem leitura curta, uma a uma
  const tL = tS + 0.15 * colS.length + 0.8;
  revelar(tl, q(".cz-l"), tL);
  Lr.ler(tL, X.legenda);
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
  M.base(tl, { cam: "analise", disco: { acesos: 208 }, luz: { a: 4.2, expo: 1 } });
  // o grafo da cena anterior sai devagar (continuidade), em vez de sumir no corte
  tl.set(M.grafo, { a: 1, nos: 1, desenho: 1 }, 0); tl.set(M.dados, { fase: 2, a: 1 }, 0);
  tl.to([M.grafo, M.dados], { a: 0, duration: 0.6, ease: "power1.in" }, 0.05);
  const G = origemGrafico(M), P = G.ponto;
  const specs = [];
  const F5 = Mp.fontes, L = 2.0, gap = 0.03, tot = F5.reduce((s, f) => s + f.saldo, 0), sx = L / tot, sy = 0.66 / Math.max(36, ...F5.map((f) => f.taxa));
  let x = -L / 2 - gap * (F5.length - 1) / 2;
  const mapa = F5.map((f) => { const w = Math.max(0.05, f.saldo * sx), cx = x + w / 2; x += w + gap; const [b, bo] = barraComFoco(specs, { x: cx, y0: 0, h: f.taxa * sy, w, cor: "marfim", cheio: 0.6 }); return { f, cx, w, h: f.taxa * sy, b, bo }; });
  const iAnt = mapa.findIndex((m) => m.f.id === "antecipacao"), iGar = mapa.findIndex((m) => m.f.id === "garantida");
  const B = M.definirBarras(G, specs);
  const linhaRend = M.definirLinhas(G, [{ pts: [[-L / 2 - 0.1, Mp.rendimento * sy], [L / 2 + 0.12, Mp.rendimento * sy]], cor: "marfim", tracejada: true }])[0];
  const planoMapa = { x: 0.0, y: 0.47, dist: 4.6, fov: 20, alt: 0.3 };
  // rótulos: nomes sob as barras; "a mesma de antes" dentro da barra da antecipação; os focos colados às barras
  const reg = reguaG(c, M, G, -L / 2, L / 2, planoMapa);
  const nomes = mapa.map((m) => rotulo(c, M, P(m.cx, 0), "cat c", m.f.rot, 0, 54));
  const rMesma = rotulo(c, M, P(mapa[iAnt].cx, mapa[iAnt].h * 0.5), "dentro c", Mp.antRot, 0, 0);
  const rAnt = rotulo(c, M, P(mapa[iAnt].cx, mapa[iAnt].h + 0.02), "foco c", D.antecipacao.rotulo, 0, -24);
  const rGar = rotulo(c, M, P(mapa[iGar].cx - mapa[iGar].w / 2, mapa[iGar].h + 0.02), "foco e", Sb.garantida, 0, -24);
  // o rótulo da aplicação fica sobre a linha, por cima da barra larga da antecipação (já atenuada): à direita, sairia da tela
  const rApl = rotulo(c, M, P(mapa[iAnt].cx - mapa[iAnt].w / 2 + 0.06, Mp.rendimento * sy), "seg", Sb.aplicacao, 0, -22);
  const Lr = leitor();
  const blocoA = q(".ds-a"), blocoC = q(".ds-c");

  // ---- 5.1 · o mapa
  M.irPara(tl, M.planoGrafico(G, planoMapa), 1.6, 0.1, {}, "power2.inOut");
  M.luzPara(tl, { a: 5.0 }, 1.6, 0.1);
  aparecer(tl, reg, 1.4, 0.4, 0);
  crescer(tl, mapa.map((m) => B[m.b]), 1.8, 1.0, 0.12);
  aparecer(tl, nomes, 2.8, 0.5, 0.06, 6);
  revelar(tl, blocoA.querySelector("h1"), 3.3);
  aparecer(tl, rMesma, 4.1, 0.5);
  revelar(tl, blocoA.querySelector(".t-lead"), 4.6);
  Lr.olhar(2.8, 1.0); Lr.ler(3.3, Mp.titulo); Lr.olhar(4.1, 1.2); Lr.ler(4.6, Mp.legenda);
  let t = 5.2;
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
  Lr.zerar(t + 0.8); Lr.ler(t + 0.8, D.antecipacao.rotulo); Lr.ler(t + 1.4, D.antecipacao.legenda);
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
  Lr.zerar(t + 0.9); Lr.olhar(t + 0.9, 1.2); Lr.olhar(t + 1.6, 1.2); Lr.ler(t + 2.2, Sb.titulo); Lr.ler(t + 3.1, Sb.ressalva);
  const pSob = t + 3.7;
  parada(tl, ctx, "sobreposicao", pSob, Lr.hold(pSob));
  tl.to({}, { duration: 0.4 }, pSob + Lr.hold(pSob));
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
  c.innerHTML = `<div class="cabd">${C.cabDiag}</div>${intro ? `<div class="dg-intro"><p class="rotulo">${intro.rotulo}</p><h1 class="t-titulo">${linhas(intro.k)}</h1></div>` : ""}
    ${QD.map((qd, i) => `<div class="qtit q${i}"><h1 class="t-titulo">${linhas(qd.k || qd.tituloL || qd.titulo)}</h1>${leg(qd)}</div>`).join("")}`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: compacto ? "top3" : "analise", disco: { top3: 1 }, luz: { a: 6.0, expo: 1 } });
  const G = M.grafico({ origem: M.v3(0, 0.02, 0.5) });
  const specs = [], rots = [], linhasG = [];
  const Q = QD.map((qd) => montarQuadro(qd, c, M, G, specs, rots, linhasG));
  const B = M.definirBarras(G, specs), Ls = M.definirLinhas(G, linhasG);
  const comMatriz = Q.find((s) => s.matriz), Mz = comMatriz ? M.definirMatriz(G, comMatriz.matriz) : null;
  tl.set([q(".cabd"), ...c.querySelectorAll(".qtit .t-lead")], { opacity: 0 }, 0);
  aparecer(tl, q(".cabd"), 0.3, 0.6);
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
    Lr.ler(0.6, intro.rotulo); Lr.ler(0.9, intro.k);
    t = Math.max(4.0, Lr.fim);
    sumir(tl, q(".dg-intro .rotulo"), t, 0.35); recolher(tl, q(".dg-intro h1"), t);
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
    aparecer(tl, [...S.g.legenda, ...S.g.destaque], tC, 0.5, 0.12, 6);
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
    if (S.seq) Lr.olhar(tFim, 1.5 * S.seq.length);
    // legenda [L] (ou o subtítulo, no legado)
    const tL = Math.max(tFim, tA + 2.4);
    if (lead) { aparecer(tl, lead, tL, 0.6); Lr.ler(tL, lead.textContent); }
    const tP = (lead ? tL : tFim) + 0.6, hold = Lr.hold(tP);
    parada(tl, ctx, qd.parada || `q${i + 1}`, tP, hold);
    t = tP + hold;
    if (i < Q.length - 1) {
      recolher(tl, h1, t); sumir(tl, [lead, ...S.rots], t, 0.35); apagar(tl, S.barras.map((k) => B[k]), t, 0.4);
      S.linhas.forEach((k) => tl.to(Ls[k], { a: 0, duration: 0.4 }, t));
      if (S.matriz && Mz) tl.to(Mz, { a: 0, duration: 0.4 }, t);
    }
  });
  tl.to({}, { duration: 0.4 }, t);
  return tl;
}
