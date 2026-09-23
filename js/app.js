// Controlador: carrega base, motor e o instrumento 3D; toca as cenas em sequência, com marcos para saltar,
// pausa, escolha do projeto (com escolha automática se ninguém escolher) e as teclas.
import * as motor from "../motor/motor.js";
import { Mundo } from "./mundo.js";
import { ORDEM } from "./cenas.js";
import { conteudo, TOP3_CODIGOS, NOMES } from "./conteudo.js";
import { el } from "./util.js";

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
  teclas();
  const inicio = Number(params.get("cena") || 0);
  if (params.get("projeto")) escolher(Number(params.get("projeto")));
  estado.abrirEscolha = abrirEscolha;
  const comecar = () => {
    ir(inicio, params.has("fim"));
    if (params.has("t")) { const t = Number(params.get("t")); estado.tl.pause(); estado.tl.seek(Math.min(t, estado.tl.duration()), false); }
    if (params.has("captura")) document.getElementById("dica").style.display = "none";
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
  document.title = document.title; // marcador para a conferência headless
  document.body.dataset.pronto = "1";
}

function ajustarPalco() {
  const esc = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  document.getElementById("palco").style.transform = `scale(${esc})`;
}

function montarHUD() {
  const abas = document.getElementById("abas");
  [1, 2, 3].forEach((n) => { const b = el("button", { innerHTML: `<b>${n}</b>${NOMES[n - 1]}` }); b.onclick = () => trocarProjeto(n); abas.appendChild(b); });
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
  const c = el("div", { class: "cena" });
  document.getElementById("cenas").appendChild(c);
  estado.i = i; estado.cena = c;
  const tl = def.f(c, estado);
  estado.tl = tl;
  tl.eventCallback("onComplete", () => { if (estado.tl === tl && !estado.escolhaAberta && i + 1 < ORDEM.length) ir(i + 1); });
  if (anterior) gsap.to(anterior, { opacity: 0, duration: 0.7, ease: "power2.inOut", onComplete: () => anterior.remove() });
  progresso();
  if (aoFim) { const labels = Object.keys(tl.labels); tl.seek(labels[labels.length - 1], false); tl.pause(); }
  else if (estado.pausado) { tl.pause(0); }
  else tl.play(0);
}

// espaço: salta ao próximo marco da cena (ou à próxima cena) e segue tocando
function avancar() {
  const tl = estado.tl; if (!tl) return;
  if (estado.escolhaAberta) { dica("1, 2 ou 3 escolhe o projeto"); return; }
  const t = tl.time();
  const proximos = Object.values(tl.labels).filter((tt) => tt > t + 0.05).sort((a, b) => a - b);
  if (proximos.length) { tl.seek(proximos[0], false); if (!estado.pausado) tl.play(); }
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
function pausar() {
  const tl = estado.tl; if (!tl || estado.escolhaAberta) return;
  estado.pausado = !estado.pausado;
  if (estado.pausado) tl.pause(); else tl.play();
  dica(estado.pausado ? "pausa · P continua" : "");
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
  if (!estado.escolhaAberta) return;
  clearTimeout(estado.auto);
  estado.escolhaAberta = false;
  escolher(n); progresso();
  estado.tl.play();
}

function teclas() {
  document.addEventListener("keydown", (e) => {
    if (document.getElementById("material")?.classList.contains("aberto")) { if (e.key === "Escape" || e.key.toLowerCase() === "m") material(false); return; }
    if (estado.dar && !estado.iniciado) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); estado.dar(); } return; }
    if (e.key === " " || e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); avancar(); }
    else if (e.key.toLowerCase() === "p" || e.key === "k") { pausar(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); voltar(); }
    else if (e.key.toLowerCase() === "r") { estado.pausado = false; ir(0); }
    else if (e.key.toLowerCase() === "m") material(true);
    else if (["1", "2", "3"].includes(e.key)) { if (estado.escolhaAberta) escolhaFeita(Number(e.key)); else if (ORDEM[estado.i]?.projeto) trocarProjeto(Number(e.key)); }
  });
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-escolha]");
    if (p && estado.escolhaAberta) { escolhaFeita(Number(p.dataset.escolha)); return; }
    if (!estado.iniciado && estado.dar) return;
    if (!e.target.closest("button, a, #inicio") && e.target.closest("#palco")) avancar();   // toque ou clique avança (celular e tablet)
  });
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
