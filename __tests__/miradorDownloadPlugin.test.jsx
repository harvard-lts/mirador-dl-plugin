import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import miradorDownloadPlugin from '../src/miradorDownloadPlugin.jsx';

function createWrapper(props) {
  const Component = miradorDownloadPlugin.component;
  return render(
    <Component
      handleClose={() => {}}
      openDownloadDialog={() => {}}
      {...props}
    />,
  );
}

describe('miradorDownloadPlugin', () => {
  it('has the correct target', () => {
    expect(miradorDownloadPlugin.target).toBe('WindowTopBarPluginMenu');
  });
  describe('renders a component', () => {
    it('renders a thing', () => {
      createWrapper();
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
  });

  describe('MenuItem', () => {
    it('calls the openShareDialog and handleClose props when clicked', async () => {
      const handleClose = vi.fn();
      const openDownloadDialog = vi.fn();
      const user = userEvent.setup();
      createWrapper({ handleClose, openDownloadDialog });

      await user.click(screen.getByRole('menuitem'));

      expect(handleClose).toHaveBeenCalled();
      expect(openDownloadDialog).toHaveBeenCalled();
    });
  });
});
