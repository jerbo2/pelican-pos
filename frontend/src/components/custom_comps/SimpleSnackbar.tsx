import * as React from 'react';
import { Snackbar, IconButtonSmaller } from '../Styled';
import CloseIcon from '@mui/icons-material/Close';

export default function SimpleSnackbar({ openSnackbar, message, setOpenSnackbar }: { openSnackbar: boolean, message: string, setOpenSnackbar: (openSnackbar: boolean) => void }) {

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  const action = (
    <React.Fragment>
      <IconButtonSmaller
        size="large"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="inherit" />
      </IconButtonSmaller>
    </React.Fragment>
  );

  return (
    <div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
        message={message}
        action={action}
        sx={{color: 'primary'}}
      />
    </div>
  );
}
