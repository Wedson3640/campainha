# Campainha Digital QR

MVP full-stack para uma campainha digital por QR Code. O morador cria uma campainha no app Expo, imprime o QR Code e recebe chamadas em tempo real quando visitantes acessam a página pública.

## Stack

- Mobile: React Native, Expo, TypeScript, Expo Router, NativeWind, Supabase Realtime, Expo Notifications.
- Web pública: React, Vite, TypeScript, Supabase JS.
- Backend: Supabase Auth, PostgreSQL, RLS, Realtime, Storage e Edge Function opcional para push.

## Estrutura

```txt
apps/mobile      App do morador
apps/web         Página pública do visitante
packages/shared  Tipos e utilitários compartilhados
supabase         Migrations, seed e função push
```

## Documentação

- [Uso do npm no projeto](docs/npm.md)

## Configuração

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/migrations/001_initial_schema.sql`.
3. Em Authentication, configure email/senha. Para teste rápido, você pode desativar confirmação de email.
4. Em Realtime, confirme que a tabela `visitor_calls` está publicada.
5. Em Storage, confirme o bucket privado `visitor-photos` com limite de 2MB.
6. Copie `.env.example` para `.env` nos apps ou configure as variáveis no ambiente.

## Rodar o mobile

```bash
cd apps/mobile
npm install
npx expo start
```

Porta configurada para o Metro/Expo: `8081`.

Variáveis:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_WEB_PUBLIC_URL=http://localhost:5173
```

## Rodar a página pública

```bash
cd apps/web
npm install
npm run dev
```

Porta configurada para a página pública: `5173`.

Variáveis:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Fluxo de teste

1. Abra o app mobile e crie uma conta.
2. Cadastre uma campainha com nome e local.
3. Abra a tela do QR Code.
4. Copie o link gerado ou leia o QR Code.
5. Na página pública, toque em `Chamar sem câmera` ou `Permitir câmera e chamar`.
6. Com o app aberto, o morador recebe um modal por Supabase Realtime.
7. Use `Ver quem está na porta` para abrir a imagem, se o visitante autorizou câmera.
8. Encerre a chamada e veja o registro no histórico.

## Segurança e privacidade

- O QR Code contém apenas `qr_token` aleatório de 32 bytes em hexadecimal.
- A página pública consulta somente `id`, `nome`, `local` e `ativo` via RPC `get_public_doorbell`.
- Visitantes não fazem login, não listam chamadas e não acessam dados do morador.
- Chamadas são criadas por RPC `create_visitor_call`, que valida token ativo, sanitiza mensagem e aplica rate limit simples.
- Fotos ficam em bucket privado e o app gera URL assinada temporária para visualização.
- RLS está ativa em todas as tabelas.
- Não use `SUPABASE_SERVICE_ROLE_KEY` no frontend.

## Push notifications

O MVP prioriza Realtime com o app aberto. O app já registra Expo Push Tokens em `device_tokens`. A função `supabase/functions/send-push` pode ser publicada e conectada a um Database Webhook de INSERT em `visitor_calls` para notificar o app em segundo plano.

Variáveis da função:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EXPO_ACCESS_TOKEN=
```

## Próximos passos naturais

- Limpeza automática de fotos antigas.
- Integração com câmera IP por campainha.
- Preferência de som customizado com arquivo local livre de direitos.
- Rate limit por IP usando Edge Function com hash do IP.
- Tela para gerenciar residências múltiplas.
