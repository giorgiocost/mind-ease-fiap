# ADR-001 — Nx Integrated Monorepo + Module Federation

## Status
Accepted

## Date
2026-02-14

## Context
Precisamos separar módulos (Painel, Tarefas, Perfil) com evolução independente, mantendo reuso via libs shared.

## Decision
- Nx Integrated Monorepo
- Module Federation (host-shell + mfe-*)
- PNPM como package manager

## Consequences
+ Escalabilidade e reuso
- Disciplina de boundaries e contratos
