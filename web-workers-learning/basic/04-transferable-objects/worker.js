// ====================================
// 04: Transferable Objects
// ====================================
// 通常の postMessage はデータを構造化クローンでコピーする（遅い）
// Transferable Objects は所有権を移転する（高速、ゼロコピー）

self.onmessage = function (event) {
  const { type, payload } = event.data;

  switch (type) {
    case "process-arraybuffer": {
      // ArrayBuffer を受け取って加工する
      // transfer された場合、メインスレッド側のバッファは使えなくなる
      const buffer = payload.buffer;
      const view = new Float64Array(buffer);

      // 各要素を2倍にする
      for (let i = 0; i < view.length; i++) {
        view[i] = view[i] * 2;
      }

      // 結果を transfer で返す（ゼロコピー）
      self.postMessage(
        {
          type: "processed",
          payload: {
            buffer: view.buffer,
            length: view.length,
          },
        },
        [view.buffer] // 第2引数: transfer リスト
      );
      break;
    }

    case "benchmark": {
      // ベンチマーク用: 受け取ったバッファをそのまま返す
      const buf = payload.buffer;
      const method = payload.method;

      if (method === "transfer") {
        // Transfer: ゼロコピー
        self.postMessage(
          { type: "benchmark-result", payload: { buffer: buf, method } },
          [buf]
        );
      } else {
        // Clone: 構造化クローンでコピー
        self.postMessage({
          type: "benchmark-result",
          payload: { buffer: buf, method },
        });
      }
      break;
    }

    case "process-image": {
      // ImageData 風のバッファを処理（グレースケール変換）
      const imgBuffer = new Uint8ClampedArray(payload.buffer);
      for (let i = 0; i < imgBuffer.length; i += 4) {
        const gray = imgBuffer[i] * 0.299 + imgBuffer[i + 1] * 0.587 + imgBuffer[i + 2] * 0.114;
        imgBuffer[i] = gray;     // R
        imgBuffer[i + 1] = gray; // G
        imgBuffer[i + 2] = gray; // B
        // imgBuffer[i + 3] はアルファ値（そのまま）
      }
      self.postMessage(
        { type: "image-processed", payload: { buffer: imgBuffer.buffer } },
        [imgBuffer.buffer]
      );
      break;
    }
  }
};
