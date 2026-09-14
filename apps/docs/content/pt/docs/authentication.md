---
title: Autenticação
description: Contas verificadas, sessões seguras e fluxos de e-mail integrados.
sidebar:
  order: 5
---
## O Better Auth gerencia a identidade [#better-auth-owns-identity]

O padrão é o Better Auth com o adaptador Drizzle. A escolha do banco de dados é independente: Neon ou Supabase Postgres não instala o Supabase Auth. Passe `--auth supabase` quando quiser usar o Supabase Auth.

Os usuários se cadastram com e-mail e senha, verificam o e-mail e entram. A verificação é obrigatória para acessar a aplicação. Os fluxos de recuperação e redefinição de senha enviam links com prazo de validade pelo Resend.

## Proteção de sessões [#session-protection]

Os layouts protegidos orientam a navegação, mas cada rota e página protegida também faz a autenticação no servidor. Os IDs dos proprietários vêm da sessão verificada, nunca dos dados enviados pelo formulário. A revogação de sessões não é adiada por um cache de cookies no cliente.

As rotas personalizadas de mutação validam sua origem. O Better Auth gerencia suas próprias verificações de CSRF e origens confiáveis. Mantenha a origem da aplicação exata e use HTTPS em produção.

## Configuração de e-mail [#email-configuration]

Verifique um domínio de envio no Resend e configure `RESEND_API_KEY` e `EMAIL_FROM`. Defina `APP_URL` como a origem da aplicação para que os links de verificação e redefinição retornem ao host correto.

Nunca reutilize em produção o segredo de autenticação gerado localmente. Configure um `BETTER_AUTH_SECRET` separado com pelo menos 32 caracteres.

## Verifique o fluxo [#verify-the-flow]

```sh
npm run test:database
```

A suíte de testes com fixtures exercita os fluxos reais de cadastro, verificação, login, redefinição de senha, logout e revogação de sessões do Better Auth com Postgres local. Ela intercepta o envio de e-mails nos testes. A entrega real na caixa de entrada ainda precisa ser verificada usando sua conta do Resend.

## Alternativas com Clerk e Supabase Auth [#clerk-and-supabase-auth-alternatives]

Escolha Clerk no inicializador ou passe `--auth clerk`. Isso gera login, cadastro, logout e configurações de conta com Clerk, além de verificações de sessão no servidor. Apenas um e-mail principal verificado é aceito; os registros locais usam o ID de usuário do Clerk como chave e nunca são vinculados automaticamente por e-mail. As assinaturas do Stripe e as notas privadas mantêm esse ID estável do proprietário.

Crie uma aplicação independente no Clerk e configure suas chaves publicável e secreta. O Clerk envia os e-mails de autenticação, então essa variante não instala Resend nem Better Auth. O guia gerado explica como exigir a verificação de e-mail, configurar as origens de produção e validar os fluxos hospedados. Na ausência de credenciais, o acesso é bloqueado e nenhuma instância do Clerk sem chaves é provisionada.

As seções acima descrevem a variante padrão com Better Auth. Os projetos com Clerk recebem seu próprio guia de configuração de autenticação e testes locais com fixtures. Login, verificação de e-mail, redefinição de senha e logout reais com Clerk ainda exigem uma instância de desenvolvimento configurada.

## Alternativa com Auth.js [#authjs-alternative]

Escolha Auth.js no inicializador ou passe `--auth authjs`. Isso gera login com GitHub OAuth (e uma página de cadastro que inicia o mesmo fluxo), logout e verificações de sessão no servidor. O primeiro callback bem-sucedido cria o usuário local. O GitHub deve fornecer um e-mail principal verificado; os registros locais usam o ID de usuário do GitHub (`github:{id}`) como chave e nunca são vinculados automaticamente por e-mail. As assinaturas do Stripe e as notas privadas mantêm esse ID estável do proprietário.

Crie um aplicativo GitHub OAuth para este projeto. Defina a URL da página inicial como `APP_URL` e a URL de callback de autorização como `APP_URL/api/auth/callback/github`. Defina `AUTH_GITHUB_ID` e `AUTH_GITHUB_SECRET`. O inicializador grava um `AUTH_SECRET` local; gere um valor distinto para produção. O Auth.js não instala Resend nem Better Auth; o GitHub trata a verificação de e-mail e a recuperação de senha. Na ausência de credenciais, o acesso é bloqueado e nenhum aplicativo OAuth é provisionado.

Os projetos com Auth.js recebem seu próprio guia de configuração de autenticação e testes locais com fixtures. O GitHub OAuth real ainda exige um aplicativo OAuth configurado.

Escolha o Supabase Auth com `--auth supabase`. Isso é independente de `--database`: você pode manter o Neon para Postgres e ainda usar um projeto do Supabase para identidade. O overlay usa sessões de cookie do `@supabase/ssr`, um proxy do Next.js para atualizar tokens e verificações `getUser()` no servidor em cada recurso protegido. Confirme o e-mail no projeto do Supabase, defina `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e registre `/api/auth/callback`. Nunca adicione a chave de service role. O Supabase envia os e-mails de autenticação; Resend e Better Auth são omitidos.

Os projetos com Clerk, Auth.js e Supabase Auth recebem seu próprio guia de configuração de autenticação e testes locais com fixtures. Login, verificação de e-mail, redefinição de senha e logout reais ainda exigem uma instância de desenvolvimento configurada.
