(function publish_toki_pona_lexicon(global_scope) {
  "use strict";

  // The UCSUR core block is continuous and follows this established word order.
  const core_words_in_ucsur_order = [
    "a", "akesi", "ala", "alasa", "ale", "anpa", "ante", "anu", "awen",
    "e", "en", "esun", "ijo", "ike", "ilo", "insa", "jaki", "jan", "jelo",
    "jo", "kala", "kalama", "kama", "kasi", "ken", "kepeken", "kili",
    "kiwen", "ko", "kon", "kule", "kulupu", "kute", "la", "lape", "laso",
    "lawa", "len", "lete", "li", "lili", "linja", "lipu", "loje", "lon",
    "luka", "lukin", "lupa", "ma", "mama", "mani", "meli", "mi", "mije",
    "moku", "moli", "monsi", "mu", "mun", "musi", "mute", "nanpa", "nasa",
    "nasin", "nena", "ni", "nimi", "noka", "o", "olin", "ona", "open",
    "pakala", "pali", "palisa", "pan", "pana", "pi", "pilin", "pimeja",
    "pini", "pipi", "poka", "poki", "pona", "pu", "sama", "seli", "selo",
    "seme", "sewi", "sijelo", "sike", "sin", "sina", "sinpin", "sitelen",
    "sona", "soweli", "suli", "suno", "supa", "suwi", "tan", "taso",
    "tawa", "telo", "tenpo", "toki", "tomo", "tu", "unpa", "uta", "utala",
    "walo", "wan", "waso", "wawa", "weka", "wile"
  ];

  const code_point_by_word = Object.create(null);
  core_words_in_ucsur_order.forEach(function assign_core_code_point(word, index) {
    code_point_by_word[word] = 0xF1900 + index;
  });
  code_point_by_word.ali = code_point_by_word.ale;

  const common_additional_code_points = {
    namako: 0xF1978,
    kin: 0xF1979,
    oko: 0xF197A,
    kipisi: 0xF197B,
    leko: 0xF197C,
    monsuta: 0xF197D,
    tonsi: 0xF197E,
    jasima: 0xF197F,
    kijetesantakalu: 0xF1980,
    soko: 0xF1981,
    meso: 0xF1982,
    epiku: 0xF1983,
    kokosila: 0xF1984,
    lanpan: 0xF1985,
    n: 0xF1986,
    misikeke: 0xF1987,
    ku: 0xF1988
  };
  Object.keys(common_additional_code_points).forEach(function assign_additional_code_point(word) {
    code_point_by_word[word] = common_additional_code_points[word];
  });

  const concise_english_gloss_by_word = Object.freeze({
    a: "emotion or emphasis", ala: "no, not, nothing", ale: "all, everything, many",
    anpa: "low, below", ante: "different, change", anu: "or", awen: "stay, continue",
    e: "before a direct object", en: "and, between subjects", esun: "trade, buy, sell, market",
    ijo: "thing", ike: "bad, harmful", ilo: "tool, device", insa: "inside",
    jan: "person", jelo: "yellow", jo: "have, hold", kala: "fish", kalama: "sound",
    kama: "come, become", kasi: "plant", ken: "can, possibility", kepeken: "use, by means of",
    kili: "fruit or vegetable", kiwen: "hard thing, stone, metal", kon: "air, spirit, essence",
    kule: "color", kulupu: "group, community", kute: "hear, listen", la: "context separator",
    lape: "sleep, rest", laso: "blue or green", lawa: "head, lead, control", len: "cloth, clothing",
    lete: "cold", li: "before most predicates", lili: "small, little", linja: "line, cord, hair",
    lipu: "flat object, paper, book, document", loje: "red", lon: "present, real, at, in",
    luka: "hand, arm, five", lukin: "see, look, read", lupa: "hole, opening",
    ma: "land, place, country", mama: "parent, ancestor, creator", mani: "money, wealth",
    mi: "I, me, we", moku: "eat, food", moli: "dead, die", monsi: "back, behind",
    musi: "play, fun, art", mute: "many, much", nanpa: "number", nasa: "strange, foolish, intoxicated",
    nasin: "way, method, path, plan", ni: "this, that", nimi: "word, name", noka: "foot, leg, bottom",
    o: "command, wish, direct address", olin: "love, care deeply for", ona: "he, she, it, they",
    open: "begin, open", pakala: "broken, error, damage", pali: "do, make, work",
    palisa: "long hard object", pan: "grain, bread", pana: "give, send, put", pi: "regroup modifiers",
    pilin: "feel, heart", pimeja: "black, dark", pini: "finish, past", pipi: "bug, insect",
    poka: "side, nearby, with", poki: "container", pona: "good, improve, simple",
    sama: "same, similar, as", seli: "hot, fire", selo: "outer layer, skin", seme: "what, which",
    sewi: "high, above, sacred", sijelo: "body", sike: "circle, cycle, round", sin: "new, again",
    sina: "you", sinpin: "front, face, wall", sitelen: "image, writing, draw", sona: "know, knowledge",
    soweli: "land animal", suli: "big, important", suno: "sun, light", supa: "horizontal surface",
    suwi: "sweet, cute", tan: "from, because", taso: "only, but", tawa: "go, moving, toward, for",
    telo: "water, liquid", tenpo: "time", toki: "communicate, language", tomo: "building, room",
    tu: "two, split", uta: "mouth", utala: "fight, struggle", walo: "white, pale", wan: "one, unite",
    waso: "bird, flying animal", wawa: "power, energy, strong", weka: "away, absent, remove",
    wile: "want, need, must"
  });

  function unicode_character_for_word(word) {
    const normalized_word = String(word).toLowerCase();
    const code_point = code_point_by_word[normalized_word];
    return code_point === undefined ? null : String.fromCodePoint(code_point);
  }

  const public_api = Object.freeze({
    core_words_in_ucsur_order: Object.freeze(core_words_in_ucsur_order.slice()),
    code_point_by_word: Object.freeze(code_point_by_word),
    concise_english_gloss_by_word: concise_english_gloss_by_word,
    unicode_character_for_word: unicode_character_for_word
  });

  global_scope.TokiPonaLexicon = public_api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = public_api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
