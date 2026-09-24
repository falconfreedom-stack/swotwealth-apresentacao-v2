// Utilidades de tela: criação de elementos, contadores, digitação, cascatas, FLIP.
// Sem dependência além do GSAP global (carregado por <script>).

export const g = () => window.gsap;

export function el(tag, attrs = {}, html = "") {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k === "style") e.style.cssText = v;
    else if (k.startsWith("data-")) e.setAttribute(k, v);
    else e[k] = v;
  }
  if (html) e.innerHTML = html;
  return e;
}

export function html(str) {
  const t = document.createElement("template");
  t.innerHTML = str.trim();
  return t.content.firstElementChild;
}

// Formatação (espelha motor.fmt, com atalhos para tela)
export const F = {
  n: (v, c = 0) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }),
  brl: (v, c = 0) => "R$ " + (v < 0 ? "−" : "") + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }),
  mil: (v, c = 0) => (v < 0 ? "−" : "") + "R$ " + (Math.abs(v) / 1000).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + " mil",
  mi: (v) => (v < 0 ? "−" : "") + "R$ " + (Math.abs(v) / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " mi",
  pct: (v, c = 1) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c }) + "%",
  x: (v) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "×",
  int: (v) => Math.round(v).toLocaleString("pt-BR"),
};

// Contador: anima o texto de um elemento de 0 até o valor formatado pelo `fmt`.
export function contar(tl, elm, valor, fmt = F.int, dur = 1.2, pos = undefined) {
  const obj = { v: 0 };
  let ultimo = 0; // escreve no máximo 25 vezes por segundo: evita reflow a cada quadro em tabelas
  tl.to(obj, { v: valor, duration: dur, ease: "power2.out",
    onUpdate: () => { const t = performance.now(); if (t - ultimo < 40 && obj.v < valor) return; ultimo = t; elm.textContent = fmt(obj.v); },
    onComplete: () => { elm.textContent = fmt(valor); } }, pos);
  return tl;
}

// Digitação: escreve `texto` no elemento, caractere a caractere, com cursor.
export function digitar(tl, elm, texto, msPorChar = 0.028, pos = undefined) {
  const n = texto.length;
  const obj = { i: 0 };
  tl.set(elm, { className: elm.className.replace(" digitando", "") + " digitando" }, pos);
  tl.to(obj, { i: n, duration: Math.max(0.25, n * msPorChar), ease: "none", onUpdate: () => { elm.textContent = texto.slice(0, Math.round(obj.i)); } });
  tl.set(elm, { className: elm.className.replace(" digitando", "") });
  return tl;
}

// Cascata: entra uma lista de elementos, um após o outro, com dissolução e leve subida.
export function cascata(tl, elms, cada = 0.08, pos = undefined, dur = 0.6, y = 14) {
  const list = Array.from(elms);
  if (!list.length) return tl;
  list.forEach((e) => { e.style.opacity = "0"; });      // estado inicial sem leitura de estilo; a animação se inicializa quando começa
  tl.fromTo(list, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur, ease: "power2.out", stagger: cada, immediateRender: false }, pos);
  return tl;
}

// Dissolução com escala (entrada padrão de um objeto)
export function entrar(tl, elm, pos = undefined, dur = 0.6) {
  tl.fromTo(elm, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: dur, ease: "power2.out" }, pos);
  return tl;
}

export function sair(tl, elm, pos = undefined, dur = 0.5, y = -40) {
  tl.to(elm, { opacity: 0, y, duration: dur, ease: "power2.in" }, pos);
  return tl;
}

// Barras: cresce a largura de [data-w] até o valor em px ou %.
export function barras(tl, elms, pos = undefined, dur = 0.9, cada = 0.06) {
  const list = Array.from(elms);
  list.forEach((b, i) => {
    const w = b.dataset.w;
    const p = pos === undefined ? (i === 0 ? undefined : `<${cada}`) : (typeof pos === "number" ? pos + i * cada : `${pos}+=${i * cada}`);
    tl.set(b, { width: w }, p);
    tl.fromTo(b, { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: dur, ease: "power3.out" }, "<");
  });
  return tl;
}

// Linha SVG que se desenha (stroke-dashoffset)
export function desenhar(tl, paths, pos = undefined, dur = 1.2, cada = 0.05) {
  Array.from(paths).forEach((p, i) => {
    const len = p.getTotalLength ? p.getTotalLength() : 1000;
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    tl.to(p, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut" }, pos === undefined ? (i === 0 ? undefined : `<${cada}`) : (typeof pos === "number" ? pos + i * cada : `${pos}+=${i * cada}`));
  });
  return tl;
}

// FLIP manual: anima `elm` da geometria `de` (rect no espaço do palco) até a sua posição natural.
export function flipDe(tl, elm, de, pos = undefined, dur = 0.9) {
  const para = rectPalco(elm);
  const sx = de.width / para.width, sy = de.height / para.height;
  const dx = de.left - para.left, dy = de.top - para.top;
  tl.fromTo(elm, { x: dx, y: dy, scaleX: sx, scaleY: sy, transformOrigin: "0 0" }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: dur, ease: "power3.inOut" }, pos);
  return tl;
}

// Anima `elm` da sua posição natural até a geometria `ate`.
export function flipPara(tl, elm, ate, pos = undefined, dur = 0.9) {
  const de = rectPalco(elm);
  const sx = ate.width / de.width, sy = ate.height / de.height;
  tl.to(elm, { x: ate.left - de.left, y: ate.top - de.top, scaleX: sx, scaleY: sy, transformOrigin: "0 0", duration: dur, ease: "power3.inOut" }, pos);
  return tl;
}

// Rect de um elemento em coordenadas do palco (1920×1080), descontando a escala do palco.
export function rectPalco(elm) {
  const palco = document.getElementById("palco");
  const esc = palco.getBoundingClientRect().width / 1920;
  const r = elm.getBoundingClientRect();
  const p = palco.getBoundingClientRect();
  return { left: (r.left - p.left) / esc, top: (r.top - p.top) / esc, width: r.width / esc, height: r.height / esc };
}

export const espera = (ms) => new Promise((r) => setTimeout(r, ms));
