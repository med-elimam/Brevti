export interface Subject {
  id: number;
  name: string;
  color: string;
}

export interface Lesson {
  id: number;
  subject_id: number;
  title: string;
  summary: string;
  importance_points: string;
  common_mistakes: string;
  is_completed: number;
}

export interface StudySession {
  id: number;
  subject_id: number;
  lesson_id: number | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  focus_rating: number;
  notes: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  difficulty: number;
  question: string;
  options_json: string;
  correct_index: number;
  explanation: string;
}

export interface Attempt {
  id: number;
  exercise_id: number;
  chosen_index: number;
  is_correct: number;
  time_spent_seconds: number;
  created_at: string;
}

export interface ReviewQueue {
  id: number;
  lesson_id: number;
  next_review_date: string;
  interval_days: number;
  ease_factor: number;
  last_result: number;
}

export interface Settings {
  id: number;
  exam_date: string | null;
  daily_minutes_goal: number;
  pomodoro_work: number;
  pomodoro_break: number;
  onboarding_complete: number;
}

export interface LessonWithSubject extends Lesson {
  subject_name: string;
  subject_color: string;
}

export interface ExerciseWithOptions extends Exercise {
  options: string[];
}

export interface SubjectProgress {
  subject_id: number;
  subject_name: string;
  subject_color: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
}

export interface DailyStudyStats {
  date: string;
  total_minutes: number;
}

export interface AccuracyStats {
  date: string;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface WeakLesson {
  lesson_id: number;
  lesson_title: string;
  subject_name: string;
  subject_color: string;
  accuracy: number;
  days_since_review: number;
  priority_score: number;
}
