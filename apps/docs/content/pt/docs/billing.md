---
title: Assinaturas e cobrança
description: Checkout, gestão de clientes e acesso pago com controle no servidor.
sidebar:
  order: 7
---
## Comece com um ambiente de testes do Stripe [#start-with-a-stripe-sandbox]

Crie um produto Pro e um preço recorrente mensal que corresponda a `packages/config/index.ts`. Configure `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID` e `STRIPE_LIVE_MODE=false`. Ative o portal do cliente.

Cada usuário tem um único registro de cobrança e um vínculo com um cliente do Stripe criado pelo servidor. O servidor nunca aceita um ID de cliente enviado como prova de titularidade.

## Checkout e portal [#checkout-and-portal]

A rota de checkout serializa as operações no registro de cobrança, usa chaves de idempotência estáveis, reutiliza sessões abertas e rejeita uma segunda assinatura que ainda não esteja em estado terminal. A gestão de assinaturas é feita pelo portal do cliente.

## Webhooks assinados com suporte a novas tentativas [#signed-retryable-webhooks]

O endpoint de webhook fica na origem da aplicação:

```text
/api/webhooks/stripe
```

Ele verifica o corpo bruto da requisição, a assinatura do Stripe, a tolerância do timestamp e o modo de testes ou produção. Os eventos compatíveis bloqueiam o registro de cobrança, inserem um registro de recebimento único, buscam o estado atual da assinatura no Stripe e persistem essa cópia do estado em uma transação.

IDs de evento duplicados não têm efeito. Em caso de falha, o registro de recebimento e as alterações de estado são revertidos para que novas tentativas possam funcionar. Eventos fora de ordem reconciliam o estado atual do provedor em vez de confiar nos timestamps dos eventos.

## Aplique o controle de acesso pago [#enforce-paid-access]

O endpoint de exemplo `/api/notes/export` é uma operação exclusiva do plano Pro. Ele reconcilia o estado do Stripe antes de verificar o acesso no servidor. Uma URL de sucesso do checkout não concede acesso.

Se o provedor ficar indisponível, a operação paga falha com uma resposta de serviço indisponível. As notas gratuitas continuam disponíveis. Substitua a exportação de exemplo pelo seu recurso pago real, mantendo a verificação no servidor.

## Encaminhamento local de webhooks [#local-webhook-forwarding]

Use exatamente a lista de eventos e o comando da CLI do Stripe que estão no arquivo gerado `docs/setup.md`. Encaminhe os eventos para `localhost:3001/api/webhooks/stripe` e copie o segredo de assinatura do listener para `STRIPE_WEBHOOK_SECRET`.

O Checkout hospedado em produção, o portal, a entrega na caixa de entrada e os webhooks originados pelo provedor exigem suas próprias credenciais e verificação.
