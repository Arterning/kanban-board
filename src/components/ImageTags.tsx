import { useState, useEffect } from 'react';

interface ImageData {
  id: string;
  data: string;  // base64 格式的图片数据
  createTime: string;
}

function ImageTags() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // 初始化 IndexedDB
  useEffect(() => {
    const request = indexedDB.open('ImageTagsDB', 1);

    request.onerror = (event) => {
      console.error('数据库打开失败');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      setDb(db);
      loadImages(db);
    };
  }, []);

  // 从数据库加载图片
  const loadImages = (database: IDBDatabase) => {
    const transaction = database.transaction(['images'], 'readonly');
    const store = transaction.objectStore('images');
    const request = store.getAll();

    request.onsuccess = () => {
      setImages(request.result);
    };
  };

  // 处理粘贴事件
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items || !db) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (!blob) continue;

          // 将 Blob 转换为 base64
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData: ImageData = {
              id: Math.random().toString(36).substr(2, 9),
              data: e.target?.result as string,
              createTime: new Date().toISOString(),
            };

            // 保存到 IndexedDB
            const transaction = db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            store.add(imageData);

            // 更新状态
            setImages(prev => [imageData, ...prev]);
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [db]);

  // 删除图片
  const deleteImage = (id: string) => {
    if (!db) return;

    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    store.delete(id);

    setImages(images.filter(img => img.id !== id));
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">图片标签</h1>
        <p className="text-gray-400">按 Ctrl+V 粘贴图片</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="bg-columnBackgroundColor rounded-lg overflow-hidden">
            <div className="relative group">
              <img
                src={image.data}
                alt="粘贴的图片"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => deleteImage(image.id)}
                className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                删除
              </button>
            </div>
            <div className="p-3">
              <p className="text-gray-400 text-sm">
                创建时间: {new Date(image.createTime).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          还没有图片，请粘贴一些图片
        </div>
      )}
    </div>
  );
}

export default ImageTags;