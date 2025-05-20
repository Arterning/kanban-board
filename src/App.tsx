import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import KanbanBoard from "./components/KanbanBoard";
import JsonFormatter from "./components/JsonFormatter";
import Notes from "./components/Notes";
import ToolPage from './ToolPage';
import CodeGenerator from "./components/CodeGenerator";
import MarkdownTools from "./components/MarkdownTools";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <nav className="bg-mainBackgroundColor p-4 border-b border-columnBackgroundColor">
          <div className="container mx-auto flex items-center justify-start gap-6">
            <Link to="/" className="text-white hover:text-rose-500 font-semibold">
              首页
            </Link>
            <Link to="/tools" className="text-white hover:text-rose-500 font-semibold">
              工具
            </Link>
            <Link to="/notes" className="text-white hover:text-rose-500 font-semibold">
              便签
            </Link>
            <Link to="/markdown-tools" className="text-white hover:text-rose-500 font-semibold">
              Markdown工具
            </Link>
          </div>
        </nav>
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<KanbanBoard />} />
            <Route path="/tools" element={<ToolPage />} />
            <Route path="/code-generator" element={<CodeGenerator />} />
            <Route path="/json-formatter" element={<JsonFormatter />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/markdown-tools" element={<MarkdownTools />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
