// components/TaskForm.js
import { useEffect, useState } from "react";
import { API_BASE } from "./api";
import { useSettings } from "./SettingsModal";

export default function TaskForm({ userId = 1, onCreated = () => {} }) {
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  let settings = null;
  try {
    settings = useSettings().settings;
  } catch {
    settings = null;
  }

  useEffect(() => {
    if (settings?.defaultDuration) {
      setDurationMinutes(settings.defaultDuration);
    }
  }, [settings]);

  function resetForm() {
    setTitle("");
    setDurationMinutes(settings?.defaultDuration || 60);
    setDeadline("");
    setPriority("");
    setCategory("");
  }

  async function safeParse(res) {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Server returned non-JSON (status ${res.status}):\n${text}`);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: userId,
        title: title.trim(),
        duration_minutes: Number(durationMinutes),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        priority: priority || null,
        category: category || null,
      };

      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await safeParse(res);
      if (!res.ok) throw new Error(json.error || json.message);

      resetForm();
      onCreated(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 rounded-xl bg-[#041018]/60 border border-fuchsia-600 neon-panel shadow-xl">

      <h4 className="text-fuchsia-300 font-semibold mb-4 neon-text tracking-wide">
        Create Task
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* TITLE */}
        <div>
          <label className="cyber-label">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="cyber-input"
          />
        </div>

        {/* DURATION + PRIORITY */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="cyber-label">Duration (min)</label>
            <input
              type="number"
              min={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="cyber-input"
            />
          </div>

          <div>
            <label className="cyber-label">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="cyber-input"
            >
              <option value="">—</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* DEADLINE */}
        <div>
          <label className="cyber-label">Deadline (optional)</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="cyber-input"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="cyber-label">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Study, Exercise"
            className="cyber-input"
          />
        </div>

        {/* ERROR */}
        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="cyber-btn-pink flex-1"
          >
            {loading ? "Saving…" : "Save Task"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="cyber-btn flex-1"
          >
            Reset
          </button>
        </div>

      </form>

      {/* CYBERPUNK STYLES */}
      <style jsx>{`
        .neon-panel {
          backdrop-filter: blur(8px);
          box-shadow:
            inset 0 0 25px #ff2dfc33,
            0 0 30px #ff2dfc44;
        }

        .neon-text {
          text-shadow: 0 0 6px #ff2dfc88, 0 0 14px #00eaff88;
        }

        .cyber-label {
          display: block;
          font-size: 0.875rem;
          color: #ffbaff;
          margin-bottom: 3px;
        }

        .cyber-input {
          width: 100%;
          padding: 10px;
          background: #020c14;
          border: 1px solid #ff2dfc88;
          color: #e8c9ff;
          border-radius: 6px;
          box-shadow: inset 0 0 12px #ff2dfc33;
          transition: 0.15s;
        }

        .cyber-input:focus {
          outline: none;
          box-shadow:
            inset 0 0 18px #ff2dfc66,
            0 0 12px #ff2dfc44;
        }

        .cyber-btn {
          padding: 10px;
          background: #021018;
          border: 1px solid #00eaff99;
          color: #8af4ff;
          font-weight: bold;
          border-radius: 6px;
          transition: 0.2s;
          box-shadow: 0 0 12px #00eaff55;
        }

        .cyber-btn:hover {
          background: #00eaff22;
          transform: translateY(-2px);
        }

        .cyber-btn-pink {
          padding: 10px;
          background: linear-gradient(to right, #ff2dfc, #00eaff);
          color: black;
          font-weight: bold;
          border-radius: 6px;
          box-shadow: 0 0 22px #ff2dfc88, 0 0 22px #00eaff88;
          transition: 0.2s;
        }

        .cyber-btn-pink:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
