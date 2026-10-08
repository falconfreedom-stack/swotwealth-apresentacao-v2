// Cena 11 · o hub do Top 3 (roteiro v1, 11.1–11.2 e tela 4.2): "A mesma rede, outras duas lentes". Transição de
// ato por íris (o mostrador abre a cena); cada cartão sobe do seu índice do Top 3 em linha reta (a ordem na fila
// segue a posição dos índices no mostrador, sem trajetórias cruzadas: FIN8.2, FIN5.11 e, por último, o FIN3.10,
// já visto, a 40%). No marco `escolha` a cena chama `ctx.abrirEscolha()`: o controlador espera (15 s no assistir;
// sem limite no apresentar). Tecla ou toque: 2 = FIN8.2, 3 = FIN5.11, 1 = FIN3.10 (reabre o percurso principal).
// `tl.saida(n)` (n = projeto 1/2/3; 0 = seguir) anima a saída e chama `ctx.proximaCena()` no fim. Ao voltar de uma
// lente, o controlador reabre esta cena no marco `escolha`; as lentes vistas (`ctx.vistas`) ganham o selo "visto".
import { FIM } from "../conteudo.js?v=202610071930";
import * as K from "./comum.js?v=202610071930";
import { CAM_OFERTA, laminaDoIndice, entraLinhas } from "./oferta.js?v=202610071930";
const { gsap, marco, linhas, folha } = K;

// os cartões em fila, de frente para o plano `top3` (o mesmo retângulo dos cartões da versão anterior)
const RET = [0, 1, 2].map((i) => ({ left: 150 + i * 560, top: 318, width: 500, height: 623 }));
const ORDEM_FILA = ["FIN8.2", "FIN5.11", "FIN3.10"];      // da esquerda para a direita, como os índices aparecem

export function top3Cena(c, ctx) {
  const M = ctx.mundo, H = FIM(ctx.base, ctx.R).hub;
  const vistas = ctx.vistas instanceof Set ? ctx.vistas : new Set();
  c.className = "cena c-hub";
  const cartoes = ORDEM_FILA.map((cod) => H.cartoes.find((x) => x.codigo === cod));
  c.innerHTML = `<div class="iris"></div><h1 class="tit t-titulo">${linhas(H.titulo)}</h1><p class="dica">${H.dica}</p>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  // continua de onde a oferta parou (o mundo atenuado) e vem ao plano do Top 3
  M.base(tl, { cam: CAM_OFERTA, disco: { acesos: 0, top3: 1 }, luz: { a: 1.0, expo: 0.5 } });

  // ---------------------------------------------------------------- 11.1 · íris, câmera e os cartões
  const iris = q(".iris"), olho = M.naTela(M.v3(0, 0, 0), CAM_OFERTA);
  iris.style.setProperty("--x", `${olho.x.toFixed(0)}px`); iris.style.setProperty("--y", `${olho.y.toFixed(0)}px`);
  tl.set(iris, { visibility: "visible", "--r": "0px" }, 0);
  tl.to(iris, { "--r": "1500px", duration: 1.4, ease: "power2.inOut" }, 0);
  tl.set(iris, { visibility: "hidden" }, 1.45);
  M.luzPara(tl, { expo: 1 }, 1.4, 0, "power2.out");
  M.irPara(tl, "top3", 2.2, 0.2, {}, "power2.inOut");
  const els = cartoes.map((p, i) => {
    laminaDoIndice(M, i, p.codigo, RET[i], "top3", 1.6, { raioPx: 26, ouro: 0.25, escuro: 0.84 });
    const visto = p.codigo === "FIN3.10" || vistas.has(p.n);
    const d = folha(c, M, i, RET[i].width, RET[i].height, `cartao-hub${visto ? " visto" : ""}`,
      `<div class="cab"><span class="tecla">${p.tecla}</span><span class="cod">${p.codigo}</span>${visto ? `<span class="selo">✓ ${H.visto}</span>` : ""}</div>
      <h3>${p.nome}</h3><p class="perg">${p.pergunta}</p>${visto ? "" : `<p class="dur">${H.duracao}</p>`}`);
    d.setAttribute("data-escolha", String(p.n));
    d.style.opacity = "0";
    tl.set(M.laminas[i], { p: 0, a: 0, e: 0, branco: 0 }, 0);
    tl.to(M.laminas[i], { a: visto ? 0.6 : 1, duration: 0.3, ease: "power1.out" }, 1.1 + 0.15 * i);
    tl.to(M.laminas[i], { p: 1, duration: 1.6, ease: "power3.inOut" }, 1.2 + 0.15 * i);
    return { d, visto };
  });
  entraLinhas(tl, q(".tit"), 2.0);
  // o texto de cada cartão entra quando o vidro chega; o já visto fica a 40%
  const tTexto = [3.3, 3.9, 4.5];
  els.forEach(({ d, visto }, i) => tl.fromTo(d, { opacity: 0 }, { opacity: visto ? 0.4 : 1, duration: 0.6, ease: "power2.out", immediateRender: false }, tTexto[i]));
  tl.call(() => { ctx.podeEscolher = true; }, null, 3.3);
  tl.fromTo(q(".dica"), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, 4.9);
  q(".dica").style.opacity = "0";

  // ---------------------------------------------------------------- 11.2 · a escolha
  const tEscolha = 5.4;
  tl.call(() => ctx.abrirEscolha && ctx.abrirEscolha(), null, tEscolha);
  marco(tl, "escolha", tEscolha);
  tl.to({}, { duration: 0.5 }, tEscolha);

  // a saída: com uma lente escolhida, só o vidro dela fica, no lugar do cartão (a lente compacta começa desse
  // mesmo cartão, RET_T3[n − 1], e o traz à frente); sem escolha, os cartões voltam para os seus índices e a peça segue
  tl.saida = (n) => {
    tl.pause();
    const s = gsap().timeline(), k = cartoes.findIndex((p) => p.n === n);
    s.to([q(".tit"), q(".dica")], { opacity: 0, duration: 0.3, ease: "power1.in" }, 0);
    if (k >= 0) {
      els.forEach(({ d }) => s.to(d, { opacity: 0, duration: 0.3, ease: "power1.in" }, 0));
      [0, 1, 2].forEach((i) => { if (i !== k) s.to(M.laminas[i], { a: 0, duration: 0.35, ease: "power1.in" }, 0); });
      s.to(M.laminas[k], { a: 1, duration: 0.2 }, 0);
      s.call(() => ctx.proximaCena && ctx.proximaCena(), null, 0.45);
    } else {
      els.forEach(({ d }) => s.to(d, { opacity: 0, duration: 0.3, ease: "power1.in" }, 0));
      [0, 1, 2].forEach((i) => s.to(M.laminas[i], { p: 0, duration: 0.9, ease: "power2.in" }, 0.15 + 0.06 * i));
      [0, 1, 2].forEach((i) => s.to(M.laminas[i], { a: 0, duration: 0.25 }, 0.95 + 0.06 * i));
      s.call(() => ctx.proximaCena && ctx.proximaCena(), null, 1.3);
    }
    return s;
  };
  return tl;
}
