import { Locator, Page } from '@playwright/test';

/** Status values as they appear in the DOM (cdkDropList [id] attribute) */
type KanbanStatus = 'TODO' | 'DOING' | 'DONE';

export class TasksPage {
  readonly page: Page;
  /** Native button (.btn-create) — NOT a ui-button wrapper */
  readonly createTaskButton: Locator;
  /** Search input (type="text" .search-input) — only visible when density != simple */
  readonly searchInput: Locator;
  /** Status-change select inside each task card */
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createTaskButton = page.locator('button.btn-create');
    this.searchInput = page.locator('input.search-input');
    this.filterDropdown = page.locator('select.filter-select');
  }

  async goto() {
    await this.page.goto('/tasks');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Opens the create-task modal and submits it.
   * Waits for the task title to appear in the task list.
   */
  async createTask(title: string, description?: string) {
    await this.createTaskButton.click();
    // Modal input id="task-title"
    await this.page.fill('input#task-title', title);
    if (description) {
      await this.page.fill('textarea#task-description', description);
    }
    await this.page.click('.modal-footer button[type="submit"]');
    // Wait for the task title to appear anywhere in the columns
    await this.page.locator('.drag-wrapper').filter({ hasText: title }).waitFor({ timeout: 5000 });
  }

  /**
   * Changes a task's status using the move-select dropdown inside the task card.
   * More reliable than CDK drag & drop in CI/headless mode.
   */
  async moveTaskViaSelect(taskTitle: string, toStatus: KanbanStatus) {
    const taskCard = this.page
      .locator('.drag-wrapper')
      .filter({ hasText: taskTitle })
      .first();
    const moveSelect = taskCard.locator('select.move-select');
    await moveSelect.selectOption(toStatus);
    // Wait for the tasks API update
    await this.page.waitForResponse(/\/api\/v1\/tasks/);
  }

  /**
   * CDK drag-to-column — use only in headed mode; prefer moveTaskViaSelect in CI.
   */
  async dragTask(taskTitle: string, toStatus: KanbanStatus) {
    const task = this.page
      .locator('.drag-wrapper')
      .filter({ hasText: taskTitle })
      .first();
    const targetColumn = this.page.locator(
      `.column-body[id="${toStatus}"]`
    );
    await task.dragTo(targetColumn);
    await this.page.waitForResponse(/\/api\/v1\/tasks/);
  }

  async searchTasks(query: string) {
    await this.searchInput.fill(query);
    // Angular search debounce fires automatically; subsequent assertions poll
  }

  /**
   * Counts task cards (.drag-wrapper) inside a kanban column.
   * Column CSS classes: .column-todo, .column-doing, .column-done
   */
  async getTasksInColumn(column: 'todo' | 'doing' | 'done'): Promise<number> {
    return await this.page
      .locator(`.column-${column} .drag-wrapper`)
      .count();
  }

  async deleteTask(taskTitle: string) {
    const taskCard = this.page
      .locator('.drag-wrapper')
      .filter({ hasText: taskTitle })
      .first();
    await taskCard.locator('button[aria-label="Excluir tarefa"]').click();
    await this.page.waitForResponse(/\/api\/v1\/tasks/);
  }
}
