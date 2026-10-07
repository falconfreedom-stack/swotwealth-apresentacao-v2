// Controlador: carrega base, motor e o instrumento 3D; toca as cenas do percurso principal em sequência, com
// marcos para saltar, pausa e as teclas. Depois da oferta, o Top 3 é um ponto de escolha (hub): as outras lentes
// são percursos opcionais que voltam a ele; sem escolha, a peça segue sozinha.
// Cada cena em ORDEM: { id, f, nome, projeto?: n (conteúdo fixo do projeto n), opcional?: "lente1" | "lente2" | …,
// hub?: true }.
import * as motor from "../motor/motor.js?v=202610071930";
import { Mundo } from "./mundo.js?v=202610071930";
import { ORDEM } from "./cenas.js?v=202610071930";
import { conteudo, TOP3_CODIGOS, NOMES } from "./conteudo.js?v=202610071930";
import { el } from "./util.js?v=202610071930";

window.__motor = motor;
window.__ordem = ORDEM.map((d) => ({ id: d.id, nome: d.nome, projeto: d.projeto ?? null, opcional: d.opcional ?? null, hub: !!d.hub }));
const gsap = window.gsap;
const ESPERA_ESCOLHA = 12000;      // sem escolha no hub, a peça segue para a próxima cena principal

const estado = { i: -1, tl: null, cena: null, projeto: null, base: null, R: null, fichas: null, mundo: null, C: null, rects: {}, escolhaAberta: false, vistas: new Set(), lenteEscolhida: null };

// --------------------------------------------------------------------------- percurso
const HUB = () => ORDEM.findIndex((d) => d.hub);
const PRINCIPAIS = () => ORDEM.map((d, j) => j).filter((j) => !ORDEM[j].opcional);
// a cena que vem depois de i: no percurso opcional, a seguinte do mesmo grupo ou a volta ao hub; no principal,
// a próxima cena principal
function depois(i) {
  const d = ORDEM[i];
  if (d && d.opcional) {
    if (ORDEM[i + 1] && ORDEM[i + 1].opcional === d.opcional) return { i: i + 1 };
    if (HUB() >= 0) return { i: HUB(), marco: "escolha" };
  }
  for (let j = i + 1; j < ORDEM.length; j++) if (!ORDEM[j].opcional) return { i: j };
  return null;
}
function antes(i) {
  const d = ORDEM[i];
  if (d && d.opcional) {
    if (ORDEM[i - 1] && ORDEM[i - 1].opcional === d.opcional) return { i: i - 1 };
    if (HUB() >= 0) return { i: HUB(), marco: "escolha" };
  }
  for (let j = i - 1; j >= 0; j--) if (!ORDEM[j].opcional) return { i: j };
  return null;
}
const seguirPara = (alvo) => { if (alvo) ir(alvo.i, { marco: alvo.marco }); };
// abre a lente n (projeto n do Top 3): o primeiro passo do seu percurso opcional ou, se não houver, o seu diagnóstico
function abrirLente(n) {
  let j = ORDEM.findIndex((d) => d.opcional === `lente${n}`);
  if (j < 0) j = ORDEM.findIndex((d) => d.id === "diagnostico" && d.projeto === n);
  if (j < 0) return;
  estado.vistas.add(n);
  ir(j);
}

async function carregar() {
  const params = new URLSearchParams(location.search);
  estado.captura = params.has("captura");
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
  const pc = params.get("cena") || "0";
  const inicio = /^\d+$/.test(pc) ? Number(pc) : Math.max(0, ORDEM.findIndex((d) => d.id === pc));
  if (params.get("projeto")) escolher(Number(params.get("projeto")));
  estado.abrirEscolha = abrirEscolha;
  estado.abrirLente = abrirLente;
  estado.seguir = () => seguirPara(depois(estado.i));
  // compatível com a saída das cenas de escolha: depois da animação, abre a lente escolhida ou segue
  estado.proximaCena = () => { const n = estado.lenteEscolhida; estado.lenteEscolhida = null; if (n) abrirLente(n); else estado.seguir(); };
  const comecar = () => {
    ir(inicio, { aoFim: params.has("fim") });
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
  window.__ir = (i, p) => { if (p) escolher(p); estado.escolhaAberta = false; ir(typeof i === "string" ? ORDEM.findIndex((d) => d.id === i) : i); };   // conferência automática
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
    if (def.projeto) escolher(def.projeto === true ? 1 : def.projeto);
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
  // abas das lentes do Top 3: aparecem no hub e nos percursos opcionais; cada uma abre a sua lente
  const abas = document.getElementById("abas");
  [3, 1, 2].forEach((n) => { const b = el("button", { innerHTML: `<b>${TOP3_TECLA[n]}</b>${NOMES[n - 1]}` }); b.dataset.n = n; b.onclick = () => { b.blur(); abrirLente(n); }; abas.appendChild(b); });
  const mf = document.getElementById("m-fechar"); if (mf) mf.onclick = () => material(false);
}
// tecla de cada projeto no hub: o FIN3.10, que conduz a peça, é o 1
const TOP3_TECLA = { 3: 1, 1: 2, 2: 3 };
const PROJETO_DA_TECLA = { 1: 3, 2: 1, 3: 2 };

function progresso() {
  const P = PRINCIPAIS(), def = ORDEM[estado.i] || {};
  const k = def.opcional ? P.indexOf(HUB()) : P.indexOf(estado.i);
  gsap.to("#progresso i", { width: `${((Math.max(0, k) + 1) / P.length) * 100}%`, duration: 1.2, ease: "power2.inOut" });
  document.body.classList.toggle("papel", !!estado.cena && estado.cena.classList.contains("papel"));
  const abas = document.getElementById("abas");
  const mostrar = !!(def.hub || def.opcional);
  gsap.to(abas, { opacity: mostrar ? 1 : 0, duration: 0.5 });
  abas.style.pointerEvents = mostrar ? "auto" : "none";
  abas.querySelectorAll("button").forEach((b) => b.classList.toggle("atual", def.opcional ? Number(b.dataset.n) === estado.projeto : false));
}

function escolher(n) { estado.projeto = n; estado.C = conteudo(estado.base, estado.R, n); }

// opc: { aoFim: vai ao último marco e pausa, marco: começa pouco antes desse marco }
function ir(i, opc = {}) {
  if (typeof opc === "boolean") opc = { aoFim: opc };
  if (i < 0 || i >= ORDEM.length) return;
  const def = ORDEM[i];
  if (typeof def.projeto === "number") escolher(def.projeto);
  else if (def.projeto && !estado.projeto) escolher(1);
  const anterior = estado.cena;
  if (estado.tl) estado.tl.kill();
  if (estado.saidaTl) { estado.saidaTl.kill(); estado.saidaTl = null; }
  estado.podeEscolher = false; estado.escolhaAberta = false; clearTimeout(estado.auto);
  // a cena nova entra invisível e sobe em 0,25 s por cima da que sai: o primeiro quadro nunca mostra o estado
  // de montagem, antes de a linha do tempo aplicar o tempo 0
  const c = el("div", { class: "cena", style: estado.captura ? "" : "opacity:0" });
  document.getElementById("cenas").appendChild(c);
  if (!estado.captura) gsap.to(c, { opacity: 1, duration: 0.25, delay: 0.03, ease: "power1.out" });   // na captura sem cabeça, o tempo virtual não deixa a entrada terminar
  estado.i = i; estado.cena = c;
  const t0 = performance.now();
  const tl = def.f(c, estado);
  (window.__montagem || (window.__montagem = [])).push({ cena: i, ms: +(performance.now() - t0).toFixed(1) });
  estado.tl = tl;
  tl.eventCallback("onComplete", () => { if (estado.tl === tl && !estado.escolhaAberta) seguirPara(depois(i)); });
  if (anterior) gsap.to(anterior, { opacity: 0, duration: 0.7, ease: "power2.inOut", onComplete: () => anterior.remove() });
  progresso();
  // começa em 1 ms, e não em 0: assim o estado inicial da cena (os sets do tempo 0) já vale no quadro em que
  // ela aparece; com play(0) ele só era aplicado no quadro seguinte e a cena nova piscava com tudo aceso
  if (opc.aoFim) { const labels = Object.keys(tl.labels); tl.seek(labels[labels.length - 1], false); tl.pause(); }
  else if (opc.marco && tl.labels[opc.marco] !== undefined) { tl.seek(Math.max(0.001, tl.labels[opc.marco] - 1.2), false); if (estado.pausado) tl.pause(); else tl.play(); }
  else if (estado.pausado) { tl.pause(0.001); }
  else tl.play(0.001);
}

// →: salta ao próximo marco da cena (ou à próxima cena); se estiver tocando, segue tocando. Na escolha, segue.
function avancar() {
  const tl = estado.tl; if (!tl) return;
  if (estado.escolhaAberta) { escolhaFeita(0); return; }
  const t = tl.time();
  const proximos = Object.values(tl.labels).filter((tt) => tt > t + 0.05).sort((a, b) => a - b);
  if (proximos.length) { tl.seek(proximos[0], false); if (!estado.pausado && !estado.escolhaAberta) tl.play(); }
  else seguirPara(depois(estado.i));
}
function voltar() {
  const tl = estado.tl; if (!tl) return;
  const t = tl.time();
  const anteriores = Object.values(tl.labels).filter((tt) => tt < t - 0.6).sort((a, b) => b - a);
  if (anteriores.length) { estado.escolhaAberta = false; clearTimeout(estado.auto); tl.seek(anteriores[0], false); if (!estado.pausado) tl.play(); }
  else if (t > 1) { tl.seek(0); if (!estado.pausado) tl.play(); }
  else seguirPara(antes(estado.i));
}
// espaço, P ou o botão do meio: pausa e continua (o relógio do instrumento para junto)
function pausar() {
  const tl = estado.tl; if (!tl) return;
  estado.pausado = !estado.pausado;
  if (estado.escolhaAberta) {       // na escolha a cena já espera; a pausa só segura a saída automática
    clearTimeout(estado.auto);
    if (!estado.pausado) estado.auto = setTimeout(() => escolhaFeita(0), ESPERA_ESCOLHA);
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

// a escolha no hub: a cena para e espera; sem escolha em ESPERA_ESCOLHA, segue para a próxima cena principal
function abrirEscolha() {
  estado.escolhaAberta = true;
  estado.tl.pause();
  clearTimeout(estado.auto);
  if (!estado.pausado) estado.auto = setTimeout(() => escolhaFeita(0), ESPERA_ESCOLHA);
}
// n = projeto escolhido (1, 2 ou 3); 0 = seguir sem abrir lente
function escolhaFeita(n) {
  if (!estado.escolhaAberta && !estado.podeEscolher) return;
  estado.podeEscolher = false;
  clearTimeout(estado.auto);
  estado.escolhaAberta = false;
  estado.lenteEscolhida = n || null;
  if (estado.tl && estado.tl.saida) { estado.saidaTl = estado.tl.saida(n); }
  else estado.proximaCena();
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
    else if (["1", "2", "3"].includes(e.key)) {
      const n = PROJETO_DA_TECLA[e.key], def = ORDEM[estado.i] || {};
      if (estado.escolhaAberta || estado.podeEscolher) escolhaFeita(n);
      else if (def.hub || def.opcional) abrirLente(n);
    }
  });
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-escolha]");
    if (p && (estado.escolhaAberta || estado.podeEscolher)) { escolhaFeita(Number(p.dataset.escolha)); return; }
    if (p && (ORDEM[estado.i]?.hub || ORDEM[estado.i]?.opcional)) { abrirLente(Number(p.dataset.escolha)); return; }
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
  const n = estado.projeto || 3;
  document.getElementById("material-sub").textContent = `Projeto ${n} · ${NOMES[n - 1]}. Documento, checklist e tabelas para envio.`;
  document.getElementById("m-doc").href = `material.html?projeto=${n}`;
  document.getElementById("m-check").href = `material.html?projeto=${n}&baixar=checklist`;
  document.getElementById("m-tab").href = `material.html?projeto=${n}&baixar=tabelas`;
  document.getElementById("m-base").href = "dados/base.json";
}

carregar().catch((e) => { console.error(e.stack || e); document.body.insertAdjacentHTML("beforeend", `<pre style="position:fixed;inset:0;color:#F5F1E8;padding:40px;background:#0c1712">Erro ao carregar: ${e.message}</pre>`); });
