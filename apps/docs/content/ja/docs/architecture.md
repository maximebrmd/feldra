---
title: アーキテクチャ
description: アプリを分離し、基本機能を共有します。一貫性のあるワークスペースを構成します。
sidebar:
  order: 3
---
## ワークスペース [#the-workspace]

```text
apps/
  web/                  Marketing and pricing · port 3000
  app/                  Authenticated UI, APIs, webhooks · port 3001
packages/
  auth/                 Better Auth server and client
  config/               App name, URLs, plans, environment validation
  database/             Drizzle schema and migrations
  design-system/        Used shadcn components and shared styles
  email/                Resend authentication emails
  payments/             Stripe state and paid-access rules
turbo.json
package.json
```

テンプレートリポジトリには、`apps/docs` にこの Astro ドキュメントアプリも含まれています。このアプリはドキュメント用に個別にデプロイされ、生成される SaaS プロジェクトには含まれません。

## デプロイ単位の境界 [#deployable-boundaries]

`apps/web` は公開アプリです。そのリンクは、ユーザーを登録、ログイン、請求管理のために `APP_URL` へ誘導します。`apps/app` は認証 Cookie と、すべての API および Webhook ルートを管理します。オリジンを分離することで、サブドメインをまたいで広範囲に適用される Cookie ポリシーを避けられます。

共有パッケージは TypeScript ソースをエクスポートします。各パッケージは、実際に使用する依存関係を宣言します。学習が必要なプロバイダーアダプターやプラグインフレームワークはありません。

## 設定 [#configuration]

`packages/config/index.ts` でプロダクト名とプランを設定します。環境変数に `APP_URL` と `WEB_URL` を設定します。決済の受け付けを開始する前に、設定したプランに合わせて Stripe の継続課金の価格を変更してください。

## ローカルでの作業 [#working-locally]

```sh
npm run dev
npm run dev --workspace web
npm run dev --workspace app
npm run typecheck
npm run lint
```

Turborepo はワークスペースのタスクを実行し、ビルド出力をキャッシュします。派生した各プロジェクトは、独自のロックファイルと内部の `@repo/*` パッケージを管理します。
