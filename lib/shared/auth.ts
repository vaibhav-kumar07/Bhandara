import { ADMIN_ROLE } from './constants'

export interface AdminSession {
  id: string
  username: string
  role: typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
}

export function isAdmin(session: AdminSession | null): boolean {
  return session !== null && (session.role === ADMIN_ROLE.ADMIN || session.role === ADMIN_ROLE.SUPER_ADMIN)
}

export function isSuperAdmin(session: AdminSession | null): boolean {
  return session !== null && session.role === ADMIN_ROLE.SUPER_ADMIN
}
