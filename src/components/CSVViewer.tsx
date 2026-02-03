import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import Papa from 'papaparse';
import { db } from '../db/csvDatabase';
import { parseQuery, evaluateCondition } from '../lib/queryParser';
import { loadCSVData, executeQuery } from '../lib/duckdbManager';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import QueryResultChart from './QueryResultChart';
import {
  ArrowLeft,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Database,
  Sparkles
} from 'lucide-react';

type QueryMode = 'simple' | 'sql';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function CSVViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [queryMode, setQueryMode] = useState<QueryMode>('simple');
  const [queryString, setQueryString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const [sqlResult, setSqlResult] = useState<{
    data: any[];
    columns: string[];
    isAggregateResult: boolean;
  } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isLoadingDuckDB, setIsLoadingDuckDB] = useState(false);
  const [isDuckDBReady, setIsDuckDBReady] = useState(false);
  const [isExecutingSQL, setIsExecutingSQL] = useState(false);
  const rowsPerPage = 20;

  // 从IndexedDB获取CSV文件
  const csvFile = useLiveQuery(
    async () => {
      if (!id) return null;
      return await db.csvFiles.get(parseInt(id));
    },
    [id]
  );

  // 当切换到SQL模式时，加载DuckDB和数据
  useEffect(() => {
    if (queryMode === 'sql' && !isDuckDBReady && csvFile) {
      setIsLoadingDuckDB(true);
      loadCSVData('data', csvFile.headers, csvFile.data)
        .then(() => {
          setIsDuckDBReady(true);
          // 默认查询显示所有数据
          if (!queryString) {
            setQueryString('SELECT * FROM data LIMIT 100');
          }
        })
        .catch((err) => {
          console.error('加载DuckDB失败:', err);
          setSqlError('加载DuckDB失败，请刷新页面重试');
        })
        .finally(() => {
          setIsLoadingDuckDB(false);
        });
    }
  }, [queryMode, isDuckDBReady, csvFile, queryString]);

  // SQL查询执行
  const handleSQLQuery = async () => {
    if (!queryString.trim() || !isDuckDBReady) return;

    setIsExecutingSQL(true);
    setSqlError(null);

    try {
      const result = await executeQuery(queryString);
      console.log("SQL查询结果:", result);
      setSqlResult(result);
      setCurrentPage(1);
    } catch (err: any) {
      setSqlError(err.message);
      setSqlResult(null);
    } finally {
      setIsExecutingSQL(false);
    }
  };

  // 简单模式下的筛选和排序
  const { filteredData, simpleError } = useMemo(() => {
    if (!csvFile || queryMode === 'sql') return { filteredData: [], simpleError: null };

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

      return { filteredData: filtered, simpleError: null };
    } catch (err) {
      return { filteredData: csvFile.data, simpleError: '查询语法错误' };
    }
  }, [csvFile, queryString, sortConfig, queryMode]);

  // 获取当前显示的数据
  const displayData = queryMode === 'sql' ? (sqlResult?.data || []) : filteredData;
  const displayColumns = queryMode === 'sql' ? (sqlResult?.columns || []) : (csvFile?.headers || []);
  const isAggregateResult = queryMode === 'sql' && (sqlResult?.isAggregateResult || false);

  // 分页数据
  const paginatedData = useMemo(() => {
    if (isAggregateResult) {
      // 聚合结果不分页
      return displayData;
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    return displayData.slice(startIndex, startIndex + rowsPerPage);
  }, [displayData, currentPage, isAggregateResult]);

  const totalPages = Math.ceil(displayData.length / rowsPerPage);

  // 排序处理（仅简单模式）
  const handleSort = (key: string) => {
    if (queryMode === 'sql') return;
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null;
        }
      }
      return { key, direction: 'asc' };
    });
  };

  // 导出CSV
  const handleExport = () => {
    const csv = Papa.unparse(displayData);
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

  // 切换查询模式
  const handleModeSwitch = (mode: QueryMode) => {
    setQueryMode(mode);
    setQueryString('');
    setSqlResult(null);
    setSqlError(null);
    setCurrentPage(1);
  };

  if (!csvFile) {
    return (
      <div className="min-h-screen bg-mainBackgroundColor p-8 flex items-center justify-center">
        <p className="text-white">加载中...</p>
      </div>
    );
  }

  const currentError = queryMode === 'sql' ? sqlError : simpleError;

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
                {displayData.length !== csvFile.rowCount && (
                  <span className="text-rose-500 ml-2">
                    （{queryMode === 'sql' ? '查询' : '筛选'}后：{displayData.length} 行）
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button onClick={handleExport} disabled={displayData.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            导出结果
          </Button>
        </div>

        {/* 模式切换 */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={queryMode === 'simple' ? 'default' : 'ghost'}
            onClick={() => handleModeSwitch('simple')}
          >
            <Filter className="w-4 h-4 mr-2" />
            简单查询
          </Button>
          <Button
            variant={queryMode === 'sql' ? 'default' : 'ghost'}
            onClick={() => handleModeSwitch('sql')}
          >
            <Database className="w-4 h-4 mr-2" />
            SQL查询
          </Button>
        </div>

        {/* 查询输入区域 */}
        <Card className="mb-6 bg-columnBackgroundColor border-columnBackgroundColor">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  {queryMode === 'sql' ? (
                    <>
                      <Database className="w-5 h-5" />
                      SQL查询
                    </>
                  ) : (
                    <>
                      <Filter className="w-5 h-5" />
                      简单筛选
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {queryMode === 'sql'
                    ? '使用标准SQL语法查询数据，支持聚合、分组、排序等高级功能'
                    : '使用简单查询语法快速筛选数据'}
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
            {queryMode === 'sql' && isLoadingDuckDB && (
              <div className="bg-mainBackgroundColor rounded-lg p-4 text-center">
                <p className="text-gray-400">正在加载SQL引擎...</p>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder={
                  queryMode === 'sql'
                    ? "例如: SELECT * FROM data WHERE columnA = 'GOOD' AND columnB > 20"
                    : "例如: columnA == 'GOOD' and columnB > 20"
                }
                value={queryString}
                onChange={(e) => {
                  setQueryString(e.target.value);
                  if (queryMode === 'simple') {
                    setCurrentPage(1);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && queryMode === 'sql') {
                    handleSQLQuery();
                  }
                }}
                disabled={queryMode === 'sql' && !isDuckDBReady}
                className="bg-mainBackgroundColor border-gray-600 text-white placeholder:text-gray-500"
              />
              {queryMode === 'sql' && (
                <Button
                  onClick={handleSQLQuery}
                  disabled={!isDuckDBReady || isExecutingSQL}
                >
                  {isExecutingSQL ? '执行中...' : '执行'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setQueryString('')}
              >
                清除
              </Button>
            </div>

            {currentError && (
              <p className="text-red-500 text-sm">{currentError}</p>
            )}

            {/* 语法帮助 */}
            {showSyntaxHelp && queryMode === 'simple' && (
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

            {showSyntaxHelp && queryMode === 'sql' && (
              <div className="bg-mainBackgroundColor rounded-lg p-4 text-sm space-y-3">
                <div>
                  <h4 className="text-white font-semibold mb-2">基础查询：</h4>
                  <p className="text-gray-400">SELECT * FROM data WHERE condition</p>
                  <p className="text-gray-500 text-xs mt-1">示例: SELECT * FROM data WHERE age &gt; 18</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">聚合查询：</h4>
                  <p className="text-gray-400">SELECT column, COUNT(*), AVG(column) FROM data GROUP BY column</p>
                  <p className="text-gray-500 text-xs mt-1">示例: SELECT city, COUNT(*) as count FROM data GROUP BY city</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">排序：</h4>
                  <p className="text-gray-400">SELECT * FROM data ORDER BY column DESC</p>
                  <p className="text-gray-500 text-xs mt-1">示例: SELECT * FROM data ORDER BY age DESC LIMIT 10</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">常用函数：</h4>
                  <p className="text-gray-400">COUNT(), SUM(), AVG(), MIN(), MAX()</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">表名和可用列：</h4>
                  <p className="text-rose-500 mb-2">表名: data</p>
                  <div className="flex flex-wrap gap-2">
                    {csvFile.headers.map(header => (
                      <code key={header} className="bg-columnBackgroundColor px-2 py-1 rounded text-rose-500">
                        "{header}"
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 聚合结果可视化 */}
        {isAggregateResult && displayData.length > 0 && (
          <div className="mb-6">
            <QueryResultChart data={displayData} columns={displayColumns} />
          </div>
        )}

        {/* 数据表格 */}
        <Card className="bg-columnBackgroundColor border-columnBackgroundColor">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-mainBackgroundColor hover:bg-mainBackgroundColor">
                    {displayColumns.map((header) => (
                      <TableHead
                        key={header}
                        className={`text-white font-semibold ${queryMode === 'simple' ? 'cursor-pointer hover:text-rose-500' : ''} transition-colors`}
                        onClick={() => queryMode === 'simple' && handleSort(header)}
                      >
                        <div className="flex items-center gap-2">
                          {header}
                          {queryMode === 'simple' && (
                            sortConfig?.key === header ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="w-4 h-4" />
                              ) : (
                                <ArrowDown className="w-4 h-4" />
                              )
                            ) : (
                              <ArrowUpDown className="w-4 h-4 opacity-30" />
                            )
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
                        colSpan={displayColumns.length}
                        className="text-center py-12 text-gray-400"
                      >
                        {queryMode === 'sql' && !sqlResult
                          ? '输入SQL查询并点击执行按钮'
                          : '没有匹配的数据'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className="border-mainBackgroundColor hover:bg-mainBackgroundColor"
                      >
                        {displayColumns.map((header) => (
                          <TableCell key={header} className="text-gray-300">
                            {row[header] !== null && row[header] !== undefined
                              ? String(row[header])
                              : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 分页控制 */}
            {!isAggregateResult && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-mainBackgroundColor p-4">
                <p className="text-sm text-gray-400">
                  显示 {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, displayData.length)} 条，
                  共 {displayData.length} 条
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
