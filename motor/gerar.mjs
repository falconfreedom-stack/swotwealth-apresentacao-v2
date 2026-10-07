// Gera dados/calculado.json: o resultado do FIN3.10 (simulação diária de 365 dias, onze cenários) com a impressão
// digital da base. Rode depois de qualquer mudança em dados/base.json:  node motor/gerar.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { calcularFin310 } from "./fin310.js";
import { impressao } from "./motor.js";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = JSON.parse(readFileSync(join(raiz, "dados", "base.json"), "utf8"));
const t0 = Date.now();
const fin310 = JSON.parse(JSON.stringify(calcularFin310(base.fin310)));
const saida = { gerado_em: new Date().toISOString(), impressao: impressao(base.fin310), versao_base: base.versao, fin310 };
writeFileSync(join(raiz, "dados", "calculado.json"), JSON.stringify(saida));
console.log(`dados/calculado.json gerado em ${((Date.now() - t0) / 1000).toFixed(1)} s · impressão ${saida.impressao} · economia anual estimada R$ ${(fin310.totais.economia_anual_estimada / 1e6).toFixed(2)} mi`);
