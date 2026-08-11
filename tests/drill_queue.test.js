"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const lessons = require("../app/src/main/assets/www/data/lessons.js").lessons;
const drill_queue = require("../app/src/main/assets/www/core/drill_queue.js");

test("an empty profile begins in curriculum order", function () {
  const question_ids = drill_queue.build_daily_question_ids(
    lessons,
    {},
    "2026-08-02T12:00:00.000Z",
    12
  );
  assert.deepEqual(question_ids.slice(0, 8), lessons[0].exercises.map(function id(exercise) {
    return exercise.id;
  }));
  assert.deepEqual(question_ids.slice(8), lessons[1].exercises.slice(0, 4).map(function id(exercise) {
    return exercise.id;
  }));
});

test("a due mistake moves ahead of unseen material", function () {
  const item_progress = {
    "adult-08": {
      attempts: 1,
      correct_answers: 0,
      mistake_count: 1,
      correct_streak: 0,
      due_at: "2026-08-02T11:00:00.000Z",
      last_seen_at: "2026-08-02T11:00:00.000Z",
      last_was_correct: false
    }
  };
  const question_ids = drill_queue.build_daily_question_ids(
    lessons,
    item_progress,
    "2026-08-02T12:00:00.000Z",
    12
  );
  assert.equal(question_ids[0], "adult-08");
});

test("lesson drills include exactly that lesson and deterministic shuffling is stable", function () {
  const question_ids = drill_queue.build_lesson_question_ids(
    lessons[2],
    {},
    "2026-08-02T12:00:00.000Z"
  );
  assert.deepEqual(question_ids, lessons[2].exercises.map(function id(exercise) {
    return exercise.id;
  }));

  const first = drill_queue.deterministic_shuffle([1, 2, 3, 4], "same-seed");
  const second = drill_queue.deterministic_shuffle([1, 2, 3, 4], "same-seed");
  assert.deepEqual(first, second);
  assert.deepEqual(first.slice().sort(), [1, 2, 3, 4]);
});
