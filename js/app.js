// Controlador: carrega base, motor e o instrumento 3D; toca as cenas em sequência, com marcos para saltar,
// pausa, escolha do projeto (com escolha automática se ninguém escolher) e as teclas.
import * as motor from "../motor/motor.js?v=202609241929";
import { Mundo } from "./mundo.js?v=202609241929";
import { ORDEM } from "./cenas.js?v=202609241929";
import { conteudo, TOP3_CODIGOS, NOMES } from "./conteudo.js?v=202609241929";
import { el } from "./util.js?v=202609241929";

window.__motor = motor;
const gsap = window.gsap;

const estado = { i: -1, tl: null, cena: null, projeto: null, base: null, R: null, fichas: null, mundo: null, C: null, rects: {}, escolhaAberta: false };

async function carregar() {
  const params = new URLSearchParams(location.search);
  ajustarPalco();
  window.addEventListener("resize", ajustarPalco);
  const fonte = params.get("rascunho") ? "dados/rascunho.json" : "dados/base.json";
  const [base, fichas] = await Promise.all([fetch(fonte, { cache: "no-store" }).then((r) => r.json()), fetch("dados/fichas_208.json").then((r) => r.json())]);
  await document.fonts.ready;
  estado.base = base;
  estado.R = motor.calcular(base);
  estado.fichas = fichas.map((f) => ({ ...f, top3: !!TOP3_CODIGOS[f.codigo] }));
  estado.mundo = new Mundo(document.getElementById("mundo"), estado.fichas);
  await estado.mundo.carregar();
  montarHUD();
  aquecer();
  teclas();
  const inicio = Number(params.get("cena") || 0);
  if (params.get("projeto")) escolher(Number(params.get("projeto")));
  estado.abrirEscolha = abrirEscolha;
  estado.proximaCena = () => { if (estado.i + 1 < ORDEM.length) ir(estado.i + 1); };
  const comecar = () => {
    ir(inicio, params.has("fim"));
    if (params.has("t")) { const t = Number(params.get("t")); estado.tl.pause(); estado.tl.seek(Math.min(t, estado.tl.duration()), false); }
    if (params.has("captura")) { document.getElementById("dica").style.display = "none"; document.getElementById("controle").style.display = "none"; }
    else { const d = document.getElementById("dica"); gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.5 }); gsap.to(d, { opacity: 0, duration: 0.8, delay: 8 }); }
  };
  document.getElementById("carregando").remove();
  if (params.has("captura") || params.has("cena")) comecar();
  else {
    // tela de início: logo e um botão; clique, espaço ou Enter começa
    const ini = document.getElementById("inicio");
    ini.classList.add("visivel");
    gsap.fromTo(ini.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.0, stagger: 0.2, ease: "power2.out" });
    const dar = () => { if (estado.iniciado) return; estado.iniciado = true; gsap.to(ini, { opacity: 0, duration: 0.9, ease: "power2.inOut", onComplete: () => ini.remove() }); comecar(); };
    ini.addEventListener("click", dar);
    estado.dar = dar;
  }
  window.__estado = estado;
  window.__ir = (i, p) => { if (p) escolher(p); estado.escolhaAberta = false; ir(i); };   // conferência automática
  if (params.has("medir")) {   // conferência de desempenho: tempos de quadro enquanto a cena toca
    // descarta os 2 primeiros segundos (compilação, fontes) e mede 12 s
    const d = []; let ant = performance.now(); const t0 = ant;
    const f = () => { const a = performance.now(); if (a - t0 > 2000) d.push(a - ant); ant = a; if (a - t0 < 14000) requestAnimationFrame(f); else {
      d.sort((x, y) => x - y); const q = (p) => d[Math.floor(d.length * p)].toFixed(1);
      window.__medida = { quadros: d.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: d[d.length - 1].toFixed(1), desenhos: estado.mundo.desenhos, escala: estado.mundo.escala, nivel: estado.mundo.nivel, msGPU: estado.mundo.msGPU, msEscala: estado.mundo.msEscala }; } };
    requestAnimationFrame(f);
  }
  if (params.has("longos")) {   // conferência contínua: todo quadro acima de 25 ms, com a cena e o tempo da cena
    window.__longos = []; let ant = performance.now();
    const f = () => { const a = performance.now(), dt = a - ant; ant = a; if (dt > 25) window.__longos.push({ dt: +dt.toFixed(1), cena: estado.i, t: +(estado.tl?.time() || 0).toFixed(2), em: +(a / 1000).toFixed(1) }); requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  document.title = document.title; // marcador para a conferência headless
  document.body.dataset.pronto = "1";
}

// Monta cada cena uma vez, escondida, antes de a peça começar: a primeira montagem de uma cena custa de 3 a 4
// vezes mais que as seguintes (código compilado pela primeira vez, primeiro cálculo de estilo) e virava um
// quadro longo na troca. O estado do relógio e o projeto escolhido voltam como estavam.
function aquecer() {
  const M = estado.mundo, R = M.relogio, guardado = { hora: R.hora, seg: R.seg, ritmoSeg: R.ritmoSeg }, projeto = estado.projeto, C = estado.C;
  const caixa = el("div", { class: "cena", style: "visibility:hidden" });
  document.getElementById("cenas").appendChild(caixa);
  ORDEM.forEach((def) => {
    if (def.projeto) escolher(1);
    const c = el("div", { class: "cena" }); caixa.appendChild(c);
    try { const tl = def.f(c, estado); tl.kill(); } catch (e) { console.warn("aquecimento", def.id, e); }
    c.remove();
  });
  caixa.remove();
  M.limparAncoras(); M.colagens = []; M.limparBarras();
  Object.assign(R, guardado);
  estado.projeto = projeto; estado.C = C;
}

function ajustarPalco() {
  const esc = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  document.getElementById("palco").style.transform = `scale(${esc})`;
}

function montarHUD() {
  const abas = document.getElementById("abas");
  [1, 2, 3].forEach((n) => { const b = el("button", { innerHTML: `<b>${n}</b>${NOMES[n - 1]}` }); b.onclick = () => { b.blur(); trocarProjeto(n); }; abas.appendChild(b); });
  const mf = document.getElementById("m-fechar"); if (mf) mf.onclick = () => material(false);
}

function progresso() {
  gsap.to("#progresso i", { width: `${((estado.i + 1) / ORDEM.length) * 100}%`, duration: 1.2, ease: "power2.inOut" });
  document.body.classList.toggle("papel", !!estado.cena && estado.cena.classList.contains("papel"));
  const abas = document.getElementById("abas");
  const mostrar = ORDEM[estado.i]?.projeto;
  gsap.to(abas, { opacity: mostrar ? 1 : 0, duration: 0.5 });
  abas.style.pointerEvents = mostrar ? "auto" : "none";
  abas.querySelectorAll("button").forEach((b, k) => b.classList.toggle("atual", k + 1 === estado.projeto));
}

function escolher(n) { estado.projeto = n; estado.C = conteudo(estado.base, estado.R, n); }

function ir(i, aoFim = false) {
  if (i < 0 || i >= ORDEM.length) return;
  const def = ORDEM[i];
  if (def.projeto && !estado.projeto) escolher(1);
  const anterior = estado.cena;
  if (estado.tl) estado.tl.kill();
  estado.podeEscolher = false; estado.escolhaAberta = false; clearTimeout(estado.auto);
  // a cena nova entra invisível e sobe em 0,25 s por cima da que sai: o primeiro quadro nunca mostra o estado
  // de montagem, antes de a linha do tempo aplicar o tempo 0
  const c = el("div", { class: "cena", style: "opacity:0" });
  document.getElementById("cenas").appendChild(c);
  gsap.to(c, { opacity: 1, duration: 0.25, delay: 0.03, ease: "power1.out" });
  estado.i = i; estado.cena = c;
  const t0 = performance.now();
  const tl = def.f(c, estado);
  (window.__montagem || (window.__montagem = [])).push({ cena: i, ms: +(performance.now() - t0).toFixed(1) });
  estado.tl = tl;
  tl.eventCallback("onComplete", () => { if (estado.tl === tl && !estado.escolhaAberta && i + 1 < ORDEM.length) ir(i + 1); });
  if (anterior) gsap.to(anterior, { opacity: 0, duration: 0.7, ease: "power2.inOut", onComplete: () => anterior.remove() });
  progresso();
  // começa em 1 ms, e não em 0: assim o estado inicial da cena (os sets do tempo 0) já vale no quadro em que
  // ela aparece; com play(0) ele só era aplicado no quadro seguinte e a cena nova piscava com tudo aceso
  if (aoFim) { const labels = Object.keys(tl.labels); tl.seek(labels[labels.length - 1], false); tl.pause(); }
  else if (estado.pausado) { tl.pause(0.001); }
  else tl.play(0.001);
}

// →: salta ao próximo marco da cena (ou à próxima cena); se estiver tocando, segue tocando
function avancar() {
  const tl = estado.tl; if (!tl) return;
  if (estado.escolhaAberta) { dica("1, 2 ou 3 escolhe o projeto"); return; }
  const t = tl.time();
  const proximos = Object.values(tl.labels).filter((tt) => tt > t + 0.05).sort((a, b) => a - b);
  if (proximos.length) { tl.seek(proximos[0], false); if (!estado.pausado && !estado.escolhaAberta) tl.play(); }
  else if (estado.i + 1 < ORDEM.length) ir(estado.i + 1);
}
function voltar() {
  const tl = estado.tl; if (!tl) return;
  const t = tl.time();
  const anteriores = Object.values(tl.labels).filter((tt) => tt < t - 0.6).sort((a, b) => b - a);
  if (anteriores.length) { tl.seek(anteriores[0], false); if (!estado.pausado) tl.play(); }
  else if (t > 1) { tl.seek(0); if (!estado.pausado) tl.play(); }
  else ir(estado.i - 1);
}
// espaço, P ou o botão do meio: pausa e continua (o relógio do instrumento para junto)
function pausar() {
  const tl = estado.tl; if (!tl) return;
  estado.pausado = !estado.pausado;
  if (estado.escolhaAberta) {       // na escolha a cena já espera; a pausa só segura a escolha automática
    clearTimeout(estado.auto);
    if (!estado.pausado) estado.auto = setTimeout(() => escolhaFeita(estado.projeto || 1), 10000);
  } else if (estado.pausado) tl.pause(); else tl.play();
  marcarPausa();
}
function marcarPausa() {
  document.body.classList.toggle("pausa", !!estado.pausado);
  if (estado.mundo) estado.mundo.parado = !!estado.pausado;
  const b = document.getElementById("c-tocar"); if (b) b.setAttribute("aria-label", estado.pausado ? "Continuar" : "Pausar");
  mostrarControle();
}
// o controle fica discreto; acende com o mouse, com o toque e na pausa
function mostrarControle() {
  const c = document.getElementById("controle"); if (!c) return;
  c.classList.add("ativo"); clearTimeout(estado.tControle);
  estado.tControle = setTimeout(() => c.classList.remove("ativo"), 2600);
}

function dica(t) { const d = document.getElementById("dica"); gsap.killTweensOf(d); if (!t) { gsap.to(d, { opacity: 0, duration: 0.3 }); return; } d.textContent = t; gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.4 }); if (!estado.pausado) gsap.to(d, { opacity: 0, duration: 0.6, delay: 3 }); }

function trocarProjeto(n) { escolher(n); if (ORDEM[estado.i].projeto) ir(estado.i); progresso(); }

// a escolha do projeto: a cena para e espera; sem escolha em 10 s, segue com o Projeto 1
function abrirEscolha() {
  estado.escolhaAberta = true;
  estado.tl.pause();
  clearTimeout(estado.auto);
  estado.auto = setTimeout(() => escolhaFeita(estado.projeto || 1), 10000);
}
function escolhaFeita(n) {
  if (!estado.escolhaAberta && !estado.podeEscolher) return;
  estado.podeEscolher = false;
  clearTimeout(estado.auto);
  estado.escolhaAberta = false;
  escolher(n); progresso();
  if (estado.tl && estado.tl.saida) estado.tl.saida(n); else if (estado.tl) estado.tl.play();
}

function teclas() {
  document.addEventListener("keydown", (e) => {
    if (document.getElementById("material")?.classList.contains("aberto")) { if (e.key === "Escape" || e.key.toLowerCase() === "m") material(false); return; }
    if (estado.dar && !estado.iniciado) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); estado.dar(); } return; }
    if (e.key === " " || e.key.toLowerCase() === "p" || e.key.toLowerCase() === "k") { e.preventDefault(); if (!e.repeat) pausar(); }
    else if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); avancar(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); voltar(); }
    else if (e.key.toLowerCase() === "r") { estado.pausado = false; marcarPausa(); ir(0); }
    else if (e.key.toLowerCase() === "m") material(true);
    else if (["1", "2", "3"].includes(e.key)) { if (estado.escolhaAberta || estado.podeEscolher) escolhaFeita(Number(e.key)); else if (ORDEM[estado.i]?.projeto) trocarProjeto(Number(e.key)); }
  });
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-escolha]");
    if (p && (estado.escolhaAberta || estado.podeEscolher)) { escolhaFeita(Number(p.dataset.escolha)); return; }
    if (!estado.iniciado && estado.dar) return;
    if (e.target.closest("#palco")) mostrarControle();   // toque ou clique no palco só acende o controle
  });
  document.getElementById("c-voltar").onclick = (e) => { e.currentTarget.blur(); voltar(); mostrarControle(); };
  document.getElementById("c-tocar").onclick = (e) => { e.currentTarget.blur(); pausar(); };
  document.getElementById("c-avancar").onclick = (e) => { e.currentTarget.blur(); avancar(); mostrarControle(); };
  let ultMov = 0;
  document.addEventListener("pointermove", () => { const t = performance.now(); if (t - ultMov > 400) { ultMov = t; mostrarControle(); } });
}

function material(abrir) {
  const m = document.getElementById("material");
  if (!m) return;
  m.classList.toggle("aberto", abrir);
  if (!abrir) return;
  const n = estado.projeto || 1;
  document.getElementById("material-sub").textContent = `Projeto ${n} · ${NOMES[n - 1]}. Documento, checklist e tabelas para envio.`;
  document.getElementById("m-doc").href = `material.html?projeto=${n}`;
  document.getElementById("m-check").href = `material.html?projeto=${n}&baixar=checklist`;
  document.getElementById("m-tab").href = `material.html?projeto=${n}&baixar=tabelas`;
  document.getElementById("m-base").href = "dados/base.json";
}

carregar().catch((e) => { console.error(e.stack || e); document.body.insertAdjacentHTML("beforeend", `<pre style="position:fixed;inset:0;color:#F5F1E8;padding:40px;background:#0c1712">Erro ao carregar: ${e.message}</pre>`); });
