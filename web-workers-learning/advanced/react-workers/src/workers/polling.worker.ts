// ====================================
// 09: 高頻度ポーリング Worker
// ====================================
// メインスレッドをブロックせずに高頻度でデータを取得・加工する
// リアルタイムダッシュボード等のユースケースを想定

export type PollingConfig = {
  interval: number; // ポーリング間隔 (ms)
  endpoint: string; // 疑似エンドポイント
  maxHistory: number; // 保持するデータ履歴の最大数
};

export type PollingCommand =
  | { type: "START"; config: PollingConfig }
  | { type: "STOP" }
  | { type: "UPDATE_INTERVAL"; interval: number }
  | { type: "GET_STATS" };

export type MetricData = {
  timestamp: number;
  cpu: number;
  memory: number;
  requestsPerSec: number;
  errorRate: number;
  latency: number;
  activeConnections: number;
};

export type PollingResult = {
  type: "DATA" | "STATS" | "STATUS" | "ERROR";
  payload: unknown;
};

export type PollingStats = {
  totalPolls: number;
  errors: number;
  avgLatency: number;
  uptime: number;
  pollsPerSecond: number;
  isRunning: boolean;
  interval: number;
  dataPoints: number;
};

let timerId: ReturnType<typeof setInterval> | null = null;
let config: PollingConfig | null = null;
let history: MetricData[] = [];
let totalPolls = 0;
let errors = 0;
let startTime = 0;
let latencies: number[] = [];

// 疑似サーバーメトリクスを生成（実際のプロジェクトでは fetch に置き換える）
function generateMetrics(): MetricData {
  const now = Date.now();
  // リアルっぽい変動を生成
  const baselineCpu = 35 + Math.sin(now / 10000) * 15;
  const baselineMemory = 60 + Math.sin(now / 30000) * 10;
  const spike = Math.random() > 0.95 ? Math.random() * 30 : 0;

  return {
    timestamp: now,
    cpu: Math.min(100, Math.max(0, baselineCpu + (Math.random() - 0.5) * 10 + spike)),
    memory: Math.min(100, Math.max(0, baselineMemory + (Math.random() - 0.5) * 5)),
    requestsPerSec: Math.floor(800 + Math.random() * 400 + spike * 50),
    errorRate: Math.max(0, 0.5 + (Math.random() - 0.5) * 1 + (spike > 0 ? 5 : 0)),
    latency: Math.max(1, 45 + (Math.random() - 0.5) * 30 + spike * 2),
    activeConnections: Math.floor(150 + Math.random() * 50 + spike * 10),
  };
}

// 移動平均を計算
function calculateMovingAverage(data: number[], window: number): number {
  if (data.length === 0) return 0;
  const slice = data.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

// 異常検知（簡易版）
function detectAnomaly(current: MetricData): string[] {
  const anomalies: string[] = [];
  if (current.cpu > 80) anomalies.push(`CPU high: ${current.cpu.toFixed(1)}%`);
  if (current.memory > 85) anomalies.push(`Memory high: ${current.memory.toFixed(1)}%`);
  if (current.errorRate > 3) anomalies.push(`Error rate high: ${current.errorRate.toFixed(2)}%`);
  if (current.latency > 80) anomalies.push(`Latency high: ${current.latency.toFixed(0)}ms`);
  return anomalies;
}

function poll() {
  const pollStart = performance.now();

  try {
    const metrics = generateMetrics();
    const pollLatency = performance.now() - pollStart;
    latencies.push(pollLatency);
    totalPolls++;

    // 履歴に追加（上限管理）
    history.push(metrics);
    if (config && history.length > config.maxHistory) {
      history = history.slice(-config.maxHistory);
    }

    // 異常検知
    const anomalies = detectAnomaly(metrics);

    // 統計計算（Worker 内で行うことでメインスレッドを解放）
    const cpuHistory = history.map((h) => h.cpu);
    const memHistory = history.map((h) => h.memory);
    const latencyHistory = history.map((h) => h.latency);

    const result: PollingResult = {
      type: "DATA",
      payload: {
        current: metrics,
        anomalies,
        aggregated: {
          cpuAvg: calculateMovingAverage(cpuHistory, 10).toFixed(1),
          memAvg: calculateMovingAverage(memHistory, 10).toFixed(1),
          latencyAvg: calculateMovingAverage(latencyHistory, 10).toFixed(1),
          cpuMax: Math.max(...cpuHistory.slice(-30)).toFixed(1),
          memMax: Math.max(...memHistory.slice(-30)).toFixed(1),
        },
        historyLength: history.length,
        // チャート用に直近のデータポイントを送信
        recentHistory: history.slice(-60).map((h) => ({
          timestamp: h.timestamp,
          cpu: Math.round(h.cpu * 10) / 10,
          memory: Math.round(h.memory * 10) / 10,
          latency: Math.round(h.latency),
          rps: h.requestsPerSec,
        })),
      },
    };

    self.postMessage(result);
  } catch (err) {
    errors++;
    const result: PollingResult = {
      type: "ERROR",
      payload: { message: (err as Error).message, totalErrors: errors },
    };
    self.postMessage(result);
  }
}

function getStats(): PollingStats {
  const now = Date.now();
  return {
    totalPolls,
    errors,
    avgLatency: latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0,
    uptime: startTime > 0 ? (now - startTime) / 1000 : 0,
    pollsPerSecond: startTime > 0 ? totalPolls / ((now - startTime) / 1000) : 0,
    isRunning: timerId !== null,
    interval: config?.interval ?? 0,
    dataPoints: history.length,
  };
}

self.onmessage = (event: MessageEvent<PollingCommand>) => {
  const command = event.data;

  switch (command.type) {
    case "START": {
      if (timerId !== null) {
        clearInterval(timerId);
      }
      config = command.config;
      history = [];
      totalPolls = 0;
      errors = 0;
      latencies = [];
      startTime = Date.now();
      timerId = setInterval(poll, config.interval);
      // 即座に1回実行
      poll();
      self.postMessage({
        type: "STATUS",
        payload: { status: "started", interval: config.interval },
      } as PollingResult);
      break;
    }

    case "STOP": {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
      self.postMessage({
        type: "STATUS",
        payload: { status: "stopped", stats: getStats() },
      } as PollingResult);
      break;
    }

    case "UPDATE_INTERVAL": {
      if (timerId !== null && config) {
        clearInterval(timerId);
        config.interval = command.interval;
        timerId = setInterval(poll, config.interval);
        self.postMessage({
          type: "STATUS",
          payload: { status: "interval-updated", interval: command.interval },
        } as PollingResult);
      }
      break;
    }

    case "GET_STATS": {
      self.postMessage({
        type: "STATS",
        payload: getStats(),
      } as PollingResult);
      break;
    }
  }
};
