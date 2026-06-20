# XTOYBOX - Configuracao do modo teste por chave

Este endpoint valida chaves temporarias para APKs de teste, como `1.1.14-test`.

As chaves reais nao devem ser salvas no repositorio. Configure tudo nas variaveis de ambiente do Vercel.

## Variaveis obrigatorias

### TEST_ACCESS_KEYS

JSON com as chaves permitidas.

Exemplo:

```json
{
  "XTOYBOX-DISCORD-TESTE-01": {
    "keyId": "discord-teste-01",
    "durationMinutes": 60,
    "maxActivations": 124,
    "allowedVersions": ["1.1.14-test"],
    "channel": "discord",
    "active": true
  }
}
```

### KV_REST_API_URL

URL REST do Vercel KV / Upstash Redis.

### KV_REST_API_TOKEN

Token REST do Vercel KV / Upstash Redis.

## Como funciona

1. O app envia `key`, `installId` e `versionName` para `/api/test-access/validate`.
2. O servidor valida se a chave existe e esta ativa.
3. O servidor confere se a versao enviada esta permitida.
4. Na primeira ativacao, salva um registro por instalacao.
5. O prazo de expiracao e calculado a partir da primeira ativacao.
6. Se passar do tempo, retorna `expired`.
7. Se bater o limite de ativacoes, retorna `activation_limit_reached`.

## Resposta valida

```json
{
  "valid": true,
  "keyId": "discord-teste-01",
  "expiresAt": 1780000000000,
  "activatedAt": 1779996400000,
  "serverTime": 1779996400000,
  "message": "Acesso de teste liberado por tempo limitado."
}
```

## Resposta expirada

```json
{
  "valid": false,
  "reason": "expired",
  "message": "Essa chave de teste expirou para esta instalacao."
}
```

## Observacao importante

Nao coloque a chave real dentro do APK e nao commite a chave real no GitHub. A chave deve ficar apenas em `TEST_ACCESS_KEYS` no painel do Vercel.
