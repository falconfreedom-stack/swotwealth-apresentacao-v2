// Peças comuns às cenas: rótulos presos ao 3D, entradas e saídas, folhas coladas às lâminas, barras de vidro,
// planos fixos de câmera, o montador de quadros do diagnóstico e as peças do entregável.
// Todo número vem do motor, via conteudo.js.
import { F, g } from "../util.js?v=202610071930";
import { TOP3_CODIGOS } from "../conteudo.js?v=202610071930";
import { direcao } from "../mundo.js?v=202610071930";

export const gsap = () => g();
export const marco = (tl, nome, t) => tl.addLabel(nome, t);
export const LOGO_ESC = "midia/marca/logo_horizontal.svg";
export const TAU = Math.PI * 2;
export const COD = (n) => Object.keys(TOP3_CODIGOS).find((k) => TOP3_CODIGOS[k] === n);
export const ancora = (cls, html) => `<div class="anc ${cls}"><div class="miolo">${html}</div></div>`;
export const r1 = (v) => F.n(v / 1e6, 1);

// Rótulo HTML preso a um ponto 3D; devolve o miolo (que recebe as animações).
export function rot(c, M, v, cls, html, dx = 0, dy = 0) {
  c.insertAdjacentHTML("beforeend", ancora(cls, html));
  const el = c.lastElementChild; M.ancorar(el, v, dx, dy);
  const m = el.querySelector(".miolo"); m.style.opacity = 0; return m;
}
// O estado inicial vai direto no estilo e a animação só se inicializa quando começa: montar a cena sem que o
// GSAP leia e escreva o estilo de cada elemento em sequência (um recálculo de estilo por elemento).
export const aparecer = (tl, els, t, dur = 0.6, cada = 0.06, y = 10) => { const l = (els instanceof Element ? [els] : Array.from(els || [])).filter(Boolean); if (!l.length) return; l.forEach((e) => { e.style.opacity = "0"; }); tl.fromTo(l, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur, ease: "power2.out", stagger: cada, immediateRender: false }, t); };
export const sumir = (tl, els, t, dur = 0.5) => { const l = [].concat(els).filter(Boolean); if (l.length) tl.to(l, { opacity: 0, duration: dur, ease: "power1.in" }, t); };
// Folha HTML colada a uma lâmina (tamanho de layout em px = tamanho na leitura, para o texto sair nítido).
export function folha(c, M, i, w, h, cls, html) {
  const d = document.createElement("div"); d.className = `folha3d ${cls}`; d.style.width = `${w}px`; d.style.height = `${h}px`; d.innerHTML = html;
  c.appendChild(d); M.colar(d, i, w, h); return d;
}
// Cresce um conjunto de barras (estados de mundo.js) em cascata, com uma animação só para o conjunto inteiro
// (o anel de 45 unidades seriam 90 animações a criar na montagem da cena).
export const crescer = (tl, bs, t, dur = 1.0, cada = 0.08, ease = "power3.out") => {
  if (!bs.length) return;
  const e = gsap().parseEase(ease), total = dur + cada * (bs.length - 1), p = { v: 0 };
  const aplicar = () => { const tt = p.v * total; for (let i = 0; i < bs.length; i++) { const x = (tt - i * cada) / dur; bs[i].a = x >= 0 ? 1 : 0; bs[i].k = x <= 0 ? 0 : x >= 1 ? 1 : e(x); } };
  bs.forEach((b) => { b.k = 0; });
  tl.fromTo(p, { v: 0 }, { v: 1, duration: total, ease: "none", onUpdate: aplicar, immediateRender: false }, t);
};
export const apagar = (tl, bs, t, dur = 0.6) => bs.forEach((b) => tl.to(b, { a: 0, duration: dur, ease: "power1.in" }, t));

// ---------------------------------------------------------------------------------------------
// Planos fixos da v2
export const PLANO_FOLHA = { x: 0, y: 1.0, z: 3.35, tx: 0, ty: 0.80, tz: 0, fov: 30 };
export const RET_FOLHA = { left: 190, top: 112, width: 1540, height: 880 };
export const RET_T3 = [0, 1, 2].map((i) => ({ left: 150 + i * 560, top: 318, width: 500, height: 623 }));
// tamanho do cartão do Top 3 quando a câmera para de frente; na fila ele aparece a 500/610 disso, por isso nenhum texto do cartão fica abaixo de 22 px
export const CARTAO = { w: 610, h: 760 };
export function lamT3(M, i) {
  const cod = COD(i + 1), ix = M.top3[cod];
  const para = M.poseRet(RET_T3[i], "top3", 1.6);
  return { de: M.poseDeitada(direcao(ix.ang, 0.86), 0.012, 0.05, ix.ang), para, raio: para.w * 26 / 500 };
}
export const poseFolha = (M) => M.poseRet(RET_FOLHA, PLANO_FOLHA, 2.6);
// o instrumento à direita, no alto, com o texto no escuro da esquerda (retrato da rede e a pergunta)
export const PLANO_RETRATO = { x: -0.72, y: 2.25, z: 2.75, tx: -1.35, ty: 0, tz: 0.05, fov: 30 };

export function direcaoCam(M, th, o) {
  const cpos = direcao(th, o.raio, o.alt), a = direcao(th, o.alvoR, o.alvoY);
  return { x: cpos.x, y: cpos.y, z: cpos.z, tx: a.x, ty: a.y, tz: a.z, fov: o.fov };
}

// ---------------------------------------------------------------------------------------------
// formulário
export function campoHTML(cp) {
  const cls = ["v", cp.t === "texto" ? "texto" : "", cp.alerta ? "alerta" : ""].filter(Boolean).join(" ");
  return `<div class="campo"><label>${cp.l}</label><div class="${cls}"><span class="txt">${cp.v || ""}</span></div></div>`;
}
export function blocoHTML(b) {
  let corpo = "";
  if (b.tabela) corpo = `<table><thead><tr>${b.tabela.cab.map((h, i) => `<th class="${i === 0 ? "e" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${b.tabela.linhas.map((l) => `<tr class="vazia">${l.map((v, i) => `<td class="${i === 0 ? "e" : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  if (b.matriz) corpo = `<div class="mz"><div class="mz-cab"><span></span>${b.matriz.passos.map((p) => `<i>${p}</i>`).join("")}</div>${b.matriz.pessoas.map((p) => `<div class="mz-l vazia"><span>${p.cargo}</span>${p.acessos.map((a) => `<i class="${a ? "s" : ""}"></i>`).join("")}</div>`).join("")}</div>`;
  if (b.campos) corpo = b.campos.map(campoHTML).join("");
  return `<div class="bloco ${b.largo ? "largo" : ""}"><h3>${b.titulo} <span>${b.origem}</span></h3>${corpo}</div>`;
}

// ---------------------------------------------------------------------------------------------
// grafo da análise
// Tamanho de um rótulo do grafo sem pedir layout à página (a montagem da cena não pode forçar reflow).
export let _medida;
export function medidaRotulo(no) {
  const k = _medida || (_medida = document.createElement("canvas").getContext("2d"));
  const larg = (fonte, t) => { k.font = fonte; return k.measureText(t).width; };
  const i = no.t.indexOf(" · ");
  if (!no.ouro || i < 0) return { w: larg("400 18px Inter", no.t), h: 23 };
  return { w: Math.max(larg("400 18px Inter", no.t.slice(0, i)), larg("600 27px 'Inter Tight'", no.t.slice(i + 3))), h: 55 };
}

// Cada rótulo do grafo vai para o lado (direita, esquerda, acima, abaixo) em que nenhuma ligação o atravessa e
// nenhum outro rótulo ou nó o toca. A conta é feita na tela, com a câmera no meio da deriva da cena.
export function ladosDoGrafo(M, P, parede, ancs) {
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
export function montarQuadro(qd, c, M, G, specs, rots, linhas, matriz) {
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

// ============================================================================ 7 · o entregável: o que chega à empresa
// As peças pousam sobre o instrumento; a câmera desce sobre cada uma.
// As peças ficam em volta do centro, sobre o vidro: os ponteiros, a tampa e a marca continuam à vista.
export const PECAS = [
  { id: "capa", x: -0.56, z: 0.10, w: 0.40, h: 0.545, giro: 0.06, y: 0.022 },
  { id: "f0", x: -0.28, z: 0.56, w: 0.40, h: 0.545, giro: -0.04, y: 0.026 },
  { id: "f1", x: 0.20, z: 0.52, w: 0.40, h: 0.545, giro: 0.05, y: 0.024 },
  { id: "planilha", x: 0.58, z: 0.12, w: 0.50, h: 0.304, giro: -0.05, y: 0.028 },
  { id: "painel", x: 0.58, z: 0.47, w: 0.44, h: 0.275, giro: 0.04, y: 0.030 },
  { id: "devolutiva", x: -0.56, z: -0.50, w: 0.32, h: 0.195, giro: -0.07, y: 0.026 },
];
export function htmlPeca(p, E, C) {
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
export const LEGENDAS = { capa: ["O documento", "Diagnóstico e direcionamento, com o índice do que foi decidido."], f0: ["As folhas", "Cada achado com a sua conta e o que fazer."], f1: ["As regras", "Prontas para aprovar em ata e colocar no sistema."], planilha: ["A planilha", "Os mesmos números, para a empresa continuar no fechamento seguinte."], painel: ["O painel", "Uma tela que se atualiza a cada fechamento."], devolutiva: ["A devolutiva", "Uma hora e meia com os sócios, no nono dia."] };
