(function publish_progress_store(global_scope) {
  "use strict";

  const STORAGE_KEY = "toki_pona_drills_progress_v1";
  const CURRENT_SCHEMA_VERSION = 1;
  const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
  const CORRECT_REVIEW_INTERVALS_IN_DAYS = [1, 3, 7, 14, 30, 60, 120];

  function clone_plain_data(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function iso_timestamp(timestamp_or_date) {
    const date = timestamp_or_date instanceof Date ? timestamp_or_date : new Date(timestamp_or_date);
    return date.toISOString();
  }

  function local_date_key(timestamp_or_date) {
    const date = timestamp_or_date instanceof Date ? timestamp_or_date : new Date(timestamp_or_date);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function create_empty_progress_state(now) {
    const created_at = iso_timestamp(now || new Date());
    return {
      schema_version: CURRENT_SCHEMA_VERSION,
      created_at: created_at,
      item_progress_by_id: {},
      activity_by_date: {},
      session_history: [],
      active_session: null
    };
  }

  function nonnegative_integer(value, fallback) {
    return Number.isInteger(value) && value >= 0 ? value : fallback;
  }

  function normalized_progress_state(candidate_state, now) {
    if (!candidate_state || typeof candidate_state !== "object") {
      return create_empty_progress_state(now);
    }

    const normalized_state = create_empty_progress_state(now);
    normalized_state.created_at = typeof candidate_state.created_at === "string"
      ? candidate_state.created_at
      : normalized_state.created_at;
    normalized_state.item_progress_by_id = candidate_state.item_progress_by_id &&
      typeof candidate_state.item_progress_by_id === "object"
      ? candidate_state.item_progress_by_id
      : {};
    normalized_state.activity_by_date = candidate_state.activity_by_date &&
      typeof candidate_state.activity_by_date === "object"
      ? candidate_state.activity_by_date
      : {};
    normalized_state.session_history = Array.isArray(candidate_state.session_history)
      ? candidate_state.session_history.slice(0, 180)
      : [];
    normalized_state.active_session = candidate_state.active_session &&
      Array.isArray(candidate_state.active_session.question_ids)
      ? candidate_state.active_session
      : null;
    return normalized_state;
  }

  function load_progress_state(storage, now) {
    try {
      const serialized_state = storage.getItem(STORAGE_KEY);
      if (!serialized_state) {
        return create_empty_progress_state(now);
      }
      return normalized_progress_state(JSON.parse(serialized_state), now);
    } catch (error) {
      return create_empty_progress_state(now);
    }
  }

  function save_progress_state(storage, progress_state) {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress_state));
  }

  function generated_session_id(now) {
    return "session-" + new Date(now).getTime() + "-" + Math.random().toString(36).slice(2, 9);
  }

  function begin_practice_session(progress_state, question_ids, mode, lesson_id, now) {
    const next_state = clone_plain_data(progress_state);
    const started_at = iso_timestamp(now || new Date());
    next_state.active_session = {
      id: generated_session_id(started_at),
      mode: mode,
      lesson_id: lesson_id || null,
      question_ids: question_ids.slice(),
      current_question_index: 0,
      answered_count: 0,
      correct_count: 0,
      started_at: started_at,
      last_activity_at: started_at,
      accumulated_seconds: 0
    };
    return next_state;
  }

  function due_timestamp_after_correct_answer(previous_item_progress, answered_at) {
    const prior_streak = nonnegative_integer(previous_item_progress.correct_streak, 0);
    const next_streak = prior_streak + 1;
    const interval_index = Math.min(next_streak - 1, CORRECT_REVIEW_INTERVALS_IN_DAYS.length - 1);
    const interval_days = CORRECT_REVIEW_INTERVALS_IN_DAYS[interval_index];
    return {
      interval_days: interval_days,
      due_at: new Date(new Date(answered_at).getTime() + interval_days * MILLISECONDS_PER_DAY).toISOString(),
      correct_streak: next_streak
    };
  }

  function updated_item_progress(previous_item_progress, was_correct, answered_at) {
    const previous = previous_item_progress || {};
    const next_item_progress = {
      attempts: nonnegative_integer(previous.attempts, 0) + 1,
      correct_answers: nonnegative_integer(previous.correct_answers, 0) + (was_correct ? 1 : 0),
      mistake_count: nonnegative_integer(previous.mistake_count, 0) + (was_correct ? 0 : 1),
      correct_streak: 0,
      interval_days: 0,
      due_at: answered_at,
      first_seen_at: typeof previous.first_seen_at === "string" ? previous.first_seen_at : answered_at,
      last_seen_at: answered_at,
      last_was_correct: Boolean(was_correct)
    };

    if (was_correct) {
      const schedule = due_timestamp_after_correct_answer(previous, answered_at);
      next_item_progress.correct_streak = schedule.correct_streak;
      next_item_progress.interval_days = schedule.interval_days;
      next_item_progress.due_at = schedule.due_at;
    }
    return next_item_progress;
  }

  function elapsed_seconds_since_last_activity(active_session, answered_at, explicit_elapsed_seconds) {
    if (Number.isFinite(explicit_elapsed_seconds)) {
      return Math.max(0, Math.min(300, Math.round(explicit_elapsed_seconds)));
    }
    const elapsed_milliseconds = new Date(answered_at).getTime() - new Date(active_session.last_activity_at).getTime();
    if (!Number.isFinite(elapsed_milliseconds)) {
      return 0;
    }
    return Math.max(0, Math.min(300, Math.round(elapsed_milliseconds / 1000)));
  }

  function ensure_activity_record(progress_state, date_key) {
    const previous_activity = progress_state.activity_by_date[date_key] || {};
    const lesson_ids = Array.isArray(previous_activity.lesson_ids) ? previous_activity.lesson_ids.slice() : [];
    const activity_record = {
      answers: nonnegative_integer(previous_activity.answers, 0),
      correct_answers: nonnegative_integer(previous_activity.correct_answers, 0),
      seconds: nonnegative_integer(previous_activity.seconds, 0),
      completed_sessions: nonnegative_integer(previous_activity.completed_sessions, 0),
      lesson_ids: lesson_ids
    };
    progress_state.activity_by_date[date_key] = activity_record;
    return activity_record;
  }

  function record_answer_in_active_session(progress_state, exercise_id, was_correct, now, explicit_elapsed_seconds) {
    if (!progress_state.active_session) {
      throw new Error("Cannot record an answer without an active session.");
    }

    const next_state = clone_plain_data(progress_state);
    const answered_at = iso_timestamp(now || new Date());
    const active_session = next_state.active_session;
    const expected_exercise_id = active_session.question_ids[active_session.current_question_index];
    if (expected_exercise_id !== exercise_id) {
      throw new Error("The answer does not match the active question.");
    }

    const elapsed_seconds = elapsed_seconds_since_last_activity(
      active_session,
      answered_at,
      explicit_elapsed_seconds
    );
    next_state.item_progress_by_id[exercise_id] = updated_item_progress(
      next_state.item_progress_by_id[exercise_id],
      was_correct,
      answered_at
    );

    active_session.current_question_index += 1;
    active_session.answered_count += 1;
    active_session.correct_count += was_correct ? 1 : 0;
    active_session.accumulated_seconds += elapsed_seconds;
    active_session.last_activity_at = answered_at;

    const date_key = local_date_key(answered_at);
    const activity_record = ensure_activity_record(next_state, date_key);
    activity_record.answers += 1;
    activity_record.correct_answers += was_correct ? 1 : 0;
    activity_record.seconds += elapsed_seconds;
    if (active_session.lesson_id && activity_record.lesson_ids.indexOf(active_session.lesson_id) === -1) {
      activity_record.lesson_ids.push(active_session.lesson_id);
    }
    return next_state;
  }

  function summarize_active_session(progress_state) {
    const active_session = progress_state.active_session;
    if (!active_session) {
      return null;
    }
    const accuracy = active_session.answered_count === 0
      ? 0
      : active_session.correct_count / active_session.answered_count;
    return {
      id: active_session.id,
      mode: active_session.mode,
      lesson_id: active_session.lesson_id,
      started_at: active_session.started_at,
      answered_count: active_session.answered_count,
      correct_count: active_session.correct_count,
      accumulated_seconds: active_session.accumulated_seconds,
      accuracy: accuracy
    };
  }

  function complete_active_session(progress_state, now) {
    if (!progress_state.active_session) {
      return progress_state;
    }
    const next_state = clone_plain_data(progress_state);
    const completed_at = iso_timestamp(now || new Date());
    const active_session = next_state.active_session;
    const history_entry = {
      id: active_session.id,
      mode: active_session.mode,
      lesson_id: active_session.lesson_id,
      started_at: active_session.started_at,
      completed_at: completed_at,
      answered_count: active_session.answered_count,
      correct_count: active_session.correct_count,
      seconds: active_session.accumulated_seconds
    };
    next_state.session_history.unshift(history_entry);
    next_state.session_history = next_state.session_history.slice(0, 180);

    const date_key = local_date_key(completed_at);
    const activity_record = ensure_activity_record(next_state, date_key);
    activity_record.completed_sessions += 1;
    if (active_session.lesson_id && activity_record.lesson_ids.indexOf(active_session.lesson_id) === -1) {
      activity_record.lesson_ids.push(active_session.lesson_id);
    }
    next_state.active_session = null;
    return next_state;
  }

  function abandon_active_session(progress_state) {
    const next_state = clone_plain_data(progress_state);
    next_state.active_session = null;
    return next_state;
  }

  function total_practice_statistics(progress_state) {
    return Object.keys(progress_state.activity_by_date).reduce(function add_activity(total, date_key) {
      const activity = progress_state.activity_by_date[date_key];
      total.days_practiced += activity.answers > 0 ? 1 : 0;
      total.answers += nonnegative_integer(activity.answers, 0);
      total.correct_answers += nonnegative_integer(activity.correct_answers, 0);
      total.seconds += nonnegative_integer(activity.seconds, 0);
      return total;
    }, { days_practiced: 0, answers: 0, correct_answers: 0, seconds: 0 });
  }

  const public_api = Object.freeze({
    STORAGE_KEY: STORAGE_KEY,
    create_empty_progress_state: create_empty_progress_state,
    normalized_progress_state: normalized_progress_state,
    load_progress_state: load_progress_state,
    save_progress_state: save_progress_state,
    local_date_key: local_date_key,
    begin_practice_session: begin_practice_session,
    record_answer_in_active_session: record_answer_in_active_session,
    complete_active_session: complete_active_session,
    abandon_active_session: abandon_active_session,
    summarize_active_session: summarize_active_session,
    updated_item_progress: updated_item_progress,
    total_practice_statistics: total_practice_statistics
  });

  global_scope.ProgressStore = public_api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = public_api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
