// ====================================
// 01: 基本的な Web Worker
// ====================================
// このファイルはメインスレッドとは別のスレッドで実行される
// - DOM にアクセスできない
// - window オブジェクトがない
// - self がグローバルスコープ (DedicatedWorkerGlobalScope)

// メインスレッドからメッセージを受け取る
self.onmessage = function (event) {
  console.log("[Worker] メッセージ受信:", event.data);

  const { type, payload } = event.data;

  switch (type) {
    case "heavy-calc": {
      // 重い計算をシミュレート（メインスレッドをブロックしない）
      const start = performance.now();
      let result = 0;
      for (let i = 0; i < payload.iterations; i++) {
        result += Math.sqrt(i) * Math.sin(i);
      }
      const elapsed = performance.now() - start;

      // 結果をメインスレッドに返す
      self.postMessage({
        type: "result",
        payload: {
          result: result.toFixed(4),
          elapsed: elapsed.toFixed(2) + "ms",
          iterations: payload.iterations,
        },
      });
      break;
    }

    case "ping": {
      self.postMessage({ type: "pong", payload: "Worker is alive!" });
      break;
    }

    default:
      self.postMessage({ type: "error", payload: `Unknown type: ${type}` });
  }
};

// Worker が読み込まれたことを通知
self.postMessage({ type: "ready", payload: "Worker initialized" });
