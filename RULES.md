# RULES.md — MindEase Web (Nx + MFE) — Staff/Architect Level
**Last update:** 2026-02-14

> **Prioridade máxima.** A IA deve seguir estas regras. Se houver conflito, siga este arquivo.

---

## 0) Objetivo do projeto
Construir uma Web App (host + remotes) com **Acessibilidade Cognitiva** como requisito de primeira classe:
- Modo Foco, Resumo/Detalhado, Controle de Animações, Preferências persistentes.

---

## 1) Stack e padrões
- Nx **Integrated** Monorepo (v18+)
- Angular 17+ (Standalone Components)
- Module Federation (Webpack 5)
- PNPM
- TypeScript strict

---

## 2) Arquitetura (por feature + camadas)
Dentro de `apps/*` e `libs/*`, organizar lógica por **features**:

```
features/<feature>/
  presentation/     # UI, pages, components, viewmodels
  application/      # facades, use-cases, orchestration
  domain/           # entities, value objects, rules, ports (interfaces)
  infrastructure/   # adapters (http/storage), mappers
```

### Regras de dependência (NÃO QUEBRAR)
- Presentation → Application → Domain
- Infrastructure **implementa** ports do Domain/Application
- Domain **não** depende de Angular / RxJS / HttpClient / Browser APIs

---

## 3) Micro-Frontends (Module Federation)
- `apps/host-shell` é o host (shell).
- `apps/mfe-*` são remotes.
- Shared libs devem ser **estáveis** e com API limpa.
- Comunicação entre remotes preferencialmente via **contracts** (models/events) + APIs do host.

---

## 4) Regras de Acessibilidade Cognitiva (obrigatórias)
- **Modo foco**: reduzir distrações (ocultar elementos não essenciais).
- **Resumo vs detalhado**: texto resumido por padrão, “ver mais” sob demanda.
- **Controle de animações**: `off | reduced | normal`, respeitar `prefers-reduced-motion` quando possível.
- **Mensagens curtas**: erros e feedbacks devem ser objetivos e acionáveis.
- **Previsibilidade**: navegação e padrões consistentes entre features.

---

## 5) Qualidade e testes
- Use cases e regras de domínio devem ter unit tests.
- Não desativar testes para “passar pipeline”.
- E2E apenas para fluxos críticos do MVP (modo foco, timer, kanban, persistência).

---

## 6) Governança de mudanças (obrigatório)
- Mudança arquitetural / dependência nova → criar ADR em `docs/decisions/`.
- Mudanças que impactam contratos → atualizar `docs/contracts/`.

---

## 7) Proibições
- UI chamar HttpClient direto.
- Colocar regra de negócio em components.
- Criar `utils` gigante sem escopo (preferir `shared/*` bem segmentado).
- Introduzir lib sem ADR.

---

## 8) Como usar IA (workflow)
Sempre inclua no contexto:
1. `RULES.md`
2. `.copilot-context.md`
3. `docs/architecture/*`
4. `docs/contracts/*`
5. ADRs relevantes em `docs/decisions/*`

Peça entregas pequenas, com:
- objetivos + critérios de aceite
- arquivos a alterar
- testes esperados
