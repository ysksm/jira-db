// ====================================
// 07: useWorker カスタムフック
// ====================================
// 汎用 useWorker フックの使い方と利点

import { useState } from "react";
import { useWorker } from "../hooks/useWorker.ts";
import type { WorkerRequest, WorkerResponse } from "../workers/basic.worker.ts";

export default function Page07UseWorkerHook() {
  const [results, setResults] = useState<Array<{ id: number; text: string }>>([]);
  const resultIdRef = { current: 0 };

  // useWorker フックで Worker を管理
  const {
    postMessage,
    status,
    error,
    isProcessing,
    terminate,
    lastMessage,
  } = useWorker<WorkerRequest, WorkerResponse>(
    () =>
      new Worker(
        new URL("../workers/basic.worker.ts", import.meta.url),
        { type: "module" }
      ),
    {
      timeout: 60000,
      onReady: () => console.log("Worker ready!"),
      onError: (err) => console.error("Worker error:", err),
    }
  );

  const addResult = (text: string) => {
    setResults((prev) => [
      ...prev.slice(-20),
      { id: ++resultIdRef.current, text },
    ]);
  };

  const runFibonacci = async (n: number) => {
    try {
      addResult(`→ Fibonacci(${n}) を計算中...`);
      const result = await postMessage({ id: "", type: "fibonacci", payload: n });
      addResult(`✅ Fibonacci(${n}) = ${JSON.stringify(result.payload)}`);
    } catch (err) {
      addResult(`❌ Error: ${(err as Error).message}`);
    }
  };

  const runSort = async (size: number) => {
    try {
      addResult(`→ ${size.toLocaleString()} 件ソート中...`);
      const result = await postMessage({ id: "", type: "sort", payload: size });
      addResult(`✅ Sort: ${JSON.stringify(result.payload)}`);
    } catch (err) {
      addResult(`❌ Error: ${(err as Error).message}`);
    }
  };

  const runParallel = async () => {
    addResult("→ 3つのタスクを並列実行中...");
    const start = performance.now();

    const results = await Promise.all([
      postMessage({ id: "", type: "fibonacci", payload: 35 }),
      postMessage({ id: "", type: "sort", payload: 500000 }),
      postMessage({ id: "", type: "prime-check", payload: 104729 }),
    ]);

    const elapsed = (performance.now() - start).toFixed(2);
    results.forEach((r, i) => {
      addResult(`  [${i + 1}] ${r.type}: ${JSON.stringify(r.payload)}`);
    });
    addResult(`✅ 並列実行完了 (${elapsed}ms)`);
  };

  return (
    <div>
      <h2>07: useWorker カスタムフック</h2>

      <div className="explanation">
        <strong>学習ポイント:</strong>
        <ul>
          <li>
            <code>useWorker</code> フックで Worker のライフサイクルを自動管理
          </li>
          <li>
            <code>postMessage</code> が Promise を返すので <code>async/await</code> で使える
          </li>
          <li>
            <code>Promise.all</code> で並列タスク実行が可能
          </li>
          <li>コンポーネントアンマウント時に自動 terminate</li>
          <li>タイムアウト、エラーハンドリングが組み込み済み</li>
        </ul>
        <pre>{`// フックの使い方
const { postMessage, status, isProcessing } = useWorker<Req, Res>(
  () => new Worker(new URL('...', import.meta.url), { type: 'module' }),
  { timeout: 60000 }
);

// async/await で結果を受け取る
const result = await postMessage({ type: 'calc', data: 42 });

// 並列実行
const [r1, r2] = await Promise.all([
  postMessage({ type: 'task1' }),
  postMessage({ type: 'task2' }),
]);`}</pre>
      </div>

      <div className="card">
        <h3>Worker ステータス</h3>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span>
            Status:{" "}
            <span className={`badge ${status === "ready" ? "badge-green" : status === "error" ? "badge-red" : ""}`}>
              {status}
            </span>
          </span>
          <span>
            Processing:{" "}
            <span className={`badge ${isProcessing ? "badge-yellow" : "badge-green"}`}>
              {isProcessing ? "Yes" : "No"}
            </span>
          </span>
          {error && <span style={{ color: "#ff6b81" }}>Error: {error.message}</span>}
          {lastMessage && (
            <span style={{ opacity: 0.6, fontSize: 12 }}>
              Last: {lastMessage.type}
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Promise ベースの操作</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => runFibonacci(38)} disabled={status !== "ready"}>
            Fibonacci(38)
          </button>
          <button onClick={() => runFibonacci(42)} disabled={status !== "ready"}>
            Fibonacci(42)
          </button>
          <button onClick={() => runSort(1000000)} disabled={status !== "ready"}>
            100万件ソート
          </button>
          <button onClick={runParallel} disabled={status !== "ready"}>
            並列実行 (Promise.all)
          </button>
          <button
            onClick={terminate}
            disabled={status === "terminated"}
            style={{ background: "#e94560" }}
          >
            Terminate
          </button>
        </div>
      </div>

      <div className="card">
        <h3>結果</h3>
        <div className="log">
          {results.map((r) => (
            <div key={r.id} className="log-entry receive">
              {r.text}
            </div>
          ))}
          {results.length === 0 && (
            <div className="log-entry info">ボタンをクリックして実行してください</div>
          )}
        </div>
      </div>
    </div>
  );
}
