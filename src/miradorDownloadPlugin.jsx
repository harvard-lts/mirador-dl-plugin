import PropTypes from 'prop-types';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/VerticalAlignBottomSharp';

const downloadDialogReducer = (state = {}, action) => {
  if (action.type === 'OPEN_WINDOW_DIALOG') {
    return {
      ...state,
      [action.windowId]: {
        openDialog: action.dialogType,
      },
    };
  }

  if (action.type === 'CLOSE_WINDOW_DIALOG') {
    return {
      ...state,
      [action.windowId]: {
        openDialog: null,
      },
    };
  }
  return state;
};

const mapDispatchToProps = (dispatch, { windowId }) => ({
  openDownloadDialog: () => dispatch({ type: 'OPEN_WINDOW_DIALOG', windowId, dialogType: 'download' }),
});

function MiradorDownload({ handleClose, openDownloadDialog }) {
  const openDialogAndCloseMenu = () => {
    openDownloadDialog();
    handleClose();
  };

  return (
    <MenuItem onClick={openDialogAndCloseMenu}>
      <ListItemIcon>
        <DownloadIcon />
      </ListItemIcon>
      <ListItemText slotProps={{ primary: { variant: 'body1' } }}>
        Download
      </ListItemText>
    </MenuItem>
  );
}

MiradorDownload.propTypes = {
  handleClose: PropTypes.func,
  openDownloadDialog: PropTypes.func,
};

MiradorDownload.defaultProps = {
  handleClose: () => {},
  openDownloadDialog: () => {},
};

export default {
  target: 'WindowTopBarPluginMenu',
  mode: 'add',
  name: 'MiradorDownloadPlugin',
  component: MiradorDownload,
  mapDispatchToProps,
  reducers: {
    windowDialogs: downloadDialogReducer,
  },
};
