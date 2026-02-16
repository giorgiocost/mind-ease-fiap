# MindEase Documentation Index

**Project:** MindEase — Cognitive Accessibility Platform
**Architecture:** Nx Monorepo + Angular 17+ + Module Federation
**Last Updated:** 2026-02-14

---

## 📚 Quick Start Guide

**New to the project?** Read in this order:

1. **[System Overview](architecture/system-overview.md)** — What MindEase is and why
2. **[RULES.md](../RULES.md)** — Non-negotiable project rules
3. **[Module Federation](architecture/module-federation.md)** — How MFE architecture works
4. **[MVP Scope](product/mvp-scope.md)** — Features for hackathon delivery
5. **[Task Orchestrator](../tasks/TASK_ORCHESTRATOR.md)** — Execution order

---

## 🏗️ Architecture

- **[System Overview](architecture/system-overview.md)** — High-level components and flows
- **[Architecture](architecture/architecture.md)** — Nx + MFE structure
- **[Module Federation](architecture/module-federation.md)** — Host/Remotes configuration
- **[Boundaries & Dependencies](architecture/boundaries.md)** — Layer rules and import policies
- **[C4 Model](architecture/c4-model.md)** — Context and component diagrams

---

## 📝 Contracts

- **[Contracts Overview](contracts/overview.md)** — Where contracts live and how to version
- **[Preferences Model](contracts/models/preferences.model.md)** — Cognitive accessibility settings
- **[Task Model](contracts/models/task.model.md)** — Kanban task structure
- **[Focus Timer Model](contracts/models/focus-timer.model.md)** — Pomodoro timer state
- **[Events](contracts/events/events.md)** — System events (optional)

---

## � Design System

- **[Design System Overview](design-system/README.md)** — Introduction to MindEase Design System
- **[Design Tokens Reference](design-system/tokens-documentation.md)** — Colors, spacing, typography, cognitive tokens

---

## �🎯 Product & UX

- **[MVP Scope](product/mvp-scope.md)** — Features for hackathon
- **[Cognitive Accessibility](product/accessibility-cognitive.md)** — Personas and UI rules

---

## 🧪 Quality & Testing

- **[Quality Gates](quality/quality-gates.md)** — PR requirements
- **[Definition of Done](quality/definition-of-done.md)** — Task completion criteria
- **[Testing Strategy](quality/testing-strategy.md)** — Unit/Integration/E2E approach
- **[PR Checklist](quality/pr-checklist.md)** — Pre-merge validation

---

## 🧠 Decisions (ADRs)

- **[ADR-001: Nx + Module Federation](decisions/adr-001-nx-module-federation.md)**
- **[ADR-002: MVVM + Signals Architecture](decisions/adr-002-mvvm-signals-architecture.md)**
- **[ADR-003: Cognitive Accessibility Tokens](decisions/adr-003-tokens-cognitivos.md)**
- **[ADR-005: Boundaries & Tags](decisions/adr-005-boundaries-and-tags.md)**
- **[ADR Template](decisions/adr-template.md)**

---

## 🚀 Execution

- **[Task Orchestrator](../tasks/TASK_ORCHESTRATOR.md)** — 34 tasks organized in 8 phases
- **[Git Strategy](../git/BRANCH_STRATEGY.md)** — Branch and commit conventions
- **[AI Execution Checklist](../AI_EXECUTION_CHECKLIST.md)** — Pre/post implementation checks

---

## 🔗 Quick Links

- **[AI README](../AI_README.md)** — How to use AI in this project
- **[RULES.md](../RULES.md)** — Non-negotiable rules (READ THIS FIRST)
- **[.copilot-context.md](../.copilot-context.md)** — Short context for Claude

---

## 📮 Contributing

Before implementing anything:
1. Read RULES.md
2. Check task dependencies in TASK_ORCHESTRATOR.md
3. Review relevant contracts
4. Follow Definition of Done
5. Update ADRs if making architectural changes
