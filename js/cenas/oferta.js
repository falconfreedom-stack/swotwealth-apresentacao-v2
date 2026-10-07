// A oferta.
import { cascata } from "../util.js?v=202610071930";
import { top3 } from "../conteudo.js?v=202610071930";
import { gsap, marco } from "./comum.js?v=202610071930";

// ============================================================================ 9 · a oferta
export function oferta(c, ctx) {
  const M = ctx.mundo;
  c.className = "cena c-oferta";
  c.innerHTML = `<div class="topo"><h1 class="t-display">Um projeto.<br>R$ 10.000.<br>Até dez dias.</h1></div>
  <div class="ficha">
    <div class="k">O que você recebe</div><div class="v">O diagnóstico, as folhas com o direcionamento, a planilha, o painel e duas sessões com os sócios: a de decisão, entre o quarto e o sexto dia, e a devolutiva, no nono.</div>
    <div class="k">O prazo</div><div class="v">Dez dias corridos, contados do dia útil seguinte à confirmação de que os insumos chegaram completos.</div>
    <div class="k">O que não está incluído</div><div class="v">A implantação: ajustes no sistema, negociação com banco ou credenciadora e contratações. A empresa executa com o roteiro entregue.</div>
    <div class="k">O que não prometemos</div><div class="v">Retorno garantido. Os valores são estimativas com memória de cálculo.</div>
  </div>
  <p class="amb">O Top 3 é a entrada. Cada projeto abre os seguintes, dentro dos 208.</p>`;
  const q = (s) => c.querySelector(s);
  const tl = gsap().timeline({ paused: true });
  M.base(tl, { cam: { x: -1.0, y: 3.7, z: 0.9, tx: -0.95, ty: 0, tz: 0.12, fov: 34 }, disco: { top3: 1 }, luz: { a: 0.6 } });
  M.irPara(tl, "oferta", 3.0, 0, {}, "power3.inOut");
  M.luzPara(tl, { a: 2.8 }, 34, 0);
  tl.set(c.querySelectorAll(".topo, .ficha > div, .amb"), { opacity: 0 }, 0);
  cascata(tl, [q(".topo")], 0, 1.2, 1.0, 14);
  cascata(tl, c.querySelectorAll(".ficha > div"), 0.1, 2.6, 0.6, 8);
  marco(tl, "ficha", 2.6);
  tl.to(M.disco, { pulso: 1, duration: 0.6, yoyo: true, repeat: 1, ease: "sine.inOut" }, 26.0);
  cascata(tl, [q(".amb")], 0, 26.2, 0.9, 10);
  marco(tl, "fim", 27.2);
  tl.to(c.querySelectorAll(".topo, .ficha, .amb"), { opacity: 0, duration: 0.8 }, 33.4);
  return tl;
}
