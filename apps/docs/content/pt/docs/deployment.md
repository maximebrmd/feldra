---
title: Implantação
description: Duas implantações de aplicativos. Limites claros.
sidebar:
  order: 9
---
## Implante os aplicativos SaaS [#deploy-the-saas-apps]

Crie dois projetos na sua plataforma de hospedagem Next.js, conectados ao mesmo repositório gerado:

| Projeto | Diretório raiz | Finalidade |
| --- | --- | --- |
| Marketing | `apps/web` | Página inicial e preços |
| Aplicação | `apps/app` | Autenticação, painel, APIs, webhooks |

Instale as dependências de todos os workspaces usando o arquivo de lock do npm na raiz. Habilite o acesso aos arquivos de código-fonte fora da raiz de cada projeto para que o Next.js possa compilar os pacotes compartilhados. Use a predefinição de Next.js da plataforma.

## Defina as origens de produção [#set-production-origins]

Defina `WEB_URL` e `APP_URL` nas duas implantações com suas origens HTTPS exatas. Configure as credenciais de banco de dados, autenticação, Stripe e Resend apenas na implantação da aplicação.

Use um novo segredo de autenticação para produção, um banco de dados de produção, um remetente verificado e uma chave de produção, um preço, um segredo de endpoint e um modo do Stripe compatíveis entre si. Os cookies de autenticação pertencem à origem da aplicação.

## Aplique as migrações [#apply-migrations]

Execute `npm run db:migrate` no banco de dados de destino antes de direcionar o tráfego da aplicação para ele. Revise cada migração e faça backup dos dados importantes antes de alterações que possam removê-los ou transformá-los.

## Verifique antes do lançamento [#verify-before-launch]

Teste os links de verificação, a redefinição de senha, a revogação de sessões, a autorização de acesso a registros privados, o Checkout, as alterações no portal e a entrega de webhooks na aplicação hospedada de fato. Os dados de teste locais do template não validam sua configuração de produção.

## Este site de documentação [#this-documentation-site]

A documentação do Feldra é um aplicativo estático Astro separado. Na raiz do repositório do template:

```sh
npm run build --workspace docs
npm run preview --workspace docs
```

A saída fica em `apps/docs/dist`. Ela pode ser servida por uma hospedagem estática com roteamento por índice de diretório e o arquivo `404.html` gerado. Não é necessário um adaptador de servidor nem credenciais de provedor. O aplicativo de documentação não é incluído nos projetos SaaS gerados. Nada é implantado automaticamente.
