"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const progress_store = require("../app/src/main/assets/www/core/progress_store.js");

test("a wrong answer remains counted and is due immediately", function () {
  const now = "2026-08-02T12:00:00.000Z";
  const progress = progress_store.updated_item_progress(null, false, now);
  assert.equal(progress.attempts, 1);
  assert.equal(progress.mistake_count, 1);
  assert.equal(progress.correct_streak, 0);
  assert.equal(progress.due_at, now);
  assert.equal(progress.last_was_correct, false);
});

test("correct answers receive increasing spaced-review intervals", function () {
  const first_time = "2026-08-02T12:00:00.000Z";
  const first = progress_store.updated_item_progress(null, true, first_time);
  const second = progress_store.updated_item_progress(first, true, "2026-08-03T12:00:00.000Z");
  assert.equal(first.interval_days, 1);
  assert.equal(second.interval_days, 3);
  assert.equal(second.correct_streak, 2);
  assert.equal(second.mistake_count, 0);
});

test("a session records mistakes, active time, calendar activity, and completion history", function () {
  let state = progress_store.create_empty_progress_state("2026-08-02T12:00:00.000Z");
  state = progress_store.begin_practice_session(
    state,
    ["core-01", "core-02"],
    "daily",
    null,
    "2026-08-02T12:00:00.000Z"
  );
  state = progress_store.record_answer_in_active_session(
    state,
    "core-01",
    false,
    "2026-08-02T12:00:20.000Z",
    20
  );
  state = progress_store.record_answer_in_active_session(
    state,
    "core-02",
    true,
    "2026-08-02T12:00:35.000Z",
    15
  );
  assert.equal(state.active_session.current_question_index, 2);
  assert.equal(state.activity_by_date["2026-08-02"].answers, 2);
  assert.equal(state.activity_by_date["2026-08-02"].seconds, 35);
  assert.equal(state.item_progress_by_id["core-01"].mistake_count, 1);

  const summary = progress_store.summarize_active_session(state);
  assert.equal(summary.correct_count, 1);
  assert.equal(summary.accuracy, 0.5);

  state = progress_store.complete_active_session(state, "2026-08-02T12:00:36.000Z");
  assert.equal(state.active_session, null);
  assert.equal(state.session_history.length, 1);
  assert.equal(state.session_history[0].answered_count, 2);
  assert.equal(state.activity_by_date["2026-08-02"].completed_sessions, 1);
});
