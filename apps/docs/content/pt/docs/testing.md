---
title: Testes
description: Confiança nos fluxos que importam.
sidebar:
  order: 8
---
## Verificações de qualidade [#quality-checks]

```sh
npm run check
```

Executa a análise de lint do Ultracite, verificações do TypeScript, testes de políticas e entradas e builds de produção dos dois apps. Você não precisa de credenciais reais dos provedores para o build.

## Fixtures do banco de dados [#database-fixtures]

```sh
npm run test:database
```

O Docker inicia um banco de dados Postgres local isolado, executa as migrações e testa sessões reais do Better Auth, a propriedade dos registros, entradas inválidas, RLS, webhooks assinados, entregas duplicadas, rollback em novas tentativas e acesso por assinatura. As chamadas de rede ao Stripe e ao Resend são substituídas por fixtures.

## Fluxos no navegador [#browser-flows]

```sh
npm run test:browser
```

Gera os builds dos dois apps, inicia servidores locais de produção e um banco de dados descartável e testa a navegação nas páginas de marketing, login, integração inicial, notas, configurações, layout para dispositivos móveis, logout e proteção de rotas.

## Verificação dos provedores [#provider-verification]

As fixtures locais não comprovam a conectividade real com o Neon ou o Supabase, as entregas pelo Resend, o funcionamento do Stripe Checkout nem a hospedagem em produção. Execute essas verificações com recursos de teste separados antes do lançamento.
