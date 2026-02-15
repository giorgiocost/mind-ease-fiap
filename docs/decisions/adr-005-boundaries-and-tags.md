# ADR-005 — Nx Boundaries (Tags + EnforceModuleBoundaries)

## Status
Proposed

## Date
2026-02-14

## Context
Monorepo com MFEs tende a acoplar rapidamente se não houver governança de imports.

## Decision
Usar tags Nx (`type:*`, `layer:*`) para reforçar limites e reduzir dependências indevidas.

## Consequences
+ Reduz acoplamento
+ Facilita refactor e CI (affected)
- Exige disciplina na criação de libs/projetos
