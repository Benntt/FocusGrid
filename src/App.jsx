import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#FDF8F4", surface: "#FFFFFF", surfaceAlt: "#FFF5EE",
  border: "#F0E8DF", borderMid: "#E8D8CC",
  coral: "#FF6B6B", coralLight: "#FFF0F0", coralMid: "#FFD6D6",
  teal: "#3ECFB2", tealLight: "#EDFAF7", tealMid: "#B8F0E8",
  amber: "#FFAA3B", amberLight: "#FFF8EE", amberMid: "#FFE4B0",
  violet: "#8B7CF6", violetLight: "#F3F1FF", violetMid: "#D4CFFE",
  text: "#2D2A26", textMid: "#6B6560", textSoft: "#A09890",
  shadow: "rgba(45,42,38,0.07)", shadowMd: "rgba(45,42,38,0.12)",
};

const PROJECT_COLORS = [
  { name: "Coral", main: C.coral, light: C.coralLight, mid: C.coralMid },
  { name: "Teal", main: C.teal, light: C.tealLight, mid: C.tealMid },
  { name: "Amber", main: C.amber, light: C.amberLight, mid: C.amberMid },
  { name: "Violet", main: C.violet, light: C.violetLight, mid: C.violetMid },
];

const GROUP_COLORS = [
  { name: "Slate", main: "#64748B", light: "#F1F5F9", mid: "#CBD5E1" },
  { name: "Rose", main: "#F43F5E", light: "#FFF1F2", mid: "#FECDD3" },
  { name: "Blue", main: "#3B82F6", light: "#EFF6FF", mid: "#BFDBFE" },
  { name: "Green", main: "#22C55E", light: "#F0FDF4", mid: "#BBF7D0" },
  { name: "Orange", main: "#F97316", light: "#FFF7ED", mid: "#FED7AA" },
  { name: "Pink", main: "#EC4899", light: "#FDF2F8", mid: "#FBCFE8" },
  { name: "Indigo", main: "#6366F1", light: "#EEF2FF", mid: "#C7D2FE" },
  { name: "Cyan", main: "#06B6D4", light: "#ECFEFF", mid: "#A5F3FC" },
];

const GROUP_EMOJIS = ["💼", "🎮", "🏠", "❤️", "💪", "🎯", "📚", "🌟", "🚀", "🎨", "💡", "🤝"];

const PRIORITY_CONFIG = {
  high: { label: "Urgent", emoji: "🔥", bg: C.coralLight, color: C.coral, border: C.coralMid },
  medium: { label: "Normal", emoji: "⚡", bg: C.amberLight, color: C.amber, border: C.amberMid },
  low: { label: "Someday", emoji: "🌱", bg: C.tealLight, color: C.teal, border: C.tealMid },
};

const STATUS_CONFIG = {
  todo: { label: "To do", color: C.textSoft, bg: "#F5F2EF" },
  "in-progress": { label: "In progress", color: C.violet, bg: C.violetLight },
  done: { label: "Done", color: C.teal, bg: C.tealLight },
};

const MOTIVATIONAL = [
  "You've got this. One task at a time. 💪",
  "Progress, not perfection. Keep moving. ✨",
  "Small steps add up to big things. 🚀",
  "Your brain works differently — that's a superpower. 🧠",
  "Focus on what's in front of you right now. 🎯",
];

const DEFAULT_GROUPS = [
  { id: "full-sail", name: "Full Sail", emoji: "💼", colorIdx: 2, collapsed: false },
  { id: "twitch", name: "Twitch", emoji: "🎮", colorIdx: 0, collapsed: false },
  { id: "personal", name: "Personal", emoji: "🏠", colorIdx: 3, collapsed: false },
];

const UNGROUPED_ID = "__ungrouped__";

// Bennett's real projects migrated from v3, assigned to groups
const MIGRATED_PROJECTS = [
  {"id":1774470525125,"name":"Valhallan Esports","notes":"Casters","priority":"medium","colorIdx":0,"tasks":[],"aiSummary":null,"createdAt":1774470525125,"groupId":"full-sail"},
  {"id":1774470510314,"name":"NACE Casters","notes":"","priority":"medium","colorIdx":0,"tasks":[],"aiSummary":null,"createdAt":1774470510314,"groupId":"full-sail"},
  {"id":1774470269156,"name":"Special Olympics","notes":"Build out the pitch, run of show, and streamer contract.","priority":"medium","colorIdx":1,"tasks":[],"aiSummary":null,"createdAt":1774470269156,"groupId":"full-sail"},
  {"id":1774470184774,"name":"Stream Team Rebuild","notes":"","priority":"medium","colorIdx":2,"tasks":[],"aiSummary":null,"createdAt":1774470184774,"groupId":"full-sail"},
  {"id":1774470153339,"name":"GCX Volunteers","notes":"Build and continue our relationship with GCX and our ability to provide student volunteers.","priority":"medium","colorIdx":0,"tasks":[],"aiSummary":null,"createdAt":1774470153339,"groupId":"full-sail"},
  {"id":1774470095596,"name":"Full Sail Extra Life","notes":"Build 3 live fundraising events.","priority":"medium","colorIdx":2,"tasks":[],"aiSummary":null,"createdAt":1774470095596,"groupId":"full-sail"},
];

function useLocalState(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [val, key]);
  return [val, setVal];
}

const sampleProjects = MIGRATED_PROJECTS;

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Pill({ color, bg, border, children, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: small ? 11 : 12, fontWeight: 600, color,
      background: bg, border: `1.5px solid ${border || bg}`,
      borderRadius: 20, padding: small ? "2px 8px" : "3px 10px", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Avatar({ name, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>{name.charAt(0).toUpperCase()}</div>
  );
}

function ProgressRing({ pct, color, size = 48 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ - (pct/100)*circ}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  );
}

function Card({ children, style, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => onClick && setHov(false)}
      style={{
        background: C.surface, borderRadius: 16,
        border: `1.5px solid ${hov ? C.borderMid : C.border}`,
        boxShadow: hov ? `0 8px 24px ${C.shadowMd}` : `0 2px 8px ${C.shadow}`,
        transition: "all 0.2s ease", cursor: onClick ? "pointer" : "default", ...style,
      }}>{children}</div>
  );
}

function Toggle({ checked, onChange, color }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 40, height: 22, borderRadius: 11, cursor: "pointer",
      background: checked ? color : C.border, position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

function TaskRow({ task, onCycle, onDelete }) {
  const [hov, setHov] = useState(false);
  const s = STATUS_CONFIG[task.status];
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: hov ? C.bg : "transparent", transition: "background 0.15s", marginBottom: 2 }}>
      <button onClick={() => onCycle(task.id)} style={{
        width: 22, height: 22, borderRadius: "50%", border: `2px solid ${s.color}`,
        background: task.status === "done" ? s.color : "transparent",
        cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
      }}>
        {task.status === "done" && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
        {task.status === "in-progress" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "block" }} />}
      </button>
      <span style={{ flex: 1, fontSize: 14, color: task.status === "done" ? C.textSoft : C.text, textDecoration: task.status === "done" ? "line-through" : "none", transition: "color 0.15s" }}>{task.text}</span>
      <span style={{ fontSize: 12, color: C.textSoft, whiteSpace: "nowrap" }}>{task.mins}m</span>
      {hov && <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", color: C.textSoft, cursor: "pointer", fontSize: 16, padding: "0 2px" }}>×</button>}
    </div>
  );
}

// ─── Move to Group Modal ───────────────────────────────────────────────────────

function MoveToGroupModal({ project, groups, onMove, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,42,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <Card onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, padding: 24 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: C.text }}>Move project</h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: C.textSoft }}>Where should "{project.name}" go?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {groups.map(g => {
            const gc = GROUP_COLORS[g.colorIdx % GROUP_COLORS.length];
            const isCurrent = project.groupId === g.id;
            return (
              <button key={g.id} onClick={() => { onMove(project.id, g.id); onClose(); }} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                borderRadius: 12, cursor: "pointer", textAlign: "left",
                background: isCurrent ? gc.light : C.bg,
                border: `1.5px solid ${isCurrent ? gc.main : C.border}`,
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.background = gc.light; e.currentTarget.style.border = `1.5px solid ${gc.mid}`; }}}
                onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.background = C.bg; e.currentTarget.style.border = `1.5px solid ${C.border}`; }}}
              >
                <span style={{ fontSize: 20 }}>{g.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: isCurrent ? gc.main : C.text }}>{g.name}</span>
                {isCurrent && <span style={{ marginLeft: "auto", fontSize: 12, color: gc.main, fontWeight: 600 }}>current</span>}
              </button>
            );
          })}
          <button onClick={() => { onMove(project.id, null); onClose(); }} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            borderRadius: 12, cursor: "pointer", textAlign: "left",
            background: !project.groupId ? C.surfaceAlt : C.bg,
            border: `1.5px solid ${!project.groupId ? C.borderMid : C.border}`,
          }}>
            <span style={{ fontSize: 20 }}>📌</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.textMid }}>No group</span>
            {!project.groupId && <span style={{ marginLeft: "auto", fontSize: 12, color: C.textSoft, fontWeight: 600 }}>current</span>}
          </button>
        </div>
        <button onClick={onClose} style={{ marginTop: 14, width: "100%", background: "none", border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.textMid, fontSize: 14, padding: "10px", cursor: "pointer" }}>Cancel</button>
      </Card>
    </div>
  );
}

// ─── Add / Edit Group Modal ────────────────────────────────────────────────────

function GroupModal({ group, onSave, onClose }) {
  const [name, setName] = useState(group?.name || "");
  const [emoji, setEmoji] = useState(group?.emoji || "💼");
  const [colorIdx, setColorIdx] = useState(group?.colorIdx ?? 0);

  const save = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), emoji, colorIdx });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,42,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <Card onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, padding: 26 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: C.text }}>
          {group ? "Edit group" : "New group"} 📁
        </h3>

        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Group name</div>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && save()}
            placeholder="e.g. Full Sail, Twitch, Personal..."
            style={{ width: "100%", border: `1.5px solid ${C.borderMid}`, borderRadius: 10, padding: "11px 14px", fontSize: 15, color: C.text, outline: "none", boxSizing: "border-box", background: C.surface }}
          />
        </label>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 8 }}>Icon</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {GROUP_EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 38, height: 38, borderRadius: 10, fontSize: 18, cursor: "pointer",
                background: emoji === e ? C.violetLight : C.bg,
                border: `1.5px solid ${emoji === e ? C.violet : C.border}`,
                transition: "all 0.1s",
              }}>{e}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 8 }}>Color</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {GROUP_COLORS.map((gc, i) => (
              <button key={i} onClick={() => setColorIdx(i)} style={{
                width: 28, height: 28, borderRadius: "50%", background: gc.main, cursor: "pointer",
                border: `3px solid ${colorIdx === i ? C.text : "transparent"}`, transition: "border 0.15s",
              }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} style={{ flex: 1, background: GROUP_COLORS[colorIdx].main, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px", cursor: "pointer" }}>
            {group ? "Save changes" : "Create group"}
          </button>
          <button onClick={onClose} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.textMid, fontSize: 15, padding: "12px 16px", cursor: "pointer" }}>Cancel</button>
        </div>
      </Card>
    </div>
  );
}

// ─── Group Section ─────────────────────────────────────────────────────────────

function GroupSection({ group, projects, onUpdateProject, onDeleteProject, onMoveProject, onEditGroup, onDeleteGroup, apiKey, allGroups }) {
  const gc = GROUP_COLORS[group.colorIdx % GROUP_COLORS.length];
  const [collapsed, setCollapsed] = useState(group.collapsed || false);
  const [showMoveFor, setShowMoveFor] = useState(null);

  const groupProjects = projects.filter(p => p.groupId === group.id);
  const totalTasks = groupProjects.flatMap(p => p.tasks).length;
  const doneTasks = groupProjects.flatMap(p => p.tasks).filter(t => t.status === "done").length;
  const inProgress = groupProjects.flatMap(p => p.tasks).filter(t => t.status === "in-progress").length;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Group header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: collapsed ? 0 : 12,
        padding: "10px 14px", borderRadius: 14,
        background: gc.light, border: `1.5px solid ${gc.mid}`,
      }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          display: "flex", alignItems: "center", gap: 10, flex: 1,
          background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0,
        }}>
          <span style={{ fontSize: 22 }}>{group.emoji}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: gc.main, letterSpacing: "-0.01em" }}>{group.name}</div>
            <div style={{ fontSize: 11, color: C.textSoft, marginTop: 1 }}>
              {groupProjects.length} project{groupProjects.length !== 1 ? "s" : ""}
              {totalTasks > 0 && ` · ${doneTasks}/${totalTasks} tasks done`}
              {inProgress > 0 && ` · ${inProgress} in progress`}
            </div>
          </div>
          <span style={{ marginLeft: 8, color: gc.main, fontSize: 14, transition: "transform 0.2s", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", display: "block", opacity: 0.7 }}>▼</span>
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onEditGroup(group)} style={{
            background: "none", border: `1.5px solid ${gc.mid}`, borderRadius: 8,
            color: gc.main, fontSize: 12, padding: "4px 10px", cursor: "pointer", fontWeight: 600,
          }}>Edit</button>
          {groupProjects.length === 0 && (
            <button onClick={() => { if (confirm(`Delete "${group.name}"?`)) onDeleteGroup(group.id); }} style={{
              background: "none", border: `1.5px solid ${C.coralMid}`, borderRadius: 8,
              color: C.coral, fontSize: 12, padding: "4px 10px", cursor: "pointer", fontWeight: 600,
            }}>Delete</button>
          )}
        </div>
      </div>

      {/* Projects in group */}
      {!collapsed && (
        <div style={{ paddingLeft: 12, borderLeft: `3px solid ${gc.mid}` }}>
          {groupProjects.length === 0 ? (
            <div style={{ padding: "16px 14px", fontSize: 13, color: C.textSoft, fontStyle: "italic" }}>
              No projects here yet. Create one or move an existing project into this group.
            </div>
          ) : (
            groupProjects.map(p => (
              <div key={p.id}>
                <ProjectCard
                  project={p}
                  onUpdate={onUpdateProject}
                  onDelete={onDeleteProject}
                  apiKey={apiKey}
                  onMove={() => setShowMoveFor(p)}
                  groupColor={gc.main}
                />
              </div>
            ))
          )}
        </div>
      )}

      {showMoveFor && (
        <MoveToGroupModal
          project={showMoveFor}
          groups={allGroups}
          onMove={onMoveProject}
          onClose={() => setShowMoveFor(null)}
        />
      )}
    </div>
  );
}

// ─── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, onUpdate, onDelete, apiKey, onMove, groupColor }) {
  const [expanded, setExpanded] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskMins, setTaskMins] = useState(30);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const pc = PROJECT_COLORS[project.colorIdx % PROJECT_COLORS.length];
  const pri = PRIORITY_CONFIG[project.priority];
  const done = project.tasks.filter(t => t.status === "done").length;
  const pct = project.tasks.length ? Math.round((done / project.tasks.length) * 100) : 0;
  const remaining = project.tasks.filter(t => t.status !== "done");
  const totalMins = remaining.reduce((a, t) => a + (t.mins || 30), 0);

  const cycleTask = (taskId) => {
    const cycle = { todo: "in-progress", "in-progress": "done", done: "todo" };
    onUpdate({ ...project, tasks: project.tasks.map(t => t.id === taskId ? { ...t, status: cycle[t.status] } : t) });
  };
  const deleteTask = (taskId) => onUpdate({ ...project, tasks: project.tasks.filter(t => t.id !== taskId) });
  const addTask = () => {
    if (!taskText.trim()) return;
    onUpdate({ ...project, tasks: [...project.tasks, { id: Date.now(), text: taskText.trim(), status: "todo", mins: taskMins }] });
    setTaskText(""); setTaskMins(30); setAddingTask(false);
  };

  const generateSummary = async () => {
    if (!apiKey) { setAiError("Add your API key in Settings first."); return; }
    setAiLoading(true); setAiError(null);
    try {
      const doneT = project.tasks.filter(t => t.status === "done").map(t => t.text);
      const inPT = project.tasks.filter(t => t.status === "in-progress").map(t => t.text);
      const todoT = project.tasks.filter(t => t.status === "todo").map(t => t.text);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 200,
          messages: [{ role: "user", content: `You're a supportive productivity coach for adults with ADHD. Be warm, brief, and specific.\n\nProject: "${project.name}"\nCompleted: ${doneT.join(", ") || "nothing yet"}\nIn Progress: ${inPT.join(", ") || "none"}\nStill to do: ${todoT.join(", ") || "none"}\n\nWrite:\nPROGRESS: [1 encouraging sentence about what's been done]\nNEXT UP: [The single most important next action, described as a small concrete step]\nTIP: [One sentence ADHD-friendly tip for this specific project]` }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      onUpdate({ ...project, aiSummary: data.content?.[0]?.text || "" });
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  return (
    <Card style={{ marginBottom: 10, overflow: "hidden" }}>
      <div style={{ height: 3, background: groupColor || pc.main, borderRadius: "16px 16px 0 0", opacity: 0.6 }} />
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "14px 18px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={project.name} color={pc.main} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{project.name}</span>
              <Pill color={pri.color} bg={pri.bg} border={pri.border} small>{pri.emoji} {pri.label}</Pill>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 5, background: C.border, borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.teal : pc.main, borderRadius: 99, transition: "width 0.4s ease" }} />
              </div>
              <span style={{ fontSize: 11, color: C.textSoft, whiteSpace: "nowrap" }}>{done}/{project.tasks.length}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ProgressRing pct={pct} color={pct === 100 ? C.teal : pc.main} size={40} />
            <span style={{ color: C.textSoft, fontSize: 16, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", display: "block" }}>↓</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: `1.5px solid ${C.border}` }}>
          {/* Move to group button */}
          {onMove && (
            <div style={{ marginTop: 12, marginBottom: 4 }}>
              <button onClick={onMove} style={{
                background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 8,
                color: C.textSoft, fontSize: 12, padding: "5px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontWeight: 600,
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${C.violet}`; e.currentTarget.style.color = C.violet; e.currentTarget.style.background = C.violetLight; }}
                onMouseLeave={e => { e.currentTarget.style.border = `1.5px solid ${C.border}`; e.currentTarget.style.color = C.textSoft; e.currentTarget.style.background = C.bg; }}
              >
                <span>📁</span> Move to group
              </button>
            </div>
          )}

          {project.notes && (
            <div style={{ margin: "12px 0 8px", padding: "10px 14px", background: C.surfaceAlt, borderRadius: 10, fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
              📝 {project.notes}
            </div>
          )}
          {remaining.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 6px", padding: "8px 14px", background: C.amberLight, borderRadius: 10, border: `1.5px solid ${C.amberMid}` }}>
              <span>⏱️</span>
              <span style={{ fontSize: 13, color: C.textMid }}>
                Time remaining: <strong style={{ color: C.text }}>{totalMins >= 60 ? `${Math.floor(totalMins/60)}h ${totalMins%60>0?totalMins%60+"m":""}` : `${totalMins}m`}</strong>
              </span>
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textSoft, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Tasks</div>
            {project.tasks.length === 0 && <div style={{ fontSize: 13, color: C.textSoft, padding: "8px 12px" }}>No tasks yet.</div>}
            {project.tasks.map(task => <TaskRow key={task.id} task={task} onCycle={cycleTask} onDelete={deleteTask} />)}
          </div>
          {addingTask ? (
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input autoFocus value={taskText} onChange={e => setTaskText(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="What needs to get done?"
                style={{ flex: 1, minWidth: 160, border: `1.5px solid ${pc.main}`, borderRadius: 10, padding: "8px 12px", fontSize: 14, color: C.text, outline: "none", background: C.surface }} />
              <select value={taskMins} onChange={e => setTaskMins(Number(e.target.value))} style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "8px 10px", fontSize: 13, color: C.textMid, background: C.surface, outline: "none" }}>
                {[15,30,45,60,90,120].map(m => <option key={m} value={m}>{m}m</option>)}
              </select>
              <button onClick={addTask} style={{ background: pc.main, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 13, padding: "8px 16px", cursor: "pointer" }}>Add</button>
              <button onClick={() => { setAddingTask(false); setTaskText(""); }} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.textMid, fontSize: 13, padding: "8px 12px", cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setAddingTask(true)} style={{ marginTop: 8, width: "100%", background: C.bg, border: `1.5px dashed ${C.borderMid}`, borderRadius: 10, color: C.textSoft, fontSize: 13, padding: "8px", cursor: "pointer" }}>
              + Add task
            </button>
          )}
          <div style={{ marginTop: 14 }}>
            {project.aiSummary && (
              <div style={{ padding: "12px 14px", background: C.violetLight, borderRadius: 12, border: `1.5px solid ${C.violetMid}`, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.violet, marginBottom: 6 }}>✨ AI Coach</div>
                {project.aiSummary.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} style={{ margin: "0 0 4px", fontSize: 13, color: C.text, lineHeight: 1.6 }}>{line}</p>
                ))}
              </div>
            )}
            {aiError && <div style={{ padding: "8px 12px", background: C.coralLight, borderRadius: 10, fontSize: 13, color: C.coral, marginBottom: 8 }}>{aiError}</div>}
            <button onClick={generateSummary} disabled={aiLoading} style={{
              background: aiLoading ? C.violetLight : C.violet, border: "none", borderRadius: 10,
              color: aiLoading ? C.violet : "#fff", fontWeight: 600, fontSize: 13,
              padding: "9px 16px", cursor: aiLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>{aiLoading ? "⏳" : "✨"}</span>
              {aiLoading ? "Getting summary..." : "AI coach summary"}
            </button>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => { if (confirm("Delete this project?")) onDelete(project.id); }} style={{ background: "none", border: "none", color: C.textSoft, fontSize: 12, cursor: "pointer" }}>Delete project</button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Import Engine ─────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return null;
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const taskCol = headers.findIndex(h => ["task", "name", "title", "item", "todo", "description"].some(k => h.includes(k)));
  const minsCol = headers.findIndex(h => ["min", "time", "duration", "estimate"].some(k => h.includes(k)));
  const statusCol = headers.findIndex(h => ["status", "state", "progress", "done", "complete"].some(k => h.includes(k)));
  const projectCol = headers.findIndex(h => ["project", "group", "category"].some(k => h.includes(k)));
  if (taskCol === -1) return null;
  const rows = lines.slice(1).map(line => {
    const cols = line.match(/(".*?"|[^,]+)/g)?.map(c => c.trim().replace(/^"|"$/g, "")) || line.split(",");
    const rawStatus = statusCol !== -1 ? (cols[statusCol] || "").toLowerCase() : "";
    let status = "todo";
    if (rawStatus.includes("done") || rawStatus.includes("complete") || rawStatus === "true" || rawStatus === "1") status = "done";
    else if (rawStatus.includes("progress") || rawStatus.includes("doing") || rawStatus.includes("active")) status = "in-progress";
    return { id: Date.now() + Math.random(), text: cols[taskCol] || "", mins: minsCol !== -1 ? parseInt(cols[minsCol]) || 30 : 30, status, project: projectCol !== -1 ? cols[projectCol] || "" : "" };
  }).filter(r => r.text.trim());
  return { tasks: rows, hasProjects: projectCol !== -1 };
}

function parsePlainText(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  const tasks = []; let currentProject = "";
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^#{1,3}\s/.test(line) || (line.endsWith(":") && line.length < 60 && !/^[-*•✓✗]/.test(line))) { currentProject = line.replace(/^#+\s*/, "").replace(/:$/, "").trim(); continue; }
    const taskMatch = line.match(/^(?:[-*•]|\d+[.)]\s*|\[[ xX]\]\s*|✓\s*|✗\s*)(.+)/);
    const taskText = taskMatch ? taskMatch[1].trim() : line;
    const isDone = line.startsWith("[x]") || line.startsWith("[X]") || line.startsWith("✓");
    const timeMatch = taskText.match(/\((\d+)\s*m(?:in)?\)/i);
    const cleanText = taskText.replace(/\(\d+\s*m(?:in)?\)/i, "").trim();
    if (cleanText) tasks.push({ id: Date.now() + Math.random(), text: cleanText, mins: timeMatch ? parseInt(timeMatch[1]) : 30, status: isDone ? "done" : "todo", project: currentProject });
  }
  return { tasks, hasProjects: tasks.some(t => t.project) };
}

function parseNotion(text) {
  const lines = text.trim().split("\n");
  const tasks = []; let currentProject = ""; let projectName = "";
  const titleLine = lines.find(l => l.startsWith("# "));
  if (titleLine) projectName = titleLine.replace(/^# /, "").trim();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("---") || line.startsWith("# ")) continue;
    if (/^#{2,3}\s/.test(line)) { currentProject = line.replace(/^#+\s*/, "").trim(); continue; }
    const checkMatch = line.match(/^-\s+\[([ xX])\]\s+(.+)/);
    if (checkMatch) {
      const done = checkMatch[1].toLowerCase() === "x";
      const taskText = checkMatch[2].trim();
      const timeMatch = taskText.match(/\((\d+)\s*m(?:in)?\)/i);
      tasks.push({ id: Date.now() + Math.random(), text: taskText.replace(/\(\d+\s*m(?:in)?\)/i, "").trim(), mins: timeMatch ? parseInt(timeMatch[1]) : 30, status: done ? "done" : "todo", project: currentProject || projectName });
      continue;
    }
    const bulletMatch = line.match(/^[-*]\s+(?!\[)(.+)/);
    if (bulletMatch) {
      const taskText = bulletMatch[1].trim();
      if (taskText.length > 1) {
        const timeMatch = taskText.match(/\((\d+)\s*m(?:in)?\)/i);
        tasks.push({ id: Date.now() + Math.random(), text: taskText.replace(/\(\d+\s*m(?:in)?\)/i, "").trim(), mins: timeMatch ? parseInt(timeMatch[1]) : 30, status: "todo", project: currentProject || projectName });
      }
    }
  }
  return { tasks, hasProjects: tasks.some(t => t.project), detectedName: projectName };
}

function groupTasksByProject(tasks) {
  const groups = {};
  for (const t of tasks) { const key = t.project || "__default__"; if (!groups[key]) groups[key] = []; groups[key].push(t); }
  return groups;
}

function ImportModal({ onClose, onImport, existingProjects, groups }) {
  const [step, setStep] = useState("source");
  const [source, setSource] = useState(null);
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [destination, setDestination] = useState("new");
  const [targetProjectId, setTargetProjectId] = useState(existingProjects[0]?.id || null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectPriority, setNewProjectPriority] = useState("medium");
  const [newProjectColorIdx, setNewProjectColorIdx] = useState(0);
  const [targetGroupId, setTargetGroupId] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [groupAsProjects, setGroupAsProjects] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => { const r = new FileReader(); r.onload = e => { setRawText(e.target.result); setStep("paste"); }; r.readAsText(file); };
  const handleDrop = useCallback(e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }, []);

  const runParse = () => {
    setParseError(null); let result = null;
    try {
      if (source === "csv") result = parseCSV(rawText);
      else if (source === "notion") result = parseNotion(rawText);
      else result = parsePlainText(rawText);
    } catch { setParseError("Couldn't parse that format. Try a different source type."); return; }
    if (!result || result.tasks.length === 0) { setParseError("No tasks found. Check your format and try again."); return; }
    setParsed(result); setSelectedTasks(result.tasks.map(t => t.id));
    if (result.detectedName) setNewProjectName(result.detectedName);
    setGroupAsProjects(result.hasProjects); setStep("preview");
  };

  const handleImport = () => {
    const tasks = parsed.tasks.filter(t => selectedTasks.includes(t.id));
    if (destination === "existing") {
      onImport({ type: "existing", projectId: targetProjectId, tasks: tasks.map(t => ({ ...t, id: Date.now() + Math.random() })) });
    } else if (groupAsProjects && parsed.hasProjects) {
      const grps = groupTasksByProject(tasks);
      const projects = Object.entries(grps).map(([name, groupTasks], i) => ({
        id: Date.now() + Math.random(), name: name === "__default__" ? (newProjectName || "Imported Project") : name,
        priority: newProjectPriority, colorIdx: (newProjectColorIdx + i) % PROJECT_COLORS.length,
        groupId: targetGroupId, notes: "Imported project",
        tasks: groupTasks.map(t => ({ ...t, id: Date.now() + Math.random() })),
        aiSummary: null, createdAt: Date.now(),
      }));
      onImport({ type: "new-multi", projects });
    } else {
      onImport({ type: "new", project: { id: Date.now() + Math.random(), name: newProjectName || "Imported Project", priority: newProjectPriority, colorIdx: newProjectColorIdx, groupId: targetGroupId, notes: "", tasks: tasks.map(t => ({ ...t, id: Date.now() + Math.random() })), aiSummary: null, createdAt: Date.now() } });
    }
    onClose();
  };

  const toggleTask = (id) => setSelectedTasks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedTasks(selectedTasks.length === parsed.tasks.length ? [] : parsed.tasks.map(t => t.id));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,42,38,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <Card onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", padding: 0 }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>Import tasks 📥</h2>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {["source","paste","preview","destination"].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: step === s ? C.violet : (["source","paste","preview","destination"].indexOf(step) > i ? C.teal : C.border), color: (step === s || ["source","paste","preview","destination"].indexOf(step) > i) ? "#fff" : C.textSoft, transition: "all 0.2s" }}>{i + 1}</div>
                  {i < 3 && <div style={{ width: 14, height: 2, background: ["source","paste","preview","destination"].indexOf(step) > i ? C.teal : C.border, borderRadius: 99 }} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: C.textSoft, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: 22 }}>
          {step === "source" && (
            <div>
              <p style={{ fontSize: 14, color: C.textMid, marginBottom: 16, lineHeight: 1.6 }}>Where are your tasks coming from?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { id: "csv", emoji: "📊", label: "CSV or Spreadsheet", desc: "Export from Excel, Google Sheets, Airtable, etc." },
                  { id: "text", emoji: "📝", label: "Plain text", desc: "A list of tasks, bullet points, or notes" },
                  { id: "notion", emoji: "🗒️", label: "Notion", desc: "Paste a Notion page export or copy from Notion" },
                ].map(opt => (
                  <button key={opt.id} onClick={() => { setSource(opt.id); setStep("paste"); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.15s", width: "100%" }}
                    onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${C.violet}`; e.currentTarget.style.background = C.violetLight; }}
                    onMouseLeave={e => { e.currentTarget.style.border = `1.5px solid ${C.border}`; e.currentTarget.style.background = C.surface; }}
                  >
                    <span style={{ fontSize: 26 }}>{opt.emoji}</span>
                    <div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{opt.label}</div><div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>{opt.desc}</div></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "paste" && (
            <div>
              <p style={{ fontSize: 14, color: C.textMid, marginBottom: 14, lineHeight: 1.6 }}>
                {source === "csv" ? "Upload your CSV or paste the contents below." : source === "notion" ? "Copy from Notion (Cmd+A, Cmd+C) and paste below." : "Paste your task list below."}
              </p>
              {source === "csv" && (
                <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current.click()}
                  style={{ border: `2px dashed ${C.borderMid}`, borderRadius: 12, padding: "18px", textAlign: "center", marginBottom: 12, cursor: "pointer", background: C.bg }}
                  onMouseEnter={e => { e.currentTarget.style.border = `2px dashed ${C.violet}`; e.currentTarget.style.background = C.violetLight; }}
                  onMouseLeave={e => { e.currentTarget.style.border = `2px dashed ${C.borderMid}`; e.currentTarget.style.background = C.bg; }}
                >
                  <div style={{ fontSize: 26, marginBottom: 4 }}>📁</div>
                  <div style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Drop CSV here or click to browse</div>
                  <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                </div>
              )}
              <textarea value={rawText} onChange={e => setRawText(e.target.value)} rows={9}
                placeholder={source === "csv" ? "task,status,time\nReview proposals,in-progress,45" : source === "notion" ? "## My Project\n- [ ] First task\n- [x] Done task" : "## Work Tasks\n- Write report (45m)\n- Review emails\n\n## Personal\n- [ ] Call doctor"}
                style={{ width: "100%", border: `1.5px solid ${C.borderMid}`, borderRadius: 12, padding: "12px", fontSize: 13, color: C.text, fontFamily: "monospace", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6, background: C.surface }}
              />
              {parseError && <div style={{ marginTop: 8, padding: "10px 14px", background: C.coralLight, borderRadius: 10, fontSize: 13, color: C.coral }}>⚠️ {parseError}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={runParse} disabled={!rawText.trim()} style={{ background: rawText.trim() ? C.violet : C.border, border: "none", borderRadius: 10, color: rawText.trim() ? "#fff" : C.textSoft, fontWeight: 700, fontSize: 14, padding: "10px 20px", cursor: rawText.trim() ? "pointer" : "not-allowed" }}>Preview tasks →</button>
                <button onClick={() => { setStep("source"); setRawText(""); setParseError(null); }} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.textMid, fontSize: 14, padding: "10px 14px", cursor: "pointer" }}>← Back</button>
              </div>
            </div>
          )}

          {step === "preview" && parsed && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div><div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Found {parsed.tasks.length} tasks</div><div style={{ fontSize: 13, color: C.textSoft, marginTop: 2 }}>Select the ones to import</div></div>
                <button onClick={toggleAll} style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.textMid, fontSize: 13, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>
                  {selectedTasks.length === parsed.tasks.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              {parsed.hasProjects && (
                <div style={{ padding: "10px 14px", background: C.tealLight, borderRadius: 10, border: `1.5px solid ${C.tealMid}`, marginBottom: 12, fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
                  ✨ Multiple groups detected.
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                    <Toggle checked={groupAsProjects} onChange={setGroupAsProjects} color={C.teal} />
                    <span style={{ fontWeight: 600, color: C.text }}>Create a separate project for each group</span>
                  </label>
                </div>
              )}
              <div style={{ maxHeight: 260, overflowY: "auto", border: `1.5px solid ${C.border}`, borderRadius: 12, marginBottom: 14 }}>
                {Object.entries(groupTasksByProject(parsed.tasks)).map(([proj, tasks]) => (
                  <div key={proj}>
                    {proj !== "__default__" && <div style={{ padding: "7px 14px", background: C.surfaceAlt, fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.border}` }}>{proj}</div>}
                    {tasks.map(task => (
                      <label key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}`, background: selectedTasks.includes(task.id) ? C.violetLight : C.surface, transition: "background 0.1s" }}>
                        <input type="checkbox" checked={selectedTasks.includes(task.id)} onChange={() => toggleTask(task.id)} style={{ accentColor: C.violet, width: 16, height: 16, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: C.text }}>{task.text}</span>
                        <span style={{ fontSize: 11, color: C.textSoft }}>{task.mins}m</span>
                        <Pill color={STATUS_CONFIG[task.status].color} bg={STATUS_CONFIG[task.status].bg} small>{STATUS_CONFIG[task.status].label}</Pill>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep("destination")} disabled={selectedTasks.length === 0} style={{ background: selectedTasks.length ? C.violet : C.border, border: "none", borderRadius: 10, color: selectedTasks.length ? "#fff" : C.textSoft, fontWeight: 700, fontSize: 14, padding: "10px 20px", cursor: selectedTasks.length ? "pointer" : "not-allowed" }}>Choose destination →</button>
                <button onClick={() => setStep("paste")} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.textMid, fontSize: 14, padding: "10px 14px", cursor: "pointer" }}>← Back</button>
              </div>
            </div>
          )}

          {step === "destination" && (
            <div>
              <p style={{ fontSize: 14, color: C.textMid, marginBottom: 16, lineHeight: 1.6 }}>Where should these {selectedTasks.length} tasks go?</p>
              {!(groupAsProjects && parsed?.hasProjects) && (
                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  {[{ id: "new", label: "New project", emoji: "✨" }, { id: "existing", label: "Existing project", emoji: "📋", disabled: existingProjects.length === 0 }].map(opt => (
                    <button key={opt.id} onClick={() => !opt.disabled && setDestination(opt.id)} style={{ flex: 1, padding: "11px", borderRadius: 12, cursor: opt.disabled ? "not-allowed" : "pointer", background: destination === opt.id ? C.violetLight : C.bg, border: `1.5px solid ${destination === opt.id ? C.violet : C.border}`, color: destination === opt.id ? C.violet : opt.disabled ? C.textSoft : C.textMid, fontWeight: 700, fontSize: 14, opacity: opt.disabled ? 0.5 : 1 }}>
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {destination === "new" && (
                <div style={{ marginBottom: 16 }}>
                  <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Project name..."
                    style={{ width: "100%", border: `1.5px solid ${C.borderMid}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 10, background: C.surface }} />
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Add to group (optional)</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => setTargetGroupId(null)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", background: !targetGroupId ? C.violetLight : C.bg, border: `1.5px solid ${!targetGroupId ? C.violet : C.border}`, color: !targetGroupId ? C.violet : C.textMid }}>
                        No group
                      </button>
                      {groups.map(g => {
                        const gc = GROUP_COLORS[g.colorIdx % GROUP_COLORS.length];
                        return (
                          <button key={g.id} onClick={() => setTargetGroupId(g.id)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", background: targetGroupId === g.id ? gc.light : C.bg, border: `1.5px solid ${targetGroupId === g.id ? gc.main : C.border}`, color: targetGroupId === g.id ? gc.main : C.textMid }}>
                            {g.emoji} {g.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {destination === "existing" && (
                <div style={{ marginBottom: 16 }}>
                  {existingProjects.map(p => {
                    const pc = PROJECT_COLORS[p.colorIdx % PROJECT_COLORS.length];
                    return (
                      <button key={p.id} onClick={() => setTargetProjectId(p.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", marginBottom: 6, borderRadius: 10, cursor: "pointer", background: targetProjectId === p.id ? C.violetLight : C.bg, border: `1.5px solid ${targetProjectId === p.id ? C.violet : C.border}`, textAlign: "left" }}>
                        <Avatar name={p.name} color={pc.main} size={28} />
                        <div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div><div style={{ fontSize: 11, color: C.textSoft }}>{p.tasks.length} tasks</div></div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleImport} style={{ background: C.teal, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 22px", cursor: "pointer" }}>
                  Import {selectedTasks.length} tasks ✓
                </button>
                <button onClick={() => setStep("preview")} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.textMid, fontSize: 14, padding: "11px 14px", cursor: "pointer" }}>← Back</button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Add Project Modal ─────────────────────────────────────────────────────────

function AddProjectModal({ onAdd, onClose, groups, defaultGroupId }) {
  const [form, setForm] = useState({ name: "", notes: "", priority: "medium", colorIdx: 0, groupId: defaultGroupId || null });
  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({ id: Date.now(), ...form, tasks: [], aiSummary: null, createdAt: Date.now() });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,42,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <Card onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, padding: 26, maxHeight: "90vh", overflow: "auto" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 19, fontWeight: 800, color: C.text }}>New project 🚀</h2>
        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Project name</div>
          <input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} onKeyDown={e => e.key === "Enter" && submit()} placeholder="e.g. Q2 Growth Strategy"
            style={{ width: "100%", border: `1.5px solid ${C.borderMid}`, borderRadius: 10, padding: "10px 14px", fontSize: 15, color: C.text, outline: "none", boxSizing: "border-box", background: C.surface }} />
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Notes (optional)</div>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What's the goal?" rows={2}
            style={{ width: "100%", border: `1.5px solid ${C.borderMid}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none", resize: "none", boxSizing: "border-box", background: C.surface }} />
        </label>

        {groups.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 8 }}>Group</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setForm({ ...form, groupId: null })} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", background: !form.groupId ? C.violetLight : C.bg, border: `1.5px solid ${!form.groupId ? C.violet : C.border}`, color: !form.groupId ? C.violet : C.textMid }}>
                No group
              </button>
              {groups.map(g => {
                const gc = GROUP_COLORS[g.colorIdx % GROUP_COLORS.length];
                return (
                  <button key={g.id} onClick={() => setForm({ ...form, groupId: g.id })} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", background: form.groupId === g.id ? gc.light : C.bg, border: `1.5px solid ${form.groupId === g.id ? gc.main : C.border}`, color: form.groupId === g.id ? gc.main : C.textMid }}>
                    {g.emoji} {g.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 8 }}>Priority</div>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(PRIORITY_CONFIG).map(([key, p]) => (
              <button key={key} onClick={() => setForm({ ...form, priority: key })} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, background: form.priority === key ? p.bg : C.surface, border: `1.5px solid ${form.priority === key ? p.color : C.border}`, color: form.priority === key ? p.color : C.textSoft }}>
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 8 }}>Color</div>
          <div style={{ display: "flex", gap: 10 }}>
            {PROJECT_COLORS.map((pc, i) => (
              <button key={i} onClick={() => setForm({ ...form, colorIdx: i })} style={{ width: 28, height: 28, borderRadius: "50%", background: pc.main, cursor: "pointer", border: `3px solid ${form.colorIdx === i ? C.text : "transparent"}` }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={submit} style={{ flex: 1, background: PROJECT_COLORS[form.colorIdx].main, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px", cursor: "pointer" }}>Create project</button>
          <button onClick={onClose} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.textMid, fontSize: 15, padding: "12px 16px", cursor: "pointer" }}>Cancel</button>
        </div>
      </Card>
    </div>
  );
}

// ─── Focus, Reminders, Settings ───────────────────────────────────────────────

function FocusMode({ projects }) {
  const allInProgress = projects.flatMap(p => p.tasks.filter(t => t.status === "in-progress").map(t => ({ ...t, projectName: p.name, projectColor: PROJECT_COLORS[p.colorIdx % PROJECT_COLORS.length] })));
  const allTodo = projects.flatMap(p => p.tasks.filter(t => t.status === "todo").map(t => ({ ...t, projectName: p.name, projectColor: PROJECT_COLORS[p.colorIdx % PROJECT_COLORS.length] })));
  const next = allInProgress[0] || allTodo[0];
  const todayDone = projects.flatMap(p => p.tasks).filter(t => t.status === "done").length;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[{ label: "In progress", val: allInProgress.length, emoji: "⚡", color: C.violet, bg: C.violetLight }, { label: "Completed", val: todayDone, emoji: "✅", color: C.teal, bg: C.tealLight }].map(s => (
          <Card key={s.label} style={{ padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 13, color: C.textSoft }}>{s.label}</div>
          </Card>
        ))}
      </div>
      {next ? (
        <Card style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 6 }}>Focus on this right now</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: next.projectColor.main, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>{next.projectName}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1.3, maxWidth: 360, margin: "0 auto 20px" }}>{next.text}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <Pill color={next.projectColor.main} bg={next.projectColor.light} border={next.projectColor.mid}>⏱️ {next.mins} min</Pill>
            <Pill color={STATUS_CONFIG[next.status].color} bg={STATUS_CONFIG[next.status].bg}>{STATUS_CONFIG[next.status].label}</Pill>
          </div>
          <div style={{ marginTop: 20, padding: "12px 16px", background: C.amberLight, borderRadius: 12, fontSize: 13, color: C.textMid, lineHeight: 1.6, border: `1.5px solid ${C.amberMid}` }}>
            💡 Set a timer for {next.mins} minutes and commit to just this one task. You can do it!
          </div>
        </Card>
      ) : (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>All clear!</div>
          <div style={{ fontSize: 14, color: C.textSoft }}>No tasks in progress. Head to Projects to pick something to work on.</div>
        </Card>
      )}
      <div style={{ marginTop: 16, padding: "14px 18px", background: C.surfaceAlt, borderRadius: 14, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.textMid, lineHeight: 1.6, fontStyle: "italic", textAlign: "center" }}>
        {MOTIVATIONAL[new Date().getDay() % MOTIVATIONAL.length]}
      </div>
    </div>
  );
}

function RemindersPanel({ reminders, setReminders }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ text: "", time: "09:00", type: "daily", day: "Monday" });
  const add = () => {
    if (!form.text.trim()) return;
    setReminders([...reminders, { ...form, id: Date.now(), active: true }]);
    setForm({ text: "", time: "09:00", type: "daily", day: "Monday" }); setAdding(false);
  };
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text }}>Reminders</h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSoft }}>Stay on track with daily and weekly check-ins</p>
      </div>
      {reminders.map(r => (
        <Card key={r.id} style={{ padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <Toggle checked={r.active} onChange={v => setReminders(reminders.map(x => x.id === r.id ? { ...x, active: v } : x))} color={C.teal} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: r.active ? C.text : C.textSoft }}>{r.text}</div>
            <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>{r.type === "weekly" ? `Every ${r.day}` : "Every day"} at {r.time}</div>
          </div>
          <Pill color={r.type === "daily" ? C.teal : C.violet} bg={r.type === "daily" ? C.tealLight : C.violetLight} border={r.type === "daily" ? C.tealMid : C.violetMid} small>{r.type}</Pill>
          <button onClick={() => setReminders(reminders.filter(x => x.id !== r.id))} style={{ background: "none", border: "none", color: C.textSoft, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
        </Card>
      ))}
      {adding ? (
        <Card style={{ padding: 20, marginTop: 8 }}>
          <input value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} autoFocus placeholder="What do you want to be reminded about?"
            style={{ width: "100%", border: `1.5px solid ${C.teal}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 12, background: C.surface }} />
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: C.textMid, background: C.surface, outline: "none" }}>
              <option value="daily">Daily</option><option value="weekly">Weekly</option>
            </select>
            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: C.textMid, background: C.surface, outline: "none" }} />
            {form.type === "weekly" && (
              <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: C.textMid, background: C.surface, outline: "none" }}>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => <option key={d}>{d}</option>)}
              </select>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={add} style={{ background: C.teal, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, padding: "10px 20px", cursor: "pointer" }}>Save reminder</button>
            <button onClick={() => setAdding(false)} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.textMid, fontSize: 14, padding: "10px 16px", cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: "100%", background: C.surface, border: `1.5px dashed ${C.borderMid}`, borderRadius: 14, color: C.textSoft, fontSize: 14, padding: "14px", cursor: "pointer", marginTop: 4 }}>
          + Add reminder
        </button>
      )}
    </div>
  );
}

function SettingsPanel({ apiKey, setApiKey }) {
  const [input, setInput] = useState(apiKey || "");
  const [saved, setSaved] = useState(false);
  const save = () => { setApiKey(input); localStorage.setItem("adhd_apikey", input); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return (
    <div>
      <Card style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: C.text }}>✨ AI Coach setup</h3>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: C.textMid, lineHeight: 1.6 }}>The AI Coach uses Claude to give you project summaries, next-step suggestions, and ADHD-friendly coaching tips.</p>
        <div style={{ padding: "12px 16px", background: C.amberLight, borderRadius: 12, border: `1.5px solid ${C.amberMid}`, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>💰 Each AI summary costs ~$0.001–$0.005. For daily use, expect a few cents per week. Get your free key at <strong>console.anthropic.com</strong></p>
        </div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 8 }}>Anthropic API key</label>
        <input type="password" value={input} onChange={e => setInput(e.target.value)} placeholder="sk-ant-api03-..."
          style={{ width: "100%", border: `1.5px solid ${C.borderMid}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 12, background: C.surface }} />
        <button onClick={save} style={{ background: saved ? C.teal : C.violet, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 24px", cursor: "pointer", transition: "background 0.2s" }}>
          {saved ? "✅ Saved!" : "Save key"}
        </button>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: C.textSoft }}>Stored only in your browser's local storage. Never shared.</p>
      </Card>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "projects", label: "Projects", emoji: "📋" },
  { id: "focus", label: "Focus", emoji: "🎯" },
  { id: "reminders", label: "Reminders", emoji: "🔔" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
];

export default function App() {
  const [projects, setProjects] = useLocalState("focusgrid_projects_v4", sampleProjects);
  const [groups, setGroups] = useLocalState("focusgrid_groups_v4", DEFAULT_GROUPS);
  const [reminders, setReminders] = useLocalState("focusgrid_reminders_v4", [
    { id: 1, text: "Morning project review", time: "09:00", type: "daily", active: true },
    { id: 2, text: "Weekly wrap-up", time: "17:00", type: "weekly", day: "Friday", active: true },
  ]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("adhd_apikey") || "");
  const [tab, setTab] = useState("projects");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddForGroup, setShowAddForGroup] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); // null = all

  const updateProject = p => setProjects(prev => prev.map(x => x.id === p.id ? p : x));
  const deleteProject = id => setProjects(prev => prev.filter(p => p.id !== id));
  const addProject = p => setProjects(prev => [p, ...prev]);
  const moveProject = (projectId, groupId) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, groupId: groupId || null } : p));

  const addGroup = (data) => setGroups(prev => [...prev, { ...data, id: Date.now().toString(), collapsed: false }]);
  const editGroup = (id, data) => setGroups(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  const deleteGroup = (id) => { setGroups(prev => prev.filter(g => g.id !== id)); setProjects(prev => prev.map(p => p.groupId === id ? { ...p, groupId: null } : p)); };

  const handleImport = (result) => {
    if (result.type === "new") { setProjects(prev => [result.project, ...prev]); setImportSuccess(`Imported "${result.project.name}" with ${result.project.tasks.length} tasks`); }
    else if (result.type === "new-multi") { setProjects(prev => [...result.projects, ...prev]); setImportSuccess(`Created ${result.projects.length} new projects`); }
    else if (result.type === "existing") {
      setProjects(prev => prev.map(p => p.id === result.projectId ? { ...p, tasks: [...p.tasks, ...result.tasks] } : p));
      const proj = projects.find(p => p.id === result.projectId);
      setImportSuccess(`Added ${result.tasks.length} tasks to "${proj?.name}"`);
    }
    setTimeout(() => setImportSuccess(null), 4000);
  };

  const totalDone = projects.flatMap(p => p.tasks).filter(t => t.status === "done").length;
  const totalTasks = projects.flatMap(p => p.tasks).length;
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  const filteredProjects = activeFilter ? projects.filter(p => p.groupId === activeFilter) : projects;
  const ungroupedProjects = filteredProjects.filter(p => !p.groupId || !groups.find(g => g.id === p.groupId));

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.borderMid}; border-radius: 99px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        .fade-up { animation: fadeUp 0.35s ease both; }
      `}</style>

      {importSuccess && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 2000, animation: "slideDown 0.3s ease", background: C.teal, color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, boxShadow: `0 4px 20px rgba(62,207,178,0.4)`, whiteSpace: "nowrap" }}>
          ✅ {importSuccess}
        </div>
      )}

      {/* Nav */}
      <div style={{ background: C.surface, borderBottom: `1.5px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ padding: "14px 0", flex: 1 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>FocusGrid</span>
            <span style={{ fontSize: 18, color: C.coral }}>.</span>
          </div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? C.violetLight : "transparent", border: "none", borderRadius: 10,
              color: tab === t.id ? C.violet : C.textSoft, fontWeight: tab === t.id ? 700 : 500,
              fontSize: 13, padding: "7px 12px", cursor: "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span>{t.emoji}</span>
              <span style={{ display: "none" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>

        {tab === "projects" && (
          <div className="fade-up">
            {/* Header */}
            <div style={{ marginBottom: 18 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: "-0.02em" }}>{greeting()} 👋</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Pill color={C.violet} bg={C.violetLight} border={C.violetMid}>{projects.length} project{projects.length !== 1 ? "s" : ""}</Pill>
                <Pill color={C.teal} bg={C.tealLight} border={C.tealMid}>{totalDone}/{totalTasks} tasks done</Pill>
                {totalTasks > 0 && totalDone === totalTasks && <Pill color={C.coral} bg={C.coralLight} border={C.coralMid}>🎉 Everything done!</Pill>}
              </div>
            </div>

            {/* Group filter pills */}
            {groups.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <button onClick={() => setActiveFilter(null)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", background: !activeFilter ? C.text : C.surface, border: `1.5px solid ${!activeFilter ? C.text : C.border}`, color: !activeFilter ? "#fff" : C.textMid, transition: "all 0.15s" }}>
                  All
                </button>
                {groups.map(g => {
                  const gc = GROUP_COLORS[g.colorIdx % GROUP_COLORS.length];
                  const isActive = activeFilter === g.id;
                  return (
                    <button key={g.id} onClick={() => setActiveFilter(isActive ? null : g.id)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", background: isActive ? gc.main : C.surface, border: `1.5px solid ${isActive ? gc.main : gc.mid}`, color: isActive ? "#fff" : gc.main, transition: "all 0.15s" }}>
                      {g.emoji} {g.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button onClick={() => setShowImport(true)} style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.textMid, fontWeight: 600, fontSize: 13, padding: "9px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${C.violet}`; e.currentTarget.style.color = C.violet; e.currentTarget.style.background = C.violetLight; }}
                onMouseLeave={e => { e.currentTarget.style.border = `1.5px solid ${C.border}`; e.currentTarget.style.color = C.textMid; e.currentTarget.style.background = C.surface; }}
              >📥 Import</button>
              <button onClick={() => { setEditingGroup(null); setShowGroupModal(true); }} style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, color: C.textMid, fontWeight: 600, fontSize: 13, padding: "9px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${C.amber}`; e.currentTarget.style.color = C.amber; e.currentTarget.style.background = C.amberLight; }}
                onMouseLeave={e => { e.currentTarget.style.border = `1.5px solid ${C.border}`; e.currentTarget.style.color = C.textMid; e.currentTarget.style.background = C.surface; }}
              >📁 New group</button>
              <button onClick={() => setShowAdd(true)} style={{ background: C.coral, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 13, padding: "9px 18px", cursor: "pointer", boxShadow: `0 4px 14px rgba(255,107,107,0.3)`, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>+</span> New project
              </button>
            </div>

            {/* Groups */}
            {projects.length === 0 ? (
              <Card style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🗂️</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>No projects yet</div>
                <div style={{ fontSize: 14, color: C.textSoft, marginBottom: 20 }}>Create a group to organize your work, then add projects inside it.</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => setShowAdd(true)} style={{ background: C.coral, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 22px", cursor: "pointer" }}>Create project</button>
                  <button onClick={() => setShowImport(true)} style={{ background: C.violetLight, border: `1.5px solid ${C.violetMid}`, borderRadius: 10, color: C.violet, fontWeight: 700, fontSize: 14, padding: "11px 22px", cursor: "pointer" }}>Import tasks</button>
                </div>
              </Card>
            ) : (
              <div>
                {groups.map(group => {
                  if (activeFilter && activeFilter !== group.id) return null;
                  return (
                    <GroupSection
                      key={group.id}
                      group={group}
                      projects={filteredProjects}
                      onUpdateProject={updateProject}
                      onDeleteProject={deleteProject}
                      onMoveProject={moveProject}
                      onEditGroup={(g) => { setEditingGroup(g); setShowGroupModal(true); }}
                      onDeleteGroup={deleteGroup}
                      apiKey={apiKey}
                      allGroups={groups}
                    />
                  );
                })}

                {/* Ungrouped projects */}
                {ungroupedProjects.length > 0 && !activeFilter && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textSoft, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, paddingLeft: 4 }}>
                      📌 Ungrouped
                    </div>
                    {ungroupedProjects.map(p => (
                      <ProjectCard key={p.id} project={p} onUpdate={updateProject} onDelete={deleteProject} apiKey={apiKey}
                        onMove={() => {}} allGroups={groups}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "focus" && (
          <div className="fade-up">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.02em" }}>Focus mode 🎯</h1>
            <p style={{ fontSize: 14, color: C.textSoft, marginBottom: 20 }}>One thing at a time. Here's what to work on right now.</p>
            <FocusMode projects={projects} />
          </div>
        )}

        {tab === "reminders" && <div className="fade-up"><RemindersPanel reminders={reminders} setReminders={setReminders} /></div>}

        {tab === "settings" && (
          <div className="fade-up">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.02em" }}>Settings ⚙️</h1>
            <p style={{ fontSize: 14, color: C.textSoft, marginBottom: 20 }}>Configure your AI coach and preferences.</p>
            <SettingsPanel apiKey={apiKey} setApiKey={setApiKey} />
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>

      {showAdd && <AddProjectModal onAdd={addProject} onClose={() => setShowAdd(false)} groups={groups} defaultGroupId={null} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} existingProjects={projects} groups={groups} />}
      {showGroupModal && (
        <GroupModal
          group={editingGroup}
          onSave={(data) => { if (editingGroup) { editGroup(editingGroup.id, data); } else { addGroup(data); } setShowGroupModal(false); setEditingGroup(null); }}
          onClose={() => { setShowGroupModal(false); setEditingGroup(null); }}
        />
      )}
    </div>
  );
}
