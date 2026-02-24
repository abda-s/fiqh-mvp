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

export const seedQueries = `
-- Default Profile
INSERT OR IGNORE INTO profiles (id, total_xp, streak_count, hearts, has_onboarded, last_active_at) VALUES (1, 0, 0, 5, 0, NULL);

-- Unit 1: Purification
INSERT OR IGNORE INTO units (id, title, description, order_index) VALUES (1, 'الطهارة', 'تعلم أحكام الوضوء الغسل والتيمم', 1);

-- Nodes
INSERT OR IGNORE INTO nodes (id, unit_id, title, order_index) VALUES (1, 1, 'الوضوء', 1);
INSERT OR IGNORE INTO nodes (id, unit_id, title, order_index) VALUES (2, 1, 'الغسل', 2);
INSERT OR IGNORE INTO nodes (id, unit_id, title, order_index) VALUES (3, 1, 'التيمم', 3);

-- Levels for Wudu Node
INSERT OR IGNORE INTO levels (id, node_id, title, order_index) VALUES (1, 1, 'فرائض الوضوء', 1);
INSERT OR IGNORE INTO levels (id, node_id, title, order_index) VALUES (2, 1, 'سنن الوضوء', 2);
INSERT OR IGNORE INTO levels (id, node_id, title, order_index) VALUES (3, 1, 'نواقض الوضوء', 3);

-- Level 1 Exercises (Faraid of Wudu)
INSERT OR IGNORE INTO exercises (id, level_id, type, content_json, correct_answer) VALUES (1, 1, 'multiple_choice', '{"question": "ما هو أول فرض من فرائض الوضوء؟", "options": ["غسل الوجه", "النية", "غسل اليدين والمرفقين"]}', 'النية');
INSERT OR IGNORE INTO exercises (id, level_id, type, content_json, correct_answer) VALUES (2, 1, 'true_false', '{"question": "غسل الوجه من فرائض الوضوء وليس سنتها."}', 'true');

-- Level 2 Exercises (Sunnahs of Wudu)
INSERT OR IGNORE INTO exercises (id, level_id, type, content_json, correct_answer) VALUES (3, 2, 'multiple_choice', '{"question": "استخدام السواك قبل الوضوء هو:", "options": ["سنة مؤكدة", "مكروه", "بدعة"]}', 'سنة مؤكدة');
INSERT OR IGNORE INTO exercises (id, level_id, type, content_json, correct_answer) VALUES (4, 2, 'true_false', '{"question": "التسمية (قول بسم الله) قبل الوضوء تعتبر فريضة."}', 'false');

-- Level 3 Exercises (Ghusl)
INSERT OR IGNORE INTO exercises (id, level_id, type, content_json, correct_answer) VALUES (5, 3, 'multiple_choice', '{"question": "متى يجب الغسل؟", "options": ["بعد صلاة الجمعة", "بعد الجنابة", "قبل صلاة العيد", "عند ارتداء ملابس جديدة"]}', 'بعد الجنابة');

-- Level 4 (Tayammum)
INSERT OR IGNORE INTO exercises (id, level_id, type, content_json, correct_answer) VALUES (6, 3, 'multiple_choice', '{"question": "بماذا يتم التيمم؟", "options": ["بالماء", "بالصعيد الطاهر (التراب)", "بأوراق الشجر", "بالقماش"]}', 'بالصعيد الطاهر (التراب)');
`;
