# MindEase Web - Frontend Monorepo

> Plataforma de acessibilidade cognitiva com Micro-Frontends

## ÌøóÔ∏è Arquitetura

- **Nx Monorepo** (v22+)
- **Angular 21+** com Standalone Components
- **Module Federation** (pr√≥xima fase)
- **MVVM** com Angular Signals
- **Clean Architecture** adaptada ao frontend

## Ì≥¶ Estrutura

\`\`\`
apps/
  host-shell/          ‚Üê Host MFE (shell)
  mfe-dashboard/       ‚Üê Remote: Painel cognitivo (pr√≥xima fase)
  mfe-tasks/           ‚Üê Remote: Kanban tarefas (pr√≥xima fase)
  mfe-profile/         ‚Üê Remote: Perfil usu√°rio (pr√≥xima fase)

libs/
  shared/
    ui/                ‚Üê Design System
    a11y/              ‚Üê Tokens cognitivos
    data-access/       ‚Üê HTTP, Auth, Stores
    state/             ‚Üê Global state (Signals)
    utils/             ‚Üê Helpers, pipes
  domain/              ‚Üê Regras de neg√≥cio
  application/         ‚Üê Use cases
  infrastructure/      ‚Üê Adapters
\`\`\`

## Ì∫Ä Quick Start

\`\`\`bash
# Instalar depend√™ncias (j√° feito)
npm install

# Servir host-shell
npm start

# Build de produ√ß√£o
npm run build
\`\`\`

## Ì≥ã Scripts Dispon√≠veis

| Script | Descri√ß√£o |
|--------|-----------|
| \`npm start\` | Serve host-shell (porta 4200) |
| \`npm run start:all\` | Serve todos os MFEs em paralelo |
| \`npm run build\` | Build de produ√ß√£o (host-shell) |
| \`npm run build:all\` | Build de todos os projetos |
| \`npm test\` | Roda testes unit√°rios |
| \`npm run lint\` | Lint de c√≥digo |
| \`npm run lint:fix\` | Lint + auto-fix |
| \`npm run format\` | Formata c√≥digo (Prettier) |
| \`nx graph\` | Visualiza grafo de depend√™ncias |
| \`nx affected:test\` | Testa apenas o que mudou |

## Ì∑™ Testes

\`\`\`bash
# Rodar todos os testes
npm test

# Testes com coverage
nx test --code-coverage

# Testes E2E (quando implementado)
nx e2e host-shell-e2e
\`\`\`

## Ìæ® Design System

Tokens cognitivos dispon√≠veis via \`@shared/a11y\`:
- \`uiDensity\`: simple | medium | full
- \`focusMode\`: boolean
- \`contentMode\`: summary | detailed
- \`contrast\`: low | normal | high
- \`fontScale\`: 0.9 - 1.4
- \`spacingScale\`: 0.9 - 1.4
- \`motion\`: full | reduced | off

## Ì¥ó Links √öteis

- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.io/docs)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)

## Ì±• Time

Projeto desenvolvido para o Hackathon FIAP Inclusive 2026.

## Ì≥Ñ Licen√ßa

MIT
