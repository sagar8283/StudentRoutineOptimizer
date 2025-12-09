// components/TasksList.js
import { useEffect, useState } from "react";
import { API_BASE } from "./api";
import { useSettings } from "./SettingsModal";

export default function TasksList({ userId = 1, refreshKey = 0 }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  let settings = null;
  try {
    const ctx = useSettings();
    settings = ctx.settings;
  } catch {
    settings = null;
  }

  async function safeJSON(res) {
    const txt = await res.text();
    try {
      return txt ? JSON.parse(txt) : {};
    } catch {
      console.warn("Non-JSON:", txt.slice(0, 500));
      return {};
    }
  }

  async function fetchTasks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/tasks/user/${userId}`);
      const json = await safeJSON(res);
      if (!res.ok) throw new Error(json.error || json.message || `Status ${res.status}`);
      setTasks(json || []);
    } catch (err) {
      setError(err.message || "Error fetching tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshKey]);

  async function handleDelete(id) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const body = await safeJSON(res);
        throw new Error(body.error || "Delete failed");
      }
      setTasks((t) => t.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete");
    }
  }

  async function markDone(task) {
    try {
      const newStatus = task.status === "done" ? "pending" : "done";
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await safeJSON(res);
      if (!res.ok) throw new Error(json.error || "Update failed");
      setTasks((arr) => arr.map((t) => (t.id === task.id ? json : t)));
    } catch (err) {
      alert(err.message || "Failed to update");
    }
  }

  const hideCompleted = settings && settings.hideCompletedTasks;
  const visibleTasks = hideCompleted ? tasks.filter(t => t.status !== "done") : tasks;

  return (
    <div className="p-5 rounded-xl bg-[#041018]/60 border border-cyan-600 neon-panel text-slate-100 shadow-xl">
      <h4 className="font-bold text-cyan-300 mb-3 tracking-wide neon-text">Your Tasks</h4>

      {loading && <div className="text-sm text-slate-400">Loading...</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}

      {!loading && visibleTasks.length === 0 && (
        <div className="text-sm text-slate-500">No tasks yet</div>
      )}

      <ul className="divide-y divide-cyan-900/30 mt-3">
        {visibleTasks.map((t) => (
          <li
            key={t.id}
            className={`py-3 flex items-start justify-between gap-3 group transition ${t.status === "done"
              ? "opacity-70"
              : "opacity-100"
            }`}
          >
            {/* LEFT SIDE */}
            <div className="flex items-start gap-3">
              {/* Neon Status Button */}
              <button
                onClick={() => markDone(t)}
                title={t.status === "done" ? "Mark pending" : "Mark done"}
                className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-bold transition
                  ${
                    t.status === "done"
                      ? "bg-green-500 text-black border-green-400 shadow-glow-green"
                      : "bg-[#021018] border-cyan-500 text-cyan-300 hover:bg-cyan-600/20"
                  }
                `}
              >
                ✓
              </button>

              <div>
                <div
                  className={`font-semibold ${
                    t.status === "done"
                      ? "line-through text-slate-500"
                      : "text-slate-100"
                  }`}
                >
                  {t.title}
                </div>

                <div className="text-xs text-slate-400">
                  {t.category ? `${t.category} • ` : ""}
                  {t.priority ? `Priority: ${t.priority} • ` : ""}
                  {t.duration_minutes ? `${t.duration_minutes} min • ` : ""}
                  {t.deadline ? `Due: ${new Date(t.deadline).toLocaleString()}` : ""}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(t.id)}
                className="text-sm px-2 py-1 rounded border border-red-500 text-red-400 
                           hover:bg-red-600/10 transition shadow-glow-red"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Neon Effects */}
      <style jsx>{`
        .neon-panel {
          box-shadow: inset 0 0 25px rgba(0, 255, 255, 0.05), 0 0 25px rgba(0, 255, 255, 0.05);
          backdrop-filter: blur(6px);
        }
        .neon-text {
          text-shadow: 0 0 6px rgba(0, 255, 255, 0.4), 0 0 18px rgba(255, 0, 255, 0.3);
        }
        .shadow-glow-red {
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.4);
        }
        .shadow-glow-green {
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.4);
        }
      `}</style>
    </div>
  );
}
