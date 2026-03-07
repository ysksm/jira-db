// ====================================
// 09: 高頻度ポーリング + Worker ダッシュボード
// ====================================
// Worker でポーリング・集計を行い、React で可視化する

import { useEffect, useRef } from "react";
import { usePollingWorker } from "../hooks/usePollingWorker.ts";

function MiniChart({
  data,
  dataKey,
  color,
  label,
  unit,
  height = 80,
}: {
  data: Array<Record<string, number>>;
  dataKey: string;
  color: string;
  label: string;
  unit: string;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const values = data.map((d) => d[dataKey]);
    const max = Math.max(...values) * 1.1 || 1;
    const min = Math.min(...values) * 0.9;
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    // グリッド
    ctx.strokeStyle = "#1a3a5c";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 塗りつぶし
    ctx.fillStyle = color + "20";
    ctx.beginPath();
    ctx.moveTo(0, h);
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // ライン
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 最新値
    const latest = values[values.length - 1];
    ctx.fillStyle = color;
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${latest.toFixed(1)}${unit}`, w - 4, 16);

    // ラベル
    ctx.fillStyle = "#ffffff80";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, 4, 14);
  }, [data, dataKey, color, label, unit, height]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={height}
      style={{
        width: "100%",
        height,
        background: "#0a1931",
        borderRadius: 6,
      }}
    />
  );
}

function MetricCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#0a1931",
        borderRadius: 8,
        padding: "12px 16px",
        textAlign: "center",
        minWidth: 100,
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: "bold", color: color ?? "#4ecca3" }}>
        {value}
        <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

export default function Page09PollingDashboard() {
  const {
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
  } = usePollingWorker({ interval: 500, maxHistory: 300 });

  const current = metrics?.current;
  const history = metrics?.recentHistory ?? [];
  const agg = metrics?.aggregated;

  return (
    <div>
      <h2>09: 高頻度ポーリング + Worker ダッシュボード</h2>

      <div className="explanation">
        <strong>学習ポイント:</strong>
        <ul>
          <li>Worker が <code>setInterval</code> で高頻度ポーリングを実行</li>
          <li>データの集計・異常検知も Worker 内で処理 → メインスレッドは描画に集中</li>
          <li><code>usePollingWorker</code> フックでポーリング制御を抽象化</li>
          <li>開始/停止/間隔変更がリアクティブに動作</li>
          <li>Canvas でリアルタイムチャートを描画</li>
        </ul>
        <pre>{`const { start, stop, updateInterval, metrics } = usePollingWorker({
  interval: 500,   // 500ms ごとにポーリング
  maxHistory: 300,  // 直近300件を保持
});

// metrics.current  → 最新値
// metrics.recentHistory → チャート用データ
// metrics.aggregated → 移動平均等の集計値`}</pre>
      </div>

      {/* コントロールパネル */}
      <div className="card">
        <h3>ポーリング制御</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {!isRunning ? (
            <button onClick={() => start()} style={{ background: "#4ecca3", color: "#1a1a2e" }}>
              開始
            </button>
          ) : (
            <button onClick={stop} style={{ background: "#e94560" }}>
              停止
            </button>
          )}

          <span style={{ opacity: 0.6 }}>間隔:</span>
          {[100, 200, 500, 1000, 2000].map((ms) => (
            <button
              key={ms}
              onClick={() => updateInterval(ms)}
              style={{
                background: interval === ms ? "#4ecca3" : "#0f3460",
                color: interval === ms ? "#1a1a2e" : "#eee",
                padding: "6px 12px",
                fontSize: 12,
              }}
            >
              {ms}ms
            </button>
          ))}

          <button onClick={getStats} style={{ background: "#0f3460", marginLeft: "auto" }}>
            Stats
          </button>

          <span className={`badge ${isRunning ? "badge-green" : "badge-red"}`}>
            {isRunning ? "Running" : "Stopped"}
          </span>
          <span style={{ opacity: 0.5, fontSize: 12 }}>
            {dataCount} polls
          </span>
        </div>
      </div>

      {/* 異常検知アラート */}
      {anomalies.length > 0 && (
        <div
          className="card"
          style={{
            background: "#2d1b2e",
            borderLeft: "4px solid #e94560",
          }}
        >
          <h3 style={{ color: "#e94560", margin: "0 0 8px" }}>Anomaly Detected</h3>
          {anomalies.map((a, i) => (
            <div key={i} style={{ color: "#ff6b81", fontSize: 13 }}>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* 現在値 */}
      {current && (
        <div className="card">
          <h3>現在のメトリクス</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            <MetricCard
              label="CPU"
              value={current.cpu.toFixed(1)}
              unit="%"
              color={current.cpu > 80 ? "#e94560" : "#4ecca3"}
            />
            <MetricCard
              label="Memory"
              value={current.memory.toFixed(1)}
              unit="%"
              color={current.memory > 85 ? "#e94560" : "#4ecca3"}
            />
            <MetricCard label="Latency" value={current.latency.toFixed(0)} unit="ms" />
            <MetricCard label="RPS" value={current.requestsPerSec} unit="" color="#f1c40f" />
            <MetricCard
              label="Error Rate"
              value={current.errorRate.toFixed(2)}
              unit="%"
              color={current.errorRate > 3 ? "#e94560" : "#4ecca3"}
            />
            <MetricCard label="Connections" value={current.activeConnections} unit="" />
          </div>
        </div>
      )}

      {/* 集計値 */}
      {agg && (
        <div className="card">
          <h3>集計情報（Worker 内で計算）</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
            <span>CPU 平均: <strong>{agg.cpuAvg}%</strong></span>
            <span>CPU 最大: <strong>{agg.cpuMax}%</strong></span>
            <span>Memory 平均: <strong>{agg.memAvg}%</strong></span>
            <span>Memory 最大: <strong>{agg.memMax}%</strong></span>
            <span>Latency 平均: <strong>{agg.latencyAvg}ms</strong></span>
            <span>データ点数: <strong>{metrics?.historyLength}</strong></span>
          </div>
        </div>
      )}

      {/* リアルタイムチャート */}
      {history.length > 1 && (
        <div className="card">
          <h3>リアルタイムチャート（直近 {history.length} データポイント）</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <MiniChart data={history} dataKey="cpu" color="#4ecca3" label="CPU Usage" unit="%" />
            <MiniChart data={history} dataKey="memory" color="#3498db" label="Memory" unit="%" />
            <MiniChart
              data={history}
              dataKey="latency"
              color="#f1c40f"
              label="Latency"
              unit="ms"
            />
            <MiniChart data={history} dataKey="rps" color="#e94560" label="Requests/sec" unit="" />
          </div>
        </div>
      )}

      {/* 統計情報 */}
      {stats && (
        <div className="card">
          <h3>Worker 統計</h3>
          <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.8 }}>
            <div>Total Polls: {stats.totalPolls}</div>
            <div>Errors: {stats.errors}</div>
            <div>Avg Poll Latency: {stats.avgLatency.toFixed(4)}ms</div>
            <div>Uptime: {stats.uptime.toFixed(1)}s</div>
            <div>Polls/sec: {stats.pollsPerSecond.toFixed(2)}</div>
            <div>Data Points: {stats.dataPoints}</div>
            <div>Interval: {stats.interval}ms</div>
          </div>
        </div>
      )}
    </div>
  );
}
