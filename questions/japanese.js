/* Japanese for beginners: hiragana, numbers, colors, animals, family, food,
   greetings, then a little katakana. Each prompt shows the kana with romaji
   (Hepburn) in parentheses. speakLang ja-JP reads the kana aloud when the
   device has a Japanese voice. */
(function (root) {
  function item(id, level, prompt, answer, wrongs, explain, speak) {
    return {
      id: id,
      level: level,
      prompt: prompt,
      choices: [answer].concat(wrongs),
      answer: answer,
      explain: explain,
      speak: speak || prompt,
      speakLang: speak ? "ja-JP" : "en-US"
    };
  }

  var items = [
    /* Level 1: hiragana vowels */
    item("j1a", 1, "Which sound does あ make?", "a", ["i", "u", "o"], "あ is \"a\", the first hiragana.", "あ"),
    item("j1b", 1, "Which sound does い make?", "i", ["a", "e", "u"], "い is \"i\", like the ee in see.", "い"),
    item("j1c", 1, "Which sound does う make?", "u", ["o", "a", "i"], "う is \"u\", like the oo in moon.", "う"),
    item("j1d", 1, "Which sound does え make?", "e", ["i", "o", "a"], "え is \"e\", like the e in pet.", "え"),
    item("j1e", 1, "Which sound does お make?", "o", ["a", "u", "e"], "お is \"o\", like the o in go.", "お"),
    item("j1f", 1, "Which hiragana says \"a\"?", "あ", ["お", "い", "え"], "あ (a) starts the hiragana chart: あ い う え お.", "あ"),

    /* Level 2: the first sound of each row */
    item("j2a", 2, "Which sound does か make?", "ka", ["sa", "ta", "na"], "か is \"ka\", the start of the K row.", "か"),
    item("j2b", 2, "Which sound does さ make?", "sa", ["ka", "ma", "ha"], "さ is \"sa\", the start of the S row.", "さ"),
    item("j2c", 2, "Which sound does た make?", "ta", ["na", "ka", "sa"], "た is \"ta\", the start of the T row.", "た"),
    item("j2d", 2, "Which sound does な make?", "na", ["ta", "ma", "ha"], "な is \"na\", the start of the N row.", "な"),
    item("j2e", 2, "Which sound does は make?", "ha", ["ka", "na", "ma"], "は is \"ha\", the start of the H row.", "は"),
    item("j2f", 2, "Which sound does ま make?", "ma", ["ha", "sa", "na"], "ま is \"ma\", the start of the M row.", "ま"),

    /* Level 3: numbers 1-6 */
    item("j3a", 3, "What number is いち (ichi)?", "1", ["2", "3", "5"], "いち (ichi) is one.", "いち"),
    item("j3b", 3, "What number is に (ni)?", "2", ["1", "4", "6"], "に (ni) is two.", "に"),
    item("j3c", 3, "What number is さん (san)?", "3", ["2", "5", "6"], "さん (san) is three.", "さん"),
    item("j3d", 3, "What number is よん (yon)?", "4", ["3", "5", "1"], "よん (yon) is four. It can also be said し (shi).", "よん"),
    item("j3e", 3, "What number is ご (go)?", "5", ["4", "6", "2"], "ご (go) is five.", "ご"),
    item("j3f", 3, "What number is ろく (roku)?", "6", ["5", "3", "1"], "ろく (roku) is six.", "ろく"),

    /* Level 4: numbers 7-10 and a bit more */
    item("j4a", 4, "What number is なな (nana)?", "7", ["8", "6", "9"], "なな (nana) is seven. It can also be said しち (shichi).", "なな"),
    item("j4b", 4, "What number is はち (hachi)?", "8", ["7", "9", "10"], "はち (hachi) is eight.", "はち"),
    item("j4c", 4, "What number is きゅう (kyuu)?", "9", ["8", "10", "6"], "きゅう (kyuu) is nine.", "きゅう"),
    item("j4d", 4, "What number is じゅう (juu)?", "10", ["9", "7", "100"], "じゅう (juu) is ten.", "じゅう"),
    item("j4e", 4, "What number is じゅういち (juuichi)?", "11", ["10", "12", "21"], "じゅう (10) + いち (1) = 11.", "じゅういち"),
    item("j4f", 4, "What number is にじゅう (nijuu)?", "20", ["12", "2", "200"], "に (2) × じゅう (10) = 20.", "にじゅう"),

    /* Level 5: colors */
    item("j5a", 5, "What color is あか (aka)?", "red", ["blue", "white", "black"], "あか (aka) means red.", "あか"),
    item("j5b", 5, "What color is あお (ao)?", "blue", ["red", "yellow", "green"], "あお (ao) means blue.", "あお"),
    item("j5c", 5, "What color is きいろ (kiiro)?", "yellow", ["green", "red", "white"], "きいろ (kiiro) means yellow.", "きいろ"),
    item("j5d", 5, "What color is みどり (midori)?", "green", ["blue", "yellow", "black"], "みどり (midori) means green.", "みどり"),
    item("j5e", 5, "What color is しろ (shiro)?", "white", ["black", "red", "blue"], "しろ (shiro) means white.", "しろ"),
    item("j5f", 5, "What color is くろ (kuro)?", "black", ["white", "green", "yellow"], "くろ (kuro) means black.", "くろ"),

    /* Level 6: animals */
    item("j6a", 6, "What does いぬ (inu) mean?", "dog", ["cat", "bird", "horse"], "いぬ (inu) means dog.", "いぬ"),
    item("j6b", 6, "What does ねこ (neko) mean?", "cat", ["dog", "fish", "rabbit"], "ねこ (neko) means cat.", "ねこ"),
    item("j6c", 6, "What does とり (tori) mean?", "bird", ["fish", "cat", "horse"], "とり (tori) means bird.", "とり"),
    item("j6d", 6, "What does さかな (sakana) mean?", "fish", ["bird", "dog", "rabbit"], "さかな (sakana) means fish.", "さかな"),
    item("j6e", 6, "What does うま (uma) mean?", "horse", ["cow", "dog", "cat"], "うま (uma) means horse.", "うま"),
    item("j6f", 6, "What does うさぎ (usagi) mean?", "rabbit", ["horse", "bird", "fish"], "うさぎ (usagi) means rabbit.", "うさぎ"),

    /* Level 7: family */
    item("j7a", 7, "What does おかあさん (okaasan) mean?", "mom", ["dad", "grandma", "older sister"], "おかあさん (okaasan) means mom.", "おかあさん"),
    item("j7b", 7, "What does おとうさん (otousan) mean?", "dad", ["mom", "grandpa", "older brother"], "おとうさん (otousan) means dad.", "おとうさん"),
    item("j7c", 7, "What does おばあさん (obaasan) mean?", "grandma", ["grandpa", "mom", "aunt"], "おばあさん (obaasan) means grandma. The long \"aa\" matters!", "おばあさん"),
    item("j7d", 7, "What does おじいさん (ojiisan) mean?", "grandpa", ["grandma", "dad", "uncle"], "おじいさん (ojiisan) means grandpa. The long \"ii\" matters!", "おじいさん"),
    item("j7e", 7, "What does おねえさん (oneesan) mean?", "older sister", ["older brother", "mom", "grandma"], "おねえさん (oneesan) means older sister.", "おねえさん"),
    item("j7f", 7, "What does おにいさん (oniisan) mean?", "older brother", ["older sister", "dad", "grandpa"], "おにいさん (oniisan) means older brother.", "おにいさん"),

    /* Level 8: food and drink */
    item("j8a", 8, "What does ごはん (gohan) mean?", "rice / a meal", ["water", "egg", "tea"], "ごはん (gohan) means cooked rice, and also a meal.", "ごはん"),
    item("j8b", 8, "What does みず (mizu) mean?", "water", ["tea", "milk", "juice"], "みず (mizu) means water.", "みず"),
    item("j8c", 8, "What does おちゃ (ocha) mean?", "tea", ["water", "milk", "rice / a meal"], "おちゃ (ocha) means tea, usually green tea.", "おちゃ"),
    item("j8d", 8, "What does たまご (tamago) mean?", "egg", ["apple", "fish", "rice / a meal"], "たまご (tamago) means egg.", "たまご"),
    item("j8e", 8, "What does りんご (ringo) mean?", "apple", ["egg", "banana", "orange"], "りんご (ringo) means apple.", "りんご"),
    item("j8f", 8, "What does ぎゅうにゅう (gyuunyuu) mean?", "milk", ["water", "tea", "juice"], "ぎゅうにゅう (gyuunyuu) means milk.", "ぎゅうにゅう"),

    /* Level 9: greetings and simple phrases */
    item("j9a", 9, "What does こんにちは (konnichiwa) mean?", "hello", ["goodbye", "thank you", "good night"], "こんにちは (konnichiwa) means hello. The last letter is は, but it is read \"wa\" here.", "こんにちは"),
    item("j9b", 9, "What does ありがとう (arigatou) mean?", "thank you", ["sorry", "hello", "good morning"], "ありがとう (arigatou) means thank you.", "ありがとう"),
    item("j9c", 9, "What does おはよう (ohayou) mean?", "good morning", ["good night", "hello", "goodbye"], "おはよう (ohayou) means good morning.", "おはよう"),
    item("j9d", 9, "What does さようなら (sayounara) mean?", "goodbye", ["hello", "thank you", "good morning"], "さようなら (sayounara) means goodbye.", "さようなら"),
    item("j9e", 9, "What does おやすみ (oyasumi) mean?", "good night", ["good morning", "goodbye", "thank you"], "おやすみ (oyasumi) means good night.", "おやすみ"),
    item("j9f", 9, "When do people say いただきます (itadakimasu)?", "before eating", ["after waking up", "when leaving school", "before sleeping"], "いただきます (itadakimasu) is said before a meal, a little like saying thanks for the food.", "いただきます"),

    /* Level 10: a bit of katakana (words borrowed from other languages) */
    item("j10a", 10, "What does アイスクリーム (aisukuriimu) mean?", "ice cream", ["ice skates", "cream soup", "cake"], "Katakana spells words from other languages. アイスクリーム is ice cream.", "アイスクリーム"),
    item("j10b", 10, "What does パン (pan) mean?", "bread", ["pan", "pen", "rice / a meal"], "パン (pan) means bread. It came from Portuguese.", "パン"),
    item("j10c", 10, "What does ジュース (juusu) mean?", "juice", ["juicy", "milk", "tea"], "ジュース (juusu) means juice.", "ジュース"),
    item("j10d", 10, "What does バナナ (banana) mean?", "banana", ["bandana", "apple", "bread"], "バナナ (banana) is banana, written in katakana.", "バナナ"),
    item("j10e", 10, "What does テレビ (terebi) mean?", "TV", ["telephone", "radio", "table"], "テレビ (terebi) is short for television.", "テレビ"),
    item("j10f", 10, "What does ピアノ (piano) mean?", "piano", ["pizza", "guitar", "picnic"], "ピアノ (piano) is piano, written in katakana.", "ピアノ")
  ];

  root.Q_JAPANESE = items;
  if (typeof module !== "undefined" && module.exports) module.exports = items;
})(typeof globalThis !== "undefined" ? globalThis : this);
