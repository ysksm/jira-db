// ====================================
// 07: useWorker - 汎用 Web Worker カスタムフック
// ====================================
// Worker のライフサイクル管理を React Hook で抽象化する
//
// 特徴:
// - Worker の自動生成・自動破棄（useEffect cleanup）
// - Promise ベースの Request/Response
// - エラーハンドリング
// - ローディング状態管理
// - TypeScript ジェネリクスで型安全

import { useCallback, useEffect, useRef, useState } from "react";

type WorkerStatus = "idle" | "loading" | "ready" | "error" | "terminated";

type PendingRequest<TResponse> = {
  resolve: (value: TResponse) => void;
  reject: (reason: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

type UseWorkerOptions = {
  /** リクエストのタイムアウト (ms) */
  timeout?: number;
  /** Worker 準備完了時のコールバック */
  onReady?: () => void;
  /** エラー時のコールバック */
  onError?: (error: Error) => void;
};

type UseWorkerReturn<TRequest, TResponse> = {
  /** Worker にメッセージを送信し、レスポンスを Promise で受け取る */
  postMessage: (message: TRequest) => Promise<TResponse>;
  /** Worker にメッセージを送信（レスポンスを待たない） */
  send: (message: TRequest) => void;
  /** 最後に受信したメッセージ */
  lastMessage: TResponse | null;
  /** Worker の状態 */
  status: WorkerStatus;
  /** エラー情報 */
  error: Error | null;
  /** 処理中かどうか */
  isProcessing: boolean;
  /** Worker を終了 */
  terminate: () => void;
};

/**
 * 汎用 Web Worker フック
 *
 * @example
 * ```tsx
 * const { postMessage, lastMessage, status } = useWorker<Request, Response>(
 *   () => new Worker(new URL('../workers/my.worker.ts', import.meta.url), { type: 'module' })
 * );
 *
 * const result = await postMessage({ type: 'calc', data: 42 });
 * ```
 */
export function useWorker<TRequest = unknown, TResponse = unknown>(
  createWorker: () => Worker,
  options: UseWorkerOptions = {}
): UseWorkerReturn<TRequest, TResponse> {
  const { timeout = 30000, onReady, onError } = options;

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest<TResponse>>>(new Map());
  const requestIdRef = useRef(0);

  const [status, setStatus] = useState<WorkerStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [lastMessage, setLastMessage] = useState<TResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Worker の初期化
  useEffect(() => {
    setStatus("loading");

    try {
      const worker = createWorker();
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent) => {
        const data = event.data as TResponse & { id?: string };
        setLastMessage(data);

        // ID ベースの Request/Response 解決
        if (data && typeof data === "object" && "id" in data) {
          const id = (data as { id: string }).id;
          const pending = pendingRef.current.get(id);
          if (pending) {
            clearTimeout(pending.timeout);
            pending.resolve(data);
            pendingRef.current.delete(id);
            if (pendingRef.current.size === 0) {
              setIsProcessing(false);
            }
          }
        }
      };

      worker.onerror = (event: ErrorEvent) => {
        const err = new Error(event.message);
        setError(err);
        setStatus("error");
        onError?.(err);

        // 全ての pending を reject
        pendingRef.current.forEach((pending) => {
          clearTimeout(pending.timeout);
          pending.reject(err);
        });
        pendingRef.current.clear();
        setIsProcessing(false);
      };

      setStatus("ready");
      onReady?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      onError?.(error);
    }

    // クリーンアップ: コンポーネントアンマウント時に Worker を終了
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        pendingRef.current.forEach((pending) => {
          clearTimeout(pending.timeout);
          pending.reject(new Error("Worker terminated"));
        });
        pendingRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Promise ベースの postMessage
  const postMessage = useCallback(
    (message: TRequest): Promise<TResponse> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || status === "terminated") {
          reject(new Error("Worker is not available"));
          return;
        }

        const id = `req-${++requestIdRef.current}`;
        setIsProcessing(true);

        const timeoutId = setTimeout(() => {
          pendingRef.current.delete(id);
          if (pendingRef.current.size === 0) setIsProcessing(false);
          reject(new Error(`Worker request timed out after ${timeout}ms`));
        }, timeout);

        pendingRef.current.set(id, { resolve, reject, timeout: timeoutId });

        // メッセージに ID を付与して送信
        workerRef.current.postMessage({ ...message as object, id });
      });
    },
    [status, timeout]
  );

  // fire-and-forget 送信
  const send = useCallback(
    (message: TRequest) => {
      if (workerRef.current && status !== "terminated") {
        workerRef.current.postMessage(message);
      }
    },
    [status]
  );

  // Worker を終了
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setStatus("terminated");
      pendingRef.current.forEach((pending) => {
        clearTimeout(pending.timeout);
        pending.reject(new Error("Worker terminated"));
      });
      pendingRef.current.clear();
      setIsProcessing(false);
    }
  }, []);

  return { postMessage, send, lastMessage, status, error, isProcessing, terminate };
}
