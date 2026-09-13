---
title: テスト
description: 重要なフローの動作に確信を持てます。
sidebar:
  order: 8
---
## 品質チェック [#quality-checks]

```sh
npm run check
```

Ultracite による lint、TypeScript のチェック、ポリシーと入力のテスト、および両アプリの本番用ビルドを実行します。ビルドに実際のプロバイダーの認証情報は必要ありません。

## データベースのフィクスチャ [#database-fixtures]

```sh
npm run test:database
```

Docker で分離されたローカルの Postgres データベースを起動し、マイグレーションを実行します。実際の Better Auth セッション、レコードの所有権、不正な入力、RLS、署名付き Webhook、重複配信、再試行時のロールバック、サブスクリプションに基づくアクセスをテストします。Stripe と Resend へのネットワーク呼び出しはフィクスチャに置き換えられます。

## ブラウザーでの操作フロー [#browser-flows]

```sh
npm run test:browser
```

両アプリをビルドし、ローカルの本番用サーバーと使い捨てのデータベースを起動します。マーケティングサイトのナビゲーション、ログイン、オンボーディング、ノート、設定、モバイルレイアウト、ログアウト、ルート保護を検証します。

## プロバイダーの検証 [#provider-verification]

ローカルのフィクスチャでは、実際の Neon や Supabase への接続、Resend による配信、Stripe Checkout、本番環境のホスティングが正常に動作することは確認できません。公開前に、個別のテスト用リソースでこれらを確認してください。
