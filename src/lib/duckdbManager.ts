import * as duckdb from '@duckdb/duckdb-wasm';

let dbInstance: duckdb.AsyncDuckDB | null = null;
let connection: duckdb.AsyncDuckDBConnection | null = null;

// 初始化DuckDB
export async function initDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (dbInstance) {
    return dbInstance;
  }

  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
  );

  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();

  dbInstance = new duckdb.AsyncDuckDB(logger, worker);
  await dbInstance.instantiate(bundle.mainModule, bundle.pthreadWorker);

  URL.revokeObjectURL(worker_url);

  return dbInstance;
}

// 获取连接
export async function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  if (!connection) {
    const db = await initDuckDB();
    connection = await db.connect();
  }
  return connection;
}

// 加载CSV数据到DuckDB
export async function loadCSVData(
  tableName: string,
  headers: string[],
  data: Record<string, string>[]
): Promise<void> {
  const conn = await getConnection();

  // 删除旧表（如果存在）
  try {
    await conn.query(`DROP TABLE IF EXISTS ${tableName}`);
  } catch (e) {
    // 忽略错误
  }

  // 创建表结构
  const columns = headers.map(h => `"${h}" VARCHAR`).join(', ');
  await conn.query(`CREATE TABLE ${tableName} (${columns})`);

  // 插入数据
  if (data.length > 0) {
    // 批量插入以提高性能
    const batchSize = 1000;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values = batch
        .map(row => {
          const vals = headers.map(h => {
            const val = row[h] || '';
            return `'${val.replace(/'/g, "''")}'`; // 转义单引号
          });
          return `(${vals.join(', ')})`;
        })
        .join(', ');

      await conn.query(`INSERT INTO ${tableName} VALUES ${values}`);
    }
  }
}

// 执行SQL查询
export async function executeQuery(sql: string): Promise<{
  data: any[];
  columns: string[];
  isAggregateResult: boolean;
}> {
  const conn = await getConnection();

  try {
    const result = await conn.query(sql);

    // 使用toArray()获取Apache Arrow格式的数据，然后转换为普通对象
    const arrowTable = result;
    const numRows = arrowTable.numRows;
    const schema = arrowTable.schema;

    // 获取列名
    const columns = schema.fields.map(f => f.name);

    // 转换为对象数组
    const data: any[] = [];
    for (let i = 0; i < numRows; i++) {
      const obj: any = {};
      columns.forEach((col) => {
        // 使用get方法从Arrow Table中获取值
        const column = arrowTable.getChild(col);
        obj[col] = column?.get(i);
      });
      data.push(obj);
    }

    // 检测是否为聚合结果
    // 聚合结果通常行数较少，且包含聚合函数或GROUP BY
    const sqlLower = sql.toLowerCase();
    const hasAggregateFunction = /\b(count|sum|avg|min|max|group_concat)\s*\(/.test(sqlLower);
    const hasGroupBy = /\bgroup\s+by\b/.test(sqlLower);
    const isAggregateResult = (hasAggregateFunction || hasGroupBy) && data.length < 100;

    return { data, columns, isAggregateResult };
  } catch (error: any) {
    throw new Error(`SQL执行错误: ${error.message}`);
  }
}

// 清理资源
export async function cleanup(): Promise<void> {
  if (connection) {
    await connection.close();
    connection = null;
  }
  if (dbInstance) {
    await dbInstance.terminate();
    dbInstance = null;
  }
}
