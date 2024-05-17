import * as React from 'react';

// imports from MUI
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { Popup } from '../Styled';
import type { DialogProps } from '@mui/material';

interface TransitionsModalProps {
  children: React.ReactNode;
  openPopup: boolean;
  handleClosePopup: () => void;
  popup_sx?: any;
}

export default function TransitionsModal({ children, openPopup, handleClosePopup, popup_sx }: TransitionsModalProps) {
  const baseHandleClosePopup: DialogProps['onClose'] = (event, reason) => {
    if (reason && reason === 'backdropClick') return;
    handleClosePopup();
  };

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openPopup}
        onClose={baseHandleClosePopup}
        sx={{ outline: 0 }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openPopup}>
          <Popup sx={popup_sx}>
            {children}
          </Popup>
        </Fade>
      </Modal>
    </div>
  );
}
