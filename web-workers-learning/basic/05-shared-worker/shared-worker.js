// ====================================
// 05: SharedWorker
// ====================================
// SharedWorker は複数のタブ/ウィンドウ/iframe 間で共有される Worker
// - Dedicated Worker: 1つの親に対して 1つの Worker
// - SharedWorker: 複数の親で 1つの Worker を共有

// 接続中のポートを管理
const ports = [];
let connectionCount = 0;
let sharedState = {
  messages: [],
  users: new Set(),
};

// 新しい接続を処理
self.onconnect = function (event) {
  const port = event.ports[0];
  const clientId = ++connectionCount;
  ports.push({ port, clientId });

  // この接続のメッセージハンドラ
  port.onmessage = function (event) {
    const { type, payload } = event.data;

    switch (type) {
      case "register": {
        sharedState.users.add(payload.name);
        // 全クライアントに通知
        broadcast({
          type: "user-joined",
          payload: {
            name: payload.name,
            totalUsers: sharedState.users.size,
            totalConnections: ports.length,
          },
        });
        break;
      }

      case "chat": {
        const msg = {
          from: payload.from,
          text: payload.text,
          time: new Date().toLocaleTimeString(),
        };
        sharedState.messages.push(msg);

        // 全クライアントにブロードキャスト
        broadcast({
          type: "chat-message",
          payload: msg,
        });
        break;
      }

      case "get-state": {
        port.postMessage({
          type: "state",
          payload: {
            messages: sharedState.messages,
            users: [...sharedState.users],
            connections: ports.length,
          },
        });
        break;
      }
    }
  };

  // 接続通知を送信
  port.postMessage({
    type: "connected",
    payload: {
      clientId,
      totalConnections: ports.length,
    },
  });

  port.start();
};

// 全クライアントにブロードキャスト
function broadcast(message) {
  ports.forEach(({ port }) => {
    try {
      port.postMessage(message);
    } catch (e) {
      // 切断されたポートを除去
    }
  });
}
