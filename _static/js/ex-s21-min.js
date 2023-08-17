var s21 = (function() {

  // store jsPsych experiment blocks
  var EXPERIMENT = {
    demo: [],
    block1: {},
    block2: {},
    block3: {},
    block4a: {}, block5a: {},
    block5: {},
  };

  // ==========================================================================
  // Define internal helper variables; the capitalized ones get updated
  // ==========================================================================

  // prenominal or postnominal affixes
  var CONDITION;

  // verb-initial or verb-final sentences
  var VERB_FIRST = true;

  // store trial data associated with each block
  var DATA = {
    demo: [],
    block1: [],
    block2: [],
    block3: [],
    block4a: [], block4b: [],
    block5: [],
  };

  // store transitive & intransitive events
  var EVENTS = [];

  // subject numbers
  var SUBJ_NUMS = [];

  // set global linger duration
  var linger = 900;

  // lexical information
  var affix_icons = ["n", "c"];
  var nouns = ["monkey", "rabbit", "cat"];
  var noun_icons = ["S", "U", "N"]; // saru, usagi, neko
  var verbs = ["chase", "punch", "sleep"];
  var verb_icons = ["A", "H", "E"];
  var np_lexicon = [...affix_icons, ...noun_icons];
  var lookup = {
    // icon2word
    S: "monkey", U: "rabbit", N: "cat",
    A: "chase", H: "punch", E: "sleep",
    // word2icon
    monkey: "S", rabbit: "U", cat: "N",
    chase: "A", punch: "H", sleep: "E",
    sg: "", sg3: "", sg9: "", pl: "n", "pl3": "n", "pl9": "n",
  };

  // ==========================================================================
  // Define internal helper functions to generate and handle events
  // ==========================================================================

  // function to generate events (ignoring number)
  function generate_events() {
    var nicons = jsPsych.randomization.shuffle(noun_icons);
    var vicons = jsPsych.randomization.shuffle(verb_icons.slice(0, 2)); // excl. iv
    var iv = verbs[2];
    var vicon_ = verb_icons[2];
    var tv_events = [];
    var iv_events = [];

    // generate *unique* transitive events (12 total)
    for (let i = 0; i < vicons.length; i++) {
      for (let j = 0; j < nicons.length; j++) {
        for (let k = 0; k < nicons.length; k++) {
          // never depict the same character as both the subject and object
          if (j == k) {
            continue;
          }
          // add the subject-object pair
          tv_events.push([
            lookup[vicons[i]], vicons[i], // verb, vicon
            lookup[nicons[j]], nicons[j], // n1, nicon1
            lookup[nicons[k]], nicons[k], // n2, nicon2
          ]);
        }
      }
    }

    // "shuffle" *unique* transitive events
    tv_events = [0, 9, 4, 6, 3, 10, 1, 11, 2, 7, 5, 8].map(i => tv_events[i]);

    // generate transitive events (24 total; 12 unique); each tv verb appears
    // 12 times and each subject-object pair 4 times
    tv_events = new Array(2).fill(tv_events).flat();

    // generate intransitive events (12 total; 3 unique)
    iv_events = new Array(4).fill(
      nicons.map(i => [iv, vicon_, lookup[i], i, "", ""])
    ).flat();

    // update global EVENTS array
    EVENTS = [
      // block 2 - verb learning
      ...iv_events.slice(0, 1),   // intransitive (x1)
      ...tv_events.slice(0, 2),   // transitive (x2)
      // block 3 - number learning
      ...iv_events.slice(1, 10),  // intransitive (x9)
      // block 3 - case learning
      ...tv_events.slice(2, 8),   // transitive (x6)
      // block 4 - production practice
      ...iv_events.slice(10, 12), // intransitive (x2)
      ...tv_events.slice(8, 12),  // transitive (x4)
      // block 5 - critical productions
      ...tv_events.slice(12,24),  // transitive (x12)
    ];

    // reverse global EVENTS array for popping
    EVENTS.reverse();
  }

  // function to generate subject numbers
  function generate_subj_nums() {

    // Singular SUBJECTS during training (blocks 2, 3, & 4):
    //   - sg x 12 (=1 + 9 + 2)*
    //   - pl x 12 (=2 + 6 + 4)

    // Block 0(x2) adds 8 bare (singular) nouns.
    // Block 1 adds 3 bare (singular) nouns.
    // Aside from subjects, there are also 24 (=3 + 15 + 6) singular OBJECTS
    // during training.
    // Altogether, participants are exposed to 47 (=12 + 8 + 3 + 24) singular
    // nouns during training.

    SUBJ_NUMS = [
      // block 2
      "pl3", // intransitive
      "sg", "pl", // transitive
      // block 3
      "sg", "sg3", "sg9", "pl", "pl", "pl3", "pl3", "pl9", "pl9", // instransitive
      // block 4
      "sg", "pl9", // intransitive
      ...jsPsych.randomization.shuffle(["sg", "pl", "pl3", "pl3"]), // transitive
      // block 5
      ...jsPsych.randomization.repeat(["sg", "pl"], [6, 6]), // transitive
    ];

    SUBJ_NUMS.reverse();
  }

  // ==========================================================================
  // Define internal helper functions to format simuli
  // ==========================================================================

  // function to linearize NPs according to the condition
  var linearize;

  // function to reverse postnominal NP orders
  function prenominal(...arr) {
    return arr.reverse().join("");
  }

  // function to preserve postnominal NP orders
  function postnominal(...arr) {
    return arr.join("");
  }

  // critical & non-critical keyboards
  var KEYBOARDS = [];

  // function to generate keyboards
  function generate_keyboards() {
    var nc_nouns;
    var nouns_nc;
    var cn_nouns;
    var nouns_cn;

    // scope-isomorphism of keyboard
    if (CONDITION == "prenominal") {
      nc_nouns = "non_iso_N";
      nouns_nc = "N_non_iso";
      cn_nouns = "N_iso";
      nouns_cn = "iso_N";
    } else { // postnominal
      nc_nouns = "iso_N";
      nouns_nc = "N_iso";
      cn_nouns = "non_iso_N";
      nouns_cn = "N_non_iso";
    }

    // affixes in reversed order (i.e., "c", "n")
    var reversed_affixes = [...affix_icons].reverse();

    // critical keyboards
    var keyboards = [
      [[...affix_icons, ...jsPsych.randomization.shuffle(noun_icons)], nc_nouns],
      [[...jsPsych.randomization.shuffle(noun_icons), ...affix_icons], nouns_nc],
      [[...reversed_affixes, ...jsPsych.randomization.shuffle(noun_icons)], cn_nouns],
      [[...jsPsych.randomization.shuffle(noun_icons), ...reversed_affixes], nouns_cn],
      [[...affix_icons, ...jsPsych.randomization.shuffle(noun_icons)], nc_nouns],
      [[...jsPsych.randomization.shuffle(noun_icons), ...affix_icons], nouns_nc],
      [[...reversed_affixes, ...jsPsych.randomization.shuffle(noun_icons)], cn_nouns],
      [[...jsPsych.randomization.shuffle(noun_icons), ...reversed_affixes], nouns_cn],
      [[...affix_icons, ...jsPsych.randomization.shuffle(noun_icons)], nc_nouns],
      [[...jsPsych.randomization.shuffle(noun_icons), ...affix_icons], nouns_nc],
      [[...reversed_affixes, ...jsPsych.randomization.shuffle(noun_icons)], cn_nouns],
      [[...jsPsych.randomization.shuffle(noun_icons), ...reversed_affixes], nouns_cn],
    ];

    // determine the order of the first keyboard (whether it is
    // scope-isomorphic depends on the condition)
    if (jsPsych.randomization.shuffle([true, false])[0]) {
      // critical keyboards
      KEYBOARDS.push(...keyboards);
      FIRST_ORDER = nouns_cn;

      // non-critical keyboards
      KEYBOARDS.push(...[
        [[...affix_icons, ...jsPsych.randomization.shuffle(noun_icons)], nc_nouns],
        [[...jsPsych.randomization.shuffle(noun_icons), ...affix_icons], nouns_nc],
        [[...reversed_affixes, ...jsPsych.randomization.shuffle(noun_icons)], cn_nouns],
        [[...jsPsych.randomization.shuffle(noun_icons), ...reversed_affixes], nouns_cn],
        [[...affix_icons, ...jsPsych.randomization.shuffle(noun_icons)], nc_nouns],
        [[...jsPsych.randomization.shuffle(noun_icons), ...affix_icons], nouns_nc],
      ]);
    } else {
      // critical keyboards
      KEYBOARDS.push(...keyboards.reverse());
      FIRST_ORDER = nc_nouns;

      // non-critical keyboards
      KEYBOARDS.push(...[
        [[...reversed_affixes, ...jsPsych.randomization.shuffle(noun_icons)], cn_nouns],
        [[...jsPsych.randomization.shuffle(noun_icons), ...reversed_affixes], nouns_cn],
        [[...affix_icons, ...jsPsych.randomization.shuffle(noun_icons)], nc_nouns],
        [[...jsPsych.randomization.shuffle(noun_icons), ...affix_icons], nouns_nc],
        [[...reversed_affixes, ...jsPsych.randomization.shuffle(noun_icons)], cn_nouns],
        [[...jsPsych.randomization.shuffle(noun_icons), ...reversed_affixes], nouns_cn],
      ]);
    }
  }

  // function to map icons to a sentence
  var icons2sent;

  // function to map icons to a verb-initial sentence
  function verb_initial_sent(vicon, nicon1, nicon2, a1, a2, madlib = false) {
    var np1 = linearize(nicon1, a1);
    var np2 = linearize(nicon2, a2);
    var sep = (madlib) ? " " : "";

    // transitive
    if (nicon2) {
      return `${vicon}${sep}${np1}${sep}${np2}`; // verb-initial
    }

    // intransitive
    return `${vicon}${sep}${np1}`; // verb-initial
  }

  // function to map icons to a verb-final sentence
  function verb_final_sent(vicon, nicon1, nicon2, a1, a2, madlib = false) {
    var np1 = linearize(nicon1, a1);
    var np2 = linearize(nicon2, a2);
    var sep = (madlib) ? " " : "";

    // transitive
    if (nicon2) {
      return `${np1}${sep}${np2}${sep}${vicon}`; // verb-final
    }

    // intransitive
    return `${np1}${sep}${vicon}`; // verb-final
  }

  // function to generate span stimulus
  function stim_span(str) {
    return `<span class="iconic">${str}</span>`;
  }

  // function to generate image stimulus
  function stim_img(str) {
    return `<img src="../_static/stimuli/s21/${str}.png" />`;
  } 

  // function to map words to filename
  function words2fn(verb, n1, n2, subj_num, obj_num = 'sg') {
    if (n2) {
      return `${verb}_${n1}_${subj_num}_${n2}_${obj_num}`; // transitive
    }
    return `${verb}_${n1}_${subj_num}`; // intransitive
  }

  // ==========================================================================
  // Define functions to generate each experiment block
  // ==========================================================================

  // 4 trials
  function demo() {

    // DEMO -------------------------------------------------------------------
    // Demo & practice:
    // Exposure to task types via 4 trials: 1 icon-selection trial, 1 picture-
    // selection trial, 1 madlib trial, & 1 produciton trial.
    // ------------------------------------------------------------------------

    // icon selection (monkey)
    DATA.demo.push({
      type: jsPsychSelection,
      stimulus: stim_img("monkey"),
      choices: noun_icons,
      answer: "S",
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
      noun: "monkey",
      subtype: "icon selection",
      css_classes: ["icon-selection", "demo"]
    });

    // picture selection (rabbit)
    DATA.demo.push({
      type: jsPsychSelection,
      stimulus: stim_span("U"),
      choices: nouns.map(c => stim_img(c)),
      data_choices: nouns.map(c => lookup[c]),
      answer: "U",
      button_html: null,
      noun: "rabbit",
      subtype: "picture selection",
      css_classes: ["picture-selection", "demo"]
    });

    // madlib (cat)
    DATA.demo.push({
      type: jsPsychMadlib,
      img_stimulus: stim_img("cat"),
      choices: noun_icons,
      data_choices: noun_icons,
      answer: "N",
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
      noun: "cat",
      css_classes: ["demo", ],
    });

    // production (rabbit)
    DATA.demo.push({
      type: jsPsychProduction,
      stimulus: stim_img("rabbit"),
      keys: jsPsych.randomization.shuffle(noun_icons),
      answer: "U",
      noun: "rabbit",
      css_classes: ["demo", "jspsych-production"],
    });

    // create demo trials
    var demo_trials = {
      type: jsPsych.timelineVariable("type"),
      stimulus: jsPsych.timelineVariable("stimulus"),
      img_stimulus: jsPsych.timelineVariable("img_stimulus"),
      caption_stimulus: jsPsych.timelineVariable("caption_stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      data_choices: jsPsych.timelineVariable("data_choices"),
      keys: jsPsych.timelineVariable("keys"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: jsPsych.timelineVariable("button_html"),
      show_feedback: true,
      force_correct_button_press: true,
      force_correct_production: true,
      prompt_before: false,
      include_spacebar: false,
      include_counter: false,
      fill_in_the_blanks: true,
      linger_duration: linger,
      css_classes: jsPsych.timelineVariable("css_classes"),
      data: {
        block: 0,
        n_mod: 0,
        group: null,
        noun: jsPsych.timelineVariable("noun"),
        subtype: jsPsych.timelineVariable("subtype"),
      },
    };

    // create demo block
    EXPERIMENT.demo = {
      timeline: [demo_trials, ],
      timeline_variables: DATA.demo,
      randomize_order: false,
    };
  }

  // 3 trials
  function block1() {

    // BLOCK 1 ----------------------------------------------------------------
    // Noun learning:
    // Exposure to nouns through 3 icon-selection trials. Each noun appears
    // once, always singular.
    // ------------------------------------------------------------------------

    var noun;

    // icon selection
    for (let i = 0; i < nouns.length; i++) {
      noun = nouns[i];
      DATA.block1.push({ 
        stimulus: stim_img(noun),
        choices: noun_icons,
        data_choices: null,
        answer: noun_icons[i],
        subj: noun,
      });
    }

    // create block 1 trials
    var block1_trials = {
      type: jsPsychSelection,
      stimulus: jsPsych.timelineVariable("stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      data_choices: jsPsych.timelineVariable("data_choices"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
      force_correct_button_press: true,
      linger_duration: linger,
      css_classes: ["icon-selection", ],
      data: {
        block: 1,
        n_marker: 0,
        subj: jsPsych.timelineVariable("subj"),
        subtype: "icon selection",
      },
    };

    // create block 1
    EXPERIMENT.block1 = {
      timeline: [block1_trials, ],
      timeline_variables: DATA.block1,
      randomize_order: true,
    };
  }

  // 3 trials
  function block2() {

    // BLOCK 2 ----------------------------------------------------------------
    // Verb learning:
    // Exposure to verbs through 3 madlib trials. Each verb appears once. The
    // subject is singular once [TV] & plural twice [TV & IV].
    // ------------------------------------------------------------------------

    var verb, vicon;
    var n1, nicon1;
    var n2, nicon2;
    var subj_num;
    var caption;

    // assign which trials get accusative case
    var cases = ["", "c", "c"];

    // madlib (transitive)
    for (let i = 0; i < 3; i++) {
      [verb, vicon, n1, nicon1, n2, nicon2] = EVENTS.pop();
      subj_num = SUBJ_NUMS.pop();
      caption = icons2sent("%blank%", nicon1, nicon2, lookup[subj_num], cases[i], true);
      DATA.block2.push({
        img_stimulus: stim_img(words2fn(verb, n1, n2, subj_num)),
        caption_stimulus: caption,
        choices: verb_icons,
        answer: vicon,
        verb: verb,
        subj: n1,
        obj: n2,
      });
    }

    // create block 2 trials
    var block2_trials = {
      type: jsPsychMadlib,
      img_stimulus: jsPsych.timelineVariable("img_stimulus"),
      caption_stimulus: jsPsych.timelineVariable("caption_stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
      force_correct_button_press: true,
      linger_duration: linger,
      data: {
        block: 2,
        n_marker: 0,
        verb: jsPsych.timelineVariable("verb"),
        subj: jsPsych.timelineVariable("subj"),
        obj: jsPsych.timelineVariable("obj"),
      },
    };

    // create block 2
    EXPERIMENT.block2 = {
      timeline: [block2_trials, ],
      timeline_variables: DATA.block2,
      randomize_order: true,
    };
  }

  // 15 trials
  function block3() {

    // BLOCK 3 ----------------------------------------------------------------
    // Marker learning:
    // Practice with one-marker inflections via 15 picture-selection trials. In
    // 9 trials ["number learning"; IV], the foil appears with the incorrect
    // subject number (3 correctly singular & 9 correctly plural). In the 6
    // remaining trials ["case learning"; TV], the subject & object are
    // inverted in the foil (all singular subjects); half appear with inverted
    // word orders.
    // ------------------------------------------------------------------------

    var verb, vicon;
    var n1, nicon1;
    var n2, nicon2;
    var micon;
    var subj_num;
    var foil;
    var stimulus;
    var answer;
    var choices;

    // subject number foils
    var foils = {
      sg: "pl", "sg3": "pl3", "sg9": "pl9",
      pl: "sg", "pl3": "sg", "pl9": "sg",
    };

    // picture selection (number learning with intransitives; incorrect subject number)
    for (let i = 0; i < 9; i++) {
      [verb, vicon, n1, nicon1, n2, nicon2] = EVENTS.pop();
      subj_num = SUBJ_NUMS.pop();
      foil = foils[subj_num];
      subj_num = subj_num.replace("sg3", "sg").replace("sg9", "sg");
      choices = [
        stim_img(words2fn(verb, n1, n2, subj_num)),
        stim_img(words2fn(verb, n1, n2, foil)),
      ];
      answer = icons2sent(vicon, nicon1, nicon2, lookup[subj_num], "");
      foil = icons2sent(vicon, nicon1, nicon2, lookup[foil], "");
      DATA.block3.push({
        stimulus: stim_span(answer),
        choices: choices,
        data_choices: [answer, foil],
        answer: answer,
        verb: verb,
        subj: n1,
        obj: n2,
        foil: foil,
        subtype: "picture selection (num)",
      });
    }

    // assign which trials get inverted word orders
    var inverted = jsPsych.randomization.repeat([true, false], [3, 3]);

    // picture selection (case learning with transitives; inverted subject & object)
    for (let i = 0; i < 6; i++) {
      [verb, vicon, n1, nicon1, n2, nicon2] = EVENTS.pop();
      if (inverted.pop()) {
        stimulus = icons2sent(vicon, nicon2, nicon1, "c", ""); // inverted
        answer = icons2sent(vicon, nicon1, nicon2, "", "c");
      } else {
        stimulus = icons2sent(vicon, nicon1, nicon2, "", "c"); // normal
        answer = stimulus;
      }
      choices = [
        stim_img(words2fn(verb, n1, n2, "sg")),
        stim_img(words2fn(verb, n2, n1, "sg")),
      ];
      foil = icons2sent(vicon, nicon2, nicon1, "", "c");
      DATA.block3.push({
        stimulus: stim_span(stimulus),
        choices: choices,
        data_choices: [answer, foil],
        answer: answer,
        verb: verb,
        subj: n1,
        obj: n2,
        foil: foil,
        subtype: "picture selection (case)",
      });
    }

    // create block 3 trials
    var block3_trials = {
      type: jsPsychSelection,
      stimulus: jsPsych.timelineVariable("stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      data_choices: jsPsych.timelineVariable("data_choices"),
      answer: jsPsych.timelineVariable("answer"),
      force_correct_button_press: true,
      linger_duration: linger,
      css_classes: ["picture-selection", ],
      data: {
        block: 3,
        n_marker: 1,
        verb: jsPsych.timelineVariable("verb"),
        subj: jsPsych.timelineVariable("subj"),
        obj: jsPsych.timelineVariable("obj"),
        foil: jsPsych.timelineVariable("foil"),
        subtype: jsPsych.timelineVariable("subtype"),
      },
    };

    // create block 3
    EXPERIMENT.block3 = {
      timeline: [block3_trials, ],
      timeline_variables: DATA.block3,
      randomize_order: true,
    };
  }

  // 6 trials
  function block4() {

    // BLOCK 4 ----------------------------------------------------------------
    // One-marker NP practice:
    // Practice with the production task format, beginning with 1 IV trial
    // (singular subject), followed by 1 IV trial (plural subject) and 3 TV
    // trials (3 plurals subjects & 1 singular subject) intermixed. ?????????????????????????
    // ------------------------------------------------------------------------

    var noun;
    var verb, vicon;
    var n1, nicon1;
    var n2, nicon2;
    var subj_num, micon;
    var answer;
    var keys, key_order;
    var block = DATA.block4a;

    // production (one-marker NPs)
    for (let i = 0; i < 6; i++) {
      [verb, vicon, n1, nicon1, n2, nicon2] = EVENTS.pop();
      subj_num = SUBJ_NUMS.pop();
      micon = lookup[subj_num];
      if (i < 2) { // intransitive
        answer = icons2sent("", nicon1, nicon2, micon, "");
      } else { // transitive
        answer = [
          icons2sent("", nicon1, nicon2, micon, "c"),
          icons2sent("", nicon2, nicon1, "c", micon), // inverted
        ];
      }
      [keys, key_order] = KEYBOARDS.pop();
      block.push({
        stimulus: stim_img(words2fn(verb, n1, n2, subj_num)),
        keys: keys,
        key_order: key_order,
        prompt: vicon,
        answer: answer,
        verb: verb,
        subj: n1,
        obj: n2,
      });
      block = DATA.block4b;
    }

    // create block 4 trials
    var block4_trials = {
      type: jsPsychProduction,
      stimulus: jsPsych.timelineVariable("stimulus"),
      keys: jsPsych.timelineVariable("keys"),
      prompt: jsPsych.timelineVariable("prompt"),
      prompt_before: false,
      answer: jsPsych.timelineVariable("answer"),
      show_feedback: true,
      force_correct_production: true,
      first_answer_only: true,
      include_spacebar: false,
      include_counter: false,
      fill_in_the_blanks: true,
      linger_duration: linger,
      css_classes: ["jspsych-production", ],
      data: {
        block: 4,
        n_marker: 1,
        verb: jsPsych.timelineVariable("verb"),
        subj: jsPsych.timelineVariable("subj"),
        obj: jsPsych.timelineVariable("obj"),
      }
    };

    // create block 4a
    EXPERIMENT.block4a = {
      timeline: [block4_trials, ],
      timeline_variables: DATA.block4a,
      randomize_order: true,
    };

    // create block 4b
    EXPERIMENT.block4b = {
      timeline: [block4_trials, ],
      timeline_variables: DATA.block4b,
      randomize_order: true,
    };
  }

  // 15 trials
  function block5() {

    // BLOCK 5 ----------------------------------------------------------------
    // Two-marker NP productions:
    // Twelve critical two-marker NP production trials (6 singular subjects &
    // 6 plural subjects). Each unique event appears once.
    // ------------------------------------------------------------------------

    var verb, vicon;
    var n1, nicon1;
    var n2, nicon2;
    var subj_num, micon;
    var iso, niso;
    var answer;
    var keys, key_order;

    // set isomorphic and non-isomorphic affixes for two-marker NP trials
    if (CONDITION == "prenominal") {
      iso = "cn";
      niso = "nc";
    } else {
      iso = "nc";
      niso = "cn";
    }

    // production (critical two-marker NPs)
    for (let i = 0; i < 12; i++) {
      [verb, vicon, n1, nicon1, n2, nicon2] = EVENTS.pop();
      subj_num = SUBJ_NUMS.pop();
      micon = lookup[subj_num];
      answer = [
        icons2sent("", nicon1, nicon2, micon, iso),
        icons2sent("", nicon2, nicon1, iso, micon),  // inverted
        icons2sent("", nicon1, nicon2, micon, niso),
        icons2sent("", nicon2, nicon1, niso, micon), // inverted
      ];
      [keys, key_order] = KEYBOARDS.pop();
      DATA.block5.push({
        stimulus: stim_img(words2fn(verb, n1, n2, subj_num, "pl")),
        keys: keys,
        key_order: key_order,
        prompt: vicon,
        answer: answer,
        verb: verb,
        subj: n1,
        obj: n2,
      });
    }

    // create block 5 trials
    var block5_trials = {
      type: jsPsychProduction,
      stimulus: jsPsych.timelineVariable("stimulus"),
      keys: jsPsych.timelineVariable("keys"),
      key_order: jsPsych.timelineVariable("key_order"),
      prompt: jsPsych.timelineVariable("prompt"),
      prompt_before: false,
      answer: jsPsych.timelineVariable("answer"),
      show_feedback: false,
      force_correct_production: false,
      mark_correct: true,
      include_spacebar: false,
      include_counter: false,
      fill_in_the_blanks: true,
      linger_duration: linger,
      on_finish: is_isomorphic,
      css_classes: ["jspsych-production", ],
      data: {
        block: 5,
        n_marker: 2,
        verb: jsPsych.timelineVariable("verb"),
        subj: jsPsych.timelineVariable("subj"),
        obj: jsPsych.timelineVariable("obj"),
      },
    };

    // create block 5
    EXPERIMENT.block5 = {
      timeline: [block5_trials, ],
      timeline_variables: DATA.block5,
      randomize_order: false,
    };
  }

  // ==========================================================================
  // Define core function to generate blocked trials
  // ==========================================================================

  function generate(condition, verb_first = true) {

    // set global condition
    CONDITION = condition;

    // set linearization function based on condition
    linearize = CONDITION == 'prenominal' ? prenominal : postnominal;

    // set global verb position
    VERB_FIRST = verb_first;

    // set icons-to-sentence mapping
    icons2sent = VERB_FIRST ? verb_initial_sent : verb_final_sent;

    // generate verb-subject(-object) events, subject numbers, & keyboards
    generate_events();
    generate_subj_nums();
    generate_keyboards();

    // generate blocks
    demo();
    block1();
    block2();
    block3();
    block4();
    block5();

    // return trial blocks
    return EXPERIMENT;
  }

  // return core generate function
  return generate;
})();
