import React, { useState } from 'react';

interface TypeDefinition {
  name: string;
  type: string;
}

const CodeGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generateTypes = () => {
    try {
      const parsed = JSON.parse(input);
      const types = generateTypeDefinitions(parsed);
      setOutput(types);
      setError('');
    } catch (e) {
      setError('非法的 JSON 格式');
      setOutput('');
    }
  };

  const generateTypeDefinitions = (obj: any, interfaceName: string = 'Root'): string => {
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 'any[]';
      const itemType = generateTypeDefinitions(obj[0], `${interfaceName}Item`);
      return `${itemType}[]`;
    }

    if (typeof obj === 'object' && obj !== null) {
      const properties = Object.entries(obj).map(([key, value]) => {
        const propertyType = typeof value === 'object' && value !== null
          ? generateTypeDefinitions(value, `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}`)
          : typeof value;
        return `  ${key}: ${propertyType};`;
      });

      return `interface ${interfaceName} {\n${properties.join('\n')}\n}`;
    }

    return typeof obj;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">JSON 转 TypeScript 类型定义</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label className="text-white mb-2">输入 JSON：</label>
          <textarea
            className="w-full h-[200px] p-4 rounded-lg bg-columnBackgroundColor text-white border border-columnBackgroundColor focus:outline-none focus:border-rose-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入 JSON 字符串..."
          />
        </div>
        
        <button
          onClick={generateTypes}
          className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors w-fit"
        >
          生成类型定义
        </button>

        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}

        {output && (
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-white">生成的类型定义：</label>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  copySuccess 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {copySuccess ? '已复制！' : '复制'}
              </button>
            </div>
            <pre className="w-full min-h-[200px] p-4 rounded-lg bg-columnBackgroundColor text-white border border-columnBackgroundColor whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;