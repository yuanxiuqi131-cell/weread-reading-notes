# Export Modes

## Safety Rules

- Never ask for WeChat passwords, SMS codes, cookies, tokens, or session secrets.
- API keys may be used in three ways: one-time paste during the current session, local API-key file path, or local environment variable. Do not save, print, log, or repeat API keys.
- Use only the user's local logged-in browser session.
- If login, QR scan, CAPTCHA, or identity verification appears, pause for the user.
- Do not bypass access controls or access other users' private notes.

## Input Priority

1. Use official WeChat Reading API/tool when available and authorized.
2. Process existing Markdown exports when supplied.
3. Use the human-path browser copy workflow only when official data is unavailable or incomplete.
4. Use single-book/shelf URLs and direct page scraping only as unstable last resorts.

Do not present single book URLs or shelf URLs as recommended entry points for new users.

## Existing Markdown Export

Read the Markdown and identify:

- Book title and author.
- Export/processing date.
- Note count.
- Chapter structure.
- Highlight blocks.
- User comment blocks.
- User comment date range.

If values are absent, write `unknown` or `待补充`; never invent metadata.

## Multi-Book Export Detection

Detect repeated WeChat Reading title blocks:

```markdown
### **《书名》**

作者

310个笔记
```

Rules:

- Treat each detected block as a separate book.
- Generate separate raw exports and archived notes.
- Do not merge notes across books.
- If boundaries are uncertain, stop and show a split preview with titles, authors, counts, and line ranges.
- If the same book appears in multiple non-contiguous blocks, ask before merging.

## Browser Copy Workflow

Prefer visible controls such as `复制全部笔记`, `复制笔记`, or `导出笔记`.

Procedure:

1. Open the shelf or reader URL.
2. Let the user complete login if needed.
3. Open the target book.
4. Open the notes panel.
5. Locate the copy/export control.
6. Confirm before overwriting the clipboard.
7. Click copy/export.
8. Read clipboard text.
9. Save the clipboard text as raw export.
10. Verify book title and note structure.
11. Continue to archived-note generation.

For batch browser export, process one book at a time and save immediately after each copy.
