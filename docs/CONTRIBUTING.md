# Contributing to MindEase

Obrigado por contribuir! 🎉

---

## Configuração do ambiente de desenvolvimento

```bash
# 1. Fork e clone
git clone https://github.com/<seu-usuario>/mind-ease-fiap.git
cd mind-ease-fiap

# 2. Instale as dependências
npm install

# 3. Crie sua branch
git checkout -b feature/minha-feature

# 4. Inicie o ambiente de dev
npm start
```

---

## Padrões de código

### TypeScript

- Mode **strict** ativado (`tsconfig.base.json`)
- Prefira `const` sobre `let`; evite `var`
- Sem tipos `any` — use `unknown` ou tipos específicos
- Padrões funcionais onde possível

```typescript
// ✅ Correto
const activeTasks = computed(() =>
  this.store.allTasks().filter(t => t.status !== 'DONE')
);

// ❌ Evitar
let activeTasks: any[] = [];
this.store.allTasks.subscribe(tasks => {
  activeTasks = tasks.filter(function(t) { return t.status !== 'DONE'; });
});
```

### Angular

- Use **Standalone Components** (sem NgModule)
- Use **Signals** para estado reativo
- Use `input()` e `output()` em vez de `@Input`/`@Output`
- Use `computed()` em vez de assinaturas manuais

```typescript
// ✅ Correto
@Component({ standalone: true, ... })
export class TaskCardComponent {
  task = input.required<Task>();
  deleted = output<string>();

  isDone = computed(() => this.task().status === 'DONE');
}

// ❌ Evitar
@Component({})
export class TaskCardComponent implements OnInit {
  @Input() task!: Task;
  @Output() deleted = new EventEmitter<string>();
  isDone = false;
  ngOnInit() { this.isDone = this.task.status === 'DONE'; }
}
```

### SCSS

- Use **Design Tokens** via CSS Custom Properties para cores, espaçamento e fontes
- Use nomenclatura **BEM** para classes específicas de componente
- Nunca escreva valores mágicos — use variáveis

```scss
// ✅ Correto
.task-card {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);

  &--done {
    opacity: 0.6;
  }
}

// ❌ Evitar
.task-card {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
}
```

### Testes

- **Unit Tests**: target ≥ 80% de cobertura por projeto
- **E2E Tests**: apenas fluxos críticos de usuário
- Use o padrão **AAA** (Arrange, Act, Assert)
- Use Page Object Model (POM) nos testes E2E

```typescript
// ✅ Correto — AAA
it('should add task to store', async () => {
  // Arrange
  const store = new TasksStore(httpClient);

  // Act
  await store.addTask({ title: 'Estudar Angular', status: 'TODO' });

  // Assert
  expect(store.todoTasks().length).toBe(1);
  expect(store.todoTasks()[0].title).toBe('Estudar Angular');
});
```

---

## Mensagens de commit

Siga **Conventional Commits**:

```
<tipo>(<escopo>): <assunto curto em minúsculas>

[corpo opcional — explique o "porquê"]

[rodapé opcional — breaking changes, closes #issue]
```

### Tipos válidos

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova feature |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Formatação, sem mudança lógica |
| `refactor` | Refatoração sem nova feature ou fix |
| `test` | Adicionar ou corrigir testes |
| `chore` | Build, CI, dependências |
| `perf` | Melhoria de performance |

### Exemplos

```
feat(tasks): add drag & drop support to kanban board
fix(auth): resolve infinite loop on token refresh
docs(readme): update installation instructions
test(pomodoro): add unit tests for timer state machine
chore(deps): bump @angular/core to 21.2.0
```

---

## Processo de Pull Request

1. Crie uma branch descritiva: `feature/my-feature`, `fix/timer-bug`, `docs/api-update`
2. Escreva código seguindo os padrões acima
3. Escreva testes (unit + E2E se aplicável)
4. Rode localmente antes de abrir o PR:

```bash
npm run lint:all      # Não deve ter erros
npm run test:ci       # Coverage ≥ 80%
npm run build:all     # Build deve passar
npm run e2e:smoke     # Smoke suite deve passar
```

5. Faça commit com mensagens convencionais
6. Abra o PR com o template preenchido
7. Aguarde 1 approval obrigatório
8. O CI deve estar verde antes do merge

---

## Estrutura de projeto — guias

### Adicionar um novo componente

```bash
# Em uma lib existente (ex: shared/ui)
npx nx generate @nx/angular:component MyComponent \
  --project=shared-ui \
  --standalone \
  --export
```

### Adicionar uma nova lib

```bash
npx nx generate @nx/angular:library my-feature \
  --directory=libs/shared/my-feature \
  --standalone
```

### Adicionar um novo remote MFE

```bash
npx nx generate @nx/angular:remote mfe-new-feature \
  --host=host-shell \
  --port=4204
```

---

## Tags de boundary Nx

O projeto usa tags para reforçar a arquitetura em camadas:

| Tag | Camada |
|-----|--------|
| `scope:host-shell` | App shell |
| `scope:mfe-dashboard` | Remote dashboard |
| `scope:mfe-tasks` | Remote tasks |
| `scope:mfe-profile` | Remote profile |
| `scope:shared` | Libs compartilhadas |
| `type:ui` | Componentes visuais |
| `type:data-access` | Stores, HTTP |
| `type:domain` | Entidades de negócio |
| `type:util` | Helpers puros |

Regras de acesso estão em `eslint.config.mjs` — viole-as e o lint falhará.

---

## Dúvidas?

Abra uma [Issue](https://github.com/giorgiocost/mind-ease-fiap/issues) ou chame no Discord do time.

---

Happy coding! 🚀
