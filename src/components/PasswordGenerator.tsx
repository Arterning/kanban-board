import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

// indexedDB 初始化
let db: IDBDatabase;
const initDB = () => {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('PasswordManager', 2); // 升级数据库版本

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('passwords')) {
        db.createObjectStore('passwords', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('masterPassword')) {
        db.createObjectStore('masterPassword', { keyPath: 'id', autoIncrement: false });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// 生成主密码哈希
const generateMasterPasswordHash = (password: string) => {
  return CryptoJS.PBKDF2(password, 'salt', { keySize: 512 / 32, iterations: 1000 }).toString();
};

// 保存主密码哈希
const saveMasterPasswordHash = (hash: string) => {
  const transaction = db.transaction(['masterPassword'], 'readwrite');
  const store = transaction.objectStore('masterPassword');
  store.put({ id: 1, hash });
};

// 获取主密码哈希
const getMasterPasswordHash = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const transaction = db.transaction(['masterPassword'], 'readonly');
    const store = transaction.objectStore('masterPassword');
    const request = store.get(1);

    request.onsuccess = () => {
      resolve(request.result?.hash || null);
    };
  });
};

// 重置数据库
const resetDatabase = () => {
  return new Promise<void>((resolve) => {
    const transaction = db.transaction(['passwords', 'masterPassword'], 'readwrite');
    transaction.objectStore('passwords').clear();
    transaction.objectStore('masterPassword').clear();
    transaction.oncomplete = () => resolve();
  });
};

function PasswordGenerator() {
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);
  const [password, setPassword] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPasswordInput, setShowMasterPasswordInput] = useState(true);
  const [newEntry, setNewEntry] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
    remark: '',
  });
  const [entries, setEntries] = useState<any[]>([]);
  const [viewPasswordId, setViewPasswordId] = useState<number | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [showResetWarning, setShowResetWarning] = useState(false);

  useEffect(() => {
    initDB().then(() => {
      getMasterPasswordHash().then((hash) => {
        setIsNewUser(!hash);
      });
    });
  }, []);

  const generatePassword = () => {
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let chars = letters;
    if (includeNumbers) chars += numbers;
    if (includeSpecialChars) chars += specialChars;

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      generatedPassword += chars[randomIndex];
    }

    setPassword(generatedPassword);
    setNewEntry({ ...newEntry, password: generatedPassword });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const encryptData = (data: string): string => {
    return CryptoJS.AES.encrypt(data, masterPassword).toString();
  };

  const decryptData = (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, masterPassword);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const saveEntry = () => {
    if (!masterPassword) return;

    const transaction = db.transaction(['passwords'], 'readwrite');
    const store = transaction.objectStore('passwords');
    const encryptedEntry = {
      ...newEntry,
      password: encryptData(newEntry.password),
    };

    store.add(encryptedEntry);

    transaction.oncomplete = () => {
      loadEntries();
      setNewEntry({ 
        name: '', 
        url: '', 
        username: '', 
        password: '', 
        remark: '' 
      });
    };
  };

  const loadEntries = () => {
    if (!masterPassword) return;

    const transaction = db.transaction(['passwords'], 'readonly');
    const store = transaction.objectStore('passwords');
    const request = store.getAll();

    request.onsuccess = () => {
      setEntries(request.result);
    };
  };

  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewUser) {
      const hash = generateMasterPasswordHash(masterPassword);
      saveMasterPasswordHash(hash);
      setShowMasterPasswordInput(false);
      return;
    }

    const storedHash = await getMasterPasswordHash();
    const inputHash = generateMasterPasswordHash(masterPassword);
    if (storedHash === inputHash) {
      setShowMasterPasswordInput(false);
      loadEntries();
    } else {
      alert('主密码错误，请重试或选择重置密码。');
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm('重置密码将删除所有保存的密码数据，确认要重置吗？')) {
      await resetDatabase();
      setMasterPassword('');
      setIsNewUser(true);
      setShowMasterPasswordInput(true);
      setEntries([]);
    }
  };

  const exportPasswords = () => {
    if (!masterPassword) return;

    const transaction = db.transaction(['passwords'], 'readonly');
    const store = transaction.objectStore('passwords');
    const request = store.getAll();

    request.onsuccess = () => {
      const data = JSON.stringify(request.result);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'passwords.json';
      a.click();
      URL.revokeObjectURL(url);
    };
  };

  const importPasswords = async (file: File) => {
    if (!masterPassword) return;

    try {
      const data = await file.text();
      const entries = JSON.parse(data);
      const transaction = db.transaction(['passwords'], 'readwrite');
      const store = transaction.objectStore('passwords');
      entries.forEach((entry: any) => store.add(entry));
      transaction.oncomplete = () => loadEntries();
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查文件格式。');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importPasswords(file);
    }
  };

  // 添加删除密码的函数
  const deleteEntry = (id: number) => {
    if (!masterPassword) return;
    const transaction = db.transaction(['passwords'], 'readwrite');
    const store = transaction.objectStore('passwords');
    store.delete(id);
    transaction.oncomplete = () => loadEntries();
  };

  return (
    <div className="container mx-auto p-8">
      {showMasterPasswordInput ? ( 
        <form onSubmit={handleMasterPasswordSubmit} className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold mb-6">
            {isNewUser ? '请设置主密码' : '请输入主密码'}
          </h1>
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="主密码"
            className="bg-columnBackgroundColor text-white p-2 rounded"
          />
          {!isNewUser && (
            <button
              type="button"
              onClick={() => setShowResetWarning(true)}
              className="text-rose-500 hover:underline"
            >
              重置密码
            </button>
          )}
          <button
            type="submit"
            className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600"
          >
            {isNewUser ? '设置' : '确认'}
          </button>
        </form>
      ) : ( 
        <> 
          <h1 className="text-3xl font-bold mb-6">密码生成器</h1>
          
          <div className="flex-col gap-4">
            <div className="flex gap-2">
              <label className="text-white">
                密码长度: {length}
              </label>
              <input
                type="range"
                min="6"
                max="32"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-1/2"
              />
              <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-rose-500"
                />
                包含数字
              </label>

              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={includeSpecialChars}
                  onChange={(e) => setIncludeSpecialChars(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-rose-500"
                />
                包含特殊字符
              </label>
            </div>
            <button
              onClick={generatePassword}
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors w-fit"
            >
              生成密码
            </button>
            </div>

            

            

            {password && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-white">生成的密码：</label>
                  <button
                    onClick={() => handleCopy(password)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      copySuccess 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-rose-500 hover:bg-rose-600' 
                    }`}
                  >
                    {copySuccess ? '已复制！' : '复制'}
                  </button>
                </div>
                <div className="w-full p-4 rounded-lg bg-columnBackgroundColor text-white border border-columnBackgroundColor">
                  {password}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">保存密码</h2>
              <div className="flex flex-row gap-2">
                <input
                  type="text"
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  placeholder="名称"
                  className="bg-columnBackgroundColor text-white p-2 rounded"
                />
                <input
                  type="text"
                  value={newEntry.url}
                  onChange={(e) => setNewEntry({ ...newEntry, url: e.target.value })}
                  placeholder="URL"
                  className="bg-columnBackgroundColor text-white p-2 rounded"
                />
                <input
                  type="text"
                  value={newEntry.username}
                  onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                  placeholder="用户名"
                  className="bg-columnBackgroundColor text-white p-2 rounded"
                />
                <input
                  type="password"
                  value={newEntry.password}
                  onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                  placeholder="密码"
                  className="bg-columnBackgroundColor text-white p-2 rounded"
                />
                <input
                  type="text"
                  value={newEntry.remark}
                  onChange={(e) => setNewEntry({ ...newEntry, remark: e.target.value })}
                  placeholder="备注"
                  className="bg-columnBackgroundColor text-white p-2 rounded"
                />
                <button
                  onClick={saveEntry}
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600"
                >
                  保存密码
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">密码管理</h2>
              <div className="flex gap-4 mb-4">
              <button
                onClick={exportPasswords}
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600"
              >
                导出密码
              </button>
              <label className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 cursor-pointer">
                导入密码
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-columnBackgroundColor p-2 text-white">名称</th>
                    <th className="border border-columnBackgroundColor p-2 text-white">URL</th>
                    <th className="border border-columnBackgroundColor p-2 text-white">用户名</th>
                    <th className="border border-columnBackgroundColor p-2 text-white">密码</th>
                    <th className="border border-columnBackgroundColor p-2 text-white">备注</th>
                    <th className="border border-columnBackgroundColor p-2 text-white">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="border border-columnBackgroundColor p-2 text-white">{entry.name}</td>
                      <td className="border border-columnBackgroundColor p-2 text-white">{entry.url}</td>
                      <td className="border border-columnBackgroundColor p-2 text-white">{entry.username}</td>
                      <td className="border border-columnBackgroundColor p-2 text-white">
                        {viewPasswordId === entry.id ? (
                          decryptData(entry.password)
                        ) : (
                          '******'
                        )}
                      </td>
                      <td className="border border-columnBackgroundColor p-2 text-white">{entry.remark}</td>
                      <td className="border border-columnBackgroundColor p-2 text-white">
                        <button
                          onClick={() => setViewPasswordId(viewPasswordId === entry.id ? null : entry.id)}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          {viewPasswordId === entry.id ? '隐藏' : '查看'}
                        </button>
                        <button
                          onClick={() => handleCopy(decryptData(entry.password))}
                          className="ml-2 text-green-500 hover:text-green-400"
                        >
                          复制
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('确认要删除这个密码项吗？')) {
                              deleteEntry(entry.id);
                            }
                          }}
                          className="ml-2 text-rose-500 hover:text-rose-400"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {
        showResetWarning && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="mb-4">重置密码将删除所有保存的密码数据，确认要重置吗？</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowResetWarning(false)}
                  className="px-3 py-1 bg-gray-500 text-white rounded"
                >
                  取消
                </button>
                <button
                  onClick={handleResetPassword}
                  className="px-3 py-1 bg-rose-500 text-white rounded"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default PasswordGenerator;