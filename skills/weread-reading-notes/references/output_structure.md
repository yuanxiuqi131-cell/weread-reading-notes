# Output Structure

## Destination Gate

Before writing any formal output, confirm the destination with the user.

Rules:

- If the user already gave an explicit output path in the current conversation, use that path and repeat it back before writing.
- If no path was given, ask for a storage path before creating files.
- Do not silently write formal outputs to the current working directory, `Documents`, the skill folder, or a default folder.
- Use temporary folders only for tests, and label them as temporary.
- After the user selects a parent path, create or use `WeRead_Reading_Notes/` inside it unless the user asks for a different folder name.

## Formal Folder Layout

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

## Raw Export

Target:

```text
02_raw_exports_原始导出/
```

Filename:

```text
《书名》_bookId_微信读书官方API_YYYY-MM-DD.md
```

Rules:

- Preserve the normalized official/API or copied export.
- Do not summarize, delete, reorder, or deduplicate notes.

## API Evidence

Target:

```text
01_api_evidence_API原始证据/
```

Filename:

```text
《书名》_bookId_微信读书官方API_YYYY-MM-DD.json
```

Never write credentials into evidence.

## Reading Context

Target:

```text
08_reading_context_阅读上下文/
```

Use this folder for supporting data that helps interpret personal-model outputs but is not itself a user thought.

Recommended files:

```text
书架统计_YYYY-MM-DD.json
阅读统计_overall_YYYY-MM-DD.json
《书名》_bookId_阅读上下文_YYYY-MM-DD.json
搜索结果_关键词_YYYY-MM-DD.json
```

Possible contents:

- shelf size, public/private distribution, and category clues
- book metadata
- reading progress and reading time
- reading statistics by official period
- optional WeChat Reading app deep links

Analysis outputs may cite these files as `reading_context`, but should not treat them as direct user opinions.

## Archived Note

Target:

```text
03_archived_notes_归档整理/
```

Filename:

```text
《书名》_bookId_读书笔记_归档版.md
```

Archived notes may add metadata and an index before the original export body, but must include the full original export.

Minimum archived-note sections:

```markdown
---
title: "{{书名}}"
author: "{{作者}}"
bookId: "{{bookId}}"
source: "微信读书官方 Skill/API"
type: "reading_note"
status: "archived"
created: "{{date}}"
exported_date: "{{date}}"
note_count: {{note_count}}
highlight_count: {{highlight_count}}
review_count: {{review_count}}
evidence_level: "{{high|medium|low}}"
---

# 《{{书名}}》读书笔记｜归档版

## 0. 基本信息
## 1. 初步索引
## 2. 原始导出全文
```

## Processing Index

Maintain an index when processing batches:

```markdown
| 书名 | 作者 | bookId | 总笔记 | 阅读上下文 | 原始导出 | 归档版 | AI投喂版 | 单书提取 | 跨书索引 | 阶段报告 | PKM候选 | 质量状态 | 下一步 |
|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|
```

Record draft/final status for analysis outputs.
