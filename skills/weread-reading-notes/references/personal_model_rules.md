# Personal Model Rules

## Optional Analysis Outputs

Generate analysis layers when the user asks to continue beyond archival work.

Targets:

```text
04_ai_ready_AI投喂版/
05_single_book_model_单书个人模型/
06_cross_book_model_跨书个人模型/
07_stage_reports_阶段性报告/
08_reading_context_阅读上下文/
```

## AI-Ready Note

Use:

```markdown
# 《{{书名}}》AI 投喂版

## 1. 基本信息
## 2. 用户原创想法摘出
## 3. 明显认同的观点
## 4. 明显反对 / 保留的观点
## 5. 高频问题簇
## 6. 时间线索
## 7. 可用于个人模型提取的线索
## 8. 建议 AI 分析 Prompt
```

AI-ready notes may compress and filter, but must reference the archived note.

## Three Personal-Model Layers

1. Single-book model:
   - One file per book.
   - Extract only from this book's preserved evidence.
   - Mark evidence strength.
2. Cross-book index:
   - Track repeated themes, questions, values, emotional reactions, and expression patterns.
   - Distinguish stable cross-book signals from weak single-book signals.
3. Stage report:
   - State date range, book/sample count, evidence strength, limits, and hypotheses.
   - Include temporal flow when timestamps exist.

Do not collapse these layers into one file.

## Reading Context as Supporting Evidence

Use shelf statistics, reading progress, book metadata, and reading statistics as `reading_context`.

`reading_context` can help answer:

- whether a book was finished, abandoned, or still in progress
- whether sparse notes may be caused by low progress rather than low relevance
- which categories, authors, and time periods shaped the reading stage
- how reading intensity changed across months, quarters, or years

Do not use reading context alone to claim that the user believes, values, rejects, or identifies with an idea. Those claims require explicit thoughts, paired highlights, or repeated high-quality highlight signals.

## Evidence Rules

- User comments/reviews/written thoughts: high evidence for explicit user views.
- Paired highlights: context for a dated user thought.
- Repeated highlight-only patterns: medium evidence for attention structure.
- Isolated highlight-only passages: low evidence.
- Reading context such as shelf, progress, and reading statistics: behavioral background evidence.
- Label highlight-only conclusions as `划线推断` or `inferred from highlights`.
- Do not write highlight-only analysis as "the user believes/thinks".

## Temporal Analysis

- Use timestamps from user comments/reviews to reconstruct attention changes.
- Never invent timestamps for undated highlights.
- Separate:
  - `explicit_timed_thought`
  - `paired_highlight_context`
  - `untimed_highlight_signal`
- Group by month, quarter, year, or user-specified life stage only when enough evidence exists.
- State limitations when most material is undated.

## Priority Ladder

- A: high explicit-thought density.
- B: medium explicit-thought density plus large highlight volume.
- C: stage-relevant books selected by current user concerns.
- D: low-evidence archive-only material.

Do not use a single hard threshold such as `user comments >= 20`.

## Expression Habit Extraction

Treat expression habits as part of the personal model. Track:

- question-generating expressions
- concept-calibration expressions
- uncertainty or reserved-judgment expressions
- self-referential or experience-returning expressions
- colloquial, humorous, or teasing expressions
- value-resistance expressions
- writing/creation-transforming expressions
- strong aesthetic or emotional markers

Preserve examples. Short comments such as `why`, `不太认可`, `笑死了`, and emoji-heavy reactions can be meaningful evidence.

## PKM Candidates

Treat PKM candidate generation as optional and experimental. Do not generate PKM candidates by default after personal-model extraction unless the user asks to continue into PKM.
