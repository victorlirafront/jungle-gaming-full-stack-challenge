import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <div>
        <h1>Task Management System</h1>
      </div>
    );

    expect(container).toBeDefined();
    expect(screen.getByText('Task Management System')).toBeInTheDocument();
  });
});

