// ====================================
// 09: 高頻度ポーリング専用フック
// ====================================
// useWorker をベースに、ポーリング制御に特化した機能を追加
//
// 特徴:
// - 開始/停止の制御
// - ポーリング間隔の動的変更
// - メトリクスの自動収集
// - コンポーネントアンマウント時の自動停止

import { useCallback, useEffect, useRef, useState } from "react";
import type { PollingCommand, PollingConfig, PollingResult, PollingStats } from "../workers/polling.worker.ts";

type MetricSnapshot = {
  current: {
    cpu: number;
    memory: number;
    requestsPerSec: number;
    errorRate: number;
    latency: number;
    activeConnections: number;
    timestamp: number;
  };
  anomalies: string[];
  aggregated: {
    cpuAvg: string;
    memAvg: string;
    latencyAvg: string;
    cpuMax: string;
    memMax: string;
  };
  historyLength: number;
  recentHistory: Array<{
    timestamp: number;
    cpu: number;
    memory: number;
    latency: number;
    rps: number;
  }>;
};

type UsePollingWorkerReturn = {
  /** ポーリングを開始 */
  start: (config?: Partial<PollingConfig>) => void;
  /** ポーリングを停止 */
  stop: () => void;
  /** ポーリング間隔を変更 */
  updateInterval: (interval: number) => void;
  /** 統計情報を取得 */
  getStats: () => void;
  /** 最新のメトリクスデータ */
  metrics: MetricSnapshot | null;
  /** 統計情報 */
  stats: PollingStats | null;
  /** ポーリング中かどうか */
  isRunning: boolean;
  /** 現在のポーリング間隔 */
  interval: number;
  /** 異常検知アラート */
  anomalies: string[];
  /** 受信したデータのカウント */
  dataCount: number;
};

const DEFAULT_CONFIG: PollingConfig = {
  interval: 1000,
  endpoint: "/api/metrics",
  maxHistory: 300,
};

export function usePollingWorker(
  initialConfig?: Partial<PollingConfig>
): UsePollingWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
  const [stats, setStats] = useState<PollingStats | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [interval, setInterval_] = useState(initialConfig?.interval ?? DEFAULT_CONFIG.interval);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [dataCount, setDataCount] = useState(0);

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/polling.worker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<PollingResult>) => {
      const { type, payload } = event.data;

      switch (type) {
        case "DATA": {
          const data = payload as MetricSnapshot;
          setMetrics(data);
          setAnomalies(data.anomalies);
          setDataCount((c) => c + 1);
          break;
        }
        case "STATS": {
          setStats(payload as PollingStats);
          break;
        }
        case "STATUS": {
          const status = payload as { status: string; interval?: number };
          if (status.status === "started") {
            setIsRunning(true);
          } else if (status.status === "stopped") {
            setIsRunning(false);
          } else if (status.status === "interval-updated" && status.interval) {
            setInterval_(status.interval);
          }
          break;
        }
        case "ERROR": {
          console.error("[PollingWorker Error]", payload);
          break;
        }
      }
    };

    return () => {
      worker.postMessage({ type: "STOP" } as PollingCommand);
      worker.terminate();
    };
  }, []);

  const start = useCallback(
    (config?: Partial<PollingConfig>) => {
      const mergedConfig = { ...DEFAULT_CONFIG, ...initialConfig, ...config };
      setInterval_(mergedConfig.interval);
      workerRef.current?.postMessage({
        type: "START",
        config: mergedConfig,
      } as PollingCommand);
    },
    [initialConfig]
  );

  const stop = useCallback(() => {
    workerRef.current?.postMessage({ type: "STOP" } as PollingCommand);
  }, []);

  const updateInterval = useCallback((newInterval: number) => {
    setInterval_(newInterval);
    workerRef.current?.postMessage({
      type: "UPDATE_INTERVAL",
      interval: newInterval,
    } as PollingCommand);
  }, []);

  const getStats = useCallback(() => {
    workerRef.current?.postMessage({ type: "GET_STATS" } as PollingCommand);
  }, []);

  return {
    start,
    stop,
    updateInterval,
    getStats,
    metrics,
    stats,
    isRunning,
    interval,
    anomalies,
    dataCount,
  };
}
