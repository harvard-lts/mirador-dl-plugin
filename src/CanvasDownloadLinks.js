import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import uniqBy from 'lodash/uniqBy';
import { OSDReferences } from 'mirador/dist/es/src/plugins/OSDReferences';
import RenderingDownloadLink from './RenderingDownloadLink';
import { calculateHeightForWidth, createCanonicalImageUrl } from './iiifImageFunctions';


/**
 * CanvasDownloadLinks ~
*/
export default class CanvasDownloadLinks extends Component {
  zoomedImageLabel() {
    const bounds = this.currentBounds();
    return `Zoomed region (${Math.floor(bounds.width)} x ${Math.floor(bounds.height)}px)`;
  }

  fullImageLabel() {
    const { infoResponse } = this.props;
    const imageInfo = infoResponse && infoResponse.json;

    return imageInfo && `Whole image (${imageInfo.width} x ${imageInfo.height}px)`;
  }

  smallImageLabel() {
    const { infoResponse } = this.props;
    const imageInfo = infoResponse && infoResponse.json;
    const height = Math.floor((1000 * imageInfo.height) / imageInfo.width);

    return `Whole image (1000 x ${height}px)`;
  }

  zoomedImageUrl() {
    const { infoResponse } = this.props;
    const imageInfo = infoResponse && infoResponse.json;
    const bounds = this.currentBounds();
    const boundsUrl = createCanonicalImageUrl(
      imageInfo,
      `${bounds.x},${bounds.y},${bounds.width},${bounds.height}`,
      bounds.width,
      bounds.height,
    );

    return imageInfo && boundsUrl && `${boundsUrl}?download=true`;
  }

  imageUrlForSize(size) {
    const { infoResponse } = this.props;
    const imageInfo = infoResponse && infoResponse.json;

    return imageInfo && `${createCanonicalImageUrl(imageInfo, 'full', size.width, size.height)}?download=true`;
  }

  fullImageUrl() {
    const { infoResponse } = this.props;
    const imageInfo = infoResponse && infoResponse.json;

    return imageInfo && `${createCanonicalImageUrl(imageInfo, 'full', imageInfo.width, imageInfo.height)}?download=true`;
  }

  thousandPixelWideImage() {
    const { infoResponse } = this.props;
    const imageInfo = infoResponse && infoResponse.json;
    const height = calculateHeightForWidth(imageInfo, 1000);

    return imageInfo && `${createCanonicalImageUrl(imageInfo, 'full', 1000, height)}?download=true`;
  }

  osdViewport() {
    const { windowId } = this.props;

    return OSDReferences.get(windowId).current.viewport;
  }

  currentBounds() {
    const bounds = this.osdViewport().getBounds();

    return Object.keys(bounds).reduce((object, key) => {
      object[key] = Math.ceil(bounds[key]); // eslint-disable-line no-param-reassign
      return object;
    }, {});
  }

  definedSizesRestrictsDownload() {
    const { infoResponse } = this.props;
    if (!infoResponse.json) return false;
    const { height, width } = infoResponse.json;

    if (this.definedSizes().length !== 1) return false;

    return this.definedSizes()[0].width <= width
           && this.definedSizes()[0].height <= height;
  }

  displayCurrentZoomLink() {
    const { restrictDownloadOnSizeDefinition, infoResponse, viewType } = this.props;

    if (viewType !== 'single') return false;
    if (restrictDownloadOnSizeDefinition && this.definedSizesRestrictsDownload()) return false;
    if (!(infoResponse && infoResponse.json)) return false;

    const bounds = this.currentBounds();
    return bounds.height < infoResponse.json.height
      && bounds.width < infoResponse.json.width
      && bounds.x >= 0
      && bounds.y >= 0;
  }

  /**
   * This only returns unique sizes
  */
  definedSizes() {
    const { infoResponse } = this.props;
    if (!(infoResponse && infoResponse.json && infoResponse.json.sizes)) return [];

    return uniqBy(infoResponse.json.sizes, size => `${size.width}${size.height}`);
  }

  fullImageLink() {
    const fullImageUrl = this.fullImageUrl();
    return fullImageUrl
      ? (
        <ListItem disableGutters divider key={fullImageUrl}>
          <Link href={fullImageUrl} rel="noopener noreferrer" target="_blank" variant="body1">
            {this.fullImageLabel()}
          </Link>
        </ListItem>
      )
      : '';
  }

  thousandPixelWideLink() {
    const { infoResponse } = this.props;
    const imageInfo = infoResponse && infoResponse.json;

    if (!imageInfo || imageInfo.width < 1000) return '';

    return (
      <ListItem disableGutters divider key={this.thousandPixelWideImage()}>
        <Link href={this.thousandPixelWideImage()} rel="noopener noreferrer" target="_blank" variant="body1">
          {this.smallImageLabel()}
        </Link>
      </ListItem>
    );
  }

  linksForDefinedSizes() {
    return (
      this.definedSizes().map(size => (
        <ListItem disableGutters divider key={`${size.width}${size.height}`}>
          <Link href={this.imageUrlForSize(size)} rel="noopener noreferrer" target="_blank" variant="body1">
            {`Whole image (${size.width} x ${size.height}px)`}
          </Link>
        </ListItem>
      ))
    );
  }

  nonTiledLabel(image) { // eslint-disable-line class-methods-use-this
    const width = image.getProperty('width');
    const height = image.getProperty('height');
    const label = image.getProperty('label');
    if (width && height) {
      return `Whole image (${width} x ${height}px)`;
    }
    return `Whole image (${label || image.id})`;
  }

  nonTiledImagesForCanvas() {
    const { canvas, nonTiledResources } = this.props;
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
  }

  nonTiledImageLinks() {
    return this.nonTiledImagesForCanvas().map(image => (
      <ListItem disableGutters divider key={image.id}>
        <Link
          href={`${image.id}?download=true`}
          rel="noopener noreferrer"
          target="_blank"
          variant="body1"
        >
          {this.nonTiledLabel(image)}
        </Link>
      </ListItem>
    ));
  }

  /**
   * Returns the rendered component
  */
  render() {
    const {
      canvas,
      canvasLabel,
      classes,
    } = this.props;

    return (
      <React.Fragment>
        <Typography noWrap variant="h3" className={classes.h3}>{canvasLabel}</Typography>
        <List>
          {this.displayCurrentZoomLink()
            && (
              <ListItem disableGutters divider>
                <Link href={this.zoomedImageUrl()} rel="noopener noreferrer" target="_blank" variant="body1">
                  {this.zoomedImageLabel()}
                </Link>
              </ListItem>
            )
          }
          {this.definedSizes().length === 0
            && ([this.fullImageLink(), this.thousandPixelWideLink()])}
          {this.definedSizes().length > 0
            && (this.linksForDefinedSizes())}
          {this.nonTiledImageLinks()}
          {canvas.getRenderings().map(rendering => (
            <RenderingDownloadLink rendering={rendering} key={rendering.id} />
          ))}
        </List>
      </React.Fragment>
    );
  }
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
  classes: PropTypes.shape({
    h3: PropTypes.string,
  }).isRequired,
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
