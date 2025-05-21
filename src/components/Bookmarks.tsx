import React, { useState, useEffect } from 'react';

interface Bookmark {
  id: string;
  category: string;
  name: string;
  url: string;
  createTime: string;
}

const defaultBookmarks: Bookmark[] = [
  {
    id: '1',
    category: '开发工具',
    name: 'GitHub',
    url: 'https://github.com',
    createTime: new Date().toISOString(),
  },
];

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : defaultBookmarks;
  });

  const [newBookmark, setNewBookmark] = useState({
    category: '',
    name: '',
    url: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = () => {
    if (!newBookmark.name || !newBookmark.url) return;

    const bookmark: Bookmark = {
      id: Math.random().toString(36).substr(2, 9),
      ...newBookmark,
      createTime: new Date().toISOString(),
    };

    setBookmarks([bookmark, ...bookmarks]);
    setNewBookmark({ category: '', name: '', url: '' });
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bookmark.category.toLowerCase().includes(searchLower) ||
      bookmark.name.toLowerCase().includes(searchLower) ||
      bookmark.url.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col gap-6">
        {/* 搜索栏 */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索书签..."
            className="bg-columnBackgroundColor text-white p-2 rounded flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 添加书签表单 */}
        <div className="flex gap-2 items-center bg-columnBackgroundColor p-4 rounded">
          <input
            type="text"
            placeholder="分类"
            className="bg-mainBackgroundColor text-white p-2 rounded w-32"
            value={newBookmark.category}
            onChange={(e) => setNewBookmark({ ...newBookmark, category: e.target.value })}
          />
          <input
            type="text"
            placeholder="名称"
            className="bg-mainBackgroundColor text-white p-2 rounded w-48"
            value={newBookmark.name}
            onChange={(e) => setNewBookmark({ ...newBookmark, name: e.target.value })}
          />
          <input
            type="url"
            placeholder="URL"
            className="bg-mainBackgroundColor text-white p-2 rounded flex-1"
            value={newBookmark.url}
            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
          />
          <button
            onClick={addBookmark}
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
          >
            添加
          </button>
        </div>

        {/* 书签列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-columnBackgroundColor p-3 rounded flex items-center gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-mainBackgroundColor text-gray-300 px-2 py-1 rounded">
                    {bookmark.category}
                  </span>
                  <h3 className="text-white font-medium truncate">{bookmark.name}</h3>
                </div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm truncate block"
                >
                  {bookmark.url}
                </a>
              </div>
              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="text-rose-500 hover:text-rose-400"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Bookmarks;