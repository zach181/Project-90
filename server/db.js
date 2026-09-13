// Tiny JSON-file store. Fine for a handful of users/groups; not meant to scale.
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data.json");

function load() {
  if (!fs.existsSync(DB_PATH)) return { users: {}, groups: {} };
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return { users: {}, groups: {} };
  }
}

const db = load();

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

module.exports = { db, save };
