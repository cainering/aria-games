/* Story Studio for Aria: finish-the-story starters, prompts, and a blank page.
   Optional calm timer (off by default) never locks the page or scolds.
   Drafts are saved on this device only (localStorage). TV-14 or gentler. */
(function () {
  var KEY = ((window.KIDS_SETTINGS && window.KIDS_SETTINGS.childKey) || "kid") + "-story-studio";

  var SPARKS = {
    lanternblade: {
      finish: [
        "Mira's blank grimoire glowed again at midnight. This time, a single word appeared on the page: \"Follow.\" She grabbed her lantern and...",
        "The masked stranger on the rooftop finally spoke. \"Your mother left you something,\" he said, and held out a tiny silver key that...",
        "Corin, her rival, was waiting at the village gate with his arms crossed. \"I'm coming with you,\" he said. Mira couldn't believe it, because...",
        "Mira took a deep breath, like a lantern. The flame in her chest grew brighter, and for the first time she could see..."
      ],
      prompt: [
        "Write the spell that appears on page two of Mira's grimoire. What does it do, and what does it cost?",
        "Invent a new character who arrives in Valemoor with a grimoire that has too many pages. What's their secret?",
        "Tell the story of the night Mira's mother disappeared, from her mother's point of view."
      ]
    },
    fantasy: {
      finish: [
        "The dragon egg in the school library had been a paperweight for a hundred years. On Tuesday, it cracked, and...",
        "Every door in Grandma's house led somewhere different on the first day of the month. Today, the pantry door opened onto...",
        "The map only showed the path when you hummed. So the three friends hummed, and the ink began to move toward..."
      ],
      prompt: [
        "A girl discovers she can talk to the moon, but only on cloudy nights. What does the moon tell her?",
        "Write about a small, brave creature who has to guard something very big.",
        "Your shadow decides to go on an adventure without you. Where does it go?"
      ]
    },
    mystery: {
      finish: [
        "The class hamster was gone. The cage was locked. The only clue was a trail of glitter that led to...",
        "Every morning, someone left a folded paper crane on Aria's desk. Today the crane had a message written inside its wings:",
        "The clock in the town square stopped at 3:17, and nobody in town could remember what happened at 3:17, except..."
      ],
      prompt: [
        "Write a mystery where the detective is the newest kid at school.",
        "Something small goes missing every day at the same time. Solve it.",
        "A letter arrives addressed to someone who lived in your house 100 years ago."
      ]
    },
    funny: {
      finish: [
        "The day the cafeteria food came to life, the mashed potatoes were the first to stand up and say...",
        "My little brother's sock started talking. Worse, it had opinions, and its first opinion was...",
        "Our teacher accidentally turned into a llama during math. She still wanted us to finish our worksheets, so..."
      ],
      prompt: [
        "Write about a superhero whose only power is finding lost things, but only socks.",
        "A cat runs for class president. Write its campaign speech.",
        "Everything you say comes out as a song for one whole day."
      ]
    },
    everyday: {
      finish: [
        "I was nervous to read my story out loud in front of the whole class. When it was my turn, I stood up and...",
        "My best friend and I wanted different things for the first time, and neither of us knew what to say, until...",
        "I made a mistake, a big one, and I could feel my face getting hot. Then I remembered something my mom always says:"
      ],
      prompt: [
        "Write about a time something went wrong and turned out okay.",
        "Describe your perfect Saturday, minute by minute.",
        "Write a letter to yourself to open when you are fourteen."
      ]
    }
  };

  var genre = "lanternblade", mode = "finish", sparkText = "", current = null;
  var $ = function (id) { return document.getElementById(id); };
  var story = $("story"), title = $("title");

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function store(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode */ }
  }

  function speak(text) {
    try {
      if (!window.speechSynthesis || !text) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice */ }
  }

  function newSpark() {
    if (mode === "free") { sparkText = "A blank page. Anything can happen here."; }
    else {
      var list = SPARKS[genre][mode];
      var next = list[Math.floor(Math.random() * list.length)];
      if (list.length > 1) while (next === sparkText) next = list[Math.floor(Math.random() * list.length)];
      sparkText = next;
    }
    $("spark").textContent = sparkText;
  }

  function words(text) { var m = String(text).trim().match(/\S+/g); return m ? m.length : 0; }
  function updateCount() { var n = words(story.value); $("count").textContent = n + (n === 1 ? " word" : " words"); }

  function save(quiet) {
    if (!story.value.trim() && !title.value.trim()) return;
    var list = load();
    if (!current) current = { id: Date.now(), spark: mode === "finish" ? sparkText : "" };
    current.title = title.value.trim() || "Untitled";
    current.text = story.value;
    current.at = new Date().toISOString();
    list = list.filter(function (s) { return s.id !== current.id; });
    list.unshift(current);
    store(list.slice(0, 50));
    if (!quiet) $("saved").textContent = "Saved ✓";
    drawShelf();
  }

  function drawShelf() {
    var shelf = $("shelf"); shelf.innerHTML = "";
    var list = load();
    if (!list.length) { var li = document.createElement("li"); li.textContent = "No stories yet. Your first one is waiting!"; shelf.appendChild(li); return; }
    list.forEach(function (s) {
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.textContent = s.title + " · " + words(s.text) + " words";
      var open = document.createElement("button"); open.type = "button"; open.textContent = "Open";
      open.addEventListener("click", function () { current = s; title.value = s.title; story.value = s.text; updateCount(); window.scrollTo(0, 0); });
      li.appendChild(name); li.appendChild(open); shelf.appendChild(li);
    });
  }

  function pickGroup(sel, attr, set) {
    document.querySelectorAll(sel).forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(sel).forEach(function (o) { o.classList.remove("on"); });
        b.classList.add("on"); set(b.getAttribute(attr)); newSpark();
      });
    });
  }
  pickGroup(".genre", "data-genre", function (v) { genre = v; });
  pickGroup(".mode", "data-mode", function (v) { mode = v; });

  $("another").addEventListener("click", newSpark);
  $("hear-spark").addEventListener("click", function () { speak(sparkText); });
  $("read").addEventListener("click", function () { speak((title.value ? title.value + ". " : "") + story.value); });
  $("save").addEventListener("click", function () { save(false); });
  $("new").addEventListener("click", function () { save(true); current = null; title.value = ""; story.value = mode === "finish" ? sparkText + " " : ""; updateCount(); $("saved").textContent = ""; });
  $("download").addEventListener("click", function () {
    var blob = new Blob([(title.value || "My story") + "\n\n" + story.value], { type: "text/plain" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = (title.value || "my-story").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") + ".txt";
    document.body.appendChild(a); a.click(); a.remove();
  });

  var autosave = 0;
  story.addEventListener("input", function () { updateCount(); $("saved").textContent = ""; clearTimeout(autosave); autosave = setTimeout(function () { save(true); $("saved").textContent = "Autosaved"; }, 1500); });

  /* Calm timer: shows minutes left, then a soft note. Nothing locks. */
  var timerEnd = 0, tick = 0;
  $("timer").addEventListener("change", function () {
    clearInterval(tick); $("timer-note").hidden = true;
    var mins = Number(this.value);
    if (!mins) { $("timer-left").textContent = ""; return; }
    timerEnd = Date.now() + mins * 60000;
    function show() {
      var left = Math.max(0, timerEnd - Date.now());
      $("timer-left").textContent = left ? "About " + Math.ceil(left / 60000) + " min left" : "";
      if (!left) { clearInterval(tick); $("timer-note").hidden = false; }
    }
    show(); tick = setInterval(show, 5000);
  });

  newSpark();
  story.value = "";
  updateCount();
  drawShelf();
})();
