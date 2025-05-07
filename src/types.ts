export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
};

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
};

export interface Note {
  id: string;
  type: string;
  name: string;
  content: string;
  createTime: string;
  updateTime: string;
  color?: string;
}