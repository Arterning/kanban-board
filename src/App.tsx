import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import KanbanBoard from "./components/KanbanBoard";
import JsonFormatter from "./components/JsonFormatter";
import Notes from "./components/Notes";
import ToolPage from './ToolPage';
import CodeGenerator from "./components/CodeGenerator";
import MarkdownTools from "./components/MarkdownTools";
import Bookmarks from "./components/Bookmarks";
import ImageTags from "./components/ImageTags";
import ColorPalette from "./components/ColorPalette";
import PasswordGenerator from "./components/PasswordGenerator";
import LandingPage from "./components/LandingPage";

// 创建一个导航组件来使用 useLocation
const Navigation = () => {
  const location = useLocation();
  
  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `text-white hover:text-rose-500 font-semibold transition-colors ${
      isActive ? 'text-rose-500 border-b-2 border-rose-500' : ''
    }`;
  };

  return (
    <nav className="bg-mainBackgroundColor p-4 border-b border-columnBackgroundColor">
      <div className="container mx-auto flex items-center justify-start gap-6">
        <Link to="/" className={getNavLinkClass('/')}>
          首页
        </Link>
        <Link to="/tools" className={getNavLinkClass('/tools')}>
          工具
        </Link>
        <Link to="/notes" className={getNavLinkClass('/notes')}>
          便签
        </Link>
        
        <Link to="/bookmarks" className={getNavLinkClass('/bookmarks')}>
          书签
        </Link>
        <Link to="/image-tags" className={getNavLinkClass('/image-tags')}>
          图片
        </Link>
        <Link to="/color-palette" className={getNavLinkClass('/color-palette')}>
          调色板
        </Link>
        <Link to="/password-generator" className={getNavLinkClass('/password-generator')}>
          密码管理
        </Link>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/tools" element={<ToolPage />} />
            <Route path="/code-generator" element={<CodeGenerator />} />
            <Route path="/json-formatter" element={<JsonFormatter />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/markdown-tools" element={<MarkdownTools />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/image-tags" element={<ImageTags />} />
            <Route path="/color-palette" element={<ColorPalette />} />
            <Route path="/password-generator" element={<PasswordGenerator />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
