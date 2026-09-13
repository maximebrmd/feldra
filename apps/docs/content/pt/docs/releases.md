---
title: Histórico de alterações
description: O que mudou e como o template evolui.
sidebar:
  order: 11
---
## Status da versão [#release-status]

Feldra é a nova marca do projeto. O inicializador atualmente se chama `create-feldra` e ainda não foi publicado no npm. Os mantenedores gerenciam o versionamento com Changesets.

## Fluxo de lançamento [#release-workflow]

```sh
npm run changeset
npm run changeset:status
npm run release:version
```

O comando de versionamento processa as notas pendentes, gera `packages/feldra/CHANGELOG.md`, atualiza as versões do inicializador e da raiz e atualiza o arquivo de lock. Ele não publica nada. Teste o artefato empacotado antes de uma publicação no npm explicitamente autorizada.

## Histórico de versões locais [#local-release-history]


### 0.3.0

- Seleção interativa do banco de dados Neon/Supabase com as teclas de seta, além de `--database` para CI.
- Instruções de configuração geradas, comentários sobre o ambiente e metadados de origem específicos de cada provedor.
- Habilitar RLS em todas as tabelas privadas; manter as verificações de propriedade no servidor e o acesso compartilhado via Postgres/Drizzle.
- Testar as duas opções de banco de dados a partir da versão empacotada para o npm.


### 0.2.0 — não lançada [#020-\-unreleased]

- Gerar um monorepo npm no estilo next-forge com apps Next separados para marketing e acesso autenticado, seis pacotes compartilhados que exportam código-fonte e Turborepo.
- Adicionar prompts de configuração/revisão no terminal, `--preset neon` e manter a automação com `--yes`/sem TTY. Sem opções de provedores não implementados.
- Manter o conjunto de ferramentas Neon/Better Auth/Stripe/Resend já implementado e a migração do banco de dados sem alterações.
- Testar os dois apps de produção, a navegação entre apps, o grafo de tarefas do workspace e a distribuição empacotada real. Os projetos gerados existentes não são modificados automaticamente.

### 0.1.0 — não lançada [#010-\-unreleased]

Base inicial de SaaS com um único app e inicializador npm incluído. Substituída pela arquitetura de monorepo solicitada na versão 0.2.0.
