import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '@server/storage';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set');
}

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  const user = await storage.getUserByUsername(username);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role || 'admin'
  };
}

export async function createAdminUser(username: string, password: string): Promise<void> {
  const hashedPassword = await hashPassword(password);
  await storage.createUser({
    username,
    password: hashedPassword,
    role: 'admin'
  });
}