import { useEffect, useState } from "react";
import { Note } from "../types";


function generateId() {
    /* Generate a random number between 0 and 10000 */
    return Math.floor(Math.random() * 10001);
}


const defaultNotes: Note[] = [
  {
    id: "1",
    type: "工作",
    content: "完成项目文档",
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  },
];

function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      return JSON.parse(savedNotes);
    }
    return defaultNotes;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [newNote, setNewNote] = useState({ type: "", content: "" });
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState({ type: "", content: "" });

  const notesPerPage = 20;
  const totalPages = Math.ceil(notes.length / notesPerPage);
  const currentNotes = notes.slice(
    (currentPage - 1) * notesPerPage,
    currentPage * notesPerPage
  );

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.type || !newNote.content) return;

    const now = new Date().toISOString();
    const note: Note = {
      id: generateId().toString(),
      ...newNote,
      createTime: now,
      updateTime: now,
    };

    setNotes([note, ...notes]);
    setNewNote({ type: "", content: "" });
  };

  const updateNote = (id: string) => {
    if (!editContent.type || !editContent.content) return;

    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              ...editContent,
              updateTime: new Date().toISOString(),
            }
          : note
      )
    );
    setIsEditing(null);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">便签</h1>
      
      {/* 添加便签表单 */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="类型"
          className="bg-columnBackgroundColor text-white p-2 rounded"
          value={newNote.type}
          onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
        />
        <input
          type="text"
          placeholder="内容"
          className="bg-columnBackgroundColor text-white p-2 rounded flex-1"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        />
        <button
          onClick={addNote}
          className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
        >
          添加便签
        </button>
      </div>

      {/* 便签列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentNotes.map((note) => (
          <div
            key={note.id}
            className="bg-columnBackgroundColor rounded-lg p-4 break-words"
          >
            {isEditing === note.id ? (
              // 编辑模式
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editContent.type}
                  onChange={(e) =>
                    setEditContent({ ...editContent, type: e.target.value })
                  }
                  className="bg-mainBackgroundColor text-white p-2 rounded"
                />
                <input
                  type="text"
                  value={editContent.content}
                  onChange={(e) =>
                    setEditContent({ ...editContent, content: e.target.value })
                  }
                  className="bg-mainBackgroundColor text-white p-2 rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateNote(note.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditing(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 显示模式
              <>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-semibold">{note.type}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(note.id);
                        setEditContent({
                          type: note.type,
                          content: note.content,
                        });
                      }}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-rose-500 hover:text-rose-400"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p className="text-white mb-2 truncate">{note.content}</p>
                <div className="text-gray-400 text-sm">
                  <p>创建时间: {new Date(note.createTime).toLocaleString()}</p>
                  <p>更新时间: {new Date(note.updateTime).toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-rose-500 text-white rounded disabled:bg-gray-500"
          >
            上一页
          </button>
          <span className="px-4 py-2 text-white">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-rose-500 text-white rounded disabled:bg-gray-500"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}

export default Notes;