var test = (function() {

  // store jsPsych experiment blocks
  var EXPERIMENT = {
    block1: {}, // icon selection
    block2: {}, // picture selection
    block3: {}, // madlib
    block4: {}, // production (fill-in-the-blanks)
    block5: {}, // production (cursor + counter)
  };

  // ==========================================================================
  // Define internal helper variables; the capitalized ones get updated
  // ==========================================================================

  // prenominal or postnominal
  var CONDITION = "postnominal";

  // store trial data associated with each block
  var DATA = {
    block1: [], // icon selection
    block2: [], // picture selection
    block3: [], // madlib
    block4: [], // production (fill-in-the-blanks)
    block5: [], // production (cursor + counter)
  };

  // set global linger duration
  var linger = 600;

  // ==========================================================================
  // Define internal helper functions to format simuli
  // ==========================================================================

  var lookup = {
    // icon2word
    B: "ball", F: "feather", M: "mug",
    p: "this", d: "that", b: "black", r: "red", "2": "two", "3": "three",
    // word2icon
    ball: "B", feather: "F", mug: "M",
    this: "p", that: "d", black: "b", red: "r", two: "2", three: "3",
  };

  // function to preserve postnominal NP orders
  function linearize(...arr) {
    return arr.join("");
  }

  // function to map icons to sentence
  function icons2sent(vicon, nicon1, nicon2, a1, a2, madlib = false) {
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
  function stim_img(str, ex = "s21") {
    return `<img src="../_static/stimuli/${ex}/${str}.png" />`;
  }

  // function to map icons to filename
  function icons2fn(arr) {
    return arr.slice().reverse().map(i => lookup[i]).join("-");
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

  // icon selection – 2 trials
  function block1() {

    // m20 (mug)
    DATA.block1.push({
      stimulus: stim_img("mug", ex = "m20"),
      choices: ["F", "B", "M"],
      answer: "M",
    });

    // s21 (monkey)
    DATA.block1.push({
      stimulus: stim_img("monkey"),
      choices: ["S", "U", "N"],
      answer: "S",
    });

    // create block 1 trials
    var block1_trials = {
      type: jsPsychSelection,
      stimulus: jsPsych.timelineVariable("stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
      force_correct_button_press: true,
      linger_duration: linger,
      css_classes: ["icon-selection", "demo"],
      data: {
        block: 1,
        subtype: "icon selection",
      },
    };

    // create block 1
    EXPERIMENT.block1 = {
      timeline: [block1_trials, ],
      timeline_variables: DATA.block1,
      randomize_order: false,
    };
  }

  // picture selection - 4 trials
  function block2() {
    var nouns, icons;
    var nicon, micon;
    var verb, vicon, n1, nicon1, n2, nicon2;
    var answer, foil;
    var choices;

    // m20 (ball); 3 options
    nouns = ["ball", "feather", "mug"];
    DATA.block2.push({
      stimulus: stim_span("B"),
      choices: nouns.map(i => stim_img(i, ex = "m20")),
      data_choices: ["B", "F", "M"],
      answer: "B",
      css_classes: ["picture-selection", "demo"],
    });

    // s21 (rabbit); 3 options
    nouns = ["monkey", "rabbit", "cat"];
    DATA.block2.push({
      stimulus: stim_span("U"),
      choices: nouns.map(i => stim_img(i)),
      data_choices: ["S", "U", "N"],
      answer: "U",
      css_classes: ["picture-selection", "demo"],
    });

    // m20 (black feather); 2 options
    icons = ["F", "b"];
    [nicon, micon] = icons;
    choices = [icons, [nicon, "r"]];
    DATA.block2.push({
      stimulus: stim_span("Fb"),
      choices: choices.map(i => stim_img(icons2fn(i), ex = "m20")),
      data_choices: choices.map(i => i[1]),
      answer: micon,
      css_classes: ["picture-selection", ],
    });

    // s21 (the cats sleep); 2 options
    [verb, vicon, n1, nicon1, n2, nicon2] = ["sleep", "E", "cat", "N", "", ""];
    choices = [
      stim_img(words2fn(verb, n1, n2, "pl")),
      stim_img(words2fn(verb, n1, n2, "sg")),
    ];
    answer = icons2sent(vicon, nicon1, nicon2, "n", "");
    foil = icons2sent(vicon, nicon1, nicon2, "", "");
    DATA.block2.push({
      stimulus: stim_span(answer),
      choices: choices,
      data_choices: [answer, foil],
      answer: answer,
      css_classes: ["picture-selection", ],
    });

    // create block 2 trials
    var block2_trials = {
      type: jsPsychSelection,
      stimulus: jsPsych.timelineVariable("stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      data_choices: jsPsych.timelineVariable("data_choices"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: null,
      force_correct_button_press: true,
      linger_duration: linger,
      css_classes: jsPsych.timelineVariable("css_classes"),
      data: {
        block: 2,
        subtype: "picture selection",
      },
    };

    // create block 2
    EXPERIMENT.block2 = {
      timeline: [block2_trials, ],
      timeline_variables: DATA.block2,
      randomize_order: false,
    };
  }

  // madlibs - 4 trials
  function block3() {
    var icons;
    var nicon, micon;
    var verb, vicon, n1, nicon1, n2, nicon2;

    // m20 (feather)
    icons = ["M", "B", "F"];
    DATA.block3.push({
      img_stimulus: stim_img("feather", ex = "m20"),
      caption_stimulus: "%blank%",
      choices: icons,
      answer: "F",
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
    });

    // s21 (monkey)
    icons = ["N", "U", "S"];
    DATA.block3.push({
      img_stimulus: stim_img("monkey"),
      caption_stimulus: "%blank%",
      choices: icons,
      answer: "S",
    });

    // m20 (three mugs)
    icons = ["M", "3"];
    [nicon, micon] = icons;
    choices = [micon, "2"];
    DATA.block3.push({
      img_stimulus: stim_img("three-mug", ex = "m20"),
      caption_stimulus: "M %blank%",
      choices: choices,
      answer: micon,
    });

    // s21 (the cat chased the rabbit)
    [verb, vicon, n1, nicon1, n2, nicon2] = ["chase", "A", "cat", "N", "rabbit", "U"];
    caption = icons2sent("%blank%", nicon1, nicon2, "", "c", true);
    DATA.block3.push({
      img_stimulus: stim_img(words2fn(verb, n1, n2, "sg")),
      caption_stimulus: caption,
      choices: ["A", "E", "H"],
      answer: vicon,
    });

    // create block 3 trials
    var block3_trials = {
      type: jsPsychMadlib,
      img_stimulus: jsPsych.timelineVariable("img_stimulus"),
      caption_stimulus: jsPsych.timelineVariable("caption_stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
      force_correct_button_press: true,
      linger_duration: linger,
      data: {
        block: 3,
      }
    };

    // create block 3
    EXPERIMENT.block3 = {
      timeline: [block3_trials, ],
      timeline_variables: DATA.block3,
      randomize_order: false,
    };
  }

  // production (fill-in-the-blanks) – 4 trials
  function block4() {
    var icons;
    var nicon, micon;
    var verb, vicon, n1, nicon1, n2, nicon2;
    var answer;

    // s21 (rabbit); single + no prompt
    DATA.block4.push({
      stimulus: stim_img("rabbit"),
      keys: ["U", "N", "S"],
      answer: "U",
      noun: "rabbit",
      show_feedback: false,
      force_correct_production: false,
      mark_correct: true,
    });

    // m20 (red mugs); 2 + no prompt
    icons = ["M", "r"];
    [nicon, micon] = icons;
    DATA.block4.push({
      stimulus: stim_img(icons2fn(icons), ex = "m20"),
      keys: ["M", "b", "r", "2", "3"],
      answer: "Mr",
      show_feedback: true,
      force_correct_production: true,
      mark_correct: false,
    });

    // m20 (three red balls); phrase-initial prompt
    icons = ["B", ["r", "3"]];
    [nicon, micons] = icons;
    answer = ["r3", "3r"];
    DATA.block4.push({
      stimulus: stim_img(icons2fn(icons.flat()), ex = "m20"),
      keys: ["b", "r", "2", "3"],
      prompt: nicon,
      prompt_before: true,
      answer: answer,
      show_feedback: true,
      force_correct_production: true,
      mark_correct: false,
    });

    // s21 (the rabbit punched the monkey); phrase-final prompt
    [verb, vicon, n1, nicon1, n2, nicon2] = ["punch", "H", "rabbit", "U", "monkey", "S"];
    answer = [
      icons2sent("", nicon1, nicon2, "", "c"),
      icons2sent("", nicon2, nicon1, "c", ""), // inverted
    ];
    DATA.block4.push({
      stimulus: stim_img(words2fn(verb, n1, n2, "sg")),
      keys: ["S", "U", "N", "n", "c"],
      prompt: vicon,
      prompt_before: false,
      answer: answer,
      show_feedback: true,
      force_correct_production: true,
      mark_correct: false,
    });

    // create block 4 trials
    var block4_trials = {
      type: jsPsychProduction,
      stimulus: jsPsych.timelineVariable("stimulus"),
      keys: jsPsych.timelineVariable("keys"),
      prompt: jsPsych.timelineVariable("prompt"),
      prompt_before: jsPsych.timelineVariable("prompt_before"),
      answer: jsPsych.timelineVariable("answer"),
      show_feedback: jsPsych.timelineVariable("show_feedback"),
      force_correct_production: jsPsych.timelineVariable("force_correct_production"),
      first_answer_only: false,
      mark_correct: jsPsych.timelineVariable("mark_correct"),
      include_spacebar: false,
      include_counter: false,
      fill_in_the_blanks: true,
      linger_duration: linger,
      css_classes: ["jspsych-production", ],
      data: {
        block: 4,
      }
    };

    // create block 4
    EXPERIMENT.block4 = {
      timeline: [block4_trials, ],
      timeline_variables: DATA.block4,
      randomize_order: false,
    };
  }

  // production (cursor + counter) – 3 trials
  function block5() {
    var icons;
    var nicon, micon;
    var verb, vicon, n1, nicon1, n2, nicon2;
    var answer;

    // m20 (ball); single + no prompt
    DATA.block5.push({
      stimulus: stim_img("ball", ex = "m20"),
      keys: ["F", "M", "B"],
      answer: "B",
      include_spacebar: true,
      show_feedback: false,
      force_correct_production: false,
      mark_correct: true,
    });

    // m20 (two black feathers); phrase-initial prompt
    icons = ["F", ["b", "2"]];
    [nicon, micons] = icons;
    answer = ["b2", "2b"];
    DATA.block5.push({
      stimulus: stim_img(icons2fn(icons.flat()), ex = "m20"),
      keys: ["b", "r", "2", "3"],
      prompt: nicon,
      prompt_before: true,
      answer: answer,
      include_spacebar: true,
      show_feedback: true,
      force_correct_production: true,
      mark_correct: false,
    });

    // s21 (the cat sleeps); phrase-final prompt
    [verb, vicon, n1, nicon1] = ["sleep", "E", "cat", "N"];
    answer = icons2sent("", nicon1, nicon2, "", "");
    DATA.block5.push({
      stimulus: stim_img(words2fn(verb, n1, "", "sg")),
      keys: ["S", "U", "N", "n", "c"],
      prompt: vicon,
      prompt_before: false,
      answer: answer,
      include_spacebar: false,
      show_feedback: true,
      force_correct_production: true,
      mark_correct: false,
    });

    // create block 5 trials
    var block5_trials = {
      type: jsPsychProduction,
      stimulus: jsPsych.timelineVariable("stimulus"),
      keys: jsPsych.timelineVariable("keys"),
      prompt: jsPsych.timelineVariable("prompt"),
      prompt_before: jsPsych.timelineVariable("prompt_before"),
      answer: jsPsych.timelineVariable("answer"),
      show_feedback: jsPsych.timelineVariable("show_feedback"),
      force_correct_production: jsPsych.timelineVariable("force_correct_production"),
      mark_correct: jsPsych.timelineVariable("mark_correct"),
      include_spacebar: jsPsych.timelineVariable("include_spacebar"),
      include_counter: true,
      fill_in_the_blanks: false,
      linger_duration: linger,
      on_finish: is_isomorphic,
      css_classes: ["jspsych-production", ],
      data: {
        block: 5,
      }
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

  function generate(condition) {

    // generate blocks
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
