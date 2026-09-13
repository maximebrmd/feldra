---
title: Ambiente e provedores
description: Conecte seus próprios serviços, sem compartilhar credenciais entre projetos.
sidebar:
  order: 2
---
## Ambiente local [#local-environment]

O inicializador cria `.env.local` a partir de `.env.example` e gera um novo segredo do Better Auth. Os campos dos provedores ficam vazios. Eles são validados quando usados, então a falta de configuração causa um erro explícito.

| Variável | O que configurar |
| --- | --- |
| `WEB_URL` | Origem do site de marketing; localmente, `http://localhost:3000` |
| `APP_URL` | Origem da aplicação; localmente, `http://localhost:3001` |
| `BETTER_AUTH_SECRET` | Segredo local gerado; use um segredo diferente em produção |
| `DATABASE_URL` | Conexão Postgres com pool do seu provedor |
| `DATABASE_URL_UNPOOLED` | Conexão direta para migrações ou pooler de sessão do Supabase em IPv4 |
| `RESEND_API_KEY` | Chave da sua própria conta Resend |
| `EMAIL_FROM` | Um endereço de e-mail no seu domínio de envio verificado |
| `STRIPE_SECRET_KEY` | Chave secreta do ambiente de testes do Stripe durante o desenvolvimento |
| `STRIPE_WEBHOOK_SECRET` | Segredo de assinatura do listener ou endpoint que você usa |
| `STRIPE_PRO_PRICE_ID` | Preço recorrente correspondente ao seu plano |
| `STRIPE_LIVE_MODE` | `false` para o ambiente de testes; `true` apenas com os recursos de produção correspondentes |

## Configuração do banco de dados [#database-setup]

Siga [Escolha seu banco de dados](/docs/databases/) para saber sobre modos de conexão, TLS e restrições da Data API do Supabase. Use recursos independentes dos provedores para cada SaaS e separe desenvolvimento de produção.

## E-mail transacional [#transactional-email]

Verifique um domínio de remetente no Resend. Preencha `RESEND_API_KEY` e `EMAIL_FROM` e teste um e-mail de verificação de cadastro e um e-mail de redefinição de senha usando a origem pública da sua aplicação.

## Configuração de assinaturas [#subscription-setup]

Crie um produto no ambiente de testes e um preço recorrente no Stripe, ative o portal do cliente e configure seu endpoint de webhook. Siga [Assinaturas e cobrança](/docs/billing/) e o arquivo gerado `docs/setup.md` para conferir os eventos exatos e as permissões das chaves restritas.

## Mantenha os segredos privados [#keep-secrets-private]

Nunca inclua `.env.local` em commits, coloque credenciais do banco de dados em variáveis de ambiente públicas ou reutilize os segredos de um projeto derivado em outro SaaS. Os deploys de prévia não devem se conectar aos dados de produção. Apenas a aplicação autenticada precisa das credenciais dos provedores.
