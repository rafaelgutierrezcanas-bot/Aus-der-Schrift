import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "y5fwmpkn",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// ── 6 Hermeneutik-Schritte ──────────────────────────────

const steps = [
  {
    _type: "hermeneutikSchritt",
    _id: "herm-step-1",
    titleDe: "Beobachtung",
    titleEn: "Observation",
    slug: { _type: "slug", current: "observation" },
    order: 1,
    accentColor: "#F59E0B",
    icon: "search",
    interactionType: "freetext",
    explanationDe: [
      {
        _type: "block",
        _key: "exp1de1",
        style: "h3",
        children: [{ _type: "span", _key: "s1", text: "Was?" }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "exp1de2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s2",
            text: "Beobachtung ist der erste und wichtigste Schritt der Bibelauslegung. Hier liest du den Text aufmerksam und notierst, was dir auffällt — ohne sofort zu interpretieren. Du achtest auf Schlüsselwörter, Wiederholungen, Kontraste, Vergleiche, Aufzählungen und die Struktur des Textes.",
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "exp1de3",
        style: "h3",
        children: [{ _type: "span", _key: "s3", text: "Warum?" }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "exp1de4",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s4",
            text: "Viele Fehler in der Bibelauslegung entstehen, weil der Text nicht sorgfältig genug gelesen wird. Gute Beobachtung ist das Fundament für alle weiteren Schritte. Osborne betont: 'Man kann einen Text nicht auslegen, den man nicht beobachtet hat.'",
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "exp1de5",
        style: "h3",
        children: [{ _type: "span", _key: "s5", text: "Wie?" }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "exp1de6",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s6",
            text: "1. Lies den Text mindestens dreimal langsam durch. 2. Markiere Schlüsselwörter und wiederkehrende Begriffe. 3. Notiere Kontraste (z.B. 'nicht... sondern...'), Vergleiche und Aufzählungen. 4. Achte auf Konjunktionen (denn, weil, damit, aber) — sie zeigen die Logik des Textes. 5. Stelle W-Fragen: Wer? Was? Wann? Wo? Warum? Wie?",
          },
        ],
        markDefs: [],
      },
    ],
    explanationEn: [
      {
        _type: "block",
        _key: "exp1en1",
        style: "h3",
        children: [{ _type: "span", _key: "s1e", text: "What?" }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "exp1en2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s2e",
            text: "Observation is the first and most important step in Bible interpretation. Read the text carefully and note what you see — without interpreting yet. Look for key words, repetitions, contrasts, comparisons, lists, and the structure of the text.",
          },
        ],
        markDefs: [],
      },
    ],
    guidingQuestionsDe: [
      "Welche Wörter oder Ausdrücke werden wiederholt?",
      "Welche Kontraste oder Vergleiche findest du?",
      "Welche Konjunktionen (denn, weil, damit, aber) strukturieren den Text?",
      "Wer spricht? An wen? Worüber?",
      "Was fällt dir besonders auf oder überrascht dich?",
    ],
    guidingQuestionsEn: [
      "Which words or expressions are repeated?",
      "What contrasts or comparisons do you find?",
      "Which conjunctions (for, because, so that, but) structure the text?",
      "Who is speaking? To whom? About what?",
      "What stands out to you or surprises you?",
    ],
    commonMistakesDe: [
      "Zu schnell interpretieren, bevor man genau gelesen hat",
      "Nur nach 'theologisch wichtigen' Wörtern suchen und alltägliche Details übersehen",
      "Den Text in zu kleine Stücke zerlegen und den Zusammenhang verlieren",
    ],
    commonMistakesEn: [
      "Interpreting too quickly before reading carefully",
      "Only looking for 'theologically important' words and missing everyday details",
      "Breaking the text into pieces too small and losing the context",
    ],
    sources: [
      "Osborne, Hermeneutische Spirale, Kap. 1-2",
      "Klein/Blomberg/Hubbard, Introduction to Biblical Interpretation, Kap. 5",
    ],
  },
  {
    _type: "hermeneutikSchritt",
    _id: "herm-step-2",
    titleDe: "Historischer Kontext",
    titleEn: "Historical Context",
    slug: { _type: "slug", current: "historical-context" },
    order: 2,
    accentColor: "#3B82F6",
    icon: "globe",
    interactionType: "freetext",
    explanationDe: [
      {
        _type: "block",
        _key: "exp2de1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Jeder biblische Text wurde in einer bestimmten historischen Situation geschrieben. Um ihn richtig zu verstehen, musst du den Autor, die Empfänger, den Anlass und den kulturellen Hintergrund kennen. Was war die Situation, in die hinein dieser Text gesprochen wurde?",
          },
        ],
        markDefs: [],
      },
    ],
    explanationEn: [
      {
        _type: "block",
        _key: "exp2en1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1e",
            text: "Every biblical text was written in a specific historical situation. To understand it properly, you need to know the author, recipients, occasion, and cultural background.",
          },
        ],
        markDefs: [],
      },
    ],
    guidingQuestionsDe: [
      "Wer ist der Autor und was wissen wir über ihn?",
      "An wen schreibt er? Was ist ihre Situation?",
      "Was war der Anlass des Schreibens?",
      "Welche kulturellen, politischen oder religiösen Hintergründe sind relevant?",
    ],
    guidingQuestionsEn: [
      "Who is the author and what do we know about him?",
      "To whom is he writing? What is their situation?",
      "What was the occasion for writing?",
      "What cultural, political, or religious backgrounds are relevant?",
    ],
    commonMistakesDe: [
      "Den Text lesen, als wäre er direkt an uns geschrieben",
      "Moderne Vorstellungen in die antike Welt projizieren",
    ],
    commonMistakesEn: [
      "Reading the text as if it were written directly to us",
      "Projecting modern ideas onto the ancient world",
    ],
    sources: [
      "Köstenberger/Patterson, Invitation to Biblical Interpretation, Kap. 4",
      "Osborne, Hermeneutische Spirale, Kap. 5",
    ],
  },
  {
    _type: "hermeneutikSchritt",
    _id: "herm-step-3",
    titleDe: "Literarische Analyse",
    titleEn: "Literary Analysis",
    slug: { _type: "slug", current: "literary-analysis" },
    order: 3,
    accentColor: "#10B981",
    icon: "file-text",
    interactionType: "freetext",
    explanationDe: [
      {
        _type: "block",
        _key: "exp3de1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Die literarische Analyse untersucht das Genre (Briefliteratur, Erzählung, Poesie usw.), die Textstruktur und die rhetorischen Stilmittel. Verschiedene Genres haben unterschiedliche Auslegungsregeln — ein Gedicht liest man anders als einen Brief.",
          },
        ],
        markDefs: [],
      },
    ],
    explanationEn: [
      {
        _type: "block",
        _key: "exp3en1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1e",
            text: "Literary analysis examines the genre (epistolary, narrative, poetry, etc.), text structure, and rhetorical devices. Different genres have different interpretation rules.",
          },
        ],
        markDefs: [],
      },
    ],
    guidingQuestionsDe: [
      "Welches Genre hat dieser Text?",
      "Wie ist der Text aufgebaut/gegliedert?",
      "Welche rhetorischen Stilmittel werden verwendet?",
      "Wie passt dieser Abschnitt in den größeren Zusammenhang des Buches?",
    ],
    guidingQuestionsEn: [
      "What genre does this text belong to?",
      "How is the text structured/outlined?",
      "What rhetorical devices are used?",
      "How does this passage fit into the larger context of the book?",
    ],
    commonMistakesDe: [
      "Genre ignorieren und alles gleich behandeln",
      "Stilmittel wörtlich nehmen (z.B. Metaphern als Tatsachenbeschreibungen)",
    ],
    commonMistakesEn: [
      "Ignoring genre and treating everything the same",
      "Taking figures of speech literally",
    ],
    sources: ["Osborne, Hermeneutische Spirale, Kap. 6-7"],
  },
  {
    _type: "hermeneutikSchritt",
    _id: "herm-step-4",
    titleDe: "Wortanalyse",
    titleEn: "Word Analysis",
    slug: { _type: "slug", current: "word-analysis" },
    order: 4,
    accentColor: "#8B5CF6",
    icon: "book-open",
    interactionType: "freetext",
    explanationDe: [
      {
        _type: "block",
        _key: "exp4de1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Die Wortanalyse untersucht Schlüsselbegriffe genauer: Was bedeutet ein bestimmtes Wort im Kontext dieses Textes? Die Bedeutung eines Wortes wird durch seinen Kontext bestimmt, nicht durch seine Etymologie oder allgemeine Wörterbuchdefinition.",
          },
        ],
        markDefs: [],
      },
    ],
    explanationEn: [
      {
        _type: "block",
        _key: "exp4en1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1e",
            text: "Word analysis examines key terms more closely: What does a specific word mean in the context of this text? A word's meaning is determined by its context, not by its etymology or general dictionary definition.",
          },
        ],
        markDefs: [],
      },
    ],
    guidingQuestionsDe: [
      "Welche Schlüsselbegriffe sind für das Verständnis des Textes entscheidend?",
      "Was bedeutet dieses Wort in diesem spezifischen Kontext?",
      "Wie verwendet der Autor dieses Wort an anderen Stellen?",
    ],
    guidingQuestionsEn: [
      "Which key terms are essential for understanding the text?",
      "What does this word mean in this specific context?",
      "How does the author use this word elsewhere?",
    ],
    commonMistakesDe: [
      "Etymologischer Fehlschluss: Die Herkunft eines Wortes bestimmt nicht seine aktuelle Bedeutung",
      "Alle Bedeutungen eines Wortes in jede Stelle einlesen",
    ],
    commonMistakesEn: [
      "Etymological fallacy: A word's origin doesn't determine its current meaning",
      "Reading all meanings of a word into every occurrence",
    ],
    sources: [
      "Osborne, Hermeneutische Spirale, Kap. 3",
      "Silva, Biblical Words and Their Meaning",
    ],
  },
  {
    _type: "hermeneutikSchritt",
    _id: "herm-step-5",
    titleDe: "Theologische Synthese",
    titleEn: "Theological Synthesis",
    slug: { _type: "slug", current: "theological-synthesis" },
    order: 5,
    accentColor: "#F97316",
    icon: "layers",
    interactionType: "freetext",
    explanationDe: [
      {
        _type: "block",
        _key: "exp5de1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "In der theologischen Synthese formulierst du die Hauptaussage des Textes und ordnest sie in die biblische Theologie ein. Was lehrt dieser Text über Gott, den Menschen, die Erlösung oder das Leben der Gemeinde? Wie verbindet sich diese Passage mit anderen biblischen Texten?",
          },
        ],
        markDefs: [],
      },
    ],
    explanationEn: [
      {
        _type: "block",
        _key: "exp5en1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1e",
            text: "In theological synthesis, you formulate the main message of the text and place it within biblical theology. What does this text teach about God, humanity, salvation, or the life of the church?",
          },
        ],
        markDefs: [],
      },
    ],
    guidingQuestionsDe: [
      "Was ist die Hauptaussage dieses Textes in einem Satz?",
      "Was lehrt dieser Text über Gott / Christus / den Heiligen Geist?",
      "Welche theologischen Themen werden angesprochen?",
      "Wie verbindet sich dieser Text mit dem Rest der Bibel?",
    ],
    guidingQuestionsEn: [
      "What is the main message of this text in one sentence?",
      "What does this text teach about God / Christ / the Holy Spirit?",
      "What theological themes are addressed?",
      "How does this text connect with the rest of the Bible?",
    ],
    commonMistakesDe: [
      "Eigene Theologie in den Text hineinlesen statt aus dem Text herauslesen",
      "Den Text isoliert betrachten ohne den biblisch-theologischen Zusammenhang",
    ],
    commonMistakesEn: [
      "Reading your own theology into the text instead of drawing it out",
      "Viewing the text in isolation without the biblical-theological context",
    ],
    sources: ["Köstenberger/Patterson, Kap. 7-8"],
  },
  {
    _type: "hermeneutikSchritt",
    _id: "herm-step-6",
    titleDe: "Kontextualisierung & Anwendung",
    titleEn: "Contextualization & Application",
    slug: { _type: "slug", current: "contextualization" },
    order: 6,
    accentColor: "#EC4899",
    icon: "heart",
    interactionType: "freetext",
    explanationDe: [
      {
        _type: "block",
        _key: "exp6de1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Der letzte Schritt überbrückt die kulturelle und zeitliche Distanz: Was bedeutete der Text damals — und was bedeutet er heute? Hier geht es nicht darum, den Text 'relevant zu machen', sondern zu erkennen, wie die zeitlose Wahrheit des Textes in unsere heutige Situation spricht.",
          },
        ],
        markDefs: [],
      },
    ],
    explanationEn: [
      {
        _type: "block",
        _key: "exp6en1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1e",
            text: "The final step bridges the cultural and temporal distance: What did the text mean then — and what does it mean today? This isn't about 'making the text relevant' but about recognizing how its timeless truth speaks into our current situation.",
          },
        ],
        markDefs: [],
      },
    ],
    guidingQuestionsDe: [
      "Was ist die kulturelle Distanz zwischen damals und heute?",
      "Welches überzeitliche Prinzip steckt hinter der konkreten Anweisung?",
      "Wie spricht dieser Text in mein persönliches Leben?",
      "Welche Konsequenzen hat diese Erkenntnis für die Gemeinde heute?",
    ],
    guidingQuestionsEn: [
      "What is the cultural distance between then and now?",
      "What timeless principle lies behind the specific instruction?",
      "How does this text speak into my personal life?",
      "What implications does this insight have for the church today?",
    ],
    commonMistakesDe: [
      "Direkte 1:1-Übertragung ohne kulturelle Reflexion",
      "Den Text nur 'spiritualisieren' ohne konkrete Anwendung",
    ],
    commonMistakesEn: [
      "Direct 1:1 transfer without cultural reflection",
      "Only 'spiritualizing' the text without concrete application",
    ],
    sources: [
      "Osborne, Hermeneutische Spirale, Kap. 15-16",
      "Klein/Blomberg/Hubbard, Kap. 14-15",
    ],
  },
];

// ── 1 Thessalonicher 1,1-10 ──────────────────────────────

const text1Thess = {
  _type: "hermeneutikText",
  _id: "herm-text-1thess1",
  titleDe: "1. Thessalonicher 1,1–10",
  titleEn: "1 Thessalonians 1:1–10",
  slug: { _type: "slug", current: "1-thessalonians-1-1-10" },
  bibleReference: "1Thess 1,1-10",
  genre: "epistle",
  difficulty: "beginner",
  order: 1,
  textContentDe: [
    {
      _type: "block",
      _key: "t1",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "s1",
          text: "¹ Paulus und Silvanus und Timotheus an die Gemeinde der Thessalonicher in Gott, dem Vater, und dem Herrn Jesus Christus: Gnade euch und Friede!",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "t2",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "s2",
          text: "² Wir danken Gott allezeit für euch alle, wenn wir euch erwähnen in unseren Gebeten, ³ indem wir unablässig gedenken eures Werkes des Glaubens und eurer Bemühung der Liebe und eures Ausharrens der Hoffnung auf unseren Herrn Jesus Christus vor unserem Gott und Vater.",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "t3",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "s3",
          text: "⁴ Wir wissen, von Gott geliebte Brüder, um eure Erwählung, ⁵ dass unser Evangelium nicht allein im Wort zu euch gekommen ist, sondern auch in Kraft und im Heiligen Geist und in großer Gewissheit; ihr wisst ja, wie wir unter euch aufgetreten sind um euretwillen.",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "t4",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "s4",
          text: "⁶ Und ihr seid unsere Nachahmer geworden und die des Herrn, indem ihr das Wort aufgenommen habt in viel Bedrängnis mit Freude des Heiligen Geistes, ⁷ so dass ihr allen Gläubigen in Mazedonien und in Achaja zu Vorbildern geworden seid.",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "t5",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "s5",
          text: "⁸ Denn von euch aus ist das Wort des Herrn erschollen, nicht allein in Mazedonien und Achaja, sondern an jeden Ort ist euer Glaube an Gott hinausgedrungen, so dass wir nicht nötig haben, etwas zu sagen. ⁹ Denn sie selbst erzählen von uns, welchen Eingang wir bei euch hatten und wie ihr euch von den Götzen zu Gott bekehrt habt, dem lebendigen und wahren Gott zu dienen ¹⁰ und seinen Sohn aus den Himmeln zu erwarten, den er aus den Toten auferweckt hat — Jesus, der uns errettet von dem kommenden Zorn.",
        },
      ],
      markDefs: [],
    },
  ],
  textContentEn: [
    {
      _type: "block",
      _key: "te1",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "se1",
          text: "¹ Paul, Silvanus, and Timothy, To the church of the Thessalonians in God the Father and the Lord Jesus Christ: Grace to you and peace.",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "te2",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "se2",
          text: "² We give thanks to God always for all of you, constantly mentioning you in our prayers, ³ remembering before our God and Father your work of faith and labor of love and steadfastness of hope in our Lord Jesus Christ.",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "te3",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "se3",
          text: "⁴ For we know, brothers loved by God, that he has chosen you, ⁵ because our gospel came to you not only in word, but also in power and in the Holy Spirit and with full conviction. You know what kind of men we proved to be among you for your sake.",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "te4",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "se4",
          text: "⁶ And you became imitators of us and of the Lord, for you received the word in much affliction, with the joy of the Holy Spirit, ⁷ so that you became an example to all the believers in Macedonia and in Achaia.",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "te5",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "se5",
          text: "⁸ For not only has the word of the Lord sounded forth from you in Macedonia and Achaia, but your faith in God has gone forth everywhere, so that we need not say anything. ⁹ For they themselves report concerning us the kind of reception we had among you, and how you turned to God from idols to serve the living and true God, ¹⁰ and to wait for his Son from heaven, whom he raised from the dead, Jesus who delivers us from the wrath to come.",
        },
      ],
      markDefs: [],
    },
  ],
  backgroundInfoDe: [
    {
      _type: "block",
      _key: "bg1",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "bgs1",
          text: "Thessalonich war eine bedeutende Hafenstadt in Mazedonien (heutiges Nordgriechenland) und Hauptstadt der römischen Provinz. Die Stadt lag an der Via Egnatia, einer wichtigen Handelsstraße. Paulus gründete die Gemeinde auf seiner zweiten Missionsreise (ca. 49-50 n.Chr.), musste aber nach kurzer Zeit wegen Verfolgung fliehen (Apg 17,1-10). Der Brief wurde wahrscheinlich um 50-51 n.Chr. aus Korinth geschrieben — damit ist er eines der ältesten Dokumente des Neuen Testaments.",
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "bg2",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "bgs2",
          text: "Die Gemeinde bestand überwiegend aus ehemaligen Heiden (Götzendiener, V.9), die sich unter Verfolgung zum christlichen Glauben bekehrt hatten. Paulus schreibt aus Sorge um die junge Gemeinde, nachdem Timotheus ihm gute Nachrichten gebracht hat (3,6).",
        },
      ],
      markDefs: [],
    },
  ],
  backgroundInfoEn: [
    {
      _type: "block",
      _key: "bge1",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "bgse1",
          text: "Thessalonica was a major port city in Macedonia (modern northern Greece) and capital of the Roman province. The city was located on the Via Egnatia, an important trade route. Paul founded the church during his second missionary journey (ca. AD 49-50) but had to flee due to persecution after a short time (Acts 17:1-10). The letter was probably written around AD 50-51 from Corinth — making it one of the earliest documents of the New Testament.",
        },
      ],
      markDefs: [],
    },
  ],
  stepAnalyses: [
    {
      _key: "sa1",
      step: { _type: "reference", _ref: "herm-step-1" },
      expertAnalysisDe: [
        {
          _type: "block",
          _key: "ea1de1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "eas1",
              text: "Schlüsselwörter und Wiederholungen: 'Gott' (6x), 'Herr/Jesus/Christus' (4x), 'Evangelium/Wort' (3x), 'Glaube' (2x), 'Heiliger Geist' (2x). Die trinitarische Struktur ist bemerkenswert: Gott der Vater, der Herr Jesus Christus, der Heilige Geist erscheinen alle in enger Verbindung.",
            },
          ],
          markDefs: [],
        },
        {
          _type: "block",
          _key: "ea1de2",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "eas2",
              text: "Die berühmte Trias 'Glaube, Liebe, Hoffnung' erscheint in V.3 — 'Werk des Glaubens, Bemühung der Liebe, Ausharren der Hoffnung'. Jede Tugend ist mit einer Handlung verbunden. Kontraste: 'nicht allein im Wort, sondern auch in Kraft' (V.5), 'Götzen → lebendiger Gott' (V.9), 'Bedrängnis ↔ Freude' (V.6). Bewegung im Text: Von Paulus' Dank → zur Gemeinde → zu deren Ausstrahlung → zu deren Bekehrung → zur Erwartung Christi.",
            },
          ],
          markDefs: [],
        },
      ],
      expertAnalysisEn: [
        {
          _type: "block",
          _key: "ea1en1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "ease1",
              text: "Key words and repetitions: 'God' (6x), 'Lord/Jesus/Christ' (4x), 'gospel/word' (3x), 'faith' (2x), 'Holy Spirit' (2x). The trinitarian structure is remarkable. The famous triad of 'faith, love, hope' appears in v.3 — each virtue linked to action. Key contrasts: 'not only in word but also in power' (v.5), 'idols → living God' (v.9), 'affliction ↔ joy' (v.6).",
            },
          ],
          markDefs: [],
        },
      ],
      hintsDe: [
        "Zähle, wie oft 'Gott' und 'Herr/Jesus' vorkommen",
        "Achte auf die Dreierkombination in Vers 3",
        "Suche nach Gegensatzpaaren (nicht... sondern...)",
      ],
      hintsEn: [
        "Count how often 'God' and 'Lord/Jesus' appear",
        "Look for the three-part combination in verse 3",
        "Search for contrast pairs (not... but...)",
      ],
    },
    {
      _key: "sa2",
      step: { _type: "reference", _ref: "herm-step-2" },
      expertAnalysisDe: [
        {
          _type: "block",
          _key: "ea2de1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "eas3",
              text: "Autor: Paulus, zusammen mit Silvanus (=Silas) und Timotheus — alle drei waren an der Gemeindegründung beteiligt (Apg 17). Empfänger: Die Gemeinde in Thessalonich, einer kosmopolitischen Hafenstadt. Die Gemeinde besteht hauptsächlich aus Heidenchristen (V.9: 'von den Götzen zu Gott bekehrt'). Anlass: Paulus musste Thessalonich nach nur wenigen Wochen fluchtartig verlassen. Er sandte Timotheus zurück, der positive Nachrichten brachte (3,6). Der Brief ist eine Reaktion auf diese guten Nachrichten — er ermutigt, dankt und gibt weitere Unterweisung. Datierung: ca. 50-51 n.Chr. aus Korinth — damit einer der frühesten paulinischen Briefe.",
            },
          ],
          markDefs: [],
        },
      ],
      expertAnalysisEn: [
        {
          _type: "block",
          _key: "ea2en1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "ease3",
              text: "Author: Paul, together with Silvanus (=Silas) and Timothy. Recipients: The church in Thessalonica, a cosmopolitan port city — primarily Gentile converts (v.9). Occasion: Paul had to flee after only a few weeks; Timothy brought back positive news (3:6). Written ca. AD 50-51 from Corinth — one of Paul's earliest letters.",
            },
          ],
          markDefs: [],
        },
      ],
      hintsDe: [
        "Lies Apostelgeschichte 17,1-10 für den historischen Hintergrund",
        "Vers 9 gibt einen wichtigen Hinweis auf die religiöse Herkunft der Gemeinde",
      ],
      hintsEn: [
        "Read Acts 17:1-10 for the historical background",
        "Verse 9 gives an important clue about the religious background of the church",
      ],
    },
    {
      _key: "sa3",
      step: { _type: "reference", _ref: "herm-step-3" },
      expertAnalysisDe: [
        {
          _type: "block",
          _key: "ea3de1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "eas5",
              text: "Genre: Epistel / Brief — genauer: Briefeingang (Präskript V.1 + Proömium/Danksagung V.2-10). Struktur: V.1: Briefkopf (Absender, Empfänger, Gruß) | V.2-3: Danksagung mit Glauben-Liebe-Hoffnung-Trias | V.4-5: Grund für den Dank — Gottes Erwählung und die Kraft des Evangeliums | V.6-7: Die Thessalonicher als Nachahmer und Vorbild | V.8-10: Die Ausstrahlung ihres Glaubens und ihre Bekehrungsgeschichte. Stilmittel: Partizipiale Kette (V.2-3 ist im Griechischen ein einziger langer Satz), Klimax (Nachahmer → Vorbild → das Wort erschallt überall).",
            },
          ],
          markDefs: [],
        },
      ],
      expertAnalysisEn: [
        {
          _type: "block",
          _key: "ea3en1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "ease5",
              text: "Genre: Epistle — specifically: letter opening (prescript v.1 + prooemium/thanksgiving v.2-10). Structure: v.1: Letter header | v.2-3: Thanksgiving with faith-love-hope triad | v.4-5: Reason for thanks — God's election and the power of the gospel | v.6-7: Thessalonians as imitators and examples | v.8-10: The spread of their faith and conversion story. Rhetorical devices: Participial chain, climax (imitators → example → the word sounds forth everywhere).",
            },
          ],
          markDefs: [],
        },
      ],
      hintsDe: [
        "Vergleiche den Briefkopf mit anderen Paulusbriefen",
        "Versuche den Text in 3-4 Abschnitte zu gliedern",
      ],
      hintsEn: [
        "Compare the letter header with other Pauline letters",
        "Try to outline the text in 3-4 sections",
      ],
    },
    {
      _key: "sa4",
      step: { _type: "reference", _ref: "herm-step-4" },
      expertAnalysisDe: [
        {
          _type: "block",
          _key: "ea4de1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "eas7",
              text: "Schlüsselbegriffe: 'Werk des Glaubens' (ἔργον τῆς πίστεως) — nicht Werke ALS Glaube, sondern das Werk, DAS DER Glaube hervorbringt. 'Erwählung' (ἐκλογή, V.4) — Gottes souveräne Wahl, hier erkennbar an den Auswirkungen (V.5-6). 'Nachahmer' (μιμηταί, V.6) — ein pädagogischer Begriff: Lernen durch Nachahmung des Lehrers. 'Götzen' (εἴδωλα, V.9) — der griechische Begriff für heidnische Kultbilder. 'Lebendiger und wahrer Gott' — Kontrast zu den toten, falschen Götzen.",
            },
          ],
          markDefs: [],
        },
      ],
      expertAnalysisEn: [
        {
          _type: "block",
          _key: "ea4en1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "ease7",
              text: "Key terms: 'work of faith' — not works AS faith, but the work THAT faith produces. 'Election' (v.4) — God's sovereign choice, recognizable by its effects (v.5-6). 'Imitators' (v.6) — a pedagogical concept: learning by imitating the teacher. 'Idols' (v.9) — the Greek term for pagan cult images. 'Living and true God' — contrast to dead, false idols.",
            },
          ],
          markDefs: [],
        },
      ],
      hintsDe: [
        "Achte auf den Genitiv 'des Glaubens' — wessen Werk ist es?",
        "Was bedeutet 'Nachahmer' im antiken Kontext?",
      ],
      hintsEn: [
        "Pay attention to the genitive 'of faith' — whose work is it?",
        "What does 'imitators' mean in the ancient context?",
      ],
    },
    {
      _key: "sa5",
      step: { _type: "reference", _ref: "herm-step-5" },
      expertAnalysisDe: [
        {
          _type: "block",
          _key: "ea5de1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "eas9",
              text: "Hauptaussage: Paulus dankt Gott für die Thessalonicher, deren echte Bekehrung sich in dreifacher Weise zeigt — im Werk des Glaubens, der Bemühung der Liebe und dem Ausharren der Hoffnung — und deren Glaube zum Vorbild für andere geworden ist. Theologische Themen: (1) Erwählung: Gott wählt souverän, erkennbar an den Früchten. (2) Trinität: Vater, Sohn und Heiliger Geist wirken zusammen in der Errettung. (3) Eschatologie: Die Erwartung der Wiederkunft Christi (V.10) und die Errettung vom kommenden Zorn. (4) Nachahmung als Prinzip des geistlichen Wachstums.",
            },
          ],
          markDefs: [],
        },
      ],
      expertAnalysisEn: [
        {
          _type: "block",
          _key: "ea5en1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "ease9",
              text: "Main message: Paul thanks God for the Thessalonians, whose genuine conversion is evidenced by their work of faith, labor of love, and steadfastness of hope — and whose faith has become a model for others. Theological themes: (1) Election, (2) Trinity, (3) Eschatology — awaiting Christ's return and deliverance from wrath, (4) Imitation as a principle of spiritual growth.",
            },
          ],
          markDefs: [],
        },
      ],
      hintsDe: [
        "Formuliere die Hauptaussage des Textes in einem einzigen Satz",
        "Welche theologischen Themen kannst du identifizieren?",
      ],
      hintsEn: [
        "Formulate the main message of the text in a single sentence",
        "What theological themes can you identify?",
      ],
    },
    {
      _key: "sa6",
      step: { _type: "reference", _ref: "herm-step-6" },
      expertAnalysisDe: [
        {
          _type: "block",
          _key: "ea6de1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "eas11",
              text: "Kulturelle Distanz: Die Thessalonicher kamen aus dem Götzendienst (V.9) — eine direkte Parallele gibt es in Europa heute selten. Aber die Grundbewegung 'Abkehr von Falschem → Hinwendung zum wahren Gott → Erwartung der Zukunft' ist zeitlos. Anwendung: (1) Wie zeigt sich in meinem Leben 'Werk des Glaubens, Bemühung der Liebe, Ausharren der Hoffnung'? (2) Wer sind meine geistlichen Vorbilder, und bin ich selbst ein Vorbild für andere? (3) Wie prägt die Erwartung der Wiederkunft Christi mein tägliches Leben? (4) 'Bedrängnis mit Freude des Heiligen Geistes' — ist Leiden und Freude gleichzeitig möglich?",
            },
          ],
          markDefs: [],
        },
      ],
      expertAnalysisEn: [
        {
          _type: "block",
          _key: "ea6en1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "ease11",
              text: "Cultural distance: The Thessalonians came from idol worship (v.9) — a direct parallel is rare in modern Europe. But the basic movement 'turning from false → turning to the true God → awaiting the future' is timeless. Application: (1) How do 'work of faith, labor of love, steadfastness of hope' manifest in my life? (2) Who are my spiritual role models, and am I a model for others? (3) How does expecting Christ's return shape my daily life?",
            },
          ],
          markDefs: [],
        },
      ],
      hintsDe: [
        "Welche modernen 'Götzen' könnten den antiken entsprechen?",
        "Wie sieht 'Nachahmen' in deinem Kontext aus?",
      ],
      hintsEn: [
        "What modern 'idols' might correspond to the ancient ones?",
        "What does 'imitation' look like in your context?",
      ],
    },
  ],
};

// ── Seed ──────────────────────────────────────────────────

async function seed() {
  console.log("Seeding 6 hermeneutik steps...");
  const tx = client.transaction();
  for (const step of steps) {
    tx.createOrReplace(step);
  }
  tx.createOrReplace(text1Thess);
  const result = await tx.commit();
  console.log(`Done! Created/updated ${result.documentIds.length} documents.`);
  console.log("Document IDs:", result.documentIds);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
