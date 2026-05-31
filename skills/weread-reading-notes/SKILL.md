---
name: weread-reading-notes
description: Export, archive, and deeply analyze WeChat Reading notes into a traceable reading system. Use when Codex receives WeChat Reading Markdown exports, official WeChat Reading API access, reading-note files, or requests such as 导出微信读书笔记, 整理微信读书笔记, 生成归档版, 生成 AI 投喂版, 提取个人模型线索, 跨书个人模型索引, 阶段性阅读报告, 关注点流变, 书架统计, 阅读进度统计, 阅读上下文, or 微信读书笔记整理. Preserve original highlights and user comments before analysis, require the user to choose or confirm a storage path before writing formal outputs, distinguish explicit user thoughts from highlight-only inferences, use shelf/progress/reading statistics only as supporting context, and never ask for or store passwords, cookies, SMS codes, or API keys in chat.
---

# WeRead Reading Notes

## Core Rule

Preserve before extracting. Never summarize, filter, deduplicate, polish, or reinterpret original WeChat Reading material before saving the raw export and archived note.

Use this phase order:

```text
input/export
-> destination selection
-> raw evidence
-> raw Markdown export
-> complete archived note
-> optional AI-ready note
-> optional single-book personal-model extraction
-> optional cross-book personal-model index
-> optional stage report
-> optional reading context report
-> optional PKM candidates
```

## Quick Start

1. Identify the input mode:
   - Official WeChat Reading API through a local `WEREAD_API_KEY` or a user-provided local API-key file path.
   - Installed Tencent/WeChatReading skill/tool when available.
   - Existing Markdown export.
   - Browser copy workflow only as an unstable fallback.
2. After reading notebook overview, explain what the data can be used for and let the user choose the goal: backup, AI-ready material, personal model, stage report, or PKM candidates.
3. Ask the user to choose or confirm the storage path before writing any formal output.
4. Save raw evidence before analysis.
5. Generate one raw export and one archived note per book.
6. Generate analysis layers only when requested or implied by the selected goal.
7. Apply the analysis depth gate before declaring cross-book or stage reports complete.

## Destination

Destination selection is a mandatory gate.

Before creating files, ask the user where outputs should be stored unless the user already provided an explicit path in the current conversation. Do not silently use the current working directory, the skill folder, `Documents`, or a default output folder for formal outputs.

When asking, present a plain-language choice:

- Use an existing vault/project folder provided by the user.
- Create a new folder at a user-approved path.
- For quick tests only, use a temporary folder and say it will not be the formal archive.

After the user chooses a parent path, create or use a `WeRead_Reading_Notes/` folder inside it unless the user asks for a different folder name.

For formal runs, prefer this structure under the user-approved path:

```text
WeRead_Reading_Notes/
├── 00_system_系统说明/
├── 01_api_evidence_API原始证据/
├── 02_raw_exports_原始导出/
├── 03_archived_notes_归档整理/
├── 04_ai_ready_AI投喂版/
├── 05_single_book_model_单书个人模型/
├── 06_cross_book_model_跨书个人模型/
├── 07_stage_reports_阶段性报告/
├── 08_reading_context_阅读上下文/
├── 90_index_索引/
└── 99_logs_运行日志/
```

If an existing vault structure is clearly in use, follow it unless the user asks to standardize or migrate.

## References

Load only the reference needed for the current task:

- For export modes, browser workflow, multi-book splitting, and safety rules, read `references/export_modes.md`.
- For official WeChat Reading API details and helper script usage, read `references/api_gateway.md`.
- For shelf statistics, reading progress, book metadata, reading statistics, deep links, and title-to-bookId lookup, read `references/reading_context.md`.
- For directory layout, filenames, archived-note shape, and index conventions, read `references/output_structure.md`.
- For AI-ready notes, single-book extraction, cross-book indexes, stage reports, temporal analysis, highlight-only inference, and expression habits, read `references/personal_model_rules.md`.
- For the mandatory depth checklist before presenting final cross-book/stage outputs, read `references/analysis_quality_gate.md`.

## Scripts

- Use `scripts/weread_api_export.mjs` for official API export when `WEREAD_API_KEY` is configured locally or the user provides a local API-key file path.
- The helper script does not require the Tencent/WeChatReading skill to be installed at runtime; it calls the official Agent API Gateway directly. It still requires a valid API key and network access.
- Use `scripts/check_analysis_depth.mjs` to check whether a cross-book index or stage report is deep enough to present as final.

## Required Evidence Rules

- Treat user comments/reviews/written thoughts as explicit evidence.
- Treat paired highlights as context for the dated user thought.
- Treat highlight-only material as attention evidence, not user opinion.
- Never invent dates for undated highlights.
- Mark low-evidence conclusions as `划线推断` or `inferred from highlights`.
- Use `v1_draft` for batch scaffolds and `v2_deep_synthesis` for final cross-book/stage synthesis.

## Completion Standard

Before finishing, report:

- Files created or updated.
- Whether raw material was fully preserved.
- Which outputs are draft, final, or need deepening.
- Remaining uncertainty or quality limits.
- The recommended next step.
