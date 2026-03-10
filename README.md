# MindEase 🧠✅

> Plataforma de gerenciamento de tarefas com foco em **acessibilidade cognitiva** e produtividade.

[![CI/CD](https://github.com/giorgiocost/mind-ease-fiap/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/giorgiocost/mind-ease-fiap/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/giorgiocost/mind-ease-fiap/branch/main/graph/badge.svg)](https://codecov.io/gh/giorgiocost/mind-ease-fiap)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Sobre o Projeto

MindEase é uma aplicação web moderna construída com **Angular 21+**, **Nx Monorepo** e **Module Federation** que oferece suporte a usuários com TDAH e outras necessidades cognitivas através de 7 tokens de acessibilidade personalizáveis.

### ✨ Features

| Feature | Descrição |
|---------|-----------|
| 🎨 **Interface Adaptável** | 7 tokens cognitivos (density, focus, contrast, font scale…) |
| ✅ **Kanban Board** | Gestão visual de tarefas com drag & drop (Angular CDK) |
| 🍅 **Pomodoro Timer** | Técnica comprovada de produtividade com tracking de sessões |
| 🔐 **Autenticação JWT** | Login seguro com refresh token automático |
| 📊 **Dashboard** | Estatísticas e métricas de produtividade em tempo real |
| ♿ **Acessibilidade** | WCAG AA+ compliance, `prefers-reduced-motion` |
| 🏗️ **Micro-Frontends** | Module Federation — deploy e equipes independentes |

---

## 🏗️ Arquitetura

```
apps/
├── host-shell/            ← Host MFE — shell, routing, layout, auth (port 4200)
├── mfe-dashboard/         ← Remote — Painel cognitivo, stats, preferences (port 4201)
├── mfe-tasks/             ← Remote — Kanban board, Pomodoro timer (port 4202)
└── mfe-profile/           ← Remote — Onboarding, profile settings (port 4203)

libs/
├── shared/
│   ├── ui/                ← Design System (Button, Input, Card, Modal)
│   ├── services/          ← Auth store, Tasks store, Preferences store
│   └── utils/             ← Helpers, validators, pipes
├── domain/                ← Business entities and interfaces
├── application/           ← Use cases
└── infrastructure/        ← HTTP adapters, localStorage

docs/                      ← Documentação técnica completa
.github/
├── workflows/
│   ├── ci-cd.yml          ← Pipeline principal
│   └── release.yml        ← Workflow de releases
└── dependabot.yml         ← Dependency updates automáticos
```

- **Framework**: Angular 21+ Standalone Components + Signals
- **State Management**: Signal-based stores (sem NgRx)
- **Architecture**: Module Federation (1 host + 3 remotes)
- **Styling**: SCSS + Design Tokens + CSS Custom Properties
- **Testing**: Jest (unit) + Playwright (E2E — 5 critical flows)
- **CI/CD**: GitHub Actions + Vercel
- **Monorepo**: Nx 22+

📐 [Documentação de arquitetura completa →](docs/ARCHITECTURE.md)

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- npm 10+ (ou pnpm 8+)
- Git

### Instalação

```bash
# Clone o repositório
git clone https://github.com/giorgiocost/mind-ease-fiap.git
cd mind-ease-fiap

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start

# Acesse em http://localhost:4200
```

### Todos os MFEs em paralelo

```bash
npm run start:all
# host-shell  → http://localhost:4200
# mfe-dashboard → http://localhost:4201
# mfe-tasks   → http://localhost:4202
# mfe-profile → http://localhost:4203
```

---

## 📜 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Serve host-shell (4200) |
| `npm run start:all` | Serve todos os MFEs em paralelo |
| `npm run build` | Build de produção (host-shell) |
| `npm run build:all` | Build de todos os projetos |
| `npm run test` | Jest (projeto padrão) |
| `npm run test:all` | Jest em todos os projetos |
| `npm run test:ci` | Jest com coverage (modo CI, parallel) |
| `npm run lint:all` | ESLint em todos os projetos |
| `npm run lint:fix` | ESLint com auto-fix |
| `npm run format` | Prettier em todos os arquivos |
| `npm run e2e` | Playwright — todos os browsers |
| `npm run e2e:ci` | Playwright — Chromium only (CI) |
| `npm run e2e:smoke` | Smoke suite (@smoke tag) |
| `npm run e2e:critical` | Critical flows (@critical tag) |
| `npm run graph` | Visualiza grafo de dependências Nx |

---

## 🧪 Testes

```bash
# Unit tests (Jest)
npm run test:all

# Com coverage report
npm run test:ci

# E2E — todos os browsers (Chromium, Firefox, WebKit, Mobile)
npm run e2e

# E2E — smoke suite (1 test encadenado)
npm run e2e:smoke

# E2E — 5 fluxos críticos
npm run e2e:critical

# Abrir relatório Playwright
npm run e2e:report
```

### Cobertura de testes

| Tipo | Ferramenta | Target |
|------|-----------|--------|
| Unit | Jest | ≥ 80% |
| E2E — fluxo login/dashboard | Playwright | ✅ |
| E2E — registro/onboarding | Playwright | ✅ |
| E2E — kanban tasks | Playwright | ✅ |
| E2E — pomodoro timer | Playwright | ✅ |
| E2E — preferências | Playwright | ✅ |

---

## 🎨 Design System — Tokens Cognitivos

```typescript
interface CognitivePreferences {
  uiDensity:    'simple' | 'medium' | 'full';  // densidade da UI
  focusMode:    boolean;                         // reduz distrações
  contentMode:  'summary' | 'detailed';          // nível de detalhe
  contrast:     'low' | 'normal' | 'high';       // contraste visual
  fontScale:    number;  // 0.9 – 1.4            // tamanho da fonte
  spacingScale: number;  // 0.9 – 1.4            // espaçamento
  motion:       'full' | 'reduced' | 'off';      // animações
}
```

---

## ⚙️ CI/CD Pipeline

Pipeline automático via **GitHub Actions** em `.github/workflows/ci-cd.yml`.

```
Push / PR → Lint → Unit Tests → Build (all MFEs) → E2E → Deploy (Vercel)
```

| Job | When | Descrição |
|-----|------|-----------|
| `lint` | push / PR | ESLint em todos os projetos |
| `test` | após lint | Jest + coverage (Codecov) |
| `build` | após test | Build production todos os MFEs |
| `e2e` | após build | Playwright Chromium |
| `deploy` | push → main | Deploy production Vercel |
| `deploy-preview` | PR | Preview + comentário automático no PR |

### Secrets necessários

Configurar em **GitHub → Settings → Secrets → Actions**:

| Secret | Onde obter |
|--------|-----------|
| `VERCEL_TOKEN` | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel → Settings → General |

---

## 🚢 Deploy

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para instruções completas.

```bash
# Deploy manual (requer Vercel CLI)
npx vercel deploy --prod
```

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura técnica, C4 diagrams, MFE structure |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Guia de contribuição, code standards, PR process |
| [docs/API.md](docs/API.md) | Documentação dos endpoints da API |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Guia de deploy (Vercel, variáveis, CI) |
| [docs/decisions/](docs/decisions/) | Architecture Decision Records (ADRs) |

---

## 🗺️ Roadmap

- [x] MVP — Dashboard, Tasks Kanban, Pomodoro
- [x] Module Federation — 1 host + 3 remotes
- [x] 7 Cognitive Accessibility Tokens
- [x] E2E Test Coverage — 5 critical flows
- [x] CI/CD Pipeline — GitHub Actions + Vercel
- [ ] PWA / Offline Support
- [ ] Mobile App (React Native / Flutter)
- [ ] Team Collaboration
- [ ] AI-powered task suggestions

---

## 🤝 Contribuindo

Leia o [Guia de Contribuição](docs/CONTRIBUTING.md) antes de abrir um PR.

---

## 👥 Time

Projeto desenvolvido para o **Hackathon FIAP Inclusive 2026**.

---

## 📄 Licença

MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- [Nx](https://nx.dev) — Monorepo tooling
- [Angular](https://angular.dev) — Framework
- [Playwright](https://playwright.dev) — E2E testing
- [Vercel](https://vercel.com) — Deployment

---

*Made with ❤️ by Time MindEase*
