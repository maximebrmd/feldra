---
title: Dados privados
description: Um pequeno recurso que mostra como a autorização deve funcionar.
sidebar:
  order: 6
---
## O recurso de exemplo [#the-example-resource]

As notas privadas demonstram o funcionamento completo de criação, leitura, atualização e exclusão. Os dados de entrada usam esquemas Zod estritos no servidor. Campos desconhecidos e valores inválidos são rejeitados.

Cada consulta é restrita ao usuário autenticado. As atualizações e exclusões incluem o ID da nota e o ID do proprietário na condição SQL. Registros de outros usuários e registros inexistentes retornam a mesma resposta de não encontrado.

## Proteção do banco de dados [#database-protection]

Todas as tabelas da estrutura inicial têm segurança em nível de linha ativada, sem políticas de acesso para clientes. O acesso direto por papéis que não sejam proprietários e não tenham BYPASSRLS é negado. Isso é importante ao usar o esquema público e a Data API do Supabase.

A aplicação se conecta como proprietária do banco de dados, então as verificações de propriedade no servidor continuam sendo obrigatórias. Desative a Data API do Supabase se ela não estiver em uso e mantenha todas as strings de conexão privadas.

## Remova o exemplo [#remove-the-example]

Remova a interface de notas, `apps/app/src/lib/notes.ts` e `apps/app/src/app/api/notes`. Substitua a visualização do painel e o link de exportação paga nas configurações pelas funcionalidades do seu produto.

Remova a tabela `note` de `packages/database/src/schema.ts`, depois gere e revise uma nova migração:

```sh
npm run db:generate
npm run db:migrate
```

Não reescreva migrações já aplicadas a um projeto existente. Avalie a perda de dados antes de aplicar uma migração de remoção. Mantenha e amplie os testes de propriedade para os seus recursos reais.
