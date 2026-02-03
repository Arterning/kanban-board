import Dexie, { Table } from 'dexie';

export interface CSVFile {
  id?: number;
  name: string;
  uploadDate: Date;
  headers: string[];
  data: Record<string, string>[];
  rowCount: number;
}

export class CSVDatabase extends Dexie {
  csvFiles!: Table<CSVFile, number>;

  constructor() {
    super('CSVDatabase');
    this.version(1).stores({
      csvFiles: '++id, name, uploadDate'
    });
  }
}

export const db = new CSVDatabase();
