#!/usr/bin/env node

import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/check_analysis_depth.mjs <report.md>");
  process.exit(2);
}

const text = fs.readFileSync(file, "utf8");
const required = [
  ["evidence", /证据|evidence/i],
  ["explicit_vs_highlight", /明确|原创想法|highlight|划线推断/i],
  ["temporal_flow", /时间|流变|阶段|turning/i],
  ["expression_habits", /表达习惯|表达模式|expression/i],
  ["tensions", /张力|反例|矛盾|counterexample/i],
  ["hypotheses", /假设|低置信|不应采纳|hypothesis/i],
  ["future_use", /AI 协作|AI 互动|未来|next|建议/i],
];

const missing = required.filter(([, pattern]) => !pattern.test(text)).map(([name]) => name);
const status = missing.length ? "needs_deepening" : "ok";

console.log(JSON.stringify({
  file,
  status,
  missing,
  lineCount: text.split(/\r?\n/).length,
}, null, 2));

process.exit(missing.length ? 1 : 0);
