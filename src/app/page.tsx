import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white md:max-w-[80%]">
              岩手県大船渡市の山林火災で、市は延焼のおそれがなくなったとして、9日午後1時に赤崎町の4つの地区について、避難指示を解除しました。
              一方、引き続き、三陸町綾里全域と赤崎町の3つの地区に避難指示が出されてますが、これらの地域についても大船渡市は、10日以降の解除を検討しています。
              先月26日に岩手県大船渡市で発生した山林火災では、市の面積の9％にあたるおよそ2900ヘクタールが焼失しましたが、この3日間、新たな延焼は確認されていません。
              大船渡市は延焼のおそれがなくなったとして、7日から徐々に避難指示の解除を進めています。
              避難指示が解除されたのは、赤崎町の蛸ノ浦地区、清水地区、永浜地区、大立地区のあわせて361世帯882人です。
              さらに赤崎町の長崎地区、外口地区、合足地区と三陸町綾里の全域の残りのすべての地区についても、10日以降の避難指示の解除を検討しています。
              また、今回の火災では、一部の現地調査の結果、これまでに78棟の住宅や空き家などで被害が確認されていますが、大船渡市はすべての地域で調査を終え、現在、とりまとめを行っているということで今後、被害の数が増える見通しを示しました。
              市は、くすぶっている熱源や残り火の消火活動を続けるとともに住宅が被害を受けた人たちに向けて、岩手県と仮設住宅建設の調整を進めているほか、空いている公営住宅や、民間のアパートを活用する「みなし仮設」の検討を進めています。
              鬼沢漁港 避難していた漁船が戻る
              8日に避難指示が解除された地区では、避難先から漁港に戻る漁船の姿が見られました。
              越喜来の甫嶺東地区にある鬼沢漁港では、9日午前7時ごろから、別の地域に避難していた漁船が次々と戻ってきていました。
              この地区では、ワカメの養殖が盛んで、再開に向けて漁港で浮きやロープを漁船に積み込んだり、沖合でワカメを間引く作業をしたりする漁師の姿が見られました。
              30代の男性は、「火事で家もなくなってしまうと覚悟していたので無事でよかった。作業も再開できそうで、日常に近い生活に戻れるかと思う」と安どした様子でした。
              避難生活が続いたことでワカメの収穫量が減る人もいるとして、「こういう状況なので仲間と協力しながらできることを1日1日やっていきたい」と話していました。
              三陸鉄道 一部区間で運転再開
              三陸鉄道は山林火災の影響で、今月2日から盛駅と釜石駅の間で運転をとりやめていましたが、9日の始発から三陸駅と釜石駅の間で本数を減らして折り返し運転を再開しました。
              三陸鉄道によりますと、三陸駅と釜石駅の間の沿線への電力供給が再開し、設備の安全が確認できたため運転再開を決めたということです。
              一方、盛駅と三陸駅の間は引き続き運転を見合わせています。
              避難指示が解除されるまでは、代行バスを運行しますが、避難指示区域をう回するため陸前赤崎駅、綾里駅、恋し浜駅、甫嶺駅には停車しません。
              三陸鉄道は避難指示が解除されたあと、設備の安全を確認したうえで運転を順次再開するとしています。
              達増知事「応急仮設住宅の提供 住宅再建の支援もしっかり」
              岩手県の達増知事はNHKの「日曜討論」で「避難者が多いので、本格的な災害対策として食事の提供や安全な生活環境を保証することをやらなければいけない。また、住宅を失った方への応急仮設住宅の提供、住宅再建の支援もしっかりやっていく。消火で終わらずに、復旧から復興と呼べるように、地域活性化につながる事業もやっていかなければならない」と述べました。
              渕上市長「制度の枠超え 被災状況にあった形で支援を」
              岩手県大船渡市の渕上清市長はNHKの「日曜討論」で「住宅を失った人は住まいの再建が必要で、水産業をはじめ多くの産業にも影響が出ている。制度の枠を超えて被災状況にあった形で支えてもらいたい。東日本大震災から14年でやっと再生が軌道に乗り始めたところでの被災となり、国や県には力強い支援をお願いして復旧・復興を進めていきたい」と述べました。
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>

          {session?.user && <LatestPost />}
        </div>
      </main>
    </HydrateClient>
  );
}
