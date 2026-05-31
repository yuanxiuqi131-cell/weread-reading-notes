# Analysis Depth Quality Gate

Running the workflow means producing thoughtful analysis, not merely creating files.

## Draft vs Final

- Mark batch scaffolds as `analysis_depth: draft`.
- Mark shallow all-book summaries as `needs_deepening`.
- Mark final synthesis as `analysis_depth: v2_deep_synthesis`.
- Do not present a generic count summary as the final cross-book index or stage report.

## Required Checklist

Before calling a cross-book index or stage report complete, confirm it includes:

- Evidence distribution by book and period.
- Explicit user statements vs highlight-only inferences.
- Recurring themes and weak/one-off themes.
- Temporal flow and turning points.
- Expression habits with original examples.
- Cross-book contradictions, tensions, or counterexamples.
- Stable hypotheses and rejected/low-confidence hypotheses.
- Practical implications for future AI interaction or reading workflows.

## Depth Rules

- Prefer fewer deeply analyzed books over many shallow conclusions.
- Low-evidence books should enter attention maps, not strong personal-model conclusions.
- A final report must perform second-pass synthesis over the generated files and preserved evidence.
- When the user says "continue until finished", continue through the workflow but still enforce this gate.

## Recommended Report Sections

```markdown
# 阶段性个人模型报告｜{{范围}} v2 深度综合

## 1. 证据边界
## 2. 时间分布
## 3. 阶段性流变
## 4. 稳定主题
## 5. 表达习惯
## 6. 张力与反例
## 7. 稳定假设
## 8. 低置信或不应采纳的结论
## 9. 对未来 AI 协作的要求
```
