import PlusIcon from "../icons/PlusIcon";
import { useEffect, useMemo, useState } from "react";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const defaultCols: Column[] = [
  {
    id: "todo",
    title: "Todo",
  },
  {
    id: "doing",
    title: "Work in progress",
  },
  {
    id: "done",
    title: "Done",
  },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    columnId: "todo",
    content: "List admin APIs for dashboard",
  },
  {
    id: "2",
    columnId: "todo",
    content:
      "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation",
  },
  {
    id: "3",
    columnId: "doing",
    content: "Conduct security testing",
  },
  {
    id: "4",
    columnId: "doing",
    content: "Analyze competitors",
  },
  {
    id: "5",
    columnId: "done",
    content: "Create UI kit documentation",
  },
  {
    id: "6",
    columnId: "done",
    content: "Dev meeting",
  },
  {
    id: "7",
    columnId: "done",
    content: "Deliver dashboard prototype",
  },
  {
    id: "8",
    columnId: "todo",
    content: "Optimize application performance",
  },
  {
    id: "9",
    columnId: "todo",
    content: "Implement data validation",
  },
  {
    id: "10",
    columnId: "todo",
    content: "Design database schema",
  },
  {
    id: "11",
    columnId: "todo",
    content: "Integrate SSL web certificates into workflow",
  },
  {
    id: "12",
    columnId: "doing",
    content: "Implement error logging and monitoring",
  },
  {
    id: "13",
    columnId: "doing",
    content: "Design and implement responsive UI",
  },
];

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(() => {
    const savedColumns = localStorage.getItem("columns");
    if (savedColumns) {
      return JSON.parse(savedColumns);
    }
    return defaultCols;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return defaultTasks;
  });

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const [showReportModal, setShowReportModal] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 添加生成周报的函数
  const generateWeeklyReport = async () => {
    setIsGenerating(true);
    try {
      // 这里是周报生成的逻辑，您可以在这里调用大模型API
      // 示例：收集任务数据
      const reportData = columns.map(column => ({
        title: column.title,
        tasks: tasks.filter(task => task.columnId === column.id).map(task => task.content)
      }));
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 设置周报内容（这里只是示例，实际应该是API返回的内容）
      setWeeklyReport(`
# 本周工作报告
## 已完成工作
${reportData.find(col => col.title === "Done")?.tasks.map(task => `- ${task}`).join('\n') || '无'}

## 进行中工作
${reportData.find(col => col.title === "Work in progress")?.tasks.map(task => `- ${task}`).join('\n') || '无'}

## 待处理工作
${reportData.find(col => col.title === "Todo")?.tasks.map(task => `- ${task}`).join('\n') || '无'}
      `);
      
      setShowReportModal(true);
    } catch (error) {
      console.error('生成周报失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full">
      {/* 添加生成周报按钮 */}
      <div className="flex justify-end px-[40px] py-4">
        <button
          onClick={generateWeeklyReport}
          disabled={isGenerating}
          className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 disabled:bg-gray-400 flex items-center gap-2"
        >
          {isGenerating ? "生成中..." : "生成周报"}
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-140px)] w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div className="m-auto flex gap-4">
            <div className="flex gap-4">
              <SortableContext items={columnsId}>
                {columns.map((col) => (
                  <ColumnContainer
                    key={col.id}
                    column={col}
                    deleteColumn={deleteColumn}
                    updateColumn={updateColumn}
                    createTask={createTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    tasks={tasks.filter((task) => task.columnId === col.id)}
                  />
                ))}
              </SortableContext>
            </div>
            <button
              onClick={() => {
                createNewColumn();
              }}
              className="
        h-[60px]
        w-[350px]
        min-w-[350px]
        cursor-pointer
        rounded-lg
        bg-mainBackgroundColor
        border-2
        border-columnBackgroundColor
        p-4
        ring-rose-500
        hover:ring-2
        flex
        gap-2
        "
            >
              <PlusIcon />
              Add Column
            </button>
          </div>

          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id
                  )}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>

      {/* 周报模态框 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-mainBackgroundColor rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">周报预览</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                关闭
              </button>
            </div>
            <div className="prose prose-invert">
              <pre className="whitespace-pre-wrap text-white font-mono text-sm">
                {weeklyReport}
              </pre>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(weeklyReport);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                复制内容
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


function createTask(columnId: Id) {
  const newTask: Task = {
    id: generateId(),
    columnId,
    content: `Task ${tasks.length + 1}`,
  };

  setTasks([...tasks, newTask]);
}

function deleteTask(id: Id) {
  const newTasks = tasks.filter((task) => task.id !== id);
  setTasks(newTasks);
}

function updateTask(id: Id, content: string) {
  const newTasks = tasks.map((task) => {
    if (task.id !== id) return task;
    return { ...task, content };
  });

  setTasks(newTasks);
}

function createNewColumn() {
  const columnToAdd: Column = {
    id: generateId(),
    title: `Column ${columns.length + 1}`,
  };

  setColumns([...columns, columnToAdd]);
}

function deleteColumn(id: Id) {
  const filteredColumns = columns.filter((col) => col.id !== id);
  setColumns(filteredColumns);

  const newTasks = tasks.filter((t) => t.columnId !== id);
  setTasks(newTasks);
}

function updateColumn(id: Id, title: string) {
  const newColumns = columns.map((col) => {
    if (col.id !== id) return col;
    return { ...col, title };
  });

  setColumns(newColumns);
}

function onDragStart(event: DragStartEvent) {
  if (event.active.data.current?.type === "Column") {
    setActiveColumn(event.active.data.current.column);
    return;
  }

  if (event.active.data.current?.type === "Task") {
    setActiveTask(event.active.data.current.task);
    return;
  }
}

function onDragEnd(event: DragEndEvent) {
  setActiveColumn(null);
  setActiveTask(null);

  const { active, over } = event;
  if (!over) return;

  const activeId = active.id;
  const overId = over.id;

  if (activeId === overId) return;

  const isActiveAColumn = active.data.current?.type === "Column";
  if (!isActiveAColumn) return;

  console.log("DRAG END");

  setColumns((columns) => {
    const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

    const overColumnIndex = columns.findIndex((col) => col.id === overId);

    return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
}

function onDragOver(event: DragOverEvent) {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id;
  const overId = over.id;

  if (activeId === overId) return;

  const isActiveATask = active.data.current?.type === "Task";
  const isOverATask = over.data.current?.type === "Task";

  if (!isActiveATask) return;

  // Im dropping a Task over another Task
  if (isActiveATask && isOverATask) {
    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
        // Fix introduced after video recording
        tasks[activeIndex].columnId = tasks[overIndex].columnId;
        console.log("MOVE TO ANOTHER COLUMN")
        return arrayMove(tasks, activeIndex, overIndex - 1);
      }

      return arrayMove(tasks, activeIndex, overIndex);
    });
  }

  const isOverAColumn = over.data.current?.type === "Column";

  // Im dropping a Task over a column
  if (isActiveATask && isOverAColumn) {
    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);

      tasks[activeIndex].columnId = overId;
      console.log("DROPPING TASK OVER COLUMN", { activeIndex });
      // Keep Same
      return arrayMove(tasks, activeIndex, activeIndex);
    });
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}


}

export default KanbanBoard;
