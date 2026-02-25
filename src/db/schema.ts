export const schemaQueries = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE IF NOT EXISTS levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (node_id) REFERENCES nodes(id)
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  content_json TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  FOREIGN KEY (level_id) REFERENCES levels(id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_xp INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  has_onboarded INTEGER DEFAULT 0,
  knowledge_level TEXT,
  time_commitment INTEGER,
  last_active_at TEXT
);

CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_id INTEGER UNIQUE NOT NULL,
  is_completed INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  FOREIGN KEY (level_id) REFERENCES levels(id)
);

-- SM-2 Spaced Repetition System Tracking Table
CREATE TABLE IF NOT EXISTS srs_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER UNIQUE NOT NULL,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_date TEXT,
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);
`;


