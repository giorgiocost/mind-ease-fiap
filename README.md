# MindEase Web - Frontend Monorepo

> Plataforma de acessibilidade cognitiva com Micro-Frontends

[![CI/CD](https://github.com/giorgiocost/mind-ease-fiap/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/giorgiocost/mind-ease-fiap/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/giorgiocost/mind-ease-fiap/branch/main/graph/badge.svg)](https://codecov.io/gh/giorgiocost/mind-ease-fiap)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ���️ Arquitetura

- **Nx Monorepo** (v22+)
- **Angular 21+** com Standalone Components
- **Module Federation** (próxima fase)
- **MVVM** com Angular Signals
- **Clean Architecture** adaptada ao frontend

## ��� Estrutura

\`\`\`
apps/
  host-shell/          ← Host MFE (shell)
  mfe-dashboard/       ← Remote: Painel cognitivo (próxima fase)
  mfe-tasks/           ← Remote: Kanban tarefas (próxima fase)
  mfe-profile/         ← Remote: Perfil usuário (próxima fase)

libs/
  shared/
    ui/                ← Design System
    a11y/              ← Tokens cognitivos
    data-access/       ← HTTP, Auth, Stores
    state/             ← Global state (Signals)
    utils/             ← Helpers, pipes
  domain/              ← Regras de negócio
  application/         ← Use cases
  infrastructure/      ← Adapters
\`\`\`

## ��� Quick Start

\`\`\`bash
# Instalar dependências (já feito)
npm install

# Servir host-shell
npm start

# Build de produção
npm run build
\`\`\`

## ��� Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| \`npm start\` | Serve host-shell (porta 4200) |
| \`npm run start:all\` | Serve todos os MFEs em paralelo |
| \`npm run build\` | Build de produção (host-shell) |
| \`npm run build:all\` | Build de todos os projetos |
| \`npm test\` | Roda testes unitários |
| \`npm run lint\` | Lint de código |
| \`npm run lint:fix\` | Lint + auto-fix |
| \`npm run format\` | Formata código (Prettier) |
| \`nx graph\` | Visualiza grafo de dependências |
| \`nx affected:test\` | Testa apenas o que mudou |

## ��� Testes

\`\`\`bash
# Rodar todos os testes
npm test

# Testes com coverage
nx test --code-coverage

# Testes E2E (quando implementado)
nx e2e host-shell-e2e
\`\`\`

## ��� Design System

Tokens cognitivos disponíveis via \`@shared/a11y\`:
- \`uiDensity\`: simple | medium | full
- \`focusMode\`: boolean
- \`contentMode\`: summary | detailed
- \`contrast\`: low | normal | high
- \`fontScale\`: 0.9 - 1.4
- \`spacingScale\`: 0.9 - 1.4
- \`motion\`: full | reduced | off

## ⚙️ CI/CD Pipeline

Pipeline automático via **GitHub Actions** (`.github/workflows/ci-cd.yml`).

### Jobs

| Job | Trigger | Descrição |
|-----|---------|-----------|
| `lint` | push / PR | ESLint em todos os projetos |
| `test` | após lint | Jest unit tests + coverage (Codecov) |
| `build` | após test | Build production de todos os MFEs |
| `e2e` | após build | Playwright E2E (Chromium) |
| `deploy` | push → main | Deploy production para Vercel |
| `deploy-preview` | PR | Preview deploy + comentário no PR |

### Triggers

- **Push para `main` ou `develop`** → pipeline completo + deploy (main)
- **Pull Request** → pipeline completo + preview deploy
- **`workflow_dispatch`** → trigger manual

### Scripts locais

```bash
npm run lint:all       # ESLint em todos os projetos
npm run test:ci        # Jest com coverage (modo CI)
npm run build:all      # Build production de todos os MFEs
npm run e2e            # Playwright (todos os browsers)
npm run e2e:ci         # Playwright (Chromium only — rápido)
npm run e2e:smoke      # Smoke suite (@smoke)
npm run e2e:critical   # Critical flows (@critical)
```

### Secrets necessários (GitHub → Settings → Secrets)

```
VERCEL_TOKEN        # vercel.com/account/tokens
VERCEL_ORG_ID       # Vercel project → Settings → General
VERCEL_PROJECT_ID   # Vercel project → Settings → General
```

## 🔗 Links Úteis

- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.io/docs)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)

## ��� Time

Projeto desenvolvido para o Hackathon FIAP Inclusive 2026.

## ��� Licença

MIT
