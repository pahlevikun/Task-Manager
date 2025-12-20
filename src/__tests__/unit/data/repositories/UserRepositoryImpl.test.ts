import { UserRepositoryImpl } from '@/data/repositories/UserRepositoryImpl';
import { db } from '@/data/db';

jest.mock('@/data/db', () => ({
  db: {
    query: jest.fn(),
  },
}));

describe('UserRepositoryImpl', () => {
  let userRepository: UserRepositoryImpl;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    const mockUser = { id: '1', email: 'test@example.com', password: 'hashed_password' };
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
    
    const result = await userRepository.create({
      email: 'test@example.com',
      password: 'hashed_password',
    });

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      ['test@example.com', 'hashed_password']
    );
    expect(result).toEqual(mockUser);
  });

  it('should find user by email', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

    const result = await userRepository.findByEmail('test@example.com');

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, email'),
      ['test@example.com']
    );
    expect(result).toEqual(mockUser);
  });

  it('should return null when user not found by email', async () => {
    (db.query as jest.Mock).mockResolvedValue({ rows: [] });

    const result = await userRepository.findByEmail('notfound@example.com');

    expect(result).toBeNull();
  });

  it('should find user by id', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

    const result = await userRepository.findById('1');

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, email'),
      ['1']
    );
    expect(result).toEqual(mockUser);
  });

  it('should return null when user not found by id', async () => {
    (db.query as jest.Mock).mockResolvedValue({ rows: [] });

    const result = await userRepository.findById('999');

    expect(result).toBeNull();
  });
});
