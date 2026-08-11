(function publish_toki_pona_lessons(global_scope) {
  "use strict";

  function learning_content(kind, text) {
    return Object.freeze({ kind: kind, text: text });
  }

  function multiple_choice_exercise(id, prompt_kind, prompt_text, raw_choices, correct_choice_index, explanation) {
    return Object.freeze({
      id: id,
      type: "multiple_choice",
      prompt: learning_content(prompt_kind, prompt_text),
      choices: Object.freeze(raw_choices.map(function convert_choice(raw_choice) {
        return learning_content(raw_choice[0], raw_choice[1]);
      })),
      correct_choice_index: correct_choice_index,
      explanation: explanation
    });
  }

  function matching_exercise(id, prompt_text, raw_pairs, explanation) {
    return Object.freeze({
      id: id,
      type: "matching",
      prompt: learning_content("english", prompt_text),
      pairs: Object.freeze(raw_pairs.map(function convert_pair(raw_pair, pair_index) {
        return Object.freeze({
          id: id + "-pair-" + pair_index,
          left: learning_content("toki", raw_pair[0]),
          right: learning_content("english", raw_pair[1])
        });
      })),
      explanation: explanation
    });
  }

  function lesson(id, number, title, focus_text, summary, exercises) {
    return Object.freeze({
      id: id,
      number: number,
      title: title,
      focus: learning_content("toki", focus_text),
      summary: summary,
      exercises: Object.freeze(exercises)
    });
  }

  const lessons = Object.freeze([
    lesson(
      "core_sentence_pattern",
      1,
      "Core sentence pattern",
      "mi moku. soweli li lape.",
      "Make complete statements with a subject and predicate; use the predicate marker except after the two special pronouns.",
      [
        multiple_choice_exercise(
          "core-01", "toki", "mi moku.",
          [["english", "I eat."], ["english", "You eat."], ["english", "The food is good."], ["english", "They sleep."]],
          0, "The speaker is the subject, and eating is the predicate."
        ),
        multiple_choice_exercise(
          "core-02", "english", "Choose the complete sentence: You sleep.",
          [["toki", "sina lape."], ["toki", "sina li lape."], ["toki", "mi lape."], ["toki", "ona lape."]],
          0, "The second-person pronoun takes its predicate directly, without the usual marker."
        ),
        multiple_choice_exercise(
          "core-03", "english", "Choose: The animal is big.",
          [["toki", "soweli li suli."], ["toki", "soweli suli."], ["toki", "soweli e suli."], ["toki", "mi li suli."]],
          0, "An ordinary noun subject needs the predicate marker before its description."
        ),
        multiple_choice_exercise(
          "core-04", "toki", "ona li pali.",
          [["english", "They are working."], ["english", "You are working."], ["english", "It is a tool."], ["english", "They want work."]],
          0, "The third-person pronoun can mean he, she, it, or they; context decides."
        ),
        multiple_choice_exercise(
          "core-05", "english", "Choose: I know.",
          [["toki", "mi sona."], ["toki", "mi li sona."], ["toki", "sina sona."], ["toki", "jan sona."]],
          0, "The first-person pronoun takes its predicate directly."
        ),
        multiple_choice_exercise(
          "core-06", "english", "Which is a complete sentence meaning “The person is good” rather than merely a noun phrase?",
          [["toki", "jan li pona."], ["toki", "jan pona."], ["toki", "jan e pona."], ["toki", "mi li pona."]],
          0, "The marker separates the ordinary noun subject from the predicate."
        ),
        matching_exercise(
          "core-07", "Match each subject word to its usual English role.",
          [["mi", "I, me, or we"], ["sina", "you"], ["ona", "he, she, it, or they"], ["jan", "person"]],
          "These four subjects appear throughout the first lessons."
        ),
        matching_exercise(
          "core-08", "Match each common predicate to its broad meaning.",
          [["moku", "eat or food"], ["lape", "sleep or rest"], ["pali", "do, make, or work"], ["pona", "good, simple, or improve"]],
          "A Toki Pona word can fill several related grammatical roles; the sentence supplies the role."
        )
      ]
    ),

    lesson(
      "direct_objects_with_e",
      2,
      "Direct objects",
      "mi moku e kili.",
      "Put the direct-object marker between an action and the thing directly affected by it.",
      [
        multiple_choice_exercise(
          "object-01", "toki", "mi moku e kili.",
          [["english", "I eat fruit."], ["english", "The fruit eats me."], ["english", "My food is fruit."], ["english", "I am a fruit."]],
          0, "The object marker identifies the fruit as what the speaker eats."
        ),
        multiple_choice_exercise(
          "object-02", "english", "Choose: You look at the book.",
          [["toki", "sina lukin e lipu."], ["toki", "sina lukin li lipu."], ["toki", "sina e lukin lipu."], ["toki", "lipu li lukin e sina."]],
          0, "The book is the thing directly seen, so it follows the object marker."
        ),
        multiple_choice_exercise(
          "object-03", "toki", "ona li pana e telo.",
          [["english", "They give or put water."], ["english", "The water gives them."], ["english", "They are in the water."], ["english", "They want water."]],
          0, "The water is what is given, sent, or placed."
        ),
        multiple_choice_exercise(
          "object-04", "english", "Which sentence says “The person builds a house”?",
          [["toki", "jan li pali e tomo."], ["toki", "jan pali li tomo."], ["toki", "jan li pali li tomo."], ["toki", "tomo li pali e jan."]],
          0, "The house is the thing produced or worked on."
        ),
        multiple_choice_exercise(
          "object-05", "toki", "mi kute e kalama.",
          [["english", "I hear a sound."], ["english", "I make a sound."], ["english", "The sound hears me."], ["english", "I am sound."]],
          0, "The sound is the direct object of hearing."
        ),
        multiple_choice_exercise(
          "object-06", "english", "Choose: The child wants food.",
          [["toki", "jan lili li wile e moku."], ["toki", "jan lili e wile moku."], ["toki", "jan li lili e moku."], ["toki", "moku li wile e jan lili."]],
          0, "Wanting can take a direct object: the wanted thing follows the object marker."
        ),
        matching_exercise(
          "object-07", "Match each action to a typical object.",
          [["moku e kili", "eat fruit"], ["lukin e lipu", "look at or read a document"], ["kute e kalama", "hear a sound"], ["pali e tomo", "make or work on a building"]],
          "Each right-hand noun is directly affected by the action."
        ),
        matching_exercise(
          "object-08", "Match the short sentence to its practical meaning.",
          [["mi pana e telo", "I give or put water"], ["sina jo e ilo", "you have a tool"], ["ona li open e poki", "they open a container"], ["jan li sona e nasin", "the person knows the way"]],
          "The same object structure works with physical actions, possession, and knowledge."
        )
      ]
    ),

    lesson(
      "noun_phrases",
      3,
      "Noun phrases",
      "jan pona. tomo mi. telo lete.",
      "Put the head noun first, then let later words narrow or describe it.",
      [
        multiple_choice_exercise(
          "noun-01", "toki", "jan pona",
          [["english", "a good person or friend"], ["english", "a person's goodness"], ["english", "a simple house"], ["english", "to improve a person"]],
          0, "The first word names the kind of thing; the second describes it."
        ),
        multiple_choice_exercise(
          "noun-02", "english", "Choose the noun phrase: my house.",
          [["toki", "tomo mi"], ["toki", "mi tomo"], ["toki", "tomo li mi"], ["toki", "mi li tomo"]],
          0, "The building comes first, and the speaker narrows which building it is."
        ),
        multiple_choice_exercise(
          "noun-03", "toki", "telo lete",
          [["english", "cold water or liquid"], ["english", "watery cold"], ["english", "hot water"], ["english", "to cool water"]],
          0, "The phrase names a liquid and then describes it as cold."
        ),
        multiple_choice_exercise(
          "noun-04", "english", "Which phrase can mean “an important book or large document”?",
          [["toki", "lipu suli"], ["toki", "suli lipu"], ["toki", "lipu li suli"], ["toki", "lipu e suli"]],
          0, "The document is the head; size or importance modifies it."
        ),
        multiple_choice_exercise(
          "noun-05", "toki", "ilo suno",
          [["english", "a light-producing tool or lamp"], ["english", "the sun's machine"], ["english", "a broken tool"], ["english", "to illuminate a tool"]],
          0, "The head is a tool; the following word says what kind of tool."
        ),
        multiple_choice_exercise(
          "noun-06", "english", "Choose: a small red fruit.",
          [["toki", "kili lili loje"], ["toki", "loje lili kili"], ["toki", "kili li lili e loje"], ["toki", "lili kili loje"]],
          0, "The fruit comes first, followed by both descriptions."
        ),
        matching_exercise(
          "noun-07", "Match each noun phrase to its likely meaning.",
          [["soweli lili", "small animal"], ["tomo pali", "work building or workplace"], ["tomo tawa", "moving building or vehicle"], ["ilo toki", "communication device"]],
          "Start with the broad head noun, then read each modifier as narrowing it."
        ),
        matching_exercise(
          "noun-08", "Match each phrase while keeping the head-first order in view.",
          [["mani mi", "my money"], ["moku pona", "good or healthy food"], ["jan pali", "worker"], ["nasin sin", "new method or route"]],
          "The final word does not replace the head; it tells you which kind of head is meant."
        )
      ]
    ),

    lesson(
      "negation_with_ala",
      4,
      "Negation",
      "mi sona ala. ilo li pali ala.",
      "Negate the relevant word or predicate by placing the negator immediately after it.",
      [
        multiple_choice_exercise(
          "negation-01", "toki", "mi sona ala.",
          [["english", "I do not know."], ["english", "I know nothing exists."], ["english", "Nobody knows me."], ["english", "I know."]],
          0, "The negator follows knowing and denies it."
        ),
        multiple_choice_exercise(
          "negation-02", "english", "Choose: They are not working.",
          [["toki", "ona li pali ala."], ["toki", "ona ala li pali."], ["toki", "ona li ala pali."], ["toki", "ona pali li ala."]],
          0, "The negator goes directly after the denied predicate."
        ),
        multiple_choice_exercise(
          "negation-03", "toki", "mi ken ala lape.",
          [["english", "I cannot rest."], ["english", "I can avoid sleep."], ["english", "I do not want rest."], ["english", "Nobody lets me rest."]],
          0, "The denied idea is ability, so the negator follows the ability word."
        ),
        multiple_choice_exercise(
          "negation-04", "english", "Choose: I do not want this.",
          [["toki", "mi wile ala e ni."], ["toki", "mi ala wile e ni."], ["toki", "mi wile e ala ni."], ["toki", "ni li wile ala e mi."]],
          0, "The negator denies wanting; the object structure remains intact."
        ),
        multiple_choice_exercise(
          "negation-05", "toki", "jan li pona ala.",
          [["english", "The person is not good."], ["english", "There is no person."], ["english", "The good person leaves."], ["english", "The person fixes nothing."]],
          0, "The description of the person is what gets negated."
        ),
        multiple_choice_exercise(
          "negation-06", "english", "Which sentence says the tool is not broken?",
          [["toki", "ilo li pakala ala."], ["toki", "ilo ala li pakala."], ["toki", "ilo li ala pakala."], ["toki", "pakala li ilo ala."]],
          0, "Place the negator after the broken predicate."
        ),
        matching_exercise(
          "negation-07", "Match each negative sentence to what it denies.",
          [["mi moku ala", "I do not eat"], ["sina lape ala", "you do not sleep"], ["ona li kama ala", "they do not come"], ["jan li toki ala", "the person does not speak"]],
          "The negator follows the action in each sentence."
        ),
        matching_exercise(
          "negation-08", "Match the scope of each negation.",
          [["mi ken ala pali", "I cannot work"], ["mi wile ala pali", "I do not want to work"], ["mi sona ala e nasin", "I do not know the method"], ["mi jo ala e mani", "I do not have money"]],
          "Its position tells you whether ability, desire, knowledge, or possession is denied."
        )
      ]
    ),

    lesson(
      "questions_with_seme",
      5,
      "Questions",
      "sina moku ala moku? ni li seme?",
      "Ask yes-or-no questions by repeating the uncertain predicate around negation; replace unknown information with the question word.",
      [
        multiple_choice_exercise(
          "question-01", "toki", "sina moku ala moku?",
          [["english", "Are you eating?"], ["english", "What are you eating?"], ["english", "You are not eating."], ["english", "Why are you eating?"]],
          0, "The repeated positive-or-negative predicate asks for a yes-or-no answer."
        ),
        multiple_choice_exercise(
          "question-02", "english", "Choose the yes-or-no question: Do they want to sleep?",
          [["toki", "ona li wile ala wile lape?"], ["toki", "ona li wile ala lape."], ["toki", "ona seme li lape?"], ["toki", "seme li wile e ona?"]],
          0, "Repeat the uncertain desire predicate around negation."
        ),
        multiple_choice_exercise(
          "question-03", "toki", "ni li seme?",
          [["english", "What is this?"], ["english", "Is this good?"], ["english", "Where is this?"], ["english", "This is nothing."]],
          0, "The unknown predicate is replaced by the question word."
        ),
        multiple_choice_exercise(
          "question-04", "english", "Choose: What are you looking at?",
          [["toki", "sina lukin e seme?"], ["toki", "seme li lukin e sina?"], ["toki", "sina lukin ala lukin?"], ["toki", "sina seme e lukin?"]],
          0, "The unknown direct object occupies the ordinary object position."
        ),
        multiple_choice_exercise(
          "question-05", "toki", "jan seme li kama?",
          [["english", "Which person is coming?"], ["english", "Why is the person coming?"], ["english", "Is anyone coming?"], ["english", "What does the person bring?"]],
          0, "The question word modifies person, asking which person."
        ),
        multiple_choice_exercise(
          "question-06", "english", "Choose: Where are you going?",
          [["toki", "sina tawa ma seme?"], ["toki", "ma li tawa e sina seme?"], ["toki", "sina tawa ala tawa?"], ["toki", "seme li ma tawa?"]],
          0, "An unknown place is expressed as which place in the normal destination position."
        ),
        matching_exercise(
          "question-07", "Match each question to the information it requests.",
          [["seme li lon poki?", "what is in the container"], ["sina wile e seme?", "what you want"], ["jan seme li toki?", "which person is speaking"], ["sina pali e seme?", "what you are making or doing"]],
          "The question word stays where the missing answer would normally appear."
        ),
        matching_exercise(
          "question-08", "Match each yes-or-no question to its plain-English reading.",
          [["sina pona ala pona?", "Are you okay or good?"], ["ilo li pali ala pali?", "Does the device work?"], ["ona li kama ala kama?", "Are they coming?"], ["telo li lete ala lete?", "Is the water cold?"]],
          "The repeated predicate presents its positive and negative possibilities."
        )
      ]
    ),

    lesson(
      "adult_life_translation",
      6,
      "Adult-life translation",
      "mi pali lon tomo pali. ilo mi li pakala.",
      "Use the existing small vocabulary to say practical things about work, money, rest, tools, travel, and family.",
      [
        multiple_choice_exercise(
          "adult-01", "toki", "mi pali lon tomo pali.",
          [["english", "I work at a workplace."], ["english", "I build my house."], ["english", "My workplace is broken."], ["english", "I travel for work."]],
          0, "The context places the speaker's work inside a work building."
        ),
        multiple_choice_exercise(
          "adult-02", "english", "Choose: My tool is broken.",
          [["toki", "ilo mi li pakala."], ["toki", "mi pakala e ilo."], ["toki", "ilo li pakala e mi."], ["toki", "ilo pakala li mi."]],
          0, "The possessive modifier identifies the tool, and the predicate describes its condition."
        ),
        multiple_choice_exercise(
          "adult-03", "toki", "tenpo ni la mi wile lape.",
          [["english", "Right now I want to rest."], ["english", "I rested before this."], ["english", "I never have time to rest."], ["english", "This rest will take time."]],
          0, "The opening context sets the time as now."
        ),
        multiple_choice_exercise(
          "adult-04", "english", "Choose: I do not have much money.",
          [["toki", "mi jo ala e mani mute."], ["toki", "mani mute li jo ala e mi."], ["toki", "mi mani ala e jo mute."], ["toki", "mi wile ala e mani."]],
          0, "Possession is negated, while much modifies money."
        ),
        multiple_choice_exercise(
          "adult-05", "toki", "mi tawa tomo kepeken tomo tawa.",
          [["english", "I go home using a vehicle."], ["english", "My vehicle becomes a house."], ["english", "I build a vehicle at home."], ["english", "The house moves toward me."]],
          0, "The means phrase says that a moving structure—a vehicle—is used for the trip."
        ),
        multiple_choice_exercise(
          "adult-06", "english", "Choose: I want to repair or improve the device.",
          [["toki", "mi wile pona e ilo."], ["toki", "ilo li wile pona e mi."], ["toki", "mi wile e ilo pona."], ["toki", "mi pona li wile e ilo."]],
          0, "Improving is the action applied to the device; wanting modifies that action."
        ),
        matching_exercise(
          "adult-07", "Match each practical sentence to its likely use.",
          [["mi wile moku", "I need or want food"], ["mi ken ala pali", "I cannot work"], ["o pana e ilo tawa mi", "Please give or send me the tool"], ["mi sona ala e nasin", "I do not know the method or route"]],
          "Small general words can carry the practical point without specialized vocabulary."
        ),
        multiple_choice_exercise(
          "adult-08", "english", "Choose: I want to talk to my parent.",
          [["toki", "mi wile toki tawa mama mi."], ["toki", "mama mi li wile e toki mi."], ["toki", "mi wile e mama toki."], ["toki", "mi toki e mama mi."]],
          0, "The direction word marks the person toward whom the speaking is directed."
        )
      ]
    ),

    lesson(
      "simplifying_ideas",
      7,
      "Rewrite the idea simply",
      "pali mute li lon. mi ken ala pali e ale.",
      "Preserve the useful point of a complicated English thought instead of hunting for a one-word substitution.",
      [
        multiple_choice_exercise(
          "simple-01", "english", "Your phone battery died. Which paraphrase keeps the useful point?",
          [["toki", "ilo toki mi li jo ala e wawa."], ["toki", "ilo toki mi li moli e suno."], ["toki", "mi wile ala toki."], ["toki", "wawa li toki e ilo mi."]],
          0, "Describe the communication device as lacking power rather than inventing a special battery word."
        ),
        multiple_choice_exercise(
          "simple-02", "english", "The machine malfunctions intermittently. Choose the clearest decomposition.",
          [["toki", "tenpo ante la ilo li pali. tenpo ante la ona li pali ala."], ["toki", "ilo li pakala tenpo."], ["toki", "tenpo li pali e ilo ante."], ["toki", "ilo ala li pali e tenpo."]],
          0, "State the two observable conditions at different times."
        ),
        multiple_choice_exercise(
          "simple-03", "english", "I am overwhelmed by too many tasks. Which version states the practical problem?",
          [["toki", "pali mute li lon. mi ken ala pali e ale."], ["toki", "mi li pali mute ale."], ["toki", "ale li ken ala e mi."], ["toki", "pali li pilin e mi mute."]],
          0, "Break the idea into much work existing and the speaker being unable to do all of it."
        ),
        multiple_choice_exercise(
          "simple-04", "english", "We should reschedule. Choose the compact practical request.",
          [["toki", "o ante e tenpo."], ["toki", "tenpo li ante e mi."], ["toki", "o weka e tenpo ale."], ["toki", "mi ante ala ante?"]],
          0, "A command to change the time carries the action that matters."
        ),
        multiple_choice_exercise(
          "simple-05", "english", "I need a break before continuing. Choose the two-step paraphrase.",
          [["toki", "mi wile lape. ni la mi ken awen pali."], ["toki", "mi awen lape li pini pali."], ["toki", "pali li lape e mi."], ["toki", "mi ken ala lape tan pali."]],
          0, "First state the need for rest; then state that continuing work becomes possible."
        ),
        multiple_choice_exercise(
          "simple-06", "english", "Please explain it more simply. Choose a concrete request.",
          [["toki", "o toki e ni kepeken nimi lili."], ["toki", "o lili e ni kepeken toki."], ["toki", "nimi li pona e toki mi."], ["toki", "o toki ala e nimi."]],
          0, "Asking for few or small words makes the desired simplification concrete."
        ),
        multiple_choice_exercise(
          "simple-07", "english", "The plan depends on money we do not have. Which paraphrase exposes the dependency?",
          [["toki", "mi jo ala e mani. tan ni la mi ken ala kepeken nasin ni."], ["toki", "nasin ni li mani ala."], ["toki", "mani li jo e nasin mi."], ["toki", "mi wile ala e nasin tan mani."]],
          0, "State the missing resource, then make the resulting inability explicit."
        ),
        matching_exercise(
          "simple-08", "Match each simple message to the more elaborate English idea it can carry.",
          [["mi sona ala. o toki sin.", "I did not understand; please explain again"], ["ilo li pali ala.", "the equipment is not functioning"], ["mi wile ante e nasin.", "I want to change the approach"], ["tenpo li lili.", "we are short on time"]],
          "The goal is a useful paraphrase, not a word-for-word cipher."
        )
      ]
    )
  ]);

  const public_api = Object.freeze({
    lessons: lessons,
    learning_content: learning_content,
    multiple_choice_exercise: multiple_choice_exercise,
    matching_exercise: matching_exercise
  });

  global_scope.TokiPonaLessons = public_api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = public_api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
