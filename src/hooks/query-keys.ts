export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  assets: {
    all: ['assets'] as const,
    lists: () => [...queryKeys.assets.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.assets.lists(), filters] as const,
    details: () => [...queryKeys.assets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assets.details(), id] as const,
    history: (id: string) => [...queryKeys.assets.detail(id), 'history'] as const,
  },
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
  inventory: {
    all: ['inventory'] as const,
    periods: () => [...queryKeys.inventory.all, 'periods'] as const,
    assets: (periodId: string) => [...queryKeys.inventory.periods(), periodId, 'assets'] as const,
    records: (periodId: string) => [...queryKeys.inventory.periods(), periodId, 'records'] as const,
    progress: (periodId: string) => [...queryKeys.inventory.periods(), periodId, 'progress'] as const,
  },
} as const
