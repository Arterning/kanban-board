import React from 'react';
import { Link } from 'react-router-dom';
import TypeScriptSvg from './assets/typescript.svg';
import JsonSvg from './assets/json.svg';
import LifeSvg from './assets/life.svg';
import { DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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
          <DocumentTextIcon className="w-12 h-12 mb-4 text-white" />
          <h3 className="text-lg font-semibold text-white">富文本语法</h3>
        </Link>
        <Link to="/life-progress" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
          <img src={LifeSvg} alt="Life Progress" className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-semibold text-white">人生进度</h3>
        </Link>
        <Link to="/base64-converter" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
          <ShieldCheckIcon className="w-12 h-12 mb-4 text-white" />
          <h3 className="text-lg font-semibold text-white">Base64</h3>
        </Link>
        <Link to="/base32-converter" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
          <ShieldCheckIcon className="w-12 h-12 mb-4 text-white" />
          <h3 className="text-lg font-semibold text-white">Base32</h3>
        </Link>
        <Link to="/url-converter" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
          <ShieldCheckIcon className="w-12 h-12 mb-4 text-white" />
          <h3 className="text-lg font-semibold text-white">URL</h3>
        </Link>
        <Link to="/aes-converter" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
          <ShieldCheckIcon className="w-12 h-12 mb-4 text-white" />
          <h3 className="text-lg font-semibold text-white">AES</h3>
        </Link>
        <Link to="/sha256-hasher" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
          <ShieldCheckIcon className="w-12 h-12 mb-4 text-white" />
          <h3 className="text-lg font-semibold text-white">SHA-256</h3>
        </Link>
        <Link to="/rsa-converter" className="flex flex-col items-center p-6 bg-columnBackgroundColor rounded-lg shadow-md hover:shadow-lg transition-shadow w-64">
          <ShieldCheckIcon className="w-12 h-12 mb-4 text-white" />
          <h3 className="text-lg font-semibold text-white">RSA</h3>
        </Link>
        </div>
        
    </div>
  );
};

export default ToolPage;