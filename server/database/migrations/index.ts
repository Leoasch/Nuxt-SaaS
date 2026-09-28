import * as baseline from './0001-baseline'
import * as queryIndexes from './0002-query-indexes'
import * as reconcileSyncedSchema from './0003-reconcile-synced-schema'

export const MIGRATIONS = [
  { name: '0001-baseline', ...baseline },
  { name: '0002-query-indexes', ...queryIndexes },
  { name: '0003-reconcile-synced-schema', ...reconcileSyncedSchema }
]
