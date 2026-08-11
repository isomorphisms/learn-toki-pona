"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const lexicon = require("../app/src/main/assets/www/data/lexicon.js");
const rendering = require("../app/src/main/assets/www/core/sitelen_pona.js");

test("all 120 core words have unique continuous UCSUR code points", function () {
  assert.equal(lexicon.core_words_in_ucsur_order.length, 120);
  const code_points = lexicon.core_words_in_ucsur_order.map(function code_point(word) {
    return lexicon.code_point_by_word[word];
  });
  assert.equal(new Set(code_points).size, 120);
  assert.equal(code_points[0], 0xF1900);
  assert.equal(code_points[119], 0xF1977);
  assert.equal(lexicon.code_point_by_word.ali, lexicon.code_point_by_word.ale);
});

test("a Latin sentence converts to real UCSUR characters", function () {
  const converted = rendering.unicode_sentence_for_toki_pona("mi moku e kili.");
  assert.equal(converted, "󱤴 󱤶 󱤉 󱤚.");
});

test("paired rendering keeps Latin text beside each glyph and escapes markup", function () {
  const html = rendering.render_latin_with_every_adjacent_glyph("mi moku < ala");
  assert.match(html, /toki_latin">mi</);
  assert.match(html, /sitelen_pona_glyph/);
  assert.match(html, /&lt;/);
  assert.doesNotMatch(html, /< ala/);
});
