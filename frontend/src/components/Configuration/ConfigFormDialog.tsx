
import { useContext, useEffect } from 'react';
import FormDialog from '../BaseComps/FormDialog';
import { Button } from '../Styled';
import { ItemContext } from './contexts/ItemContext';
import { UIContext } from './contexts/UIContext';

export default function ConfigFormDialog() {
  const { itemName, storedItems, setItemName } = useContext(ItemContext);
  const { openDialog, setOpenDrawer, setSnackbarMessage, setOpenSnackbar, setOpenDialog } = useContext(UIContext);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    console.log(itemName)
    if (!openDialog && itemName !== '') {
        setOpenDrawer(true);
    }
  }, [openDialog]);

  const handleSetItemName = (name: string) => {
    let itemExists = false;
    storedItems.forEach((item) => {
        if (item.name.toLowerCase() === name.toLowerCase()) {
            setSnackbarMessage('This item already exists. . .');
            setOpenSnackbar(true);
            itemExists = true;
        }
    });

    if (!itemExists) {
        setItemName(name);
        handleCloseDialog();
    }
}
  
  return (
    <FormDialog
      openDialog={openDialog}
      handleCloseDialog={handleCloseDialog}
      setItemName={handleSetItemName}
      dialogTitle="Create a new item!"
      dialogContent="Enter a name for this item below. . ."
      dialogActions={
        <>
          <Button onClick={() => { handleSetItemName(''); handleCloseDialog() }}>Cancel</Button>
          <Button type="submit">Create</Button>
        </>
      }
    />
  );
}
