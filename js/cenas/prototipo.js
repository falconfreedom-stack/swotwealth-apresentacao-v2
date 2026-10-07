// PROTÓTIPO (fora do percurso): o mostrador como calendário de 12 meses — cada hora é um mês. As dez parcelas
// de uma venda em 10x pousam nas horas 1 a 10; a antecipação as traz de volta ao 12 (hoje), e cada uma perde
// o desconto proporcional à distância. Serve para conferir se o instrumento sustenta a ideia.
import { F } from "../util.js?v=202610071930";
import { direcao } from "../mundo.js?v=202610071930";
import { gsap, marco, rot, aparecer, sumir, crescer, apagar, TAU, parada } from "./comum.js?v=202610071930";

const MESES = ["set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago"];

export function calendario(c, ctx) {
  const M = ctx.mundo;
  c.className = "cena c-cal";
  c.innerHTML = `<div class="topo" style="position:absolute;left:112px;top:96px;width:620px"><p class="rotulo">Sábado, 15h40</p><h1 class="t-titulo">Multifocal com armação. R$ 1.890 em 10× sem juros.</h1></div>
    <div class="topo2" style="position:absolute;left:112px;top:96px;width:620px"><h1 class="t-titulo">Para receber hoje, a rede deixa R$ 196 na mesa.</h1><p class="t-lead" style="margin-top:18px">10,4% da venda, só para trazer as parcelas para hoje.</p></div>`;
  const tl = gsap().timeline({ paused: true });
  const CAM = { x: 0.55, y: 3.05, z: 2.05, tx: 0.45, ty: 0, tz: 0.08, fov: 30 };
  M.base(tl, { cam: CAM, disco: { acesos: 0, top3: 0, horas: 1 }, luz: { a: 1.0 } });
  tl.set(M.relogio, { hora: 12 + 0.001, ritmoSeg: 1 }, 0);
  const G = M.grafico({ origem: M.v3(0, 0, 0) });
  const R = 0.56, H = 0.20, taxa = 0.0189;
  const specs = [];
  for (let k = 1; k <= 10; k++) { const th = k / 12 * TAU; specs.push({ pos: direcao(th, R, 0.012), giro: -th, y0: 0, h: H, w: 0.075, cor: "marfim", cheio: 0.74, raio: 0.008 }); }
  // o desconto de cada parcela: uma lasca de ouro que fica para trás
  for (let k = 1; k <= 10; k++) { const th = k / 12 * TAU; specs.push({ pos: direcao(th, R, 0.012), giro: -th, y0: H * (1 - taxa * k), h: H * taxa * k, w: 0.075, cor: "ouro", cheio: 0.85, raio: 0.004 }); }
  const B = M.definirBarras(G, specs), parc = B.slice(0, 10), lasca = B.slice(10);
  const rotMes = MESES.map((m, k) => rot(c, M, direcao(k / 12 * TAU, 1.22, 0), "cat c", k === 0 ? "hoje" : m));
  const rotVal = parc.map((b, k) => rot(c, M, direcao((k + 1) / 12 * TAU, R, 0.012 + H + 0.03), "val c peq", `<b class="num">R$ 189</b>`, 0, -14));
  const q = (s) => c.querySelector(s);
  tl.set([q(".topo"), q(".topo2")], { opacity: 0 }, 0);
  aparecer(tl, q(".topo"), 0.4, 0.8);
  aparecer(tl, rotMes, 0.8, 0.5, 0.04, 4);
  crescer(tl, parc, 1.6, 0.7, 0.12);
  aparecer(tl, rotVal, 2.2, 0.4, 0.12, 4);
  marco(tl, "parcelas", 1.6);
  // o tempo passa: o ponteiro das horas corre os dez meses
  M.correrRelogio(tl, 10, 3.2, 4.2);
  marco(tl, "tempo", 4.2);
  parada(tl, ctx, "pergunta", 7.4, 0.6);
  // a antecipação traz cada parcela de volta ao 12; a lasca de ouro fica onde a parcela estava
  sumir(tl, [q(".topo"), ...rotVal], 7.8, 0.4);
  tl.set(lasca, { a: 1, k: 1 }, 8.2);
  parc.forEach((b, i) => {
    const k = i + 1, st = { th: k / 12 * TAU, h: H };
    tl.fromTo(st, { th: k / 12 * TAU, h: H }, { th: 0.035 * (k - 5.5), h: H * (1 - taxa * k), duration: 1.5, ease: "power3.inOut", immediateRender: false,
      onUpdate: () => { b.pos = direcao(st.th, R * (0.62 + 0.38 * Math.abs(st.th) / ((k / 12) * TAU)), 0.012); b.giro = -st.th; b.h = st.h; M.marcar(); } }, 8.2 + i * 0.10);
  });
  marco(tl, "antecipa", 8.2);
  aparecer(tl, q(".topo2"), 9.8, 0.8);
  tl.to(lasca, { a: 0.0, duration: 1.2, ease: "power1.in" }, 13.0);
  marco(tl, "fim", 14.5);
  tl.to({}, { duration: 1 }, 14.5);
  return tl;
}
