"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const lexicon = require("../app/src/main/assets/www/data/lexicon.js");
const lesson_data = require("../app/src/main/assets/www/data/lessons.js");

function collect_toki_content(value, collected) {
  if (!value || typeof value !== "object") {
    return;
  }
  if (value.kind === "toki" && typeof value.text === "string") {
    collected.push(value.text);
  }
  Object.keys(value).forEach(function visit_child(key) {
    collect_toki_content(value[key], collected);
  });
}

test("version one contains seven lessons and 56 exercises", function () {
  assert.equal(lesson_data.lessons.length, 7);
  const exercise_count = lesson_data.lessons.reduce(function add_exercises(total, lesson) {
    return total + lesson.exercises.length;
  }, 0);
  assert.equal(exercise_count, 56);
  lesson_data.lessons.forEach(function verify_lesson_size(lesson) {
    assert.equal(lesson.exercises.length, 8);
  });
});

test("exercise IDs are unique and every answer is structurally valid", function () {
  const identifiers = new Set();
  lesson_data.lessons.forEach(function verify_lesson(lesson) {
    lesson.exercises.forEach(function verify_exercise(exercise) {
      assert.equal(identifiers.has(exercise.id), false, exercise.id);
      identifiers.add(exercise.id);
      if (exercise.type === "multiple_choice") {
        assert.equal(exercise.choices.length, 4, exercise.id);
        assert.ok(exercise.correct_choice_index >= 0 && exercise.correct_choice_index < 4, exercise.id);
      } else {
        assert.equal(exercise.type, "matching", exercise.id);
        assert.equal(exercise.pairs.length, 4, exercise.id);
      }
    });
  });
});

test("every Toki Pona token in the curriculum has a bundled Unicode glyph", function () {
  const toki_texts = [];
  collect_toki_content(lesson_data.lessons, toki_texts);
  toki_texts.forEach(function verify_sentence(sentence) {
    const words = sentence.toLowerCase().match(/[a-z]+/g) || [];
    words.forEach(function verify_word(word) {
      assert.ok(lexicon.unicode_character_for_word(word), sentence + " contains unmapped word " + word);
    });
  });
  assert.ok(toki_texts.length > 100);
});
