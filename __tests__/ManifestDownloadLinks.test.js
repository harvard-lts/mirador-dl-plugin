import React from 'react';
import { render, screen } from '@testing-library/react';
import ManifestDownloadLinks from '../src/ManifestDownloadLinks';

function createWrapper(props) {
  return render(
    <ManifestDownloadLinks
      classes={{}}
      renderings={[]}
      {...props}
    />,
  );
}

describe('ManifestDownloadLinks', () => {
  const renderings = [
    {
      id: 'http://example.com/abc123.pdf',
      getLabel: () => ({ getValue: () => 'Link to the PDF' }),
      getFormat: () => ({ value: 'application/pdf' }),
    },
    {
      id: 'http://example.com/abc123.txt',
      getLabel: () => ({ getValue: () => 'Link to the OCR' }),
      getFormat: () => ({ value: 'application/text' }),
    },
  ];

  it('renders the heading', () => {
    createWrapper({ renderings });

    expect(screen.getByRole('heading', { name: 'Other download options', level: 3 })).toBeInTheDocument();
  });

  it('renders a RenderingDownloadLink for each rendering', () => {
    createWrapper({ renderings });

    expect(screen.getByRole('link', { name: 'Link to the PDF' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Link to the OCR' })).toBeInTheDocument();
  });
});
