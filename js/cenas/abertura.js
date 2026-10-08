// Abertura e a dor (bloco S1), pelo roteiro v1 (estudo/roteiro/50-roteiro-v1.md, cenas 0–2).
//  0 · abertura: o instrumento acende e o relógio acerta o meio-dia (o "hoje" do calendário).
//  1 · venda: o mostrador vira calendário (cada hora é um mês); as dez parcelas pousam nas horas 1 a 10; o ponteiro
//      corre os meses; a antecipação traz cada parcela de volta ao 12 e deixa no lugar a lasca do desconto.
//  2 · retrato: a rede ilustrativa (porte), a agenda dela no mesmo mostrador, o palpite, o custo do ano e a pergunta.
// Símbolos fixos: parcela = vidro marfim · desconto e "já antecipado" = ouro · cedido e saída de caixa = grafite.
// Textos e números: js/conteudo/abertura.js (todo número vem do motor). [L] = legenda de leitura: classe so-assistir.
// As barras que andam pelo aro guardam o ângulo em b.x (que entra na assinatura do quadro do mundo): a posição sai
// dele por um getter, sem onUpdate — a cena fica certa em qualquer busca da linha do tempo.
import { ABERTURA } from "../conteudo/abertura.js?v=202610071930";
import { direcao } from "../mundo.js?v=202610071930";
import { gsap, marco, TAU, rot, aparecer, sumir, parada, linhas, revelar, recolher, atenuar } from "./comum.js?v=202610071930";

// ---------------------------------------------------------------------------------------------- planos e medidas
const LUZ_A = 1.0;                                                                    // ângulo da luz no calendário
// o mostrador como calendário: alto, de frente para o 12, à direita da coluna de texto (centro ≈ x 1198, 830 px)
const CAL = { x: -0.58, y: 3.754, z: 3.17, tx: -0.58, ty: 0, tz: 0.02, fov: 30 };
// o retrato: um pouco mais longe e à direita, para o anel da agenda, o palpite e a pergunta
const CAL2 = { x: -0.78, y: 3.939, z: 3.546, tx: -0.78, ty: 0, tz: 0, fov: 30 };
const R_PARC = 0.58, R_SAIDA = 0.42, R_COL = 0.95, R_ARO = 1.14;                      // raios (mostrador = 1)
const H_PARC = 0.40, W_PARC = 0.075, H_SAIDA = 0.22, PILHA = 0.026, H_AGENDA = 0.44;  // alturas e larguras (mundo)
const ang = (k) => k / 12 * TAU;                                                      // hora k → ângulo (0 = 12h)
const CORRIDA = (t) => t * t * (6 - 8 * t + 3 * t * t);                               // a curva do relógio (mundo.js)
const invCorrida = (p) => { let a = 0, b = 1; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (CORRIDA(m) < p) a = m; else b = m; } return (a + b) / 2; };
const virar = (cam, x, z) => Math.atan2(cam.x - x, cam.z - z);                        // giro de frente para a câmera
const fimEm = (tl, t) => tl.set({}, {}, t);                                           // a cena dura até t (hold da última parada)

// barra fixa num ponto do mostrador, de frente para a câmera
const fixa = (cam, p, extra) => ({ pos: p, giro: virar(cam, p.x, p.z), ...extra });
// barra que anda pelo aro: ângulo em b.x, raio em b.rr; posição e giro calculados a cada quadro
function noAro(b, cam) {
  b.pos = { get x() { return Math.sin(b.x) * b.rr; }, y: 0.012, get z() { return -Math.cos(b.x) * b.rr; } };
  Object.defineProperty(b, "giro", { configurable: true, enumerable: true, get: () => virar(cam, Math.sin(b.x) * b.rr, -Math.cos(b.x) * b.rr) });
}
// barras que nascem da base (k 0 → 1), uma depois da outra; só tweens de propriedades (vale em qualquer busca)
function brotar(tl, bs, t, dur = 0.8, cada = 0.08, ease = "power3.out") {
  bs.forEach((b, i) => { tl.set(b, { a: 1 }, t + i * cada); tl.fromTo(b, { k: 0.001 }, { k: 1, duration: dur, ease, immediateRender: false }, t + i * cada); });
}
// contador com o formato final desde o primeiro quadro (o texto já nasce com o valor certo)
function contar(tl, el, valor, fmt, dur, t) {
  const o = { v: 0 }; let ult = "";
  tl.fromTo(o, { v: 0 }, { v: valor, duration: dur, ease: "expo.out", immediateRender: false, onUpdate: () => { const s = fmt(o.v); if (s !== ult) { el.textContent = s; ult = s; } } }, t);
}

// Rótulos do aro do calendário: "hoje" no 12 (ouro, ao lado da coluna que nasce ali), 3, 6 e 9 meses por fora.
function rotulosAro(c, M, aro) {
  const pos = { 0: ["d ouro", -22, 0], 3: ["e", 6, 0], 6: ["c", 0, 12], 9: ["d", -6, 0] };
  return aro.map(([h, t]) => { const [cls, dx, dy] = pos[h] || ["c", 0, 0]; return rot(c, M, direcao(ang(h), R_ARO, 0), `aro ${cls}`, t, dx, dy); });
}

// O que a venda deixa no mostrador: as lascas de ouro nas horas 1 a n e a coluna das parcelas no 12 (também é o
// estado inicial do retrato). Devolve os índices das peças nas specs.
function pecasDaVenda(specs, cam, n, d) {
  const casa = (k, r = R_PARC) => direcao(ang(k), r, 0.012);
  const o = { parc: specs.length };
  for (let k = 1; k <= n; k++) specs.push(fixa(cam, casa(k), { y0: 0, h: H_PARC, w: W_PARC, cor: "marfim", cheio: 0.72, raio: 0.008 }));
  o.brilho = specs.length;
  for (let k = 1; k <= n; k++) specs.push(fixa(cam, casa(k), { y0: 0, h: H_PARC, w: W_PARC, cor: "ouro", cheio: 0.85, topo: 0, raio: 0.008 }));
  o.lasca = specs.length;
  for (let k = 1; k <= n; k++) specs.push(fixa(cam, casa(k), { y0: 0, h: H_PARC * d[k - 1], w: W_PARC, cor: "ouro", cheio: 0.92, raio: 0.003 }));
  o.pisca = specs.length;
  for (let k = 1; k <= n; k++) specs.push(fixa(cam, casa(k), { y0: 0, h: H_PARC * d[k - 1], w: W_PARC, cor: "marfim", cheio: 0.95, topo: 0, raio: 0.003 }));
  o.corpo = specs.length;
  for (let k = 1; k <= n; k++) specs.push({ x: ang(k), rr: R_PARC, y0: H_PARC * d[k - 1], h: H_PARC * (1 - d[k - 1]), w: W_PARC, cor: "marfim", cheio: 0.72, raio: 0.008 });
  return o;
}
// a parcela i (0 = hora 1) depois do voo: no 12, empilhada na coluna (a primeira a chegar fica embaixo; as
// seguintes, um pouco à frente, para a ordem de desenho não piscar)
const naColuna = (i) => ({ x: 0, rr: R_COL - 0.004 * i, y0: PILHA * i });

// ============================================================================ 0 · abertura (6,0 s)
// A luz acende sobre os ponteiros; o ponteiro das horas avança até o meio-dia; a câmera recua do macro até o
// calendário; os 12 bastões de hora brilham. Sem texto: no apresentar, a fala ocupa a parada `abre`.
export function abertura(c, ctx) {
  const M = ctx.mundo;
  c.className = "cena c-abre";
  c.innerHTML = "";
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: "macro", luz: { a: LUZ_A - 0.9, i: 0, expo: 0 }, disco: { acesos: 0, horas: 0.6 }, poeira: { a: 0 } });
  tl.to(M.luz, { i: 1, expo: 1, duration: 2.0, ease: "power2.out" }, 0);
  M.luzPara(tl, { a: LUZ_A }, 3.2, 0.3, "power2.inOut");            // a faixa de luz corre o raiado enquanto a câmera recua
  M.irPara(tl, CAL, 3.2, 0.3, {}, "power3.inOut");                    // câmera longa: o próprio relógio é a novidade
  M.acertarRelogio(tl, 12, 2.4, 1.0);                                 // o ponteiro avança até o meio-dia: o "hoje"
  tl.to(M.poeira, { a: 1, duration: 1.4, ease: "power1.out" }, 1.0);
  tl.to(M.disco, { horas: 1, duration: 1.0, ease: "power2.out" }, 2.6);
  parada(tl, ctx, "abre", 5.4, 0.6);
  marco(tl, "fim", 6.0);
  fimEm(tl, 6.0);
  return tl;
}

// ============================================================================ 1 · a venda que vira caixa (33,8 s)
export function venda(c, ctx) {
  const M = ctx.mundo, T = ABERTURA(ctx.base, ctx.R).venda, n = T.n, d = T.lascas;
  c.className = "cena c-venda";
  c.innerHTML = `
    <div class="bk k1"><h1 class="t-titulo">${linhas(T.titulo)}</h1></div>
    <div class="bl l1 so-assistir"><p>${linhas(T.legHora)}</p></div>
    <div class="bk k2"><h1 class="t-titulo">${linhas(T.ciclo)}</h1></div>
    <div class="bl l2 so-assistir"><p>${linhas(T.legCiclo)}</p></div>
    <div class="bk k3"><h1 class="t-titulo">${linhas(T.antecipa)}</h1></div>
    <div class="bl l3 so-assistir"><p>${linhas(T.legAntecipa)}</p></div>
    <div class="bk k4"><h1 class="t-titulo"><span class="l"><span>${T.tudoHoje}</span></span><span class="l"><span><b class="heroi num">${T.heroi}</b><span class="pct"> · ${T.pctVenda}</span></span></span></h1></div>
    ${T.legVezes ? `<div class="bl l4 so-assistir"><p>${linhas(T.legVezes)}</p></div>` : ""}
    <p class="nota-taxa">${T.notaTaxa}</p>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: CAL, luz: { a: LUZ_A }, disco: { acesos: 0, horas: 1 } });
  tl.set(M.relogio, { hora: 12 }, 0);                                  // meio-dia: hoje (a abertura já deixou assim)

  // as peças: parcelas, brilho, lascas, piscar das lascas, corpos que voam, e o marcador de saída (lente paga)
  const specs = [], o = pecasDaVenda(specs, CAL, n, d);
  const iSaida = specs.length;
  specs.push(fixa(CAL, direcao(ang(T.mesLente), R_SAIDA, 0.012), { y0: 0, h: H_SAIDA, w: W_PARC, cor: "grafite", cheio: 0.95, ouro: 0, raio: 0.008 }));
  const B = M.definirBarras(M.grafico({ origem: M.v3(0, 0, 0) }), specs);
  const parc = B.slice(o.parc, o.parc + n), brilho = B.slice(o.brilho, o.brilho + n), lasca = B.slice(o.lasca, o.lasca + n);
  const pisca = B.slice(o.pisca, o.pisca + n), corpo = B.slice(o.corpo, o.corpo + n), saida = B[iSaida];
  corpo.forEach((b) => noAro(b, CAL));
  tl.set(B, { a: 0, k: 1 }, 0);
  tl.set([...parc, saida], { k: 0 }, 0);
  corpo.forEach((b, i) => tl.set(b, { x: ang(i + 1), rr: R_PARC, y0: H_PARC * d[i] }, 0));

  // rótulos colados ao 3D (os dois modos): o aro do calendário, a lente paga e a última parcela
  const aro = rotulosAro(c, M, T.aro);
  const rLente = rot(c, M, direcao(ang(T.mesLente), R_SAIDA, 0.012), "r3d e saida", T.rotLente, -8, 30);   // logo abaixo do marcador: livre das parcelas e do monograma
  const rUltima = rot(c, M, direcao(ang(n), R_PARC, 0.012 + H_PARC), "r3d c", T.rotUltima, 0, -24);

  // 1.1 · a venda: título; as dez parcelas nascem nas horas 1 a 10, no sentido horário; o aro vira calendário
  revelar(tl, q(".k1"), 0.3);
  brotar(tl, parc, 1.0, 0.75, 0.1);
  aparecer(tl, aro, 3.2, 0.6, 0.08, 6);
  revelar(tl, q(".l1"), 3.6);
  parada(tl, ctx, "venda", 4.2, 3.6);

  // 1.2 · paga em um mês, recebe em dez: o ponteiro das horas corre os dez meses; cada parcela brilha quando ele passa
  const t2 = 7.8, tCorre = 8.0, dCorre = 3.2;
  recolher(tl, [q(".k1"), q(".l1")], t2, 0.25);
  M.correrRelogio(tl, n, dCorre, tCorre);
  revelar(tl, q(".k2"), tCorre + 0.2);
  revelar(tl, q(".l2"), tCorre + 0.9);
  const passa = (h) => tCorre + dCorre * invCorrida(h / n);           // quando o ponteiro passa pela hora h
  brilho.forEach((b, i) => { const tp = passa(i + 1); tl.to(b, { a: 0.35, duration: 0.2, ease: "power1.out" }, tp - 0.2); tl.to(b, { a: 0, duration: 0.2, ease: "power1.in" }, tp); });
  brotar(tl, [saida], passa(T.mesLente), 0.5, 0);
  aparecer(tl, rLente, passa(T.mesLente) + 0.2, 0.5);
  aparecer(tl, rUltima, tCorre + dCorre - 0.3, 0.5);
  parada(tl, ctx, "ciclo", tCorre + dCorre, 5.8);

  // 1.3 · para ter hoje, a rede antecipa: brilho curto; as parcelas voltam pelo aro até o 12 (a mais próxima primeiro),
  // deixam a lasca de ouro do desconto no lugar e empilham numa coluna no 12; o ponteiro volta dez horas junto
  const t3 = 17.0, tVoo = t3 + 1.8;
  recolher(tl, [q(".k2"), q(".l2")], t3, 0.25);
  sumir(tl, [rLente, rUltima], t3, 0.35);
  tl.to(saida, { a: 0, duration: 0.5, ease: "power1.in" }, t3);
  revelar(tl, q(".k3"), t3 + 0.3);
  revelar(tl, q(".l3"), t3 + 0.8);
  tl.to(brilho, { a: 0.35, duration: 0.1, ease: "power1.out" }, tVoo - 0.3);
  tl.to(brilho, { a: 0, duration: 0.1, ease: "power1.in" }, tVoo - 0.2);
  tl.to(lasca, { a: 1, duration: 0.2, ease: "power1.out" }, tVoo - 0.3);
  M.correrRelogio(tl, -n, 2.9, tVoo - 0.1);
  corpo.forEach((b, i) => {
    const t = tVoo + 0.12 * i, fim = naColuna(i);
    tl.set(parc[i], { a: 0 }, t);
    tl.set(b, { a: 1 }, t);
    tl.to(b, { x: fim.x, y0: fim.y0, duration: 1.6, ease: "power2.inOut" }, t);
    tl.to(b, { rr: fim.rr, duration: 1.2, ease: "power2.inOut" }, t + 0.4);   // sai para fora do aro antes do 12: não cobre o monograma
  });

  // 1.4 · tudo hoje: o número-herói, estático; as lascas piscam uma vez quando ele aparece
  const t4 = 25.0;
  recolher(tl, [q(".k3"), q(".l3")], t4, 0.25);
  revelar(tl, q(".k4"), t4 + 0.3);
  tl.to(pisca, { a: 0.6, duration: 0.15, ease: "power1.out" }, t4 + 0.5);
  tl.to(pisca, { a: 0, duration: 0.15, ease: "power1.in" }, t4 + 0.65);
  if (q(".l4")) revelar(tl, q(".l4"), t4 + 1.2);
  aparecer(tl, q(".nota-taxa"), t4 + 1.9, 0.5, 0, 6);                  // premissa da taxa, nos dois modos (roteiro v2, D3)
  parada(tl, ctx, "custo-venda", 29.0, 4.4);
  marco(tl, "fim", 33.4);
  recolher(tl, [q(".k4"), q(".l4")], 33.4, 0.35);
  sumir(tl, q(".nota-taxa"), 33.4, 0.3);                     // as lascas e a coluna ficam para o retrato
  fimEm(tl, 33.8);
  return tl;
}

// ============================================================================ 2 · o retrato da rede (42,2 s)
export function retrato(c, ctx) {
  const M = ctx.mundo, A = ABERTURA(ctx.base, ctx.R), T = A.retrato, V = A.venda, n = V.n, d = V.lascas, CA = T.custoAno;
  const totalPartes = CA.partes.reduce((s, p) => s + p.v, 0);
  c.className = "cena c-retrato";
  c.innerHTML = `
    <p class="rot-rede">${T.rotulo}</p>
    <div class="bk k1"><h1 class="t-titulo">${linhas(T.titulo)}</h1></div>
    <div class="bl l1 so-assistir"><p>${linhas(T.legPorte)}</p></div>
    <div class="bk k2"><h1 class="t-titulo">${linhas(T.agenda.titulo)}</h1></div>
    <div class="leg-ag">${T.agenda.legenda.map(([cl, t]) => `<span><i class="${cl}"></i>${t}</span>`).join("")}</div>
    <div class="bl l2 so-assistir"><p>${linhas(T.agenda.leg)}</p></div>
    <div class="bk kq"><h1 class="t-titulo">${linhas(T.palpite.pergunta)}</h1></div>
    <div class="faixas">${T.palpite.faixas.map((f, i) => `<span class="fx${i === T.palpite.certa ? " certa" : ""}">${f}</span>`).join("")}</div>
    <div class="custo"><p class="t-titulo"><span class="l"><span><b class="heroi num">${CA.fmt(CA.valor)}</b> ${CA.sufixo}</span></span><span class="l"><span>${CA.pct}</span></span></p></div>
    <div class="partes"><div class="trilho">${CA.partes.map((p, i) => `<i class="p${i}" style="width:${(100 * p.v / totalPartes).toFixed(2)}%"></i>`).join("")}</div>
      <p>${CA.partes.map((p, i) => `<span class="p${i}"><i></i>${p.t}</span>`).join("")}</p></div>
    <div class="bk kp"><h1 class="t-display">${linhas(T.pergunta)}</h1></div>
    <p class="nota-fonte">${T.nota}</p>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: CAL, luz: { a: LUZ_A }, disco: { acesos: 0, horas: 1 } });
  tl.set(M.relogio, { hora: 12 }, 0);

  // o estado em que a venda terminou (lascas e coluna) e o anel da agenda: 10 meses × (antecipado, cedido, livre)
  const specs = [], o = pecasDaVenda(specs, CAL, n, d);
  const ag = T.agenda.meses, escala = H_AGENDA / Math.max(...ag.map((m) => m.total)), CORES = ["ouro", "grafite", "marfim"];
  const iAnel = specs.length;
  ag.forEach((m, j) => { const p = direcao(ang(j + 0.5), R_PARC, 0.012); m.partes.forEach((v, s) => specs.push(fixa(CAL2, p, { y0: 0, h: v * escala, w: W_PARC, cor: CORES[s], cheio: s === 1 ? 0.9 : 0.8, topo: s === 2 ? 1 : 0, raio: 0.006 }))); });
  const B = M.definirBarras(M.grafico({ origem: M.v3(0, 0, 0) }), specs);
  const lasca = B.slice(o.lasca, o.lasca + n), corpo = B.slice(o.corpo, o.corpo + n), anel = B.slice(iAnel);
  corpo.forEach((b) => noAro(b, CAL));
  tl.set(B, { a: 0, k: 1 }, 0);
  tl.set(lasca, { a: 1 }, 0);
  corpo.forEach((b, i) => tl.set(b, { a: 1, ...naColuna(i) }, 0));
  tl.set(anel, { k: 0 }, 0);
  const aro = rotulosAro(c, M, V.aro);
  aro.forEach((m) => { m.style.opacity = "1"; });

  // 2.1 · a rede: as lascas e a coluna se apagam; câmera curta; 60 lojas, R$ 150 milhões; ≈ 1,4% do varejo paulista
  tl.to([...lasca, ...corpo], { a: 0, duration: 0.6, ease: "power1.in" }, 0);
  M.irPara(tl, CAL2, 1.0, 0.2, {}, "power2.inOut");
  aparecer(tl, q(".rot-rede"), 1.2, 0.5, 0, 6);
  revelar(tl, q(".k1"), 1.3);
  revelar(tl, q(".l1"), 2.1);
  aparecer(tl, q(".nota-fonte"), 2.6, 0.6, 0, 0);
  parada(tl, ctx, "rede", 4.0, 4.1);

  // 2.2 · a agenda: o anel cresce no sentido horário, onde estavam as parcelas da venda (mesmo raio, mesmo ouro)
  const t2 = 8.1;
  recolher(tl, [q(".k1"), q(".l1")], t2, 0.25);
  ag.forEach((m, j) => {
    const [ba, bc, bl] = anel.slice(3 * j, 3 * j + 3), [ha, hc] = m.partes.map((v) => v * escala), t = t2 + 0.2 + 0.09 * j, dur = 0.8, ease = "power3.out";
    tl.set([ba, bc, bl], { a: 1 }, t);
    tl.fromTo(ba, { k: 0.001 }, { k: 1, duration: dur, ease, immediateRender: false }, t);
    tl.fromTo(bc, { k: 0.001, y0: 0 }, { k: 1, y0: ha, duration: dur, ease, immediateRender: false }, t);
    tl.fromTo(bl, { k: 0.001, y0: 0 }, { k: 1, y0: ha + hc, duration: dur, ease, immediateRender: false }, t);
  });
  revelar(tl, q(".k2"), t2 + 0.4);
  aparecer(tl, q(".leg-ag"), t2 + 1.4, 0.6, 0, 8);
  revelar(tl, q(".l2"), t2 + 2.2);
  parada(tl, ctx, "agenda", 11.9, 6.1);

  // 2.3 · o palpite: o mundo cai a ~45%, o anel a 30%; a pergunta e as três faixas
  const t3 = 18.0;
  recolher(tl, [q(".k2"), q(".l2")], t3, 0.25);
  sumir(tl, [q(".leg-ag"), ...aro], t3, 0.35);
  tl.to(M.luz, { expo: 0.45, duration: 0.6, ease: "power2.out" }, t3);
  tl.to(anel, { a: 0.3, duration: 0.6, ease: "power2.out" }, t3);
  revelar(tl, q(".kq"), t3 + 0.4);
  aparecer(tl, c.querySelectorAll(".fx"), t3 + 1.3, 0.5, 0.15, 8);
  parada(tl, ctx, "palpite", 20.1, 8.1);

  // 2.4 · a resposta: a faixa certa ganha borda de ouro; R$ 6,36 mi por ano conta; a barra em duas partes
  const t4 = 28.2, fx = Array.from(c.querySelectorAll(".fx")), certa = fx[T.palpite.certa];
  recolher(tl, q(".kq"), t4, 0.3);
  tl.to(certa, { borderColor: "#C8A45A", color: "#C8A45A", duration: 0.4, ease: "power2.out" }, t4 + 0.1);
  atenuar(tl, fx.filter((e) => e !== certa), t4 + 0.1, 0.32, 0.4);
  revelar(tl, q(".custo"), t4 + 0.4);
  contar(tl, q(".custo .heroi"), CA.valor, CA.fmt, 0.9, t4 + 0.4);
  aparecer(tl, q(".partes"), t4 + 1.4, 0.4, 0, 0);
  tl.fromTo(q(".partes .trilho"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, t4 + 1.4);
  parada(tl, ctx, "custo-ano", 30.6, 3.7);

  // 2.5 · a pergunta: tudo sai; o mundo atenuado; só a pergunta
  const t5 = 34.3;
  sumir(tl, [...fx, q(".partes"), q(".rot-rede"), q(".nota-fonte")], t5, 0.35);
  recolher(tl, q(".custo"), t5, 0.3);
  tl.to(anel, { a: 0, duration: 0.5, ease: "power1.in" }, t5);
  revelar(tl, q(".kp"), t5 + 0.3, 0.6, 0.12);
  parada(tl, ctx, "pergunta", 35.2, 6.6);
  marco(tl, "fim", 41.8);
  recolher(tl, q(".kp"), 41.8, 0.35);
  fimEm(tl, 42.2);
  return tl;
}
