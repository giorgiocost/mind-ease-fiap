# Arquitetura — MindEase Web (Nx + MFE)

## Visão
Nx Integrated Monorepo com Micro-Frontends via Module Federation.

- Host: `apps/host-shell`
- Remotes: `apps/mfe-dashboard`, `apps/mfe-tasks`, `apps/mfe-profile`
- Shared libs: `libs/shared/*`

## Camadas por feature
- presentation → application → domain → infrastructure

## Fluxo
UI → Facade → UseCase → Port (interface) → Adapter (http/storage)

## Diretrizes
- Shared libs são “produto interno”: API limpa, mínima e estável.
- Contratos versionados em `docs/contracts/`.
