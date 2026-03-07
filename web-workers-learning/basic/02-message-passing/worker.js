// ====================================
// 02: メッセージパッシングパターン
// ====================================
// Worker 間の通信パターンを学ぶ

// パターン1: Request/Response（IDで紐付け）
// パターン2: ストリーミング（複数回のレスポンス）
// パターン3: 構造化データの送受信

self.onmessage = function (event) {
  const { id, type, payload } = event.data;

  switch (type) {
    // パターン1: Request/Response
    case "request-response": {
      const result = payload.numbers.reduce((a, b) => a + b, 0);
      self.postMessage({ id, type: "response", payload: { sum: result } });
      break;
    }

    // パターン2: ストリーミング（進捗付き）
    case "streaming": {
      const total = payload.steps;
      for (let i = 1; i <= total; i++) {
        // 少し計算する
        let dummy = 0;
        for (let j = 0; j < 1e6; j++) dummy += Math.random();

        // 進捗を送信
        self.postMessage({
          id,
          type: "progress",
          payload: { current: i, total, percent: ((i / total) * 100).toFixed(0) + "%" },
        });
      }
      self.postMessage({
        id,
        type: "complete",
        payload: { message: `${total} ステップ完了` },
      });
      break;
    }

    // パターン3: 構造化データ（配列・オブジェクト）
    case "structured-data": {
      const users = payload.users.map((user) => ({
        ...user,
        nameUpper: user.name.toUpperCase(),
        processed: true,
        processedAt: new Date().toISOString(),
      }));
      self.postMessage({ id, type: "structured-response", payload: { users } });
      break;
    }
  }
};
