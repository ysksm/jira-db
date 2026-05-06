// ====================================
// 06: React + Worker 基本統合
// ====================================
// Vite では `new Worker(new URL(...), { type: 'module' })` でインポートする

export type WorkerRequest = {
  id: string;
  type: "fibonacci" | "sort" | "prime-check";
  payload: unknown;
};

export type WorkerResponse = {
  id: string;
  type: "result" | "error";
  payload: unknown;
};

// フィボナッチ計算（再帰、意図的に遅い）
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 大量データソート
function heavySort(size: number): number[] {
  const arr = Array.from({ length: size }, () => Math.random());
  return arr.sort((a, b) => a - b);
}

// 素数判定
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data;
  const start = performance.now();

  try {
    let result: unknown;

    switch (type) {
      case "fibonacci": {
        const n = payload as number;
        result = { input: n, output: fibonacci(n) };
        break;
      }
      case "sort": {
        const size = payload as number;
        const sorted = heavySort(size);
        result = {
          size,
          first5: sorted.slice(0, 5).map((v) => v.toFixed(6)),
          last5: sorted.slice(-5).map((v) => v.toFixed(6)),
        };
        break;
      }
      case "prime-check": {
        const num = payload as number;
        result = { number: num, isPrime: isPrime(num) };
        break;
      }
    }

    const elapsed = performance.now() - start;
    const response: WorkerResponse = {
      id,
      type: "result",
      payload: { ...result as object, elapsed: `${elapsed.toFixed(2)}ms` },
    };
    self.postMessage(response);
  } catch (err) {
    const response: WorkerResponse = {
      id,
      type: "error",
      payload: { message: (err as Error).message },
    };
    self.postMessage(response);
  }
};
