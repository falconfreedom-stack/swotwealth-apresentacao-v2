// A lente FIN3.10 em funcionamento: formulário, análise, diagnóstico, entregável e resultado.
import { cascata } from "../util.js?v=202610071930";
import { top3, SOCIOS, DIAS } from "../conteudo.js?v=202610071930";
import { cenaProvisoria, gsap, marco, LOGO_ESC, ancora, aparecer, sumir, folha, crescer, apagar, PLANO_FOLHA, RET_FOLHA, lamT3, poseFolha, blocoHTML, ladosDoGrafo, montarQuadro, PECAS, htmlPeca, LEGENDAS } from "./comum.js?v=202610071930";

// ============================================================================ 4 · o formulário se preenche

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

// ============================================================================ 6 · o diagnóstico: gráficos no instrumento
// Cada quadro: título (o achado), subtítulo, o gráfico construído e lido de frente.

export function diagnostico(c, ctx) {
  const M = ctx.mundo, C = ctx.C, QD = (ctx.compacto && C.compacto) || C.quadros;
  c.className = "cena c-diag";
  c.innerHTML = `<div class="cabd"><span>${C.cabDiag}</span></div>${QD.map((qd, i) => `<div class="qtit q${i}"><h1 class="t-titulo">${qd.titulo}</h1><p class="t-lead">${qd.sub}</p></div>`).join("")}`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "socios", disco: { top3: 1 }, luz: { a: 6.0, expo: 1 } });
  const G = M.grafico({ origem: M.v3(0, 0.02, 0.5) });
  const specs = [], rots = [], linhas = [];
  const Q = QD.map((qd) => montarQuadro(qd, c, M, G, specs, rots, linhas));
  const B = M.definirBarras(G, specs);
  const Ls = M.definirLinhas(G, linhas);
  const comMatriz = Q.find((s) => s.matriz);
  const Mz = comMatriz ? M.definirMatriz(G, comMatriz.matriz) : null;
  tl.set([q(".cabd"), ...c.querySelectorAll(".qtit")], { opacity: 0 }, 0);
  cascata(tl, [q(".cabd")], 0, 0.3, 0.8, 6);
  let t = 0.2;
  Q.forEach((S, i) => {
    const qd = QD[i], tit = q(`.q${i}`);
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
    const dur = qd.dur ?? (qd.id === "custo" ? 15 : 17);
    const fim = t + dur;
    if (i < Q.length - 1) {
      sumir(tl, [tit, ...S.rots], fim - 0.6, 0.5);
      apagar(tl, bs, fim - 0.6, 0.6);
      S.linhas.forEach((k) => tl.to(Ls[k], { a: 0, duration: 0.5 }, fim - 0.6));
      if (S.matriz && Mz) tl.to(Mz, { a: 0, duration: 0.5 }, fim - 0.6);
    }
    t = fim;
  });
  M.luzPara(tl, { a: 9.0 }, t, 0, "none");      // a luz gira durante o diagnóstico inteiro, e não além dele
  marco(tl, "fim", t - 10);
  tl.to({}, { duration: 0.1 }, t);
  return tl;
}

// ============================================================================ 7 · o entregável: o que chega à empresa
// As peças pousam sobre o instrumento; a câmera desce sobre cada uma.
// As peças ficam em volta do centro, sobre o vidro: os ponteiros, a tampa e a marca continuam à vista.

export function entregavel(c, ctx) {
  const M = ctx.mundo, C = ctx.C, E = C.entregavel;
  c.className = "cena c-ent";
  c.innerHTML = `<div class="topo"><h1 class="t-titulo">O que o projeto entrega.</h1><p class="t-lead">Em documento, planilha e painel, com a devolutiva no nono dia.</p></div>
  <div class="leg-peca">${PECAS.map((p) => { const L = (E.legendas && E.legendas[p.id]) || LEGENDAS[p.id]; return `<div data-p="${p.id}"><b>${L[0]}</b><span>${L[1]}</span></div>`; }).join("")}</div>`;
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

// ============================================================================ a lente FIN3.10 (provisória)
export function lente(c, ctx) { return cenaProvisoria(c, ctx, "FIN3.10 · Capital de giro e custo do dinheiro.", "Cena provisória: o projeto como lente; quatro insumos, cada relatório vê um pedaço.", 6, "top3"); }
