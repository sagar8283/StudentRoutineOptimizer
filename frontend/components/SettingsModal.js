// components/SettingsModal.jsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import { SETTINGS_IMAGE } from '../components/api';

const STORAGE_KEY = 'app_settings';

const defaultSettings = {
  theme: 'light',
  defaultDuration: 60,
  notifications: {
    enabled: false,
    desktop: false,
    sound: false,
    reminderMinutesBefore: 10,
  },
  focus: {
    enabled: false,
    sessionMinutes: 25,
    breakMinutes: 5,
    autoStartNext: false,
  },
  preferredStudy: {
    startHour: 18,
    endHour: 21,
  },
  autoschedule: {
    enabled: false,
    strategy: 'deadline',
  },
  reminders: {
    dailySummary: false,
  },
  language: 'en',
  hideCompletedTasks: false,
};

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings((s) => ({ ...s, ...JSON.parse(raw) }));
    } catch (e) {
      console.warn("Failed reading settings");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed saving settings");
    }
  }, [settings, loaded]);

  useEffect(() => {
    const root = document.documentElement;
    const theme = settings.theme;

    if (theme === "system") {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", dark);
    } else root.classList.toggle("dark", theme === "dark");
  }, [settings.theme]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}



// ---------------------------------------------
// CYBERPUNK UPGRADE COMPONENTS
// ---------------------------------------------

function Row({ children }) {
  return <div className="mb-3">{children}</div>;
}

function Label({ children }) {
  return <div className="text-sm text-cyan-300 mb-1">{children}</div>;
}



// ---------------------------------------------
// MAIN CYBERPUNK MODAL
// ---------------------------------------------
export default function SettingsModal({ open, onClose }) {
  const { settings, setSettings } = useSettings();
  const [local, setLocal] = useState(settings);

  useEffect(() => setLocal(settings), [open, settings]);

  function update(path, value) {
    setLocal((old) => {
      const c = JSON.parse(JSON.stringify(old));
      const parts = path.split(".");
      let obj = c;

      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] ??= {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return c;
    });
  }

  function save() {
    setSettings(local);
    onClose();
  }

  function reset() {
    setLocal(defaultSettings);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative max-w-4xl w-full mx-4 p-6 rounded-xl cyber-modal border border-cyan-500">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 neon-header">
          <div className="flex items-center gap-4">
            <img
              src={SETTINGS_IMAGE}
              className="w-14 h-14 rounded-lg shadow-neon-cyan"
            />

            <div>
              <h2 className="text-2xl font-bold text-cyan-300 neon-text">
                SETTINGS
              </h2>
              <p className="text-sm text-slate-400">
                Customize your cyberpunk environment
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button className="cyber-btn small" onClick={reset}>
              Reset
            </button>
            <button className="cyber-btn small" onClick={onClose}>
              Close
            </button>
            <button className="cyber-btn-pink small" onClick={save}>
              Save
            </button>
          </div>
        </div>

        {/* GRID SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[75vh] overflow-auto pr-3">

          {/* THEME */}
          <Section title="Theme">
            <Row>
              <Label>Theme Mode</Label>
              <select
                value={local.theme}
                onChange={(e) => update("theme", e.target.value)}
                className="cyber-input"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </Row>
          </Section>

          {/* DEFAULT TASK */}
          <Section title="Default Task">
            <Row>
              <Label>Default Duration (minutes)</Label>
              <input
                type="number"
                min="1"
                value={local.defaultDuration}
                onChange={(e) => update("defaultDuration", Number(e.target.value))}
                className="cyber-input"
              />
            </Row>

            <Row>
              <Label>Auto-Schedule Task</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={local.autoschedule.enabled}
                  onChange={(e) =>
                    update("autoschedule.enabled", e.target.checked)
                  }
                />
                <span className="text-slate-300">Enable Auto-Scheduling</span>
              </div>
            </Row>

            <Row>
              <Label>Strategy</Label>
              <select
                value={local.autoschedule.strategy}
                onChange={(e) => update("autoschedule.strategy", e.target.value)}
                className="cyber-input"
              >
                <option value="deadline">By Deadline</option>
                <option value="priority">By Priority</option>
              </select>
            </Row>
          </Section>

          {/* NOTIFICATIONS */}
          <Section title="Notifications">
            <Row>
              <Label>Enable Notifications</Label>
              <Toggle
                checked={local.notifications.enabled}
                onChange={(v) => update("notifications.enabled", v)}
              />
            </Row>

            <Row>
              <Label>Desktop</Label>
              <Toggle
                checked={local.notifications.desktop}
                onChange={(v) => update("notifications.desktop", v)}
              />
            </Row>

            <Row>
              <Label>Reminder Minutes Before</Label>
              <input
                type="number"
                min="0"
                value={local.notifications.reminderMinutesBefore}
                onChange={(e) =>
                  update("notifications.reminderMinutesBefore", Number(e.target.value))
                }
                className="cyber-input"
              />
            </Row>
          </Section>

          {/* FOCUS MODE */}
          <Section title="Focus Mode">
            <Row>
              <Toggle
                checked={local.focus.enabled}
                onChange={(v) => update("focus.enabled", v)}
              />
              <span className="text-slate-300 ml-3">Enable Pomodoro Mode</span>
            </Row>

            <Row>
              <Label>Session (minutes)</Label>
              <input
                type="number"
                min="5"
                value={local.focus.sessionMinutes}
                onChange={(e) =>
                  update("focus.sessionMinutes", Number(e.target.value))
                }
                className="cyber-input"
              />
            </Row>

            <Row>
              <Label>Break (minutes)</Label>
              <input
                type="number"
                min="1"
                value={local.focus.breakMinutes}
                onChange={(e) =>
                  update("focus.breakMinutes", Number(e.target.value))
                }
                className="cyber-input"
              />
            </Row>

            <Row>
              <Toggle
                checked={local.focus.autoStartNext}
                onChange={(v) => update("focus.autoStartNext", v)}
              />
              <span className="text-slate-300 ml-3">Auto-start next session</span>
            </Row>
          </Section>

          {/* PREFERRED STUDY */}
          <Section title="Preferred Study Times">
            <Row>
              <Label>Start Hour</Label>
              <input
                type="number"
                min="0"
                max="23"
                value={local.preferredStudy.startHour}
                onChange={(e) =>
                  update("preferredStudy.startHour", Number(e.target.value))
                }
                className="cyber-input"
              />
            </Row>

            <Row>
              <Label>End Hour</Label>
              <input
                type="number"
                min="0"
                max="23"
                value={local.preferredStudy.endHour}
                onChange={(e) =>
                  update("preferredStudy.endHour", Number(e.target.value))
                }
                className="cyber-input"
              />
            </Row>
          </Section>

          {/* REMINDERS */}
          <Section title="Reminders & Language">
            <Row>
              <Toggle
                checked={local.reminders.dailySummary}
                onChange={(v) => update("reminders.dailySummary", v)}
              />
              <span className="text-slate-300 ml-3">Daily summary email</span>
            </Row>

            <Row>
              <Label>Language</Label>
              <select
                value={local.language}
                onChange={(e) => update("language", e.target.value)}
                className="cyber-input"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                <option value="kn">Kannada</option>
                <option value="ta">Tamil</option>
              </select>
            </Row>
          </Section>

          {/* IMPORT / EXPORT / ACCOUNT */}
          <Section title="Data & Account">
            <Row>
              <button
                className="cyber-btn small"
                onClick={() => {
                  const payload = { settings: local };
                  const blob = new Blob([JSON.stringify(payload, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "student_optimizer_settings.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Settings
              </button>
            </Row>

            <Row>
              <Label>Import Settings</Label>
              <input
                type="file"
                className="cyber-input"
                accept="application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const json = JSON.parse(ev.target.result);
                      if (json.settings) {
                        setLocal(json.settings);
                        alert("Imported successfully — press Save.");
                      } else alert("Invalid file");
                    } catch {
                      alert("Invalid JSON");
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </Row>

            <Row>
              <Label>Account</Label>
              <button
                className="cyber-btn small"
                onClick={() => (window.location.href = "/logout")}
              >
                Logout
              </button>

              <button
                className="cyber-btn danger small ml-2"
                onClick={() => {
                  if (!confirm("Clear all settings?")) return;
                  localStorage.removeItem(STORAGE_KEY);
                  setLocal(defaultSettings);
                  setSettings(defaultSettings);
                }}
              >
                Clear Local Settings
              </button>
            </Row>
          </Section>

        </div>
      </div>

      {/* CYBERPUNK STYLING */}
      <style jsx>{`
        .cyber-modal {
          background: #041018ee;
          box-shadow:
            0 0 25px #00eaff55,
            inset 0 0 25px #ff2dfc33;
          backdrop-filter: blur(8px);
        }

        .neon-header {
          border-bottom: 1px solid #00eaff33;
          padding-bottom: 10px;
        }

        .shadow-neon-cyan {
          box-shadow: 0 0 12px #00eaffaa;
        }

        .cyber-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 6px;
          background: #021018;
          border: 1px solid #00eaff99;
          color: #b4ecff;
          box-shadow: inset 0 0 10px #00eaff44;
        }

        .cyber-btn {
          padding: 8px 14px;
          border: 1px solid #00eaff88;
          color: #8eeaff;
          background: #021018;
          border-radius: 6px;
          transition: 0.2s;
          box-shadow: 0 0 12px #00eaff44;
        }

        .cyber-btn:hover {
          background: #00eaff22;
          transform: translateY(-2px);
        }

        .cyber-btn-pink {
          padding: 8px 16px;
          border-radius: 6px;
          background: linear-gradient(to right, #ff2dfc, #00eaff);
          color: black;
          font-weight: bold;
          box-shadow: 0 0 20px #ff2dfc88, 0 0 20px #00eaff88;
        }

        .cyber-btn.small {
          padding: 6px 10px;
        }

        .cyber-btn.danger {
          border-color: #ff2dfc88;
          color: #ff9efb;
        }

        .cyber-btn.danger:hover {
          background: #ff2dfc22;
        }
      `}</style>
    </div>
  );
}


// ---------------------------------------------
// HELPER COMPONENTS
// ---------------------------------------------

function Section({ title, children }) {
  return (
    <div className="p-4 rounded-lg border border-cyan-500 bg-[#03101c]/60 shadow-inner neon-panel-section relative">
      <h3 className="text-lg font-semibold text-cyan-300 mb-3 neon-text">
        {title}
      </h3>
      {children}

      <style jsx>{`
        .neon-panel-section {
          box-shadow:
            inset 0 0 20px #00eaff22,
            0 0 20px #00eaff22;
        }
      `}</style>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full cursor-pointer flex items-center p-1 transition ${
        checked
          ? "bg-fuchsia-500 shadow-[0_0_12px_#ff2dfc]"
          : "bg-slate-700"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white transition-all ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
}
