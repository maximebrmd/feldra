---
title: クイックスタート
description: 新しいフォルダーから、自分だけのワークスペースを作成します。
sidebar:
  order: 1
---
## 前提条件 [#prerequisites]

Node.js 24 LTS、Bun 1.4.0、Git を使用します。Docker が必要なのは、ローカルのデータベースとブラウザーのフィクスチャを使用する場合のみです。テンプレートのビルドやこれらのフィクスチャの実行に、プロバイダーの認証情報は必要ありません。

## ソースを取得します [#get-the-source]

```sh
git clone https://github.com/maximebrmd/feldra.git feldra
cd feldra
bun install
```

## プロジェクトを作成します [#create-your-project]

初期化ツールはまだ npm に公開されていません。まず、バージョン付きのローカルパッケージをビルドします。

```sh
bun run initializer:pack
```

このコマンドはソースを検証し、リポジトリのルートに `feldra-VERSION.tgz` を書き出します。以下の VERSION を `packages/feldra/package.json` に記載されているバージョンに置き換えてください。

```sh
npm exec --yes --package="./feldra-VERSION.tgz" -- feldra create my-new-saas
```

矢印キーと Enter キーを使って **Neon** または **Supabase**、次に **Better Auth**、**Clerk**、**Auth.js**、**Supabase Auth**、または **Appwrite**、ストレージとして **Cloudflare R2** または **Vercel Blob**、そして **Blume**、**Mintlify**、または **Fumadocs** を選択します。初期化ツールは依存関係をインストールし、ローカル環境ファイルを書き出して、新しい Git リポジトリを初期化します。作成先がすでに存在する場合は、空であっても処理を拒否します。

非対話形式で実行するには、プロジェクト名の後に `--yes --database supabase --storage blob --docs mintlify` を追加します。`--storage` のデフォルトは Cloudflare R2 です。生成される各プロジェクトには、プロバイダー固有の設定と認証情報に関する案内を記載した `STORAGE.md` が含まれます。`--docs` のデフォルトは `blume` です。相対パスと、スペースを含む引用符で囲まれたパスの両方を使用できます。

## プロバイダーに接続します [#connect-your-providers]

```sh
cd my-new-saas
```

生成された `DATABASE.md`、`AUTHENTICATION.md`、`STORAGE.md` と[環境設定ガイド](/docs/environment/)を参照して、`.env.local` に値を入力します。ローカル用の新しい Better Auth または Auth.js シークレットはすでに生成されています。Clerk、Supabase Auth、Appwrite、および残りのプロバイダーの認証情報は別途設定する必要があります。

```sh
npm run db:migrate
npm run check
npm run dev
```

マーケティングサイトには **localhost:3000**、認証が必要なアプリケーションには **localhost:3001** でアクセスします。

## npm への公開後 [#after-npm-publication]

現在のパッケージが公開されると、次のコマンドでプロジェクトを作成できるようになります。

```sh
npx feldra@latest create my-new-saas
```

同等のコマンドは `npm exec feldra@latest -- create my-new-saas` です。パッケージが明示的に公開されるまでは、この公開用コマンドを使用しないでください。1 つのコマンドでひな形の作成とインストールを行いますが、プロバイダーのアカウント作成や認証情報の設定は行いません。

## 認証方法を選択します [#choose-authentication]

データベースを選択した後、**Better Auth**（デフォルト）、**Clerk**、**Auth.js**、**Supabase Auth**、または **Appwrite** を選択します。Better Auth は、確認メールとパスワードリセットメールに Resend を使用します。Clerk は、自身が管理するコンポーネントとメール配信機能を使用します。Auth.js は GitHub OAuth を使用します。Supabase Auth は Supabase Auth API を使用し、データベースの選択から独立しています。Appwrite はマネージド ID と認証メールを使用します。Clerk、Auth.js、Supabase Auth、および Appwrite を選択したプロジェクトには Better Auth と Resend は含まれません。

CI では、ローカルの初期化コマンドに `--auth better-auth`、`--auth clerk`、`--auth authjs`、`--auth supabase`、または `--auth appwrite` を追加します。いずれも `--database neon` または `--database supabase`、および `--docs blume`、`--docs mintlify`、または `--docs fumadocs` と組み合わせて使用できます。`--list-tools` は、ファイルを作成せずに、サポートされている選択肢を一覧表示します。実際の認証をテストする前に、生成された `AUTHENTICATION.md` の手順に従ってください。これらの選択肢はそれぞれ独立したプロジェクトを作成するものであり、既存のユーザーをサービス間で移行するものではありません。このリポジトリのプロダクトドキュメントには引き続き Blume を使用します。
