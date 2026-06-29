import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import uniqBy from 'lodash/uniqBy';
import { OSDReferences } from 'mirador';
import RenderingDownloadLink from './RenderingDownloadLink.jsx';
import { calculateHeightForWidth, createCanonicalImageUrl } from './iiifImageFunctions';

/**
 * CanvasDownloadLinks ~
*/
function CanvasDownloadLinks({
  canvas,
  canvasLabel,
  infoResponse,
  nonTiledResources,
  restrictDownloadOnSizeDefinition,
  viewType,
  windowId,
}) {
  const osdViewport = () => OSDReferences.get(windowId).current.viewport;

  const currentBounds = () => {
    const bounds = osdViewport().getBounds();

    return Object.keys(bounds).reduce((object, key) => {
      object[key] = Math.ceil(bounds[key]); // eslint-disable-line no-param-reassign
      return object;
    }, {});
  };

  const zoomedImageLabel = () => {
    const bounds = currentBounds();
    return `Zoomed region (${Math.floor(bounds.width)} x ${Math.floor(bounds.height)}px)`;
  };

  const fullImageLabel = () => {
    const imageInfo = infoResponse && infoResponse.json;

    return imageInfo && `Whole image (${imageInfo.width} x ${imageInfo.height}px)`;
  };

  const smallImageLabel = () => {
    const imageInfo = infoResponse && infoResponse.json;
    const height = Math.floor((1000 * imageInfo.height) / imageInfo.width);

    return `Whole image (1000 x ${height}px)`;
  };

  const zoomedImageUrl = () => {
    const imageInfo = infoResponse && infoResponse.json;
    const bounds = currentBounds();
    const boundsUrl = createCanonicalImageUrl(
      imageInfo,
      `${bounds.x},${bounds.y},${bounds.width},${bounds.height}`,
      bounds.width,
      bounds.height,
    );

    return imageInfo && boundsUrl && `${boundsUrl}?download=true`;
  };

  const imageUrlForSize = (size) => {
    const imageInfo = infoResponse && infoResponse.json;

    return imageInfo && `${createCanonicalImageUrl(imageInfo, 'full', size.width, size.height)}?download=true`;
  };

  const fullImageUrl = () => {
    const imageInfo = infoResponse && infoResponse.json;

    return imageInfo && `${createCanonicalImageUrl(imageInfo, 'full', imageInfo.width, imageInfo.height)}?download=true`;
  };

  const thousandPixelWideImage = () => {
    const imageInfo = infoResponse && infoResponse.json;
    const height = calculateHeightForWidth(imageInfo, 1000);

    return imageInfo && `${createCanonicalImageUrl(imageInfo, 'full', 1000, height)}?download=true`;
  };

  /**
   * This only returns unique sizes
  */
  const definedSizes = () => {
    if (!(infoResponse && infoResponse.json && infoResponse.json.sizes)) return [];

    return uniqBy(infoResponse.json.sizes, size => `${size.width}${size.height}`);
  };

  const definedSizesRestrictsDownload = () => {
    if (!infoResponse.json) return false;
    const { height, width } = infoResponse.json;

    if (definedSizes().length !== 1) return false;

    return definedSizes()[0].width <= width
           && definedSizes()[0].height <= height;
  };

  const displayCurrentZoomLink = () => {
    if (viewType !== 'single') return false;
    if (restrictDownloadOnSizeDefinition && definedSizesRestrictsDownload()) return false;
    if (!(infoResponse && infoResponse.json)) return false;

    const bounds = currentBounds();
    return bounds.height < infoResponse.json.height
      && bounds.width < infoResponse.json.width
      && bounds.x >= 0
      && bounds.y >= 0;
  };

  const fullImageLink = () => {
    const url = fullImageUrl();
    return url
      ? (
        <ListItem disableGutters divider key={url}>
          <Link href={url} rel="noopener noreferrer" target="_blank" variant="body1">
            {fullImageLabel()}
          </Link>
        </ListItem>
      )
      : '';
  };

  const thousandPixelWideLink = () => {
    const imageInfo = infoResponse && infoResponse.json;

    if (!imageInfo || imageInfo.width < 1000) return '';

    return (
      <ListItem disableGutters divider key={thousandPixelWideImage()}>
        <Link href={thousandPixelWideImage()} rel="noopener noreferrer" target="_blank" variant="body1">
          {smallImageLabel()}
        </Link>
      </ListItem>
    );
  };

  const linksForDefinedSizes = () => (
    definedSizes().map(size => (
      <ListItem disableGutters divider key={`${size.width}${size.height}`}>
        <Link href={imageUrlForSize(size)} rel="noopener noreferrer" target="_blank" variant="body1">
          {`Whole image (${size.width} x ${size.height}px)`}
        </Link>
      </ListItem>
    ))
  );

  const nonTiledLabel = (image) => {
    const width = image.getProperty('width');
    const height = image.getProperty('height');
    const label = image.getProperty('label');
    if (width && height) {
      return `Whole image (${width} x ${height}px)`;
    }
    return `Whole image (${label || image.id})`;
  };

  const nonTiledImagesForCanvas = () => {
    if (!nonTiledResources || nonTiledResources.length === 0) {
      return [];
    }
    return nonTiledResources.filter((res) => {
      const format = res.getProperty('format');
      return (
        (res.getProperty('type') === 'Image' || res.getProperty('type') === 'dctypes:Image' || (format && format.startsWith('image/')))
        && canvas.imageResources && canvas.imageResources.find(r => r.id === res.id)
      );
    });
  };

  const nonTiledImageLinks = () => nonTiledImagesForCanvas().map(image => (
    <ListItem disableGutters divider key={image.id}>
      <Link
        href={`${image.id}?download=true`}
        rel="noopener noreferrer"
        target="_blank"
        variant="body1"
      >
        {nonTiledLabel(image)}
      </Link>
    </ListItem>
  ));

  return (
    <>
      <Typography noWrap variant="h3" sx={{ marginTop: '20px' }}>{canvasLabel}</Typography>
      <List>
        {displayCurrentZoomLink()
          && (
            <ListItem disableGutters divider>
              <Link href={zoomedImageUrl()} rel="noopener noreferrer" target="_blank" variant="body1">
                {zoomedImageLabel()}
              </Link>
            </ListItem>
          )
        }
        {definedSizes().length === 0
          && ([fullImageLink(), thousandPixelWideLink()])}
        {definedSizes().length > 0
          && (linksForDefinedSizes())}
        {nonTiledImageLinks()}
        {canvas.getRenderings().map(rendering => (
          <RenderingDownloadLink rendering={rendering} key={rendering.id} />
        ))}
      </List>
    </>
  );
}

CanvasDownloadLinks.propTypes = {
  canvas: PropTypes.shape({
    id: PropTypes.string.isRequired,
    getCanonicalImageUri: PropTypes.func.isRequired,
    getHeight: PropTypes.func.isRequired,
    getRenderings: PropTypes.func.isRequired,
    getWidth: PropTypes.func.isRequired,
    imageResources: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.string }),
    ),
  }).isRequired,
  canvasLabel: PropTypes.string.isRequired, // canvasLabel is passed because we need access to redux
  infoResponse: PropTypes.shape({
    json: PropTypes.shape({
      height: PropTypes.number,
      sizes: PropTypes.arrayOf(
        PropTypes.shape({ height: PropTypes.number, width: PropTypes.number }),
      ),
      width: PropTypes.number,
    }),
  }).isRequired,
  nonTiledResources: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, format: PropTypes.string }),
  ).isRequired,
  restrictDownloadOnSizeDefinition: PropTypes.bool.isRequired,
  viewType: PropTypes.string.isRequired,
  windowId: PropTypes.string.isRequired,
};

export default CanvasDownloadLinks;
