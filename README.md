# weread-reading-notes

`weread-reading-notes` 是一个用于导出、归档和深度分析微信读书笔记的 Codex skill。

它适合希望把微信读书笔记整理成长期阅读系统、个人知识系统或个人模型材料的用户。

## 背景

微信读书笔记通常包含两类材料：

- 划线：用户注意到的原文片段
- 想法 / 评论：用户主动写下的理解、疑问、判断和感受

这两类材料的证据强度不同。这个 skill 的核心设计是：

```text
先保存原始材料，再进行分析。
先区分证据类型，再生成结论。
先形成单书理解，再进行跨书综合。
```

它不会把“划线”直接当成用户观点，也不会在归档阶段删减、总结或改写原始材料。

## 功能

这个 skill 支持：

- 导出微信读书笔记
- 保存 API 原始证据
- 生成原始 Markdown 导出
- 生成完整归档版
- 生成 AI 投喂版
- 生成单书个人模型
- 生成跨书个人模型索引
- 生成阶段性阅读 / 个人模型报告
- 生成书架、阅读进度、阅读统计等阅读上下文
- 根据时间戳分析关注点流变
- 区分用户明确想法和仅划线推断
- 检查跨书报告和阶段报告的分析深度

## Skill 结构

这个仓库的结构是：

```text
weread-reading-notes/
├── README.md
└── skills/
    └── weread-reading-notes/
        ├── SKILL.md
        ├── agents/
        ├── references/
        └── scripts/
```

其中真正需要安装到 Codex 的 skill 目录是：

```text
skills/weread-reading-notes/
```

skill 内部结构是：

```text
weread-reading-notes/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── analysis_quality_gate.md
│   ├── api_gateway.md
│   ├── export_modes.md
│   ├── output_structure.md
│   ├── personal_model_rules.md
│   └── reading_context.md
└── scripts/
    ├── check_analysis_depth.mjs
    └── weread_api_export.mjs
```

## 安装

将仓库里的 skill 文件夹复制到 Codex skills 目录：

```text
skills/weread-reading-notes/ -> ~/.codex/skills/weread-reading-notes
```

安装后，确认：

- 文件夹名是 `weread-reading-notes`
- `SKILL.md` frontmatter 中的 `name` 是 `weread-reading-notes`
- 本地可以运行 Node.js

## 使用方式

可以对 Codex 说：

```text
使用 weread-reading-notes 整理这份微信读书笔记
```

或：

```text
用 weread-reading-notes 导出用户的微信读书笔记
```

或：

```text
按微信读书笔记整理 skill 生成 AI 投喂版和个人模型
```

## 输入方式

支持以下输入方式：

1. 微信读书官方 API
2. 已导出的 Markdown 笔记
3. 浏览器中人工路径的“复制全部笔记”

推荐优先级：

```text
官方 API
-> 用户提供 Markdown 导出
-> 浏览器复制全部笔记
```

## 是否依赖 Tencent/WeChatReading skill

不强依赖。

`weread-reading-notes` 自带脚本，可以直接调用微信读书官方 Agent API Gateway：

```text
https://i.weread.qq.com/api/agent/gateway
```

使用官方 API 导出需要：

- 有效的微信读书 API key
- Node.js
- 网络访问

不需要：

- 本地安装 `Tencent/WeChatReading` skill
- 本地有 Tencent GitHub 仓库
- 本地安装 `skills` CLI

不过，安装 `Tencent/WeChatReading` 可能是了解接口方式或获取 API key 的一种途径。

如果没有有效 API key，可以使用：

- 微信读书 Markdown 导出
- 浏览器复制全部笔记
- 已登录网页中的可见笔记内容

## API key 安全和配置方式

### 如何获取 API key

打开微信读书官方 Skill 页面：

```text
https://weread.qq.com/r/weread-skills
```

在页面中：

1. 登录微信读书账号
2. 找到“获取 API Key”
3. 登录后复制页面提供的 API Key
4. 妥善保存，不要公开分享

这个页面是微信读书官方的 Skill 配置页面，用于连接微信读书账号，让 AI 助手读取用户授权范围内的阅读信息。

### 如何保存 API key

不要把 API key 写进：

- 聊天消息
- skill 文件
- README
- 分享包
- 输出文档

推荐方式一：保存到本地文本文件，然后告诉 Codex 文件路径。

示例：

```text
~/Documents/weread_api_key.txt
```

运行脚本时可以使用：

```bash
node scripts/weread_api_export.mjs notebooks --api-key-file ~/Documents/weread_api_key.txt --out ./WeRead_Reading_Notes
```

推荐方式二：熟悉终端的用户可以用环境变量。

```bash
export WEREAD_API_KEY="your_api_key"
```

运行脚本时读取本地环境变量：

```bash
WEREAD_API_KEY="your_api_key" node scripts/weread_api_export.mjs notebooks --out ./WeRead_Reading_Notes
```

方式三：用户可以在一次性互动中把 API key 提供给 Codex。Codex 应只在当前操作中使用，不写入文件、不写入日志、不在回复中复述。

## 推荐输出目录

正式运行时建议输出到一个独立目录，例如：

```text
~/Documents/WeRead_Reading_Notes
```

推荐结构：

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

## 核心原则

### 1. 先保存，再分析

任何分析之前，必须先保存原始材料。

```text
输入 / 导出
-> API 原始证据
-> 原始 Markdown
-> 完整归档版
-> AI 投喂版
-> 单书个人模型
-> 跨书个人模型索引
-> 阶段性报告
-> 阅读上下文
```

### 2. 不把划线直接当成观点

用户原创想法、评论、批注是高证据。

纯划线只能说明用户注意到了某段内容，不能直接写成“用户认为”。

### 3. 时间分析只使用可靠时间戳

微信读书里通常只有“想法 / 评论”有时间戳，纯划线没有时间戳。

因此：

- 有时间戳的想法：可用于关注点流变
- 配对原文：作为该时间点上下文
- 纯划线：只作为非时间性注意力证据

### 4. 文件数量完成不等于分析完成

跨书索引和阶段报告不能只是统计数量。

高质量报告应包含：

- 证据分布
- 时间流变
- 表达习惯
- 张力和反例
- 稳定假设
- 低置信结论
- 对未来 AI 协作的建议

### 5. 阅读上下文只作为参考

书架、阅读进度、阅读时长、阅读偏好统计可以帮助理解一个阶段的阅读状态。

但它们不是用户观点本身：

- 用户写下的想法：可以作为明确观点证据
- 用户划线：可以作为注意力证据
- 书架和阅读统计：只能作为阅读行为背景

例如，某本书读到 8% 且笔记很少，可能说明材料不足，不应直接判断用户对这本书没有兴趣。

## 常用脚本

列出有笔记的书：

```bash
node scripts/weread_api_export.mjs notebooks --api-key-file ~/Documents/weread_api_key.txt --out ./WeRead_Reading_Notes
```

导出单本书：

```bash
WEREAD_API_KEY="your_api_key" node scripts/weread_api_export.mjs export-book --book-id <book_id> --out ./WeRead_Reading_Notes
```

导出前 N 本：

```bash
WEREAD_API_KEY="your_api_key" node scripts/weread_api_export.mjs export-first --count 5 --out ./WeRead_Reading_Notes
```

导出书架统计：

```bash
node scripts/weread_api_export.mjs shelf --api-key-file ~/Documents/weread_api_key.txt --out ./WeRead_Reading_Notes
```

导出整体阅读统计：

```bash
node scripts/weread_api_export.mjs reading-stats --mode overall --api-key-file ~/Documents/weread_api_key.txt --out ./WeRead_Reading_Notes
```

导出单本书的阅读进度和元数据：

```bash
node scripts/weread_api_export.mjs book-context --book-id <book_id> --api-key-file ~/Documents/weread_api_key.txt --out ./WeRead_Reading_Notes
```

按书名搜索 bookId：

```bash
node scripts/weread_api_export.mjs search-book --keyword "书名" --api-key-file ~/Documents/weread_api_key.txt --out ./WeRead_Reading_Notes
```

这里的搜索不是主流程。它只是在用户不知道 `bookId`、但想按书名找书时使用。正常批量导出时，书架笔记列表通常已经包含 `bookId`。

检查阶段报告或跨书索引是否过浅：

```bash
node scripts/check_analysis_depth.mjs ./WeRead_Reading_Notes/07_stage_reports_阶段性报告/某个报告.md
```

## 迁移和分享

分享或迁移时复制整个 skill 目录：

```text
skills/weread-reading-notes/
```

接收方放到：

```text
~/.codex/skills/weread-reading-notes
```

分享前请确认：

- 不包含 API key
- 不包含用户私人读书笔记
- 不包含本机绝对路径
- 不包含 `.DS_Store` 等系统文件
- `SKILL.md`、`references/`、`scripts/`、`agents/` 都完整

## 适用场景

适合：

- 个人读书笔记归档
- 微信读书笔记迁移
- AI 可读材料整理
- 个人模型提取
- 长期阅读主题分析
- 阶段性关注点流变分析

不适合：

- 未经授权导出他人笔记
- 绕过微信读书访问控制
- 保存或分享账号密码、cookie、短信验证码或 API key
- 在没有证据边界的情况下生成强个人结论

## 版本状态

当前设计目标：

```text
标准、可复用、可迁移、可进化。
```

这个 skill 可以继续扩展，例如：

- 更强的批量归档脚本
- 更稳定的网页复制流程
- 更细的时间线报告
- 更完整的阅读上下文报告
- 更严格的分析质量检查
- 更好的 PKM 候选生成规则
