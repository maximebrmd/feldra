---
title: Histórico de alterações
description: O que mudou e como o template evolui.
sidebar:
  order: 11
---
## Status da versão [#release-status]

Feldra é a nova marca do projeto. O pacote inicializador é `feldra` e ainda não foi publicado no npm. A versão local permanece em **0.1.0** até um lançamento público explícito. Após a publicação, execute `npx feldra create`. Os mantenedores gerenciam o versionamento com Changesets. Não mescle PRs de versão que ultrapassem 0.1.0 enquanto o pacote não estiver publicado.

## Fluxo de lançamento [#release-workflow]

```sh
npm run changeset
npm run changeset:status
npm run release:version
```

O comando de versionamento processa as notas pendentes, gera `packages/feldra/CHANGELOG.md`, atualiza as versões do inicializador e da raiz e atualiza o arquivo de lock. Ele não publica nada. Deixe os changesets pendentes sem consumir até que a 0.1.0 seja autorizada no npm. Teste o artefato empacotado antes de uma publicação no npm explicitamente autorizada. Veja [o guia de lançamento do repositório](https://github.com/maximebrmd/feldra/blob/main/docs/releasing.md).

## Histórico de versões locais [#local-release-history]

### 0.1.0 — primeiro lançamento público (ainda não publicado) [#010-\-first-public-release-not-published-yet]

Histórico de desenvolvimento local anteriormente numerado como 0.2.0/0.3.0 na árvore, nunca publicado no npm, mais as notas de changeset pendentes:

- **Breaking:** renomear o pacote publicado e a CLI de `create-feldra` para `feldra`. Execute `npx feldra create` em vez de `npm create feldra`. Um `npx feldra` sem argumentos imprime a ajuda listando `create`.
- Renomear o template para Feldra. Atualizar a identidade visual, os comandos da CLI, os metadados de lançamento, os testes e a documentação dos projetos gerados. A publicação no npm continua sendo um passo de lançamento separado.
- Mover o pacote inicializador de `initializer/` para `packages/feldra`.
- Gerenciar os lançamentos do inicializador com Changesets e changelogs gerados. Manter as ferramentas de lançamento fora dos projetos SaaS gerados e sincronizar as versões de lançamento com o template empacotado.
- Entregar um README de produto nos projetos gerados em vez do README do repositório de origem.
- Adicionar o site de documentação Astro independente do Feldra e excluir o app e as ferramentas dele dos projetos SaaS gerados. Usar uma versão compartilhada do TypeScript compatível com a verificação do Astro.
- Adicionar a escolha independente de Better Auth ou Clerk junto com Neon ou Supabase. Empacotar o código do Clerk e um lockfile de dependências resolvido, remover as ferramentas não usadas de Better Auth/Resend dos projetos Clerk, preservar a autorização no servidor e documentar a configuração da autenticação gerenciada e os limites da verificação ao vivo.
- Seleção interativa do banco de dados Neon/Supabase com as teclas de seta, além de `--database` para CI.
- Instruções de configuração geradas, comentários sobre o ambiente e metadados de origem específicos de cada provedor.
- Habilitar RLS em todas as tabelas privadas; manter as verificações de propriedade no servidor e o acesso compartilhado via Postgres/Drizzle.
- Testar as duas opções de banco de dados a partir da versão empacotada para o npm.
- Gerar um monorepo npm no estilo next-forge com apps Next separados para marketing e acesso autenticado, seis pacotes compartilhados que exportam código-fonte e Turborepo.
- Adicionar prompts de configuração/revisão no terminal, `--preset neon` e manter a automação com `--yes`/sem TTY. Sem opções de provedores não implementados.
- Manter o conjunto de ferramentas Neon/Better Auth/Stripe/Resend já implementado e a migração do banco de dados sem alterações.
- Testar os dois apps de produção, a navegação entre apps, o grafo de tarefas do workspace e a distribuição empacotada real. Os projetos gerados existentes não são modificados automaticamente.
- Base inicial de SaaS com um único app e inicializador npm incluído, depois substituída pela arquitetura de monorepo acima.
