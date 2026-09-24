// As cenas do roteiro v2 sobre o instrumento (mundo.js). Cada cena monta a sua camada de texto, move
// câmera e luz dentro da própria linha do tempo GSAP e marca os pontos para onde o espaço salta.
// Os gráficos são objetos do instrumento (barras de vidro, índices, linhas de luz) com rótulo direto;
// as folhas são lâminas no espaço com o HTML colado a elas. Todo número vem do motor, via conteudo.js.
import { F, contar, cascata, entrar, g } from "./util.js?v=202609241929";
import { top3, HISTORIA, SOCIOS, FASES, AMOSTRA, TOP3_CODIGOS, DIAS } from "./conteudo.js?v=202609241929";
import { FASES_N, direcao } from "./mundo.js?v=202609241929";

const gsap = () => g();
const marco = (tl, nome, t) => tl.addLabel(nome, t);
const LOGO_ESC = "midia/marca/logo_horizontal.svg";
const TAU = Math.PI * 2;
const COD = (n) => Object.keys(TOP3_CODIGOS).find((k) => TOP3_CODIGOS[k] === n);
const ancora = (cls, html) => `<div class="anc ${cls}"><div class="miolo">${html}</div></div>`;
const r1 = (v) => F.n(v / 1e6, 1);

// Rótulo HTML preso a um ponto 3D; devolve o miolo (que recebe as animações).
function rot(c, M, v, cls, html, dx = 0, dy = 0) {
  c.insertAdjacentHTML("beforeend", ancora(cls, html));
  const el = c.lastElementChild; M.ancorar(el, v, dx, dy);
  const m = el.querySelector(".miolo"); m.style.opacity = 0; return m;
}
// O estado inicial vai direto no estilo e a animação só se inicializa quando começa: montar a cena sem que o
// GSAP leia e escreva o estilo de cada elemento em sequência (um recálculo de estilo por elemento).
const aparecer = (tl, els, t, dur = 0.6, cada = 0.06, y = 10) => { const l = (els instanceof Element ? [els] : Array.from(els || [])).filter(Boolean); if (!l.length) return; l.forEach((e) => { e.style.opacity = "0"; }); tl.fromTo(l, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur, ease: "power2.out", stagger: cada, immediateRender: false }, t); };
const sumir = (tl, els, t, dur = 0.5) => { const l = [].concat(els).filter(Boolean); if (l.length) tl.to(l, { opacity: 0, duration: dur, ease: "power1.in" }, t); };
// Folha HTML colada a uma lâmina (tamanho de layout em px = tamanho na leitura, para o texto sair nítido).
function folha(c, M, i, w, h, cls, html) {
  const d = document.createElement("div"); d.className = `folha3d ${cls}`; d.style.width = `${w}px`; d.style.height = `${h}px`; d.innerHTML = html;
  c.appendChild(d); M.colar(d, i, w, h); return d;
}
// Cresce um conjunto de barras (estados de mundo.js) em cascata, com uma animação só para o conjunto inteiro
// (o anel de 45 unidades seriam 90 animações a criar na montagem da cena).
const crescer = (tl, bs, t, dur = 1.0, cada = 0.08, ease = "power3.out") => {
  if (!bs.length) return;
  const e = gsap().parseEase(ease), total = dur + cada * (bs.length - 1), p = { v: 0 };
  const aplicar = () => { const tt = p.v * total; for (let i = 0; i < bs.length; i++) { const x = (tt - i * cada) / dur; bs[i].a = x >= 0 ? 1 : 0; bs[i].k = x <= 0 ? 0 : x >= 1 ? 1 : e(x); } };
  bs.forEach((b) => { b.k = 0; });
  tl.fromTo(p, { v: 0 }, { v: 1, duration: total, ease: "none", onUpdate: aplicar, immediateRender: false }, t);
};
const apagar = (tl, bs, t, dur = 0.6) => bs.forEach((b) => tl.to(b, { a: 0, duration: dur, ease: "power1.in" }, t));

// ---------------------------------------------------------------------------------------------
// Planos fixos da v2
const PLANO_FOLHA = { x: 0, y: 1.0, z: 3.35, tx: 0, ty: 0.80, tz: 0, fov: 30 };
const RET_FOLHA = { left: 190, top: 112, width: 1540, height: 880 };
const RET_T3 = [0, 1, 2].map((i) => ({ left: 150 + i * 560, top: 318, width: 500, height: 623 }));
// tamanho do cartão do Top 3 quando a câmera para de frente; na fila ele aparece a 500/610 disso, por isso nenhum texto do cartão fica abaixo de 22 px
const CARTAO = { w: 610, h: 760 };
function lamT3(M, i) {
  const cod = COD(i + 1), ix = M.top3[cod];
  const para = M.poseRet(RET_T3[i], "top3", 1.6);
  return { de: M.poseDeitada(direcao(ix.ang, 0.86), 0.012, 0.05, ix.ang), para, raio: para.w * 26 / 500 };
}
const poseFolha = (M) => M.poseRet(RET_FOLHA, PLANO_FOLHA, 2.6);
// o instrumento à direita, no alto, com o texto no escuro da esquerda (retrato da rede e a pergunta)
const PLANO_RETRATO = { x: -0.72, y: 2.25, z: 2.75, tx: -1.35, ty: 0, tz: 0.05, fov: 30 };

// ============================================================================ 0 · abertura
export function abertura(c, ctx) {
  const M = ctx.mundo;
  c.className = "cena c-abre";
  c.innerHTML = `<div class="leg"><p class="l1">Inteligência financeira para a sua empresa, projeto a projeto.</p><p class="l2">208 projetos · dez fases · quatro sócios</p></div>`;
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "macro", luz: { a: -1.7, i: 0, expo: 0 }, disco: { acesos: 0 }, poeira: { a: 0 } });
  tl.to(M.luz, { expo: 1, i: 1, duration: 2.2, ease: "power2.out" }, 0.1);
  M.luzPara(tl, { a: 1.1 }, 8.0, 0.1);
  M.irPara(tl, "rasante", 4.2, 1.2, {}, "power2.inOut");
  tl.to(M.poeira, { a: 1, duration: 3 }, 3.5);
  M.irPara(tl, "inteiro", 3.6, 5.2, {}, "power3.inOut");
  tl.set(c.querySelectorAll(".leg p"), { opacity: 0 }, 0);
  cascata(tl, [c.querySelector(".l1")], 0, 6.2, 1.0, 12);
  cascata(tl, [c.querySelector(".l2")], 0, 7.0, 0.9, 8);
  marco(tl, "fim", 7.8);
  tl.to(c.querySelector(".leg"), { opacity: 0, y: -20, duration: 0.7, ease: "power2.in" }, 11.2);
  return tl;
}

// ============================================================================ 1 · os 208 projetos
export function projetos208(c, ctx) {
  const M = ctx.mundo;
  c.className = "cena c-208";
  const acum = FASES_N.reduce((a, n, i) => (a.push((a[i - 1] || 0) + n), a), []);
  const lado = (th) => (Math.sin(th) > 0.35 ? "dir" : Math.sin(th) < -0.35 ? "esq" : Math.cos(th) > 0 ? "cima" : "baixo");
  c.innerHTML = `<div class="topo"><h1 class="t-display">208 projetos<br>de gestão,<br>em dez fases.</h1><p class="t-lead">Cada projeto diz que informação usa, o que examina e o que entrega.</p></div>
  ${FASES.map((f, i) => ancora(`fase ${lado(M.angSetor(i))}`, `<b>${f}</b><span>${FASES_N[i]} projetos</span>`)).join("")}
  ${FASES.map((f, i) => `<div class="amostra"><em>${f}</em>${AMOSTRA[i + 1].map((a) => `<span>${a}</span>`).join("")}</div>`).join("")}
  ${[1, 2, 3].map((n) => ancora("t3tag", `Top 3 · projeto ${n}`)).join("")}
  <p class="areas t-leg">Tributário, contábil, crédito e cobrança, preço e custo, caixa e bancos, orçamento e investimento, compliance e riscos, sistemas e agentes de inteligência artificial, pessoas, governança e estratégia.</p>`;
  const q = (s) => c.querySelector(s);
  const fases = [...c.querySelectorAll(".fase")], amostras = [...c.querySelectorAll(".amostra")], tags = [...c.querySelectorAll(".t3tag")];
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "inteiro", disco: { acesos: 0 }, luz: { a: 1.1 } });
  fases.forEach((el, i) => M.ancorar(el, M.posSetor(i, 1.16)));
  tags.forEach((el, k) => M.ancorar(el, M.posIndice(COD(k + 1), 0.64)));
  const miolos = (els) => els.map((e) => e.querySelector(".miolo"));
  tl.set([q(".topo"), q(".areas"), ...miolos(fases), ...amostras, ...miolos(tags)], { opacity: 0 }, 0);
  M.luzPara(tl, { a: 3.0 }, 30, 0, "none");
  M.irPara(tl, "topoDir", 2.2, 0, {}, "power2.inOut");
  cascata(tl, [q(".topo")], 0, 0.6, 1.0, 14);
  tl.to(M.disco, { acesos: 208, duration: 2.6, ease: "none" }, 2.0);
  miolos(fases).forEach((m, i) => cascata(tl, [m], 0, 2.0 + 2.6 * acum[i] / 208 - 0.15, 0.6, 6));
  marco(tl, "mapa", 5.0);
  // a volta: a câmera passa rápido; cada fase fica ~2 s legível (as amostras se sobrepõem)
  tl.to([...miolos(fases), q(".topo")], { opacity: 0, duration: 0.5 }, 9.4);
  const th0 = M.angSetor(0), th9 = M.angSetor(9), durVolta = 17;
  const orb = { raio: 1.78, alt: 0.44, alvoR: 0.70, alvoY: 0.20, fov: 30 };
  M.irPara(tl, direcaoCam(M, th0, orb), 1.8, 9.4);
  M.orbitar(tl, { de: th0, ate: th9, ...orb }, durVolta, 11.2, "none");
  amostras.forEach((m, i) => {
    const t = 11.2 + durVolta * (M.angSetor(i) - th0) / (th9 - th0);
    tl.fromTo(m, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", immediateRender: false }, t - 0.9);
    tl.to(m, { opacity: 0, duration: 0.3 }, t + 1.05);
  });
  marco(tl, "volta", 11.2);
  M.irPara(tl, "topoDir", 2.4, 28.2, {}, "power3.inOut");
  cascata(tl, [q(".topo")], 0, 29.0, 0.9, 10);
  cascata(tl, miolos(fases), 0.04, 29.4, 0.5, 6);
  cascata(tl, [q(".areas")], 0, 30.0, 0.9, 10);
  marco(tl, "areas", 30.8);
  tl.to(M.disco, { top3: 1, duration: 0.9, ease: "power2.out" }, 33.4);
  tl.to(M.disco, { pulso: 1, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, 33.8);
  cascata(tl, miolos(tags), 0.2, 33.9, 0.7, 8);
  marco(tl, "fim", 34.6);
  tl.to([q(".topo"), q(".areas"), ...miolos(fases), ...miolos(tags)], { opacity: 0, duration: 0.6 }, 39.6);
  return tl;
}
function direcaoCam(M, th, o) {
  const cpos = direcao(th, o.raio, o.alt), a = direcao(th, o.alvoR, o.alvoY);
  return { x: cpos.x, y: cpos.y, z: cpos.z, tx: a.x, ty: a.y, tz: a.z, fov: o.fov };
}

// ============================================================================ 2 · o cenário e a história
export function historia(c, ctx) {
  const M = ctx.mundo, H = HISTORIA(ctx.base, ctx.R), R = ctx.R;
  c.className = "cena c-hist";
  const Rt = H.retrato;
  c.innerHTML = `<div class="quadro qa"><p class="rotulo">${Rt.topo}</p><h1 class="t-titulo">${Rt.titulo}</h1>
    <div class="fatos">${Rt.fatos.map(([n, t]) => `<div><b class="num">${n}</b><span>${t}</span></div>`).join("")}</div><p class="fonte">${Rt.fonte}</p></div>
  <div class="quadro qb"><h1 class="t-titulo">${H.ebitda.titulo}</h1></div>
  <div class="quadro qc"><h1 class="t-titulo">${H.pagamentos.titulo}</h1><p class="t-leg">Cada ponto, dez pagamentos.</p></div>
  <div class="quadro qd"><h1 class="t-titulo">${H.caixa.titulo}</h1></div>
  <div class="quadro qe"><h1 class="t-display">${H.dor}</h1><div class="faixa">${H.faixa.map(([n, t]) => `<div><b class="num">${n}</b>${t}</div>`).join("")}</div></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "topoDir", disco: { acesos: 208 }, luz: { a: 3.0 } });
  tl.set(c.querySelectorAll(".quadro"), { opacity: 0 }, 0);
  const G = M.grafico({ origem: M.v3(0, 0.0, 0.45) });
  // barras: 45 unidades num anel (A), três EBITDA (B), rendimento × custo (D)
  const specs = [];
  const n = ctx.base.rede.unidades;
  for (let i = 0; i < n; i++) {
    const th = (i + 0.5) / n * TAU, v = 0.55 + 0.45 * Math.abs(Math.sin(i * 2.37) * Math.cos(i * 0.71));
    specs.push({ pos: direcao(th, 0.62, 0.0), giro: -th, y0: 0, h: 0.06 + 0.16 * v, w: 0.034, cor: i % 11 === 0 ? "ouro" : "marfim", cheio: 0.7, raio: 0.004 });
  }
  const eb = H.ebitda.valores, sE = 0.82 / 50;
  eb.forEach(([, v], i) => specs.push({ x: -0.62 + i * 0.62, y0: 0, h: v / 1e6 * sE, w: 0.30, cor: i === 0 ? "marfim" : "ouro", cheio: 0.72 }));
  const sT = 0.82 / 36;
  specs.push({ x: -0.34, y0: 0, h: H.caixa.rend * sT, w: 0.34, cor: "marfim", cheio: 0.7 }, { x: 0.34, y0: 0, h: H.caixa.custo * sT, w: 0.34, cor: "ouro", cheio: 0.75 });
  const B = M.definirBarras(G, specs);
  const anel = B.slice(0, n), bE = B.slice(n, n + 3), bD = B.slice(n + 3);
  // rótulos dos gráficos
  // o nome de cada barra fica acima do valor, no escuro, e não sobre o mostrador
  const labE = eb.map(([t, v], i) => [rot(c, M, G.ponto(-0.62 + i * 0.62, v / 1e6 * sE + 0.02), "val c", `<b class="num">R$ ${r1(v)} mi</b>`, 0, -24), rot(c, M, G.ponto(-0.62 + i * 0.62, v / 1e6 * sE + 0.02), "cat c", t, 0, -72)]).flat();
  const labD = [rot(c, M, G.ponto(-0.34, H.caixa.rend * sT + 0.02), "val c", `<b class="num">${F.pct(H.caixa.rend)}</b>`, 0, -24), rot(c, M, G.ponto(-0.34, H.caixa.rend * sT + 0.02), "cat c", "rendimento do caixa parado", 0, -72),
    rot(c, M, G.ponto(0.34, H.caixa.custo * sT + 0.02), "val c ouro", `<b class="num">${F.pct(H.caixa.custo)}</b>`, 0, -24), rot(c, M, G.ponto(0.34, H.caixa.custo * sT + 0.02), "cat c", "custo da conta garantida", 0, -72)];
  // pagamentos: 2.280 pontos, um a cada dez; os dourados são a parte de pessoa única
  // 76 colunas × 30 linhas (a matriz mais baixa deixa o título livre)
  const colsP = 76, linhasP = 30, nP = colsP * linhasP, ouroA = Math.round(nP * (1 - H.pagamentos.pct / 100)), dxP = 0.027, dyP = 0.0215, x0P = -(colsP - 1) * dxP / 2;
  const cel = []; for (let k = 0; k < nP; k++) { const cx = Math.floor(k / linhasP), cy = k % linhasP; cel.push({ x: x0P + cx * dxP, y: 0.06 + cy * dyP, cor: k >= ouroA ? "ouro" : "marfim", tam: k >= ouroA ? 0.019 : 0.015 }); }
  const Mz = M.definirMatriz(G, cel);
  const topoP = 0.06 + (linhasP - 1) * dyP + 0.04;
  const labC = [rot(c, M, G.ponto(x0P, topoP), "cat e", `${F.n(R.seg.pagamentos.titulos - R.seg.pagamentos.pessoa_unica_titulos)} pagamentos com segunda pessoa`, 0, -14),
    rot(c, M, G.ponto(x0P + (colsP - 1) * dxP, topoP), "cat d ouro", `${F.n(R.seg.pagamentos.pessoa_unica_titulos)} com uma pessoa só`, 0, -14)];
  // A · o retrato da rede
  M.irPara(tl, PLANO_RETRATO, 3.0, 0);
  M.luzPara(tl, { a: 4.4 }, 12, 0);
  tl.set(q(".qa"), { opacity: 1 }, 0.6);
  aparecer(tl, q(".qa").querySelectorAll(".rotulo, h1"), 0.6, 0.8, 0.15);
  crescer(tl, anel, 1.2, 0.9, 0.035);
  aparecer(tl, q(".qa").querySelectorAll(".fatos div"), 3.2, 0.7, 0.25);
  aparecer(tl, q(".qa .fonte"), 4.4, 0.8);
  marco(tl, "q1", 3.2);
  // B · o EBITDA com três números
  sumir(tl, q(".qa"), 15.0); apagar(tl, anel, 15.0, 0.7);
  M.irPara(tl, M.planoGrafico(G, { x: 0, y: 0.55, dist: 4.2, fov: 20, alt: 0.35 }), 2.2, 15.0);
  tl.set(q(".qb"), { opacity: 1 }, 15.8); aparecer(tl, q(".qb h1"), 15.8, 0.9);
  crescer(tl, bE, 16.8, 1.2, 0.25);
  aparecer(tl, labE, 17.8, 0.6, 0.12);
  marco(tl, "q2", 16.8);
  // C · os pagamentos
  sumir(tl, [q(".qb"), ...labE], 27.0); apagar(tl, bE, 27.0);
  tl.set(q(".qc"), { opacity: 1 }, 27.6); aparecer(tl, q(".qc").children, 27.6, 0.9, 0.2);
  tl.set(Mz, { a: 1 }, 28.4); tl.fromTo(Mz, { n: 0 }, { n: 1, duration: 2.6, ease: "power1.inOut" }, 28.4);
  aparecer(tl, labC, 30.8, 0.6, 0.3);
  marco(tl, "q3", 28.4);
  // D · o caixa parado
  sumir(tl, [q(".qc"), ...labC], 41.0); tl.to(Mz, { a: 0, duration: 0.6 }, 41.0);
  tl.set(q(".qd"), { opacity: 1 }, 41.6); aparecer(tl, q(".qd h1"), 41.6, 0.9);
  crescer(tl, bD, 42.6, 1.2, 0.35);
  aparecer(tl, labD, 43.6, 0.6, 0.12);
  marco(tl, "q4", 42.6);
  // E · a pergunta
  sumir(tl, [q(".qd"), ...labD], 53.0); apagar(tl, bD, 53.0);
  M.irPara(tl, PLANO_RETRATO, 3.0, 53.0);
  M.luzPara(tl, { expo: 0.5 }, 2.4, 53.2);
  tl.set(q(".qe"), { opacity: 1 }, 53.6);
  cascata(tl, [q(".qe h1")], 0, 53.8, 1.1, 14);
  cascata(tl, q(".qe").querySelectorAll(".faixa div"), 0.16, 55.2);
  marco(tl, "fim", 56.6);
  sumir(tl, q(".qe"), 64.6, 0.7);
  M.luzPara(tl, { expo: 1 }, 1.2, 64.6);
  return tl;
}

// ============================================================================ 3 · o Top 3 e a escolha
export function top3Cena(c, ctx) {
  const M = ctx.mundo;
  c.className = "cena c-top3";
  const P = top3();
  c.innerHTML = `<div class="topo"><h1 class="t-titulo">Começamos pelo Top 3.</h1><p class="t-lead">Três projetos escolhidos por usarem documentos que a sua empresa já produz e por trazerem, em dez dias, um achado que muda uma decisão.</p></div>
  <div class="topo escolha"><h1 class="t-titulo">Escolha o projeto que quer ver funcionando.</h1><p class="t-leg">Toque no cartão ou tecle 1, 2 ou 3.</p></div>
  <p class="dica-escolha">Toque num cartão ou tecle 1, 2 ou 3 para ver o projeto funcionando.</p>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "inteiro", disco: { top3: 1 }, luz: { a: 1.4 } });
  const Ls = [0, 1, 2].map((i) => lamT3(M, i));
  Ls.forEach((L, i) => M.definirLamina(i, L.de, L.para, { raio: L.raio, ouro: 0.25, escuro: 0.84 }));
  const cartoes = P.map((p, i) => folha(c, M, i, CARTAO.w, CARTAO.h, "cartao", `<div class="n">Projeto ${p.n}</div><h3>${p.nome}</h3><p class="perg">${p.pergunta}</p><h4>O que usa</h4><ul>${p.usa.map((u) => `<li>${u}</li>`).join("")}</ul><h4>O que você recebe</h4><ul>${p.recebe.map((u) => `<li>${u}</li>`).join("")}</ul>`));
  cartoes.forEach((d, i) => d.setAttribute("data-escolha", String(i + 1)));
  tl.set([...c.querySelectorAll(".topo"), ...cartoes], { opacity: 0 }, 0);
  M.irPara(tl, "top3", 2.6, 0);
  M.luzPara(tl, { a: 2.4 }, 16, 0);
  M.luzPara(tl, { expo: 0.62 }, 1.6, 2.0);
  cascata(tl, [q(".topo")], 0, 0.4, 1.0, 12);
  [0, 1, 2].forEach((i) => { tl.set(M.laminas[i], { a: 1 }, 2.2 + i * 0.18); tl.to(M.laminas[i], { p: 1, duration: 1.8, ease: "power3.inOut" }, 2.2 + i * 0.18); });
  cartoes.forEach((d, i) => tl.to(d, { opacity: 1, duration: 0.7, ease: "power1.out" }, 4.0 + i * 0.25));
  tl.set(q(".dica-escolha"), { opacity: 0 }, 0);
  tl.call(() => { ctx.podeEscolher = true; }, null, 4.2);
  tl.to(q(".dica-escolha"), { opacity: 1, duration: 0.6 }, 5.0);
  marco(tl, "leitura", 4.2);
  // um cartão de cada vez em primeiro plano
  sumir(tl, q(".topo"), 10.8);
  let t = 11.0;
  [0, 1, 2].forEach((i) => {
    M.irPara(tl, M.planoFrente(Ls[i].para, CARTAO.h / 1080, 26), 1.5, t, {}, "power3.inOut");
    tl.to(cartoes.filter((_, k) => k !== i), { opacity: 0.2, duration: 0.6 }, t);
    tl.to(cartoes[i], { opacity: 1, duration: 0.6 }, t);
    [0, 1, 2].forEach((k) => tl.to(M.laminas[k], { a: k === i ? 1 : 0.35, duration: 0.6 }, t));
    marco(tl, `p${i + 1}`, t);
    t += 9.0;
  });
  M.irPara(tl, "top3", 1.6, t, {}, "power3.inOut");
  tl.to(cartoes, { opacity: 1, duration: 0.6 }, t);
  [0, 1, 2].forEach((k) => tl.to(M.laminas[k], { a: 1, duration: 0.6 }, t));
  tl.set(q(".topo.escolha"), { opacity: 0 }, 0);
  tl.to(q(".dica-escolha"), { opacity: 0, duration: 0.4 }, t + 0.4);
  cascata(tl, [q(".topo.escolha")], 0, t + 0.6, 0.8, 10);
  tl.call(() => ctx.abrirEscolha && ctx.abrirEscolha(), null, t + 1.6);
  marco(tl, "escolha", t + 1.6);
  tl.to({}, { duration: 0.6 }, t + 1.6);
  // a escolha (a qualquer momento depois que os cartões aparecem): os outros cartões saem, a câmera volta
  // à fila e a peça segue para o formulário do projeto escolhido
  tl.saida = (n) => {
    tl.pause();
    const s = gsap().timeline(), k = n - 1;
    s.to(cartoes.filter((_, j) => j !== k), { opacity: 0, duration: 0.5 }, 0);
    s.to(cartoes[k], { opacity: 1, duration: 0.4 }, 0);
    [0, 1, 2].forEach((j) => s.to(M.laminas[j], { a: j === k ? 1 : 0, duration: 0.6 }, 0));
    s.to([...c.querySelectorAll(".topo"), q(".dica-escolha")], { opacity: 0, duration: 0.4 }, 0);
    M.irPara(s, "top3", 1.2, 0.05, {}, "power3.inOut");
    s.call(() => ctx.proximaCena && ctx.proximaCena(), null, 1.3);
    return s;
  };
  return tl;
}

// ============================================================================ 4 · o formulário se preenche
function campoHTML(cp) {
  const cls = ["v", cp.t === "texto" ? "texto" : "", cp.alerta ? "alerta" : ""].filter(Boolean).join(" ");
  return `<div class="campo"><label>${cp.l}</label><div class="${cls}"><span class="txt">${cp.v || ""}</span></div></div>`;
}
function blocoHTML(b) {
  let corpo = "";
  if (b.tabela) corpo = `<table><thead><tr>${b.tabela.cab.map((h, i) => `<th class="${i === 0 ? "e" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${b.tabela.linhas.map((l) => `<tr class="vazia">${l.map((v, i) => `<td class="${i === 0 ? "e" : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  if (b.matriz) corpo = `<div class="mz"><div class="mz-cab"><span></span>${b.matriz.passos.map((p) => `<i>${p}</i>`).join("")}</div>${b.matriz.pessoas.map((p) => `<div class="mz-l vazia"><span>${p.cargo}</span>${p.acessos.map((a) => `<i class="${a ? "s" : ""}"></i>`).join("")}</div>`).join("")}</div>`;
  if (b.campos) corpo = b.campos.map(campoHTML).join("");
  return `<div class="bloco ${b.largo ? "largo" : ""}"><h3>${b.titulo} <span>${b.origem}</span></h3>${corpo}</div>`;
}
export function formulario(c, ctx) {
  const M = ctx.mundo, n = ctx.projeto, C = ctx.C, f = C.formulario;
  c.className = "cena c-form";
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "top3", disco: { top3: 1 }, luz: { a: 2.4, expo: 0.62 } });
  const pag = folha(c, M, n - 1, RET_FOLHA.width, RET_FOLHA.height, "papel form",
    `<div class="cab"><img src="${LOGO_ESC}" alt="SWOT WEALTH"><span>Checklist de insumos · Projeto ${n} · ${C.proj.nome}</span></div>
    <div class="titulo"><h1>O formulário do projeto.</h1><p>Cada projeto tem as suas perguntas. As respostas saem dos documentos e do sistema que a empresa já tem, em um dia.</p>
    <div class="prog"><b><span class="cnt">0</span> de ${f.total}</b><span>campos preenchidos</span><i style="--p:0%"></i></div></div>
    <div class="blocos p${n}">${f.blocos.map(blocoHTML).join("")}</div>
    <div class="selo">${f.selo}</div>`);
  const q = (s) => c.querySelector(s);
  const L = lamT3(M, n - 1), destino = poseFolha(M);
  M.definirLamina(n - 1, L.para, destino, { raio: 0.012, ouro: 0.25, escuro: 0.84 });
  tl.set(M.laminas[n - 1], { p: 0, a: 1, e: 0, branco: 0 }, 0);
  tl.to(M.laminas[n - 1], { p: 1, duration: 1.5, ease: "power3.inOut" }, 0.1);
  tl.to(M.laminas[n - 1], { branco: 1, duration: 0.8, ease: "power1.in" }, 0.6);
  M.irPara(tl, PLANO_FOLHA, 1.6, 0.1, {}, "power3.inOut");
  M.luzPara(tl, { expo: 0.8, a: 3.2 }, 30, 0.1);
  tl.set(pag, { opacity: 0 }, 0);
  tl.to(pag, { opacity: 1, duration: 0.35 }, 1.45);
  tl.set([q(".cab"), q(".titulo"), q(".blocos"), q(".selo")], { opacity: 0 }, 0);
  cascata(tl, [q(".cab"), q(".titulo")], 0.15, 1.6, 0.7, 8);
  tl.to(q(".blocos"), { opacity: 1, duration: 0.5 }, 2.3);
  const cnt = q(".cnt"), prog = q(".prog i");
  const blocos = [...c.querySelectorAll(".bloco")];
  const unidades = blocos.map((b) => b.querySelectorAll(".campo").length + b.querySelectorAll("tr.vazia, .mz-l.vazia").length);
  const tot = unidades.reduce((s, x) => s + x, 0);
  let k = 0;
  const bump = () => { k += 1; cnt.textContent = Math.min(f.total, Math.round(f.total * k / tot)); prog.style.setProperty("--p", `${Math.min(100, 100 * k / tot).toFixed(0)}%`); };
  tl.addLabel("preencher", 2.7);
  let t = 2.8;
  blocos.forEach((b) => {
    tl.to(blocos.filter((x) => x !== b), { opacity: 0.4, duration: 0.3 }, t);
    tl.to(b, { opacity: 1, duration: 0.3 }, t);
    const linhas = [...b.querySelectorAll("tr.vazia, .mz-l.vazia")];
    linhas.forEach((tr, i) => { tl.fromTo(tr, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, t + 0.2 + i * 0.16); tl.call(() => bump(), null, t + 0.2 + i * 0.16); });
    if (linhas.length) t += 0.2 + linhas.length * 0.16 + 0.3;
    [...b.querySelectorAll(".campo")].forEach((cp) => {
      // o valor já está escrito na folha; entra com um deslize curto (só composição, sem redesenhar o texto)
      const v = cp.querySelector(".v"), d = 0.28;
      tl.fromTo(v, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: d, ease: "power2.out", immediateRender: false }, t);
      tl.call(() => bump(), null, t + 0.1);
      t += 0.2;
    });
    t += 0.35;
  });
  tl.to(blocos, { opacity: 1, duration: 0.5 }, t);
  tl.call(() => { cnt.textContent = f.total; prog.style.setProperty("--p", "100%"); }, null, t);
  cascata(tl, [q(".selo")], 0, t + 0.2, 0.8, 6);
  marco(tl, "fim", t + 0.8);
  tl.to({}, { duration: 4.2 }, t + 0.8);
  return tl;
}

// ============================================================================ 5 · a análise, os dez dias e os sócios
export function analise(c, ctx) {
  const M = ctx.mundo, C = ctx.C, S = SOCIOS;
  c.className = "cena c-analise";
  const nos = C.parede.nos;
  c.innerHTML = `<div class="topo"><h1 class="t-titulo">A análise.</h1></div>
  ${nos.map((no) => { const i = no.t.indexOf(" · "); const a = i > 0 ? no.t.slice(0, i) : no.t, b = i > 0 ? no.t.slice(i + 3) : ""; return ancora(`no ${no.ouro ? "ouro" : ""}`, no.ouro ? `<span>${a}</span><b>${b}</b>` : `<span>${no.t}</span>`); }).join("")}
  <p class="rod t-leg">Toda conta tem memória. Nenhum valor é contado duas vezes.</p>
  <div class="dias"><h2 class="t-titulo">Dez dias.</h2><div class="linha">${DIAS.map((d) => `<div><b>${d[0]}</b><span>${d[1]}</span></div>`).join("")}</div></div>
  <div class="socios"><h2 class="t-titulo">Os sócios.</h2><div class="grade">${[S.joao, S.brendon, S.guilherme, S.ryan].map((s) => `<div><b>${s.nome}</b><p>${s.hist}</p></div>`).join("")}</div></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: PLANO_FOLHA, disco: { top3: 1 }, luz: { a: 3.2, expo: 0.8 } });
  // a folha do formulário volta a ser lâmina e se desfaz em pontos
  const flut = M.poseRet({ left: 1330, top: 290, width: 420, height: 540 }, "analise", 2.2);
  M.definirLamina(3, poseFolha(M), flut, { raio: 0.02 });
  tl.set(M.laminas[3], { p: 0, a: 1, e: 0, branco: 1 }, 0);
  tl.to(M.laminas[3], { p: 1, duration: 1.8, ease: "power3.inOut" }, 0.2);
  tl.to(M.laminas[3], { branco: 0, duration: 1.2, ease: "power1.out" }, 0.8);
  M.irPara(tl, "analise", 2.0, 0.2, {}, "power3.inOut");
  const P = M.prepararGrafo(C.parede, flut);
  const ancs = [...c.querySelectorAll(".no")];
  // o deslocamento do rótulo vai ao GSAP em porcentagem: a entrada anima x e não pode apagar o alinhamento
  const PCT = { "": [0, -50], esq: [-100, -50], cima: [-50, -100], baixo: [-50, 0] };
  const lados = ladosDoGrafo(M, P, C.parede, ancs), miolosG = ancs.map((a) => a.querySelector(".miolo"));
  miolosG.forEach((m) => gsap().getProperty(m, "x"));            // lê tudo antes de escrever: um recálculo de estilo só
  lados.forEach(([cls, dx, dy], i) => { if (cls) ancs[i].classList.add(cls); gsap().set(miolosG[i], { xPercent: PCT[cls][0], yPercent: PCT[cls][1] }); M.ancorar(ancs[i], P[i], dx, dy); });
  tl.set([q(".topo"), q(".rod"), q(".dias"), q(".socios"), ...ancs.map((a) => a.querySelector(".miolo"))], { opacity: 0 }, 0);
  tl.set(M.dados, { fase: 0, a: 0 }, 0);
  tl.to(M.dados, { a: 1, duration: 0.8 }, 1.6);
  tl.to(M.laminas[3], { a: 0, duration: 1.0 }, 3.0);
  tl.to(M.dados, { fase: 1, duration: 2.2, ease: "power2.inOut" }, 2.2);
  tl.to(M.dados, { fase: 2, duration: 2.8, ease: "power2.inOut" }, 4.4);
  cascata(tl, [q(".topo")], 0, 2.4, 1.0, 12);
  tl.set(M.grafo, { a: 1 }, 5.0);
  tl.to(M.grafo, { nos: 1, duration: 3.0, ease: "none" }, 5.0);
  tl.to(M.grafo, { desenho: 1, duration: 4.2, ease: "none" }, 5.4);
  ancs.forEach((a, i) => tl.fromTo(a.querySelector(".miolo"), { opacity: 0, x: -6 }, { opacity: nos[i].ouro ? 1 : 0.8, x: 0, duration: 0.5, immediateRender: false }, 5.2 + 3.0 * i / nos.length));
  M.irPara(tl, "analise", 16, 3.0, { cam: { x: -1.2, y: 1.1, z: 2.8 } }, "sine.inOut");
  M.luzPara(tl, { a: 4.6, expo: 1 }, 17, 2.0);
  cascata(tl, [q(".rod")], 0, 9.6);
  marco(tl, "contas", 10.2);
  tl.to([q(".rod"), q(".topo")], { opacity: 0, duration: 0.5 }, 19.0);
  tl.to(ancs.map((a) => a.querySelector(".miolo")), { opacity: 0, duration: 0.6 }, 19.0);
  tl.to([M.grafo, M.dados], { a: 0, duration: 0.8 }, 19.0);
  tl.set(q(".dias"), { opacity: 1 }, 19.4);
  cascata(tl, [q(".dias h2")], 0, 19.4, 0.8, 10);
  cascata(tl, c.querySelectorAll(".dias .linha div"), 0.2, 19.9, 0.6, 8);
  marco(tl, "dias", 19.4);
  tl.to(q(".dias"), { opacity: 0, duration: 0.5 }, 28.6);
  tl.to([M.grafo, M.dados], { a: 0, duration: 1.0 }, 28.6);
  M.irPara(tl, "socios", 3.2, 28.6);
  M.luzPara(tl, { a: 6.0 }, 20, 28.6);
  tl.set(q(".socios"), { opacity: 1 }, 29.6);
  cascata(tl, [q(".socios h2")], 0, 29.6, 0.8, 10);
  cascata(tl, c.querySelectorAll(".socios .grade div"), 0.22, 30.1, 0.8, 10);
  marco(tl, "socios", 29.6);
  tl.to(q(".socios"), { opacity: 0, duration: 0.5 }, 47.4);
  tl.to({}, { duration: 0.6 }, 47.4);
  return tl;
}

// Tamanho de um rótulo do grafo sem pedir layout à página (a montagem da cena não pode forçar reflow).
let _medida;
function medidaRotulo(no) {
  const k = _medida || (_medida = document.createElement("canvas").getContext("2d"));
  const larg = (fonte, t) => { k.font = fonte; return k.measureText(t).width; };
  const i = no.t.indexOf(" · ");
  if (!no.ouro || i < 0) return { w: larg("400 18px Inter", no.t), h: 23 };
  return { w: Math.max(larg("400 18px Inter", no.t.slice(0, i)), larg("600 27px 'Inter Tight'", no.t.slice(i + 3))), h: 55 };
}

// Cada rótulo do grafo vai para o lado (direita, esquerda, acima, abaixo) em que nenhuma ligação o atravessa e
// nenhum outro rótulo ou nó o toca. A conta é feita na tela, com a câmera no meio da deriva da cena.
function ladosDoGrafo(M, P, parede, ancs) {
  const cam = M.plano("analise", { cam: { x: -0.6, y: 1.02, z: 2.92 } });
  const T = P.map((v) => M.naTela(v, cam));
  const segs = parede.lig.map(([a, b]) => [T[a], T[b]]);
  const dentro = (p, r) => p.x > r.x0 && p.x < r.x1 && p.y > r.y0 && p.y < r.y1;
  const corta = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); };
  const cruza = ([a, b], r) => {
    if (dentro(a, r) || dentro(b, r)) return true;
    const k = [{ x: r.x0, y: r.y0 }, { x: r.x1, y: r.y0 }, { x: r.x1, y: r.y1 }, { x: r.x0, y: r.y1 }];
    return k.some((p, i) => corta(a, b, p, k[(i + 1) % 4]));
  };
  const feitos = [];
  return ancs.map((el, i) => {
    const { w, h } = medidaRotulo(parede.nos[i]), { x, y } = T[i];
    const g = parede.nos[i].ouro ? 30 : 22, gv = 16;
    const op = [
      ["", g, 0, { x0: x + g, y0: y - h / 2, x1: x + g + w, y1: y + h / 2 }, 0],
      ["esq", -g, 0, { x0: x - g - w, y0: y - h / 2, x1: x - g, y1: y + h / 2 }, 0.1],
      ["cima", 0, -gv, { x0: x - w / 2, y0: y - gv - h, x1: x + w / 2, y1: y - gv }, 0.2],
      ["baixo", 0, gv, { x0: x - w / 2, y0: y + gv, x1: x + w / 2, y1: y + gv + h }, 0.3],
    ].map(([cls, dx, dy, r, pref]) => {
      const f = { x0: r.x0 - 4, y0: r.y0 - 4, x1: r.x1 + 4, y1: r.y1 + 4 };
      let custo = pref + segs.filter((sg) => cruza(sg, f)).length * 10 + T.filter((p, k) => k !== i && dentro(p, f)).length * 10;
      custo += feitos.filter((o) => o.x0 < f.x1 && o.x1 > f.x0 && o.y0 < f.y1 && o.y1 > f.y0).length * 20;
      if (r.x0 < 50 || r.x1 > 1870 || r.y0 < 230 || r.y1 > 1030) custo += 50;
      return { cls, dx, dy, r, custo };
    }).sort((a, b) => a.custo - b.custo);
    feitos.push(op[0].r);
    return [op[0].cls, op[0].dx, op[0].dy];
  });
}

// ============================================================================ 6 · o diagnóstico: gráficos no instrumento
// Cada quadro: título (o achado), subtítulo, o gráfico construído e lido de frente.
function montarQuadro(qd, c, M, G, specs, rots, linhas, matriz) {
  const faixa = (i, arr) => arr.slice(i[0], i[1]);
  const S = { barras: [], rots: [], linhas: [], matriz: false, plano: { x: 0, y: 0.55, dist: 4.4, fov: 20, alt: 0.32 } };
  const bar = (s) => { specs.push(s); S.barras.push(specs.length - 1); };
  const lab = (v, cls, html, dx = 0, dy = 0) => { const m = rot(c, M, v, cls, html, dx, dy); S.rots.push(m); rots.push(m); return m; };
  const lin = (s) => { linhas.push(s); S.linhas.push(linhas.length - 1); };
  const P = G.ponto;
  const pct = (v, cc = 1) => F.pct(v, cc);
  if (qd.id === "ebitda") {
    const sy = 0.74 / 50;
    const xs = [-0.86, -0.20, 0.72];              // a segunda barra fica longe da terceira: os ajustes cabem entre as duas
    qd.barras.forEach((b, i) => {
      const x = xs[i], h0 = b.base / 1e6 * sy;
      bar({ x, y0: 0, h: h0, w: 0.32, cor: "marfim", cheio: 0.72, topo: b.partes.length ? 0 : 1 });
      let y = h0;
      b.partes.forEach((p, k) => { const h = p.v / 1e6 * sy; bar({ x, y0: y, h, w: 0.32, cor: "ouro", cheio: 0.8, topo: k === b.partes.length - 1 ? 1 : 0, sobre: specs.length - 1 }); lab(P(x + 0.17, y + h / 2), "seg", `+ R$ ${r1(p.v)} mi <span>${p.t}</span>`, 10, k === 0 && b.partes.length > 1 ? 8 : k > 0 ? -12 : 0); y += h; });
      lab(P(x, y + 0.02), "val c", `<b class="num">R$ ${r1(b.base + b.partes.reduce((s, p) => s + p.v, 0))} mi</b>`, 0, -26);
      lab(P(x, y + 0.02), "cat c", b.rot, 0, -74);
    });
    S.plano = { x: 0.13, y: 0.50, dist: 4.6, fov: 20, alt: 0.3 };
  }
  if (qd.id === "ticket") {
    const sy = 0.66 / 160, xs = [-0.82, -0.3, 0.22];
    // o valor da barra recebida vai dentro dela; acima fica a parte dourada que falta até a tabela.
    // O nome de cada barra fica acima, no escuro, e não sobre o mostrador.
    const vT = qd.barras[0][1], vR = qd.barras[2][1];
    qd.barras.forEach(([t, v, s], i) => {
      bar({ x: xs[i], y0: 0, h: v * sy, w: 0.30, cor: i === 2 ? "verde" : "marfim", cheio: 0.72 });
      lab(i === 2 ? P(xs[i], v * sy - 0.05) : P(xs[i], v * sy + 0.02), "val c", `<b class="num">R$ ${v}</b>`, 0, i === 2 ? 0 : -26);
      lab(P(xs[i], (i === 2 ? vT : v) * sy + 0.02), "cat c", `${t}<span>${s}</span>`, 0, i === 2 ? -30 : -84);
    });
    bar({ x: xs[2], y0: vR * sy, h: (vT - vR) * sy, w: 0.30, cor: "ouro", cheio: 0.28, topo: 0, sobre: specs.length - 1 });
    lab(P(xs[2] + 0.17, (vR + (vT - vR) / 2) * sy), "seg", `R$ ${vT - vR} <span>por aluno, todo mês</span>`, 10, 0);
    lab(P(0.80, 0.30), "grande", `<b class="num">R$ ${r1(qd.numero)} mi</b><span>${qd.numeroRot}</span>`, 0, 0);
    S.plano = { x: 0.16, y: 0.50, dist: 4.6, fov: 20, alt: 0.3 };
  }
  if (qd.id === "matriz") {
    const cel = [], esp = 0.05, cx = [-0.86, 0.46];
    qd.linhas.forEach((l, i) => {
      const bl = i < 13 ? 0 : 1, row = i % 13, y = 0.84 - row * esp;
      lab(P(cx[bl] - 0.08, y), `ind ${l.divergente ? "ouro" : ""}`, l.nome, 0, 0);
      l.usos.forEach((u, k) => { if (u) cel.push({ x: cx[bl] + k * 0.1, y, cor: u === "d" ? "ouro" : "marfim", tam: u === "d" ? 0.034 : 0.022 }); });
    });
    ["conselho", "banco", "DRE", "painel", "orçamento"].forEach((d, k) => { lab(P(cx[0] + k * 0.1, 0.90), "col", d); lab(P(cx[1] + k * 0.1, 0.90), "col", d); });
    S.matriz = cel;
    S.plano = { x: 0.02, y: 0.62, dist: 4.5, fov: 20, alt: 0.2 };
  }
  if (qd.id === "pessoas") {
    const cel = [], esp = 0.045, x0 = -0.2, dxp = 0.13, y0p = 1.00;
    const incompat = new Set();
    qd.pessoas.forEach((p, i) => {
      const y = y0p - i * esp;
      lab(P(x0 - 0.08, y), `ind ${p.caminho ? "ouro" : ""}`, p.cargo, 0, 0);
      const emConflito = new Set(p.conflitos.flat());
      qd.passos.forEach((_, k) => { const id = "CBLAPQ"[k]; if (p.acessos.includes(id)) cel.push({ x: x0 + k * dxp, y, cor: emConflito.has(id) ? "ouro" : "marfim", tam: emConflito.has(id) ? 0.032 : 0.022 }); });
      if (p.caminho) lin({ pts: [[x0 - 0.02, y], [x0 + 4 * dxp + 0.02, y]], cor: "ouro" });
      incompat.add(i);
    });
    ["cadastra<br>fornecedor", "troca<br>conta", "lança<br>título", "aprova", "libera<br>no banco", "concilia"].forEach((ps, k) => lab(P(x0 + k * dxp, y0p), "colh", ps, 0, -62));
    S.matriz = cel;
    S.plano = { x: 0.1, y: 0.72, dist: 4.6, fov: 20, alt: 0.2 };
  }
  if (qd.id === "fluxo") {
    const tot = qd.partes.reduce((s, p) => s + p[1], 0), L = 2.1, sx = L / tot;
    let x = -1.05;
    qd.partes.forEach(([t, v], i) => { const w = v * sx; bar({ x: x + w / 2, y0: 0.34, h: 0.2, w, cor: i ? "ouro" : "marfim", cheio: 0.75, hor: true, topo: 0 }); lab(P(x + (i ? w - 0.02 : 0.02), 0.6), `val ${i ? "d ouro" : "e"}`, `<b class="num">R$ ${r1(v)} mi</b><span>${t}</span>`, 0, -10); x += w; });
    lab(P(-1.05, 0.26), "cat e", `${F.n(tot / 1e6, 1)} milhões pagos a fornecedores em doze meses`, 0, 10);
    S.plano = { x: 0.0, y: 0.5, dist: 4.4, fov: 20, alt: 0.3 };
  }
  const regua = (xa, xb, plano, dy) => { const m = lab(P((xa + xb) / 2, 0), "regua c", "", 0, dy); m.style.width = `${Math.round((xb - xa + 0.12) * M.pxPorUnidade(plano.dist, plano.fov))}px`; };
  if (qd.id === "meses") {
    const sy = 0.12, dx = 0.175, x0 = -0.96;
    regua(x0, x0 + 11 * dx, { dist: 4.4, fov: 20 }, 24);
    qd.meses.forEach((m, i) => {
      const x = x0 + i * dx, conf = qd.conf[i], sem = qd.total[i] - conf;
      if (conf) bar({ x, y0: 0, h: conf * sy, w: 0.11, cor: "marfim", cheio: 0.72, topo: sem ? 0 : 1 });
      if (sem) bar({ x, y0: conf * sy, h: sem * sy, w: 0.11, cor: "ouro", cheio: 0.8, sobre: conf ? specs.length - 1 : undefined });
      lab(P(x, qd.total[i] * sy + 0.02), "val c peq", `<b class="num">${qd.total[i]}</b>`, 0, -16);
      lab(P(x, 0), "cat c", m, 0, 24);
    });
    lab(P(1.08, 0.86), "leg d", `<i class="o"></i>sem confirmação<br><i></i>confirmadas por outro canal`, 0, 0);
    S.plano = { x: 0.1, y: 0.48, dist: 4.4, fov: 20, alt: 0.3 };
  }
  if (qd.id === "fontes") {
    const tot = qd.fontes.reduce((s, f) => s + f.saldo, 0), L = 2.1, sx = L / tot, sy = 0.70 / 36, gap = 0.018;
    let x = -1.05 - gap * (qd.fontes.length - 1) / 2;
    qd.fontes.forEach((f, i) => {
      const w = f.saldo * sx;
      bar({ x: x + w / 2, y0: 0, h: f.taxa * sy, w, cor: f.rot === "antecipação" ? "verde" : i === 0 ? "ouro" : "marfim", cheio: 0.7 });
      lab(P(x + w / 2, f.taxa * sy + 0.02), "val c peq", `<b class="num">${pct(f.taxa)}</b>`, 0, -18);
      lab(P(x + w / 2, f.taxa * sy + 0.02), "cat c", `${f.rot}<span>R$ ${r1(f.saldo)} mi</span>`, 0, -66);
      if (w > 0.3) lab(P(x + w / 2, f.taxa * sy * 0.80), "dentro c", `R$ ${r1(f.custo)} mi<span>por ano</span>`, 0, 0);
      x += w + gap;
    });
    lin({ pts: [[-1.1, qd.rendimento * sy], [1.12, qd.rendimento * sy]], cor: "marfim", tracejada: true });
    lab(P(1.12, qd.rendimento * sy), "seg", `${pct(qd.rendimento)} <span>rende o caixa parado</span>`, 10, 0);
    S.plano = { x: 0.20, y: 0.5, dist: 4.5, fov: 20, alt: 0.3 };
  }
  if (qd.id === "hoje" || qd.id === "depois") {
    const sy = 0.66 / 12e6, dx = 0.145, x0 = -0.96, S13 = qd.semanas;
    regua(x0, x0 + 12 * dx, { dist: qd.candidatos ? 4.9 : 4.5, fov: 20 }, 24);
    S13.forEach((v, i) => { bar({ x: x0 + i * dx, y0: 0, h: v * sy, w: 0.100, cor: qd.id === "hoje" ? "marfim" : "verde", cheio: 0.72 }); if (i % 2 === 0) lab(P(x0 + i * dx, 0), "cat c", `sem. ${i + 1}`, 0, 24); });
    // o rótulo de uma barra fica acima das vizinhas, para não encostar no vidro delas
    const acima = (i) => Math.max(...[i - 1, i, i + 1].filter((k) => k >= 0 && k < S13.length).map((k) => S13[k])) * sy + 0.02;
    lab(P(x0, acima(0)), "val c peq", `<b class="num">R$ ${r1(S13[0])} mi</b>`, 0, -18);
    const iMin = S13.indexOf(Math.min(...S13));
    lab(P(x0 + iMin * dx, acima(iMin)), "val c peq ouro", `<b class="num">R$ ${r1(S13[iMin])} mi</b><span>mínimo</span>`, 0, -30);
    lin({ pts: [[x0 - 0.08, qd.linha * sy], [x0 + 12 * dx + 0.08, qd.linha * sy]], cor: "ouro", tracejada: true });
    lab(P(x0 + 12 * dx + 0.08, qd.linha * sy), "seg", qd.linhaRot, 12, 0);
    if (qd.candidatos) lab(P(1.08, 0.78), "cand", `<h5>antecipação da agenda</h5>${qd.candidatos.map((cc) => `<div class="${cc.abaixo ? "" : "ok"}"><b>${cc.p}%</b><span>${cc.abaixo ? `${cc.abaixo} semanas abaixo do mínimo` : "nenhuma semana abaixo"}</span></div>`).join("")}`, 0, 0);
    S.plano = { x: qd.candidatos ? 0.2 : 0.05, y: 0.5, dist: qd.candidatos ? 4.9 : 4.5, fov: 20, alt: 0.3 };
  }
  if (qd.tiles) {
    const px = M.pxPorUnidade(4.4, 20), W0 = 560 / px, H0 = 220 / px, xs = [-0.44, 0.44], ys = [0.58, 0.20];
    qd.tiles.forEach((tt, i) => { const x = xs[i % 2], y = ys[Math.floor(i / 2)]; bar({ x, y0: y - H0 / 2, h: H0, w: W0, cor: "grafite", cheio: 0.0, topo: 0, escuro: 0.86, ouro: tt.d ? 0.5 : 0.15 }); lab(P(x, y), `tile c ${tt.d ? "d" : ""}`, `<b class="num">${tt.v}</b><p>${tt.t}</p><em>${tt.e}</em>`, 0, 0); });
    S.plano = { x: 0, y: 0.43, dist: 4.4, fov: 20, alt: 0.0 };
  }
  if (qd.acoes) {
    const max = Math.max(...qd.acoes.map((a) => a.v)), L = 1.05, sx = L / max, esp = 0.13, x0 = -0.1;
    qd.acoes.forEach((a, i) => { const y = 0.86 - i * esp, w = a.v * sx; bar({ x: x0 + w / 2, y0: y - 0.035, h: 0.07, w, cor: a.tipo === "certo" ? "ouro" : "marfim", cheio: 0.78, hor: true, topo: 0 }); lab(P(x0 - 0.05, y), "acao", `${a.t}<span>${a.tipo === "certo" ? "depende só da empresa" : a.nota || "depende de terceiros"}</span>`, 0, 0); lab(P(x0 + w + 0.03, y), "val e peq", `<b class="num">R$ ${F.n(Math.round(a.v / 1000))} mil</b>`, 0, 0); });
    lab(P(x0, 0.86 - 5 * esp + 0.03), "total", `<b class="num">R$ ${r1(qd.total)} mi</b> por ano · <b class="num ouro">R$ ${r1(qd.certo)} mi</b> certos`, 0, 0);
    S.plano = { x: 0.0, y: 0.5, dist: 4.5, fov: 20, alt: 0.25 };
  }
  return S;
}

export function diagnostico(c, ctx) {
  const M = ctx.mundo, C = ctx.C;
  c.className = "cena c-diag";
  c.innerHTML = `<div class="cabd"><span>${C.cabDiag}</span></div>${C.quadros.map((qd, i) => `<div class="qtit q${i}"><h1 class="t-titulo">${qd.titulo}</h1><p class="t-lead">${qd.sub}</p></div>`).join("")}`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "socios", disco: { top3: 1 }, luz: { a: 6.0, expo: 1 } });
  const G = M.grafico({ origem: M.v3(0, 0.02, 0.5) });
  const specs = [], rots = [], linhas = [];
  const Q = C.quadros.map((qd) => montarQuadro(qd, c, M, G, specs, rots, linhas));
  const B = M.definirBarras(G, specs);
  const Ls = M.definirLinhas(G, linhas);
  const comMatriz = Q.find((s) => s.matriz);
  const Mz = comMatriz ? M.definirMatriz(G, comMatriz.matriz) : null;
  tl.set([q(".cabd"), ...c.querySelectorAll(".qtit")], { opacity: 0 }, 0);
  cascata(tl, [q(".cabd")], 0, 0.3, 0.8, 6);
  M.luzPara(tl, { a: 9.0 }, 70, 0, "none");
  let t = 0.2;
  Q.forEach((S, i) => {
    const qd = C.quadros[i], tit = q(`.q${i}`);
    const plano = M.planoGrafico(G, S.plano);
    M.irPara(tl, plano, i === 0 ? 2.6 : 1.8, t, {}, "power3.inOut");
    M.irPara(tl, { ...plano, x: plano.x + 0.12, tx: plano.tx + 0.04 }, 12, t + (i === 0 ? 2.6 : 1.8), {}, "sine.inOut");     // deriva lenta
    tl.set(tit, { opacity: 1 }, t + 0.5);
    aparecer(tl, tit.children, t + 0.5, 0.8, 0.25);
    const tb = t + 1.5;
    const bs = S.barras.map((k) => B[k]);
    crescer(tl, bs, tb, 1.0, qd.id === "meses" || qd.id === "hoje" || qd.id === "depois" ? 0.06 : 0.14);
    S.linhas.forEach((k) => { tl.set(Ls[k], { a: 0.9 }, tb + 0.8); tl.fromTo(Ls[k], { desenho: 0 }, { desenho: 1, duration: 1.0, ease: "power2.inOut" }, tb + 0.8); });
    if (S.matriz && Mz) { tl.set(Mz, { a: 1 }, tb); tl.fromTo(Mz, { n: 0 }, { n: 1, duration: 2.2, ease: "power1.inOut" }, tb); }
    aparecer(tl, S.rots, tb + 0.9, 0.5, qd.id === "matriz" || qd.id === "pessoas" ? 0.03 : 0.08, 6);
    marco(tl, `q${i + 1}`, t);
    const dur = qd.id === "custo" ? 15 : 17;
    const fim = t + dur;
    if (i < Q.length - 1) {
      sumir(tl, [tit, ...S.rots], fim - 0.6, 0.5);
      apagar(tl, bs, fim - 0.6, 0.6);
      S.linhas.forEach((k) => tl.to(Ls[k], { a: 0, duration: 0.5 }, fim - 0.6));
      if (S.matriz && Mz) tl.to(Mz, { a: 0, duration: 0.5 }, fim - 0.6);
    }
    t = fim;
  });
  marco(tl, "fim", t - 10);
  tl.to({}, { duration: 0.1 }, t);
  return tl;
}

// ============================================================================ 7 · o entregável: o que chega à empresa
// As peças pousam sobre o instrumento; a câmera desce sobre cada uma.
// As peças ficam em volta do centro, sobre o vidro: os ponteiros, a tampa e a marca continuam à vista.
const PECAS = [
  { id: "capa", x: -0.56, z: 0.10, w: 0.40, h: 0.545, giro: 0.06, y: 0.022 },
  { id: "f0", x: -0.28, z: 0.56, w: 0.40, h: 0.545, giro: -0.04, y: 0.026 },
  { id: "f1", x: 0.20, z: 0.52, w: 0.40, h: 0.545, giro: 0.05, y: 0.024 },
  { id: "planilha", x: 0.58, z: 0.12, w: 0.50, h: 0.304, giro: -0.05, y: 0.028 },
  { id: "painel", x: 0.58, z: 0.47, w: 0.44, h: 0.275, giro: 0.04, y: 0.030 },
  { id: "devolutiva", x: -0.56, z: -0.50, w: 0.32, h: 0.195, giro: -0.07, y: 0.026 },
];
function htmlPeca(p, E, C) {
  if (p.id === "capa") return `<div class="capa"><img src="midia/marca/logo_horizontal_claro.svg" alt="SWOT WEALTH"><h2>${E.capa.titulo}</h2><p>${E.capa.sub}</p><ol>${E.capa.indice.map((x) => `<li>${x}</li>`).join("")}</ol></div>`;
  if (p.id === "f0" || p.id === "f1") {
    const f = E.folhas[p.id === "f0" ? 0 : 1];
    const linha = (l) => (l.length > 2 ? `<tr><td>${l[0]}<span class="q">${l[2]}</span></td><td class="d">${l[1]}</td></tr>` : `<tr>${l.map((v, i) => `<td class="${i ? "d" : ""}">${v}</td>`).join("")}</tr>`);
    const corpo = f.itens ? `<ol class="itens">${f.itens.map((x) => `<li>${x}</li>`).join("")}</ol>` : `<table class="${f.linhas[0].length > 2 ? "tres" : ""}">${f.linhas.map(linha).join("")}</table>`;
    return `<div class="pg"><div class="cab"><img src="${LOGO_ESC}" alt=""><span>${C.proj.nome}</span></div><h2>${f.titulo}</h2><p class="sub">${f.sub}</p>${corpo}</div>`;
  }
  if (p.id === "planilha") {
    const P = E.planilha;
    return `<div class="xl"><div class="xl-t"><i></i>${P.titulo}</div><table class="${P.cab.length > 5 ? "largo" : ""}"><thead><tr><th></th>${P.cab.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${P.linhas.slice(0, P.cab.length > 5 ? 13 : 14).map((l, i) => `<tr><td class="n">${i + 2}</td>${l.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  if (p.id === "painel") {
    const P = E.painel, max = Math.max(...P.valores);
    const barras = P.valores.map((v, i) => `<i style="height:${(100 * v / max).toFixed(1)}%" class="${P.tipo === "fluxo" && i === 1 ? "o" : ""}"></i>`).join("");
    const linha = P.linha ? `<em style="bottom:${(100 * P.linha / max).toFixed(1)}%"></em>` : "";
    return `<div class="pn"><div class="pn-t"><b>${P.titulo}</b><span>atualizado no fechamento de agosto</span></div><div class="pn-g ${P.tipo}">${barras}${linha}</div></div>`;
  }
  return `<div class="dv"><b>Devolutiva</b><span>${E.devolutiva}</span></div>`;
}
const LEGENDAS = { capa: ["O documento", "Diagnóstico e direcionamento, com o índice do que foi decidido."], f0: ["As folhas", "Cada achado com a sua conta e o que fazer."], f1: ["As regras", "Prontas para aprovar em ata e colocar no sistema."], planilha: ["A planilha", "Os mesmos números, para a empresa continuar no fechamento seguinte."], painel: ["O painel", "Uma tela que se atualiza a cada fechamento."], devolutiva: ["A devolutiva", "Uma hora e meia com os sócios, no nono dia."] };

export function entregavel(c, ctx) {
  const M = ctx.mundo, C = ctx.C, E = C.entregavel;
  c.className = "cena c-ent";
  c.innerHTML = `<div class="topo"><h1 class="t-titulo">O que o projeto entrega.</h1><p class="t-lead">Em documento, planilha e painel, com a devolutiva no nono dia.</p></div>
  <div class="leg-peca">${PECAS.map((p) => `<div data-p="${p.id}"><b>${LEGENDAS[p.id][0]}</b><span>${LEGENDAS[p.id][1]}</span></div>`).join("")}</div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "socios", disco: { top3: 1, vidro: 0.4 }, luz: { a: 9.0, expo: 1 } });
  const OCUPA = 0.74;
  const poses = PECAS.map((p) => M.poseDeitada(M.v3(p.x, p.y, p.z), p.w, p.h, p.giro));
  const origem = M.poseRet({ left: 860, top: 440, width: 200, height: 200 }, "socios", 1.3);
  const els = PECAS.map((p, i) => {
    M.definirLamina(i, origem, poses[i], { raio: p.id === "painel" || p.id === "devolutiva" ? 0.012 : 0.006, escuro: p.id === "painel" || p.id === "devolutiva" ? 0.9 : 0, ouro: p.id === "devolutiva" ? 0.4 : 0.1 });
    const hpx = Math.round(OCUPA * 1080 * (p.id === "painel" || p.id === "planilha" || p.id === "devolutiva" ? 0.62 / OCUPA : 1)), wpx = Math.round(hpx * p.w / p.h);
    return folha(c, M, i, wpx, hpx, `peca ${p.id} ${p.id === "painel" || p.id === "devolutiva" ? "escura" : "papel"}`, htmlPeca(p, E, C));
  });
  tl.set([q(".topo"), ...els, ...c.querySelectorAll(".leg-peca div")], { opacity: 0 }, 0);
  // as peças pousam no instrumento
  const VISTA = { x: -1.0, y: 3.7, z: 0.9, tx: -0.95, ty: 0, tz: 0.12, fov: 34 };
  M.irPara(tl, VISTA, 2.8, 0, {}, "power3.inOut");
  PECAS.forEach((p, i) => {
    tl.set(M.laminas[i], { p: 0, a: 0, e: 0, branco: 0 }, 0);
    tl.to(M.laminas[i], { a: 1, duration: 0.3 }, 0.5 + i * 0.16);
    tl.to(M.laminas[i], { p: 1, duration: 1.6, ease: "power3.inOut" }, 0.5 + i * 0.16);
    if (!(p.id === "painel" || p.id === "devolutiva")) tl.to(M.laminas[i], { branco: 1, duration: 0.6 }, 1.2 + i * 0.16);
    tl.to(els[i], { opacity: 1, duration: 0.5 }, 2.0 + i * 0.16);
  });
  cascata(tl, [q(".topo")], 0, 1.2, 0.9, 10);
  M.correrRelogio(tl, 3.6, 5.0, 0.3);          // enquanto as peças pousam, o relógio corre e assenta
  marco(tl, "mesa", 1.2);
  let t = 5.2;
  const ordem = ["capa", "f0", "f1", "planilha", "painel", "devolutiva"], tempos = { capa: 7, f0: 8, f1: 7, planilha: 6.5, painel: 6, devolutiva: 5 };
  sumir(tl, q(".topo"), t - 0.2);
  ordem.forEach((id) => {
    const i = PECAS.findIndex((p) => p.id === id), pose = poses[i];
    const oc = id === "painel" || id === "planilha" || id === "devolutiva" ? 0.62 : OCUPA;
    M.irPara(tl, M.planoFrente(pose, oc, 26, 0, 0), 1.6, t, {}, "power3.inOut");
    // só a peça lida fica inteira; as vizinhas viram vidro apagado, sem texto
    PECAS.forEach((_, k) => { tl.to(els[k], { opacity: k === i ? 1 : 0, duration: 0.6 }, t + (k === i ? 0 : 0.15)); tl.to(M.laminas[k], { a: k === i ? 1 : 0.22, duration: 0.7 }, t + (k === i ? 0 : 0.15)); });
    const leg = q(`.leg-peca [data-p="${id}"]`);
    aparecer(tl, leg, t + 0.8, 0.6);
    marco(tl, id, t);
    t += tempos[id];
    sumir(tl, leg, t - 0.4, 0.4);
  });
  M.irPara(tl, VISTA, 2.2, t, {}, "power3.inOut");
  PECAS.forEach((_, k) => { tl.to(els[k], { opacity: 1, duration: 0.8 }, t + 0.3); tl.to(M.laminas[k], { a: 1, duration: 0.8 }, t + 0.3); });
  marco(tl, "fim", t + 0.4);
  tl.to({}, { duration: 2.4 }, t);
  return tl;
}

// ============================================================================ 8 · o resultado
export function resultado(c, ctx) {
  const M = ctx.mundo, C = ctx.C, E = C.entregavel, R = C.resultado;
  c.className = "cena c-res";
  c.innerHTML = `<div class="bloco-r"><p class="rotulo">Projeto ${ctx.projeto} · ${C.proj.nome}</p><h1 class="t-titulo">No décimo dia, o resultado.</h1>
    <b class="num grande">${R.numero}</b><p class="leg1">${R.legenda}</p><p class="t-leg sub">${R.sub}</p>
    <div class="selos"><span>diagnóstico</span><span>documento e planilha</span><span>painel</span><span>devolutiva de 1h30</span></div></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: { x: -1.0, y: 3.7, z: 0.9, tx: -0.95, ty: 0, tz: 0.12, fov: 34 }, disco: { top3: 1, vidro: 0.4 }, luz: { a: 9.0 } });
  const poses = PECAS.map((p) => M.poseDeitada(M.v3(p.x, p.y, p.z), p.w, p.h, p.giro));
  const els = PECAS.map((p, i) => {
    M.definirLamina(i, poses[i], poses[i], { raio: p.id === "painel" || p.id === "devolutiva" ? 0.012 : 0.006, escuro: p.id === "painel" || p.id === "devolutiva" ? 0.9 : 0, ouro: p.id === "devolutiva" ? 0.4 : 0.1 });
    tl.set(M.laminas[i], { p: 1, a: 1, e: 0, branco: p.id === "painel" || p.id === "devolutiva" ? 0 : 1 }, 0);
    const hpx = Math.round(0.74 * 1080 * (p.id === "painel" || p.id === "planilha" || p.id === "devolutiva" ? 0.62 / 0.74 : 1)), wpx = Math.round(hpx * p.w / p.h);
    return folha(c, M, i, wpx, hpx, `peca ${p.id} ${p.id === "painel" || p.id === "devolutiva" ? "escura" : "papel"}`, htmlPeca(p, E, C));
  });
  M.irPara(tl, { x: -1.08, y: 3.55, z: 0.95, tx: -1.0, ty: 0, tz: 0.12, fov: 34 }, 14, 0, {}, "sine.inOut");
  M.luzPara(tl, { a: 10.4 }, 14, 0);
  M.assentarRelogio(tl, 10 + 10 / 60, 5.2, 1.4);   // o relógio volta as horas e assenta em 10h10 com o número
  tl.set([q(".bloco-r"), ...q(".bloco-r").children], { opacity: 0 }, 0);
  tl.set(q(".bloco-r"), { opacity: 1 }, 0.8);
  aparecer(tl, [q(".rotulo"), q("h1")], 0.8, 0.8, 0.15);
  aparecer(tl, q(".grande"), 2.0, 0.9);
  aparecer(tl, [q(".leg1"), q(".sub")], 2.6, 0.7, 0.2);
  aparecer(tl, q(".selos"), 3.4, 0.7);
  marco(tl, "fim", 3.6);
  sumir(tl, [q(".bloco-r"), ...els], 13.6, 0.6);
  PECAS.forEach((_, i) => tl.to(M.laminas[i], { a: 0, duration: 0.8 }, 13.6));
  tl.to({}, { duration: 0.4 }, 14.2);
  return tl;
}

// ============================================================================ 9 · a oferta
export function oferta(c, ctx) {
  const M = ctx.mundo;
  c.className = "cena c-oferta";
  c.innerHTML = `<div class="topo"><h1 class="t-display">Um projeto.<br>R$ 10.000.<br>Até dez dias.</h1></div>
  <div class="ficha">
    <div class="k">O que você recebe</div><div class="v">O diagnóstico, as folhas com o direcionamento, a planilha, o painel e duas sessões com os sócios: a de decisão, entre o quarto e o sexto dia, e a devolutiva, no nono.</div>
    <div class="k">O prazo</div><div class="v">Dez dias corridos, contados do dia útil seguinte à confirmação de que os insumos chegaram completos.</div>
    <div class="k">O que não está incluído</div><div class="v">A implantação: ajustes no sistema, negociação com banco ou credenciadora e contratações. A empresa executa com o roteiro entregue.</div>
    <div class="k">O que não prometemos</div><div class="v">Retorno garantido. Os valores são estimativas com memória de cálculo.</div>
  </div>
  <p class="amb">O Top 3 é a entrada. Cada projeto abre os seguintes, dentro dos 208.</p>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: { x: -1.0, y: 3.7, z: 0.9, tx: -0.95, ty: 0, tz: 0.12, fov: 34 }, disco: { top3: 1 }, luz: { a: 0.6 } });
  M.irPara(tl, "oferta", 3.0, 0, {}, "power3.inOut");
  M.luzPara(tl, { a: 2.8 }, 34, 0);
  tl.set(c.querySelectorAll(".topo, .ficha > div, .amb"), { opacity: 0 }, 0);
  cascata(tl, [q(".topo")], 0, 1.2, 1.0, 14);
  cascata(tl, c.querySelectorAll(".ficha > div"), 0.1, 2.6, 0.6, 8);
  marco(tl, "ficha", 2.6);
  tl.to(M.disco, { pulso: 1, duration: 0.6, yoyo: true, repeat: 1, ease: "sine.inOut" }, 26.0);
  cascata(tl, [q(".amb")], 0, 26.2, 0.9, 10);
  marco(tl, "fim", 27.2);
  tl.to(c.querySelectorAll(".topo, .ficha, .amb"), { opacity: 0, duration: 0.8 }, 33.4);
  return tl;
}

// ============================================================================ 10 · fecho
export function fecho(c, ctx) {
  const M = ctx.mundo;
  c.className = "cena c-abre c-fecho";
  c.innerHTML = `<div class="leg"><p class="l1">Inteligência financeira para a sua empresa, projeto a projeto.</p></div>`;
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "oferta", disco: { top3: 1 } });
  M.irPara(tl, "macro", 4.0, 0.2, {}, "power3.inOut");
  M.luzPara(tl, { a: 1.6 }, 9, 0);
  M.irPara(tl, "rasante", 4.2, 4.6, {}, "power3.inOut");
  tl.set(c.querySelectorAll(".leg p"), { opacity: 0 }, 0);
  cascata(tl, [c.querySelector(".l1")], 0, 7.4, 1.1, 10);
  marco(tl, "fim", 8.6);
  return tl;
}

export const ORDEM = [
  { id: "abertura", f: abertura, nome: "Abertura" },
  { id: "projetos208", f: projetos208, nome: "Os 208 projetos" },
  { id: "historia", f: historia, nome: "O cenário" },
  { id: "top3", f: top3Cena, nome: "O Top 3 e a escolha" },
  { id: "formulario", f: formulario, nome: "O formulário se preenche", projeto: true },
  { id: "analise", f: analise, nome: "A análise", projeto: true },
  { id: "diagnostico", f: diagnostico, nome: "O diagnóstico", projeto: true },
  { id: "entregavel", f: entregavel, nome: "O entregável", projeto: true },
  { id: "resultado", f: resultado, nome: "O resultado", projeto: true },
  { id: "oferta", f: oferta, nome: "A oferta" },
  { id: "fecho", f: fecho, nome: "Fecho" },
];
