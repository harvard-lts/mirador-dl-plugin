import React from 'react';
import { render, screen } from '@testing-library/react';
import RenderingDownloadLink from '../src/RenderingDownloadLink';

function createWrapper(props) {
  return render(
    <RenderingDownloadLink
      rendering={{}}
      {...props}
    />,
  );
}

describe('RenderingDownloadLink', () => {
  const rendering = {
    id: 'http://example.com/abc123.pdf',
    getLabel: () => ({ getValue: () => 'Link to the PDF' }),
    getFormat: () => ({ value: 'application/pdf' }),
  };

  it('renders a Link for the rendering', () => {
    createWrapper({ rendering });

    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('links the label and includes the format (unlinked)', () => {
    createWrapper({ rendering });

    const link = screen.getByRole('link', { name: 'Link to the PDF' });
    expect(link).toHaveAttribute('href', 'http://example.com/abc123.pdf');
    expect(screen.getByText('(application/pdf)', { exact: false })).toBeInTheDocument();
  });
});
