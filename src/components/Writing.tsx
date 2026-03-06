import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

// ──────────────────────────────────────────────
// WeChat HTML converter
// ──────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text: string): string {
  return text
    // Image（先处理，避免被 link 规则误匹配）
    .replace(
      /!\[([^\]]*)\]\(([^)]*)\)/g,
      '<img src="$2" alt="$1" style="max-width:100%;display:block;margin:12px auto;border-radius:4px;">'
    )
    // Link
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:#576b95;text-decoration:none;">$1</a>'
    )
    // Bold + Italic
    .replace(
      /\*\*\*(.+?)\*\*\*/g,
      '<strong style="font-weight:bold;"><em style="font-style:italic;">$1</em></strong>'
    )
    // Bold
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong style="font-weight:bold;color:#1a1a1a;">$1</strong>'
    )
    // Italic
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;color:#555;">$1</em>')
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;font-family:Consolas,monospace;font-size:13px;color:#e74c3c;">$1</code>'
    );
}

function markdownToWechat(md: string): string {
  const lines = md.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Code block ──
    if (line.startsWith("```")) {
      let code = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code += lines[i] + "\n";
        i++;
      }
      result.push(
        `<section style="background:#23241f;padding:16px;border-radius:8px;margin:16px 0;overflow-x:auto;">` +
          `<code style="color:#f8f8f2;font-family:Consolas,'Courier New',monospace;font-size:13px;line-height:1.6;white-space:pre-wrap;display:block;">` +
          `${escapeHtml(code.trimEnd())}` +
          `</code></section>`
      );
      i++;
      continue;
    }

    // ── Headings ──
    if (line.startsWith("# ")) {
      result.push(
        `<h1 style="font-size:22px;font-weight:bold;color:#1a1a1a;margin:20px 0 12px;padding-bottom:8px;border-bottom:2px solid #07C160;line-height:1.5;text-align:center;">` +
          `${parseInline(line.slice(2))}</h1>`
      );
    } else if (line.startsWith("## ")) {
      result.push(
        `<h2 style="font-size:19px;font-weight:bold;color:#1a1a1a;margin:18px 0 8px;padding-left:10px;border-left:4px solid #07C160;line-height:1.5;">` +
          `${parseInline(line.slice(3))}</h2>`
      );
    } else if (line.startsWith("### ")) {
      result.push(
        `<h3 style="font-size:16px;font-weight:bold;color:#1a1a1a;margin:14px 0 6px;line-height:1.5;">` +
          `${parseInline(line.slice(4))}</h3>`
      );
    }
    // ── Blockquote ──
    else if (line.startsWith("> ")) {
      result.push(
        `<blockquote style="border-left:4px solid #07C160;padding:10px 16px;background:#f0faf4;color:#555;margin:14px 0;border-radius:0 4px 4px 0;font-size:15px;line-height:1.75em;">` +
          `${parseInline(line.slice(2))}</blockquote>`
      );
    }
    // ── Horizontal rule ──
    else if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      result.push(`<hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0;">`);
    }
    // ── Unordered list ──
    else if (/^[-*+] /.test(line)) {
      let listHtml = `<ul style="padding-left:28px;margin:10px 0;list-style-type:disc;">`;
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        listHtml += `<li style="font-size:15px;color:#3d3d3d;line-height:1.75em;margin:4px 0;">${parseInline(lines[i].slice(2))}</li>`;
        i++;
      }
      listHtml += "</ul>";
      result.push(listHtml);
      continue;
    }
    // ── Ordered list ──
    else if (/^\d+\. /.test(line)) {
      let listHtml = `<ol style="padding-left:28px;margin:10px 0;list-style-type:decimal;">`;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listHtml += `<li style="font-size:15px;color:#3d3d3d;line-height:1.75em;margin:4px 0;">${parseInline(lines[i].replace(/^\d+\. /, ""))}</li>`;
        i++;
      }
      listHtml += "</ol>";
      result.push(listHtml);
      continue;
    }
    // ── Empty line ──
    else if (line.trim() === "") {
      // skip — blank lines are just separators
    }
    // ── Paragraph ──
    else {
      result.push(
        `<p style="font-size:15px;color:#3d3d3d;line-height:1.75em;margin:0 0 14px;word-wrap:break-word;">` +
          `${parseInline(line)}</p>`
      );
    }

    i++;
  }

  // Wrap in WeChat outer section with inline font/layout styles
  return (
    `<section style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',STHeiti,'Microsoft Yahei',Tahoma,sans-serif;` +
    `font-size:15px;color:#3d3d3d;line-height:1.75em;padding:24px 20px;max-width:677px;margin:0 auto;">` +
    result.join("\n") +
    `</section>`
  );
}

// ──────────────────────────────────────────────
// Default sample content
// ──────────────────────────────────────────────

const DEFAULT_CONTENT = `# 文章标题

在这里写你的文章摘要，简短介绍核心内容。

## 第一部分

正文内容支持 **加粗**、*斜体*、\`行内代码\` 等基础格式。

> 这是一段引用文字，适合用来突出重点或引用他人观点。

## 第二部分

有序列表：

1. 第一步
2. 第二步
3. 第三步

无序列表：

- 要点一
- 要点二
- 要点三

## 代码示例

\`\`\`javascript
const greet = (name) => {
  console.log(\`Hello, \${name}!\`);
};

greet('世界');
\`\`\`

---

感谢阅读！
`;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const NAV_HEIGHT = 64;
const TOOLBAR_HEIGHT = 40;

export default function Writing() {
  const [markdown, setMarkdown] = useState(DEFAULT_CONTENT);
  const [copied, setCopied] = useState(false);

  const wechatHtml = markdownToWechat(markdown);

  const handleCopy = async () => {
    try {
      // 以 text/html 格式写入剪贴板，粘贴到富文本编辑器时会渲染为 HTML 而非纯文本
      const blob = new Blob([wechatHtml], { type: "text/html" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": blob })]);
    } catch {
      // 降级：直接复制 HTML 字符串
      await navigator.clipboard.writeText(wechatHtml).catch(() => {
        const el = document.createElement("textarea");
        el.value = wechatHtml;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      });
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const editorHeight = `calc(100vh - ${NAV_HEIGHT + TOOLBAR_HEIGHT}px)`;

  return (
    <div
      className="flex flex-col"
      style={{ height: `calc(100vh - ${NAV_HEIGHT}px)` }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 border-b border-gray-700 bg-columnBackgroundColor flex-shrink-0"
        style={{ height: TOOLBAR_HEIGHT }}
      >
        <span className="text-gray-400 text-sm">
          左侧编写 Markdown · 右侧实时预览微信公众号效果
        </span>
        <button
          onClick={handleCopy}
          className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 text-sm transition-colors font-medium"
        >
          {copied ? "✓ 已复制" : "复制 HTML"}
        </button>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Markdown Editor */}
        <div className="w-1/2 overflow-hidden" data-color-mode="dark">
          <MDEditor
            value={markdown}
            onChange={(val) => setMarkdown(val ?? "")}
            preview="edit"
            height={editorHeight}
            visibleDragbar={false}
            style={{ borderRadius: 0 }}
          />
        </div>

        {/* Right: WeChat Preview */}
        <div className="w-1/2 flex flex-col overflow-hidden border-l border-gray-700">
          <div className="text-xs text-gray-500 px-3 py-1.5 bg-gray-100 border-b border-gray-200 flex-shrink-0">
            微信公众号预览
          </div>
          <div
            className="flex-1 overflow-y-auto bg-white"
            dangerouslySetInnerHTML={{ __html: wechatHtml }}
          />
        </div>
      </div>
    </div>
  );
}
