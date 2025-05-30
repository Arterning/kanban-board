import { useState, useEffect } from 'react';

interface ImageData {
  id: string;
  data: Blob;  // 直接存储 Blob 数据
  createTime: string;
}

function ImageTags() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

          const imageData: ImageData = {
            id: Math.random().toString(36).substr(2, 9),
            data: blob,
            createTime: new Date().toISOString(),
          };

          // 保存到 IndexedDB
          const transaction = db.transaction(['images'], 'readwrite');
          const store = transaction.objectStore('images');
          store.add(imageData);

          // 更新状态
          setImages(prev => [imageData, ...prev]);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [db]);

  // 图片预览弹窗
  const ImagePreview = () => {
    if (!previewImage) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer"
        onClick={() => setPreviewImage(null)}
      >
        <img 
          src={previewImage} 
          alt="预览图片" 
          className="max-w-[90%] max-h-[90vh] object-contain"
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8">
      <ImagePreview />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">图片标签</h1>
        <p className="text-gray-400">按 Ctrl+V 粘贴图片</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="bg-columnBackgroundColor rounded-lg overflow-hidden">
            <div className="relative group">
              <img
                src={URL.createObjectURL(image.data)}
                alt="粘贴的图片"
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setPreviewImage(URL.createObjectURL(image.data))}
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