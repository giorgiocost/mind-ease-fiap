# Boundaries & Dependency Rules (para Nx)

## Objetivo
Evitar acoplamento entre:
- apps (host/remotes)
- shared libs (reuso)
- camadas (presentation/application/domain/infrastructure)

## Regras (conceituais)
- `domain` não importa `infrastructure` nem `presentation`.
- `application` não importa `presentation`.
- `presentation` pode importar `application` e shared libs aprovadas.
- `infrastructure` só é importada via ports (interfaces).

## Tags sugeridas (Nx enforceModuleBoundaries)
- `type:app`
- `type:feature`
- `type:shared`
- `layer:presentation|application|domain|infrastructure`

## Exemplo de policy (alto nível)
- `layer:domain` → pode depender apenas de `layer:domain`
- `layer:application` → pode depender de `layer:domain`
- `layer:presentation` → pode depender de `layer:application` e `type:shared`
- `layer:infrastructure` → pode depender de `layer:domain` e `type:shared`
