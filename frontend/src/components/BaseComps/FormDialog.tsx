import * as React from 'react';
import DialogActions from '@mui/material/DialogActions';
import { DialogContent } from '@mui/material';

import { DialogContentText, DialogTitle, Dialog } from '../Styled';

interface FormDialogProps {
  openDialog: boolean;
  handleCloseDialog: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;  
  dialogTitle: string;
  dialogContent: string | React.ReactNode;
  dialogActions: React.ReactNode;
  dialogExtras?: React.ReactNode;
  shiftAmount?: number;
}

export default function FormDialog({ openDialog, handleCloseDialog, handleSubmit, dialogTitle, dialogContent, dialogActions, dialogExtras, shiftAmount }: FormDialogProps) {

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      shiftamount={shiftAmount ?? 0}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          handleSubmit(event);
        },
      }}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {dialogContent}
        </DialogContentText>
        {dialogExtras}
      </DialogContent>
      <DialogActions>
        {dialogActions}
      </DialogActions>
    </Dialog>
  );
}
