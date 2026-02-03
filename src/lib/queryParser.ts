export type QueryCondition = {
  type: 'comparison' | 'logical' | 'string' | 'empty';
  operator?: string;
  field?: string;
  value?: string;
  left?: QueryCondition;
  right?: QueryCondition;
};

// 解析查询字符串
export function parseQuery(queryString: string): QueryCondition | null {
  if (!queryString.trim()) return null;

  // 移除多余空格
  const normalizedQuery = queryString.trim().replace(/\s+/g, ' ');

  // 解析逻辑运算符（and, or）
  const logicalMatch = parseLogicalOperation(normalizedQuery);
  if (logicalMatch) return logicalMatch;

  // 解析比较运算符
  const comparisonMatch = parseComparison(normalizedQuery);
  if (comparisonMatch) return comparisonMatch;

  // 解析字符串匹配
  const stringMatch = parseStringMatch(normalizedQuery);
  if (stringMatch) return stringMatch;

  // 解析空值检查
  const emptyMatch = parseEmptyCheck(normalizedQuery);
  if (emptyMatch) return emptyMatch;

  return null;
}

function parseLogicalOperation(query: string): QueryCondition | null {
  // 查找最外层的 and/or 运算符
  let depth = 0;
  let lastAndPos = -1;
  let lastOrPos = -1;

  for (let i = 0; i < query.length; i++) {
    if (query[i] === '(') depth++;
    if (query[i] === ')') depth--;

    if (depth === 0) {
      if (query.substring(i, i + 5).toLowerCase() === ' and ') {
        lastAndPos = i;
      }
      if (query.substring(i, i + 4).toLowerCase() === ' or ') {
        lastOrPos = i;
      }
    }
  }

  // 优先处理 or（低优先级）
  if (lastOrPos !== -1) {
    const left = query.substring(0, lastOrPos).trim();
    const right = query.substring(lastOrPos + 4).trim();
    return {
      type: 'logical',
      operator: 'or',
      left: parseQuery(left),
      right: parseQuery(right),
    };
  }

  // 然后处理 and（高优先级）
  if (lastAndPos !== -1) {
    const left = query.substring(0, lastAndPos).trim();
    const right = query.substring(lastAndPos + 5).trim();
    return {
      type: 'logical',
      operator: 'and',
      left: parseQuery(left),
      right: parseQuery(right),
    };
  }

  // 处理括号
  if (query.startsWith('(') && query.endsWith(')')) {
    return parseQuery(query.substring(1, query.length - 1));
  }

  return null;
}

function parseComparison(query: string): QueryCondition | null {
  const operators = ['==', '!=', '>=', '<=', '>', '<'];

  for (const op of operators) {
    const index = query.indexOf(` ${op} `);
    if (index !== -1) {
      const field = query.substring(0, index).trim();
      const value = query.substring(index + op.length + 2).trim().replace(/^['"]|['"]$/g, '');
      return {
        type: 'comparison',
        operator: op,
        field,
        value,
      };
    }
  }

  return null;
}

function parseStringMatch(query: string): QueryCondition | null {
  const stringOps = ['contains', 'startsWith', 'endsWith'];

  for (const op of stringOps) {
    const regex = new RegExp(`(\\w+)\\.${op}\\s*\\(\\s*['"]([^'"]+)['"]\\s*\\)`, 'i');
    const match = query.match(regex);
    if (match) {
      return {
        type: 'string',
        operator: op,
        field: match[1],
        value: match[2],
      };
    }
  }

  return null;
}

function parseEmptyCheck(query: string): QueryCondition | null {
  const emptyOps = ['isEmpty', 'isNotEmpty'];

  for (const op of emptyOps) {
    const regex = new RegExp(`(\\w+)\\.${op}\\s*\\(\\s*\\)`, 'i');
    const match = query.match(regex);
    if (match) {
      return {
        type: 'empty',
        operator: op,
        field: match[1],
      };
    }
  }

  return null;
}

// 执行查询条件
export function evaluateCondition(
  row: Record<string, string>,
  condition: QueryCondition | null
): boolean {
  if (!condition) return true;

  switch (condition.type) {
    case 'comparison':
      return evaluateComparison(row, condition);
    case 'logical':
      return evaluateLogical(row, condition);
    case 'string':
      return evaluateStringMatch(row, condition);
    case 'empty':
      return evaluateEmptyCheck(row, condition);
    default:
      return true;
  }
}

function evaluateComparison(
  row: Record<string, string>,
  condition: QueryCondition
): boolean {
  const { field, operator, value } = condition;
  if (!field || !operator || value === undefined) return false;

  const cellValue = row[field];
  if (cellValue === undefined) return false;

  // 尝试数值比较
  const numCell = parseFloat(cellValue);
  const numValue = parseFloat(value);

  if (!isNaN(numCell) && !isNaN(numValue)) {
    switch (operator) {
      case '==': return numCell === numValue;
      case '!=': return numCell !== numValue;
      case '>': return numCell > numValue;
      case '<': return numCell < numValue;
      case '>=': return numCell >= numValue;
      case '<=': return numCell <= numValue;
      default: return false;
    }
  }

  // 字符串比较
  switch (operator) {
    case '==': return cellValue === value;
    case '!=': return cellValue !== value;
    case '>': return cellValue > value;
    case '<': return cellValue < value;
    case '>=': return cellValue >= value;
    case '<=': return cellValue <= value;
    default: return false;
  }
}

function evaluateLogical(
  row: Record<string, string>,
  condition: QueryCondition
): boolean {
  const { operator, left, right } = condition;
  if (!operator || !left || !right) return false;

  const leftResult = evaluateCondition(row, left);
  const rightResult = evaluateCondition(row, right);

  switch (operator) {
    case 'and': return leftResult && rightResult;
    case 'or': return leftResult || rightResult;
    default: return false;
  }
}

function evaluateStringMatch(
  row: Record<string, string>,
  condition: QueryCondition
): boolean {
  const { field, operator, value } = condition;
  if (!field || !operator || !value) return false;

  const cellValue = row[field] || '';

  switch (operator) {
    case 'contains': return cellValue.includes(value);
    case 'startsWith': return cellValue.startsWith(value);
    case 'endsWith': return cellValue.endsWith(value);
    default: return false;
  }
}

function evaluateEmptyCheck(
  row: Record<string, string>,
  condition: QueryCondition
): boolean {
  const { field, operator } = condition;
  if (!field || !operator) return false;

  const cellValue = row[field];

  switch (operator) {
    case 'isEmpty': return !cellValue || cellValue.trim() === '';
    case 'isNotEmpty': return !!cellValue && cellValue.trim() !== '';
    default: return false;
  }
}
