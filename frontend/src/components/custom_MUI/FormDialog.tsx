import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { DialogContent } from '@mui/material';

import { DialogContentText, DialogTitle } from '../Styled';

import { TextField } from '../Styled';

export default function FormDialog({openDialog, handleCloseDialog, setItemName, dialogTitle, dialogContent, dialogActions}: {openDialog: boolean, handleCloseDialog: () => void, setItemName: (itemName: string) => void, dialogTitle: string, dialogContent: string, dialogActions: React.ReactNode}) {

  return (
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const itemName = formJson.itemName;
            setItemName(itemName);
            console.log(itemName);
          },
        }}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogContent}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="itemName"
            label="Item Name"
            type="itemName"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          {dialogActions}
        </DialogActions>
      </Dialog>
  );
}
