// O instrumento no seu lugar: um disco verde de acabamento raiado dentro de uma caixa de metal escuro,
// com aro polido e chanfro dourado, pousado num chão de pedra polida que reflete tudo o que está sobre ele,
// num estúdio escuro com uma luz principal que corre em volta. Os 208 projetos são índices aplicados em
// dez setores; lâminas de vidro sobem do disco e viram folhas; os gráficos são barras do mesmo vidro,
// linhas de luz e índices, construídos no espaço e lidos de frente.
// Tudo é desenhado por shaders próprios, com antisserrilhado analítico: nenhuma textura fotográfica,
// nenhuma sombra em tempo real, nenhum pós-processamento em tela cheia. O reflexo do chão é um passe
// em um terço da resolução. A imagem só é redesenhada quando algo muda.
import * as THREE from "three";

const W = 1920, H = 1080;
export const FASES_N = [33, 29, 17, 18, 19, 14, 23, 22, 19, 14];
const GAP = 3, SLOTS = 208 + 10 * GAP, TAU = Math.PI * 2, PASSO = TAU / SLOTS;
const R0 = 0.785, R1 = 0.905;                 // faixa dos índices no disco
export const Y_CHAO = -0.104;                 // o chão de pedra, onde a caixa pousa
const R_CAIXA = 1.096;

// ------------------------------------------------------------------------------------ shaders
// Estúdio: um softbox grande no alto (na direção da luz, que gira em torno do eixo), uma tira de
// contorno do lado oposto e o escuro. Serve de reflexo para o metal, o vidro e o mostrador.
const COMUM = /* glsl */`
uniform float uExpo; uniform float uLuzA; uniform float uLuz;
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 pontilhar(vec3 c){ return c + (hash12(gl_FragCoord.xy) - 0.5) / 255.0; }
vec3 dirLuz(float el){ return normalize(vec3(sin(uLuzA) * cos(el), sin(el), -cos(uLuzA) * cos(el))); }
float caixaSuave(vec2 p, vec2 b, float s){ vec2 q = abs(p) - b; return 1.0 - smoothstep(-s, s, max(q.x, q.y)); }
vec3 estudio(vec3 R){
  vec3 d = dirLuz(0.95);
  vec3 t = normalize(cross(d, vec3(0.0, 1.0, 0.0) + vec3(0.0001))); vec3 b = cross(t, d);
  float k = dot(R, d);
  vec2 p = vec2(dot(R, t), dot(R, b)) / max(k, 0.05);
  float caixa = k > 0.0 ? caixaSuave(p, vec2(0.34, 0.22), 0.06) : 0.0;
  vec3 d2 = normalize(vec3(-sin(uLuzA) * 0.9, 0.25, cos(uLuzA) * 0.9));
  float tira = pow(max(dot(R, d2), 0.0), 60.0);
  float ceu = 0.010 + 0.018 * smoothstep(-0.2, 1.0, R.y);
  return vec3(1.0, 0.975, 0.93) * caixa * 1.25 * uLuz + vec3(0.80, 0.86, 0.84) * tira * 0.45 * uLuz + vec3(ceu * 0.8, ceu, ceu * 0.9);
}
`;
const V_MUNDO = /* glsl */`
varying vec3 vP; varying vec3 vW; varying vec2 vUv; varying vec3 vN;
void main(){ vP = position; vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

// O mostrador: raiado que acende com a luz, aros finos, os índices e o reflexo do vidro de safira.
const F_DISCO = COMUM + /* glsl */`
uniform sampler2D uIdx; uniform float uAneis; uniform float uVidro;
varying vec3 vP; varying vec3 vW;
float faixa(float x, float c, float hw, float aa){ return 1.0 - smoothstep(hw - aa, hw + aa, abs(x - c)); }
void main(){
  vec2 p = vec2(vP.x, vP.z);
  float r = length(p);
  float th = atan(p.x, -p.y); if (th < 0.0) th += 6.2831853;
  float aa = length(fwidth(p)) * 0.7 + 1e-6;
  vec3 V = normalize(cameraPosition - vW);
  float graz = 0.45 + 0.55 * (1.0 - clamp(V.y, 0.0, 1.0));
  float co = cos(th - uLuzA);
  float ac = abs(co), c2 = ac * ac, c4 = c2 * c2, c8 = c4 * c4, c16 = c8 * c8;
  float lobo = c16 * c2, lobo2 = c2 * ac;
  float fr = 250.0;
  float wA = fr * aa / max(r, 1e-3);
  float raia = mix(hash12(vec2(floor(th * fr), 3.1)), 0.5, clamp(wA * 1.5, 0.0, 1.0));
  vec3 base = vec3(0.030, 0.108, 0.078);
  vec3 luzc = vec3(0.22, 0.52, 0.39);
  vec3 c = base * (0.90 + 0.20 * raia) + luzc * (lobo * 0.9 + lobo2 * 0.11) * (0.70 + 0.60 * raia) * uLuz * graz;
  c *= 1.0 - 0.30 * smoothstep(0.30, 1.0, r);
  c *= 1.0 - 0.35 * smoothstep(0.955, 1.0, r);          // sombra do aro sobre o mostrador
  vec3 marfim = vec3(0.93, 0.91, 0.85);
  float aros = faixa(r, 0.930, 0.0011, aa) * 0.5 + faixa(r, 0.760, 0.0008, aa) * 0.28 + faixa(r, 0.975, 0.0012, aa) * 0.45;
  c = mix(c, marfim, clamp(aros, 0.0, 1.0) * uAneis);
  float x = th / ${PASSO.toFixed(8)}; float si = floor(x); float f = x - si - 0.5;
  vec4 d = texture2D(uIdx, vec2((si + 0.5) / ${SLOTS}.0, 0.5));
  if (d.a > 0.5) {
    float hw = mix(0.0027, 0.0043, d.g);
    float ra = ${R0} - d.b * 0.030, rb = ${R1} + d.b * 0.022;
    float tang = f * ${PASSO.toFixed(8)} * r;
    float cov = (1.0 - smoothstep(hw - aa, hw + aa, abs(tang))) * smoothstep(ra - aa, ra + aa, r) * (1.0 - smoothstep(rb - aa, rb + aa, r));
    float thc = (si + 0.5) * ${PASSO.toFixed(8)};
    float glint = pow(abs(cos(thc - uLuzA)), 26.0) * uLuz;
    vec3 ouro = vec3(0.87, 0.71, 0.41);
    vec3 cor = mix(marfim, ouro, d.g);
    float b = mix(0.17, 1.0, d.r);
    vec3 ci = cor * b * (0.80 + 0.30 * glint) + vec3(1.0, 0.97, 0.90) * glint * 0.30 * d.r;
    c = mix(c, ci, cov);
  }
  // vidro de safira: reflexo fresco do softbox, forte só de lado
  float fres = 0.03 + 0.97 * pow(1.0 - clamp(V.y, 0.0, 1.0), 5.0);
  if (fres * uVidro > 0.06) c += estudio(vec3(-V.x, V.y, -V.z)) * fres * uVidro * 0.55;
  gl_FragColor = vec4(pontilhar(c * uExpo), 1.0);
}`;

// A caixa: metal escuro com reflexo do estúdio; chanfro dourado e topo polido do aro.
const F_CAIXA = COMUM + /* glsl */`
varying vec3 vW; varying vec2 vUv; varying vec3 vN;
void main(){
  vec3 V = normalize(cameraPosition - vW);
  vec3 N = normalize(vN); if (dot(N, V) < 0.0) N = -N;
  vec3 R = reflect(-V, N);
  float v = vUv.y;                                      // posição ao longo do perfil (0 = boca, 1 = fundo)
  float chanfro = smoothstep(0.030, 0.045, v) * (1.0 - smoothstep(0.110, 0.125, v));
  float lado = smoothstep(0.38, 0.42, v);
  float base = smoothstep(0.62, 0.70, v);
  vec3 env = estudio(R);
  float lum = dot(env, vec3(0.3333));
  float fres = 0.45 + 0.55 * pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  // aço polido no topo do aro; escovado na lateral (faixa larga de luz na direção da luz)
  vec3 L = dirLuz(0.5);
  float escovado = pow(max(dot(normalize(vec3(N.x, 0.0, N.z)), normalize(vec3(L.x, 0.0, L.z))), 0.0), 6.0);
  vec3 aco = vec3(0.050, 0.056, 0.054);
  vec3 polido = aco + env * vec3(0.78, 0.82, 0.80) * fres;
  vec3 lateral = aco * 1.2 + vec3(0.30, 0.31, 0.30) * escovado * uLuz * (0.5 + 0.5 * N.y) + env * 0.18;
  vec3 c = mix(polido, lateral, lado);
  // escala gravada no topo do aro: 120 traços finos, os de 5 em 5 mais longos (antisserrilhada por fwidth)
  float th = atan(vW.x, -vW.z); if (th < 0.0) th += 6.2831853;
  float xi = th / 6.2831853 * 120.0, fi = abs(fract(xi + 0.5) - 0.5), wi = fwidth(xi) * 0.8 + 1e-4;
  float longo = step(0.5, 1.0 - step(0.5, abs(mod(floor(xi + 0.5), 5.0))));
  float faixaT = smoothstep(0.140, 0.150, v) * (1.0 - smoothstep(longo > 0.5 ? 0.235 : 0.195, (longo > 0.5 ? 0.235 : 0.195) + 0.01, v));
  float traco = (1.0 - smoothstep(0.035 - wi, 0.035 + wi, fi)) * faixaT * (1.0 - lado);
  c = mix(c, vec3(0.80, 0.78, 0.72) * (0.55 + 0.45 * lum * 2.0), traco * 0.85);
  vec3 ouro = vec3(0.83, 0.64, 0.33);
  c = mix(c, ouro * (0.10 + 1.55 * lum) + vec3(1.0, 0.9, 0.7) * lum * lum * 0.8, chanfro);
  c *= 1.0 - 0.6 * base;
  gl_FragColor = vec4(pontilhar(c * uExpo), 1.0);
}`;

// O chão de pedra polida: poço de luz, sombra de contato, reflexo (passe em um terço da resolução) e
// neblina que dissolve o chão no fundo, sem linha de horizonte.
const F_CHAO = COMUM + /* glsl */`
uniform float uReflA;
varying vec3 vW;
void main(){
  vec2 p = vW.xz;
  float r = length(p);
  vec3 V = normalize(cameraPosition - vW);
  vec3 L = dirLuz(0.95);
  vec2 cPoco = L.xz * 0.45;
  float poco = exp(-dot(p - cPoco, p - cPoco) / 4.0);
  float amplo = exp(-dot(p, p) / 30.0);
  float contato = 1.0 - 0.80 * exp(-max(r - ${R_CAIXA.toFixed(3)}, 0.0) / 0.10) * step(${(R_CAIXA - 0.02).toFixed(3)}, r);
  vec3 pedra = vec3(0.010, 0.020, 0.016);
  vec3 c = pedra + (vec3(0.085, 0.110, 0.095) * poco + vec3(0.016, 0.024, 0.020) * amplo) * uLuz;
  c *= contato;
  float fres = 0.05 + 0.95 * pow(1.0 - clamp(V.y, 0.0, 1.0), 5.0);
  // reflexo da caixa: o raio refletido bate no cilindro da lateral?
  vec3 Rr = vec3(-V.x, V.y, -V.z);
  float A = dot(Rr.xz, Rr.xz), B = 2.0 * dot(p, Rr.xz), C = dot(p, p) - ${(R_CAIXA * R_CAIXA).toFixed(5)};
  float D = B * B - 4.0 * A * C;
  if (D > 0.0 && A > 1e-5 && C > 0.0) {
    float t = (-B - sqrt(D)) / (2.0 * A);
    float yh = vW.y + Rr.y * t;
    if (t > 0.0 && yh < 0.027) {
      vec2 nh = normalize(p + Rr.xz * t);
      float escov = pow(max(dot(nh, normalize(L.xz)), 0.0), 6.0);
      vec3 lado = vec3(0.060, 0.068, 0.065) + vec3(0.30, 0.31, 0.30) * escov * uLuz;
      lado = mix(lado, vec3(0.83, 0.64, 0.33) * 0.55, smoothstep(0.012, 0.022, yh) * (1.0 - smoothstep(0.024, 0.027, yh)));
      lado *= 1.0 - 0.6 * (1.0 - smoothstep(${(Y_CHAO + 0.004).toFixed(3)}, ${(Y_CHAO + 0.03).toFixed(3)}, yh));
      c = mix(c, lado, uReflA * mix(0.35, 0.75, fres) * exp(-t * 2.5));
    }
  }
  if (fres > 0.08) c += estudio(vec3(-V.x, V.y, -V.z)) * fres * 0.10;
  float dist = length(vW - cameraPosition);
  vec3 neblina = vec3(0.008, 0.014, 0.012);
  c = mix(c, neblina, smoothstep(3.5, 13.0, dist));
  gl_FragColor = vec4(pontilhar(c * uExpo), 1.0);
}`;

// O fundo: ciclorama escuro, um pouco mais claro na linha do chão e do lado da luz.
const F_FUNDO = COMUM + /* glsl */`
varying vec3 vW;
void main(){
  vec3 d = normalize(vW - cameraPosition);
  vec3 L = dirLuz(0.35);
  float brilho = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(L.x, 0.0, L.z))), 0.0), 3.0);
  vec3 neblina = vec3(0.008, 0.014, 0.012);
  vec3 alto = vec3(0.004, 0.007, 0.006);
  vec3 c = mix(neblina, alto, smoothstep(0.0, 0.55, d.y)) + vec3(0.006, 0.011, 0.009) * brilho * (1.0 - smoothstep(0.0, 0.6, d.y)) * uLuz;
  gl_FragColor = vec4(pontilhar(c * uExpo), 1.0);
}`;

// Ouro aplicado com máscara (monograma e nome): faixa de brilho que corre com a luz.
const F_OURO_MASCARA = COMUM + /* glsl */`
uniform sampler2D uMasc; uniform vec3 uCor; uniform float uA;
varying vec2 vUv; varying vec3 vW;
void main(){
  float m = texture2D(uMasc, vUv).a;
  if (m < 0.004) discard;
  float faixaLuz = pow(max(0.0, cos((vW.x * 3.0 - vW.z * 2.0) * 3.0 - uLuzA * 2.2)), 10.0);
  vec3 c = uCor * (0.66 + 0.26 * vUv.y) + vec3(1.0, 0.95, 0.82) * faixaLuz * 0.55 * uLuz;
  gl_FragColor = vec4(pontilhar(c * uExpo), m * uA);
}`;

// Ponteiro facetado: metade clara, metade escura, que se invertem com a luz.
const F_PONTEIRO = COMUM + /* glsl */`
uniform float uAng; uniform float uA;
varying vec3 vP;
void main(){
  float lado = sign(vP.x);
  float k = 0.5 + 0.5 * lado * sin(uLuzA - uAng);
  vec3 ouro = vec3(0.88, 0.72, 0.43);
  vec3 c = ouro * mix(0.48, 1.12, k);
  gl_FragColor = vec4(pontilhar(c * uExpo), uA);
}`;

// Lâmina de vidro (também as barras dos gráficos): retângulo arredondado por SDF, fio de luz na borda,
// corpo tingido (uCor, uCheio), reflexo do estúdio e, no fim, a folha branca (uBranco).
const F_LAMINA = COMUM + /* glsl */`
uniform vec2 uTam; uniform float uRaio; uniform float uA; uniform float uBranco; uniform float uOuro; uniform float uEscuro;
uniform vec3 uCor; uniform float uCheio; uniform float uTopo;
varying vec2 vUv; varying vec3 vW; varying vec3 vN;
float sdRR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  vec2 p = (vUv - 0.5) * uTam;
  float d = sdRR(p, uTam * 0.5, uRaio);
  float aa = fwidth(d) + 1e-6;
  float dentro = 1.0 - smoothstep(-aa, aa, d);
  float fio = 1.0 - smoothstep(0.0, aa * 1.6, abs(d + aa * 1.2));
  float alto = smoothstep(-0.5, 0.5, p.y / uTam.y);
  vec3 V = normalize(cameraPosition - vW);
  vec3 N = normalize(vN); if (dot(N, V) < 0.0) N = -N;
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
  vec3 env = estudio(reflect(-V, N)) * (0.10 + 0.9 * fres);
  vec3 vidro = mix(vec3(0.90, 0.94, 0.91), vec3(0.95, 0.84, 0.60), uOuro);
  float la = clamp(dentro * (0.035 + 0.035 * alto) + fio * (0.22 + 0.50 * alto), 0.0, 1.0);
  float fa = dentro * uEscuro;
  // corpo tingido: mais claro no alto; tampa de luz no topo
  float corpo = dentro * uCheio * (0.62 + 0.30 * alto);
  float tampa = dentro * uTopo * (1.0 - smoothstep(0.0, aa * 2.5 + 0.004, uTam.y * 0.5 - p.y));
  float a = la + fa * (1.0 - la);
  vec3 c = (vidro * la + vec3(0.018, 0.042, 0.032) * fa * (1.0 - la)) / max(a, 1e-4);
  c = mix(c, uCor * (0.78 + 0.35 * alto), corpo / max(corpo + la * 0.35, 1e-4) * step(0.001, corpo));
  a = max(a, corpo);
  c = mix(c, vec3(1.0, 0.97, 0.90), tampa); a = max(a, tampa);
  c += env * dentro * 0.55;
  c = mix(c, vec3(0.980, 0.980, 0.973), uBranco);
  a = mix(a, dentro, uBranco);
  gl_FragColor = vec4(c * mix(uExpo, 1.0, uBranco), a * uA);
}`;

// Sombra de contato: retângulo arredondado escuro e difuso, deitado sob uma peça ou na base de um gráfico.
const F_SOMBRA = /* glsl */`
uniform vec2 uTam; uniform float uA; uniform float uDifuso;
varying vec2 vUv;
float sdRR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  vec2 p = (vUv - 0.5) * uTam;
  float d = sdRR(p, uTam * 0.5 - vec2(uDifuso), 0.01);
  float a = (1.0 - smoothstep(-uDifuso, uDifuso, d)) * uA;
  if (a < 0.003) discard;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}`;

// Pontos (dados, multidão, partículas, matrizes): três formações, com atraso por ponto.
const V_PONTOS = /* glsl */`
attribute vec3 aF1; attribute vec3 aF2; attribute vec3 aCor; attribute float aTam; attribute float aAtraso;
uniform float uFase; uniform float uEscalaPx; uniform float uEspalho;
varying vec3 vCor; varying float vFade;
float ease(float t){ return t * t * (3.0 - 2.0 * t); }
void main(){
  vec3 de, para; float t;
  if (uFase <= 1.0) { de = position; para = aF1; t = uFase; } else { de = aF1; para = aF2; t = uFase - 1.0; }
  float lt = ease(clamp((t - aAtraso * uEspalho) / max(1e-3, 1.0 - uEspalho), 0.0, 1.0));
  vec3 pos = mix(de, para, lt);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.5, aTam * uEscalaPx / -mv.z);
  vCor = aCor; vFade = clamp(3.4 / -mv.z, 0.3, 1.0);
}`;
const F_PONTOS = COMUM + /* glsl */`
uniform float uA; varying vec3 vCor; varying float vFade;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float nucleo = 1.0 - smoothstep(0.14, 0.28, d);
  float halo = (1.0 - smoothstep(0.0, 0.5, d)) * 0.32;
  float a = (nucleo + halo) * uA * vFade;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCor * uExpo, a);
}`;

// Linhas: cada segmento se desenha na sua vez (grafo da análise e linhas dos gráficos).
const V_LINHAS = /* glsl */`
attribute float aT; varying float vT;
void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const F_LINHAS = COMUM + /* glsl */`
uniform float uDesenho; uniform float uA; uniform vec3 uCor; varying float vT;
void main(){ if (vT > uDesenho) discard; gl_FragColor = vec4(uCor * uExpo, uA); }`;

// ------------------------------------------------------------------------------------ utilidades
function imagem(url) { return new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = erro; i.src = url; }); }
function tela(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function mascara(img, w, h) {
  const c = tela(w, h), k = c.getContext("2d");
  k.drawImage(img, 0, 0, w, h); k.globalCompositeOperation = "source-in"; k.fillStyle = "#fff"; k.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.colorSpace = THREE.NoColorSpace; return t;
}
const aleat = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a, b, t) => a + (b - a) * t;
export const direcao = (th, r = 1, y = 0) => new THREE.Vector3(Math.sin(th) * r, y, -Math.cos(th) * r);
export const CORES = { marfim: [0.93, 0.91, 0.85], ouro: [0.86, 0.69, 0.39], verde: [0.20, 0.52, 0.40], grafite: [0.34, 0.38, 0.36], vermelho: [0.72, 0.36, 0.28] };

// Homografia: leva o retângulo (0,0)-(w,h) aos quatro cantos dados (tela), como matrix3d do CSS.
function homografia(w, h, q) {
  const [p0, p1, p2, p3] = q;   // topo-esq, topo-dir, base-dir, base-esq
  const src = [[0, 0], [w, 0], [w, h], [0, h]], dst = [p0, p1, p2, p3];
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = [dst[i].x, dst[i].y];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  for (let c = 0; c < 8; c++) {           // eliminação de Gauss com pivô parcial
    let m = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
    [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]];
    for (let r = c + 1; r < 8; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
  }
  const x = new Array(8);
  for (let r = 7; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < 8; k++) s -= A[r][k] * x[k]; x[r] = s / A[r][r]; }
  const [a, bb, c, d, e, f, g, hh] = x;
  return `matrix3d(${[a, d, 0, g, bb, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1].map((v) => +v.toFixed(8)).join(",")})`;
}

// ------------------------------------------------------------------------------------ o mundo
export class Mundo {
  constructor(canvas, fichas) {
    this.canvas = canvas; this.fichas = fichas;
    const q = new URLSearchParams(location.search);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: q.get("aa") === "1", powerPreference: "high-performance", preserveDrawingBuffer: false, stencil: false });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(W, H, false);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.autoClear = true;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020403);
    this.camera = new THREE.PerspectiveCamera(30, W / H, 0.01, 80);
    this.cam = { x: 0.07, y: 0.075, z: -0.30, tx: 0, ty: 0, tz: -0.545, fov: 24 };
    this.luz = { a: -1.2, i: 1, expo: 1 };
    this.disco = { acesos: 0, top3: 0, pulso: 0, aneis: 1, vidro: 1 };
    this.ponteiro = { ang: 0, a: 0 };
    this.marca = { a: 1 };
    this.multidao = { fase: 0, a: 0 };
    this.dados = { fase: 0, a: 0 };
    this.grafo = { desenho: 0, nos: 0, a: 0 };
    this.poeira = { a: 1 };
    this.chao = { refl: 1 };
    this.laminas = [0, 1, 2, 3, 4, 5].map(() => ({ p: 0, e: 0, branco: 0, a: 0 }));
    this.barras = [];            // estados das barras de vidro dos gráficos (ver definirBarras)
    this.linhasG = [];           // estados das linhas dos gráficos
    this.matriz = { a: 0, n: 0 };
    this.ancoras = []; this.colagens = [];
    this.pronto = false; this.sujo = true; this.ultimo = ""; this.escala = 1; this.tempos = [];
  }

  async carregar() {
    const [mono, nome] = await Promise.all([imagem("midia/marca/monograma.svg"), imagem("midia/marca/nome.svg")]);
    this.U = { uExpo: { value: 1 }, uLuzA: { value: 0 }, uLuz: { value: 1 } };
    this.construirIndices();
    this.construirEstudio();
    this.construirDisco();
    this.construirCaixa();
    this.construirMarca(mono, nome);
    this.construirPonteiro();
    this.construirLaminas();
    this.construirBarras(64);
    this.construirSombras();
    this.construirLinhasG(6);
    this.construirPoeira();
    this.construirMultidao();
    this.construirDados();
    this.construirMatriz();
    const q = new URLSearchParams(location.search);
    const dbg = (q.get("dbg") || "").split(",");     // conferência de custo: refl, chao, fundo, disco, vidro
    this.dbg = { refl: dbg.includes("refl"), vidro: dbg.includes("vidro") };
    if (dbg.includes("chao")) this.objChao.material.visible = false;
    if (dbg.includes("fundo")) this.objFundo.material.visible = false;
    if (dbg.includes("disco")) this.matDisco.visible = false;
    const escondidos = []; this.scene.traverse((o) => { if (!o.visible) { escondidos.push(o); o.visible = true; } });
    this.renderer.compile(this.scene, this.camera);
    if (!q.has("captura") && this.renderer.compileAsync) await this.renderer.compileAsync(this.scene, this.camera);
    this.renderizar(this.camera);
    escondidos.forEach((o) => { o.visible = false; });
    this.escolherEscala(q);
    this.pronto = true;
    const passo = () => { this.quadro(); this.raf = requestAnimationFrame(passo); };
    passo();
  }

  // ---------------------------------------------------------------------------- construção
  construirIndices() {
    this.indices = []; this.setores = [];
    let slot = 0;
    const porFase = FASES_N.map((_, i) => this.fichas.filter((f) => f.fase === i + 1));
    FASES_N.forEach((n, fase) => {
      slot += GAP / 2;
      const ini = Math.floor(slot);
      for (let k = 0; k < n; k++) {
        const ficha = porFase[fase][k];
        this.indices.push({ slot: Math.floor(slot), ang: (Math.floor(slot) + 0.5) * PASSO, fase, k, top3: ficha && ficha.top3 ? ficha.codigo : null });
        slot += 1;
      }
      const fim = Math.floor(slot - 1);
      this.setores.push({ ini: (ini + 0.5) * PASSO, fim: (fim + 0.5) * PASSO, centro: ((ini + fim) / 2 + 0.5) * PASSO });
      slot += GAP / 2;
    });
    this.top3 = {};
    this.indices.forEach((ix) => { if (ix.top3) this.top3[ix.top3] = ix; });
    this.idxDados = new Uint8Array(SLOTS * 4);
    this.idxTex = new THREE.DataTexture(this.idxDados, SLOTS, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
    this.idxTex.minFilter = this.idxTex.magFilter = THREE.NearestFilter; this.idxTex.generateMipmaps = false;
    this.atualizarIndices();
  }
  atualizarIndices() {
    const D = this.idxDados, s = this.disco;
    D.fill(0);
    this.indices.forEach((ix, k) => {
      const o = ix.slot * 4;
      const brilho = Math.max(0, Math.min(1, s.acesos - k));
      const ouro = ix.top3 ? s.top3 : 0;
      D[o] = Math.round(255 * Math.min(1, brilho + ouro * 0.4 + (ix.top3 ? s.pulso * 0.6 : 0)));
      D[o + 1] = Math.round(255 * ouro); D[o + 2] = Math.round(255 * Math.min(1, ouro + (ix.top3 ? s.pulso * 0.5 : 0))); D[o + 3] = 255;
    });
    this.idxTex.needsUpdate = true;
  }

  // O chão, o fundo e o passe de reflexo.
  construirEstudio() {
    const U = this.U;
    this.matChao = new THREE.ShaderMaterial({ vertexShader: V_MUNDO, fragmentShader: F_CHAO, uniforms: { ...U, uReflA: { value: 1 } } });
    const gc = new THREE.CircleGeometry(40, 96); gc.rotateX(-Math.PI / 2);
    this.objChao = new THREE.Mesh(gc, this.matChao); this.objChao.position.y = Y_CHAO; this.objChao.renderOrder = 5; this.scene.add(this.objChao);
    const gf = new THREE.SphereGeometry(45, 48, 24);
    // o fundo vai por último entre os opacos: o teste de profundidade descarta o que o chão e o instrumento cobrem
    this.objFundo = new THREE.Mesh(gf, new THREE.ShaderMaterial({ vertexShader: V_MUNDO, fragmentShader: F_FUNDO, uniforms: { ...U }, side: THREE.BackSide, depthWrite: false }));
    this.objFundo.renderOrder = 6; this.scene.add(this.objFundo);
  }

  construirDisco() {
    const U = this.U;
    const geo = new THREE.CircleGeometry(1.0, 256); geo.rotateX(-Math.PI / 2);
    this.matDisco = new THREE.ShaderMaterial({ vertexShader: V_MUNDO, fragmentShader: F_DISCO, uniforms: { ...U, uIdx: { value: this.idxTex }, uAneis: { value: 1 }, uVidro: { value: 1 } } });
    this.disc = new THREE.Mesh(geo, this.matDisco); this.scene.add(this.disc);
  }

  // A caixa: perfil girado (boca, chanfro dourado, topo polido, lateral, base).
  construirCaixa() {
    const perfil = [[0.994, -0.004], [1.000, 0.003], [1.010, 0.011], [1.022, 0.021], [1.032, 0.026], [1.052, 0.0275], [1.072, 0.026], [1.086, 0.020], [1.094, 0.008], [R_CAIXA, -0.004],
      [R_CAIXA, -0.030], [R_CAIXA, -0.060], [R_CAIXA, -0.084], [1.090, -0.097], [1.078, Y_CHAO + 0.001], [1.0, Y_CHAO + 0.001]];
    const pts = perfil.map(([r, y]) => new THREE.Vector2(r, y));
    const geo = new THREE.LatheGeometry(pts, 256);
    // v ao longo do perfil proporcional ao comprimento (para o shader separar chanfro, topo e lado)
    const comp = [0]; for (let i = 1; i < pts.length; i++) comp.push(comp[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const total = comp[comp.length - 1];
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) { const k = i % pts.length; uv.setY(i, comp[k] / total); }
    this.matCaixa = new THREE.ShaderMaterial({ vertexShader: V_MUNDO, fragmentShader: F_CAIXA, uniforms: { ...this.U }, side: THREE.DoubleSide });
    this.objCaixa = new THREE.Mesh(geo, this.matCaixa); this.scene.add(this.objCaixa);
  }

  construirMarca(mono, nome) {
    const U = this.U;
    const mat = (tex, cor) => new THREE.ShaderMaterial({ vertexShader: V_MUNDO, fragmentShader: F_OURO_MASCARA, transparent: true, depthWrite: false, uniforms: { ...U, uMasc: { value: tex }, uCor: { value: new THREE.Color(...cor) }, uA: { value: 1 } } });
    const gm = new THREE.PlaneGeometry(0.15, 0.15); gm.rotateX(-Math.PI / 2);
    this.matMono = mat(mascara(mono, 1024, 1024), [0.86, 0.70, 0.40]);
    const m = new THREE.Mesh(gm, this.matMono); m.position.set(0, 0.0008, -0.545); m.renderOrder = 2; this.scene.add(m);
    const ln = 0.30, gn = new THREE.PlaneGeometry(ln, ln * 64 / 517); gn.rotateX(-Math.PI / 2);
    this.matNome = mat(mascara(nome, 2048, 254), [0.90, 0.88, 0.82]);
    const n = new THREE.Mesh(gn, this.matNome); n.position.set(0, 0.0008, -0.43); n.renderOrder = 2; this.scene.add(n);
    this.posMono = new THREE.Vector3(0, 0, -0.545);
  }

  construirPonteiro() {
    const s = new THREE.Shape();
    s.moveTo(-0.0125, 0); s.lineTo(0, 0.68); s.lineTo(0.0125, 0); s.lineTo(0.006, -0.12); s.lineTo(-0.006, -0.12); s.closePath();
    const geo = new THREE.ShapeGeometry(s); geo.rotateX(-Math.PI / 2);
    const cubo = new THREE.CircleGeometry(0.024, 64); cubo.rotateX(-Math.PI / 2); cubo.translate(0, 0.0005, 0);
    this.matPonteiro = new THREE.ShaderMaterial({ vertexShader: V_MUNDO, fragmentShader: F_PONTEIRO, transparent: true, depthWrite: false, uniforms: { ...this.U, uAng: { value: 0 }, uA: { value: 0 } } });
    this.objPonteiro = new THREE.Group();
    this.objPonteiro.add(new THREE.Mesh(geo, this.matPonteiro), new THREE.Mesh(cubo, this.matPonteiro));
    this.objPonteiro.position.y = 0.006; this.objPonteiro.renderOrder = 3; this.scene.add(this.objPonteiro);
  }

  matLamina(extra = {}) {
    return new THREE.ShaderMaterial({ vertexShader: V_MUNDO, fragmentShader: F_LAMINA, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { ...this.U, uTam: { value: new THREE.Vector2(1, 1) }, uRaio: { value: 0.02 }, uA: { value: 0 }, uBranco: { value: 0 }, uOuro: { value: 0 }, uEscuro: { value: 0 },
        uCor: { value: new THREE.Color(0.9, 0.9, 0.85) }, uCheio: { value: 0 }, uTopo: { value: 0 }, ...extra } });
  }

  construirLaminas() {
    this.objLaminas = this.laminas.map((_, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.matLamina()); m.renderOrder = 30 + i; m.visible = false; this.scene.add(m);
      return m;
    });
    this.poses = this.laminas.map(() => ({ de: null, para: null, raio: 0.02 }));
  }

  // Barras de vidro: um conjunto fixo de malhas, reaproveitado por gráfico.
  construirBarras(n) {
    this.objBarras = [];
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.matLamina({ uCheio: { value: 0.8 }, uTopo: { value: 1 } }));
      m.renderOrder = 12 + (i % 8); m.visible = false; this.scene.add(m); this.objBarras.push(m);
    }
  }

  construirSombras() {
    const mk = () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ vertexShader: V_MUNDO, fragmentShader: F_SOMBRA, transparent: true, depthWrite: false,
      uniforms: { uTam: { value: new THREE.Vector2(1, 1) }, uA: { value: 0 }, uDifuso: { value: 0.02 } } })); m.renderOrder = 1; m.visible = false; this.scene.add(m); return m; };
    this.objSombras = this.laminas.map(mk);          // uma por lâmina deitada
    this.objSombraGraf = mk();                       // faixa sob a base de um gráfico
  }

  construirLinhasG(n) {
    this.objLinhasG = [];
    for (let i = 0; i < n; i++) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      g.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(2), 1));
      const l = new THREE.LineSegments(g, new THREE.ShaderMaterial({ vertexShader: V_LINHAS, fragmentShader: F_LINHAS, transparent: true, depthWrite: false,
        uniforms: { ...this.U, uDesenho: { value: 0 }, uA: { value: 0 }, uCor: { value: new THREE.Color(0.86, 0.69, 0.39) } } }));
      l.frustumCulled = false; l.renderOrder = 25; l.visible = false; this.scene.add(l); this.objLinhasG.push(l);
    }
  }

  pontos(n, f0, f1, f2, cor, tam, atraso) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(f0, 3));
    g.setAttribute("aF1", new THREE.BufferAttribute(f1, 3));
    g.setAttribute("aF2", new THREE.BufferAttribute(f2, 3));
    g.setAttribute("aCor", new THREE.BufferAttribute(cor, 3));
    g.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
    g.setAttribute("aAtraso", new THREE.BufferAttribute(atraso, 1));
    const mat = new THREE.ShaderMaterial({ vertexShader: V_PONTOS, fragmentShader: F_PONTOS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { ...this.U, uFase: { value: 0 }, uEscalaPx: { value: 500 }, uEspalho: { value: 0.5 }, uA: { value: 0 } } });
    const p = new THREE.Points(g, mat); p.frustumCulled = false; p.renderOrder = 20; this.scene.add(p);
    return p;
  }

  // Partículas finas só dentro do cone de luz (sem céu estrelado).
  construirPoeira() {
    const n = 140, f = new Float32Array(n * 3), cor = new Float32Array(n * 3), tam = new Float32Array(n), at = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = 0.4 + aleat(i) * 1.6, th = aleat(i + 0.3) * TAU;
      f.set([Math.sin(th) * r, 0.15 + aleat(i + 0.7) * 1.6, -Math.cos(th) * r], i * 3);
      cor.set([0.42, 0.40, 0.34], i * 3);
      tam[i] = 0.0035 + aleat(i + 0.11) * 0.004;
    }
    this.objPoeira = this.pontos(n, f, f, f, cor, tam, at);
  }

  construirMultidao() {
    const n = 2210, f0 = new Float32Array(n * 3), f1 = new Float32Array(n * 3), cor = new Float32Array(n * 3), tam = new Float32Array(n), at = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const th = aleat(i * 1.37) * TAU, r = 0.10 + Math.sqrt(aleat(i * 2.11)) * 0.62;
      f0.set([Math.sin(th) * r, 0.012, -Math.cos(th) * r], i * 3);
      const r2 = 1.5 + aleat(i * 3.7) * 3.2;
      f1.set([Math.sin(th) * r2, 0.02 + aleat(i * 5.3) * 0.5, -Math.cos(th) * r2], i * 3);
      cor.set([0.93, 0.91, 0.85], i * 3);
      tam[i] = 0.0055 + aleat(i * 7.1) * 0.003;
      at[i] = aleat(i * 9.3);
    }
    this.objMultidao = this.pontos(n, f0, f1, f1, cor, tam, at);
  }

  construirDados() {
    const n = 420;
    this.nDados = n;
    const z = () => new Float32Array(n * 3);
    this.objDados = this.pontos(n, z(), z(), z(), z(), new Float32Array(n).fill(0.010), new Float32Array(n).map((_, i) => aleat(i * 4.7)));
    this.objDados.material.uniforms.uEspalho.value = 0.55;
    const gl = new THREE.BufferGeometry();
    gl.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    gl.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(2), 1));
    this.objArestas = new THREE.LineSegments(gl, new THREE.ShaderMaterial({ vertexShader: V_LINHAS, fragmentShader: F_LINHAS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { ...this.U, uDesenho: { value: 0 }, uA: { value: 0 }, uCor: { value: new THREE.Color(0.80, 0.64, 0.36) } } }));
    this.objArestas.frustumCulled = false; this.objArestas.renderOrder = 19; this.scene.add(this.objArestas);
    this.objNos = this.pontos(1, new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(1), new Float32Array(1));
  }

  // Matriz de índices (quem faz o quê, indicador × documento): pontos numa grade vertical.
  construirMatriz() {
    this.objMatriz = this.pontos(1, new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(1), new Float32Array(1));
    this.objMatriz.material.uniforms.uEspalho.value = 0.7;
  }

  // Monta o grafo de um projeto a partir dos nós da conta (conteudo.js): posição 3D de cada nó sobre o disco.
  prepararGrafo(parede, poseLamina) {
    const nos = parede.nos, lig = parede.lig;
    const P = nos.map((no, i) => new THREE.Vector3((no.x - 1000) / 1920 * 3.1, 1.30 - (no.y - 240) / 420 * 0.95, -0.15 + (aleat(i * 3.3) - 0.5) * 0.55 + (no.ouro ? 0.18 : 0)));
    this.grafoPos = P;
    const pos = new Float32Array(lig.length * 6), t = new Float32Array(lig.length * 2);
    lig.forEach(([a, b], e) => { pos.set([P[a].x, P[a].y, P[a].z, P[b].x, P[b].y, P[b].z], e * 6); t[e * 2] = e / lig.length; t[e * 2 + 1] = (e + 1) / lig.length; });
    const ga = this.objArestas.geometry;
    ga.setAttribute("position", new THREE.BufferAttribute(pos, 3)); ga.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    const nn = nos.length, gn = this.objNos.geometry;
    const f = new Float32Array(nn * 3), cor = new Float32Array(nn * 3), tam = new Float32Array(nn), at = new Float32Array(nn);
    P.forEach((v, i) => { f.set([v.x, v.y, v.z], i * 3); cor.set(nos[i].ouro ? [0.95, 0.78, 0.45] : [0.72, 0.76, 0.72], i * 3); tam[i] = nos[i].ouro ? 0.05 : 0.03; });
    ["position", "aF1", "aF2"].forEach((k) => gn.setAttribute(k, new THREE.BufferAttribute(f.slice(), 3)));
    gn.setAttribute("aCor", new THREE.BufferAttribute(cor, 3)); gn.setAttribute("aTam", new THREE.BufferAttribute(tam, 1)); gn.setAttribute("aAtraso", new THREE.BufferAttribute(at, 1));
    const n = this.nDados, g = this.objDados.geometry;
    const f0 = g.attributes.position.array, f1 = g.attributes.aF1.array, f2 = g.attributes.aF2.array, cr = g.attributes.aCor.array;
    const L = poseLamina, dx = new THREE.Vector3(1, 0, 0).applyQuaternion(L.quat), dy = new THREE.Vector3(0, 1, 0).applyQuaternion(L.quat);
    const cols = 28, linhas = Math.ceil(n / cols);
    const pesos = nos.map((no) => (no.ouro ? 2.2 : 1));
    const soma = pesos.reduce((s, x) => s + x, 0);
    let acum = 0; const corte = pesos.map((p) => (acum += p / soma));
    for (let i = 0; i < n; i++) {
      const cx = (i % cols) / (cols - 1) - 0.5, cy = 0.5 - Math.floor(i / cols) / (linhas - 1);
      const v0 = L.pos.clone().addScaledVector(dx, cx * L.w * 0.86).addScaledVector(dy, cy * L.h * 0.80);
      f0.set([v0.x, v0.y, v0.z], i * 3);
      f1.set([(aleat(i * 1.9) - 0.5) * 3.4, 0.25 + aleat(i * 2.3) * 1.4, (aleat(i * 3.1) - 0.5) * 1.6], i * 3);
      const u = aleat(i * 5.9), no = Math.max(0, corte.findIndex((c) => u <= c));
      const raio = nos[no].ouro ? 0.024 : 0.017, th = aleat(i * 6.7) * TAU, ph = aleat(i * 8.3) * Math.PI;
      f2.set([P[no].x + Math.cos(th) * Math.sin(ph) * raio, P[no].y + Math.cos(ph) * raio, P[no].z + Math.sin(th) * Math.sin(ph) * raio], i * 3);
      cr.set(nos[no].ouro ? [0.93, 0.76, 0.44] : [0.78, 0.82, 0.78], i * 3);
    }
    ["position", "aF1", "aF2", "aCor"].forEach((k) => { g.attributes[k].needsUpdate = true; });
    this.sujo = true;
    return P;
  }

  // ---------------------------------------------------------------------------- gráficos no espaço
  // Um gráfico é um plano vertical: origem (base, centro) no mundo, giro em torno do eixo e escala
  // (unidades do gráfico → mundo). Coordenadas do gráfico: x para a direita, y para cima.
  grafico(o = {}) {
    const giro = o.giro ?? 0, esc = o.escala ?? 1;
    const G = { origem: (o.origem || new THREE.Vector3(0, 0, 0)).clone(), giro, esc,
      dir: new THREE.Vector3(Math.cos(giro), 0, -Math.sin(giro)), normal: new THREE.Vector3(Math.sin(giro), 0, Math.cos(giro)), quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), giro) };
    G.ponto = (x, y, z = 0, alvo) => { const v = (alvo || new THREE.Vector3()).copy(G.origem).addScaledVector(G.dir, x * esc).addScaledVector(G.normal, z * esc); v.y += y * esc; return v; };
    return G;
  }
  // Barras: cada spec {x, y0, h, w, cor, cheio, ouro, z}. Devolve os estados animáveis {a, k} (k = crescimento 0..1).
  definirBarras(G, specs) {
    this.barrasG = G;
    if (specs.length > this.objBarras.length) console.warn(`barras: ${specs.length} pedidas, ${this.objBarras.length} disponíveis`);
    this.barras = specs.slice(0, this.objBarras.length).map((s, i) => ({ ...s, a: 0, k: 0, i }));
    this.objBarras.forEach((m, i) => {
      const s = this.barras[i];
      m.visible = false;
      if (!s) return;
      const u = m.material.uniforms;
      u.uCor.value.setRGB(...(CORES[s.cor] || s.cor || CORES.marfim));
      u.uCheio.value = s.cheio ?? 0.78; u.uTopo.value = s.topo ?? 1; u.uOuro.value = s.ouro ?? 0; u.uEscuro.value = s.escuro ?? 0; u.uBranco.value = 0;
      m.renderOrder = 12 + (s.z ? Math.round(s.z * 10) : 0);
    });
    this.sujo = true;
    return this.barras;
  }
  limparBarras() { this.barras = []; this.objBarras.forEach((m) => { m.visible = false; }); this.sujo = true; }
  // Linhas: pontos em coordenadas do gráfico; {pts:[[x,y],...], cor, tracejada}
  definirLinhas(G, specs) {
    this.linhasG = specs.map((s, i) => {
      const l = this.objLinhasG[i], pts = s.pts.map(([x, y, z]) => G.ponto(x, y, z ?? 0.004));
      const segs = []; for (let k = 0; k < pts.length - 1; k++) {
        if (s.tracejada) { const n = Math.max(1, Math.round(pts[k].distanceTo(pts[k + 1]) / (0.018 * G.esc))); for (let j = 0; j < n; j += 2) segs.push([pts[k].clone().lerp(pts[k + 1], j / n), pts[k].clone().lerp(pts[k + 1], Math.min(1, (j + 1) / n))]); }
        else segs.push([pts[k], pts[k + 1]]);
      }
      const pos = new Float32Array(segs.length * 6), t = new Float32Array(segs.length * 2);
      segs.forEach(([a, b], e) => { pos.set([a.x, a.y, a.z, b.x, b.y, b.z], e * 6); t[e * 2] = e / segs.length; t[e * 2 + 1] = (e + 1) / segs.length; });
      l.geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3)); l.geometry.setAttribute("aT", new THREE.BufferAttribute(t, 1));
      l.material.uniforms.uCor.value.setRGB(...(CORES[s.cor] || s.cor || CORES.ouro));
      return { desenho: 0, a: 0, i };
    });
    this.objLinhasG.forEach((l, i) => { if (!this.linhasG[i]) l.visible = false; });
    this.sujo = true;
    return this.linhasG;
  }
  // Matriz de pontos: células {x, y, cor, tam} em coordenadas do gráfico; entram em ordem (estado matriz.n 0..1).
  definirMatriz(G, celulas) {
    const n = celulas.length, g = this.objMatriz.geometry;
    const f0 = new Float32Array(n * 3), f1 = new Float32Array(n * 3), cor = new Float32Array(n * 3), tam = new Float32Array(n), at = new Float32Array(n);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const c = celulas[i], o = i * 3;
      G.ponto(c.x, c.y, 0.01, tmp); f1[o] = tmp.x; f1[o + 1] = tmp.y; f1[o + 2] = tmp.z;
      G.ponto(c.x, c.y - 0.05, 0.25, tmp); f0[o] = tmp.x; f0[o + 1] = tmp.y; f0[o + 2] = tmp.z;
      const k = CORES[c.cor] || c.cor || CORES.marfim; cor[o] = k[0]; cor[o + 1] = k[1]; cor[o + 2] = k[2];
      tam[i] = c.tam ?? 0.02; at[i] = i / n;
    }
    g.setAttribute("position", new THREE.BufferAttribute(f0, 3)); g.setAttribute("aF1", new THREE.BufferAttribute(f1, 3)); g.setAttribute("aF2", new THREE.BufferAttribute(f1.slice(), 3));
    g.setAttribute("aCor", new THREE.BufferAttribute(cor, 3)); g.setAttribute("aTam", new THREE.BufferAttribute(tam, 1)); g.setAttribute("aAtraso", new THREE.BufferAttribute(at, 1));
    this.matriz = { a: 0, n: 0 };
    this.sujo = true;
    return this.matriz;
  }
  // Plano de câmera de frente para um gráfico: centro (x, y do gráfico), distância e lente.
  planoGrafico(G, o = {}) {
    const c = G.ponto(o.x ?? 0, o.y ?? 0.4, 0);
    const d = o.dist ?? 3.0, alt = o.alt ?? 0, lado = o.lado ?? 0;
    const pos = c.clone().addScaledVector(G.normal, d).addScaledVector(G.dir, lado).add(new THREE.Vector3(0, alt, 0));
    return { x: pos.x, y: pos.y, z: pos.z, tx: c.x, ty: c.y, tz: c.z, fov: o.fov ?? 20 };
  }

  // ---------------------------------------------------------------------------- planos de câmera
  plano(nome, extra = {}) {
    const P = {
      macro: { x: 0.07, y: 0.075, z: -0.30, tx: 0, ty: 0, tz: -0.545, fov: 24 },
      rasante: { x: 0, y: 0.26, z: 2.05, tx: 0, ty: -0.02, tz: -0.18, fov: 30 },
      inteiro: { x: 0, y: 2.7, z: 3.0, tx: 0, ty: -0.42, tz: 0.25, fov: 33 },
      topo: { x: 0, y: 4.3, z: 0.012, tx: 0, ty: 0, tz: 0, fov: 34 },
      topoDir: { x: -0.66, y: 4.5, z: 0.012, tx: -0.66, ty: 0, tz: 0, fov: 34 },
      relogio: { x: -1.25, y: 3.2, z: 1.9, tx: -1.05, ty: 0, tz: 0.1, fov: 34 },
      rasanteEsq: { x: -0.55, y: 0.6, z: 2.35, tx: -1.4, ty: 0.05, tz: 0.1, fov: 32 },
      alto: { x: 0.2, y: 3.0, z: 2.9, tx: 0, ty: 0, tz: 0, fov: 30 },
      numero: { x: 0, y: 1.1, z: 2.9, tx: 0, ty: -0.2, tz: -0.4, fov: 30 },
      top3: { x: 0, y: 1.25, z: 2.55, tx: 0, ty: 0.30, tz: 0, fov: 34 },
      analise: { x: 0.0, y: 0.95, z: 3.05, tx: 0, ty: 0.72, tz: -0.1, fov: 36 },
      socios: { x: 0.9, y: 0.26, z: 1.65, tx: -0.2, ty: 0.02, tz: -0.3, fov: 30 },
      oferta: { x: -1.1, y: 2.5, z: 1.9, tx: -1.05, ty: -0.05, tz: 0.15, fov: 32 },
      estudio: { x: 2.6, y: 1.0, z: 3.6, tx: 0.2, ty: 0.05, tz: 0, fov: 26 },
    };
    if (nome === "setor") {
      const s = this.setores[Math.max(0, Math.min(9, extra.i ?? 0))];
      const c = direcao(s.centro, 1.72, 0.42), a = direcao(s.centro, 0.72, 0);
      return { x: c.x, y: c.y, z: c.z, tx: a.x, ty: a.y, tz: a.z, fov: 30 };
    }
    return { ...P[nome], ...(extra.cam || {}) };
  }

  camDe(c, cam = this.camera) {
    cam.position.set(c.x, c.y, c.z); cam.fov = c.fov; cam.aspect = W / H; cam.near = 0.01; cam.far = 80; cam.updateProjectionMatrix();
    cam.up.set(0, 1, 0); cam.lookAt(c.tx, c.ty, c.tz); cam.updateMatrixWorld(true);
    return cam;
  }
  rasc() { return this.cRasc || (this.cRasc = new THREE.PerspectiveCamera()); }
  naTela(v, nome, extra) {
    const cam = nome ? this.camDe(typeof nome === "string" ? this.plano(nome, extra) : nome, this.rasc()) : this.camera;
    const p = v.clone().project(cam);
    return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, atras: p.z > 1 };
  }
  poseRet(ret, nome, dist = 1.2, extra) { return this.poseRetCam(ret, this.camDe(typeof nome === "string" ? this.plano(nome, extra) : nome, this.rasc()), dist); }
  poseRetCam(ret, cam, dist) {
    const th = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2), hh = dist * th, hw = hh * (W / H);
    const cx = ret.left + ret.width / 2, cy = ret.top + ret.height / 2;
    const nx = cx / W * 2 - 1, ny = 1 - cy / H * 2;
    const f = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion), r = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), u = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    const pos = cam.position.clone().addScaledVector(f, dist).addScaledVector(r, nx * hw).addScaledVector(u, ny * hh);
    return { pos, quat: cam.quaternion.clone(), w: ret.width / W * 2 * hw, h: ret.height / H * 2 * hh };
  }
  poseDeitada(v, w = 0.03, h = 0.03, giro = 0) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, -giro, 0, "YXZ"));
    return { pos: v.clone().setY(v.y || 0.004), quat: q, w, h, deitada: true };
  }
  // Pose de uma folha em pé no espaço: centro, largura e altura em unidades do mundo, giro em torno do eixo, inclinação para trás.
  poseEmPe(centro, w, h, giro = 0, incl = 0) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-incl, giro, 0, "YXZ"));
    return { pos: centro.clone(), quat: q, w, h };
  }
  definirLamina(i, de, para, opc = {}) {
    this.poses[i] = { de, para, raio: opc.raio ?? 0.02 };
    const u = this.objLaminas[i].material.uniforms;
    u.uOuro.value = opc.ouro ?? 0; u.uEscuro.value = opc.escuro ?? 0; u.uCheio.value = 0; u.uTopo.value = 0;
    this.sujo = true;
  }

  v3(x, y, z) { return new THREE.Vector3(x, y, z); }
  // pixels do palco por unidade do mundo, a uma distância e lente dadas
  pxPorUnidade(dist, fov) { return H / (2 * dist * Math.tan(THREE.MathUtils.degToRad(fov) / 2)); }
  // Plano de câmera de frente para uma lâmina (pose), com a folha ocupando `ocupa` da altura da tela.
  planoFrente(pose, ocupa = 0.72, fov = 26, dx = 0, dy = 0) {
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(pose.quat), up = new THREE.Vector3(0, 1, 0).applyQuaternion(pose.quat);
    const dist = pose.h / ocupa / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
    const alvo = pose.pos.clone().addScaledVector(up, dy);
    const r = new THREE.Vector3().crossVectors(up, n).normalize();
    alvo.addScaledVector(r, dx);
    const c = alvo.clone().addScaledVector(n, dist).addScaledVector(up, -0.004 * dist);   // evita a vista exatamente vertical (degenerada)
    return { x: c.x, y: c.y, z: c.z, tx: alvo.x, ty: alvo.y, tz: alvo.z, fov };
  }
  posIndice(codigo, r = (R0 + R1) / 2, y = 0) { const ix = this.top3[codigo]; return direcao(ix.ang, r, y); }
  posSetor(i, r = 1.1, y = 0) { return direcao(this.setores[i].centro, r, y); }
  angSetor(i) { return this.setores[i].centro; }

  // ---------------------------------------------------------------------------- animação (GSAP)
  irPara(tl, nome, dur, pos, extra = {}, ease = "power2.inOut") {
    const alvo = typeof nome === "string" ? this.plano(nome, extra) : nome;
    if (dur === 0) tl.set(this.cam, alvo, pos); else tl.to(this.cam, { ...alvo, duration: dur, ease }, pos);
    return tl;
  }
  orbitar(tl, o, dur, pos, ease = "sine.inOut") {
    const st = { th: o.de };
    const aplicar = () => { const c = direcao(st.th, o.raio, o.alt), a = direcao(st.th + (o.avanço ?? 0), o.alvoR ?? 0, o.alvoY ?? 0); Object.assign(this.cam, { x: c.x, y: c.y, z: c.z, tx: a.x, ty: a.y, tz: a.z, fov: o.fov ?? 30 }); };
    tl.fromTo(st, { th: o.de }, { th: o.ate, duration: dur, ease, onUpdate: aplicar, onStart: aplicar, immediateRender: false }, pos);
    return tl;
  }
  luzPara(tl, v, dur, pos, ease = "sine.inOut") { tl.to(this.luz, { ...v, duration: dur, ease }, pos); return tl; }

  base(tl, o = {}) {
    tl.set(this.luz, { a: -0.6, i: 1, expo: 1, ...o.luz }, 0);
    tl.set(this.disco, { acesos: 208, top3: 0, pulso: 0, aneis: 1, vidro: 1, ...o.disco }, 0);
    tl.set(this.ponteiro, { ang: 0, a: 0, ...o.ponteiro }, 0);
    tl.set(this.marca, { a: 1, ...o.marca }, 0);
    tl.set(this.multidao, { fase: 0, a: 0 }, 0);
    tl.set(this.dados, { fase: 0, a: 0 }, 0);
    tl.set(this.grafo, { desenho: 0, nos: 0, a: 0 }, 0);
    tl.set(this.poeira, { a: 1, ...o.poeira }, 0);
    tl.set(this.chao, { refl: 1, ...o.chao }, 0);
    this.laminas.forEach((l) => tl.set(l, { p: 0, e: 0, branco: 0, a: 0 }, 0));
    this.limparBarras(); this.linhasG = []; this.objLinhasG.forEach((l) => { l.visible = false; });
    tl.set(this.matriz, { a: 0, n: 0 }, 0);
    if (o.cam) this.irPara(tl, o.cam, 0, 0, o.camExtra);
    this.limparAncoras(); this.colagens = [];
  }

  // ---------------------------------------------------------------------------- HTML preso ao mundo
  ancorar(el, v, dx = 0, dy = 0) { const a = { el, v: v.clone(), dx, dy }; this.ancoras.push(a); el.style.left = "0px"; el.style.top = "0px"; this.sujo = true; return a; }
  limparAncoras() { this.ancoras = []; this.sujo = true; }
  posicionarAncora(a) {
    if (!a.m) a.m = a.el.firstElementChild;
    if (a.m && a.m.style.opacity === "0" && a.ult) return;          // invisível: não recalcula (economiza estilo e layout)
    const p = (this._pa || (this._pa = new THREE.Vector3())).copy(a.v).project(this.camera);
    if (p.z > 1) { a.el.style.visibility = "hidden"; return; }
    a.el.style.visibility = "";
    const x = ((p.x + 1) / 2 * W + a.dx).toFixed(1), y = ((1 - p.y) / 2 * H + a.dy).toFixed(1);
    const t = `translate(${x}px, ${y}px)`;
    if (a.ult !== t) { a.el.style.transform = t; a.ult = t; }
  }
  // Cola um elemento HTML (tamanho w×h px) a uma lâmina: o texto acompanha a folha no espaço.
  colar(el, lamina, w, h) { const c = { el, lamina, w, h, ult: "" }; el.style.transformOrigin = "0 0"; el.style.left = "0px"; el.style.top = "0px"; this.colagens.push(c); this.sujo = true; return c; }
  posicionarColagem(c) {
    const m = this.objLaminas[c.lamina];
    if (!m.visible) { if (c.el.style.visibility !== "hidden") c.el.style.visibility = "hidden"; return; }
    const C4 = this._c4 || (this._c4 = [[-0.5, 0.5], [0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]].map(() => new THREE.Vector3()));
    const q = C4.map((v, k) => v.set(k === 0 || k === 3 ? -0.5 : 0.5, k < 2 ? 0.5 : -0.5, 0).applyMatrix4(m.matrixWorld).project(this.camera));
    if (q.some((p) => p.z > 1)) { c.el.style.visibility = "hidden"; return; }
    c.el.style.visibility = "";
    const t = homografia(c.w, c.h, q.map((p) => ({ x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H })));
    if (t !== c.ult) { c.el.style.transform = t; c.ult = t; }
  }

  // ---------------------------------------------------------------------------- por quadro
  quadro() {
    if (!this.pronto) return;
    const c = this.cam, L = this.luz, d = this.disco;
    // assinatura do estado (números, sem texto e sem alocar): se nada mudou, não desenha
    const N = this._nums || (this._nums = []); N.length = 0;
    N.push(c.x, c.y, c.z, c.tx, c.ty, c.tz, c.fov, L.a, L.i, L.expo, d.acesos, d.top3, d.pulso, d.aneis, d.vidro, this.ponteiro.ang, this.ponteiro.a, this.marca.a,
      this.multidao.fase, this.multidao.a, this.dados.fase, this.dados.a, this.grafo.desenho, this.grafo.nos, this.grafo.a, this.poeira.a, this.chao.refl, this.matriz.a, this.matriz.n);
    for (const l of this.laminas) N.push(l.p, l.e, l.branco, l.a);
    for (const b of this.barras) N.push(b.a, b.k, b.h, b.y0, b.x);
    for (const l of this.linhasG) N.push(l.a, l.desenho);
    const A = this._ant || (this._ant = []);
    let igual = A.length === N.length;
    for (let i = 0; igual && i < N.length; i++) if (Math.abs(A[i] - N[i]) > 1e-5) igual = false;
    if (igual && !this.sujo) {
      this.tempos.length = 0; this.tAnt = 0;
      if (this.escalaPendente && this.escalaPendente !== this.escala) this.aplicarEscala(this.escalaPendente);
      return;
    }
    this._ant = N; this._nums = A;
    if (d.acesos !== this._ia || d.top3 !== this._it || d.pulso !== this._ip) { this.atualizarIndices(); this._ia = d.acesos; this._it = d.top3; this._ip = d.pulso; }
    this.sujo = false;
    const T = this._tmp || (this._tmp = { v1: new THREE.Vector3(), v2: new THREE.Vector3(), v3: new THREE.Vector3(), q1: new THREE.Quaternion(), q2: new THREE.Quaternion(), eixoY: new THREE.Vector3(0, 1, 0) });
    const cam = this.camDe(c);
    this.U.uExpo.value = L.expo; this.U.uLuzA.value = L.a; this.U.uLuz.value = L.i;
    this.matDisco.uniforms.uAneis.value = d.aneis; this.matDisco.uniforms.uVidro.value = this.dbg.vidro ? 0 : d.vidro;
    this.matMono.uniforms.uA.value = this.marca.a; this.matNome.uniforms.uA.value = this.marca.a;
    this.objPonteiro.rotation.y = -this.ponteiro.ang; this.objPonteiro.visible = this.ponteiro.a > 0.001;
    this.matPonteiro.uniforms.uAng.value = this.ponteiro.ang; this.matPonteiro.uniforms.uA.value = this.ponteiro.a;
    const escalaPx = (H * this.escala) / (2 * Math.tan(THREE.MathUtils.degToRad(c.fov) / 2));
    const pts = (o, fase, a) => { const u = o.material.uniforms; u.uFase.value = fase; u.uA.value = a; u.uEscalaPx.value = escalaPx; o.visible = a > 0.001; };
    pts(this.objPoeira, 0, 0.35 * this.poeira.a);
    pts(this.objMultidao, this.multidao.fase, this.multidao.a);
    pts(this.objDados, this.dados.fase, this.dados.a);
    pts(this.objNos, 0, this.grafo.a);
    pts(this.objMatriz, 1, this.matriz.a);
    const nm = this.objMatriz.geometry.attributes.position.count;
    this.objMatriz.geometry.setDrawRange(0, Math.round(Math.min(1, this.matriz.n) * nm));
    const nn = this.objNos.geometry.attributes.position.count;
    this.objNos.geometry.setDrawRange(0, Math.round(Math.min(1, this.grafo.nos) * nn));
    const ua = this.objArestas.material.uniforms; ua.uDesenho.value = this.grafo.desenho; ua.uA.value = this.grafo.a * 0.7; this.objArestas.visible = this.grafo.a > 0.001;
    // lâminas: pose = de → para (p) → tela cheia diante da câmera (e)
    this.laminas.forEach((l, i) => {
      const m = this.objLaminas[i], P = this.poses[i];
      m.visible = l.a > 0.001 && !!P.para;
      if (!m.visible) return;
      const pos = T.v1.copy(P.de.pos).lerp(P.para.pos, l.p), q = T.q1.copy(P.de.quat).slerp(P.para.quat, l.p);
      let w = lerp(P.de.w, P.para.w, l.p), h = lerp(P.de.h, P.para.h, l.p);
      if (l.e > 0) {
        const T = this.poseRetCam({ left: -60, top: -60, width: W + 120, height: H + 120 }, cam, 0.5);
        pos.lerp(T.pos, l.e); q.slerp(T.quat, l.e); w = lerp(w, T.w, l.e); h = lerp(h, T.h, l.e);
      }
      m.position.copy(pos); m.quaternion.copy(q); m.scale.set(w, h, 1); m.updateMatrixWorld(true);
      const u = m.material.uniforms; u.uTam.value.set(w, h); u.uA.value = l.a; u.uBranco.value = l.branco;
      u.uRaio.value = Math.min(P.raio, Math.min(w, h) / 2);
    });
    // sombras de contato: lâminas deitadas (peças sobre o instrumento) e a base do gráfico
    this.laminas.forEach((l, i) => {
      const m = this.objLaminas[i], sm = this.objSombras[i], P = this.poses[i];
      const deitada = m.visible && P.para && P.para.deitada;
      if (!deitada) { sm.visible = false; return; }
      const alt = Math.max(0, m.position.y - P.para.pos.y), perto = Math.max(0, 1 - alt / 0.6);
      sm.visible = perto > 0.01;
      if (!sm.visible) return;
      const L = T.v2.set(Math.sin(this.luz.a), 0, -Math.cos(this.luz.a));
      sm.position.set(m.position.x - L.x * (0.022 + alt * 0.3), 0.0012, m.position.z - L.z * (0.022 + alt * 0.3));
      sm.quaternion.copy(m.quaternion);
      const ww = m.scale.x + 0.08 + alt * 0.4, hh = m.scale.y + 0.08 + alt * 0.4;
      sm.scale.set(ww, hh, 1);
      const u = sm.material.uniforms; u.uTam.value.set(ww, hh); u.uA.value = 0.8 * perto * l.a; u.uDifuso.value = 0.035 + alt * 0.25;
    });
    {
      const sg = this.objSombraGraf;
      let x0 = Infinity, x1 = -Infinity, a = 0;
      for (const b of this.barras) if (!b.pos && b.a > 0.01 && b.k > 0.01 && (b.y0 ?? 0) < 0.02) { x0 = Math.min(x0, b.x - b.w / 2); x1 = Math.max(x1, b.x + b.w / 2); a = Math.max(a, b.a); }
      sg.visible = a > 0;
      if (sg.visible) {
        const G = this.barrasG; x0 -= 0.05; x1 += 0.05;
        const c = G.ponto((x0 + x1) / 2, 0, -0.02, T.v3); sg.position.set(c.x, 0.0012, c.z);
        sg.quaternion.copy(G.quat).multiply(this._qDeitar || (this._qDeitar = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)));
        const ww = (x1 - x0) * G.esc, hh = 0.16 * G.esc; sg.scale.set(ww, hh, 1);
        const u = sg.material.uniforms; u.uTam.value.set(ww, hh); u.uA.value = 0.5 * a; u.uDifuso.value = 0.05;
      }
    }
    // barras dos gráficos: base fixa, altura cresce com k
    const G = this.barrasG;
    this.barras.forEach((b, i) => {
      const m = this.objBarras[i];
      m.visible = b.a > 0.001 && b.k > 0.001;
      if (!m.visible) return;
      const hor = !!b.hor;
      const hh = hor ? b.h : Math.max(1e-4, b.h * b.k), ww = hor ? Math.max(1e-4, b.w * b.k) : b.w;
      if (b.pos) {       // barra com base própria no mundo (anel de unidades, por exemplo)
        m.position.copy(b.pos); m.position.y += b.y0 + hh / 2; m.quaternion.setFromAxisAngle(T.eixoY, b.giro ?? 0); m.scale.set(ww, hh, 1);
        const u = m.material.uniforms; u.uTam.value.set(ww, hh); u.uA.value = b.a; u.uRaio.value = Math.min(b.raio ?? 0.006, ww / 2, hh / 2);
        return;
      }
      const cx = hor ? b.x - b.w / 2 + ww / 2 : b.x;
      G.ponto(cx, b.y0 + hh / 2, b.z ?? 0, m.position); m.quaternion.copy(G.quat); m.scale.set(ww * G.esc, hh * G.esc, 1);
      const u = m.material.uniforms; u.uTam.value.set(ww * G.esc, hh * G.esc); u.uA.value = b.a; u.uRaio.value = Math.min(b.raio ?? 0.012, ww * G.esc / 2, hh * G.esc / 2);
    });
    this.linhasG.forEach((l, i) => { const o = this.objLinhasG[i]; o.visible = l.a > 0.001; const u = o.material.uniforms; u.uDesenho.value = l.desenho; u.uA.value = l.a; });
    this.matChao.uniforms.uReflA.value = this.chao.refl;
    this.renderizar(cam);
    this.desenhos = (this.desenhos || 0) + 1;
    for (const a of this.ancoras) this.posicionarAncora(a);
    for (const cl of this.colagens) this.posicionarColagem(cl);
    this.adaptar();
  }

  renderizar(cam) { this.renderer.render(this.scene, cam); }

  // Resolução: segue o tamanho real do palco na tela (nunca acima de 1920×1080); se os quadros pesarem, desce com a imagem parada.
  alvoEscala() {
    const palco = document.getElementById("palco");
    const larg = palco ? palco.getBoundingClientRect().width : W;
    return Math.max(0.4, Math.min(1, (larg * (window.devicePixelRatio || 1)) / W));
  }
  escolherEscala(q) {
    const R = this.renderer;
    const forcada = +q.get("escala");
    if (forcada) { this.teto = Math.max(0.4, Math.min(1, forcada)); this.fixa = true; }
    else this.teto = 1;
    this.aplicarEscala(Math.min(this.teto, this.alvoEscala()));
    window.addEventListener("resize", () => { if (!this.fixa) this.escalaPendente = Math.min(this.teto, this.alvoEscala()); });
    const gl = R.getContext(), px = new Uint8Array(4);
    const cam = this.camDe(this.plano("rasante"));
    const fim = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    for (let i = 0; i < 3; i++) this.renderizar(cam); fim();
    const r = [0, 1, 2].map(() => { const t0 = performance.now(); for (let i = 0; i < 4; i++) this.renderizar(cam); fim(); return (performance.now() - t0) / 4; }).sort((a, b) => a - b)[1];
    this.msGPU = +r.toFixed(1);
    // orçamento de 5 ms de GPU por quadro: sobra folga para a composição da página, o texto e outras abas abertas
    if (!q.has("captura") && !this.fixa && r > 5) { this.teto = Math.max(0.75, +Math.sqrt(5 / r).toFixed(2)); this.aplicarEscala(Math.min(this.teto, this.alvoEscala())); }
  }
  // A resolução é escolhida uma vez, no carregamento (e ao mudar o tamanho da janela): trocar a escala no meio
  // da peça realoca a imagem e congela a tela por mais de 100 ms. Aqui só se registram os tempos, para conferência.
  adaptar() {
    const agora = performance.now();
    if (this.tAnt) { this.tempos.push(agora - this.tAnt); if (this.tempos.length > 240) this.tempos.shift(); }
    this.tAnt = agora;
  }
  aplicarEscala(e) {
    this.escala = e;
    this.renderer.setSize(Math.round(W * e), Math.round(H * e), false);
    this.sujo = true;
  }
  marcar() { this.sujo = true; }
}
