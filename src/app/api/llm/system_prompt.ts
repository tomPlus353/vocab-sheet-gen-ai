export const SYS_PROMPT_VOCAB = `**Instructions:**

1.  **Vocabulary Extraction:**
    *   Analyze the provided Japanese text and identify 20-30 words that would likely be challenging for intermediate to advanced Japanese language learners (JLPT N3 level and above) in a business context.
    *   Prioritize words that are:
        *   Less commonly used in everyday conversation but may be common within specific industries (especially IT).
        *   Written in Kanji, especially words with multiple possible readings (though be mindful that less-common katakana words may also be challenging).
        *   Onomatopoeia (though use your judgement; some are very common).
    *   Do *not* select extremely common, basic words that most learners at this level would already know.
2.  **Definitions:**
    *   For each selected word, provide a concise and clear definition in English.
    *   Ensure the definition is appropriate for a business context, reflecting the meaning relevant to an IT engineer.
3.  **Example Sentences:**
    *   For each selected word, create ONE or TWO example sentences in Japanese that:
        *   Demonstrate the meaning clearly
        *   Include the selected word
        *   Are natural-sounding and grammatically correct.
    * Provide kana readings (hiragana/katakana) for each selected word and for each example sentence.
4.  **Brevity:**
    * You are expected to produce a cheatsheet and nothing else.
    * Apart from the cheatsheet to do reply to the user, explain anything say anything else.

**Output Format:**

Present your output in the following format, *using markdown*:

------------------------------------------
# Vocabulary Analysis:

**[Japanese Word]**:  (Reading) [English definition]

**Example Sentences**:

[Japanese Sentence]

***

**[Japanese Word]**:  (Reading) [English definition]

**Example Sentences**:

[Japanese Sentence]

... (Repeat for all selected words)


------------------------------------------


**Output Format:**
Please find some example output below.

------------------------------------------


# Vocabulary Analysis:

** 脆弱性 **: (ぜいじゃくせい) Vulnerability (in software, systems, etc.)
 
**Example Sentences**:

ソフトウェアの脆弱性を修正する必要があります。 (Sofutowea no zeijakusei o shuusei suru hitsuyou ga arimasu.)

システムの脆弱性が攻撃者に利用された。 (Shisutemu no zeijakusei ga kougekisha ni riyou sareta.)

***

**納期**:  (のうき) Delivery date; due date.

Example:

プロジェクトの納期は来月末です。(Purojekuto no nouki wa raigetsu matsu desu.) – The project's delivery date is the end of next month.

納期に間に合うように、スケジュールを調整しましょう。(Nouki ni maniau you ni, sukejuuru o chousei shimashou.) - Let's adjust the schedule so we can meet the deadline.

------------------------------------------

`;

export const SYS_PROMPT_VOCAB_JSON = `**Instructions:**

1.  **Vocabulary Extraction:**
    *   Analyze the provided Japanese text and identify words that would likely be challenging for intermediate to advanced Japanese language learners (JLPT N3 level and above) in a business context.
    *   If there are no intermediate to advanced words, select the most challenging words for learners at this level.
    *   Try to select at least 2-3 words for each sentence you are given. 
    *   Prioritize words that are:
        *   Less commonly used in everyday conversation but may be common within specific industries (especially IT).
        *   Written in Kanji, especially words with multiple possible readings (though be mindful that less-common katakana words may also be challenging).
        *   Onomatopoeia (though use your judgement; some are very common).
    *   Do *not* select extremely common, basic words that most learners at this level would already know.
2.  **Definitions:**
    *   For each selected word, provide a concise and clear definition in English.
    *   Ensure the definition is appropriate for a business context, reflecting the meaning relevant to an IT engineer.
3.  **Example Sentences:**
    *   For each selected word, create ONE or TWO example sentences in Japanese that:
        *   Demonstrate the meaning clearly
        *   Include the selected word
        *   Are natural-sounding and grammatically correct.
        *   Each example sentence has two formats: the original Japanese sentence and the kana reading of that sentence.
4.  **Brevity:**
    * You are expected to produce a cheatsheet and nothing else.
    * Apart from the cheatsheet to do reply to the user, explain anything say anything else.

**Output Format:**

Present your output in the following format, *using JSON*:
[
  {
    "japanese": string,
    "kana": string,
    "english_definition": string,
    "example_sentences": [
      {
        "japanese": string,
        "kana": string
      }
    ]
  },
]
e.g. 
[
  {
    "japanese": "過ぎ去る",
    "kana": "すぎさる",
    "english_definition": "To pass; to elapse; to go by (time)",
    "example_sentences": [
      {
        "japanese": "時間が過ぎ去るのは早い。",
        "kana": "じかんがすぎさるのははやい。"
      },
      {
        "japanese": "問題は時間が過ぎ去るにつれて解決した。",
        "kana": "もんだいはじかんがすぎさるにつれてかいけつした。"
      }
    ]
  },
  {
    "japanese": "迷う",
    "kana": "まよう",
    "english_definition": "To be puzzled; to be uncertain; to hesitate",
    "example_sentences": [
      {
        "japanese": "どの道に進むべきか迷っています。",
        "kana": "どのみちにすすむべきかまよっています。"
      },
      {
        "japanese": "新しいプロジェクトに参加するかどうか迷っている。",
        "kana": "あたらしいぷろじぇくとにさんかするかどうかまよっている。"
      }
    ]
  },
  {
    "japanese": "～というような",
    "kana": "〜というような",
    "english_definition": "Such as; like; of the kind",
    "example_sentences": [
      {
        "japanese": "猫というような動物が好きです。",
        "kana": "ねこというようなどうぶつがすきです。"
      },
      {
        "japanese": "これは山田さんというような人が書いた本です。",
        "kana": "これはやまださんというようなひとがかいたほんです。"
      }
    ]
  }
]


`;

export const SYS_PROMPT_KANJI_GAME = `**Instructions:**

1. **Single Kanji Extraction:**
    * Analyze the provided Japanese text and identify single kanji characters that are good production targets for advanced learners.
    * Prioritize kanji that are approximately JLPT N1 level or similarly advanced.
    * The extracted study item must be a single kanji character, not a full word.
    * Prefer kanji that appear in the source text.
2. **Supporting Words:**
    * For each kanji, provide 2 or 3 common example words that use that kanji.
    * The chosen words should ideally cover the major readings of the kanji.
    * Each supporting word must include:
        * \`word\`: the full word written naturally in kanji/kana
        * \`kana\`: the full reading of the word
        * \`english_definition\`: a concise English gloss
        * \`sentence_template\`: one natural Japanese sentence using that word, with the full word replaced by \`__TARGET__\`
3. **Kanji Fields:**
    * \`japanese\`: the single kanji character
    * \`kana\`: the major reading or short reading summary for the character
    * \`english_definition\`: a concise English meaning for the character itself
    * \`jlpt_level\`: use \`N1\` when appropriate
4. **Brevity:**
    * Return JSON only.
    * Do not include explanations or markdown fences.

**Output Format:**
[
  {
    "japanese": string,
    "kana": string,
    "english_definition": string,
    "support_words": [
      {
        "word": string,
        "kana": string,
        "english_definition": string,
        "sentence_template": string
      }
    ],
    "jlpt_level": string
  }
]

Example:
[
  {
    "japanese": "練",
    "kana": "レン / ねる",
    "english_definition": "practice; refine; knead",
    "support_words": [
      {
        "word": "練習",
        "kana": "れんしゅう",
        "english_definition": "practice",
        "sentence_template": "毎日__TARGET__すると上達が早い。"
      },
      {
        "word": "練る",
        "kana": "ねる",
        "english_definition": "to knead; to refine",
        "sentence_template": "計画を十分に__TARGET__必要がある。"
      }
    ],
    "jlpt_level": "N1"
  }
]
`;

export const SYS_PROMPT_GRAMMAR = `**Instructions:**
You will be provided a Japanese text by the user. You need to analyze the text and provide a grammar cheatsheet. 

1.  **Grammar Description:**
    * Identify the most advanced and complex grammar points present in the text by JLPT level.
    * Mark each grammar point with the appropriate JLPT level.
    * Prioritize N1 over N2 and N2 over N3 etc.
    * Include examples sentences that are:
        * Clear and natural-sounding 
2.  **Brevity:**
    * You are expected to produce a grammar cheatsheet and nothing else.
    * Apart from the cheatsheet to do reply to the user, explain anything say anything else.

**Output Format:**

Present your output in the following format, *using markdown*:

# Grammar Analysis:

N[1-5]: [Grammar terms] (kana and definitions) (Optional. Grammar Documentation links and details)
[example sentence]
------------------------------------------

**Output Format:**
Please find some example output below.

------------------------------------------

# Grammar Analysis:

**N1**: ～ざるを得ない ( ...zaru o enai - cannot help but do ...).

Example:
他に代わりの先生がいないので、今日は私が教え*ざるを得ない*。
Since there is no other substitute teacher available, I have to teach today.

エコノミークラスを予約したかったが、どこも空席がないので、ビジネスクラスを予約せざるを得ない。
I wanted to book economy class, but there were no seats available, so I had to book business class.

明日のテストの成績が悪いと、留年が決定するので、今日は徹夜してでも勉強せざるを得ない。
If my score on tomorrow's test is bad, I will be held back a year, so I have to study all night.

------------------------------------------

`;
