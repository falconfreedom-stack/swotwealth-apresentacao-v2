// Cena 10 · a oferta (roteiro v1, 10.1–10.4 e tela 4.1). O índice do FIN3.10, aceso desde "Isto é um projeto",
// sobe do mostrador e vira a ficha do diagnóstico, uma lâmina de vidro escuro à direita; à esquerda, o preço
// parado, por máscara de linha, sem contagem. Depois que o texto entra, nada se move: as paradas cobrem a leitura.
// O1 o que é e o que recebe (parada `oferta`) · O2 quem faz e o que fica fora (`escopo`) · O3 a pergunta (`e-se`)
// · O4 a resposta (`valor`). Textos: js/conteudo/fim.js.
import { FIM } from "../conteudo.js?v=202610071930";
import { direcao } from "../mundo.js?v=202610071930";
import * as K from "./comum.js?v=202610071930";
const { gsap, parada, leitura, linhas, revelar, recolher, aparecer, sumir, folha } = K;

// O instrumento à direita, atrás da ficha; o índice do FIN3.10 fica à vista logo abaixo dela (x ≈ 1560, y ≈ 840).
export const CAM_OFERTA = { x: -0.305, y: 5.45, z: 2.09, tx: -1.112, ty: 0, tz: 0.278, fov: 30 };
const RET_FICHA = { left: 900, top: 238, width: 900, height: 500 };

// ---------------------------------------------------------------------------------------------
// Tempo de uma batida pelo modelo do roteiro (A7, estudo/roteiro/50-roteiro-v1.md, "Convenções"): cada bloco fica
// legível em s + o + 0,6 s (ou s + leg) e pede leitura() (1,0 s de orientação se vem logo depois da câmera; `v`
// em car/s); blocos `seq` são lidos em fila; `p` = persistente (fica fora do hold). A parada cai no fim das
// entradas e das animações; hold = fim da leitura − t + 0,5 s (pergunta: + 3,0 s).
export function batida(s, blocos, anim = [], pergunta = false) {
  let fimLeit = 0, ultLeg = 0, seqFim = 0;
  for (const b of blocos) {
    const T = leitura(b.texto, { depoisDeCamera: !!b.cam, v: b.v || 12.5 });
    const leg = s + (b.leg ?? (b.o + 0.6));
    let ini = leg;
    if (b.seq) { ini = Math.max(leg, seqFim); seqFim = ini + T; }
    if (!b.p) { fimLeit = Math.max(fimLeit, ini + T); ultLeg = Math.max(ultLeg, leg); }
  }
  const fimAnim = Math.max(0, ...anim.map(([o, d]) => s + o + d));
  const t = Math.max(ultLeg, fimAnim);
  const hold = Math.max(fimLeit, fimAnim) - t + (pergunta ? 3.0 : 0.5);
  return { t, hold: Math.max(0.6, hold), fim: t + Math.max(0.6, hold) };
}
// uma lâmina que sai deitada de um índice do mostrador (a lente) e vai para um retângulo da tela
export function laminaDoIndice(M, i, codigo, ret, cam, dist, opc = {}) {
  const ix = M.top3[codigo];
  const de = M.poseDeitada(direcao(ix.ang, 0.845, 0.006), 0.012, 0.05, ix.ang);
  const para = M.poseRet(ret, cam, dist);
  M.definirLamina(i, de, para, { raio: para.w * (opc.raioPx || 22) / ret.width, ouro: opc.ouro ?? 0.22, escuro: opc.escuro ?? 0.9 });
  return { de, para };
}
const txt = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : "");

// ============================================================================ 10 · a oferta
export function oferta(c, ctx) {
  const M = ctx.mundo, O = FIM(ctx.base, ctx.R).oferta;
  c.className = "cena c-of";
  const lin = ([k, v]) => `<div class="lin"><div class="k">${linhas(k)}</div><div class="v">${linhas(v)}</div></div>`;
  c.innerHTML = `<h1 class="preco t-display">${linhas(O.preco)}</h1>
  <h2 class="perg t-titulo">${linhas(O.pergunta)}</h2>
  <div class="resp"><h2 class="tit t-titulo">${linhas(O.resposta.titulo)}</h2><ul>${O.resposta.itens.map((x) => `<li>${x}</li>`).join("")}</ul></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  // começa onde "Isto é um projeto" terminou (o mostrador de cima, só o FIN3.10 em ouro) e vem ao plano da oferta
  M.base(tl, { cam: K.PLANO_UM || "topo", disco: { acesos: 0, destaque: 1 }, luz: { a: 1.0, expo: 1 } });
  M.irPara(tl, CAM_OFERTA, 1.8, 0.2, {}, "power2.inOut");
  // a ficha: o índice do FIN3.10 sobe e vira uma lâmina de vidro escuro (constância de objeto)
  laminaDoIndice(M, 0, "FIN3.10", RET_FICHA, CAM_OFERTA, 4.4);
  const ficha = folha(c, M, 0, RET_FICHA.width, RET_FICHA.height, "ficha-of",
    `<div class="f1">${O.ficha1.map(lin).join("")}</div><div class="f2">${O.ficha2.map(lin).join("")}</div>`);
  const L1 = [...ficha.querySelectorAll(".f1 .lin")], L2 = [...ficha.querySelectorAll(".f2 .lin")];
  tl.set(M.laminas[0], { p: 0, a: 0, e: 0, branco: 0 }, 0);
  tl.to(M.laminas[0], { a: 1, duration: 0.3, ease: "power1.out" }, 0.3);
  tl.to(M.laminas[0], { p: 1, duration: 1.6, ease: "power3.inOut" }, 0.4);

  // ---------------------------------------------------------------- 10.1 · O1: o que é e o que recebe
  let s = 0;
  revelar(tl, q(".preco"), s + 1.6, 0.6, 0.25);                     // uma linha por vez; sem contagem, sem pulso
  L1.forEach((el, k) => revelar(tl, el, s + 3.2 + 0.8 * k, 0.6, 0.06));
  let B = batida(s, [{ o: 1.6, texto: O.preco, cam: 1 }, ...O.ficha1.map(([k2, v], k) => ({ o: 3.2 + 0.8 * k, texto: `${k2} · ${v}`, v: 15, seq: 1 }))], [[0.2, 1.8], [0.3, 1.7]]);
  parada(tl, ctx, "oferta", B.t, B.hold);

  // ---------------------------------------------------------------- 10.2 · O2: quem faz e o que fica fora
  s = B.fim;
  recolher(tl, L1, s, 0.35);
  L2.forEach((el, k) => revelar(tl, el, s + 0.4 + 0.8 * k, 0.6, 0.06));
  B = batida(s, O.ficha2.map(([k2, v], k) => ({ o: 0.4 + 0.8 * k, texto: `${k2} · ${v}`, v: 15, seq: 1 })));
  parada(tl, ctx, "escopo", B.t, B.hold);

  // ---------------------------------------------------------------- 10.3 · O3: e se não houver oportunidade?
  s = B.fim;
  recolher(tl, L2, s, 0.35);
  tl.to(M.laminas[0], { a: 0, duration: 0.5, ease: "power1.in" }, s + 0.1);     // a ficha sai; a pergunta fica sozinha
  tl.to(q(".preco"), { opacity: 0.3, duration: 0.5, ease: "power2.out" }, s);   // o preço cai a 30%
  M.luzPara(tl, { expo: 0.5 }, 0.5, s, "power2.out");                           // o mundo atenua
  revelar(tl, q(".perg"), s + 0.4);
  B = batida(s, [{ o: 0.4, texto: O.pergunta }], [[0, 0.5]], true);
  parada(tl, ctx, "e-se", B.t, B.hold);

  // ---------------------------------------------------------------- 10.4 · O4: a resposta
  s = B.fim;
  recolher(tl, q(".perg"), s, 0.35);
  revelar(tl, q(".resp .tit"), s + 0.3);
  const itens = [...c.querySelectorAll(".resp li")];
  aparecer(tl, itens, s + 1.1, 0.6, 0.3, 10);
  B = batida(s, [{ o: 0.3, texto: O.resposta.titulo }, { o: 1.1, texto: O.resposta.itens.join(" ") }]);
  const tValor = Math.max(B.t, s + 1.1 + 0.3 * (itens.length - 1) + 0.6);
  parada(tl, ctx, "valor", tValor, B.fim - tValor);
  tl.to({}, { duration: 0.4 }, B.fim);
  return tl;
}
