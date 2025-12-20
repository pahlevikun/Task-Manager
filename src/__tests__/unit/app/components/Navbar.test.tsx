import { render, screen } from '@testing-library/react';
import Navbar from '@/app/components/Navbar';

jest.mock('@/presentation/actions/auth', () => ({
  logoutAction: jest.fn(),
}));

describe('Navbar', () => {
  it('renders correctly', () => {
    render(<Navbar />);
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('contains logout form', () => {
    const { container } = render(<Navbar />);
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });
});
