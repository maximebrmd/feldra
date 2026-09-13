---
title: Autenticação
description: Contas verificadas, sessões seguras e fluxos de e-mail integrados.
sidebar:
  order: 5
---
## O Better Auth gerencia a identidade [#better-auth-owns-identity]

As duas opções de banco de dados usam o Better Auth com o adaptador Drizzle. O Supabase é usado apenas como Postgres; não é necessário usar Supabase Auth, chave anônima ou cliente de banco de dados no navegador.

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

## Alternativa com Clerk [#clerk-alternative]

Escolha Clerk no inicializador ou passe `--auth clerk`. Isso gera login, cadastro, logout e configurações de conta com Clerk, além de verificações de sessão no servidor. Apenas um e-mail principal verificado é aceito; os registros locais usam o ID de usuário do Clerk como chave e nunca são vinculados automaticamente por e-mail. As assinaturas do Stripe e as notas privadas mantêm esse ID estável do proprietário.

Crie uma aplicação independente no Clerk e configure suas chaves publicável e secreta. O Clerk envia os e-mails de autenticação, então essa variante não instala Resend nem Better Auth. O guia gerado explica como exigir a verificação de e-mail, configurar as origens de produção e validar os fluxos hospedados. Na ausência de credenciais, o acesso é bloqueado e nenhuma instância do Clerk sem chaves é provisionada.

As seções acima descrevem a variante padrão com Better Auth. Os projetos com Clerk recebem seu próprio guia de configuração de autenticação e testes locais com fixtures. Login, verificação de e-mail, redefinição de senha e logout reais com Clerk ainda exigem uma instância de desenvolvimento configurada.
