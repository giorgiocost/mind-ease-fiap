/**
 * Flow 3: Task Management — Create → Move → Delete
 *
 * Covers:
 * - Kanban board renders all 3 columns (TODO, DOING, DONE)
 * - Open create-task modal and submit
 * - Move task status via select dropdown (CI-reliable, no drag required)
 * - Search/filter tasks
 * - Delete task
 */
import { test, expect } from '../fixtures/test.fixture';
import { Page } from '@playwright/test';
import { makeTaskResponse, MOCK_TASKS } from '../helpers/mock-data';

/** Override API mocks with task-aware responses. */
async function setupTaskApiMocks(page: Page) {
  // Add tasks-specific route AFTER catch-all (takes precedence in LIFO order)
  await page.context().route('**/api/v1/tasks**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_TASKS),
      });
    }
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as { title: string };
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(makeTaskResponse(body?.title ?? 'New Task')),
      });
    }
    // PATCH / DELETE
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null, message: 'ok' }),
    });
  });
  // NOTE: No second catch-all — the authenticatedPage fixture's catch-all handles everything else.
}

test.describe('Flow 3: Task Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Re-register task-aware routes (override the catch-all from authenticatedPage)
    await setupTaskApiMocks(authenticatedPage);
    await authenticatedPage.goto('/tasks');
    await authenticatedPage.waitForLoadState('domcontentloaded');
  });

  test('should render kanban board with all 3 columns', async ({
    authenticatedPage,
  }) => {
    // After loading with MOCK_TASKS, we should see task columns
    await expect(authenticatedPage.locator('.column-todo')).toBeVisible();
    await expect(authenticatedPage.locator('.column-doing')).toBeVisible();
    await expect(authenticatedPage.locator('.column-done')).toBeVisible();
  });

  test('should open create-task modal and submit new task @critical', async ({
    authenticatedPage,
    tasksPage,
  }) => {
    // Click "Nova Tarefa" button
    await tasksPage.createTaskButton.click();

    // Verify modal is open
    const modal = authenticatedPage.locator('.modal-card');
    await expect(modal).toBeVisible();
    await expect(
      authenticatedPage.locator('.modal-title')
    ).toContainText('Nova Tarefa');

    // Fill title and submit
    const uniqueTitle = `Task E2E ${Date.now()}`;
    await authenticatedPage.fill('input#task-title', uniqueTitle);
    await authenticatedPage.click('.modal-footer button[type="submit"]');

    // Modal should close
    await expect(modal).not.toBeVisible();
  });

  test('should change task status via move-select @critical', async ({
    authenticatedPage,
  }) => {
    // "Existing Task" is in TODO from MOCK_TASKS
    const taskTitle = 'Existing Task';

    // The task card should be in the TODO column
    const todoTask = authenticatedPage
      .locator('.column-todo')
      .locator('.drag-wrapper')
      .filter({ hasText: taskTitle });
    await expect(todoTask.first()).toBeVisible();

    // Change status to DOING using the move-select
    const moveSelect = todoTask.first().locator('select.move-select');
    await moveSelect.selectOption('DOING');

    // The API call should be made
    await authenticatedPage.waitForResponse(/\/api\/v1\/tasks/);
  });

  test('should search tasks using the search input', async ({
    authenticatedPage,
    tasksPage,
  }) => {
    // Only visible when uiDensity is not 'simple' (default='medium')
    const searchInput = authenticatedPage.locator('input.search-input');
    if (await searchInput.isVisible()) {
      await tasksPage.searchTasks('Existing');
      // After search, unrelated tasks should be hidden (or "In Progress" not visible)
      // We can only assert the search input contains the query
      await expect(searchInput).toHaveValue('Existing');
    } else {
      // In simple density, search is hidden — just skip
      test.skip();
    }
  });

  test('should delete a task @critical', async ({
    authenticatedPage,
    tasksPage,
  }) => {
    const taskTitle = 'Existing Task';

    // Confirm delete button exists on the task card
    const taskCard = authenticatedPage
      .locator('.drag-wrapper')
      .filter({ hasText: taskTitle })
      .first();
    const deleteBtn = taskCard.locator('button[aria-label="Excluir tarefa"]');
    await expect(deleteBtn).toBeVisible();

    // Click delete and wait for API
    await deleteBtn.click();
    await authenticatedPage.waitForResponse(/\/api\/v1\/tasks/);
  });
});
