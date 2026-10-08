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
// Ritmo: tempos de leitura, paradas do apresentador, revelação por linha e foco por atenuação
// (estudo/pesquisa/20-pitch-e-motion.md, tabela B.3 e regras C.2).
//
// Leitura mínima de um bloco: orientação (0,5 s; 1,0 s logo depois de câmera ou corte) + caracteres ÷ 12,5 +
// 0,5 s por número com unidade; piso de 1,5 s (2,0 s com número).
export function leitura(texto, opc = {}) {
  const t = String(texto || "").replace(/<[^>]+>/g, " ").replace(/\s+\/\s+/g, " ").replace(/\s+/g, " ").trim();
  // "10×" também é número: depois de "×" ou "x" o fim de palavra é "nem letra nem dígito" (o \b falhava no ×)
  const nums = (t.match(/(R\$\s?[\d.,]+(\s?(mi|mil|bi))?|[\d.,]+\s?%|\d+[.,]?\d*\s?(dias|semanas|meses|lojas|vezes|×|x)(?![\p{L}\d]))/giu) || []).length;
  const base = (opc.depoisDeCamera ? 1.0 : 0.5) + t.length / (opc.v || 12.5) + 0.5 * nums;
  return Math.max(nums ? 2.0 : 1.5, base);
}
// Parada do apresentador: marco `nome` no tempo t. No modo assistir, a peça segue sozinha e a próxima batida
// começa em t + hold (o tempo de leitura ou de pensar). No modo apresentar, a linha do tempo espera ali o →
// (ou o espaço) e, ao seguir, pula direto para t + hold: a fala já ocupou esse tempo.
export function parada(tl, ctx, nome, t, hold) {
  tl.addLabel(nome, t);
  (tl.paradas || (tl.paradas = [])).push({ nome, t, ate: t + hold });
  tl.call(() => { if (ctx && ctx.esperar) ctx.esperar(tl, t, t + hold); }, null, t);
}
// Texto com quebras autorais (" / " ou "\n") em linhas com máscara: cada linha sobe de dentro de si mesma.
export const linhas = (texto) => String(texto).split(/\s\/\s|\n/).map((l) => `<span class="l"><span>${l}</span></span>`).join("");
// Revela as linhas de um ou mais elementos (montados com `linhas`): 0,6 s expo.out, 0,1 s entre linhas.
// O elemento continua visível; cada linha fica escondida dentro da própria máscara (.l) até a sua vez.
export function revelar(tl, els, t, dur = 0.6, cada = 0.1) {
  const l = (els instanceof Element ? [els] : Array.from(els || [])).filter(Boolean);
  const spans = l.flatMap((e) => Array.from(e.querySelectorAll(".l > span")));
  if (!spans.length) { aparecer(tl, l, t, dur); return; }
  tl.set(spans, { yPercent: 108 }, 0);
  tl.fromTo(spans, { yPercent: 108 }, { yPercent: 0, duration: dur, ease: "expo.out", stagger: cada, immediateRender: false }, t);
}
// Esconde as linhas de volta (saída curta, 60% da entrada), para a mesma região receber outro texto.
export function recolher(tl, els, t, dur = 0.35) {
  const l = (els instanceof Element ? [els] : Array.from(els || [])).filter(Boolean);
  const spans = l.flatMap((e) => Array.from(e.querySelectorAll(".l > span")));
  if (!spans.length) { sumir(tl, l, t, dur); return; }
  tl.to(spans, { yPercent: -108, duration: dur, ease: "power2.in", stagger: 0.04 }, t);
}
// Foco por atenuação: o que não é o assunto cai para `nivel` de opacidade; `focar` devolve ao normal.
export const atenuar = (tl, els, t, nivel = 0.32, dur = 0.5) => { const l = [].concat(els).filter(Boolean); if (l.length) tl.to(l, { opacity: nivel, duration: dur, ease: "power2.out" }, t); };
export const focar = (tl, els, t, dur = 0.4) => { const l = [].concat(els).filter(Boolean); if (l.length) tl.to(l, { opacity: 1, duration: dur, ease: "power2.out" }, t); };
// Texto sem marcação (para medir leitura) e hold de gráfico (B.3): 1,5 + 0,5 × rótulos + 2 × comparações, teto 8 s.
export const textoPuro = (html) => String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+\/\s+/g, " ").replace(/\s+/g, " ").trim();
export const holdGrafico = (rotulos = 2, comparacoes = 1) => Math.min(8, 1.5 + 0.5 * rotulos + 2 * comparacoes);

// Leitura em sequência (o modelo do roteiro): cada bloco é lido a partir de quando entra ou de quando o anterior
// termina, o que vier depois. `fim` é quando o último termina; o hold de uma parada em t é `fim − t + 0,5`.
// O hold só vale no modo assistir (no apresentar, o → pula o hold e a fala ocupa o tempo): ali não há fala junto,
// e a velocidade é a do cartão só de texto da pesquisa (15 car/s, tabela B.3). Rótulos curtos se olham (`olhar`).
export function leitor(t0 = 0) {
  let fim = t0;
  return {
    ler(t, texto, opc = {}) { fim = Math.max(t, fim) + leitura(texto, { v: 15, ...opc }); return fim; },
    olhar(t, s) { fim = Math.max(t, fim) + s; return fim; },          // tempo de olhar um gráfico (hold de gráfico)
    hold(t, respiro = 0.5) { return Math.max(1.0, fim - t + respiro); },
    get fim() { return fim; },
    zerar(t) { fim = t; },
  };
}

// ---------------------------------------------------------------------------------------------
// Lâmina com um caminho de várias poses (subir do mostrador → ficar em fila → empilhar → virar a folha...).
// O mundo leva cada lâmina de `de` a `para`; aqui as duas são a mesma pose "viva", que acompanha `st.s` pelas
// poses da lista (0 = a primeira, 1 = a segunda...). `ir` anima `st.s` com o GSAP e marca o mundo para redesenhar;
// como é um tween como outro qualquer, buscar qualquer tempo da linha do tempo dá a pose certa.
export function caminho(M, poses) {
  const st = { s: 0 }, n = poses.length - 1;
  const v = poses[0].pos.clone(), q = poses[0].quat.clone();
  const seg = () => { const s = Math.max(0, Math.min(n, st.s)), k = Math.min(n - 1, Math.floor(s)); return [k, s - k]; };
  const viva = {
    get pos() { const [k, f] = seg(); return v.copy(poses[k].pos).lerp(poses[k + 1].pos, f); },
    get quat() { const [k, f] = seg(); return q.copy(poses[k].quat).slerp(poses[k + 1].quat, f); },
    get w() { const [k, f] = seg(); return poses[k].w + (poses[k + 1].w - poses[k].w) * f; },
    get h() { const [k, f] = seg(); return poses[k].h + (poses[k + 1].h - poses[k].h) * f; },
    get deitada() { const [k, f] = seg(); return !!(f < 0.5 ? poses[k] : poses[k + 1]).deitada; },
  };
  const ir = (tl, a, b, dur, pos, ease = "power3.inOut") => tl.fromTo(st, { s: a }, { s: b, duration: dur, ease, immediateRender: false, onUpdate: () => M.marcar() }, pos);
  return { st, viva, ir };
}
// Anima um uniforme de uma lâmina (ex.: o ouro do vidro), redesenhando o mundo.
export function uniformeLamina(tl, M, i, nome, de, para, dur, pos, ease = "power2.inOut") {
  const u = M.objLaminas[i].material.uniforms[nome], p = { v: de };
  tl.fromTo(p, { v: de }, { v: para, duration: dur, ease, immediateRender: false, onUpdate: () => { u.value = p.v; M.marcar(); } }, pos);
}
// Pose de uma lâmina deitada sobre o índice de um projeto (de onde as folhas da lente saem e para onde voltam).
export const poseIndice = (M, codigo = "FIN3.10", r = 0.86) => { const ix = M.top3[codigo]; return M.poseDeitada(direcao(ix.ang, r, 0.006), 0.012, 0.05, ix.ang); };

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
// A lente: o mostrador inteiro à direita, visto do alto com um pouco de inclinação; o índice do FIN3.10 fica
// embaixo, à direita; a coluna da esquerda fica no escuro, para o texto e os cartões dos insumos.
export const PLANO_LENTE = { x: -0.86, y: 3.95, z: 1.25, tx: -0.80, ty: 0, tz: 0.16, fov: 34 };
// O entregável e o resultado: o mostrador grande à direita (o relógio legível), a coluna da esquerda livre.
export const PLANO_MESA = { x: -1.25, y: 3.2, z: 1.9, tx: -1.05, ty: 0, tz: 0.1, fov: 34 };
// "Isto é um projeto.": o mostrador inteiro, de cima, com folga para os 208 índices.
export const PLANO_UM = { x: -0.42, y: 4.2, z: 0.55, tx: -0.42, ty: 0, tz: 0.06, fov: 34 };

export function direcaoCam(M, th, o) {
  const cpos = direcao(th, o.raio, o.alt), a = direcao(th, o.alvoR, o.alvoY);
  return { x: cpos.x, y: cpos.y, z: cpos.z, tx: a.x, ty: a.y, tz: a.z, fov: o.fov };
}

// ---------------------------------------------------------------------------------------------
// formulário
export function campoHTML(cp) {
  const cls = ["v", cp.t === "texto" ? "texto" : "", cp.alerta ? "alerta" : ""].filter(Boolean).join(" ");
  return `<div class="campo"${cp.foco != null ? ` data-foco="${cp.foco}"` : ""}><label>${cp.l}</label><div class="${cls}"><span class="txt">${cp.v || ""}</span></div></div>`;
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
// As medidas seguem estilos/cenas-lente.css (.c-analise .no): 22 px nos nós comuns, 28 px nos dourados.
export let _medida;
export function medidaRotulo(no) {
  const k = _medida || (_medida = document.createElement("canvas").getContext("2d"));
  const larg = (fonte, t) => { k.font = fonte; return k.measureText(t).width; };
  const i = no.t.indexOf(" · ");
  if (no.ouro && i < 0) return { w: larg("600 28px 'Inter Tight'", no.t), h: 34 };
  if (!no.ouro || i < 0) return { w: larg("400 22px Inter", no.t), h: 28 };
  return { w: Math.max(larg("400 22px Inter", no.t.slice(0, i)), larg("600 28px 'Inter Tight'", no.t.slice(i + 3))), h: 62 };
}

// Cada rótulo do grafo vai para o lado (direita, esquerda, acima, abaixo) em que nenhuma ligação o atravessa e
// nenhum outro rótulo ou nó o toca. A conta é feita na tela, no plano em que a câmera fica parada (`plano`).
export function ladosDoGrafo(M, P, parede, ancs, plano) {
  const cam = plano || M.plano("analise", { cam: { x: -0.6, y: 1.02, z: 2.92 } });
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
// O gráfico entra em estágios (B.3): régua e barras → nomes e valores → legenda e destaque. Cada rótulo cai
// num grupo pela classe (S.g); listas (ações, cartões) entram uma linha por vez (S.seq). `S.fim` e `S.nota`
// entram depois da lista.
const GRUPO = [["regua", "regua"], ["val", "valores"], ["cat", "nomes"], ["ind", "nomes"], ["colh", "nomes"], ["col", "nomes"], ["acao", "nomes"],
  ["leg", "legenda"], ["cand", "legenda"], ["seg", "destaque"], ["grande", "destaque"], ["total", "destaque"], ["tile", "destaque"], ["dentro", "destaque"]];
const grupoDe = (cls) => { const k = cls.split(/\s+/); const g = GRUPO.find(([c]) => k.includes(c)); return g ? g[1] : "nomes"; };
export function montarQuadro(qd, c, M, G, specs, rots, linhas, matriz) {
  const S = { barras: [], rots: [], linhas: [], matriz: false, plano: { x: 0, y: 0.55, dist: 4.4, fov: 20, alt: 0.32 },
    g: { regua: [], valores: [], nomes: [], legenda: [], destaque: [] }, seq: null, fim: [], nota: [] };
  const bar = (s) => { specs.push(s); S.barras.push(specs.length - 1); return specs.length - 1; };
  const lab = (v, cls, html, dx = 0, dy = 0, grupo) => { const m = rot(c, M, v, cls, html, dx, dy); S.rots.push(m); rots.push(m); if (grupo !== false) S.g[grupo || grupoDe(cls)].push(m); return m; };
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
  if (qd.id === "venda") {
    // R$ mil por loja e mês: orçamento, pedidos no painel e receita do DRE; a parte dourada é o que separa pedido de entrega
    const sy = 0.615 / Math.max(...qd.barras.map((b) => b[1])), xs = [-0.82, -0.3, 0.22];
    const vT = qd.barras[1][1], vR = qd.barras[2][1];
    qd.barras.forEach(([t, v, sb], i) => {
      bar({ x: xs[i], y0: 0, h: v * sy, w: 0.30, cor: i === 2 ? "verde" : "marfim", cheio: 0.72 });
      lab(i === 2 ? P(xs[i], v * sy - 0.05) : P(xs[i], v * sy + 0.02), "val c", `<b class="num">R$ ${F.n(v)} mil</b>`, 0, i === 2 ? 0 : -26);
      lab(P(xs[i], (i === 2 ? vT : v) * sy + 0.02), "cat c", `${t}<span>${sb}</span>`, 0, i === 2 ? -30 : -84);
    });
    bar({ x: xs[2], y0: vR * sy, h: (vT - vR) * sy, w: 0.30, cor: "ouro", cheio: 0.5, topo: 0, sobre: specs.length - 1 });
    lab(P(xs[2] + 0.17, (vR + (vT - vR) / 2) * sy), "seg", `R$ ${F.n(vT - vR)} mil <span>${qd.gapRot}</span>`, 10, 0);
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
      if (!qd.semValores) lab(P(x, qd.total[i] * sy + 0.02), "val c peq", `<b class="num">${qd.total[i]}</b>`, 0, -16);   // a lente compacta não numera cada barra (≤ 3 números novos)
      lab(P(x, 0), "cat c", m, 0, 26);
    });
    lab(P(1.08, 0.86), "leg d", `<i class="o"></i>sem confirmação<br><i></i>confirmadas por outro canal`, 0, 0);
    S.plano = { x: 0.1, y: 0.48, dist: 4.4, fov: 20, alt: 0.3 };
  }
  // ---- FIN3.10: custo de cada fonte. Largura = saldo médio, altura = taxa efetiva ao ano (a área é o custo).
  // Recebível vendido (antecipação) em ouro; dívidas em vidro. Rótulos: nome e taxa sobre cada barra; o custo do
  // ano só na barra destacada (a maior fonte); a linha tracejada é o que rende o caixa aplicado.
  if (qd.id === "fontes") {
    const tot = qd.fontes.reduce((s, f) => s + f.saldo, 0), L = 2.0, sx = L / tot, sy = 0.66 / Math.max(36, ...qd.fontes.map((f) => f.taxa)), gap = 0.03;
    let x = -L / 2 - gap * (qd.fontes.length - 1) / 2;
    qd.fontes.forEach((f) => {
      const w = Math.max(0.05, f.saldo * sx), dest = f.id === qd.destaque;
      bar({ x: x + w / 2, y0: 0, h: f.taxa * sy, w, cor: f.id === "antecipacao" ? "ouro" : "marfim", cheio: dest ? 0.78 : 0.6 });
      lab(P(x + w / 2, f.taxa * sy + 0.02), `val c peq ${dest ? "ouro" : ""}`, `<b class="num">${pct(f.taxa)}</b>`, 0, -20);
      lab(P(x + w / 2, f.taxa * sy + 0.02), "cat c", f.rot, 0, -64);
      if (dest) lab(P(x + w / 2, f.taxa * sy * 0.5), "dentro c", `${qd.custoRot(f.custo)}<span>por ano</span>`, 0, 0);
      x += w + gap;
    });
    lin({ pts: [[-L / 2 - 0.08, qd.rendimento * sy], [L / 2 + 0.16, qd.rendimento * sy]], cor: "marfim", tracejada: true });
    lab(P(L / 2 + 0.16, qd.rendimento * sy), "seg", `${pct(qd.rendimento)} <span>${qd.rendimentoRot}</span>`, 10, 0);
    S.plano = { x: 0.06, y: 0.42, dist: 4.6, fov: 20, alt: 0.3 };
  }
  // ---- FIN3.10: treze semanas (hoje e com a regra). Barra larga = menor saldo de caixa da semana; barra fina ao
  // lado = conta garantida sacada (hoje) ou o estresse (com a regra); linha tracejada = saldo mínimo de referência.
  if (qd.id === "hoje" || qd.id === "depois") {
    const sy = 0.66 / Math.max(12e6, ...qd.semanas), dx = 0.15, x0 = -0.9, S13 = qd.semanas, lado = qd.garantida || qd.estresse;
    regua(x0, x0 + 12 * dx, { dist: 4.5, fov: 20 }, 26);
    S13.forEach((v, i) => { bar({ x: x0 + i * dx - (lado ? 0.016 : 0), y0: 0, h: v * sy, w: lado ? 0.074 : 0.100, cor: qd.id === "hoje" ? "marfim" : "verde", cheio: 0.72 }); if (i % 2 === 0) lab(P(x0 + i * dx, 0), "cat c", `${qd.semanaRot} ${i + 1}`, 0, 26); });
    // série fina: garantida sacada em ouro (roteiro 5.4); estresse em grafite
    if (lado) lado.forEach((v, i) => { if (v > 1000) bar({ x: x0 + i * dx + 0.046, y0: 0, h: v * sy, w: 0.03, cor: qd.garantida ? "ouro" : "grafite", cheio: 0.9, topo: 0 }); });
    if (lado) lab(P(x0 + 12 * dx + 0.06, 0.86), "leg d", `<i class="${qd.id === "depois" ? "v" : ""}"></i>${qd.serieRot}<br><i class="${qd.garantida ? "o" : "g"}"></i>${qd.ladoRot}`, 0, 0);
    // rótulos de valor só nos extremos: o menor saldo (a série principal) e o maior valor da série fina
    const acima = (arr, i) => Math.max(...[i - 1, i, i + 1].filter((k) => k >= 0 && k < arr.length).map((k) => Math.max(S13[k], lado ? lado[k] : 0))) * sy + 0.02;
    const iMin = S13.indexOf(Math.min(...S13));
    lab(P(x0 + iMin * dx, acima(S13, iMin)), "val c peq ouro", `<b class="num">${qd.minRot(S13[iMin])}</b><span>${qd.minLeg}</span>`, 0, -34);
    if (qd.garantida) {
      const iMax = lado.indexOf(Math.max(...lado));
      lab(P(x0 + iMax * dx + 0.046, lado[iMax] * sy + 0.02), "val c peq", `<b class="num">${qd.minRot(lado[iMax])}</b><span>${qd.maxLeg}</span>`, 0, -34);
    }
    lin({ pts: [[x0 - 0.08, qd.linha * sy], [x0 + 12 * dx + 0.08, qd.linha * sy]], cor: "ouro", tracejada: true });
    lab(P(x0 + 12 * dx + 0.08, qd.linha * sy), "seg", qd.linhaRot, 12, 0);
    S.plano = { x: 0.08, y: 0.46, dist: 4.5, fov: 20, alt: 0.3 };
  }
  // ---- FIN3.10: a agenda de recebíveis por mês de vencimento (já antecipado, cedido em garantia, livre).
  if (qd.id === "agenda") {
    const ms = qd.meses, mx = Math.max(...ms.map((m) => m.total)), sy = 0.66 / mx, dx = 0.2, x0 = -0.9;
    regua(x0, x0 + (ms.length - 1) * dx, { dist: 4.5, fov: 20 }, 26);
    ms.forEach((m, i) => {
      const x = x0 + i * dx; let y = 0;
      [["antecipado", "ouro", 0.82], ["cedido", "grafite", 0.9], ["livre", "marfim", 0.72]].forEach(([k, cor, ch], j) => { const h = m[k] * sy; if (h <= 0) return; bar({ x, y0: y, h, w: 0.15, cor, cheio: ch, topo: j === 2 ? 1 : 0, sobre: j ? specs.length - 1 : undefined }); y += h; });
      lab(P(x, m.total * sy + 0.02), "val c peq", `<b class="num">${i === 0 ? qd.valorRot(m.total) : r1(m.total)}</b>`, 0, -18);
      lab(P(x, 0), "cat c", m.mes, 0, 26);
    });
    lab(P(x0 + (ms.length - 1) * dx + 0.12, 0.84), "leg d", qd.legenda.map(([cls, t]) => `<i class="${cls}"></i>${t}`).join("<br>"), 0, 0);
    S.plano = { x: 0.06, y: 0.44, dist: 4.5, fov: 20, alt: 0.3 };
  }
  if (qd.tiles) {
    const px = M.pxPorUnidade(4.4, 20), W0 = 560 / px, H0 = 220 / px, xs = [-0.44, 0.44], ys = [0.58, 0.20];
    S.seq = [];
    qd.tiles.forEach((tt, i) => { const x = xs[i % 2], y = ys[Math.floor(i / 2)]; const b = bar({ x, y0: y - H0 / 2, h: H0, w: W0, cor: "grafite", cheio: 0.0, topo: 0, escuro: 0.86, ouro: tt.d ? 0.5 : 0.15 }); const m = lab(P(x, y), `tile c ${tt.d ? "d" : ""}`, `<b class="num">${tt.v}</b><p>${tt.t}</p><em>${tt.e}</em>`, 0, 0, false); S.seq.push({ barras: [b], rots: [m] }); });
    S.plano = { x: 0, y: 0.43, dist: 4.4, fov: 20, alt: 0.0 };
  }
  // ---- FIN3.10: as ações em cascata. Economia potencial = vidro com contorno de ouro e pouco corpo (regra 6:
  // potencial não é caixa); cada linha entra com o nome, de quem depende e o valor anual estimado.
  if (qd.acoes) {
    const max = Math.max(...qd.acoes.map((a) => a.v)), L = 1.0, sx = L / max, esp = 0.135, x0 = -0.06;
    S.seq = [];
    qd.acoes.forEach((a, i) => {
      const y = 0.86 - i * esp, w = a.v * sx;
      const b = bar({ x: x0 + w / 2, y0: y - 0.036, h: 0.072, w, cor: "ouro", cheio: a.empresa ? 0.34 : 0.16, ouro: 1, hor: true, topo: 0 });
      const m1 = lab(P(x0 - 0.05, y), "acao", `${a.t}<span>${a.quem} · ${a.prazo}</span>`, 0, 0, false);
      const m2 = lab(P(x0 + w + 0.03, y), "val e peq ouro", `<b class="num">${qd.valorRot(a.v)}</b>`, 0, 0, false);
      S.seq.push({ barras: [b], rots: [m1, m2] });
    });
    S.fim.push(lab(P(x0 - 0.05, 0.86 - qd.acoes.length * esp + 0.02), "total", qd.totalHTML, 0, 0, false));
    if (qd.notaHTML) S.nota.push(lab(P(x0 - 0.05, 0.86 - qd.acoes.length * esp - 0.085), "total nota", qd.notaHTML, 0, 0, false));
    S.plano = { x: 0.08, y: 0.52, dist: 4.5, fov: 20, alt: 0.25 };
  }
  return S;
}

// ============================================================================ 7 · o entregável: o que chega à empresa
// Cinco folhas deitadas no mostrador (a pilha); uma por vez sobe até a posição de leitura, à direita, e volta.
// Posição na pilha: x, z sobre o mostrador; w × h em unidades do mundo (retrato, como uma página).
export const PECAS = [
  { id: "capa", x: -0.64, z: 0.02, giro: 0.10, y: 0.020 },
  { id: "mapa", x: -0.38, z: 0.50, giro: -0.06, y: 0.023 },
  { id: "projecao", x: 0.04, z: 0.64, giro: 0.05, y: 0.026 },
  { id: "plano", x: 0.46, z: 0.48, giro: -0.08, y: 0.029 },
  { id: "regra", x: 0.66, z: 0.04, giro: 0.07, y: 0.032 },
].map((p) => ({ ...p, w: 0.36, h: 0.49 }));
// a folha de leitura: 690 × 940 px no palco, à direita (a coluna da esquerda fica para a legenda)
export const RET_LEITURA = { left: 1080, top: 70, width: 690, height: 940 };
const cabPg = (C) => `<div class="cab"><img src="${LOGO_ESC}" alt=""><span>${C.proj.codigo} · rede ilustrativa</span></div>`;
export function htmlPeca(p, E, C) {
  const P = (E.pecas || {})[p.id];
  if (!P) return "";
  if (p.id === "capa") return `<div class="capa"><img src="midia/marca/logo_horizontal_claro.svg" alt="SWOT WEALTH"><h2>${P.titulo}</h2><p>${P.sub}</p><ol>${P.indice.map((x) => `<li>${x}</li>`).join("")}</ol></div>`;
  const topo = `${cabPg(C)}<h2>${P.titulo}</h2><p class="sub">${P.sub}</p>`;
  if (p.id === "mapa") return `<div class="pg">${topo}<table class="mapa"><thead><tr>${P.cab.map((h, i) => `<th class="${i ? "d" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${P.linhas.map((l) => `<tr class="${l.dest ? "dest" : ""}${l.total ? " tot" : ""}">${l.v.map((v, i) => `<td class="${i ? "d" : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="rod">${P.rodape}</p></div>`;
  if (p.id === "projecao") {
    const max = Math.max(...P.valores, P.linha) * 1.08;
    const barras = P.valores.map((v, i) => `<i class="${i === P.iMin ? "min" : ""}" style="height:${(100 * v / max).toFixed(1)}%"></i>`).join("");
    return `<div class="pg">${topo}<div class="pj"><div class="pj-g">${barras}<em style="bottom:${(100 * P.linha / max).toFixed(1)}%"><span>${P.linhaRot}</span></em></div><div class="pj-x">${P.valores.map((_, i) => `<span>${i % 2 === 0 ? i + 1 : ""}</span>`).join("")}</div></div><div class="pj-dest"><b class="num">${P.minimo}</b><span>${P.minimoRot}</span></div><p class="rod">${P.rodape}</p></div>`;
  }
  if (p.id === "plano") return `<div class="pg">${topo}<table class="plano">${P.linhas.map((l) => `<tr><td>${l.t}<span class="q">${l.q}</span></td><td class="d">${l.v}</td></tr>`).join("")}<tr class="tot"><td>${P.totalRot}</td><td class="d"><span class="alvo">${P.total}</span></td></tr></table><p class="rod">${P.rodape}</p></div>`;
  if (p.id === "regra") return `<div class="pg">${topo}<ol class="itens">${P.itens.map((x) => `<li>${x}</li>`).join("")}</ol></div>`;
  return "";
}
export const LEGENDAS = {};

// Cena provisória: um título e um subtítulo no escuro, com o instrumento ao fundo (até a cena definitiva existir).
export function cenaProvisoria(c, ctx, titulo, sub = "", dur = 6, cam = "inteiro") {
  const M = ctx.mundo;
  c.className = "cena c-prov";
  c.innerHTML = `<div class="topo" style="position:absolute;left:112px;top:120px;width:1100px"><h1 class="t-titulo">${titulo}</h1><p class="t-lead" style="margin-top:18px">${sub}</p></div>`;
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam, disco: { top3: 1 }, luz: { a: 1.4 } });
  aparecer(tl, c.querySelector(".topo"), 0.3, 0.6);
  marco(tl, "fim", 1.0);
  tl.to({}, { duration: 0.1 }, dur);
  return tl;
}
