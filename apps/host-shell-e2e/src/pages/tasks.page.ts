import { Page, Locator } from '@playwright/test';

export class TasksPage {
  readonly page: Page;
  readonly createTaskButton: Locator;
  readonly todoColumn: Locator;
  readonly doingColumn: Locator;
  readonly doneColumn: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createTaskButton = page.locator('button:has-text("Nova Tarefa")');
    this.todoColumn = page.locator('[data-status="todo"]');
    this.doingColumn = page.locator('[data-status="doing"]');
    this.doneColumn = page.locator('[data-status="done"]');
    this.searchInput = page.locator('input[type="search"]');
    this.filterDropdown = page.locator('select[name="filter"]');
  }

  async goto() {
    await this.page.goto('/tasks');
  }

  async createTask(title: string, description?: string) {
    await this.createTaskButton.click();
    await this.page.fill('input[name="title"]', title);
    if (description) {
      await this.page.fill('textarea[name="description"]', description);
    }
    await this.page.click('button:has-text("Criar")');
    await this.page.waitForSelector(`text=${title}`);
  }

  async dragTask(
    taskTitle: string,
    toColumn: 'todo' | 'doing' | 'done'
  ) {
    const task = this.page
      .locator(`text=${taskTitle}`)
      .locator('..')
      .locator('..');
    const targetColumn = this.page.locator(
      `[data-status="${toColumn}"] .column-content`
    );
    await task.dragTo(targetColumn);
    await this.page.waitForResponse(/\/api\/v1\/tasks\/.*\/status/);
  }

  async searchTasks(query: string) {
    await this.searchInput.fill(query);
    // Allow search debounce to fire
    await this.page.waitForTimeout(500);
  }

  async getTasksInColumn(
    column: 'todo' | 'doing' | 'done'
  ): Promise<number> {
    return await this.page
      .locator(`[data-status="${column}"] .task-card`)
      .count();
  }
}
