import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmationModal from '@/app/components/DeleteModal';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'task.deleteTitle': 'Delete Task',
        'task.deleteConfirm': 'Are you sure?',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'task.deleting': 'Deleting...',
      };
      return map[key] || key;
    },
  }),
}));

describe('DeleteConfirmationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Add portal root
    const portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'portal-root');
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    // Clean up
    const portalRoot = document.getElementById('portal-root');
    if (portalRoot) {
      document.body.removeChild(portalRoot);
    }
  });

  it('renders nothing when not open', () => {
    render(
      <DeleteConfirmationModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders correctly when open', async () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    const cancelButton = await screen.findByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Delete is clicked', async () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    const deleteButton = await screen.findByText('Delete');
    fireEvent.click(deleteButton);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isDeleting is true', async () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    );
    expect(await screen.findByText('Deleting...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
    expect(screen.getByText('Cancel').closest('button')).toBeDisabled();
  });
});
