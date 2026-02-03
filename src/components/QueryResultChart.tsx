import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface QueryResultChartProps {
  data: any[];
  columns: string[];
}

const COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6'];

export default function QueryResultChart({ data, columns }: QueryResultChartProps) {
  const chartType = useMemo(() => {
    // 自动选择合适的图表类型
    if (columns.length === 2) {
      const firstCol = data[0]?.[columns[0]];
      const secondCol = data[0]?.[columns[1]];

      // 如果第一列是字符串，第二列是数字，使用柱状图
      if (typeof firstCol === 'string' && !isNaN(Number(secondCol))) {
        return data.length <= 10 ? 'pie' : 'bar';
      }
    }

    // 默认使用柱状图
    return 'bar';
  }, [data, columns]);

  const numericColumns = useMemo(() => {
    if (data.length === 0) return [];
    return columns.filter(col => {
      const value = data[0][col];
      return !isNaN(Number(value)) && typeof value !== 'string';
    });
  }, [data, columns]);

  const categoryColumn = useMemo(() => {
    return columns.find(col => !numericColumns.includes(col)) || columns[0];
  }, [columns, numericColumns]);

  if (data.length === 0) {
    return null;
  }

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey={numericColumns[0] || columns[1]}
                nameKey={categoryColumn}
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => `${entry[categoryColumn]}: ${entry[numericColumns[0] || columns[1]]}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={categoryColumn} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              {numericColumns.map((col, idx) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={categoryColumn} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              {numericColumns.map((col, idx) => (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={COLORS[idx % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="bg-columnBackgroundColor border-columnBackgroundColor">
      <CardHeader>
        <CardTitle className="text-white">查询结果可视化</CardTitle>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
