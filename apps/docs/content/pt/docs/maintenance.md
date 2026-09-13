---
title: Atualizações do template
description: Mantenha seu projeto independente e incorpore correções úteis.
sidebar:
  order: 10
---
Cada versão do inicializador inclui um monorepo testado e um arquivo de lock do npm. A geração do projeto não faz nenhum download do GitHub. `template-origin.json` registra a versão, o preset e o hash do conteúdo. Faça você mesmo o commit do estado inicial de cada projeto gerado para comparar depois. Os pacotes internos @repo pertencem àquele projeto e não são baixados do template original.

Personalize `packages/config/index.ts`, os textos do app, os metadados e as notas de exemplo. Cada projeto tem seus próprios recursos de provedores e ambiente. Nunca distribua `.env.local` nem credenciais reais. Os projetos gerados não dependem de create-feldra e não mudam automaticamente quando ele é atualizado.

Para correções futuras, publique uma nova versão do inicializador com os arquivos afetados, as migrações e a validação no histórico de alterações. Gere projetos temporários com as versões antiga e nova, examine as diferenças relevantes e aplique manualmente um patch revisado. Resolva as personalizações com cuidado; execute lint/verificação de tipos/testes/build e as verificações com os provedores reais daquele projeto. Aplique as novas migrações em ordem, nunca reescreva uma migração já aplicada. Não há sincronização automática nem camada de intercâmbio entre provedores.

## Projetos existentes da versão 0.1 [#existing-01-projects]

A versão 0.2 muda o sistema de arquivos e o modelo de implantação. Os projetos existentes, incluindo qualquer diretório `my-new-saas` criado a partir da versão 0.1, não são modificados ao atualizar esta base. O projeto antigo continua utilizável. Gere um **novo destino** a partir da versão 0.2 para obter a nova estrutura; não execute o inicializador no diretório antigo.

Para migrar manualmente suas personalizações, mapeie as rotas de marketing para `apps/web/src/app`, as rotas autenticadas, os componentes e as notas de exemplo para `apps/app/src`, e os serviços para os `packages` correspondentes. Mantenha o banco de dados existente e seu histórico de migrações se este for o **mesmo SaaS**. O esquema SQL e a migração não mudam com a refatoração. Defina APP_URL como a origem do app autenticado e WEB_URL como a origem do site de marketing; atualize as configurações de webhook e redirecionamento do Stripe para a origem do app e teste novamente os links de e-mail e as sessões. Um novo SaaS diferente, derivado da base, deve receber recursos independentes de provedores, como antes.

Para a versão com seleção de banco de dados, aplique a migração `0001_previous_vampiro.sql` antes de expor um banco de dados Supabase. Ela habilita RLS sem políticas de cliente em todas as tabelas da base inicial. Projetos Neon existentes também podem aplicá-la. As conexões do servidor devem usar os proprietários das tabelas ou uma role BYPASSRLS configurada explicitamente. Mantenha a migração original; não recrie um banco de dados existente.
