# Customer Presentation Plan

Use this as a short speaking guide while demoing the app.

## Demo Flow

1. Tool for studying Japanese.
2. Paste Japanese text here.
3. Press submit to split the text into pages (pagination).
4. Press the `gravity` button to play the game.
5. Words fall from the top of the screen.
6. Type the answer before the word hits the bottom.
7. If a word passes the red line, you must practice it.
8. If you get 2 wrong in a row, it is game over.
9. The terms fall faster and faster each time.

## Mermaid Diagram

```mermaid
flowchart TB
    subgraph C1["Client (browser)"]
        A["User pastes a passage on the Home page"] --> B["Text is stored as activeText"]
        B --> C["One page of text is stored in localStorage"]
        C --> D["Convert the text into a hash"]
        D --> E["Check whether JSON already exists for that hash"]
        E -->|Cache hit| H["Reuse saved JSON term data"]
        E -->|Cache miss| F["Send POST /api/llm with text and mode: vocabGame"]
        I["Parse the JSON string from the response"]
        J["Render cards, the edit modal, and game state"]
    end
    subgraph S1["Our API (Next.js server)"]
        G["Receive the request and pass the prompt to Genkit"]
        I1["Return { jsonMarkdownString: '...'}"]
    end
    subgraph T1["Third-party service"]
        J1["Gemini generates structured term data"]
    end
    F --> G
    G --> J1
    J1 --> I1
    I1 --> I
    H --> I
    I --> J
```

```mermaid
flowchart TB
    subgraph C1["クライアント（ブラウザ）"]
        A["ホーム画面で文章を貼り付ける"] --> B["文章は activeText として保存される"]
        B --> C["1ページ分の文章を localStorage に保存する"]
        C --> D["文章をハッシュに変換する"]
        D --> E["そのハッシュに対応する JSON があるか確認する"]
        E -->|キャッシュあり| H["保存済みの JSON 単語データを再利用する"]
        E -->|キャッシュなし| F["text と mode: vocabGame を付けて /api/llm に POST する"]
        I["レスポンスの JSON 文字列をパースする"]
        J["カード、編集モーダル、ゲーム状態を画面に表示する"]
    end
    subgraph S1["自分たちの API（Next.js サーバー）"]
        G["リクエストを受けて Genkit にプロンプトを渡す"]
        I1["{ jsonMarkdownString: '...'} を返す"]
    end
    subgraph T1["外部サービス"]
        J1["Gemini が構造化された単語データを生成する"]
    end
    F --> G
    G --> J1
    J1 --> I1
    I1 --> I
    H --> I
    I --> J
```

## Japanese Speaker Lines

1. 日本語を勉強するときに使うツールです。
2. ここに日本語の文章を貼り付けます。
3. submit を押すと、文章がページごとに分割されます。
4. gravity ボタンを押すと、ゲームを始められます。
5. 単語は画面の上から落ちてきます。
6. 下まで落ちる前に、答えを入力します。
7. 赤い線を越えると、その単語を練習することになります。
8. 2回連続で間違えると、ゲームオーバーです。
9. 単語は、進むほど速く落ちてきます。

## Sample Passage

1. 毎朝、私は駅まで歩いて通勤します。
2. 途中で、小さな公園の横を通ります。
3. 近くのパン屋は、朝早くからいい香りがします。
4. 仕事の前に、コーヒーを一杯買うことが多いです。
5. 電車の中では、短い記事を読むようにしています。
6. 新しい単語が出てきたら、ノートに書き留めます。
7. 昼休みに、もう一度その単語を見直します。
8. 何度か見ると、意味が少しずつ覚えやすくなります。
9. 夕方には、文章全体の内容がだいぶ分かるようになります。
10. こうして、毎日の読書が少しずつ学習につながります。
