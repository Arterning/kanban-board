import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import Papa from 'papaparse';
import { db } from '../db/csvDatabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Upload, FileText, Trash2 } from 'lucide-react';

export default function CSVManager() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  // 从IndexedDB获取所有CSV文件
  const csvFiles = useLiveQuery(() => db.csvFiles.orderBy('uploadDate').reverse().toArray());

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.name.endsWith('.csv')) {
      alert('只支持CSV文件格式');
      return;
    }

    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const headers = results.meta.fields || [];
          const data = results.data as Record<string, string>[];

          await db.csvFiles.add({
            name: file.name,
            uploadDate: new Date(),
            headers,
            data,
            rowCount: data.length,
          });

          // 重置输入
          event.target.value = '';
        } catch (error) {
          console.error('保存CSV失败:', error);
          alert('保存CSV文件失败');
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        console.error('解析CSV失败:', error);
        alert('解析CSV文件失败');
        setUploading(false);
      },
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个CSV文件吗？')) {
      await db.csvFiles.delete(id);
    }
  };

  const handleViewFile = (id: number) => {
    navigate(`/csv/${id}`);
  };

  return (
    <div className="min-h-screen bg-mainBackgroundColor p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CSV 表格管理</h1>
          <p className="text-gray-400">上传、管理和筛选您的CSV文件</p>
        </div>

        {/* 上传区域 */}
        <Card className="mb-8 bg-columnBackgroundColor border-columnBackgroundColor">
          <CardHeader>
            <CardTitle className="text-white">上传CSV文件</CardTitle>
            <CardDescription className="text-gray-400">
              选择一个CSV文件上传到本地浏览器存储
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="bg-mainBackgroundColor border-gray-600 text-white file:text-white file:bg-rose-500 file:border-0 file:rounded file:px-4 file:py-1 file:mr-4"
              />
              <Button disabled={uploading} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? '上传中...' : '选择文件'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 文件列表 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">已上传的文件</h2>
          {!csvFiles || csvFiles.length === 0 ? (
            <Card className="bg-columnBackgroundColor border-columnBackgroundColor">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">还没有上传任何CSV文件</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {csvFiles.map((file) => (
                <Card
                  key={file.id}
                  className="bg-columnBackgroundColor border-columnBackgroundColor hover:border-rose-500 transition-colors cursor-pointer"
                  onClick={() => file.id && handleViewFile(file.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <FileText className="w-8 h-8 text-rose-500" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          file.id && handleDelete(file.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <CardTitle className="text-white text-lg truncate">
                      {file.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      上传于 {new Date(file.uploadDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">
                        行数: <span className="text-white font-medium">{file.rowCount}</span>
                      </p>
                      <p className="text-gray-400">
                        列数: <span className="text-white font-medium">{file.headers.length}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
