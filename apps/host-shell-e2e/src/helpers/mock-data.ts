/**
 * Shared mock data / factories for E2E tests.
 * All response shapes match the actual API contracts used by MindEase stores.
 */

/** Creates a non-expired JWT (valid for 24h from now). */
export function makeMockJwt(
  sub = '1',
  hoursValid = 24
): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub,
      exp: Math.floor(Date.now() / 1000) + hoursValid * 3600,
    })
  ).toString('base64');
  return `${header}.${payload}.mocksignature`;
}

/** Shape returned by POST /api/v1/auth/login  |  /api/v1/auth/register */
export function makeAuthResponse(
  user = { id: '1', name: 'Test User', email: 'test@mindease.com' }
) {
  const token = makeMockJwt(user.id);
  return {
    user,
    accessToken: token,
    refreshToken: token,
    message: 'success',
  };
}

/** Shape returned by GET /api/v1/dashboard/stats */
export const MOCK_STATS = {
  data: {
    pendingTasks: 3,
    completedToday: 2,
    focusTimeToday: 90,
    totalTasks: 5,
  },
};

/** Shape returned by GET /api/v1/preferences */
export const MOCK_PREFERENCES = {
  data: {
    uiDensity: 'medium',
    focusMode: false,
    contrast: 'normal',
    motion: 'full',
    contentMode: 'standard',
    fontScale: 1,
    spacingScale: 1,
  },
};

/** Shape returned by GET /api/v1/tasks */
export const MOCK_TASKS = {
  data: [
    {
      id: '1',
      title: 'Existing Task',
      description: '',
      status: 'TODO',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      subtasks: [],
      checklistItemsCount: 0,
      checklistCompletedCount: 0,
    },
    {
      id: '2',
      title: 'In Progress Task',
      description: '',
      status: 'DOING',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      subtasks: [],
      checklistItemsCount: 0,
      checklistCompletedCount: 0,
    },
  ],
};

/** Shape returned by POST /api/v1/tasks (create) */
export function makeTaskResponse(title: string, id = `${Date.now()}`) {
  return {
    data: {
      id,
      title,
      description: '',
      status: 'TODO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      checklistItemsCount: 0,
      checklistCompletedCount: 0,
    },
  };
}
