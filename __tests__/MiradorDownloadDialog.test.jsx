import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OSDReferences } from 'mirador';
import miradorDownloadDialog from '../src/MiradorDownloadDialog.jsx';

const MiradorDownloadDialog = miradorDownloadDialog.component;

/** Utility function to wrap  */
function createWrapper(props) {
  return render(
    <MiradorDownloadDialog
      canvasLabel={label => (label || 'My Canvas Title')}
      canvases={[]}
      closeDialog={() => {}}
      containerId="container-123"
      infoResponse={() => ({})}
      manifest={{ getRenderings: () => undefined, getSequences: () => [] }}
      nonTiledResources={[]}
      open
      viewType="single"
      windowId="wid123"
      {...props}
    />,
  );
}

describe('Dialog', () => {
  beforeAll(() => {
    OSDReferences.set('wid123', {
      current: { 
        viewport: {
          getBounds: () => ({ x: 0, y: 0, width: 4000, height: 1000 })
        }
      },
    });
  });

  it('does not render anything if the open prop is false', () => {
    createWrapper({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a CanvasDownloadLinks component for every canvas', () => {
    const mockCanvas = id => ({
      id,
      getHeight: () => 4000,
      getWidth: () => 1000,
      getRenderings: () => [],
      getCanonicalImageUri: () => 'https://example.com/iiif/abc123/full/9000,/0/default.jpg',
    });
    const mockInfoResponse = () => ({
      json: {
        width: 1000,
        height: 4000,
        profile: ['http://iiif.io/api/image/2/level1.json'],
      },
    });
    createWrapper({ 
      canvases: [mockCanvas('abc123'), mockCanvas('xyz321')],
      infoResponse: mockInfoResponse 
    });
    
    // Check that canvas headings are rendered
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0);
  });

  it('has a close button that triggers the closeDialog prop', async () => {
    const closeDialog = vi.fn();
    const user = userEvent.setup();
    createWrapper({ closeDialog });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(closeDialog).toHaveBeenCalled();
  });

  describe('ManifestDownloadLinks', () => {
    it('is not rendered if the manifest has no renderings', () => {
      createWrapper();

      expect(screen.queryByText('Other download options')).not.toBeInTheDocument();
    });
    
    it('rendered if the manifest has renderings', () => {
      const rendering = { 
        id: 'http://example.com/test.pdf', 
        getLabel: () => ({ getValue: () => 'Test PDF' }), 
        getFormat: () => ({ value: 'application/pdf' }) 
      };
      createWrapper({
        manifest: {
          getRenderings: () => undefined,
          getSequences: () => [
            { getRenderings: () => [rendering] },
          ],
        },
      });

      expect(screen.getByText('Other download options')).toBeInTheDocument();
    });

    it('rendered if the manifest has v3 manifest-level renderings', () => {
      const rendering = { 
        id: 'http://example.com/test.pdf', 
        getLabel: () => ({ getValue: () => 'Test PDF' }), 
        getFormat: () => ({ value: 'application/pdf' }) 
      };
      createWrapper({
        manifest: {
          getRenderings: () => [rendering],
          getSequences: () => undefined,
        },
      });

      expect(screen.getByText('Other download options')).toBeInTheDocument();
    });
  });
});

describe('mapStateToProps', () => {
  const state = {
    infoResponses: {
      'https://example.com/image/iiif/abc123_0001': {
        json: {
          width: 2579,
          height: 3638,
          sizes: [
            {
              width: 81,
              height: 114,
            },
            {
              width: 161,
              height: 227,
            },
            {
              width: 322,
              height: 455,
            },
            {
              width: 645,
              height: 909,
            },
            {
              width: 1290,
              height: 1819,
            },
            {
              width: 2579,
              height: 3638,
            },
          ],
        },
      },
    },
    manifests: {
      'http://example.com/abc123/iiif/manifest': {
        json: {
          '@context': 'http://iiif.io/api/presentation/2/context.json',
          '@id': 'http://example.com/abc123/iiif/manifest',
          '@type': 'sc:Manifest',
          sequences: [
            {
              '@id': 'http://example.com/abc123/iiif/sequence/normal',
              '@type': 'sc:Sequence',
              canvases: [
                {
                  '@id': 'http://example.com/abc123/canvas/0',
                  '@type': 'sc:Canvas',
                  width: 2579,
                  height: 3638,
                  images: [
                    {
                      '@type': 'oa:Annotation',
                      motivation: 'sc:painting',
                      on: 'http://example.com/abc123/canvas/0',
                      resource: {
                        '@id': 'https://example.com/image/iiif/abc123_0001/full/full/0/default.jpg',
                        '@type': 'dctypes:Image',
                        format: 'image/jpeg',
                        service: {
                          '@context': 'http://iiif.io/api/image/2/context.json',
                          '@id': 'https://example.com/image/iiif/abc123_0001',
                          profile: 'http://iiif.io/api/image/2/level2.json',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    windows: {
      'window-abc123': {
        manifestId: 'http://example.com/abc123/iiif/manifest',
      },
    },
    windowDialogs: {},
    config: {},
  };
  const props = { windowId: 'window-abc123' };
  const mapStateToProps = miradorDownloadDialog.mapStateToProps(state, props);

  describe('infoResponse', () => {
    it('gets the correct info response from state', () => {
      expect(mapStateToProps.infoResponse('http://example.com/abc123/canvas/0').json.sizes.length).toBe(6);
    });
  });
});
