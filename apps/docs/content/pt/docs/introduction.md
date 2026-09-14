---
title: Introdução
description: Um ponto de partida bem pensado para o SaaS que você quer criar.
sidebar:
  order: 0
---
O Feldra reúne as partes essenciais de um SaaS em um ambiente de trabalho que é seu. Marketing, autenticação, dados privados, assinaturas e e-mails transacionais estão conectados para você focar no seu produto.

## Uma base, não uma plataforma [#a-foundation-not-a-platform]

Seu projeto gerado é um repositório Git independente, com suas próprias dependências, banco de dados e credenciais de provedores. Ele não depende deste template nem do inicializador em tempo de execução.

A arquitetura se inspira no next-forge: dois apps Next.js que podem ser implantados e um pequeno conjunto de pacotes compartilhados, coordenados com Turborepo e npm workspaces.

## O que você recebe [#what-you-get]

- **Um site público** com páginas de apresentação e preços.
- **Um app com autenticação** com cadastro, verificação, login, redefinição de senha, configuração inicial e configurações de conta.
- **Notas privadas** como um exemplo claramente identificado de CRUD com validação e autorização.
- **Assinaturas** com Stripe Checkout, portal do cliente, webhooks assinados e controle de acesso pago no servidor.
- **E-mails transacionais** pelo Resend.
- **Um fluxo de trabalho testado** com Ultracite, TypeScript, builds de produção, dados de teste para o banco de dados e verificações no navegador.

## Uma stack enxuta e bem pensada [#a-small-deliberate-stack]

| Área | Ferramenta incluída |
| --- | --- |
| Aplicação | Next.js App Router e TypeScript |
| Banco de dados | Postgres da Neon ou do Supabase com Drizzle |
| Autenticação | Better Auth |
| Estilização | Tailwind CSS e componentes utilizados do shadcn/ui |
| Cobrança | Stripe |
| E-mail | Resend |
| Qualidade | Ultracite, TypeScript e testes |

Contas individuais e cobrança por usuário são a base. Organizações, IA, filas, CMS, analytics e colaboração em tempo real ficam intencionalmente fora do escopo.

## Comece a criar [#start-building]

Acesse o [guia de início rápido](/docs/quickstart/) para criar seu primeiro projeto independente ou explore a [arquitetura](/docs/architecture/) antes de começar.

> Feldra é o novo nome do projeto. O repositório no GitHub é `maximebrmd/feldra`. O pacote inicializador é `feldra`. Após a publicação, execute `npx feldra` ou `npm exec feldra`.
