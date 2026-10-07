// Ecossistema: os 208 projetos e o fecho.
import { cascata } from "../util.js?v=202610071930";
import { top3, FASES, AMOSTRA } from "../conteudo.js?v=202610071930";
import { FASES_N } from "../mundo.js?v=202610071930";
import { gsap, marco, COD, ancora, direcaoCam } from "./comum.js?v=202610071930";

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
