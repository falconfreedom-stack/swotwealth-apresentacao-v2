// Cenas 12 a 14 (roteiro v1; telas 4.3 a 4.5): quem conduz o diagnóstico, os 208 projetos e o próximo passo.
// Tempos pelo modelo do roteiro (`batida`, js/cenas/oferta.js): cada bloco no tempo de leitura; as paradas cobrem
// a leitura (no apresentar, a fala). Textos: js/conteudo/fim.js.
import { FIM } from "../conteudo.js?v=202610071930";
import { FASES_N } from "../mundo.js?v=202610071930";
import * as K from "./comum.js?v=202610071930";
import { batida, entraLinhas } from "./oferta.js?v=202610071930";
const { gsap, parada, linhas, aparecer, rot } = K;

// a mesma corrida dos ponteiros do instrumento (js/mundo.js): sai devagar, corre e assenta
const CORRIDA = (t) => t * t * (6 - 8 * t + 3 * t * t);

// ============================================================================ 12 · quem conduz o diagnóstico
// Roteiro v2 (P10): uma parada só. O rótulo e os quatro nomes, em lista, cada um com uma linha de credencial tirada
// literalmente da biografia (js/conteudo/fim.js); a biografia inteira fica no material.
export function socios(c, ctx) {
  const M = ctx.mundo, S = FIM(ctx.base, ctx.R).socios;
  c.className = "cena c-soc";
  c.innerHTML = `<p class="rot">${linhas(S.rotulo)}</p>
  <ul class="lista">${S.pessoas.map((p) => `<li><b>${p.nome}</b><span>${p.credencial}</span></li>`).join("")}</ul>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  // continua do plano do Top 3 e desce ao plano rasante dos sócios (câmera média)
  M.base(tl, { cam: "top3", disco: { acesos: 0, top3: 1 }, luz: { a: 1.0, expo: 1 } });
  M.irPara(tl, "socios", 1.8, 0.1, {}, "power2.inOut");
  entraLinhas(tl, q(".rot"), 1.3);
  // os quatro entram em cascata, como uma lista (uma linha por vez, 0,3 s entre elas)
  const itens = [...c.querySelectorAll(".lista li")];
  aparecer(tl, itens, 1.9, 0.6, 0.3, 10);
  // o tempo de leitura vem das credenciais (15 car/s, como as biografias no roteiro); os nomes se reconhecem de
  // relance e o apresentador os diz (roteiro v2: alvo de 12 a 15 s no assistir)
  const lista = S.pessoas.map((p) => p.credencial).join(" ");
  const B = batida(0, [{ o: 1.3, texto: S.rotulo, cam: 1 }, { o: 1.9, texto: lista, v: 15 }], [[0.1, 1.8]]);
  const t = Math.max(B.t, 1.9 + 0.3 * (itens.length - 1) + 0.6);
  parada(tl, ctx, "socios", t, B.fim - t);
  tl.to({}, { duration: 0.4 }, B.fim);
  return tl;
}

// ============================================================================ 13 · os 208 projetos
export function projetos208(c, ctx) {
  const M = ctx.mundo, E = FIM(ctx.base, ctx.R).eco;
  c.className = "cena c-eco";
  c.innerHTML = `<h1 class="tit t-titulo">${linhas(E.titulo)}</h1><p class="sub">${linhas(E.sub)}</p><div class="amostra"></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  // continua do plano dos sócios; só o índice do FIN3.10 aceso (desde "Isto é um projeto")
  M.base(tl, { cam: "socios", disco: { acesos: 0, destaque: 1 }, luz: { a: 1.0, expo: 1 } });
  // câmera longa com novidade no trajeto: os 208 acendem por fase enquanto ela sobe ao mostrador inteiro
  M.irPara(tl, "topoDir", 2.6, 0.2, {}, "power2.inOut");
  const tAcende = 1.0, durAcende = 3.0;
  tl.to(M.disco, { acesos: 208, duration: durAcende, ease: "none" }, tAcende);
  // o nome de cada fase entra quando o seu setor acende (posSetor a r = 1,16, fora da caixa)
  const acum = FASES_N.reduce((a, n, i) => (a.push((a[i - 1] || 0) + n), a), []);
  const lado = (th) => (Math.sin(th) > 0.35 ? { cls: "dir", xp: 0, yp: -50 } : Math.sin(th) < -0.35 ? { cls: "esq", xp: -100, yp: -50 } : Math.cos(th) > 0 ? { cls: "cima", xp: -50, yp: -100 } : { cls: "baixo", xp: -50, yp: 0 });
  const fases = E.fases.map((f, i) => {
    const L = lado(M.angSetor(i));
    const m = rot(c, M, M.posSetor(i, 1.16), `fase ${L.cls}`, f, L.cls === "dir" ? 8 : L.cls === "esq" ? -8 : 0, L.cls === "cima" ? -4 : L.cls === "baixo" ? 4 : 0);
    gsap().set(m, { xPercent: L.xp, yPercent: L.yp });
    // texto preso ao 3D só entra com a câmera assentada (2,7 s); dali em diante, quando o setor acende
    const meio = tAcende + durAcende * ((acum[i] - FASES_N[i] / 2) / 208);
    tl.fromTo(m, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out", immediateRender: false }, Math.max(meio - 0.1, 2.7 + 0.08 * i));
    return m;
  });
  entraLinhas(tl, q(".tit"), 3.0);
  // o Top 3 acende em ouro; um selo em cada índice
  tl.to(M.disco, { top3: 1, duration: 0.8, ease: "power2.out" }, 5.0);
  const selos = ["FIN3.10", "FIN8.2", "FIN5.11"].map((cod) => { const m = rot(c, M, M.posIndice(cod, 0.64), "selo", E.selo); gsap().set(m, { xPercent: -50, yPercent: -50 }); return m; });
  tl.fromTo(selos, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.1, immediateRender: false }, 5.4);
  entraLinhas(tl, q(".sub"), 6.0);
  const textoFases = E.fases.join(" · ");
  const B = batida(0, [{ o: 1.6, texto: textoFases }, { o: 3.0, texto: E.titulo, cam: 1 }, { o: 5.4, texto: E.selo }, { o: 6.0, texto: E.sub }], [[0.2, 2.6], [tAcende, durAcende], [5.0, 0.8]]);
  parada(tl, ctx, "ecossistema", B.t, B.hold);
  tl.to({}, { duration: 0.4 }, B.fim);

  // exploração opcional, fora da linha do tempo: tocar no nome de uma fase mostra três temas de exemplo
  const caixa = q(".amostra");
  let aberta = -1;
  fases.forEach((m, i) => {
    const ancora = m.parentElement;
    ancora.style.pointerEvents = "auto"; ancora.style.cursor = "pointer";
    ancora.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (Number(m.style.opacity || 0) < 0.5) return;
      aberta = aberta === i ? -1 : i;
      gsap().killTweensOf(caixa);
      if (aberta < 0) { gsap().to(caixa, { opacity: 0, duration: 0.3 }); fases.forEach((x) => x.classList.remove("ativa")); return; }
      caixa.innerHTML = `<em>${E.fases[i]} · exemplos</em>${(E.amostras[i + 1] || []).map((a) => `<span>${a}</span>`).join("")}`;
      fases.forEach((x, k) => x.classList.toggle("ativa", k === i));
      gsap().fromTo(caixa, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
    });
  });
  return tl;
}

// ============================================================================ 14 · o próximo passo
export function fecho(c, ctx) {
  const M = ctx.mundo, F = FIM(ctx.base, ctx.R).fecho;
  c.className = "cena c-fim";
  c.innerHTML = `<p class="rot">${linhas(F.rotulo)}</p><h1 class="tit t-titulo">${linhas(F.titulo)}</h1>
  <ol class="acoes">${F.acoes.map((a, i) => `<li><b>${i + 1}</b><span>${a}</span></li>`).join("")}</ol>
  <p class="rodape">${F.rodape}</p><div class="halo"></div>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  // continua do mostrador inteiro dos 208 e vem ao plano do relógio (mostrador à direita, ponteiros à vista)
  M.base(tl, { cam: "topoDir", disco: { acesos: 208, top3: 1 }, luz: { a: 1.0, expo: 1 } });
  M.irPara(tl, "relogio", 2.2, 0.2, {}, "power2.inOut");
  entraLinhas(tl, q(".rot"), 1.8);
  entraLinhas(tl, q(".tit"), 2.2);
  const itens = [...c.querySelectorAll(".acoes li")];
  aparecer(tl, itens, 3.4, 0.6, 0.25, 10);
  aparecer(tl, q(".rodape"), 6.0, 0.6, 0, 6);
  // o relógio volta e assenta em 10h10 enquanto a lista é lida (o único movimento durante a leitura); a volta é
  // medida quando a corrida começa e tem pelo menos 3 h, para ser vista
  const R = M.relogio, alvo = 10 + 10 / 60;
  tl.to(R, { hora: () => { const h = R.hora; let volta = (((h - alvo) % 12) + 12) % 12; if (volta < 3) volta += 12; return h - volta; }, duration: 5.2, ease: CORRIDA }, 4.0);
  M.ritmoSegundo(tl, -1, 5.2, 4.0);
  // halo curto nos ponteiros quando assentam (momento 2 de 2)
  const halo = q(".halo"), centro = M.naTela(M.v3(0, 0.01, 0), "relogio");
  halo.style.left = `${centro.x.toFixed(0)}px`; halo.style.top = `${centro.y.toFixed(0)}px`;
  halo.style.opacity = "0";
  tl.fromTo(halo, { opacity: 0, scale: 0.85 }, { opacity: 0.55, scale: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, 9.0);
  tl.to(halo, { opacity: 0, duration: 0.45, ease: "power2.in" }, 9.35);
  const B = batida(0, [{ o: 1.8, texto: F.rotulo, cam: 1 }, { o: 2.2, texto: F.titulo }, { o: 3.4, texto: F.acoes.map((a, i) => `${i + 1}. ${a}`).join(" ") }, { o: 6.0, texto: F.rodape }], [[0.2, 2.2], [4.0, 5.2], [9.0, 0.8]]);
  parada(tl, ctx, "fim", B.t, B.hold);          // o último marco: a peça para aqui, no último quadro
  tl.to({}, { duration: 0.4 }, B.fim);
  return tl;
}
