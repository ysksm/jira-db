import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import Page06BasicReactWorker from "./pages/Page06BasicReactWorker.tsx";
import Page07UseWorkerHook from "./pages/Page07UseWorkerHook.tsx";
import Page08WorkerReducer from "./pages/Page08WorkerReducer.tsx";
import Page09PollingDashboard from "./pages/Page09PollingDashboard.tsx";

const pages = [
  { path: "/06-basic-react-worker", label: "06: React + Worker 基本", component: Page06BasicReactWorker },
  { path: "/07-use-worker-hook", label: "07: useWorker Hook", component: Page07UseWorkerHook },
  { path: "/08-worker-reducer", label: "08: Worker + useReducer", component: Page08WorkerReducer },
  { path: "/09-polling-dashboard", label: "09: Polling Dashboard", component: Page09PollingDashboard },
];

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Web Workers Learning - Advanced (React + TypeScript)</h1>
        <nav className="nav">
          {pages.map((page) => (
            <NavLink
              key={page.path}
              to={page.path}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {page.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/06-basic-react-worker" replace />} />
          {pages.map((page) => (
            <Route key={page.path} path={page.path} element={<page.component />} />
          ))}
        </Routes>
      </main>
    </div>
  );
}
