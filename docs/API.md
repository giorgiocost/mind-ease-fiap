# API Documentation

> Documentação dos endpoints consumidos pelo frontend MindEase.

**Base URL (development):** `http://localhost:3000/api/v1`  
**Base URL (production):** `https://api.mindease.app/api/v1`  
**Auth:** Bearer JWT (`Authorization: Bearer <accessToken>`)

---

## Autenticação

### POST /auth/register

Registra um novo usuário.

**Request body**

```json
{
  "name": "string (3–100 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Response 201**

```json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "createdAt": "ISO 8601"
  },
  "accessToken": "JWT (15min)",
  "refreshToken": "JWT (7d)"
}
```

**Errors**

| Code | Motivo |
|------|--------|
| 400 | Dados inválidos / email já existente |
| 422 | Violação de regras de negócio |

---

### POST /auth/login

Autenticar usuário existente.

**Request body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**

```json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string"
  },
  "accessToken": "JWT (15min)",
  "refreshToken": "JWT (7d)"
}
```

**Errors**

| Code | Motivo |
|------|--------|
| 401 | Credenciais inválidas |

---

### POST /auth/refresh

Renovar access token.

**Request body**

```json
{
  "refreshToken": "string"
}
```

**Response 200**

```json
{
  "accessToken": "JWT (15min)",
  "refreshToken": "JWT (7d)"
}
```

---

### POST /auth/logout

Invalidar refresh token (server-side).

**Headers:** `Authorization: Bearer <accessToken>`

**Response 204** (sem body)

---

## Tasks

> Todos os endpoints requerem `Authorization: Bearer <accessToken>`

### GET /tasks

Listar todas as tasks do usuário autenticado.

**Query params (opcionais)**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | `TODO \| DOING \| DONE` | Filtrar por status |
| `search` | `string` | Busca por título |

**Response 200**

```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "status": "TODO | DOING | DONE",
    "priority": "LOW | MEDIUM | HIGH",
    "dueDate": "ISO 8601 | null",
    "checklist": [
      { "id": "uuid", "text": "string", "done": false }
    ],
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
]
```

---

### POST /tasks

Criar nova task.

**Request body**

```json
{
  "title": "string (required, 1–200 chars)",
  "description": "string (optional)",
  "status": "TODO | DOING | DONE (default: TODO)",
  "priority": "LOW | MEDIUM | HIGH (default: MEDIUM)",
  "dueDate": "ISO 8601 (optional)"
}
```

**Response 201** — task criada (mesmo shape do GET)

---

### PATCH /tasks/:id

Atualizar task (campos opcionais — partial update).

**Request body**

```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "TODO | DOING | DONE (optional)",
  "priority": "LOW | MEDIUM | HIGH (optional)",
  "dueDate": "ISO 8601 | null (optional)"
}
```

**Response 200** — task atualizada

---

### DELETE /tasks/:id

Excluir task.

**Response 204** (sem body)

---

### PATCH /tasks/:id/checklist

Atualizar checklist de uma task.

**Request body**

```json
{
  "checklist": [
    { "id": "uuid (optional — null para novo item)", "text": "string", "done": false }
  ]
}
```

**Response 200** — task com checklist atualizada

---

## Preferences

### GET /preferences

Buscar preferências cognitivas do usuário.

**Response 200**

```json
{
  "uiDensity": "simple | medium | full",
  "focusMode": false,
  "contentMode": "summary | detailed",
  "contrast": "low | normal | high",
  "fontScale": 1.0,
  "spacingScale": 1.0,
  "motion": "full | reduced | off"
}
```

---

### PUT /preferences

Salvar preferências cognitivas (substituição total).

**Request body** — mesmo shape do GET

**Response 200** — preferências salvas

---

## Stats / Dashboard

### GET /stats

Retornar estatísticas do usuário para o dashboard.

**Response 200**

```json
{
  "totalTasks": 10,
  "completedTasks": 3,
  "pomodoroSessions": 5,
  "focusedMinutes": 125
}
```

---

## Pomodoro Sessions

### POST /pomodoro/sessions

Registrar sessão de Pomodoro concluída.

**Request body**

```json
{
  "type": "work | short-break | long-break",
  "durationSeconds": 1500,
  "completedAt": "ISO 8601"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "type": "work",
  "durationSeconds": 1500,
  "completedAt": "ISO 8601"
}
```

---

## Códigos de erro comuns

| Code | Significado |
|------|-------------|
| 400 | Bad Request — payload inválido |
| 401 | Unauthorized — token ausente ou expirado |
| 403 | Forbidden — sem permissão para o recurso |
| 404 | Not Found |
| 409 | Conflict — ex: email já cadastrado |
| 422 | Unprocessable Entity — regra de negócio |
| 429 | Too Many Requests — rate limit |
| 500 | Internal Server Error |

---

## Autenticação no frontend

O `AuthInterceptor` injeta automaticamente o header em todas as requisições:

```typescript
// libs/shared/services/src/lib/interceptors/auth.interceptor.ts
const token = authStore.accessToken();
if (token) {
  req = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}
```

Em caso de 401, tenta refresh automático antes de fazer logout.
