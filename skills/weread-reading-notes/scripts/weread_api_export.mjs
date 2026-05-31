#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ENDPOINT = "https://i.weread.qq.com/api/agent/gateway";
const SKILL_VERSION = "1.0.3";

function usage() {
  console.log(`Usage:
  WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs notebooks --out <dir>
  node scripts/weread_api_export.mjs notebooks --api-key-file <file> --out <dir>
  WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs export-book --book-id <id> --out <dir>
  WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs export-first --count <n> --out <dir>
  WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs shelf --out <dir>
  WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs reading-stats --mode overall --out <dir>
  WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs book-context --book-id <id> --out <dir>
  WEREAD_API_KEY=wrk-... node scripts/weread_api_export.mjs search-book --keyword <title> --out <dir>

Notes:
  - Credentials are read from WEREAD_API_KEY or --api-key-file <file>.
  - --out <dir> is required; confirm it with the user before formal exports.
  - If no API key is available, get one at https://weread.qq.com/r/weread-skills.
  - Business parameters are sent flat in the JSON body, matching Tencent/WeChatReading.
  - Outputs use the formal WeRead_Reading_Notes structure.`);
}

function arg(name, fallback = "") {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return fallback;
  return process.argv[idx + 1];
}

function requireOutDir() {
  const out = arg("--out");
  if (!out) {
    throw new Error("Missing --out <dir>. Ask the user to choose a storage path before writing WeChat Reading outputs.");
  }
  return path.resolve(out);
}

function getApiKey() {
  const file = arg("--api-key-file");
  if (file) {
    const key = fs.readFileSync(path.resolve(file), "utf8").trim();
    if (key) return key;
  }
  return process.env.WEREAD_API_KEY || "";
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
  return file;
}

function safeName(value) {
  return String(value || "unknown")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function inlineText(text) {
  return String(text || "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rangeStart(range) {
  const n = Number(String(range || "0").split("-")[0]);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(ts) {
  if (!ts) return "日期不可见";
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(Number(ts) * 1000));
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}/${map.month}/${map.day}`;
}

function formatDuration(seconds) {
  const total = Number(seconds || 0);
  if (!Number.isFinite(total) || total <= 0) return "0 分钟";
  const hours = Math.floor(total / 3600);
  const minutes = Math.round((total % 3600) / 60);
  if (hours && minutes) return `${hours} 小时 ${minutes} 分钟`;
  if (hours) return `${hours} 小时`;
  return `${minutes} 分钟`;
}

async function callApi(api_name, payload = {}) {
  const key = getApiKey();
  if (!key) {
    throw new Error([
      "Missing WeChat Reading API key.",
      "Get one at https://weread.qq.com/r/weread-skills, then either save it in a local text file and pass --api-key-file <file>, paste it for one-time use, or configure WEREAD_API_KEY.",
    ].join(" "));
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ api_name, skill_version: SKILL_VERSION, ...payload }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${api_name} returned non-JSON: ${text.slice(0, 300)}`);
  }
  if (json.upgrade_info) {
    throw new Error(`${api_name} requires official skill upgrade: ${json.upgrade_info.message || JSON.stringify(json.upgrade_info)}`);
  }
  if (json.errcode && json.errcode !== 0) {
    throw new Error(`${api_name} failed: ${json.errmsg || json.errcode}`);
  }
  return json;
}

async function listNotebooks() {
  const books = [];
  let lastSort;
  let lastPage = {};
  for (let i = 0; i < 100; i++) {
    const payload = { count: 100 };
    if (lastSort) payload.lastSort = lastSort;
    const page = await callApi("/user/notebooks", payload);
    lastPage = page;
    const current = page.books || [];
    books.push(...current);
    if (!page.hasMore || current.length === 0) break;
    lastSort = current[current.length - 1].sort;
  }
  return { ...lastPage, books };
}

async function fetchShelf() {
  return callApi("/shelf/sync");
}

async function fetchReadingStats(mode, baseTime) {
  const payload = { mode };
  if (baseTime) payload.baseTime = Number(baseTime);
  return callApi("/readdata/detail", payload);
}

async function fetchBookContext(bookId) {
  const [info, progress] = await Promise.all([
    callApi("/book/info", { bookId: String(bookId) }),
    callApi("/book/getprogress", { bookId: String(bookId) }),
  ]);
  return { info, progress };
}

async function searchBook(keyword) {
  return callApi("/store/search", {
    keyword,
    scope: Number(arg("--scope", "10")),
    count: Number(arg("--count", "10")),
  });
}

async function listReviews(bookId) {
  const reviews = [];
  let synckey = 0;
  let lastPage = {};
  for (let i = 0; i < 100; i++) {
    const payload = { bookid: String(bookId), count: 100 };
    if (synckey) payload.synckey = synckey;
    const page = await callApi("/review/list/mine", payload);
    lastPage = page;
    reviews.push(...(page.reviews || []));
    if (!page.hasMore || !page.synckey) break;
    synckey = page.synckey;
  }
  return { ...lastPage, reviews };
}

function normalizeReview(item) {
  const r = item.review || item;
  return {
    kind: "review",
    id: r.reviewId || item.reviewId || "",
    chapterUid: r.chapterUid || 0,
    chapterName: r.chapterName || "",
    range: r.range || "",
    start: rangeStart(r.range),
    createTime: r.createTime || item.createTime || 0,
    content: r.content || "",
    abstract: r.abstract || r.markText || "",
  };
}

function normalizeMark(item) {
  return {
    kind: "mark",
    id: item.bookmarkId || "",
    chapterUid: item.chapterUid || 0,
    range: item.range || "",
    start: rangeStart(item.range),
    createTime: item.createTime || 0,
    markText: item.markText || "",
  };
}

function renderMarkdown(bookEntry, bookmarkResp, reviewResp, exportedAt) {
  const book = bookmarkResp.book || bookEntry?.book || {};
  const title = book.title || bookEntry?.book?.title || bookEntry?.title || "未知书名";
  const author = book.author || bookEntry?.book?.author || "作者待补充";
  const bookId = book.bookId || bookEntry?.bookId || "";
  const marks = (bookmarkResp.updated || []).map(normalizeMark);
  const reviews = (reviewResp.reviews || []).map(normalizeReview);
  const chapterMap = new Map();
  for (const ch of bookmarkResp.chapters || []) {
    chapterMap.set(String(ch.chapterUid), {
      title: ch.title || `章节 ${ch.chapterIdx ?? ch.chapterUid}`,
      idx: Number(ch.chapterIdx ?? 999999),
    });
  }
  for (const r of reviews) {
    const key = String(r.chapterUid || "");
    if (key && !chapterMap.has(key) && r.chapterName) chapterMap.set(key, { title: r.chapterName, idx: 999998 });
  }
  const chapterTitle = (uid, fallback) => chapterMap.get(String(uid))?.title || fallback || "未识别章节";
  const chapterIdx = (uid) => chapterMap.get(String(uid))?.idx ?? 999999;
  const items = [...reviews, ...marks].sort((a, b) => {
    const ca = chapterIdx(a.chapterUid);
    const cb = chapterIdx(b.chapterUid);
    if (ca !== cb) return ca - cb;
    if ((a.chapterUid || 0) !== (b.chapterUid || 0)) return Number(a.chapterUid || 0) - Number(b.chapterUid || 0);
    if (a.start !== b.start) return a.start - b.start;
    if (a.kind !== b.kind) return a.kind === "review" ? -1 : 1;
    return Number(a.createTime || 0) - Number(b.createTime || 0);
  });
  const expectedHighlights = Number(bookEntry?.noteCount ?? marks.length);
  const expectedReviews = Number(bookEntry?.reviewCount ?? reviews.length);
  const expectedBookmarks = Number(bookEntry?.bookmarkCount ?? 0);
  const total = expectedHighlights + expectedReviews + expectedBookmarks;
  const dates = reviews.map((r) => r.createTime).filter(Boolean).sort((a, b) => a - b);
  const dateRange = dates.length ? `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}` : "unknown";
  const out = [];
  out.push(`### **《${title}》**`);
  out.push("");
  out.push(author);
  out.push("");
  out.push(`${total}个笔记`);
  out.push("");
  out.push("来源：微信读书官方 Skill/API");
  out.push(`bookId：${bookId}`);
  out.push(`导出时间：${exportedAt}`);
  out.push("导出方式：official_skill_api");
  out.push("evidence_level：high");
  out.push(`划线数：${marks.length}`);
  out.push(`想法数：${reviews.length}`);
  out.push(`书签数：${expectedBookmarks}（仅统计，当前接口不导出书签内容）`);
  out.push(`想法日期范围：${dateRange}`);
  out.push("");
  let currentChapter = null;
  for (const item of items) {
    const ch = chapterTitle(item.chapterUid, item.chapterName);
    if (ch !== currentChapter) {
      out.push(`### ${ch}`);
      out.push("");
      currentChapter = ch;
    }
    if (item.kind === "review") {
      out.push(`- **${formatDate(item.createTime)} 发表想法**`);
      out.push("");
      for (const line of String(item.content || "（空想法）").split(/\r?\n/)) out.push(`    ${line}`);
      if (item.abstract) {
        out.push("");
        out.push(`    > 原文：${inlineText(item.abstract)}`);
      }
      out.push("");
    } else {
      out.push(`- ${inlineText(item.markText)}`);
      out.push("");
    }
  }
  return {
    title,
    author,
    bookId,
    expectedTotal: total,
    expectedHighlights,
    expectedReviews,
    expectedBookmarks,
    exportedHighlights: marks.length,
    exportedReviews: reviews.length,
    dateRange,
    markdown: out.join("\n"),
    status: marks.length === expectedHighlights && reviews.length === expectedReviews ? "ok" : "count_mismatch",
  };
}

async function exportBook(bookEntry, outDir) {
  const bookId = bookEntry.bookId || bookEntry.book?.bookId || bookEntry;
  const exportedAt = new Date().toISOString().slice(0, 10);
  const bookmarkResp = await callApi("/book/bookmarklist", { bookId: String(bookId) });
  const reviewResp = await listReviews(bookId);
  const rendered = renderMarkdown(bookEntry, bookmarkResp, reviewResp, exportedAt);
  const evidenceDir = path.join(outDir, "01_api_evidence_API原始证据");
  const rawDir = path.join(outDir, "02_raw_exports_原始导出");
  ensureDir(evidenceDir);
  ensureDir(rawDir);
  const base = `《${safeName(rendered.title)}》_${safeName(rendered.bookId)}_微信读书官方API_${exportedAt}`;
  const evidencePath = path.join(evidenceDir, `${base}.json`);
  const markdownPath = path.join(rawDir, `${base}.md`);
  fs.writeFileSync(evidencePath, JSON.stringify({ bookEntry, bookmarkResp, reviewResp }, null, 2), "utf8");
  fs.writeFileSync(markdownPath, rendered.markdown, "utf8");
  const { markdown, ...summary } = rendered;
  return { ...summary, evidencePath, markdownPath };
}

function summarizeShelf(shelf) {
  const books = shelf.books || [];
  const albums = shelf.albums || [];
  const hasMp = Boolean(shelf.mp && Object.keys(shelf.mp).length);
  const publicBooks = books.filter((item) => !item.secret).length;
  const privateBooks = books.length - publicBooks;
  const publicAlbums = albums.filter((item) => !item.albumInfoExtra?.secret).length;
  const privateAlbums = albums.length - publicAlbums;
  return {
    source: "WeChat Reading official Skill/API",
    evidenceType: "reading_context",
    exportedAt: today(),
    totalShelfItems: books.length + albums.length + (hasMp ? 1 : 0),
    ebookCount: books.length,
    audiobookCount: albums.length,
    hasMpShelf: hasMp,
    publicCount: publicBooks + publicAlbums,
    privateCount: privateBooks + privateAlbums + (hasMp ? 1 : 0),
  };
}

function summarizeReadingStats(stats, mode) {
  const averageReadTime = stats.dayAverageReadTime ?? (stats.readDays ? Math.round(Number(stats.totalReadTime || 0) / Number(stats.readDays)) : 0);
  return {
    source: "WeChat Reading official Skill/API",
    evidenceType: "reading_context",
    mode,
    exportedAt: today(),
    totalReadTimeSeconds: stats.totalReadTime,
    totalReadTimeReadable: formatDuration(stats.totalReadTime),
    readDays: stats.readDays,
    dayAverageReadTimeSeconds: averageReadTime,
    dayAverageReadTimeReadable: formatDuration(averageReadTime),
    preferCategory: stats.preferCategory,
    preferTime: stats.preferTime,
    preferAuthor: stats.preferAuthor,
  };
}

function makeDeepLinks(bookId, progress = {}) {
  const progressBody = progress.book || progress;
  return {
    book: `weread://reading?bId=${bookId}`,
    lastProgress: progressBody.chapterUid
      ? `weread://reading?bId=${bookId}&chapterUid=${progressBody.chapterUid}`
      : "",
  };
}

function extractSearchCandidates(result) {
  const candidates = [];
  for (const group of result.results || []) {
    for (const item of group.books || []) {
      const book = item.bookInfo || item.book || item;
      if (!book?.bookId) continue;
      candidates.push({
        bookId: book.bookId,
        title: book.title || "",
        author: book.author || "",
        translator: book.translator || "",
        category: book.category || "",
        readingCount: item.readingCount,
        rating: book.newRating,
        sourceGroup: group.title || "",
      });
    }
  }
  return candidates;
}

async function main() {
  const command = process.argv[2];
  if (!command || command === "-h" || command === "--help") {
    usage();
    return;
  }
  const outDir = requireOutDir();
  ensureDir(outDir);

  if (command === "notebooks") {
    const notebooks = await listNotebooks();
    const file = path.join(outDir, "weread_notebooks.json");
    writeJson(file, notebooks);
    console.log(JSON.stringify({ file, totalBookCount: notebooks.totalBookCount, totalNoteCount: notebooks.totalNoteCount, books: notebooks.books?.length || 0 }, null, 2));
    return;
  }

  if (command === "shelf") {
    const shelf = await fetchShelf();
    const contextDir = path.join(outDir, "08_reading_context_阅读上下文");
    const file = writeJson(path.join(contextDir, `书架统计_${today()}.json`), {
      summary: summarizeShelf(shelf),
      raw: shelf,
    });
    console.log(JSON.stringify({ file, summary: summarizeShelf(shelf) }, null, 2));
    return;
  }

  if (command === "reading-stats") {
    const mode = arg("--mode", "overall");
    const baseTime = arg("--base-time");
    const stats = await fetchReadingStats(mode, baseTime);
    const contextDir = path.join(outDir, "08_reading_context_阅读上下文");
    const file = writeJson(path.join(contextDir, `阅读统计_${safeName(mode)}_${today()}.json`), {
      summary: summarizeReadingStats(stats, mode),
      raw: stats,
    });
    console.log(JSON.stringify({ file, summary: summarizeReadingStats(stats, mode) }, null, 2));
    return;
  }

  if (command === "book-context") {
    const bookId = arg("--book-id");
    if (!bookId) throw new Error("Missing --book-id");
    const context = await fetchBookContext(bookId);
    const book = context.info.book || context.info;
    const progress = context.progress.book || context.progress;
    const readingTime = progress.recordReadingTime || progress.readingTime || 0;
    const title = book.title || book.name || "未知书名";
    const contextDir = path.join(outDir, "08_reading_context_阅读上下文");
    const file = writeJson(path.join(contextDir, `《${safeName(title)}》_${safeName(bookId)}_阅读上下文_${today()}.json`), {
      summary: {
        source: "WeChat Reading official Skill/API",
        evidenceType: "reading_context",
        exportedAt: today(),
        bookId,
        title,
        author: book.author || "",
        category: book.category || "",
        wordCount: book.wordCount,
        readingProgress: progress.progress,
        recordReadingTimeSeconds: readingTime,
        recordReadingTimeReadable: formatDuration(readingTime),
        updateTime: progress.updateTime ? formatDate(progress.updateTime) : "",
        finishTime: progress.finishTime ? formatDate(progress.finishTime) : "",
        isStartReading: progress.isStartReading,
        deepLinks: makeDeepLinks(bookId, context.progress),
      },
      raw: context,
    });
    console.log(JSON.stringify({ file }, null, 2));
    return;
  }

  if (command === "search-book") {
    const keyword = arg("--keyword");
    if (!keyword) throw new Error("Missing --keyword");
    const result = await searchBook(keyword);
    const candidates = extractSearchCandidates(result);
    const contextDir = path.join(outDir, "08_reading_context_阅读上下文");
    const file = writeJson(path.join(contextDir, `搜索结果_${safeName(keyword)}_${today()}.json`), {
      summary: {
        source: "WeChat Reading official Skill/API",
        evidenceType: "reading_context",
        exportedAt: today(),
        keyword,
        scope: Number(arg("--scope", "10")),
        candidateCount: candidates.length,
        candidates: candidates.slice(0, 20),
        note: "Search is an auxiliary title-to-bookId lookup. Confirm the intended book before exporting by bookId.",
      },
      raw: result,
    });
    console.log(JSON.stringify({ file }, null, 2));
    return;
  }

  if (command === "export-book") {
    const bookId = arg("--book-id");
    if (!bookId) throw new Error("Missing --book-id");
    const result = await exportBook({ bookId }, outDir);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === "export-first") {
    const count = Number(arg("--count", "5"));
    const notebooks = await listNotebooks();
    const selected = (notebooks.books || []).slice(0, count);
    const results = [];
    for (const book of selected) results.push(await exportBook(book, outDir));
    const logsDir = path.join(outDir, "99_logs_运行日志");
    ensureDir(logsDir);
    const summaryPath = path.join(logsDir, "batch_export_summary.json");
    writeJson(summaryPath, {
      exportedAt: new Date().toISOString().slice(0, 10),
      source: "WeChat Reading official Skill/API",
      totalBookCount: notebooks.totalBookCount,
      totalNoteCount: notebooks.totalNoteCount,
      selected: results,
    });
    console.log(JSON.stringify({ summaryPath, selected: results.length, results }, null, 2));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((err) => {
  if (process.env.DEBUG) {
    console.error(err?.stack || err);
  } else {
    console.error(`Error: ${err?.message || err}`);
  }
  process.exit(1);
});
