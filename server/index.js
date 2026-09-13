const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const store = require("./db");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

function uid(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}
function genToken() {
  return crypto.randomBytes(24).toString("hex");
}
function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function findUserByToken(token) {
  return Object.values(store.db.users).find((u) => u.token === token) || null;
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const user = token && findUserByToken(token);
  if (!user) return res.status(401).json({ error: "Invalid or missing token." });
  req.user = user;
  next();
}

function publicUser(u) {
  return { id: u.id, name: u.name, stats: u.stats || null };
}
function publicGroup(g) {
  const members = g.memberIds
    .map((id) => store.db.users[id])
    .filter(Boolean)
    .map(publicUser);
  return { id: g.id, name: g.name, code: g.code, createdAt: g.createdAt, members };
}

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "project90-groups" });
});

// Lightweight identity: a display name only, no password. Returns a bearer token.
app.post("/api/users", (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "A display name is required." });
  }
  const id = uid("user");
  const token = genToken();
  store.db.users[id] = {
    id,
    name: name.trim().slice(0, 40),
    token,
    stats: null,
    createdAt: Date.now(),
  };
  store.save();
  res.json({ userId: id, token, name: store.db.users[id].name });
});

app.patch("/api/users/me", auth, (req, res) => {
  const { name } = req.body || {};
  if (typeof name === "string" && name.trim()) {
    req.user.name = name.trim().slice(0, 40);
    store.save();
  }
  res.json(publicUser(req.user));
});

// Push the caller's latest challenge summary — this is what group members see.
app.post("/api/users/me/stats", auth, (req, res) => {
  const { dayNumber, totalDays, streak, challengeName } = req.body || {};
  req.user.stats = {
    dayNumber: Number(dayNumber) || 0,
    totalDays: Number(totalDays) || 90,
    streak: Number(streak) || 0,
    challengeName: typeof challengeName === "string" ? challengeName.slice(0, 60) : "",
    updatedAt: Date.now(),
  };
  store.save();
  res.json(publicUser(req.user));
});

app.post("/api/groups", auth, (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "A group name is required." });
  }
  const id = uid("group");
  let code = genCode();
  while (Object.values(store.db.groups).some((g) => g.code === code)) code = genCode();
  store.db.groups[id] = {
    id,
    name: name.trim().slice(0, 60),
    code,
    createdAt: Date.now(),
    memberIds: [req.user.id],
  };
  store.save();
  res.json(publicGroup(store.db.groups[id]));
});

app.post("/api/groups/join", auth, (req, res) => {
  const { code } = req.body || {};
  const group = Object.values(store.db.groups).find((g) => g.code === String(code || "").toUpperCase());
  if (!group) return res.status(404).json({ error: "No group with that code." });
  if (!group.memberIds.includes(req.user.id)) group.memberIds.push(req.user.id);
  store.save();
  res.json(publicGroup(group));
});

app.get("/api/groups/:id", auth, (req, res) => {
  const group = store.db.groups[req.params.id];
  if (!group) return res.status(404).json({ error: "Group not found." });
  if (!group.memberIds.includes(req.user.id)) {
    return res.status(403).json({ error: "Not a member of this group." });
  }
  res.json(publicGroup(group));
});

app.post("/api/groups/:id/leave", auth, (req, res) => {
  const group = store.db.groups[req.params.id];
  if (!group) return res.status(404).json({ error: "Group not found." });
  group.memberIds = group.memberIds.filter((id) => id !== req.user.id);
  store.save();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Project 90 groups server listening on http://localhost:${PORT}`);
});
