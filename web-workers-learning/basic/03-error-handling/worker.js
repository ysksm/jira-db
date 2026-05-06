// ====================================
// 03: エラーハンドリング
// ====================================

self.onmessage = function (event) {
  const { type } = event.data;

  switch (type) {
    case "throw-error":
      // 明示的にエラーをスローする → onerror で捕捉される
      throw new Error("Worker 内で意図的にスローされたエラー");

    case "reference-error":
      // 存在しない変数を参照 → onerror で捕捉される
      undefinedVariable.doSomething();
      break;

    case "type-error":
      // 型エラー
      null.toString();
      break;

    case "graceful-error":
      // try/catch で捕捉して、エラーメッセージとして返す（推奨パターン）
      try {
        JSON.parse("{ invalid json }");
      } catch (err) {
        self.postMessage({
          type: "error",
          payload: {
            message: err.message,
            name: err.name,
            handled: true,
          },
        });
      }
      break;

    case "async-error":
      // 非同期エラー（unhandled rejection）
      // → messageerror ではなく unhandledrejection で捕捉
      fetch("https://nonexistent-domain-12345.example.com/api").catch((err) => {
        self.postMessage({
          type: "error",
          payload: {
            message: err.message,
            name: "NetworkError",
            handled: true,
          },
        });
      });
      break;

    case "normal":
      self.postMessage({ type: "success", payload: "正常に処理されました" });
      break;
  }
};

// Worker 内でのグローバルエラーハンドリング
self.onerror = function (event) {
  console.error("[Worker onerror]", event);
  // ここで return true すると、メインスレッドの onerror への伝播を抑制できる
  // return true;
};
