(function start_offline_toki_pona_trainer(global_scope) {
  "use strict";

  if (typeof document === "undefined") {
    return;
  }

  const lessons = global_scope.TokiPonaLessons.lessons;
  const sitelen = global_scope.SitelenPonaRendering;
  const progress_store = global_scope.ProgressStore;
  const drill_queue = global_scope.DrillQueue;
  const exercise_by_id = drill_queue.exercise_lookup_by_id(lessons);
  const lesson_by_exercise_id = drill_queue.lesson_lookup_by_exercise_id(lessons);
  const app_root = document.getElementById("app");

  let progress_state = progress_store.load_progress_state(global_scope.localStorage, new Date());
  let current_view = "home";
  let most_recent_completed_session = null;

  function persist_progress_state() {
    try {
      progress_store.save_progress_state(global_scope.localStorage, progress_state);
    } catch (error) {
      // The app stays usable for the current session even if device storage is unavailable.
      console.error("Could not save practice progress.", error);
    }
  }

  function render_toki(latin_text) {
    return sitelen.render_latin_with_every_adjacent_glyph(latin_text);
  }

  function render_content(content) {
    return sitelen.render_content_by_language(content);
  }

  function pluralized(count, singular, plural) {
    return count + " " + (count === 1 ? singular : plural);
  }

  function format_minutes(seconds) {
    if (seconds < 60 && seconds > 0) {
      return "<1 min";
    }
    return Math.round(seconds / 60) + " min";
  }

  function formatted_date(timestamp) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(timestamp));
  }

  function formatted_date_and_time(timestamp) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(timestamp));
  }

  function page_shell(page_content, active_navigation_view) {
    const brand_title = render_toki("toki pona") + " drills";
    const navigation = active_navigation_view ? (
      '<nav class="bottom_nav" aria-label="Main navigation">' +
        '<button class="nav_button ' + (active_navigation_view === "home" ? "active" : "") + '" data-view="home">Learn</button>' +
        '<button class="nav_button ' + (active_navigation_view === "mistakes" ? "active" : "") + '" data-view="mistakes">Mistakes</button>' +
        '<button class="nav_button ' + (active_navigation_view === "history" ? "active" : "") + '" data-view="history">History</button>' +
      "</nav>"
    ) : "";

    return '<div class="app_shell">' +
      '<header class="page_header">' +
        '<div class="brand">' +
          '<div class="brand_title">' + brand_title + "</div>" +
          '<div class="brand_subtitle">offline · private · local progress</div>' +
        "</div>" +
      "</header>" +
      page_content +
      navigation +
    "</div>";
  }

  function attach_navigation_handlers() {
    document.querySelectorAll("[data-view]").forEach(function attach_navigation(button) {
      button.addEventListener("click", function change_view() {
        current_view = button.getAttribute("data-view");
        render_current_view();
      });
    });
  }

  function calendar_html() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const calendar_start = new Date(today);
    calendar_start.setDate(today.getDate() - 28 - today.getDay());
    const created_date = new Date(progress_state.created_at);
    created_date.setHours(0, 0, 0, 0);
    const weekday_labels = ["S", "M", "T", "W", "T", "F", "S"];

    const weekday_html = weekday_labels.map(function render_weekday(label) {
      return "<span>" + label + "</span>";
    }).join("");

    let days_html = "";
    for (let offset = 0; offset < 35; offset += 1) {
      const date = new Date(calendar_start);
      date.setDate(calendar_start.getDate() + offset);
      const date_key = progress_store.local_date_key(date);
      const activity = progress_state.activity_by_date[date_key];
      const practiced = activity && activity.answers > 0;
      const is_today = date.getTime() === today.getTime();
      const is_past_practice_day = date < today && date >= created_date;
      const classes = ["calendar_day"];
      if (practiced) {
        classes.push("practiced");
      } else if (is_past_practice_day) {
        classes.push("missed");
      }
      if (is_today) {
        classes.push("today");
      }
      const detail = practiced
        ? pluralized(activity.answers, "answer", "answers") + ", " + format_minutes(activity.seconds)
        : "no recorded practice";
      days_html += '<span class="' + classes.join(" ") + '" title="' +
        sitelen.escape_html(formatted_date(date) + ": " + detail) + '">' + date.getDate() + "</span>";
    }

    return '<div class="calendar_card">' +
      '<div class="calendar_weekdays">' + weekday_html + "</div>" +
      '<div class="calendar_grid">' + days_html + "</div>" +
      '<div class="calendar_legend">' +
        '<span><i class="legend_mark practiced"></i>practiced</span>' +
        '<span><i class="legend_mark"></i>no practice recorded</span>' +
      "</div>" +
    "</div>";
  }

  function statistics_grid_html() {
    const statistics = progress_store.total_practice_statistics(progress_state);
    const accuracy = statistics.answers === 0
      ? "—"
      : Math.round(100 * statistics.correct_answers / statistics.answers) + "%";
    return '<div class="stats_grid">' +
      '<div class="stat_card"><span class="stat_value">' + statistics.days_practiced + '</span><span class="stat_label">days practiced</span></div>' +
      '<div class="stat_card"><span class="stat_value">' + format_minutes(statistics.seconds) + '</span><span class="stat_label">active time</span></div>' +
      '<div class="stat_card"><span class="stat_value">' + accuracy + '</span><span class="stat_label">first-try accuracy</span></div>' +
    "</div>";
  }

  function lesson_cards_html() {
    return lessons.map(function render_lesson_card(lesson) {
      const seen_count = lesson.exercises.filter(function exercise_was_seen(exercise) {
        return Boolean(progress_state.item_progress_by_id[exercise.id]);
      }).length;
      const due_count = lesson.exercises.filter(function lesson_exercise_is_due(exercise) {
        const progress = progress_state.item_progress_by_id[exercise.id];
        return progress && new Date(progress.due_at).getTime() <= Date.now();
      }).length;
      const progress_note = seen_count + " of " + lesson.exercises.length + " seen" +
        (due_count > 0 ? " · " + due_count + " due" : "");
      return '<article class="lesson_card">' +
        "<div>" +
          '<div class="lesson_number">Lesson ' + lesson.number + "</div>" +
          '<h3 class="lesson_title">' + sitelen.escape_html(lesson.title) + "</h3>" +
          '<p class="lesson_summary">' + sitelen.escape_html(lesson.summary) + "</p>" +
          '<div class="lesson_summary">' + render_content(lesson.focus) + "</div>" +
          '<div class="lesson_progress">' + progress_note + "</div>" +
        "</div>" +
        '<button class="secondary_button" data-start-lesson="' + lesson.id + '">Practice</button>' +
      "</article>";
    }).join("");
  }

  function render_home_view() {
    const due_count = drill_queue.count_due_items(
      lessons,
      progress_state.item_progress_by_id,
      new Date()
    );
    const active_session = progress_state.active_session;
    const start_button_text = due_count > 0
      ? "Practice now · " + pluralized(due_count, "review due", "reviews due")
      : "Start a 12-question drill";
    const primary_action = active_session
      ? '<button class="primary_button" id="resume_session_button">Resume current drill · ' +
          active_session.current_question_index + " of " + active_session.question_ids.length + " answered</button>"
      : '<button class="primary_button" id="start_daily_button">' + start_button_text + "</button>";

    const content = '<main class="page_content">' +
      '<section class="hero_card">' +
        '<p class="hero_eyebrow">' + render_toki("o kama sona") + "</p>" +
        '<h1 class="hero_title">A short drill that remembers what went wrong.</h1>' +
        '<p class="hero_copy">Due mistakes come first. New material follows the lesson order. Everything stays on this device.</p>' +
        primary_action +
      "</section>" +
      statistics_grid_html() +
      '<h2 class="section_heading">Practice calendar</h2>' +
      calendar_html() +
      '<h2 class="section_heading">Lessons</h2>' +
      '<p class="section_intro">Choose one section, or let the daily drill mix due reviews with the next unseen material.</p>' +
      '<section class="lesson_list">' + lesson_cards_html() + "</section>" +
    "</main>";

    app_root.innerHTML = page_shell(content, "home");
    attach_navigation_handlers();
    const daily_button = document.getElementById("start_daily_button");
    if (daily_button) {
      daily_button.addEventListener("click", function start_daily() {
        start_daily_session();
      });
    }
    const resume_button = document.getElementById("resume_session_button");
    if (resume_button) {
      resume_button.addEventListener("click", function resume_session() {
        current_view = "practice";
        render_current_view();
      });
    }
    document.querySelectorAll("[data-start-lesson]").forEach(function attach_lesson_start(button) {
      button.addEventListener("click", function start_lesson() {
        start_lesson_session(button.getAttribute("data-start-lesson"));
      });
    });
  }

  function prepare_to_replace_active_session() {
    if (!progress_state.active_session) {
      return true;
    }
    const should_replace = global_scope.confirm(
      "A drill is already in progress. Start this one instead? Answers already recorded will remain in history."
    );
    if (should_replace) {
      progress_state = progress_store.abandon_active_session(progress_state);
      persist_progress_state();
    }
    return should_replace;
  }

  function begin_session_with_question_ids(question_ids, mode, lesson_id) {
    if (!prepare_to_replace_active_session()) {
      return;
    }
    progress_state = progress_store.begin_practice_session(
      progress_state,
      question_ids,
      mode,
      lesson_id,
      new Date()
    );
    persist_progress_state();
    current_view = "practice";
    render_current_view();
  }

  function start_daily_session() {
    const question_ids = drill_queue.build_daily_question_ids(
      lessons,
      progress_state.item_progress_by_id,
      new Date(),
      12
    );
    begin_session_with_question_ids(question_ids, "daily", null);
  }

  function start_lesson_session(lesson_id) {
    const selected_lesson = lessons.find(function lesson_matches(lesson) {
      return lesson.id === lesson_id;
    });
    if (!selected_lesson) {
      return;
    }
    const question_ids = drill_queue.build_lesson_question_ids(
      selected_lesson,
      progress_state.item_progress_by_id,
      new Date()
    );
    begin_session_with_question_ids(question_ids, "lesson", selected_lesson.id);
  }

  function start_mistake_session() {
    const mistake_ids = Object.keys(progress_state.item_progress_by_id)
      .filter(function has_recorded_mistake(exercise_id) {
        return progress_state.item_progress_by_id[exercise_id].mistake_count > 0 && exercise_by_id[exercise_id];
      })
      .sort(function weakest_first(left_id, right_id) {
        const left = progress_state.item_progress_by_id[left_id];
        const right = progress_state.item_progress_by_id[right_id];
        if (left.last_was_correct !== right.last_was_correct) {
          return left.last_was_correct ? 1 : -1;
        }
        return right.mistake_count - left.mistake_count;
      })
      .slice(0, 12);
    if (mistake_ids.length > 0) {
      begin_session_with_question_ids(mistake_ids, "mistakes", null);
    }
  }

  function practice_header_html(active_session) {
    const total_questions = active_session.question_ids.length;
    const current_number = Math.min(active_session.current_question_index + 1, total_questions);
    const completed_fraction = total_questions === 0
      ? 1
      : active_session.current_question_index / total_questions;
    return '<div class="practice_header">' +
      '<button class="quiet_button" id="close_practice_button" aria-label="Close practice">Close</button>' +
      '<div class="progress_track" aria-label="Practice progress"><div class="progress_fill" style="width:' +
        Math.round(completed_fraction * 100) + '%"></div></div>' +
      '<span class="question_count">' + current_number + " / " + total_questions + "</span>" +
    "</div>";
  }

  function render_multiple_choice_question(exercise, active_session) {
    const indexed_choices = exercise.choices.map(function add_original_index(choice, original_index) {
      return { choice: choice, original_index: original_index };
    });
    const shuffled_choices = drill_queue.deterministic_shuffle(
      indexed_choices,
      active_session.id + "-" + exercise.id + "-choices"
    );
    const choice_html = shuffled_choices.map(function render_choice(indexed_choice) {
      return '<button class="choice_button" data-choice-index="' + indexed_choice.original_index + '">' +
        render_content(indexed_choice.choice) +
      "</button>";
    }).join("");

    return '<article class="practice_card">' +
      '<p class="question_kind">Choose one</p>' +
      '<h1 class="question_prompt">' + render_content(exercise.prompt) + "</h1>" +
      '<div class="choice_list">' + choice_html + "</div>" +
    "</article>";
  }

  function render_matching_question(exercise, active_session) {
    const left_pairs = drill_queue.deterministic_shuffle(
      exercise.pairs,
      active_session.id + "-" + exercise.id + "-left"
    );
    const right_pairs = drill_queue.deterministic_shuffle(
      exercise.pairs,
      active_session.id + "-" + exercise.id + "-right"
    );
    const left_html = left_pairs.map(function render_left(pair) {
      return '<button class="matching_button" data-matching-side="left" data-pair-id="' + pair.id + '">' +
        render_content(pair.left) + "</button>";
    }).join("");
    const right_html = right_pairs.map(function render_right(pair) {
      return '<button class="matching_button" data-matching-side="right" data-pair-id="' + pair.id + '">' +
        render_content(pair.right) + "</button>";
    }).join("");

    return '<article class="practice_card">' +
      '<p class="question_kind">Match the pairs</p>' +
      '<h1 class="question_prompt">' + render_content(exercise.prompt) + "</h1>" +
      '<p class="matching_instructions">Tap one item in each column. A wrong pair stays available for another try.</p>' +
      '<div class="matching_grid">' +
        '<div class="matching_column">' + left_html + "</div>" +
        '<div class="matching_column">' + right_html + "</div>" +
      "</div>" +
    "</article>";
  }

  function correct_answer_html(exercise) {
    if (exercise.type === "multiple_choice") {
      return render_content(exercise.choices[exercise.correct_choice_index]);
    }
    return "All " + exercise.pairs.length + " pairs completed.";
  }

  function show_answer_feedback(exercise, was_correct) {
    const panel_class = was_correct ? "feedback_panel" : "feedback_panel incorrect";
    const title = was_correct ? "Correct" : "Saved for review";
    const explanation = (was_correct ? "" : "Correct answer: " + correct_answer_html(exercise) + "<br>") +
      sitelen.escape_html(exercise.explanation);
    document.body.insertAdjacentHTML(
      "beforeend",
      '<section class="' + panel_class + '" id="answer_feedback">' +
        '<div class="feedback_inner">' +
          '<h2 class="feedback_title">' + title + "</h2>" +
          '<p class="feedback_explanation">' + explanation + "</p>" +
          '<button class="primary_button" id="next_question_button">Next</button>' +
        "</div>" +
      "</section>"
    );
    document.getElementById("next_question_button").addEventListener("click", function next_question() {
      const feedback = document.getElementById("answer_feedback");
      if (feedback) {
        feedback.remove();
      }
      render_current_view();
    });
  }

  function record_answer(exercise, was_correct) {
    progress_state = progress_store.record_answer_in_active_session(
      progress_state,
      exercise.id,
      was_correct,
      new Date()
    );
    persist_progress_state();
  }

  function attach_multiple_choice_handlers(exercise) {
    document.querySelectorAll("[data-choice-index]").forEach(function attach_choice(button) {
      button.addEventListener("click", function choose_answer() {
        const selected_index = Number(button.getAttribute("data-choice-index"));
        const was_correct = selected_index === exercise.correct_choice_index;
        document.querySelectorAll("[data-choice-index]").forEach(function reveal_answers(answer_button) {
          answer_button.disabled = true;
          const answer_index = Number(answer_button.getAttribute("data-choice-index"));
          if (answer_index === exercise.correct_choice_index) {
            answer_button.classList.add("correct");
          } else if (answer_button === button) {
            answer_button.classList.add("incorrect");
          }
        });
        record_answer(exercise, was_correct);
        show_answer_feedback(exercise, was_correct);
      }, { once: true });
    });
  }

  function attach_matching_handlers(exercise) {
    let selected_left_pair_id = null;
    let selected_right_pair_id = null;
    let made_mismatch = false;
    let comparison_locked = false;
    const matched_pair_ids = new Set();

    function clear_unmatched_selections() {
      document.querySelectorAll(".matching_button.selected, .matching_button.incorrect").forEach(function clear_button(button) {
        if (!button.classList.contains("matched")) {
          button.classList.remove("selected", "incorrect");
        }
      });
      selected_left_pair_id = null;
      selected_right_pair_id = null;
      comparison_locked = false;
    }

    function selected_button(side, pair_id) {
      return document.querySelector('[data-matching-side="' + side + '"][data-pair-id="' + pair_id + '"]');
    }

    function compare_selected_pair() {
      if (!selected_left_pair_id || !selected_right_pair_id) {
        return;
      }
      comparison_locked = true;
      const left_button = selected_button("left", selected_left_pair_id);
      const right_button = selected_button("right", selected_right_pair_id);
      if (selected_left_pair_id === selected_right_pair_id) {
        matched_pair_ids.add(selected_left_pair_id);
        [left_button, right_button].forEach(function mark_matched(button) {
          button.classList.remove("selected");
          button.classList.add("matched");
          button.disabled = true;
        });
        selected_left_pair_id = null;
        selected_right_pair_id = null;
        comparison_locked = false;
        if (matched_pair_ids.size === exercise.pairs.length) {
          const was_correct = !made_mismatch;
          record_answer(exercise, was_correct);
          show_answer_feedback(exercise, was_correct);
        }
      } else {
        made_mismatch = true;
        left_button.classList.add("incorrect");
        right_button.classList.add("incorrect");
        global_scope.setTimeout(clear_unmatched_selections, 430);
      }
    }

    document.querySelectorAll("[data-matching-side]").forEach(function attach_matching_choice(button) {
      button.addEventListener("click", function choose_matching_item() {
        if (comparison_locked || button.disabled) {
          return;
        }
        const side = button.getAttribute("data-matching-side");
        const pair_id = button.getAttribute("data-pair-id");
        document.querySelectorAll('[data-matching-side="' + side + '"]').forEach(function clear_same_side(other_button) {
          if (!other_button.classList.contains("matched")) {
            other_button.classList.remove("selected");
          }
        });
        button.classList.add("selected");
        if (side === "left") {
          selected_left_pair_id = pair_id;
        } else {
          selected_right_pair_id = pair_id;
        }
        compare_selected_pair();
      });
    });
  }

  function finish_current_session() {
    most_recent_completed_session = progress_store.summarize_active_session(progress_state);
    progress_state = progress_store.complete_active_session(progress_state, new Date());
    persist_progress_state();
    current_view = "finished";
    render_current_view();
  }

  function render_practice_view() {
    const active_session = progress_state.active_session;
    if (!active_session) {
      current_view = "home";
      render_current_view();
      return;
    }
    if (active_session.current_question_index >= active_session.question_ids.length) {
      finish_current_session();
      return;
    }

    const exercise_id = active_session.question_ids[active_session.current_question_index];
    const exercise = exercise_by_id[exercise_id];
    if (!exercise) {
      progress_state = progress_store.abandon_active_session(progress_state);
      persist_progress_state();
      current_view = "home";
      render_current_view();
      return;
    }
    const question_html = exercise.type === "matching"
      ? render_matching_question(exercise, active_session)
      : render_multiple_choice_question(exercise, active_session);
    const content = '<main class="page_content practice_page">' +
      practice_header_html(active_session) +
      question_html +
    "</main>";
    app_root.innerHTML = page_shell(content, null);
    document.getElementById("close_practice_button").addEventListener("click", function close_practice() {
      current_view = "home";
      render_current_view();
    });
    if (exercise.type === "matching") {
      attach_matching_handlers(exercise);
    } else {
      attach_multiple_choice_handlers(exercise);
    }
  }

  function render_finished_view() {
    const summary = most_recent_completed_session;
    if (!summary) {
      current_view = "home";
      render_current_view();
      return;
    }
    const accuracy_percentage = Math.round(summary.accuracy * 100);
    const pona_glyph = global_scope.TokiPonaLexicon.unicode_character_for_word("pona");
    const content = '<main class="page_content">' +
      '<section class="practice_card session_finish">' +
        '<div class="finish_mark" aria-hidden="true">' + pona_glyph + "</div>" +
        '<h1 class="finish_title">Drill complete</h1>' +
        '<p class="finish_copy">' + summary.correct_count + " of " + summary.answered_count +
          " correct on the first try · " + accuracy_percentage + "% · " +
          format_minutes(summary.accumulated_seconds) + "</p>" +
        '<button class="primary_button" id="finished_home_button">Back to lessons</button>' +
      "</section>" +
    "</main>";
    app_root.innerHTML = page_shell(content, null);
    document.getElementById("finished_home_button").addEventListener("click", function return_home() {
      most_recent_completed_session = null;
      current_view = "home";
      render_current_view();
    });
  }

  function correct_answer_for_mistake_card(exercise) {
    if (exercise.type === "multiple_choice") {
      return render_content(exercise.choices[exercise.correct_choice_index]);
    }
    return pluralized(exercise.pairs.length, "matching pair", "matching pairs");
  }

  function render_mistakes_view() {
    const mistake_entries = Object.keys(progress_state.item_progress_by_id)
      .map(function pair_exercise_with_progress(exercise_id) {
        return {
          exercise: exercise_by_id[exercise_id],
          progress: progress_state.item_progress_by_id[exercise_id]
        };
      })
      .filter(function keep_real_mistakes(entry) {
        return entry.exercise && entry.progress.mistake_count > 0;
      })
      .sort(function weakest_first(left, right) {
        if (left.progress.last_was_correct !== right.progress.last_was_correct) {
          return left.progress.last_was_correct ? 1 : -1;
        }
        if (left.progress.mistake_count !== right.progress.mistake_count) {
          return right.progress.mistake_count - left.progress.mistake_count;
        }
        return new Date(right.progress.last_seen_at) - new Date(left.progress.last_seen_at);
      });

    const mistakes_html = mistake_entries.length === 0
      ? '<div class="empty_card">Wrong answers will collect here and move to the front of later drills.</div>'
      : mistake_entries.map(function render_mistake(entry) {
          const exercise = entry.exercise;
          const item_progress = entry.progress;
          const lesson = lesson_by_exercise_id[exercise.id];
          const review_status = item_progress.last_was_correct
            ? "next review " + formatted_date(item_progress.due_at)
            : "review now";
          return '<article class="mistake_card">' +
            '<div class="mistake_card_header">' +
              '<h3 class="mistake_title">' + render_content(exercise.prompt) + "</h3>" +
              '<span class="mistake_count">' + pluralized(item_progress.mistake_count, "miss", "misses") + "</span>" +
            "</div>" +
            '<p class="mistake_answer"><strong>Answer:</strong> ' + correct_answer_for_mistake_card(exercise) + "</p>" +
            '<p class="mistake_answer">Lesson ' + lesson.number + " · " + sitelen.escape_html(lesson.title) + " · " + review_status + "</p>" +
          "</article>";
        }).join("");

    const practice_button = mistake_entries.length > 0
      ? '<button class="primary_button" id="practice_mistakes_button">Practice saved mistakes</button>'
      : "";
    const content = '<main class="page_content">' +
      '<h1 class="hero_title">Saved mistakes</h1>' +
      '<p class="section_intro">Counts never hide after a later correct answer; the due date shows when each item returns.</p>' +
      practice_button +
      '<h2 class="section_heading">Items</h2>' +
      '<section class="mistake_list">' + mistakes_html + "</section>" +
    "</main>";
    app_root.innerHTML = page_shell(content, "mistakes");
    attach_navigation_handlers();
    const practice_mistakes_button = document.getElementById("practice_mistakes_button");
    if (practice_mistakes_button) {
      practice_mistakes_button.addEventListener("click", start_mistake_session);
    }
  }

  function session_mode_label(history_entry) {
    if (history_entry.mode === "lesson" && history_entry.lesson_id) {
      const selected_lesson = lessons.find(function find_lesson(lesson) {
        return lesson.id === history_entry.lesson_id;
      });
      return selected_lesson ? "Lesson " + selected_lesson.number : "Lesson drill";
    }
    if (history_entry.mode === "mistakes") {
      return "Saved mistakes";
    }
    return "Daily drill";
  }

  function render_history_view() {
    const history_html = progress_state.session_history.length === 0
      ? '<div class="empty_card">Completed drills will appear here. Individual answers already count in the calendar even if a drill is closed early.</div>'
      : progress_state.session_history.map(function render_history_entry(history_entry) {
          const accuracy = history_entry.answered_count === 0
            ? 0
            : Math.round(100 * history_entry.correct_count / history_entry.answered_count);
          return '<article class="history_card">' +
            '<div class="history_card_header">' +
              '<h3 class="history_date">' + formatted_date_and_time(history_entry.completed_at) + "</h3>" +
              '<span class="history_mode">' + session_mode_label(history_entry) + "</span>" +
            "</div>" +
            '<p class="history_details">' + history_entry.correct_count + " / " + history_entry.answered_count +
              " correct · " + accuracy + "% · " + format_minutes(history_entry.seconds) + "</p>" +
          "</article>";
        }).join("");
    const content = '<main class="page_content">' +
      '<h1 class="hero_title">Practice history</h1>' +
      '<p class="section_intro">Frequency, active time, and first-try results—without points or competitive ranks.</p>' +
      statistics_grid_html() +
      '<h2 class="section_heading">Last five weeks</h2>' +
      calendar_html() +
      '<h2 class="section_heading">Completed drills</h2>' +
      '<section class="history_list">' + history_html + "</section>" +
    "</main>";
    app_root.innerHTML = page_shell(content, "history");
    attach_navigation_handlers();
  }

  function render_current_view() {
    const old_feedback = document.getElementById("answer_feedback");
    if (old_feedback) {
      old_feedback.remove();
    }
    if (current_view === "practice") {
      render_practice_view();
    } else if (current_view === "finished") {
      render_finished_view();
    } else if (current_view === "mistakes") {
      render_mistakes_view();
    } else if (current_view === "history") {
      render_history_view();
    } else {
      render_home_view();
    }
    global_scope.scrollTo(0, 0);
  }

  render_current_view();
})(typeof globalThis !== "undefined" ? globalThis : this);
