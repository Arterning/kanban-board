import React from 'react';
import { Link } from 'react-router-dom';
import TypeScriptSvg from './assets/typescript.svg';
import JsonSvg from './assets/json.svg';

// 示例 SVG 图标
// const JsonSvg = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
//   </svg>
// );

// const CodeSvg = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
//   </svg>
// );

// 模拟根据输入的 JSON 生成对应的 TypeScript 类型定义的函数
// const generateTypesFromJson = (json: string) => {
//   try {
//     const parsed = JSON.parse(json);
//     // 这里可以实现具体的生成逻辑
//     return 'Generated TypeScript types will be shown here';
//   } catch (error) {
//     return 'Invalid JSON';
//   }
// };

const ToolPage: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
        <div className="flex flex-wrap gap-4 justify-start p-8">
        {/* JSON 格式化卡片 */}
        <Link to="/json-formatter" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
            <img src={JsonSvg} className="w-12 h-12 mb-4 text-white" />
            <h3 className="text-lg font-semibold text-white">JSON 格式化</h3>
        </Link>
        {/* 代码生成卡片 */}
        <Link to="/code-generator" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
            <img src={TypeScriptSvg} alt="TypeScript" className="w-12 h-12 mb-4" />
            <h3 className="text-lg font-semibold text-white">Typescript类型生成</h3>
        </Link>

        <Link to="/markdown-tools" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
          <img src={TypeScriptSvg} alt="TypeScript" className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-semibold text-white">富文本语法</h3>
        </Link>
        </div>
        
    </div>
  );
};

export default ToolPage;