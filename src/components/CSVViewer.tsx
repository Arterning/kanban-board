import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import Papa from 'papaparse';
import { db } from '../db/csvDatabase';
import { parseQuery, evaluateCondition } from '../lib/queryParser';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, Download, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Info } from 'lucide-react';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function CSVViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [queryString, setQueryString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const rowsPerPage = 20;

  // 从IndexedDB获取CSV文件
  const csvFile = useLiveQuery(
    async () => {
      if (!id) return null;
      return await db.csvFiles.get(parseInt(id));
    },
    [id]
  );

  // 筛选和排序数据
  const { filteredData, error } = useMemo(() => {
    if (!csvFile) return { filteredData: [], error: null };

    try {
      const condition = parseQuery(queryString);
      let filtered = csvFile.data;

      // 应用筛选
      if (condition) {
        filtered = csvFile.data.filter(row => evaluateCondition(row, condition));
      }

      // 应用排序
      if (sortConfig) {
        filtered = [...filtered].sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];

          // 尝试数值比较
          const aNum = parseFloat(aValue);
          const bNum = parseFloat(bValue);

          if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
          }

          // 字符串比较
          if (sortConfig.direction === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        });
      }

      return { filteredData: filtered, error: null };
    } catch (err) {
      return { filteredData: csvFile.data, error: '查询语法错误' };
    }
  }, [csvFile, queryString, sortConfig]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // 排序处理
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null; // 取消排序
        }
      }
      return { key, direction: 'asc' };
    });
  };

  // 导出CSV
  const handleExport = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `filtered_${csvFile?.name || 'data.csv'}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!csvFile) {
    return (
      <div className="min-h-screen bg-mainBackgroundColor p-8 flex items-center justify-center">
        <p className="text-white">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mainBackgroundColor p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* 头部 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/csv')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{csvFile.name}</h1>
              <p className="text-gray-400 text-sm">
                共 {csvFile.rowCount} 行，{csvFile.headers.length} 列
                {filteredData.length !== csvFile.rowCount && (
                  <span className="text-rose-500 ml-2">
                    （筛选后：{filteredData.length} 行）
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button onClick={handleExport} disabled={filteredData.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            导出筛选结果
          </Button>
        </div>

        {/* 查询输入区域 */}
        <Card className="mb-6 bg-columnBackgroundColor border-columnBackgroundColor">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  数据筛选
                </CardTitle>
                <CardDescription className="text-gray-400">
                  使用查询语法筛选数据
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
              >
                <Info className="w-4 h-4 mr-2" />
                {showSyntaxHelp ? '隐藏' : '显示'}语法帮助
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="例如: columnA == 'GOOD' and columnB > 20"
                value={queryString}
                onChange={(e) => {
                  setQueryString(e.target.value);
                  setCurrentPage(1); // 重置到第一页
                }}
                className="bg-mainBackgroundColor border-gray-600 text-white placeholder:text-gray-500"
              />
              <Button
                variant="outline"
                onClick={() => setQueryString('')}
              >
                清除
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* 语法帮助 */}
            {showSyntaxHelp && (
              <div className="bg-mainBackgroundColor rounded-lg p-4 text-sm space-y-3">
                <div>
                  <h4 className="text-white font-semibold mb-2">比较运算符：</h4>
                  <p className="text-gray-400">==, !=, &gt;, &lt;, &gt;=, &lt;=</p>
                  <p className="text-gray-500 text-xs mt-1">示例: age &gt; 18, status == 'active'</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">逻辑运算符：</h4>
                  <p className="text-gray-400">and, or</p>
                  <p className="text-gray-500 text-xs mt-1">示例: age &gt; 18 and city == 'Beijing'</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">字符串匹配：</h4>
                  <p className="text-gray-400">columnName.contains('text'), .startsWith('text'), .endsWith('text')</p>
                  <p className="text-gray-500 text-xs mt-1">示例: name.contains('John')</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">空值检查：</h4>
                  <p className="text-gray-400">columnName.isEmpty(), .isNotEmpty()</p>
                  <p className="text-gray-500 text-xs mt-1">示例: email.isNotEmpty()</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">可用的列名：</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {csvFile.headers.map(header => (
                      <code key={header} className="bg-columnBackgroundColor px-2 py-1 rounded text-rose-500">
                        {header}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 数据表格 */}
        <Card className="bg-columnBackgroundColor border-columnBackgroundColor">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-mainBackgroundColor hover:bg-mainBackgroundColor">
                    {csvFile.headers.map((header) => (
                      <TableHead
                        key={header}
                        className="text-white font-semibold cursor-pointer hover:text-rose-500 transition-colors"
                        onClick={() => handleSort(header)}
                      >
                        <div className="flex items-center gap-2">
                          {header}
                          {sortConfig?.key === header ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            )
                          ) : (
                            <ArrowUpDown className="w-4 h-4 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={csvFile.headers.length}
                        className="text-center py-12 text-gray-400"
                      >
                        没有匹配的数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="border-mainBackgroundColor hover:bg-mainBackgroundColor"
                      >
                        {csvFile.headers.map((header) => (
                          <TableCell key={header} className="text-gray-300">
                            {row[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 分页控制 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-mainBackgroundColor p-4">
                <p className="text-sm text-gray-400">
                  显示 {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredData.length)} 条，
                  共 {filteredData.length} 条
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-white">
                    第 {currentPage} / {totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
