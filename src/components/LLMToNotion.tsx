import { useState } from "react";

function LLMToNotion() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function cleanLaTeX(text: string): string {
    let cleaned = text;
    cleaned = cleaned.replace(/\\\[([\s\S]*?)\\\]/g, '\n$$\n$1\n$$\n');
    cleaned = cleaned.replace(/\\\(([\s\S]*?)\\\)/g, '$$1$');
    cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, (_match, p1: string) => {
      return p1.replace(/\\%/g, '%').replace(/\\_/g, '_');
    });
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned;
  }

  const handleProcess = async () => {
    const result = cleanLaTeX(input);
    setOutput(result);
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback: user can copy manually
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">LLM to Notion</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label className="text-white mb-2">输入 LLM 输出的文本：</label>
          <textarea
            className="w-full h-[300px] p-4 rounded-lg bg-columnBackgroundColor text-white border border-columnBackgroundColor focus:outline-none focus:border-rose-500 resize-y"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="贴入 Gemini / ChatGPT 等 LLM 的回复..."
          />
        </div>

        <button
          onClick={handleProcess}
          className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors w-fit"
        >
          清洗并复制到剪贴板
        </button>

        {copied && (
          <div className="text-green-500 mt-2">
            已清洗并复制！可直接在 Notion 中粘贴 (Ctrl+V)。
          </div>
        )}

        {output && (
          <div className="flex flex-col">
            <label className="text-white mb-2">清洗结果：</label>
            <pre className="w-full min-h-[200px] p-4 rounded-lg bg-columnBackgroundColor text-white border border-columnBackgroundColor whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default LLMToNotion;
