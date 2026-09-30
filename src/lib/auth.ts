import { Actor } from './types';
import { ROLE_KEYS } from './api';

export const ACTORS: Actor[] = [
  {
    apiKey: ROLE_KEYS.employee,
    role: 'employee',
    actorId: 'EMP-0060',
    name: 'Ravi Yadav',
    title: 'Senior Software Engineer',
    avatarInitials: 'RY',
  },
  {
    apiKey: ROLE_KEYS.manager,
    role: 'manager',
    actorId: 'EMP-0054',
    name: 'Karthik Jain',
    title: 'Engineering Director',
    avatarInitials: 'KJ',
  },
  {
    apiKey: ROLE_KEYS.finance,
    role: 'finance',
    actorId: 'EMP-0053',
    name: 'Arjun Prasad',
    title: 'Head of Financial Compliance',
    avatarInitials: 'AP',
  },
  {
    apiKey: ROLE_KEYS.admin,
    role: 'admin',
    actorId: 'EMP-0052',
    name: 'Chaitanya Raju',
    title: 'Chief Operating Officer',
    avatarInitials: 'CR',
  },
];

const STORAGE_KEY = 'fin21_session';

export function getStoredUser(): Actor | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('fin21_auth_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(actor: Actor): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actor));
  } catch (err) {
    console.error('Failed to store auth user', err);
  }
}

export function clearStoredUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('fin21_auth_user');
  } catch (err) {
    console.error('Failed to clear auth user', err);
  }
}
