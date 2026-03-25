export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  userScope: (userId: string) => ({
    assets: {
      all: ['assets', userId] as const,
      lists: () => ['assets', userId, 'list'] as const,
      list: (filters: Record<string, any>) => ['assets', userId, 'list', filters] as const,
      details: () => ['assets', userId, 'detail'] as const,
      detail: (id: string) => ['assets', userId, 'detail', id] as const,
      history: (id: string) => ['assets', userId, 'detail', id, 'history'] as const,
    },
    inventory: {
      all: ['inventory', userId] as const,
      periods: () => ['inventory', userId, 'periods'] as const,
      period: (periodId: string) => [...['inventory', userId, 'periods'], periodId] as const,
      assets: (periodId: string) => [...['inventory', userId, 'periods'], periodId, 'assets'] as const,
      records: (periodId: string) => [...['inventory', userId, 'periods'], periodId, 'records'] as const,
      progress: (periodId: string) => [...['inventory', userId, 'periods'], periodId, 'progress'] as const,
    },
  }),
  catalogs: {
    all: ['catalogs'] as const,
    cities: () => [...queryKeys.catalogs.all, 'cities'] as const,
    areas: () => [...queryKeys.catalogs.all, 'areas'] as const,
    categories: () => [...queryKeys.catalogs.all, 'categories'] as const,
    accountingGroups: () => [...queryKeys.catalogs.all, 'accounting-groups'] as const,
  },
  assignments: {
    all: ['assignments'] as const,
    byAsset: (assetId: string) => [...queryKeys.assignments.all, 'by-asset', assetId] as const,
  },
} as const
