// ====================================
// 08: Worker + useReducer パターン
// ====================================
// Worker 内で状態管理ロジックを実行する
// useReducer のディスパッチを Worker 経由にする

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type {
  TodoAction,
  TodoItem,
  WorkerMessage,
  WorkerResult,
} from "../workers/reducer.worker.ts";

type Stats = WorkerResult["stats"] | null;

function todoReducer(state: TodoItem[], action: { type: "SET"; payload: TodoItem[] }): TodoItem[] {
  if (action.type === "SET") return action.payload;
  return state;
}

export default function Page08WorkerReducer() {
  const [todos, localDispatch] = useReducer(todoReducer, []);
  const [stats, setStats] = useState<Stats>(null);
  const [filterText, setFilterText] = useState("");
  const [lastAction, setLastAction] = useState<string>("");
  const workerRef = useRef<Worker | null>(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<TodoItem["priority"]>("medium");

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/reducer.worker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      const { action, newState, stats: newStats } = event.data;
      localDispatch({ type: "SET", payload: newState });
      setStats(newStats);
      setLastAction(`${action.type} (${newStats.elapsed})`);
    };

    return () => worker.terminate();
  }, []);

  // Worker に action を送信する dispatch 関数
  const dispatch = useCallback(
    (action: TodoAction) => {
      if (!workerRef.current) return;
      const message: WorkerMessage = {
        action,
        currentState: todos,
      };
      workerRef.current.postMessage(message);
    },
    [todos]
  );

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    dispatch({ type: "ADD_TODO", payload: { text: newTodoText, priority: newTodoPriority } });
    setNewTodoText("");
  };

  const filteredTodos = filterText
    ? todos.filter((t) => t.text.toLowerCase().includes(filterText.toLowerCase()))
    : todos;

  const priorityColors = { high: "#e94560", medium: "#f1c40f", low: "#4ecca3" };

  return (
    <div>
      <h2>08: Worker + useReducer パターン</h2>

      <div className="explanation">
        <strong>学習ポイント:</strong>
        <ul>
          <li>
            Reducer ロジックを Worker 内で実行 → メインスレッドの負荷を軽減
          </li>
          <li>
            <code>dispatch(action)</code> → Worker → 結果を <code>localDispatch</code> で反映
          </li>
          <li>Worker 内でソート・フィルタなどの重い操作を処理</li>
          <li>統計計算も Worker 側で行う</li>
        </ul>
        <pre>{`// メインスレッド側
const dispatch = (action: TodoAction) => {
  worker.postMessage({ action, currentState: todos });
};

// Worker 側
self.onmessage = (event) => {
  const { action, currentState } = event.data;
  const newState = processAction(currentState, action);
  self.postMessage({ newState, stats });
};`}</pre>
      </div>

      {stats && (
        <div className="card">
          <h3>統計情報（Worker で計算）</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span className="badge badge-green">合計: {stats.total}</span>
            <span className="badge badge-yellow">未完了: {stats.pending}</span>
            <span className="badge">完了: {stats.completed}</span>
            <span style={{ opacity: 0.6 }}>処理時間: {stats.elapsed}</span>
            <span style={{ opacity: 0.6 }}>最後のアクション: {lastAction}</span>
          </div>
        </div>
      )}

      <div className="card">
        <h3>TODO 追加</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
            placeholder="新しいタスクを入力..."
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            value={newTodoPriority}
            onChange={(e) => setNewTodoPriority(e.target.value as TodoItem["priority"])}
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <button onClick={handleAddTodo}>追加</button>
        </div>
      </div>

      <div className="card">
        <h3>操作（すべて Worker で処理）</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => dispatch({ type: "BULK_ADD", payload: { count: 100 } })}>
            100件一括追加
          </button>
          <button onClick={() => dispatch({ type: "BULK_ADD", payload: { count: 1000 } })}>
            1000件一括追加
          </button>
          <button onClick={() => dispatch({ type: "SORT_TODOS", payload: { by: "priority" } })}>
            優先度ソート
          </button>
          <button onClick={() => dispatch({ type: "SORT_TODOS", payload: { by: "date" } })}>
            日付ソート
          </button>
          <button onClick={() => dispatch({ type: "SORT_TODOS", payload: { by: "name" } })}>
            名前ソート
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="フィルタ（クライアント側）..."
            style={{ width: 200 }}
          />
        </div>
      </div>

      <div className="card">
        <h3>TODO リスト ({filteredTodos.length} 件表示)</h3>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {filteredTodos.slice(0, 100).map((todo) => (
            <div
              key={todo.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderBottom: "1px solid #0f3460",
                opacity: todo.completed ? 0.5 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() =>
                  dispatch({ type: "TOGGLE_TODO", payload: { id: todo.id } })
                }
              />
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: priorityColors[todo.priority],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: todo.completed ? "line-through" : "none",
                }}
              >
                {todo.text}
              </span>
              <span style={{ fontSize: 11, opacity: 0.5 }}>
                {new Date(todo.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() =>
                  dispatch({ type: "DELETE_TODO", payload: { id: todo.id } })
                }
                style={{
                  background: "transparent",
                  color: "#e94560",
                  border: "1px solid #e94560",
                  padding: "2px 8px",
                  fontSize: 12,
                }}
              >
                削除
              </button>
            </div>
          ))}
          {filteredTodos.length > 100 && (
            <div style={{ padding: 8, opacity: 0.5, textAlign: "center" }}>
              ...他 {filteredTodos.length - 100} 件
            </div>
          )}
          {filteredTodos.length === 0 && (
            <div style={{ padding: 16, textAlign: "center", opacity: 0.5 }}>
              TODO がありません。追加してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
