import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { db } from '../db';

export class UserRepositoryImpl implements IUserRepository {
  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const query = `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING id, email, password, created_at as "createdAt", updated_at as "updatedAt"
    `;
    const values = [user.email, user.password];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }
}
