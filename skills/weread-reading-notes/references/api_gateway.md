# Official API Gateway

Use this only when a WeChat Reading skill/tool/API is available or the user has configured an API key locally.

## Runtime Dependency

The bundled helper does not require the Tencent/WeChatReading skill to be installed in the local Codex skills directory. It directly calls the official Agent API Gateway.

Required at runtime:

- A valid API key, provided through `WEREAD_API_KEY` or `--api-key-file <file>`.
- Network access to `https://i.weread.qq.com/api/agent/gateway`.
- Node.js with built-in `fetch`.

Not required at runtime:

- The Tencent/WeChatReading skill files.
- The `skills` CLI package.
- A local copy of the Tencent GitHub repository.

Important distinction:

- Installing Tencent/WeChatReading may be one way to discover the API pattern, documentation, or obtain/configure access.
- Once the gateway pattern and a valid key are available, this skill's helper can call the API directly.
- If no valid API key is available, official API export is unavailable; fall back to existing Markdown exports or the browser copy workflow.

## Credential Handling

- Prefer a local API-key file path for non-technical users, or `WEREAD_API_KEY` for terminal users.
- If the user pastes an API key during an interactive session, use it only for the current operation and do not save, log, or repeat it.
- Read credentials from `WEREAD_API_KEY` or `--api-key-file <file>`.
- Do not print, log, or write the key into output files.
- If missing, offer user-friendly options: paste for one-time use, provide a local file path, or configure an environment variable.

## How Users Get an API Key

Guide new users to the official WeChat Reading Skill page:

```text
https://weread.qq.com/r/weread-skills
```

Plain-language guidance:

1. Open the official page above.
2. Log in to WeChat Reading when prompted.
3. Find the `获取 API Key` section.
4. Copy the API Key shown after login.
5. Keep it private. Do not publish it or save it inside the skill folder.

For non-technical users, recommend saving the key into a local text file and providing the path to Codex. For one-time tests, the user may paste the key in the current conversation; use it only for that operation and do not repeat or persist it.

## Helper Script

The helper requires an explicit `--out <dir>` for every command that writes files. The agent must confirm this path with the user before running the script for formal outputs.

Use:

```bash
WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs notebooks --out <dir>
node scripts/weread_api_export.mjs notebooks --api-key-file <file> --out <dir>
WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs export-book --book-id <id> --out <dir>
WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs export-first --count <n> --out <dir>
WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs shelf --out <dir>
WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs reading-stats --mode overall --out <dir>
WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs book-context --book-id <id> --out <dir>
WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs search-book --keyword <title> --out <dir>
```

The helper follows Tencent/WeChatReading's Agent API Gateway pattern:

- Endpoint: `https://i.weread.qq.com/api/agent/gateway`
- Header: `Authorization: Bearer $WEREAD_API_KEY`
- Body: flat JSON with `api_name`, business parameters, and `skill_version`
- Skill version: `1.0.3`

## API Count and Field Meanings

Do not infer count meanings from field names alone.

- In `/user/notebooks`, total notes for one book are `reviewCount + noteCount + bookmarkCount`.
- `reviewCount` means user-written thoughts, comments, and reviews.
- `noteCount` means highlight count, not total note count.
- `bookmarkCount` is usually count-only; bookmark content may not be exported by the notes endpoints.
- `lastSort` is used for notebook pagination. Do not use offset/limit pagination for `/user/notebooks`.
- Business parameters must be sent as flat body fields, for example `{ "api_name": "/review/list/mine", "bookid": "...", "count": 100, "skill_version": "1.0.3" }`.
- For `/review/list/mine`, follow `synckey` until `hasMore` is false.

## Batch Export Procedure

1. Fetch notebook overview through `/_list` or `/user/notebooks`.
2. Present a plain-language overview: book count, total notes, highlights, comments, bookmarks, and top books by user comments/highlights.
3. Explain possible use goals and ask the user to choose: backup, AI-ready material, personal model, stage report, or PKM candidates.
4. Confirm export range and storage path before writing formal outputs. If the user has not provided a path, stop and ask.
5. Save candidate list with title, author, bookId, highlight count, comment count, bookmark count, and progress when present.
6. Confirm range for large batches.
7. For each book, fetch highlights through `/book/bookmarklist`.
8. Fetch user comments through `/review/list/mine`; follow `synckey` until `hasMore` is false.
9. Sort by chapter order and text range.
10. Write raw API evidence JSON.
11. Write normalized raw Markdown.
12. Generate a batch report with expected counts, exported counts, status, paths, and mismatches.

## Quality Gate

- Compare expected highlight/comment counts from notebook overview with exported counts.
- Confirm comment dates are present.
- Confirm highlight/comment pairings are preserved.
- Mark `evidence_level: high` only when official data is equivalent to "复制全部笔记" or better.
- Treat non-zero `errcode` and count mismatches as quality failures, except bookmark content gaps when the API exposes only bookmark counts.
