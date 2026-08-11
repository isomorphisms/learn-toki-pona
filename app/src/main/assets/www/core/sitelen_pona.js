(function publish_sitelen_pona_rendering(global_scope) {
  "use strict";

  const lexicon = global_scope.TokiPonaLexicon ||
    (typeof require === "function" ? require("../data/lexicon.js") : null);

  function escape_html(untrusted_text) {
    return String(untrusted_text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function unicode_sentence_for_toki_pona(latin_sentence) {
    return String(latin_sentence).replace(/[A-Za-z]+/g, function replace_known_word(word) {
      return lexicon.unicode_character_for_word(word) || word;
    });
  }

  function render_word_with_adjacent_glyph(word) {
    const glyph = lexicon.unicode_character_for_word(word);
    if (!glyph) {
      return '<span class="toki_latin">' + escape_html(word) + "</span>";
    }
    return '<span class="toki_word_pair">' +
      '<span class="toki_latin">' + escape_html(word) + "</span>" +
      '<span class="sitelen_pona_glyph" aria-hidden="true">' + glyph + "</span>" +
      "</span>";
  }

  function render_latin_with_every_adjacent_glyph(latin_sentence) {
    const fragments = String(latin_sentence).split(/([A-Za-z]+)/g);
    const rendered_fragments = fragments.map(function render_fragment(fragment) {
      if (/^[A-Za-z]+$/.test(fragment)) {
        return render_word_with_adjacent_glyph(fragment);
      }
      return escape_html(fragment);
    });
    return '<span class="toki_text" lang="tok">' + rendered_fragments.join("") + "</span>";
  }

  function render_content_by_language(content) {
    if (!content || typeof content.text !== "string") {
      return "";
    }
    if (content.kind === "toki") {
      return render_latin_with_every_adjacent_glyph(content.text);
    }
    return escape_html(content.text);
  }

  const public_api = Object.freeze({
    escape_html: escape_html,
    unicode_sentence_for_toki_pona: unicode_sentence_for_toki_pona,
    render_word_with_adjacent_glyph: render_word_with_adjacent_glyph,
    render_latin_with_every_adjacent_glyph: render_latin_with_every_adjacent_glyph,
    render_content_by_language: render_content_by_language
  });

  global_scope.SitelenPonaRendering = public_api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = public_api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
