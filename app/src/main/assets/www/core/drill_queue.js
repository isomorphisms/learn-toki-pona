(function publish_drill_queue(global_scope) {
  "use strict";

  function flatten_lessons(lessons) {
    const flattened = [];
    lessons.forEach(function append_lesson_exercises(lesson) {
      lesson.exercises.forEach(function append_exercise(exercise, exercise_index) {
        flattened.push({
          exercise: exercise,
          lesson: lesson,
          lesson_index: lesson.number - 1,
          exercise_index: exercise_index
        });
      });
    });
    return flattened;
  }

  function review_priority(flattened_exercise, item_progress_by_id, now) {
    const progress = item_progress_by_id[flattened_exercise.exercise.id];
    if (!progress) {
      return {
        bucket: 2,
        weakness: 0,
        time: flattened_exercise.lesson_index * 1000 + flattened_exercise.exercise_index
      };
    }

    const due_time = new Date(progress.due_at).getTime();
    const now_time = new Date(now).getTime();
    const is_due = !Number.isFinite(due_time) || due_time <= now_time;
    const attempts = progress.attempts || 0;
    const correct_answers = progress.correct_answers || 0;
    const error_rate = attempts === 0 ? 0 : (attempts - correct_answers) / attempts;
    const weakness = (progress.mistake_count || 0) * 10 + error_rate;

    if (is_due && progress.last_was_correct === false) {
      return { bucket: 0, weakness: weakness, time: due_time || 0 };
    }
    if (is_due) {
      return { bucket: 1, weakness: weakness, time: due_time || 0 };
    }
    return { bucket: 3, weakness: weakness, time: new Date(progress.last_seen_at).getTime() || 0 };
  }

  function compare_review_candidates(left, right) {
    if (left.priority.bucket !== right.priority.bucket) {
      return left.priority.bucket - right.priority.bucket;
    }
    if (left.priority.bucket === 0 || left.priority.bucket === 3) {
      if (left.priority.weakness !== right.priority.weakness) {
        return right.priority.weakness - left.priority.weakness;
      }
    }
    if (left.priority.time !== right.priority.time) {
      return left.priority.time - right.priority.time;
    }
    if (left.flattened.lesson_index !== right.flattened.lesson_index) {
      return left.flattened.lesson_index - right.flattened.lesson_index;
    }
    return left.flattened.exercise_index - right.flattened.exercise_index;
  }

  function build_daily_question_ids(lessons, item_progress_by_id, now, maximum_questions) {
    const limit = Number.isInteger(maximum_questions) ? maximum_questions : 12;
    return flatten_lessons(lessons)
      .map(function add_priority(flattened) {
        return {
          flattened: flattened,
          priority: review_priority(flattened, item_progress_by_id, now)
        };
      })
      .sort(compare_review_candidates)
      .slice(0, limit)
      .map(function select_exercise_id(candidate) {
        return candidate.flattened.exercise.id;
      });
  }

  function build_lesson_question_ids(lesson, item_progress_by_id, now) {
    const artificial_lessons = [{
      id: lesson.id,
      number: lesson.number,
      exercises: lesson.exercises
    }];
    return flatten_lessons(artificial_lessons)
      .map(function add_priority(flattened) {
        return {
          flattened: flattened,
          priority: review_priority(flattened, item_progress_by_id, now)
        };
      })
      .sort(compare_review_candidates)
      .map(function select_exercise_id(candidate) {
        return candidate.flattened.exercise.id;
      });
  }

  function exercise_lookup_by_id(lessons) {
    return flatten_lessons(lessons).reduce(function add_exercise(lookup, flattened) {
      lookup[flattened.exercise.id] = flattened.exercise;
      return lookup;
    }, {});
  }

  function lesson_lookup_by_exercise_id(lessons) {
    return flatten_lessons(lessons).reduce(function add_lesson(lookup, flattened) {
      lookup[flattened.exercise.id] = flattened.lesson;
      return lookup;
    }, {});
  }

  function stable_string_hash(text) {
    let hash = 2166136261;
    for (let index = 0; index < String(text).length; index += 1) {
      hash ^= String(text).charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function deterministic_shuffle(items, seed_text) {
    const shuffled = items.slice();
    let state = stable_string_hash(seed_text) || 1;
    function next_fraction() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    }
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const replacement_index = Math.floor(next_fraction() * (index + 1));
      const temporary = shuffled[index];
      shuffled[index] = shuffled[replacement_index];
      shuffled[replacement_index] = temporary;
    }
    return shuffled;
  }

  function correct_answer_content(exercise) {
    if (exercise.type === "multiple_choice") {
      return [exercise.choices[exercise.correct_choice_index]];
    }
    if (exercise.type === "matching") {
      return exercise.pairs.map(function summarize_pair(pair) {
        return {
          kind: "pair",
          left: pair.left,
          right: pair.right
        };
      });
    }
    return [];
  }

  function count_due_items(lessons, item_progress_by_id, now) {
    return flatten_lessons(lessons).filter(function item_is_due(flattened) {
      const progress = item_progress_by_id[flattened.exercise.id];
      return progress && new Date(progress.due_at).getTime() <= new Date(now).getTime();
    }).length;
  }

  const public_api = Object.freeze({
    flatten_lessons: flatten_lessons,
    build_daily_question_ids: build_daily_question_ids,
    build_lesson_question_ids: build_lesson_question_ids,
    exercise_lookup_by_id: exercise_lookup_by_id,
    lesson_lookup_by_exercise_id: lesson_lookup_by_exercise_id,
    deterministic_shuffle: deterministic_shuffle,
    correct_answer_content: correct_answer_content,
    count_due_items: count_due_items
  });

  global_scope.DrillQueue = public_api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = public_api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
