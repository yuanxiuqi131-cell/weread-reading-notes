# Reading Context Data

Use reading context data as supporting evidence for personal-model work. It can describe reading behavior, coverage, timing, and attention distribution, but it must not be treated as direct proof of the user's beliefs.

## What Belongs Here

Include these official WeChat Reading API capabilities:

- Notebook overview and count semantics.
- Book metadata and reading progress.
- Shelf statistics.
- Reading statistics.
- App deep links back to source material.
- Search/bookId lookup as an auxiliary convenience.

Do not include by default:

- Public reviews by other readers.
- Popular highlights by other readers.
- Recommendation/discovery feeds.

Reason: outside opinions and platform recommendations can contaminate the user's personal-model evidence unless the user explicitly asks for comparative or social-reading analysis.

## Count Semantics

When reading `/user/notebooks`:

- Total notes for one book are `reviewCount + noteCount + bookmarkCount`.
- `reviewCount` means user-written thoughts, comments, and reviews.
- `noteCount` means highlight count, not total note count.
- `bookmarkCount` may be count-only. Do not claim bookmark text was exported unless the API response contains it.
- `readingProgress` is supporting context and should be labeled separately from note evidence.

## Book Metadata and Progress

Use:

- `/book/info` for title, author, translator, category, publisher, publish time, ISBN, word count, rating, and intro.
- `/book/getprogress` for current progress, update time, recorded reading time, finish time, and start-reading status.
- `/book/chapterinfo` only when chapter-level structure is useful for sorting, navigation, or validating note locations.

Personal-model use:

- Reading progress can explain why a book has few notes.
- Finished, abandoned, and in-progress books should not be analyzed with the same confidence.
- Word count and category help interpret reading investment, but they are not direct value evidence.

## Shelf Statistics

Use `/shelf/sync` to understand the user's library shape.

Count rules:

- Total shelf items are `books.length + albums.length + (mp nonempty ? 1 : 0)`.
- Albums are audiobooks and count as shelf items.
- Private/public counts require checking `secret` fields for books and albums; `mp` is private when present.

Personal-model use:

- Shelf composition can show long-term reading territory.
- Shelf data is weaker than notes because it can include aspirational, abandoned, or incidental books.
- Use shelf statistics as background context, never as a direct claim about the user's beliefs.

## Reading Statistics

Use `/readdata/detail`.

Supported modes:

- `weekly`
- `monthly`
- `annually`
- `overall`

Important:

- `totalReadTime`, `dayAverageReadTime`, and related fields are usually seconds. Convert them into hours/minutes for user-facing reports.
- `preferCategory`, `preferTime`, and `preferAuthor` are behavioral patterns, not explicit preferences unless supported by notes.
- Arbitrary date ranges may require combining multiple official periods.

Personal-model use:

- Reading time and frequency can contextualize intense or sparse note periods.
- Category and author preferences can guide cross-book grouping.
- Temporal reading patterns can support stage reports when combined with dated user thoughts.

## App Deep Links

Deep links are useful for traceability when supported by the user's device:

```text
Book: weread://reading?bId={bookId}
Chapter: weread://reading?bId={bookId}&chapterUid={chapterUid}
Highlight: weread://bestbookmark?bookId={bookId}&chapterUid={chapterUid}&rangeStart={rangeStart}&rangeEnd={rangeEnd}&userVid={userVid}
```

Use deep links as optional metadata. Do not make them required because desktop/device behavior can vary.

## Search and BookId Lookup

This is an auxiliary feature, not part of the core export path.

Plain-language meaning:

If the user only gives a book title, WeChat Reading's API usually needs the internal `bookId` before it can fetch book details or progress. Search helps convert a human title into possible official book records.

Use:

- `/store/search`
- `keyword`: title, author, or phrase supplied by the user
- `scope: 10` for ebook-focused search
- `count`: a small number such as 10

When normal notebook export is available, search is often unnecessary because `/user/notebooks` already returns `bookId`.

Before acting on search results, ask the user to confirm the intended book if there are multiple close matches.

## Evidence Labels

When using reading context in analysis, label it clearly:

- `explicit_thought`: user-written notes, comments, reviews.
- `highlight_signal`: user's selected passages.
- `reading_context`: shelf, progress, reading time, category, author, completion status.
- `platform_context`: metadata such as rating, publisher, public popularity, or recommendation source.

Only the first two can directly support personal-model claims. `reading_context` can support framing and priority decisions.
