import * as SQLite from 'expo-sqlite';
import { getSeedData } from './seedData';
import type {
  Subject,
  Lesson,
  StudySession,
  Exercise,
  Attempt,
  ReviewQueue,
  Settings,
  LessonWithSubject,
  SubjectProgress,
  DailyStudyStats,
  AccuracyStats,
  WeakLesson,
} from './types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('brevetcoach.db');
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      importance_points TEXT NOT NULL,
      common_mistakes TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      lesson_id INTEGER,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      focus_rating INTEGER DEFAULT 3,
      notes TEXT DEFAULT '',
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      difficulty INTEGER DEFAULT 1,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL,
      chosen_index INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      time_spent_seconds INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS review_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL UNIQUE,
      next_review_date TEXT NOT NULL,
      interval_days INTEGER DEFAULT 1,
      ease_factor REAL DEFAULT 2.5,
      last_result INTEGER DEFAULT 0,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      exam_date TEXT,
      daily_minutes_goal INTEGER DEFAULT 60,
      pomodoro_work INTEGER DEFAULT 25,
      pomodoro_break INTEGER DEFAULT 5,
      onboarding_complete INTEGER DEFAULT 0
    );
  `);

  const settingsResult = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM settings'
  );
  if (!settingsResult || settingsResult.count === 0) {
    await database.runAsync(
      'INSERT INTO settings (id, daily_minutes_goal, pomodoro_work, pomodoro_break, onboarding_complete) VALUES (1, 60, 25, 5, 0)'
    );
  }
}

export async function seedDatabase(): Promise<void> {
  const database = await getDatabase();
  const { subjects, lessons, exercises } = getSeedData();

  const subjectCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM subjects'
  );

  if (subjectCount && subjectCount.count > 0) return;

  for (const subject of subjects) {
    await database.runAsync(
      'INSERT INTO subjects (name, color) VALUES (?, ?)',
      [subject.name, subject.color]
    );
  }

  const insertedSubjects = await database.getAllAsync<Subject>('SELECT * FROM subjects');
  const subjectMap = new Map(insertedSubjects.map((s) => [s.name, s.id]));

  for (const lesson of lessons) {
    const subjectId = subjectMap.get(lesson.subject_name);
    if (subjectId) {
      await database.runAsync(
        'INSERT INTO lessons (subject_id, title, summary, importance_points, common_mistakes) VALUES (?, ?, ?, ?, ?)',
        [subjectId, lesson.title, lesson.summary, lesson.importance_points, lesson.common_mistakes]
      );
    }
  }

  const insertedLessons = await database.getAllAsync<Lesson>('SELECT * FROM lessons');
  const lessonMap = new Map(insertedLessons.map((l) => [l.title, l.id]));

  for (const exercise of exercises) {
    const lessonId = lessonMap.get(exercise.lesson_title);
    if (lessonId) {
      await database.runAsync(
        'INSERT INTO exercises (lesson_id, difficulty, question, options_json, correct_index, explanation) VALUES (?, ?, ?, ?, ?, ?)',
        [lessonId, exercise.difficulty, exercise.question, JSON.stringify(exercise.options), exercise.correct_index, exercise.explanation]
      );
    }
  }
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM attempts;
    DELETE FROM study_sessions;
    DELETE FROM review_queue;
    DELETE FROM exercises;
    DELETE FROM lessons;
    DELETE FROM subjects;
    DELETE FROM settings;
  `);
  await initDatabase();
  await seedDatabase();
}

export async function getSettings(): Promise<Settings | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Settings>('SELECT * FROM settings WHERE id = 1');
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (settings.exam_date !== undefined) {
    fields.push('exam_date = ?');
    values.push(settings.exam_date || '');
  }
  if (settings.daily_minutes_goal !== undefined) {
    fields.push('daily_minutes_goal = ?');
    values.push(settings.daily_minutes_goal);
  }
  if (settings.pomodoro_work !== undefined) {
    fields.push('pomodoro_work = ?');
    values.push(settings.pomodoro_work);
  }
  if (settings.pomodoro_break !== undefined) {
    fields.push('pomodoro_break = ?');
    values.push(settings.pomodoro_break);
  }
  if (settings.onboarding_complete !== undefined) {
    fields.push('onboarding_complete = ?');
    values.push(settings.onboarding_complete);
  }

  if (fields.length > 0) {
    await database.runAsync(`UPDATE settings SET ${fields.join(', ')} WHERE id = 1`, values);
  }
}

export async function getSubjects(): Promise<Subject[]> {
  const database = await getDatabase();
  return database.getAllAsync<Subject>('SELECT * FROM subjects');
}

export async function getLessons(subjectId?: number): Promise<Lesson[]> {
  const database = await getDatabase();
  if (subjectId) {
    return database.getAllAsync<Lesson>('SELECT * FROM lessons WHERE subject_id = ?', [subjectId]);
  }
  return database.getAllAsync<Lesson>('SELECT * FROM lessons');
}

export async function getLesson(lessonId: number): Promise<LessonWithSubject | null> {
  const database = await getDatabase();
  return database.getFirstAsync<LessonWithSubject>(
    `SELECT l.*, s.name as subject_name, s.color as subject_color 
     FROM lessons l 
     JOIN subjects s ON l.subject_id = s.id 
     WHERE l.id = ?`,
    [lessonId]
  );
}

export async function markLessonComplete(lessonId: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE lessons SET is_completed = 1 WHERE id = ?', [lessonId]);

  const today = new Date().toISOString().split('T')[0];
  const existing = await database.getFirstAsync<ReviewQueue>(
    'SELECT * FROM review_queue WHERE lesson_id = ?',
    [lessonId]
  );

  if (existing) {
    await updateReviewQueue(lessonId, 1);
  } else {
    await database.runAsync(
      'INSERT INTO review_queue (lesson_id, next_review_date, interval_days, ease_factor, last_result) VALUES (?, ?, 1, 2.5, 1)',
      [lessonId, today]
    );
  }
}

export async function getExercises(lessonId?: number, difficulty?: number): Promise<Exercise[]> {
  const database = await getDatabase();
  let query = 'SELECT * FROM exercises';
  const conditions: string[] = [];
  const params: number[] = [];

  if (lessonId) {
    conditions.push('lesson_id = ?');
    params.push(lessonId);
  }
  if (difficulty) {
    conditions.push('difficulty = ?');
    params.push(difficulty);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  return database.getAllAsync<Exercise>(query, params);
}

export async function getRandomExercises(count: number, subjectId?: number): Promise<Exercise[]> {
  const database = await getDatabase();
  let query = `
    SELECT e.* FROM exercises e
    JOIN lessons l ON e.lesson_id = l.id
  `;
  const params: number[] = [];

  if (subjectId) {
    query += ' WHERE l.subject_id = ?';
    params.push(subjectId);
  }

  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(count);

  return database.getAllAsync<Exercise>(query, params);
}

export async function saveAttempt(
  exerciseId: number,
  chosenIndex: number,
  isCorrect: boolean,
  timeSpent: number
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO attempts (exercise_id, chosen_index, is_correct, time_spent_seconds, created_at) VALUES (?, ?, ?, ?, ?)',
    [exerciseId, chosenIndex, isCorrect ? 1 : 0, timeSpent, new Date().toISOString()]
  );
}

export async function saveStudySession(
  subjectId: number,
  lessonId: number | null,
  startTime: string,
  endTime: string,
  durationMinutes: number,
  focusRating: number,
  notes: string
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO study_sessions (subject_id, lesson_id, start_time, end_time, duration_minutes, focus_rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [subjectId, lessonId, startTime, endTime, durationMinutes, focusRating, notes]
  );

  if (lessonId) {
    await updateReviewQueue(lessonId, focusRating >= 3 ? 1 : 0);
  }
}

export async function updateReviewQueue(lessonId: number, success: number): Promise<void> {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<ReviewQueue>(
    'SELECT * FROM review_queue WHERE lesson_id = ?',
    [lessonId]
  );

  const today = new Date();

  if (existing) {
    let newInterval = existing.interval_days;
    let newEase = existing.ease_factor;

    if (success) {
      newInterval = Math.round(existing.interval_days * existing.ease_factor);
      newEase = Math.min(2.5, existing.ease_factor + 0.1);
    } else {
      newInterval = 1;
      newEase = Math.max(1.3, existing.ease_factor - 0.2);
    }

    const nextDate = new Date(today);
    nextDate.setDate(nextDate.getDate() + newInterval);

    await database.runAsync(
      'UPDATE review_queue SET next_review_date = ?, interval_days = ?, ease_factor = ?, last_result = ? WHERE lesson_id = ?',
      [nextDate.toISOString().split('T')[0], newInterval, newEase, success, lessonId]
    );
  } else {
    const nextDate = new Date(today);
    nextDate.setDate(nextDate.getDate() + 1);

    await database.runAsync(
      'INSERT INTO review_queue (lesson_id, next_review_date, interval_days, ease_factor, last_result) VALUES (?, ?, 1, 2.5, ?)',
      [lessonId, nextDate.toISOString().split('T')[0], success]
    );
  }
}

export async function getSubjectProgress(): Promise<SubjectProgress[]> {
  const database = await getDatabase();
  return database.getAllAsync<SubjectProgress>(`
    SELECT 
      s.id as subject_id,
      s.name as subject_name,
      s.color as subject_color,
      COUNT(l.id) as total_lessons,
      SUM(CASE WHEN l.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons,
      CASE 
        WHEN COUNT(l.id) = 0 THEN 0 
        ELSE ROUND(SUM(CASE WHEN l.is_completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(l.id))
      END as progress_percent
    FROM subjects s
    LEFT JOIN lessons l ON s.id = l.subject_id
    GROUP BY s.id
  `);
}

export async function getDailyStudyStats(days: number = 7): Promise<DailyStudyStats[]> {
  const database = await getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return database.getAllAsync<DailyStudyStats>(`
    SELECT 
      DATE(start_time) as date,
      SUM(duration_minutes) as total_minutes
    FROM study_sessions
    WHERE DATE(start_time) >= DATE(?)
    GROUP BY DATE(start_time)
    ORDER BY date ASC
  `, [startDate.toISOString()]);
}

export async function getAccuracyStats(days: number = 7): Promise<AccuracyStats[]> {
  const database = await getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return database.getAllAsync<AccuracyStats>(`
    SELECT 
      DATE(created_at) as date,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
      SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as wrong,
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
      END as accuracy
    FROM attempts
    WHERE DATE(created_at) >= DATE(?)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `, [startDate.toISOString()]);
}

export async function getTodayStudyMinutes(): Promise<number> {
  const database = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await database.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE DATE(start_time) = DATE(?)',
    [today]
  );
  return result?.total || 0;
}

export async function getRecommendedLessons(count: number = 3): Promise<WeakLesson[]> {
  const database = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  return database.getAllAsync<WeakLesson>(`
    SELECT 
      l.id as lesson_id,
      l.title as lesson_title,
      s.name as subject_name,
      s.color as subject_color,
      COALESCE(
        (SELECT ROUND(SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
         FROM attempts a
         JOIN exercises e ON a.exercise_id = e.id
         WHERE e.lesson_id = l.id), 100
      ) as accuracy,
      COALESCE(
        JULIANDAY(?) - JULIANDAY(
          (SELECT MAX(ss.start_time) FROM study_sessions ss WHERE ss.lesson_id = l.id)
        ), 999
      ) as days_since_review,
      (
        (100 - COALESCE(
          (SELECT ROUND(SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
           FROM attempts a
           JOIN exercises e ON a.exercise_id = e.id
           WHERE e.lesson_id = l.id), 100
        )) * 2 +
        COALESCE(
          JULIANDAY(?) - JULIANDAY(
            (SELECT MAX(ss.start_time) FROM study_sessions ss WHERE ss.lesson_id = l.id)
          ), 999
        ) * 0.5 +
        CASE WHEN l.is_completed = 0 THEN 50 ELSE 0 END
      ) as priority_score
    FROM lessons l
    JOIN subjects s ON l.subject_id = s.id
    ORDER BY priority_score DESC
    LIMIT ?
  `, [today, today, count]);
}

export async function getLessonsForReview(): Promise<LessonWithSubject[]> {
  const database = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  return database.getAllAsync<LessonWithSubject>(`
    SELECT l.*, s.name as subject_name, s.color as subject_color
    FROM lessons l
    JOIN subjects s ON l.subject_id = s.id
    JOIN review_queue r ON l.id = r.lesson_id
    WHERE DATE(r.next_review_date) <= DATE(?)
    ORDER BY r.next_review_date ASC
  `, [today]);
}

export async function getAllStudySessions(): Promise<StudySession[]> {
  const database = await getDatabase();
  return database.getAllAsync<StudySession>(
    'SELECT * FROM study_sessions ORDER BY start_time DESC'
  );
}
