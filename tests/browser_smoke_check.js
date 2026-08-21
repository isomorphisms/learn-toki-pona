"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

async function run_browser_smoke_check() {
  const chromium_package_path = process.env.TOKI_PONA_CHROMIUM_PACKAGE_PATH;
  let launch_options = {
    args: ["--allow-file-access-from-files"],
    headless: true
  };
  if (chromium_package_path) {
    const packaged_chromium_module = await import(pathToFileURL(
      path.join(chromium_package_path, "build/index.js")
    ).href);
    const packaged_chromium = packaged_chromium_module.default;
    packaged_chromium.setGraphicsMode = false;
    launch_options = {
      executablePath: await packaged_chromium_module.inflate(
        path.join(chromium_package_path, "bin/chromium.br")
      ),
      args: packaged_chromium.args.concat(["--allow-file-access-from-files"]),
      headless: true
    };
  }
  const browser = await chromium.launch(launch_options);
  const context = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await context.newPage();
  const console_errors = [];
  const external_requests = [];
  page.on("console", function retain_console_errors(message) {
    if (message.type() === "error") {
      console_errors.push(message.text());
    }
  });
  page.on("request", function retain_external_requests(request) {
    if (!request.url().startsWith("file:") && !request.url().startsWith("data:")) {
      external_requests.push(request.url());
    }
  });

  const application_url = pathToFileURL(path.resolve(
    __dirname,
    "../app/src/main/assets/www/index.html"
  )).href;
  await page.goto(application_url);
  await page.locator(".hero_card").waitFor();
  assert.equal(await page.locator(".lesson_card").count(), 7);
  assert.ok(await page.locator(".sitelen_pona_glyph").count() > 20);
  await page.screenshot({ path: "/tmp/toki-pona-drills-home.png", fullPage: true });

  await page.locator("#start_daily_button").click();
  await page.locator(".practice_card").waitFor();
  assert.equal(await page.locator(".choice_button").count(), 4);
  await page.screenshot({ path: "/tmp/toki-pona-drills-practice.png", fullPage: true });

  const first_correct_index = await page.evaluate(function correct_index_for_current_question() {
    const state = JSON.parse(localStorage.getItem("toki_pona_drills_progress_v1"));
    const exercise_id = state.active_session.question_ids[state.active_session.current_question_index];
    for (const lesson of globalThis.TokiPonaLessons.lessons) {
      const exercise = lesson.exercises.find(function matches(candidate) {
        return candidate.id === exercise_id;
      });
      if (exercise) {
        return exercise.correct_choice_index;
      }
    }
    return -1;
  });
  const deliberate_wrong_index = [0, 1, 2, 3].find(function not_correct(index) {
    return index !== first_correct_index;
  });
  await page.locator('[data-choice-index="' + deliberate_wrong_index + '"]').click();
  await page.getByText("Saved for review", { exact: true }).waitFor();
  await page.locator("#next_question_button").click();
  await page.locator("#close_practice_button").click();

  page.once("dialog", function accept_replacement(dialog) {
    dialog.accept();
  });
  await page.locator('[data-start-lesson="core_sentence_pattern"]').click();

  for (let answered = 0; answered < 6; answered += 1) {
    const correct_index = await page.evaluate(function current_correct_index() {
      const state = JSON.parse(localStorage.getItem("toki_pona_drills_progress_v1"));
      const exercise_id = state.active_session.question_ids[state.active_session.current_question_index];
      for (const lesson of globalThis.TokiPonaLessons.lessons) {
        const exercise = lesson.exercises.find(function matches(candidate) {
          return candidate.id === exercise_id;
        });
        if (exercise) {
          return exercise.correct_choice_index;
        }
      }
      return -1;
    });
    assert.ok(correct_index >= 0);
    await page.locator('[data-choice-index="' + correct_index + '"]').click();
    await page.getByText("Correct", { exact: true }).waitFor();
    await page.locator("#next_question_button").click();
  }

  await page.getByText("Match the pairs", { exact: true }).waitFor();
  const pair_ids = await page.locator('[data-matching-side="left"]').evaluateAll(function pair_identifiers(buttons) {
    return buttons.map(function identifier(button) {
      return button.getAttribute("data-pair-id");
    });
  });
  assert.equal(pair_ids.length, 4);
  for (const pair_id of pair_ids) {
    await page.locator('[data-matching-side="left"][data-pair-id="' + pair_id + '"]').click();
    await page.locator('[data-matching-side="right"][data-pair-id="' + pair_id + '"]').click();
  }
  await page.getByText("Correct", { exact: true }).waitFor();
  await page.screenshot({ path: "/tmp/toki-pona-drills-matching.png", fullPage: true });
  await page.locator("#next_question_button").click();
  await page.locator("#close_practice_button").click();

  await page.getByRole("button", { name: "Mistakes" }).click();
  assert.equal(await page.locator(".mistake_card").count(), 1);
  await page.reload();
  await page.getByRole("button", { name: "Mistakes" }).click();
  assert.equal(await page.locator(".mistake_card").count(), 1);
  const saved_mistake_count = await page.evaluate(function retained_mistake_count() {
    const state = JSON.parse(localStorage.getItem("toki_pona_drills_progress_v1"));
    return state.item_progress_by_id["core-01"].mistake_count;
  });
  assert.equal(saved_mistake_count, 1);

  assert.deepEqual(external_requests, []);
  assert.deepEqual(console_errors, []);
  await browser.close();
  console.log(JSON.stringify({
    lessons_rendered: 7,
    saved_mistakes_after_reload: saved_mistake_count,
    external_requests: external_requests.length,
    console_errors: console_errors.length
  }));
}

run_browser_smoke_check().catch(function report_failure(error) {
  console.error(error);
  process.exitCode = 1;
});
