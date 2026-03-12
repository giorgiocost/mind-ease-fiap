# Deployment Guide

Guia completo para fazer o deploy do MindEase em produção.

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Conta no [Vercel](https://vercel.com) (para deploy)
- Variáveis de ambiente configuradas (veja `.env.example`)

---

## Ambientes

| Ambiente | Branch | URL |
|----------|--------|-----|
| Production | `main` | https://mindease.vercel.app |
| Preview | Pull Requests | URL gerada automaticamente pelo Vercel |
| Development | local | http://localhost:4200 |

---

## Deploy automático (CI/CD)

O pipeline GitHub Actions (`ci-cd.yml`) realiza o deploy **automaticamente** em cada push para `main` após todos os checks passarem:

```
Push → main
  └─ lint → test → build → e2e → deploy (Vercel)
```

### Configurar secrets no GitHub

```
GitHub → Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Onde obter |
|--------|-----------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel → Settings → General |

---

## Deploy manual (Vercel CLI)

### 1. Build

```bash
# Build de todos os MFEs
npm run build:all

# Saída em:
# dist/apps/host-shell/
# dist/apps/mfe-dashboard/
# dist/apps/mfe-tasks/
# dist/apps/mfe-profile/
```

### 2. Instalar Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 3. Deploy do host-shell

```bash
# Preview
vercel

# Produção
vercel --prod
```

> O `vercel.json` na raiz configura routing SPA, headers de segurança e cache de assets.

---

## Configuração do Vercel (vercel.json)

```json
{
  "routes": [
    { "src": "/assets/(.*)", "dest": "/assets/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

O arquivo `vercel.json` já está configurado com:
- SPA routing (fallback para `index.html`)
- Cache imutável para assets (`max-age=31536000`)
- Headers de segurança (X-Frame-Options, CSP, etc.)

---

## Deploy dos MFEs remotes em produção

Em produção, cada MFE remote precisa ser acessível em uma URL pública. Há duas estratégias:

### Opção A — Vercel por projeto (recomendado)

Cada MFE é um projeto Vercel separado com sua própria URL:

```bash
cd dist/apps/mfe-dashboard && vercel --prod
cd dist/apps/mfe-tasks     && vercel --prod
cd dist/apps/mfe-profile   && vercel --prod
```

### Opção B — Servir tudo do host-shell

Configure os remotes para serem servidos como diretórios do host:

```
dist/apps/host-shell/
  ├── index.html
  ├── remoteEntry.js          ← host
  └── remotes/
       ├── mfe-dashboard/
       ├── mfe-tasks/
       └── mfe-profile/
```

---

## Variáveis de ambiente

Criar no painel do Vercel (**Settings → Environment Variables**):

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `NODE_ENV` | `production` | Production |
| `API_URL` | `https://api.mindease.app/api/v1` | Production |
| `ENABLE_ANALYTICS` | `true` | Production |

Para desenvolvimento local, copie `.env.example` para `.env`:

```bash
cp .env.example .env
# Edite .env com seus valores locais
```

---

## Release e versionamento

### Criar release tag

```bash
# Garanta que está na main atualizada
git checkout main && git pull

# Crie a tag anotada
git tag -a v1.0.0 -m "Release v1.0.0 — MVP completo"
git push origin v1.0.0
```

O workflow `release.yml` detectará a tag e criará automaticamente um **GitHub Release**.

### Convenção de versão

Siga **Semantic Versioning**:

- `v1.0.0` → Major: breaking changes
- `v1.1.0` → Minor: nova feature
- `v1.1.1` → Patch: bug fix
- `v1.1.0-beta.1` → Pre-release

---

## Verificações pós-deploy

Após cada deploy em produção, verifique:

- [ ] `https://mindease.vercel.app` abre sem erro
- [ ] Login funciona (POST `/api/v1/auth/login`)
- [ ] Dashboard carrega estatísticas
- [ ] Kanban board renderiza
- [ ] Pomodoro contador inicia
- [ ] Preferências salvam
- [ ] Logout funciona

---

## Rollback

```bash
# Via Vercel CLI — listar deployments recentes
vercel ls

# Promover deployment anterior para produção
vercel alias <deployment-url> mindease.vercel.app

# Via GitHub — reverter commit e push para main
git revert <commit-hash>
git push origin main
```

---

## Troubleshooting

**Build falha no CI**
→ Verifique se `npm run build:all` passa localmente. Erros de TS ou import incorretos são a causa mais comum.

**Vercel deploy rejeitado**
→ Verifique se `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` estão corretos no GitHub Secrets.

**MFE remote não carrega em produção**
→ Confirme a URL do remote em `module-federation.config.ts` para `production`. Deve apontar para a URL Vercel do remote, não localhost.

**E2E falham só no CI**
→ Geralmente timeout. Ative screenshots/video no Playwright config e inspecione o artifact `playwright-report` no workflow run.
