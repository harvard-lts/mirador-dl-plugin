import { render, screen, cleanup } from '@testing-library/react';
import { OSDReferences } from 'mirador';
import CanvasDownloadLinks from '../src/CanvasDownloadLinks.jsx';

function createWrapper(props) {
  return render(
    <CanvasDownloadLinks
      canvasId="abc123"
      canvasLabel="My Canvas Label"
      infoResponse={{}}
      nonTiledResources={[]}
      restrictDownloadOnSizeDefinition={false}
      viewType="single"
      windowId="wid123"
      {...props}
    />,
  );
}

describe('CanvasDownloadLinks', () => {
  const canvas = {
    id: 'abc123',
    getCanonicalImageUri: width => (
      width
        ? `http://example.com/iiif/abc123/full/${width},/0/default.jpg`
        : 'http://example.com/iiif/abc123/full/4000,/0/default.jpg'
    ),
    getHeight: () => 1000,
    getWidth: () => 4000,
    getRenderings: () => [
      {
        id: 'http://example.com/abc123.pdf',
        getLabel: () => ({ getValue: () => 'Link to the PDF' }),
        getFormat: () => ({ value: 'application/pdf' }),
      },
    ],
  };
  const viewport = {
    getBounds: () => ({
      x: 0, y: 0, width: 4000, height: 1000,
    }),
  };
  const zoomedInViewport = {
    getBounds: () => ({
      x: 0, y: 0, width: 2000, height: 500,
    }),
  };

  const zoomedOutViewport = {
    getBounds: () => ({
      x: 0, y: 0, width: 6000, height: 1000,
    }),
  };

  const zoomedIntoNonImageSpaceViewport = {
    getBounds: () => ({
      x: -100, y: 100, width: 2000, height: 500,
    }),
  };

  beforeAll(() => {
    OSDReferences.set('wid123', {
      current: { viewport },
    });
    OSDReferences.set('zoomedInWindow', {
      current: { viewport: zoomedInViewport },
    });
    OSDReferences.set('zoomedOutWindow', {
      current: { viewport: zoomedOutViewport },
    });
    OSDReferences.set('zoomedIntoNonImageSpaceWindow', {
      current: { viewport: zoomedIntoNonImageSpaceViewport },
    });
  });

  it('renders canvas label in an h3 typography', () => {
    createWrapper({ canvas });
    expect(screen.getByRole('heading', { name: 'My Canvas Label', level: 3 })).toBeInTheDocument();
  });

  it('renders canvas level renderings', () => {
    createWrapper({ canvas });
    expect(screen.getByRole('link', { name: 'Link to the PDF' })).toBeInTheDocument();
  });

  describe('Zoomed region link', () => {
    const infoResponse = {
      json: {
        '@context': 'http://iiif.io/api/image/2/context.json',
        '@id': 'http://example.com/iiif/abc123/',
        width: 4000,
        height: 1000,
        profile: [
          'http://iiif.io/api/image/2/level1.json',
        ],
      },
    };

    it('it does not render a link when the viewer is zoomed out/at the entire image', () => {
      createWrapper({ canvas, infoResponse, windowId: 'zoomedOutWindow' });
      expect(screen.getAllByRole('link').length).toBe(3);
      cleanup();

      createWrapper({ canvas, infoResponse, windowId: 'wid123' });
      expect(screen.getAllByRole('link').length).toBe(3);
    });

    it('does not render a link when the viewer is zoomed into non-image space (e.g. a reponse the image server cannot handle)', () => {
      createWrapper({ canvas, infoResponse, windowId: 'zoomedIntoNonImageSpaceWindow' });

      expect(screen.getAllByRole('link').length).toBe(3);
    });

    it('is present when the viewer is zoomed into the image', () => {
      createWrapper({ canvas, infoResponse, windowId: 'zoomedInWindow' });

      expect(screen.getAllByRole('link').length).toBe(4);
      expect(screen.getByRole('link', { name: 'Zoomed region (2000 x 500px)' }))
        .toHaveAttribute('href', 'http://example.com/iiif/abc123/0,0,2000,500/2000,/0/default.jpg?download=true');
    });

    it('is not present when the window is in book or gallery view (only single view)', () => {
      createWrapper({
        canvas, infoResponse, viewType: 'book', windowId: 'zoomedInWindow',
      });

      expect(screen.getAllByRole('link').length).toBe(3);
      cleanup();

      createWrapper({
        canvas, infoResponse, viewType: 'gallery', windowId: 'zoomedInWindow',
      });

      expect(screen.getAllByRole('link').length).toBe(3);
    });

    describe('when the zoom link is set to be restricted', () => {
      it('has just the whole image link from the sizes and does not present a zoomed region link', () => {
        createWrapper({
          canvas,
          infoResponse: {
            json: {
              width: 4000,
              height: 1000,
              sizes: [{
                width: 400,
                height: 100,
              }],
            },
          },
          restrictDownloadOnSizeDefinition: true,
          windowId: 'zoomedInWindow',
        });

        const links = screen.getAllByRole('link');
        expect(links.length).toBe(2); // PDF rendering + whole image
        expect(screen.getByRole('link', { name: 'Whole image (400 x 100px)' })).toBeInTheDocument();
      });
    });
  });

  describe('when there is are sizes defined in the infoResponse', () => {
    const infoResponse = {
      json: {
        '@context': 'http://iiif.io/api/image/2/context.json',
        '@id': 'http://example.com/iiif/abc123/',
        width: 4000,
        height: 1000,
        profile: [
          'http://iiif.io/api/image/2/level1.json',
        ],
        sizes: [
          { width: 4000, height: 1000 },
          { width: 2000, height: 500 },
          { width: 1000, height: 250 },
        ],
      },
    };
    it('uses those sizes for links in the download dialog', () => {
      createWrapper({ canvas, infoResponse });

      expect(screen.getByRole('link', { name: 'Whole image (4000 x 1000px)' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Whole image (2000 x 500px)' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Whole image (1000 x 250px)' })).toBeInTheDocument();
    });
  });

  describe('when there are no defined sizes', () => {
    const infoResponse = {
      json: {
        '@context': 'http://iiif.io/api/image/2/context.json',
        '@id': 'http://example.com/iiif/abc123/',
        width: 4000,
        height: 1000,
        profile: [
          'http://iiif.io/api/image/2/level1.json',
        ],
      },
    };

    it('renders a link to the whole image', () => {
      createWrapper({ canvas, infoResponse });
      
      expect(screen.getByRole('link', { name: 'Whole image (4000 x 1000px)' }))
        .toHaveAttribute('href', 'http://example.com/iiif/abc123/full/full/0/default.jpg?download=true');
    });

    describe('when the image is > 1000px wide', () => {
      it('renders a link to a small image (1000px wide), and calculates the correct height', () => {
        createWrapper({ canvas, infoResponse });
        
        expect(screen.getAllByRole('link').length).toEqual(3); // PDF rendering + full image + 1000px image
        expect(screen.getByRole('link', { name: 'Whole image (1000 x 250px)' }))
          .toHaveAttribute('href', 'http://example.com/iiif/abc123/full/1000,/0/default.jpg?download=true');
      });
    });

    describe('when the image is < 1000px wide', () => {
      it('does not render a link to a small image', () => {
        canvas.getWidth = () => 999;
        const smallInfoResponse = {
          json: {
            '@context': 'http://iiif.io/api/image/2/context.json',
            '@id': 'http://example.com/iiif/abc123/',
            width: 999,
            height: 250,
            profile: [
              'http://iiif.io/api/image/2/level1.json',
            ],
          },
        };
        createWrapper({ canvas, infoResponse: smallInfoResponse });
        expect(screen.getAllByRole('link').length).toEqual(2); // PDF rendering + full image only (no 1000px link)
      });
    });
  });
});
