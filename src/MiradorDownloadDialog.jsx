import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import {
  getCanvasLabel,
  getVisibleCanvases,
  selectInfoResponse,
  getWindowViewType,
  getManifestoInstance,
  getContainerId,
  ScrollIndicatedDialogContent,
} from 'mirador';
import CanvasDownloadLinks from './CanvasDownloadLinks.jsx';
import ManifestDownloadLinks from './ManifestDownloadLinks.jsx';

const mapDispatchToProps = (dispatch, { windowId }) => ({
  closeDialog: () => dispatch({ type: 'CLOSE_WINDOW_DIALOG', windowId }),
});

const mapStateToProps = (state, { windowId }) => ({
  canvases: getVisibleCanvases(state, { windowId }),
  canvasLabel: canvasId => (getCanvasLabel(state, { canvasId, windowId })),
  containerId: getContainerId(state),
  infoResponse: canvasId => (selectInfoResponse(state, { windowId, canvasId }) || {}),
  manifest: getManifestoInstance(state, { windowId }),
  nonTiledResources: [],
  restrictDownloadOnSizeDefinition: state.config.miradorDownloadPlugin
                                    && state.config
                                      .miradorDownloadPlugin
                                      .restrictDownloadOnSizeDefinition,
  open: (state.windowDialogs[windowId] && state.windowDialogs[windowId].openDialog === 'download'),
  viewType: getWindowViewType(state, { windowId }),
});

/**
 * MiradorDownloadDialog ~
*/
export function MiradorDownloadDialog({
  canvases,
  canvasLabel,
  closeDialog,
  containerId,
  infoResponse,
  manifest,
  nonTiledResources,
  open,
  restrictDownloadOnSizeDefinition,
  viewType,
  windowId,
}) {
  const renderings = () => {
    const manifestRenderings = (
      manifest && manifest.getRenderings && manifest.getRenderings()
    ) || [];
    const sequenceRenderings = (manifest
      && manifest.getSequences
      && manifest.getSequences()
      && manifest.getSequences()[0]
      && manifest.getSequences()[0].getRenderings
      && manifest.getSequences()[0].getRenderings()) || [];
    return [...manifestRenderings, ...sequenceRenderings];
  };

  if (!open) return null;

  return (
    <Dialog
      container={document.querySelector(`#${containerId} .mirador-viewer`)}
      disableEnforceFocus
      onClose={closeDialog}
      open={open}
      scroll="paper"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle variant="h2" sx={{ paddingBottom: 0 }}>Download</DialogTitle>
      <ScrollIndicatedDialogContent>
        {canvases.map(canvas => (
          <CanvasDownloadLinks
            canvas={canvas}
            canvasLabel={canvasLabel(canvas.id)}
            infoResponse={infoResponse(canvas.id)}
            nonTiledResources={nonTiledResources}
            restrictDownloadOnSizeDefinition={restrictDownloadOnSizeDefinition}
            key={canvas.id}
            viewType={viewType}
            windowId={windowId}
          />
        ))}
        {renderings().length > 0
          && <ManifestDownloadLinks renderings={renderings()} />
        }
      </ScrollIndicatedDialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

MiradorDownloadDialog.propTypes = {
  canvasLabel: PropTypes.func.isRequired,
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  closeDialog: PropTypes.func.isRequired,
  containerId: PropTypes.string.isRequired,
  infoResponse: PropTypes.func.isRequired,
  manifest: PropTypes.shape({
    getSequences: PropTypes.func,
    getRenderings: PropTypes.func,
  }),
  nonTiledResources: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, format: PropTypes.string }),
  ).isRequired,
  open: PropTypes.bool,
  restrictDownloadOnSizeDefinition: PropTypes.bool,
  viewType: PropTypes.string.isRequired,
  windowId: PropTypes.string.isRequired,
};
MiradorDownloadDialog.defaultProps = {
  canvases: [],
  manifest: {},
  open: false,
  restrictDownloadOnSizeDefinition: false,
};

export default {
  target: 'Window',
  mode: 'add',
  name: 'MiradorDownloadDialog',
  component: MiradorDownloadDialog,
  mapDispatchToProps,
  mapStateToProps,
};
