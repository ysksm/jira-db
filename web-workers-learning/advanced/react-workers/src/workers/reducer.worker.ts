// ====================================
// 08: Worker + useReducer パターン
// ====================================
// Worker 内で状態管理ロジックを実行し、結果をメインスレッドに返す
// メインスレッドの useReducer と連携する

export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high";
};

export type TodoAction =
  | { type: "ADD_TODO"; payload: { text: string; priority: TodoItem["priority"] } }
  | { type: "TOGGLE_TODO"; payload: { id: string } }
  | { type: "DELETE_TODO"; payload: { id: string } }
  | { type: "FILTER_TODOS"; payload: { filter: string } }
  | { type: "SORT_TODOS"; payload: { by: "priority" | "date" | "name" } }
  | { type: "BULK_ADD"; payload: { count: number } };

export type WorkerMessage = {
  action: TodoAction;
  currentState: TodoItem[];
};

export type WorkerResult = {
  action: TodoAction;
  newState: TodoItem[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    elapsed: string;
  };
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const priorityOrder = { high: 0, medium: 1, low: 2 };

function processAction(state: TodoItem[], action: TodoAction): TodoItem[] {
  switch (action.type) {
    case "ADD_TODO":
      return [
        ...state,
        {
          id: generateId(),
          text: action.payload.text,
          completed: false,
          createdAt: new Date().toISOString(),
          priority: action.payload.priority,
        },
      ];

    case "TOGGLE_TODO":
      return state.map((todo) =>
        todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo
      );

    case "DELETE_TODO":
      return state.filter((todo) => todo.id !== action.payload.id);

    case "FILTER_TODOS": {
      // フィルタリングはビュー的な操作なので元データは変えない
      // ここでは検索的なフィルタとして処理
      const query = action.payload.filter.toLowerCase();
      if (!query) return state;
      return state.filter((todo) => todo.text.toLowerCase().includes(query));
    }

    case "SORT_TODOS": {
      const sorted = [...state];
      switch (action.payload.by) {
        case "priority":
          sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
          break;
        case "date":
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "name":
          sorted.sort((a, b) => a.text.localeCompare(b.text));
          break;
      }
      return sorted;
    }

    case "BULK_ADD": {
      const newTodos: TodoItem[] = [];
      const priorities: TodoItem["priority"][] = ["low", "medium", "high"];
      for (let i = 0; i < action.payload.count; i++) {
        newTodos.push({
          id: generateId(),
          text: `Task #${state.length + i + 1} - ${Math.random().toString(36).substring(2, 8)}`,
          completed: Math.random() > 0.7,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
          priority: priorities[Math.floor(Math.random() * 3)],
        });
      }
      return [...state, ...newTodos];
    }

    default:
      return state;
  }
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { action, currentState } = event.data;
  const start = performance.now();

  const newState = processAction(currentState, action);
  const elapsed = performance.now() - start;

  const result: WorkerResult = {
    action,
    newState,
    stats: {
      total: newState.length,
      completed: newState.filter((t) => t.completed).length,
      pending: newState.filter((t) => !t.completed).length,
      elapsed: `${elapsed.toFixed(2)}ms`,
    },
  };

  self.postMessage(result);
};
