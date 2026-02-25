import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  totalXp: integer('total_xp').default(0),
  streakCount: integer('streak_count').default(0),
  hearts: integer('hearts').default(5),
  hasOnboarded: integer('has_onboarded').default(0), // 0 or 1
  knowledgeLevel: text('knowledge_level'),
  timeCommitment: integer('time_commitment'),
  lastActiveAt: text('last_active_at')
});

export const units = sqliteTable('units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull()
});

export const nodes = sqliteTable('nodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  unitId: integer('unit_id').notNull().references(() => units.id),
  title: text('title').notNull(),
  orderIndex: integer('order_index').notNull()
});

export const levels = sqliteTable('levels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nodeId: integer('node_id').notNull().references(() => nodes.id),
  title: text('title').notNull(),
  orderIndex: integer('order_index').notNull()
});

export const exercises = sqliteTable('exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  levelId: integer('level_id').notNull().references(() => levels.id),
  type: text('type').notNull(),
  contentJson: text('content_json').notNull(),
  correctAnswer: text('correct_answer').notNull()
});

export const userProgress = sqliteTable('user_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  levelId: integer('level_id').unique().notNull().references(() => levels.id),
  isCompleted: integer('is_completed').default(0),
  highScore: integer('high_score').default(0)
});

export const srsReviews = sqliteTable('srs_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exerciseId: integer('exercise_id').unique().notNull().references(() => exercises.id),
  easeFactor: real('ease_factor').default(2.5),
  interval: integer('interval').default(0),
  repetitions: integer('repetitions').default(0),
  nextReviewDate: text('next_review_date')
});
