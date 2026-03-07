// ====================================
// 06: React + Worker 基本統合
// ====================================
// Vite での Worker インポート方法と React コンポーネントでの利用

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkerRequest, WorkerResponse } from "../workers/basic.worker.ts";

type LogEntry = {
  id: number;
  message: string;
  type: "send" | "receive" | "info" | "error";
  time: string;
};

export default function Page06BasicReactWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [counter, setCounter] = useState(0);
  const [fibN, setFibN] = useState(40);
  const logIdRef = useRef(0);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [
      ...prev.slice(-50),
      {
        id: ++logIdRef.current,
        message,
        type,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // UIブロッキングチェック用カウンター
  useEffect(() => {
    const id = setInterval(() => setCounter((c) => c + 1), 50);
    return () => clearInterval(id);
  }, []);

  // Worker のライフサイクル管理
  useEffect(() => {
    // Vite での Worker インポート方法
    const worker = new Worker(
      new URL("../workers/basic.worker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, payload } = event.data;
      addLog(`[Worker → Main] type=${type} payload=${JSON.stringify(payload)}`, "receive");
    };

    worker.onerror = (event) => {
      addLog(`[Error] ${event.message}`, "error");
    };

    addLog("Worker を作成しました", "info");

    // クリーンアップ: アンマウント時に Worker を終了
    return () => {
      worker.terminate();
      addLog("Worker を terminate しました", "info");
    };
  }, [addLog]);

  const sendToWorker = (type: WorkerRequest["type"], payload: unknown) => {
    if (!workerRef.current) return;
    const id = `req-${Date.now()}`;
    addLog(`[Main → Worker] type=${type}`, "send");
    workerRef.current.postMessage({ id, type, payload });
  };

  return (
    <div>
      <h2>06: React + Worker 基本統合</h2>

      <div className="explanation">
        <strong>学習ポイント:</strong>
        <ul>
          <li>
            Vite では{" "}
            <code>new Worker(new URL('../workers/my.worker.ts', import.meta.url), {"{"} type: 'module' {"}"})</code>{" "}
            でインポート
          </li>
          <li>
            <code>useRef</code> で Worker インスタンスを保持
          </li>
          <li>
            <code>useEffect</code> の cleanup で <code>terminate()</code> を呼ぶ
          </li>
          <li>Worker の生成はマウント時に1回だけ</li>
        </ul>
        <pre>{`// Vite での Worker インポート
useEffect(() => {
  const worker = new Worker(
    new URL('../workers/basic.worker.ts', import.meta.url),
    { type: 'module' }
  );
  workerRef.current = worker;
  worker.onmessage = (e) => { /* handle */ };
  return () => worker.terminate(); // cleanup
}, []);`}</pre>
      </div>

      <div className="card">
        <h3>UIブロッキングチェック</h3>
        <div className="counter">{counter}</div>
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          カウンターが止まらずに動き続ければ OK
        </p>
      </div>

      <div className="card">
        <h3>Worker に計算を依頼</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div>
            <label>
              Fibonacci N={" "}
              <input
                type="number"
                value={fibN}
                onChange={(e) => setFibN(Number(e.target.value))}
                style={{ width: 60 }}
                min={1}
                max={45}
              />
            </label>
            <button onClick={() => sendToWorker("fibonacci", fibN)}>
              計算
            </button>
          </div>
          <button onClick={() => sendToWorker("sort", 1000000)}>
            100万件ソート
          </button>
          <button onClick={() => sendToWorker("prime-check", 999999937)}>
            素数判定
          </button>
        </div>
      </div>

      <div className="card">
        <h3>ログ</h3>
        <div className="log">
          {logs.map((log) => (
            <div key={log.id} className={`log-entry ${log.type}`}>
              [{log.time}] {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
