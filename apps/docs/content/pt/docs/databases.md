---
title: Escolha seu banco de dados
description: Neon ou Supabase. A mesma base Postgres.
sidebar:
  order: 4
---
O inicializador oferece Neon e Supabase para você selecionar com as teclas de seta e Enter. Os comandos não interativos usam `--yes --database neon` ou `--yes --database supabase`. Neon é a opção padrão. O banco de dados selecionado fica registrado em `template-origin.json`, `.env.example` e `DATABASE.md`.

As duas opções usam o mesmo esquema Drizzle, as mesmas migrações, o driver node-postgres e o adaptador Drizzle do Better Auth. São conexões Postgres padrão; você não precisa do SDK do Supabase, do Supabase Auth, de uma chave anônima ou de uma chave de API service-role. A seleção do banco de dados muda as instruções de configuração, não as APIs da sua aplicação. O inicializador não provisiona nenhum recurso.

## Neon

Crie um projeto Neon independente para cada SaaS. Copie a URL de conexão com pool para `DATABASE_URL` e a URL direta para `DATABASE_URL_UNPOOLED`. Mantenha os parâmetros de segurança da conexão fornecidos pelo Neon. Configure branches/bancos de dados separados para desenvolvimento e produção.

## Supabase

Crie um projeto Supabase independente para cada SaaS. No painel **Conectar** do dashboard, copie a string de conexão do **pooler de transações** (porta 6543) para `DATABASE_URL`. Use a **conexão direta** para `DATABASE_URL_UNPOOLED` (migrações); em uma rede que só aceita IPv4, use o **pooler de sessões** (porta 5432) no lugar dela. Copie o host e o nome de usuário exatos do dashboard, insira a senha do seu banco de dados com codificação de URL e mantenha as configurações de TLS exigidas. Não desative a verificação de certificados para contornar erros de conexão. Veja as [opções de conexão do Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

Use as credenciais do proprietário do banco de dados fornecidas pelo projeto para o servidor e as migrações. O pooler de transações não oferece suporte a instruções preparadas nomeadas; este template não cria nenhuma. Não adicione consultas com `.prepare()` sem reavaliar o modo de conexão. O pool do servidor usa uma conexão por processo; a concorrência da implantação ainda precisa respeitar os limites de conexão do seu provedor.

Desative a **API de Dados** não utilizada nas configurações do projeto Supabase. Este template disponibiliza dados apenas por meio de handlers de rota autenticados do Next.js. A migração dele habilita a segurança em nível de linha em todas as nove tabelas, sem políticas para clientes. Isso impede leituras e escritas por roles que não sejam proprietárias e não tenham BYPASSRLS, mesmo que existam permissões nas tabelas. Isso protege tokens de autenticação, hashes de senha, estado de cobrança e notas privadas contra o acesso direto por clientes. As consultas do servidor são executadas como proprietário da tabela, que ignora a RLS; as verificações no servidor de que os dados pertencem ao usuário continuam obrigatórias. O acesso à API com service-role do Supabase também ignora a RLS; mantenha essa chave privada. Nunca exponha URLs de banco de dados ao navegador. Veja a [segurança da API do Supabase](https://supabase.com/docs/guides/api/securing-your-api) e a [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Mantenha a RLS habilitada em qualquer nova tabela que você adicionar. Se você habilitar a API de Dados depois, revise explicitamente os esquemas expostos, as permissões das tabelas e as políticas; sessões do Better Auth não são JWTs do Supabase. Nenhuma integração com o Supabase Auth está incluída.

## Conclua a configuração [#finish-setup]

Preencha os valores do Resend e do Stripe conforme descrito em [configuração](/docs/environment/) e execute os comandos a partir da raiz do projeto gerado:

```sh
npm run db:migrate
npm run check
npm run dev
```

Mantenha `.env.local` privado. Use credenciais e recursos dos provedores diferentes para cada projeto e ambiente. As migrações precisam ser executadas antes de permitir tráfego para um novo banco de dados. As fixtures de teste usam um Postgres local descartável; a conectividade real com Neon/Supabase exige suas credenciais e não é verificada pelos testes com fixtures.
