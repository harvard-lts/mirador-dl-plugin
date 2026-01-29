import Mirador from 'mirador/dist/es/src/index';
import miradorDownloadPlugins from '../src';

const config = {
  id: 'mirador',
  miradorDownloadPlugin: {
    restrictDownloadOnSizeDefinition: true,
  },
  windows: [{
    loadedManifest: 'https://purl.stanford.edu/bb020ty1503/iiif/manifest',
  },
  {
    loadedManifest: 'https://scta.info/iiif/graciliscommentary/lon/manifest',
    view: 'book',
    canvasIndex: 3,
  },
  {
    loadedManifest: 'https://purl.stanford.edu/xh756kf1140/iiif/manifest',
  },
  {
    loadedManifest: 'https://digital.library.villanova.edu/Item/vudl:24299/Manifest',
  },
  {
    loadedManifest: 'https://nrs.harvard.edu/URN-3:FHCL:103496523:MANIFEST:2',
  },
    {
    loadedManifest: 'https://nrs.harvard.edu/URN-3:FHCL:103496523:MANIFEST:3',
  }],
};

Mirador.viewer(config, [
  ...miradorDownloadPlugins,
]);
