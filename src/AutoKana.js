/**
 * @param {string} str
 * @param {string} chars
 * @returns {string}
 */
function ltrim(str, chars) {
  // eslint-disable-next-line no-param-reassign
  chars = !chars ? ' \\s\u00A0' : chars.replace(/([[\]().?/*{}+$^:])/g, '$1');

  const re = new RegExp(`^[${chars}]+`, 'g');
  return str.replace(re, '');
}

/**
 * @param {Number} char
 * @returns {boolean}
 */
function isHiragana(char) {
  const c = Number(char);
  return (c >= 12353 && c <= 12435) || c === 12445 || c === 12446;
}

/**
 * @param {Number} char
 * @returns {boolean}
 */
function isHiraKata(char) {
  const c = Number(char);
  return (
    (c >= 12353 && c <= 12435) ||
    (c >= 12449 && c <= 12534) ||
    (c >= 12443 && c <= 12446) ||
    (c >= 12288 && c <= 12290) ||
    c === 12540
  );
}

function isString(val) {
  return typeof val === 'string' || val instanceof String;
}

function ensureElement(idOrElement) {
  if (isString(idOrElement)) {
    return document.getElementById(ltrim(idOrElement, '#'));
  }
  if (idOrElement instanceof Element) {
    return idOrElement;
  }
  return null;
}

function katakanaFromCharCode(c) {
  return String.fromCharCode(c + 96);
}

function kanaFullToHalf(str) {
  const map = {
    ア: 'ｱ',
    イ: 'ｲ',
    ウ: 'ｳ',
    エ: 'ｴ',
    オ: 'ｵ',
    カ: 'ｶ',
    キ: 'ｷ',
    ク: 'ｸ',
    ケ: 'ｹ',
    コ: 'ｺ',
    サ: 'ｻ',
    シ: 'ｼ',
    ス: 'ｽ',
    セ: 'ｾ',
    ソ: 'ｿ',
    タ: 'ﾀ',
    チ: 'ﾁ',
    ツ: 'ﾂ',
    テ: 'ﾃ',
    ト: 'ﾄ',
    ナ: 'ﾅ',
    ニ: 'ﾆ',
    ヌ: 'ﾇ',
    ネ: 'ﾈ',
    ノ: 'ﾉ',
    ハ: 'ﾊ',
    ヒ: 'ﾋ',
    フ: 'ﾌ',
    ヘ: 'ﾍ',
    ホ: 'ﾎ',
    マ: 'ﾏ',
    ミ: 'ﾐ',
    ム: 'ﾑ',
    メ: 'ﾒ',
    モ: 'ﾓ',
    ヤ: 'ﾔ',
    ユ: 'ﾕ',
    ヨ: 'ﾖ',
    ラ: 'ﾗ',
    リ: 'ﾘ',
    ル: 'ﾙ',
    レ: 'ﾚ',
    ロ: 'ﾛ',
    ワ: 'ﾜ',
    ヲ: 'ｦ',
    ン: 'ﾝ',
    ァ: 'ｧ',
    ィ: 'ｨ',
    ゥ: 'ｩ',
    ェ: 'ｪ',
    ォ: 'ｫ',
    ッ: 'ｯ',
    ャ: 'ｬ',
    ュ: 'ｭ',
    ョ: 'ｮ',
    ガ: 'ｶﾞ',
    ギ: 'ｷﾞ',
    グ: 'ｸﾞ',
    ゲ: 'ｹﾞ',
    ゴ: 'ｺﾞ',
    ザ: 'ｻﾞ',
    ジ: 'ｼﾞ',
    ズ: 'ｽﾞ',
    ゼ: 'ｾﾞ',
    ゾ: 'ｿﾞ',
    ダ: 'ﾀﾞ',
    ヂ: 'ﾁﾞ',
    ヅ: 'ﾂﾞ',
    デ: 'ﾃﾞ',
    ド: 'ﾄﾞ',
    バ: 'ﾊﾞ',
    ビ: 'ﾋﾞ',
    ブ: 'ﾌﾞ',
    ベ: 'ﾍﾞ',
    ボ: 'ﾎﾞ',
    パ: 'ﾊﾟ',
    ピ: 'ﾋﾟ',
    プ: 'ﾌﾟ',
    ペ: 'ﾍﾟ',
    ポ: 'ﾎﾟ',
    ヴ: 'ｳﾞ',
    ヷ: 'ﾜﾞ',
    ヺ: 'ｦﾞ',
    '。': '｡',
    '、': '､',
    ー: 'ｰ',
  };
  const reg = new RegExp(`(${Object.keys(map).join('|')})`, 'g');
  return str
    .replace(reg, match => map[match])
    .replace(/゛/g, 'ﾞ')
    .replace(/゜/g, 'ﾟ')
    .replace(/\s/g, ' ');
}

// eslint-disable-next-line no-irregular-whitespace
const kanaExtractionPattern = /[^ 　ぁあ-んーヴ]/g;
const kanaCompactingPattern = /[ぁぃぅぇぉっゃゅょ]/g;

export default class AutoKana {
  /**
   * @param {string} name
   * @param {string} furigana
   * @param {object} option
   */
  constructor(name, furigana = '', option = {}) {
    this.isActive = true;
    this.timer = null;
    this.initializeValues();

    this.option = Object.assign(
      {
        katakana: false,
        half: false,
        debug: false,
        checkInterval: 30, // milli seconds
      },
      option,
    );

    const elName = ensureElement(name);
    const elFurigana = ensureElement(furigana);

    if (!elName) throw new Error(`Element not found: ${name}`);

    this.elName = elName;
    this.registerEvents(this.elName);

    // furigana is optional
    if (elFurigana) {
      this.elFurigana = elFurigana;
    }
  }

  /**
   * Get kana.
   * @returns {string|*}
   */
  getFurigana() {
    return this.furigana;
  }

  /**
   * Start watching.
   */
  start() {
    this.isActive = true;
  }

  /**
   * Stop watching.
   */
  stop() {
    this.isActive = false;
  }

  /**
   * Toggle watch status.
   * @param event
   */
  toggle(event) {
    if (event) {
      const el = Event.element(event);
      if (el) {
        this.isActive = el.checked;
      }
    } else {
      this.isActive = !this.isActive;
    }
  }

  /**
   * @private
   */
  initializeValues() {
    this.baseKana = '';
    this.furigana = '';
    this.isConverting = false;
    this.ignoreString = '';
    this.input = '';
    this.values = [];
  }

  /**
   * Register events to element of name.
   * @param {HTMLElement} elName
   * @private
   */
  registerEvents(elName) {
    elName.addEventListener('blur', () => {
      this.debug('blur');
      this.clearInterval();
    });
    elName.addEventListener('focus', () => {
      this.debug('focus');
      this.onInput();
      this.setInterval();
    });
    elName.addEventListener('keydown', () => {
      this.debug('keydown');
      if (this.isConverting) {
        this.onInput();
      }
    });
  }

  /**
   * @private
   */
  clearInterval() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * @private
   * @param src
   * @returns {*}
   */
  toKatakana(src) {
    if (this.option.katakana) {
      let c;
      let str = '';
      if (this.option.half) {
        for (let i = 0; i < src.length; i += 1) {
          c = src.charCodeAt(i);
          if (isHiraKata(c)) {
            let kana = '';
            if (isHiragana(c)) {
              kana = katakanaFromCharCode(c);
            } else {
              kana = String.fromCharCode(c);
            }
            str += kanaFullToHalf(kana);
          } else {
            str += src.charAt(i);
          }
        }
      } else {
        for (let i = 0; i < src.length; i += 1) {
          c = src.charCodeAt(i);
          if (isHiragana(c)) {
            str += katakanaFromCharCode(c);
          } else {
            str += src.charAt(i);
          }
        }
      }
      return str;
    }
    return src.replace('ヴ', 'ゔ');
  }

  /**
   * @private
   * @param newValues
   */
  setFurigana(newValues) {
    if (this.isConverting) return;

    if (newValues) {
      this.values = newValues;
    }
    if (this.isActive) {
      this.furigana = this.toKatakana(this.baseKana + this.values.join(''));
      if (this.elFurigana) {
        this.elFurigana.value = this.furigana;
      }
    }
  }

  /**
   * @private
   * @param newInput
   * @returns {*}
   */
  removeString(newInput) {
    if (newInput.indexOf(this.ignoreString) !== -1) {
      return String(newInput).replace(this.ignoreString, '');
    }
    const ignoreArray = this.ignoreString.split('');
    const inputArray = newInput.split('');
    for (let i = 0; i < ignoreArray.length; i += 1) {
      if (ignoreArray[i] === inputArray[i]) {
        inputArray[i] = '';
      }
    }
    return inputArray.join('');
  }

  /**
   * @private
   * @param newValues
   */
  checkConvert(newValues) {
    if (this.isConverting) return;

    if (Math.abs(this.values.length - newValues.length) > 1) {
      const tmpValues = newValues
        .join('')
        .replace(kanaCompactingPattern, '')
        .split('');
      if (Math.abs(this.values.length - tmpValues.length) > 1) {
        this.onConvert();
      }
    } else if (
      this.values.length === this.input.length &&
      this.values.join('') !== this.input
    ) {
      if (this.input.match(kanaExtractionPattern)) {
        this.onConvert();
      }
    }
  }

  /**
   * Checks form value and set furigana.
   * @private
   */
  checkValue() {
    let newInput;
    newInput = this.elName.value;

    if (newInput === '') {
      this.initializeValues();
      this.setFurigana();
    } else {
      newInput = this.removeString(newInput);

      if (this.input === newInput) return; // no changes

      this.input = newInput;

      if (this.isConverting) return;

      const newValues = newInput.replace(kanaExtractionPattern, '').split('');
      this.checkConvert(newValues);
      this.setFurigana(newValues);
    }

    this.debug(this.input);
  }

  /**
   * @private
   */
  setInterval() {
    this.timer = setInterval(
      this.checkValue.bind(this),
      this.option.checkInterval,
    );
  }

  /**
   * @private
   */
  onInput() {
    if (this.elFurigana) {
      this.baseKana = this.elFurigana.value;
    }
    this.isConverting = false;
    this.ignoreString = this.elName.value;
  }

  /**
   * @private
   */
  onConvert() {
    this.baseKana = this.baseKana + this.values.join('');
    this.isConverting = true;
    this.values = [];
  }

  /**
   * @private
   * @param args
   */
  debug(...args) {
    if (this.option.debug) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  }
}
