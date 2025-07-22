import Dexie, { Table } from 'dexie';
import { SVG } from '../types';

export class MySubClassedDexie extends Dexie {
  svgs!: Table<SVG>; 

  constructor() {
    super('myDatabase');
    this.version(1).stores({
      svgs: 'id, name, type'
    });
  }
}

export const db = new MySubClassedDexie();
