import React, { useState } from 'react';

const emojis = [
  { emoji: '😀', description: '笑脸' },
  { emoji: '👍', description: '点赞' },
  { emoji: '❤️', description: '红心' },
  { emoji: '🎉', description: '庆祝' },
  { emoji: '🚀', description: '火箭' },
  { emoji: '✨', description: '闪烁' },
  { emoji: '🔥', description: '火焰' },
  { emoji: '👀', description: '眼睛' },
  { emoji: '💡', description: '灵感' },
  { emoji: '⭐', description: '星星' },
];

const markdownSyntax = [
  {
    title: '标题',
    syntax: '# 一级标题\n## 二级标题\n### 三级标题',
  },
  {
    title: '强调',
    syntax: '**粗体文本**\n*斜体文本*\n~~删除线~~',
  },
  {
    title: '列表',
    syntax: '- 无序列表项\n1. 有序列表项',
  },
  {
    title: '链接和图片',
    syntax: '[链接文本](URL)\n![图片描述](图片URL)',
  },
  {
    title: '表格',
    syntax: '| 表头1 | 表头2 |\n| --- | --- |\n| 单元格1 | 单元格2 |',
  },
  {
    title: '代码',
    syntax: '`行内代码`\n\n```\n代码块\n```',
  },
];

const MarkdownTools: React.FC = () => {
  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${type}已复制！`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Markdown 工具</h1>

      {/* Emoji 部分 */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-white">常用 Emoji</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {emojis.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCopy(item.emoji, 'Emoji')}
              className="bg-columnBackgroundColor p-4 rounded-lg hover:bg-opacity-80 transition-colors flex items-center justify-between"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-white ml-2">{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Markdown 语法部分 */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Markdown 语法</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {markdownSyntax.map((item, index) => (
            <div
              key={index}
              className="bg-columnBackgroundColor rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-white">{item.title}</h3>
                <button
                  onClick={() => handleCopy(item.syntax, item.title)}
                  className="bg-rose-500 text-white px-3 py-1 rounded hover:bg-rose-600 text-sm"
                >
                  复制
                </button>
              </div>
              <pre className="bg-mainBackgroundColor p-3 rounded text-white whitespace-pre-wrap">
                {item.syntax}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* 复制成功提示 */}
      {copySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {copySuccess}
        </div>
      )}
    </div>
  );
};

export default MarkdownTools;