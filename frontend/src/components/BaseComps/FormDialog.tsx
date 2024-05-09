import * as React from 'react';
import DialogActions from '@mui/material/DialogActions';
import { DialogContent } from '@mui/material';

import { DialogContentText, DialogTitle, Dialog } from '../Styled';

export default function FormDialog({ openDialog, handleCloseDialog, setItemName, dialogTitle, dialogContent, dialogActions, dialogExtras, shiftAmount }: { openDialog: boolean, handleCloseDialog: () => void, setItemName: (itemName: string) => void, dialogTitle: string, dialogContent: string, dialogActions: React.ReactNode, dialogExtras?: React.ReactNode, shiftAmount?: number}) {

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      shiftamount={shiftAmount}
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
        {dialogExtras}
      </DialogContent>
      <DialogActions>
        {dialogActions}
      </DialogActions>
    </Dialog>
  );
}
