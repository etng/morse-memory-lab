const MORSE_TABLE = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "!": "-.-.--",
  "-": "-....-",
  "/": "-..-.",
  "@": ".--.-.",
  "'": ".----.",
  '"': ".-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
};

const dot = (x, y, size = 10) => ({
  type: "dot",
  x,
  y,
  w: `${size}%`,
  h: `${size}%`,
  rotate: "0deg",
});

const dash = (x, y, rotate = 0, width = 32, height = 8) => ({
  type: "dash",
  x,
  y,
  w: `${width}%`,
  h: `${height}%`,
  rotate: `${rotate}deg`,
});

const LETTER_LAYOUTS = {
  A: [dot(50, 16, 10), dash(50, 54, 0, 36, 8)],
  B: [dash(34, 50, 90, 50, 8), dot(64, 20), dot(64, 50), dot(64, 80)],
  C: [dash(42, 22, -22, 30, 8), dot(74, 20), dash(42, 82, 22, 30, 8), dot(74, 84)],
  D: [dash(34, 50, 90, 50, 8), dot(66, 28), dot(66, 72)],
  E: [dot(72, 18)],
  F: [dot(68, 18), dot(68, 50), dash(44, 52, 0, 30, 8), dot(68, 82)],
  G: [dash(48, 22, 0, 34, 8), dash(40, 82, 0, 30, 8), dot(70, 58)],
  H: [dot(34, 20), dot(66, 20), dot(34, 82), dot(66, 82)],
  I: [dot(50, 22), dot(50, 80)],
  J: [dot(64, 18), dash(64, 38, 90, 18, 8), dash(64, 58, 90, 16, 8), dash(57, 84, -34, 24, 8)],
  K: [dash(34, 52, 90, 50, 8), dot(64, 36), dash(64, 76, -44, 30, 8)],
  L: [dot(25, 20), dash(25, 50, 90, 44, 8), dot(52, 84), dot(74, 84)],
  M: [dash(36, 34, 56, 34, 8), dash(64, 34, -56, 34, 8)],
  N: [dash(50, 50, 58, 46, 8), dot(82, 20)],
  O: [dash(50, 20, 0, 30, 8), dash(34, 54, 90, 38, 8), dash(50, 88, 0, 30, 8)],
  P: [dot(36, 20), dash(36, 56, 90, 42, 8), dash(64, 20, 0, 26, 8), dot(64, 56)],
  Q: [dash(50, 20, 0, 28, 8), dash(34, 54, 90, 38, 8), dot(58, 86), dash(74, 90, 42, 22, 8)],
  R: [dot(34, 20), dash(36, 56, 90, 42, 8), dot(64, 58)],
  S: [dot(50, 18), dot(50, 50), dot(50, 82)],
  T: [dash(50, 18, 0, 58, 8)],
  U: [dot(34, 20), dot(66, 20), dash(50, 92, 0, 42, 8)],
  V: [dot(28, 20), dot(72, 20), dot(50, 82), dash(50, 92, 0, 24, 8)],
  W: [dot(22, 20), dash(42, 68, -66, 38, 8), dash(66, 74, 70, 22, 8)],
  X: [dash(34, 34, 54, 34, 8), dot(62, 44), dot(42, 62), dash(66, 76, -54, 28, 8)],
  Y: [dash(35, 31, 56, 34, 8), dot(50, 50), dash(69, 25, -56, 18, 8), dash(50, 83, 90, 20, 8)],
  Z: [dash(36, 20, 0, 30, 8), dash(64, 52, -42, 32, 8), dot(36, 84), dot(68, 84)],
};

const ALPHABET = Object.keys(MORSE_TABLE).filter((char) => /^[A-Z]$/.test(char));
const messageInput = document.querySelector("#messageInput");
const alphabetGrid = document.querySelector("#alphabetGrid");
const encodedOutput = document.querySelector("#encodedOutput");
const statusLine = document.querySelector("#statusLine");
const unsupportedLine = document.querySelector("#unsupportedLine");
const playMessageButton = document.querySelector("#playMessageButton");
const stopButton = document.querySelector("#stopButton");
const sampleButton = document.querySelector("#sampleButton");
const dotDurationInput = document.querySelector("#dotDuration");
const dotDurationValue = document.querySelector("#dotDurationValue");
const themeSelect = document.querySelector("#themeSelect");
const languageSelect = document.querySelector("#languageSelect");
const settingsPopover = document.querySelector("#settingsPopover");

let audioContext;
let playbackNonce = 0;
let activeOscillators = new Set();

const speakerIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4 10h4l5-4v12l-5-4H4z"></path>
    <path d="M16 9a4 4 0 010 6"></path>
  </svg>
`;

const STORAGE_KEYS = {
  theme: "morse-tool-theme",
  language: "morse-tool-language",
  dotDuration: "morse-tool-dot-duration",
};

const TRANSLATIONS = {
  zh: {
    meta: {
      title: "摩斯密码工具台",
    },
    studio: {
      eyebrow: "实验台",
      title: "摩斯密码工具台",
      summary: "输入英文短句后会自动转成大写、拆成字母，并按标准莫斯时值顺序播放。",
    },
    input: {
      label: "英文或短句",
      help: {
        aria: "支持输入格式说明",
        body: "支持 A-Z、数字和常见标点。会自动转成大写；空格会生成单词停顿。",
      },
    },
    settings: {
      open: "打开设置",
      title: "设置",
      summary: "主题、界面语言和播放节奏",
      theme: "配色",
      themeTech: "科技蓝",
      themeMacaron: "马卡龙",
      dot: "点长",
      language: "界面语言",
      languageZh: "中文",
      languageEn: "英文",
    },
    legend: {
      glyph: "白色：字母骨架",
      cue: "蓝色：记忆笔触",
      signal: "红色：时值条",
      signalLong: "红色：莫斯时值",
    },
    controls: {
      playMessage: "播放整句",
      stop: "停止",
      sample: "载入示例",
    },
    result: {
      title: "解析结果",
      caption: "喇叭试听单字，停顿自动保留",
    },
    library: {
      eyebrow: "字母库",
      title: "单字母试播与对照",
      summary: "逐个核对字形、笔触和节奏。",
      note: "结果区里的间隔块表示单词停顿，标准时值是 7U。",
      cardHint: "点击播放 {char} 的莫斯节奏。",
    },
    guide: {
      eyebrow: "说明",
      title: "规则与记忆方法",
      summary: "颜色含义、标准时值和样例对照。",
      hero: {
        eyebrow: "工具说明",
        title: "把标准莫斯电码、字形记忆和试听实验放到同一个工作台里。",
        summary: "白色是字母骨架，蓝色是记忆笔触，红色是莫斯时值。整句输入、单字母试听和视频对照都沿用同一套字形母版。",
        linkOriginal: "原帖",
        linkSheet: "抽帧总览",
      },
      rules: {
        label: "播放规则",
        body: "本页使用标准国际莫斯电码。整句播放会自动处理点划、字母停顿和单词停顿。",
        dot: "点：1 个单位时长",
        dash: "划：3 个单位时长",
        letterGap: "字母间停顿：3 个单位",
        wordGap: "单词间停顿：7 个单位",
      },
      read: {
        title: "如何读这套记忆图",
        body1: "蓝色笔触不会改动编码本身，它只是把点和划贴着字母结构摆进去，帮助你把字形和节奏一起记住。",
        body2: "下列样例是这套摆放逻辑的固定母版；整句输入和单字母播放都会沿用同一套规则。",
      },
      examples: {
        a: "顶点放点，中横放划，字形和节奏一眼能对上。",
        s: "三个点沿主轴下排，是最直接的 SOS 记忆方式。",
        o: "三条长划沿外圈分布，重点是贴边，不占中腔。",
        q: "先沿外环走两笔，再落一点，最后把尾巴单独补上。",
      },
    },
    video: {
      eyebrow: "参考视频",
      title: "原视频对照",
      summary: "需要校对笔触时再展开。",
      panelTitle: "需要校对笔触时，可以直接对照原视频。",
      body: "这里放的是抓下来的本地视频文件。适合在调字形、看节奏或者核对某个字母的蓝色笔触位置时直接比照。",
      meta: {
        prefix: "本地文件：",
        suffix: "。已开启循环，默认静音自动播放，也可以手动打开声音。",
      },
    },
    dynamic: {
      empty: "输入后，这里会出现解析结果。",
      unsupportedLong: "已忽略不支持的字符：{chars}",
      unsupportedShort: "已忽略：{chars}",
      pauseAria: "单词停顿 7 units",
      playToken: "播放 {char} {pattern}",
    },
    status: {
      source: {
        alphabet: "字母库",
        encoded: "解析结果",
      },
      playSingle: "正在播放 {source}：{char} {pattern}",
      playDone: "播放完成：{char} {pattern}",
      noPlayable: "没有可播放的字符。",
      messageStart: "开始按顺序播放整句。",
      playingIndex: "正在播放第 {index} 个字母：{char} {pattern}",
      messageDone: "整句播放完毕。",
      stopped: "播放已停止。",
    },
  },
  en: {
    meta: {
      title: "Morse Tool Bench",
    },
    studio: {
      eyebrow: "Lab",
      title: "Morse Tool Bench",
      summary: "Type an English phrase to uppercase, split it into letters, and play it back with standard Morse timing.",
    },
    input: {
      label: "English phrase",
      help: {
        aria: "Supported input formats",
        body: "Supports A-Z, digits, and common punctuation. Input is uppercased automatically, and spaces become word gaps.",
      },
    },
    settings: {
      open: "Open settings",
      title: "Settings",
      summary: "Theme, interface language, and playback pace",
      theme: "Theme",
      themeTech: "Tech Blue",
      themeMacaron: "Macaron",
      dot: "Dot length",
      language: "Interface language",
      languageZh: "Chinese",
      languageEn: "English",
    },
    legend: {
      glyph: "White: letter skeleton",
      cue: "Blue: memory stroke",
      signal: "Red: timing bar",
      signalLong: "Red: Morse timing",
    },
    controls: {
      playMessage: "Play phrase",
      stop: "Stop",
      sample: "Load sample",
    },
    result: {
      title: "Parsed output",
      caption: "Speaker plays one token; pauses stay in the row",
    },
    library: {
      eyebrow: "Alphabet",
      title: "Single-letter playback",
      summary: "Check each glyph, cue stroke, and rhythm one by one.",
      note: "The gap block in the result row marks a word pause of 7 units.",
      cardHint: "Play {char} in Morse.",
    },
    guide: {
      eyebrow: "Guide",
      title: "Rules and memory method",
      summary: "Color meanings, standard timing, and key examples.",
      hero: {
        eyebrow: "Overview",
        title: "Keep standard Morse, letter-shaped memory cues, and playback tests on one workbench.",
        summary: "White is the letter skeleton, blue is the memory stroke, and red is Morse timing. Phrase input, single-letter playback, and video comparison all share the same glyph masters.",
        linkOriginal: "Original post",
        linkSheet: "Contact sheet",
      },
      rules: {
        label: "Playback rules",
        body: "This page uses standard international Morse code. Phrase playback handles symbols, letter gaps, and word gaps automatically.",
        dot: "Dot: 1 unit",
        dash: "Dash: 3 units",
        letterGap: "Letter gap: 3 units",
        wordGap: "Word gap: 7 units",
      },
      read: {
        title: "How to read this memory map",
        body1: "The blue cues do not change the code. They place dots and dashes against the letter structure so the shape and rhythm are easier to memorize together.",
        body2: "The samples below are fixed masters for that placement logic. Phrase input and single-letter playback both reuse the same rules.",
      },
      examples: {
        a: "A dot sits at the apex, and a dash lands on the crossbar, so shape and rhythm line up instantly.",
        s: "Three dots stack down the main axis, the most direct way to remember SOS.",
        o: "Three long dashes wrap the outer ring, hugging the edge instead of filling the center.",
        q: "Trace the outer ring first, drop the dot next, then finish with the tail.",
      },
    },
    video: {
      eyebrow: "Reference video",
      title: "Original video comparison",
      summary: "Open this only when you need to check cue placement.",
      panelTitle: "Open the source video whenever you need to verify a stroke.",
      body: "This is the downloaded local video file. Use it when tuning glyphs, checking rhythm, or comparing the blue cue placement of a specific letter.",
      meta: {
        prefix: "Local file: ",
        suffix: ". It loops automatically, starts muted, and you can turn the sound on manually.",
      },
    },
    dynamic: {
      empty: "Parsed output will appear here after you type.",
      unsupportedLong: "Unsupported characters ignored: {chars}",
      unsupportedShort: "Ignored: {chars}",
      pauseAria: "Word gap, 7 units",
      playToken: "Play {char} {pattern}",
    },
    status: {
      source: {
        alphabet: "alphabet",
        encoded: "parsed output",
      },
      playSingle: "Playing {source}: {char} {pattern}",
      playDone: "Done: {char} {pattern}",
      noPlayable: "There are no playable characters.",
      messageStart: "Starting phrase playback.",
      playingIndex: "Playing letter {index}: {char} {pattern}",
      messageDone: "Phrase playback finished.",
      stopped: "Playback stopped.",
    },
  },
};

const VALID_THEMES = new Set(["tech-blue", "macaron"]);
const VALID_LANGUAGES = new Set(["zh", "en"]);

const readStoredSetting = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const writeStoredSetting = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    // Storage may be unavailable.
  }
};

let currentTheme = VALID_THEMES.has(readStoredSetting(STORAGE_KEYS.theme))
  ? readStoredSetting(STORAGE_KEYS.theme)
  : "tech-blue";
let currentLanguage = VALID_LANGUAGES.has(readStoredSetting(STORAGE_KEYS.language))
  ? readStoredSetting(STORAGE_KEYS.language)
  : "zh";

const getTranslation = (language, key) => {
  const parts = key.split(".");
  let value = TRANSLATIONS[language];

  for (const part of parts) {
    value = value?.[part];
  }

  return value;
};

const interpolate = (template, values = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, token) => String(values[token] ?? ""));

const t = (key, values = {}) => {
  const resolved = getTranslation(currentLanguage, key) ?? getTranslation("zh", key) ?? key;
  return interpolate(resolved, values);
};

const getDotDuration = () => Number(dotDurationInput.value);

const setStatus = (message) => {
  statusLine.textContent = message;
};

const applyTranslations = () => {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("meta.title");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.title = t(element.dataset.i18nTitle);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
};

const applyTheme = (theme, { persist = true } = {}) => {
  currentTheme = VALID_THEMES.has(theme) ? theme : "tech-blue";
  document.body.dataset.theme = currentTheme;
  themeSelect.value = currentTheme;

  if (persist) {
    writeStoredSetting(STORAGE_KEYS.theme, currentTheme);
  }
};

const applyLanguage = (language, { persist = true } = {}) => {
  currentLanguage = VALID_LANGUAGES.has(language) ? language : "zh";
  languageSelect.value = currentLanguage;
  applyTranslations();
  renderAlphabetGrid();
  renderMessage();
  setStatus("");

  if (persist) {
    writeStoredSetting(STORAGE_KEYS.language, currentLanguage);
  }
};

const sleep = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const stopAllAudio = () => {
  activeOscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch (error) {
      // Oscillator may already be stopped.
    }
  });
  activeOscillators = new Set();
};

const cancelPlayback = () => {
  playbackNonce += 1;
  stopAllAudio();
  clearHighlights();
};

const getAudioContext = async () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  return audioContext;
};

const createGenericLayout = (pattern) => {
  const units = [...pattern];
  if (units.length === 1) {
    return [units[0] === "." ? dot(50, 48, 12) : dash(50, 48, 0, 42, 9)];
  }

  const startY = 20;
  const endY = 84;
  const step = (endY - startY) / Math.max(units.length - 1, 1);

  return units.map((unit, index) => {
    const y = startY + index * step;
    const x = index % 2 === 0 ? 42 : 58;
    return unit === "." ? dot(x, y, 10) : dash(x, y, index % 2 === 0 ? 18 : -18, 34, 8);
  });
};

const getLayoutForCharacter = (char) => LETTER_LAYOUTS[char] || createGenericLayout(MORSE_TABLE[char]);
const parsePercent = (value) => Number(String(value).replace("%", ""));

const buildSvgSignals = (pattern, y = 193) => {
  const units = [...pattern].map((symbol) => ({
    symbol,
    width: symbol === "." ? 14 : 46,
  }));
  const gap = 10;
  const totalWidth =
    units.reduce((sum, unit) => sum + unit.width, 0) + gap * Math.max(units.length - 1, 0);
  let currentX = (180 - totalWidth) / 2;

  return units
    .map((unit, index) => {
      const x = currentX;
      currentX += unit.width + gap;

      if (unit.symbol === ".") {
        return `
          <circle
            class="svg-signal dot"
            data-unit-index="${index}"
            cx="${x + unit.width / 2}"
            cy="${y + 6}"
            r="7"
          ></circle>
        `;
      }

      return `
        <rect
          class="svg-signal dash"
          data-unit-index="${index}"
          x="${x}"
          y="${y}"
          width="${unit.width}"
          height="12"
          rx="6"
        ></rect>
      `;
    })
    .join("");
};

const svgBodyPath = (d, width = 26, linecap = "square", linejoin = "round") => `
  <path
    class="svg-body"
    d="${d}"
    fill="none"
    stroke-width="${width}"
    stroke-linecap="${linecap}"
    stroke-linejoin="${linejoin}"
  ></path>
`;

const svgBodyFillPath = (d) => `<path class="svg-body-fill" d="${d}"></path>`;

const svgBodyEllipse = (cx, cy, rx, ry, width = 26) => `
  <ellipse
    class="svg-body svg-body--round"
    cx="${cx}"
    cy="${cy}"
    rx="${rx}"
    ry="${ry}"
    fill="none"
    stroke-width="${width}"
  ></ellipse>
`;

const svgCuePath = (d, index, width = 12, linecap = "square", linejoin = "round") => `
  <path
    class="svg-cue svg-cue--stroke"
    data-unit-index="${index}"
    d="${d}"
    fill="none"
    stroke-width="${width}"
    stroke-linecap="${linecap}"
    stroke-linejoin="${linejoin}"
  ></path>
`;

const svgCueCircle = (cx, cy, r, index) => `
  <circle class="svg-cue svg-cue--dot" data-unit-index="${index}" cx="${cx}" cy="${cy}" r="${r}"></circle>
`;

const svgCueFillPath = (d, index) => `
  <path class="svg-cue svg-cue--fill" data-unit-index="${index}" d="${d}" stroke="none"></path>
`;

const wrapSvgGlyph = (char, pattern, bodyMarkup, cueMarkup) => `
  <svg class="glyph-svg glyph-svg--${char.toLowerCase()}" viewBox="0 0 180 220" aria-hidden="true">
    <g class="glyph-body-layer">${bodyMarkup}</g>
    <g class="glyph-cue-layer">${cueMarkup}</g>
    <g class="glyph-signal-layer">${buildSvgSignals(pattern)}</g>
  </svg>
`;

const buildSvgCuesFromLayout = (char) => {
  const layout = getLayoutForCharacter(char);
  const originX = 24;
  const originY = 8;
  const width = 126;
  const height = 156;

  return layout
    .map((cue, index) => {
      const centerX = originX + (cue.x / 100) * width;
      const centerY = originY + (cue.y / 100) * height;
      const cueWidth = (parsePercent(cue.w) / 100) * width;
      const cueHeight = (parsePercent(cue.h) / 100) * height;
      const rotation = Number(String(cue.rotate).replace("deg", "")) || 0;

      if (cue.type === "dot") {
        return svgCueCircle(centerX, centerY, Math.min(cueWidth, cueHeight) / 2, index);
      }

      return `
        <rect
          class="svg-cue svg-cue--dash"
          data-unit-index="${index}"
          x="${centerX - cueWidth / 2}"
          y="${centerY - cueHeight / 2}"
          width="${cueWidth}"
          height="${cueHeight}"
          rx="${cueHeight / 2}"
          transform="rotate(${rotation} ${centerX} ${centerY})"
        ></rect>
      `;
    })
    .join("");
};

const wrapLayoutCueGlyph = (char, pattern, bodyMarkup) =>
  wrapSvgGlyph(char, pattern, bodyMarkup, buildSvgCuesFromLayout(char));

const HAND_TUNED_GLYPHS = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));

const renderSystemFontSvg = (char, pattern, compact = false, inline = false) => `
  <div class="glyph-stage has-svg has-font-svg${compact ? " is-compact" : ""}${inline ? " is-inline" : ""}">
    <svg class="glyph-svg glyph-svg--font" viewBox="0 0 180 220" aria-hidden="true">
      <text class="svg-letter-text" x="90" y="104">${char}</text>
      <g class="glyph-cue-layer">${buildSvgCuesFromLayout(char)}</g>
      <g class="glyph-signal-layer">${buildSvgSignals(pattern)}</g>
    </svg>
  </div>
`;

const SVG_GLYPHS = {
  A: (pattern) =>
    wrapSvgGlyph(
      "A",
      pattern,
      `
        ${svgBodyPath("M45 174 L88 40 L131 174", 24, "square", "miter")}
        ${svgBodyPath("M63 116 H111", 24, "square", "miter")}
      `,
      `
        ${svgCueCircle(87, 32, 7, 0)}
        ${svgCuePath("M69 116 H106", 1, 12, "square", "miter")}
      `,
    ),
  B: (pattern) =>
    wrapSvgGlyph(
      "B",
      pattern,
      `
        ${svgBodyPath("M52 28 V176", 24, "square", "round")}
        ${svgBodyPath("M52 46 H90 C118 46 121 84 92 89 H52", 24, "square", "round")}
        ${svgBodyPath("M52 108 H90 C124 108 124 162 90 162 H52", 24, "square", "round")}
      `,
      `
        ${svgCuePath("M67 44 V157", 0, 10, "square", "round")}
        ${svgCueCircle(100, 35, 7, 1)}
        ${svgCueCircle(98, 97, 7, 2)}
        ${svgCueCircle(96, 160, 7, 3)}
      `,
    ),
  C: (pattern) =>
    wrapSvgGlyph(
      "C",
      pattern,
      `${svgBodyPath("M118 50 C102 38 74 38 57 51 C43 65 43 143 57 156 C74 168 102 168 118 156", 24, "round", "round")}`,
      `
        ${svgCuePath("M64 48 C78 41 95 41 108 47", 0, 8, "butt", "round")}
        ${svgCuePath("M56 69 C49 90 49 122 62 145", 1, 8, "butt", "round")}
        ${svgCueCircle(111, 44, 6.5, 2)}
        ${svgCueCircle(107, 153, 6.5, 3)}
      `,
    ),
  D: (pattern) =>
    wrapLayoutCueGlyph(
      "D",
      pattern,
      `
        ${svgBodyPath("M54 42 V166", 24, "square", "round")}
        ${svgBodyPath("M54 42 H82 C113 42 126 70 126 104 C126 138 113 166 82 166 H54", 24, "square", "round")}
      `,
    ),
  E: (pattern) =>
    wrapSvgGlyph(
      "E",
      pattern,
      `
        ${svgBodyPath("M54 42 V166", 24, "square", "miter")}
        ${svgBodyPath("M54 42 H126", 24, "square", "miter")}
        ${svgBodyPath("M54 104 H112", 24, "square", "miter")}
        ${svgBodyPath("M54 166 H126", 24, "square", "miter")}
      `,
      `
        ${svgCueCircle(90, 104, 7, 0)}
      `,
    ),
  F: (pattern) =>
    wrapLayoutCueGlyph(
      "F",
      pattern,
      `
        ${svgBodyPath("M54 42 V166", 24, "square", "miter")}
        ${svgBodyPath("M54 42 H126", 24, "square", "miter")}
        ${svgBodyPath("M54 104 H110", 24, "square", "miter")}
      `,
    ),
  G: (pattern) =>
    wrapSvgGlyph(
      "G",
      pattern,
      `
        ${svgBodyPath("M118 50 C103 38 73 38 57 53 C43 68 43 142 58 156 C73 169 103 168 119 156", 24, "round", "round")}
        ${svgBodyPath("M92 108 H124", 24, "square", "round")}
      `,
      `
        ${svgCuePath("M77 45 C69 48 63 54 61 63", 0, 8, "butt", "round")}
        ${svgCuePath("M57 69 C50 89 50 119 62 144", 1, 8, "butt", "round")}
        ${svgCueCircle(108, 104, 5.5, 2)}
      `,
    ),
  H: (pattern) =>
    wrapLayoutCueGlyph(
      "H",
      pattern,
      `
        ${svgBodyPath("M50 42 V166", 24, "square", "miter")}
        ${svgBodyPath("M128 42 V166", 24, "square", "miter")}
        ${svgBodyPath("M50 104 H128", 24, "square", "miter")}
      `,
    ),
  I: (pattern) =>
    wrapLayoutCueGlyph(
      "I",
      pattern,
      `
        ${svgBodyPath("M90 42 V166", 24, "square", "miter")}
      `,
    ),
  J: (pattern) =>
    wrapLayoutCueGlyph(
      "J",
      pattern,
      `
        ${svgBodyPath("M106 42 V136 C106 159 94 169 76 169 C67 169 60 166 54 160", 24, "square", "round")}
      `,
    ),
  K: (pattern) =>
    wrapLayoutCueGlyph(
      "K",
      pattern,
      `
        ${svgBodyPath("M52 42 V166", 24, "square", "miter")}
        ${svgBodyPath("M64 104 L126 42", 24, "square", "miter")}
        ${svgBodyPath("M64 104 L130 166", 24, "square", "miter")}
      `,
    ),
  L: (pattern) =>
    wrapLayoutCueGlyph(
      "L",
      pattern,
      `
        ${svgBodyPath("M54 42 V166 H126", 24, "square", "miter")}
      `,
    ),
  M: (pattern) =>
    wrapLayoutCueGlyph(
      "M",
      pattern,
      `
        ${svgBodyPath("M46 166 V42 L90 98 L134 42 V166", 24, "square", "miter")}
      `,
    ),
  N: (pattern) =>
    wrapLayoutCueGlyph(
      "N",
      pattern,
      `
        ${svgBodyPath("M50 166 V42 L126 166 V42", 24, "square", "miter")}
      `,
    ),
  O: (pattern) =>
    wrapSvgGlyph(
      "O",
      pattern,
      `
        ${svgBodyEllipse(90, 103, 40, 67, 24)}
      `,
      `
        ${svgCuePath("M66 43 C82 38 101 38 114 43", 0, 8, "butt", "round")}
        ${svgCuePath("M58 60 C50 82 50 124 62 147", 1, 8, "butt", "round")}
        ${svgCuePath("M118 59 C125 83 124 124 114 148", 2, 8, "butt", "round")}
      `,
    ),
  P: (pattern) =>
    wrapSvgGlyph(
      "P",
      pattern,
      `
        ${svgBodyPath("M54 166 V42", 24, "square", "round")}
        ${svgBodyPath("M54 42 H88 C118 42 122 92 88 100 H54", 24, "square", "round")}
      `,
      `
        ${svgCueCircle(50, 72, 6.5, 0)}
        ${svgCuePath("M78 45 H108", 1, 10, "square", "round")}
        ${svgCuePath("M77 101 H88", 2, 9, "square", "round")}
        ${svgCueCircle(111, 84, 6.5, 3)}
      `,
    ),
  Q: (pattern) =>
    wrapSvgGlyph(
      "Q",
      pattern,
      `
        ${svgBodyEllipse(88, 99, 40, 64, 24)}
        ${svgBodyPath("M92 158 Q110 176 130 183", 24, "round", "round")}
      `,
      `
        ${svgCuePath("M58 58 C50 81 50 123 61 146", 0, 8, "butt", "round")}
        ${svgCuePath("M78 40 C94 36 112 39 121 53 C126 69 125 116 116 145", 1, 8, "butt", "round")}
        ${svgCueCircle(84, 154, 7, 2)}
        ${svgCuePath("M103 174 Q114 179 124 181", 3, 8, "butt", "round")}
      `,
    ),
  R: (pattern) =>
    wrapSvgGlyph(
      "R",
      pattern,
      `
        ${svgBodyPath("M54 166 V42", 24, "square", "round")}
        ${svgBodyPath("M54 42 H88 C118 42 122 92 88 100 H54", 24, "square", "round")}
        ${svgBodyPath("M88 100 L128 166", 24, "square", "miter")}
      `,
      `
        ${svgCueCircle(53, 156, 7, 0)}
        ${svgCueFillPath(
          "M82 44 C101 44 112 56 112 76 C112 88 106 99 95 106 L91 99 C99 94 104 86 104 76 C104 61 96 52 82 52 Z",
          1,
        )}
        ${svgCueCircle(108, 154, 7, 2)}
      `,
    ),
  S: (pattern) =>
    wrapSvgGlyph(
      "S",
      pattern,
      `
        ${svgBodyPath(
          "M111 48 C99 38 76 38 60 48 C46 57 46 77 60 87 C74 97 95 98 106 110 C119 123 117 142 102 154 C87 166 63 166 48 156 C36 148 35 132 46 121",
          24,
          "round",
          "round",
        )}
      `,
      `
        ${svgCueCircle(88, 44, 7, 0)}
        ${svgCueCircle(78, 97, 7, 1)}
        ${svgCueCircle(68, 149, 7, 2)}
      `,
    ),
  T: (pattern) =>
    wrapLayoutCueGlyph(
      "T",
      pattern,
      `
        ${svgBodyPath("M44 44 H132", 24, "square", "miter")}
        ${svgBodyPath("M88 44 V166", 24, "square", "miter")}
      `,
    ),
  U: (pattern) =>
    wrapLayoutCueGlyph(
      "U",
      pattern,
      `
        ${svgBodyPath("M50 42 V132 C50 154 65 168 88 168 C111 168 126 154 126 132 V42", 24, "square", "round")}
      `,
    ),
  V: (pattern) =>
    wrapLayoutCueGlyph(
      "V",
      pattern,
      `
        ${svgBodyPath("M48 42 L88 166 L128 42", 24, "square", "miter")}
      `,
    ),
  W: (pattern) =>
    wrapLayoutCueGlyph(
      "W",
      pattern,
      `
        ${svgBodyPath("M42 42 L64 166 L88 96 L112 166 L134 42", 24, "square", "miter")}
      `,
    ),
  X: (pattern) =>
    wrapLayoutCueGlyph(
      "X",
      pattern,
      `
        ${svgBodyPath("M48 42 L128 166", 24, "square", "miter")}
        ${svgBodyPath("M128 42 L48 166", 24, "square", "miter")}
      `,
    ),
  Y: (pattern) =>
    wrapLayoutCueGlyph(
      "Y",
      pattern,
      `
        ${svgBodyPath("M48 42 L88 98 L128 42", 24, "square", "miter")}
        ${svgBodyPath("M88 98 V166", 24, "square", "miter")}
      `,
    ),
  Z: (pattern) =>
    wrapSvgGlyph(
      "Z",
      pattern,
      `
        ${svgBodyFillPath("M44 33 H126 V57 H44 Z")}
        ${svgBodyFillPath("M116 45 L134 54 L64 179 L46 170 Z")}
        ${svgBodyFillPath("M54 155 H132 V179 H54 Z")}
      `,
      `
        ${svgCuePath("M54 45 H118", 0, 12, "square", "bevel")}
        ${svgCuePath("M64 167 H122", 1, 12, "square", "bevel")}
        ${svgCueCircle(95, 90, 7, 2)}
        ${svgCueCircle(76, 126, 7, 3)}
      `,
    ),
};

const renderCue = (cue, index) => `
  <span
    class="cue"
    data-unit-index="${index}"
    style="--x:${cue.x}%; --y:${cue.y}%; --w:${cue.w}; --h:${cue.h}; --rot:${cue.rotate};"
  ></span>
`;

const renderSignalUnit = (unit, index) => `
  <span class="signal-unit ${unit === "." ? "dot" : "dash"}" data-unit-index="${index}"></span>
`;

const renderGlyphStage = (char, pattern, options = {}) => {
  const { compact = false, inline = false } = options;
  const stageClass = `${compact ? " is-compact" : ""}${inline ? " is-inline" : ""}`;

  if (HAND_TUNED_GLYPHS.has(char) && SVG_GLYPHS[char]) {
    return `
      <div class="glyph-stage has-svg${stageClass}">
        ${SVG_GLYPHS[char](pattern)}
      </div>
    `;
  }

  if (/^[A-Z]$/.test(char)) {
    return renderSystemFontSvg(char, pattern, compact, inline);
  }

  const layout = getLayoutForCharacter(char);
  return `
    <div class="glyph-stage${stageClass}">
      <div class="glyph-letter">${char}</div>
      <div class="cue-layer">
        ${layout.map(renderCue).join("")}
      </div>
      <div class="signal-row">
        ${[...pattern].map(renderSignalUnit).join("")}
      </div>
    </div>
  `;
};

const renderAlphabetGrid = () => {
  alphabetGrid.innerHTML = ALPHABET.map((char) => {
    const pattern = MORSE_TABLE[char];
    return `
      <button class="alphabet-card" type="button" data-char="${char}" data-pattern="${pattern}">
        <div class="card-head">
          <span class="card-letter">${char}</span>
          <span class="card-code">${pattern}</span>
        </div>
        ${renderGlyphStage(char, pattern)}
        <p class="card-hint">${t("library.cardHint", { char })}</p>
      </button>
    `;
  }).join("");
};

const tokenizeMessage = (rawText) => {
  const normalized = rawText.toUpperCase();
  const tokens = [];
  const unsupported = new Set();

  for (const char of normalized) {
    if (char === " " || char === "\n" || char === "\t") {
      if (tokens[tokens.length - 1]?.type !== "space" && tokens.length > 0) {
        tokens.push({ type: "space" });
      }
      continue;
    }

    const pattern = MORSE_TABLE[char];
    if (pattern) {
      tokens.push({ type: "char", char, pattern });
    } else {
      unsupported.add(char);
    }
  }

  return { tokens, unsupported: [...unsupported] };
};

const renderMessage = () => {
  const { tokens, unsupported } = tokenizeMessage(messageInput.value);

  if (tokens.length === 0) {
    encodedOutput.innerHTML = `
      <div class="message-empty">
        ${t("dynamic.empty")}
      </div>
    `;
    unsupportedLine.textContent = unsupported.length
      ? t("dynamic.unsupportedLong", { chars: unsupported.join(" ") })
      : "";
    setStatus("");
    return tokens;
  }

  encodedOutput.innerHTML = tokens
    .map((token, index) => {
      if (token.type === "space") {
        return `
          <div class="token-pause" data-index="${index}" aria-label="${t("dynamic.pauseAria")}">
            <span class="pause-bars" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="pause-gap" aria-hidden="true"></span>
          </div>
        `;
      }

      return `
        <article
          class="message-token"
          data-char="${token.char}"
          data-pattern="${token.pattern}"
          data-index="${index}"
        >
          <div class="token-toolbar">
            <button
              class="token-audio"
              type="button"
              aria-label="${t("dynamic.playToken", { char: token.char, pattern: token.pattern })}"
              title="${t("dynamic.playToken", { char: token.char, pattern: token.pattern })}"
            >
              ${speakerIcon}
            </button>
            <span class="token-letter">${token.char}</span>
          </div>
          ${renderGlyphStage(token.char, token.pattern, { compact: true, inline: true })}
        </article>
      `;
    })
    .join("");

  unsupportedLine.textContent = unsupported.length
    ? t("dynamic.unsupportedShort", { chars: unsupported.join(" ") })
    : "";

  return tokens;
};

const clearHighlights = () => {
  document.querySelectorAll(".is-current, .is-hot").forEach((element) => {
    element.classList.remove("is-current", "is-hot");
  });
};

const beep = async (symbol, duration, nonce) => {
  const context = await getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const lengthSeconds = duration / 1000;

  oscillator.type = "sine";
  oscillator.frequency.value = symbol === "." ? 640 : 520;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(lengthSeconds, 0.02));

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + lengthSeconds + 0.03);
  activeOscillators.add(oscillator);
  oscillator.onended = () => {
    activeOscillators.delete(oscillator);
  };

  await sleep(duration);
  return nonce === playbackNonce;
};

const highlightUnit = (container, index) => {
  container
    .querySelectorAll(`[data-unit-index="${index}"]`)
    .forEach((element) => element.classList.add("is-hot"));
};

const unhighlightUnit = (container, index) => {
  container
    .querySelectorAll(`[data-unit-index="${index}"]`)
    .forEach((element) => element.classList.remove("is-hot"));
};

const playPatternOnCard = async (container, pattern, nonce) => {
  container.classList.add("is-current");

  for (let index = 0; index < pattern.length; index += 1) {
    if (nonce !== playbackNonce) {
      return false;
    }

    const symbol = pattern[index];
    const duration = symbol === "." ? getDotDuration() : getDotDuration() * 3;
    highlightUnit(container, index);
    const stillActive = await beep(symbol, duration, nonce);
    unhighlightUnit(container, index);

    if (!stillActive || nonce !== playbackNonce) {
      return false;
    }

    if (index < pattern.length - 1) {
      await sleep(getDotDuration());
    }
  }

  container.classList.remove("is-current");
  return true;
};

const playSingleCard = async (card, sourceLabel) => {
  const char = card.dataset.char;
  const pattern = card.dataset.pattern;
  if (!char || !pattern) {
    return;
  }

  cancelPlayback();
  const nonce = playbackNonce;
  setStatus(
    t("status.playSingle", {
      source: t(`status.source.${sourceLabel}`),
      char,
      pattern,
    }),
  );
  const finished = await playPatternOnCard(card, pattern, nonce);

  if (finished && nonce === playbackNonce) {
    setStatus(
      t("status.playDone", {
        char,
        pattern,
      }),
    );
    card.classList.remove("is-current");
  }
};

const playMessage = async () => {
  cancelPlayback();
  const tokens = renderMessage();

  if (!tokens.some((token) => token.type === "char")) {
    setStatus(t("status.noPlayable"));
    return;
  }

  const nonce = playbackNonce;
  const tokenElements = [...encodedOutput.children];
  setStatus(t("status.messageStart"));

  for (let index = 0; index < tokens.length; index += 1) {
    if (nonce !== playbackNonce) {
      return;
    }

    const token = tokens[index];
    const element = tokenElements[index];

    if (token.type === "space") {
      element.classList.add("is-current");
      await sleep(getDotDuration() * 7);
      element.classList.remove("is-current");
      continue;
    }

    setStatus(
      t("status.playingIndex", {
        index: index + 1,
        char: token.char,
        pattern: token.pattern,
      }),
    );
    const finished = await playPatternOnCard(element, token.pattern, nonce);
    if (!finished || nonce !== playbackNonce) {
      return;
    }

    const nextToken = tokens[index + 1];
    if (nextToken?.type === "char") {
      await sleep(getDotDuration() * 3);
    }
  }

  if (nonce === playbackNonce) {
    setStatus(t("status.messageDone"));
  }
};

const storedDotDuration = Number(readStoredSetting(STORAGE_KEYS.dotDuration));
if (Number.isFinite(storedDotDuration)) {
  const min = Number(dotDurationInput.min);
  const max = Number(dotDurationInput.max);
  if (storedDotDuration >= min && storedDotDuration <= max) {
    dotDurationInput.value = String(storedDotDuration);
  }
}

applyTheme(currentTheme, { persist: false });
applyTranslations();
languageSelect.value = currentLanguage;
renderAlphabetGrid();
renderMessage();
dotDurationValue.textContent = `${getDotDuration()} ms`;

alphabetGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".alphabet-card");
  if (!card) {
    return;
  }
  playSingleCard(card, "alphabet");
});

encodedOutput.addEventListener("click", (event) => {
  const trigger = event.target.closest(".token-audio");
  if (!trigger) {
    return;
  }
  const card = trigger.closest(".message-token");
  playSingleCard(card, "encoded");
});

const autoResizeMessageInput = () => {
  messageInput.style.height = "auto";
  messageInput.style.height = `${messageInput.scrollHeight}px`;
};

messageInput.addEventListener("input", () => {
  autoResizeMessageInput();
  cancelPlayback();
  renderMessage();
  setStatus("");
});

dotDurationInput.addEventListener("input", () => {
  dotDurationValue.textContent = `${getDotDuration()} ms`;
  writeStoredSetting(STORAGE_KEYS.dotDuration, String(getDotDuration()));
});

playMessageButton.addEventListener("click", () => {
  playMessage();
});

stopButton.addEventListener("click", () => {
  cancelPlayback();
  setStatus(t("status.stopped"));
});

sampleButton.addEventListener("click", () => {
  cancelPlayback();
  messageInput.value = "SOS WE NEED HELP";
  autoResizeMessageInput();
  renderMessage();
  setStatus("");
});

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
});

document.addEventListener("click", (event) => {
  if (settingsPopover.open && !settingsPopover.contains(event.target)) {
    settingsPopover.open = false;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settingsPopover.open) {
    settingsPopover.open = false;
  }
});

autoResizeMessageInput();
