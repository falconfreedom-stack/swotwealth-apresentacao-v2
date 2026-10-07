// Abertura e cenário (a ser substituído pela cena reconhecível e pelo retrato da rede de óticas).
import { F, cascata } from "../util.js?v=202610071930";
import { HISTORIA } from "../conteudo.js?v=202610071930";
import { direcao } from "../mundo.js?v=202610071930";
import { gsap, marco, TAU, r1, rot, aparecer, sumir, crescer, apagar, PLANO_RETRATO } from "./comum.js?v=202610071930";

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
