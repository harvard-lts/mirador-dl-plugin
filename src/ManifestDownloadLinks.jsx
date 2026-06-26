import PropTypes from 'prop-types';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import RenderingDownloadLink from './RenderingDownloadLink.jsx';

/**
 * ManifestDownloadLinks ~
*/
function ManifestDownloadLinks({ renderings }) {
  return (
    <>
      <Typography variant="h3" sx={{ marginTop: '20px' }}>Other download options</Typography>
      <List>
        {renderings.map(rendering => (
          <RenderingDownloadLink rendering={rendering} key={rendering.id} />
        ))}
      </List>
    </>
  );
}

ManifestDownloadLinks.propTypes = {
  renderings: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default ManifestDownloadLinks;
