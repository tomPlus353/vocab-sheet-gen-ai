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
    * Include furigana when there are multiple possible readings.
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
    * Include furigana when there are multiple possible readings.
4.  **Brevity:**
    * You are expected to produce a cheatsheet and nothing else.
    * Apart from the cheatsheet to do reply to the user, explain anything say anything else.

**Output Format:**

Present your output in the following format, *using JSON*:
[
  {
    "japanese": string,
    "romanization": string,
    "english_definition": string,
    "example_sentences": [
      {
        "japanese": string,
        "romanization": "string,
      }
    ]
  },
]
e.g. 
[
  {
    "japanese": "過ぎ去る",
    "romanization": "sugisaru",
    "english_definition": "To pass; to elapse; to go by (time)",
    "example_sentences": [
      {
        "japanese": "時間が過ぎ去るのは早い。",
        "romanization": "Jikan ga sugisaru no wa hayai."
      },
      {
        "japanese": "問題は時間が過ぎ去るにつれて解決した。",
        "romanization": "Mondai wa jikan ga sugisaru ni tsurete kaiketsu shita."
      }
    ]
  },
  {
    "japanese": "迷う",
    "romanization": "mayou",
    "english_definition": "To be puzzled; to be uncertain; to hesitate",
    "example_sentences": [
      {
        "japanese": "どの道に進むべきか迷っています。",
        "romanization": "Dono michi ni susumu beki ka mayotte imasu."
      },
      {
        "japanese": "新しいプロジェクトに参加するかどうか迷っている。",
        "romanization": "Atarashii purojekuto ni sanka suru ka dou ka mayotte iru."
      }
    ]
  },
  {
    "japanese": "～というような",
    "romanization": "~toiu you na",
    "english_definition": "Such as; like; of the kind",
    "example_sentences": [
      {
        "japanese": "猫というような動物が好きです。",
        "romanization": "Neko toiu you na doubutsu ga suki desu."
      },
      {
        "japanese": "これは山田さんというような人が書いた本です。",
        "romanization": "Kore wa Yamada-san toiu you na hito ga kaita hon desu."
      }
    ]
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

N[1-5]: [Grammar terms] (romanization and definitions) (Optional. Grammar Documentation links and details)
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
