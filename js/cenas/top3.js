// O Top 3 (a ser adaptado: as outras duas lentes, depois da oferta).
import { cascata } from "../util.js?v=202610071930";
import { top3 } from "../conteudo.js?v=202610071930";
import { gsap, marco, sumir, folha, CARTAO, lamT3 } from "./comum.js?v=202610071930";

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
