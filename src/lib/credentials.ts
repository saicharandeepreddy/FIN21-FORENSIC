export interface UserCredential {
  email: string;
  password: string;
  role: 'employee' | 'manager' | 'finance' | 'admin';
  actorId: string;
  name: string;
  apiKey: string;
  title?: string;
  avatarInitials?: string;
}

export const CREDENTIALS: UserCredential[] = [
  {
    email: "ravi@tulasisupplies.example",
    password: "demo1234",
    role: "employee",
    actorId: "EMP-0060",
    name: "Ravi Yadav",
    apiKey: "sk_employee_ravi",
    title: "Senior Software Engineer",
    avatarInitials: "RY",
  },
  {
    email: "karthik@tulasisupplies.example",
    password: "demo1234",
    role: "manager",
    actorId: "EMP-0054",
    name: "Karthik Jain",
    apiKey: "sk_manager_karthik",
    title: "Engineering Director",
    avatarInitials: "KJ",
  },
  {
    email: "arjun@tulasisupplies.example",
    password: "demo1234",
    role: "finance",
    actorId: "EMP-0053",
    name: "Arjun Prasad",
    apiKey: "sk_finance_arjun",
    title: "Head of Financial Compliance",
    avatarInitials: "AP",
  },
  {
    email: "chaitanya@tulasisupplies.example",
    password: "demo1234",
    role: "admin",
    actorId: "EMP-0052",
    name: "Chaitanya Raju",
    apiKey: "sk_admin_chaitanya",
    title: "Chief Operating Officer",
    avatarInitials: "CR",
  },
];

export function authenticate(email: string, password: string): UserCredential | null {
  const match = CREDENTIALS.find(
    (c) =>
      c.email.toLowerCase() === email.trim().toLowerCase() &&
      c.password === password
  );
  return match || null;
}
