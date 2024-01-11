import * as React from 'react';
import { useContext } from 'react';

// imports from MUI
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import { ConfigurationContext } from '../Configuration';
import { Popup } from '../Styled';

export default function TransitionsModal({children}: {children: React.ReactNode}) {
  const { openPopup, handleClosePopup } = useContext(ConfigurationContext);

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openPopup}
        onClose={handleClosePopup}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openPopup}>
          <Popup>
            {children}
          </Popup>
        </Fade>
      </Modal>
    </div>
  );
}
