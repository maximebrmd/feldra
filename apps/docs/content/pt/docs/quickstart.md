---
title: Início rápido
description: De uma pasta nova a um workspace com a sua cara.
sidebar:
  order: 1
---
## Pré-requisitos [#prerequisites]

Use Node.js 24 LTS, npm e Git. O Docker só é necessário para as fixtures locais de banco de dados e navegador. Você não precisa de credenciais de provedores para compilar o template ou executar essas fixtures.

## Obtenha o código-fonte [#get-the-source]

```sh
git clone https://github.com/maximebrmd/feldra.git feldra
cd feldra
npm ci
```

## Crie seu projeto [#create-your-project]

O inicializador ainda não foi publicado no npm. Primeiro, compile o pacote local versionado:

```sh
npm run initializer:pack
```

Isso valida o código-fonte e grava `feldra-VERSION.tgz` na raiz do repositório. Substitua VERSION abaixo pela versão em `packages/feldra/package.json`:

```sh
npm exec --yes --package="./feldra-VERSION.tgz" -- feldra create my-new-saas
```

Use as teclas de seta e Enter para escolher **Neon** ou **Supabase** e, em seguida, **Better Auth**, **Clerk** ou **Auth.js**. O inicializador instala as dependências, grava os arquivos de ambiente locais e inicializa um novo repositório Git. Ele recusa um destino existente, mesmo que esteja vazio.

Para executar sem interação, acrescente `--yes --database supabase` após o nome do projeto. Tanto caminhos relativos quanto caminhos entre aspas contendo espaços funcionam.

## Conecte seus provedores [#connect-your-providers]

```sh
cd my-new-saas
```

Preencha `.env.local` usando o arquivo `DATABASE.md` gerado e o [guia de ambiente](/docs/environment/). Um novo segredo local do Better Auth ou do Auth.js já foi gerado, ou as chaves do Clerk ficam em branco; as credenciais restantes dos provedores precisam ser configuradas separadamente.

```sh
npm run db:migrate
npm run check
npm run dev
```

Abra **localhost:3000** para acessar o site de marketing e **localhost:3001** para acessar a aplicação autenticada.

## Após a publicação no npm [#after-npm-publication]

Quando o pacote atual for publicado, a criação de projetos passa a ser:

```sh
npx feldra@latest create my-new-saas
```

Não use o comando público até que o pacote seja explicitamente publicado. Um único comando cria a estrutura do projeto e instala as dependências; ele não cria contas em provedores nem configura credenciais.

## Escolha a autenticação [#choose-authentication]

Após selecionar um banco de dados, escolha **Better Auth** (padrão), **Clerk** ou **Auth.js**. O Better Auth usa o Resend para enviar e-mails de verificação e redefinição de senha. O Clerk usa seus componentes gerenciados e seu serviço de envio de e-mails. O Auth.js usa o GitHub OAuth. Os projetos com Clerk e Auth.js não incluem Better Auth nem Resend.

Para CI, adicione `--auth better-auth`, `--auth clerk` ou `--auth authjs` ao comando do inicializador local. Combine qualquer uma dessas opções com `--database neon` ou `--database supabase`. `--list-tools` lista as opções disponíveis sem criar arquivos. Siga as instruções do arquivo `AUTHENTICATION.md` gerado antes de testar a autenticação real. Essas opções criam projetos independentes; elas não migram usuários existentes entre serviços.
