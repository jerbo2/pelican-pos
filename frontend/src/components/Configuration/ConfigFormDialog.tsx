import { useContext, useEffect, useRef } from 'react';
import FormDialog from '../BaseComps/FormDialog';
import { Button, CenterGrid, TextField } from '../Styled';
import { ItemContext } from './contexts/ItemContext';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';
import { InputAdornment, Typography } from '@mui/material';
import axios from 'axios';

export default function ConfigFormDialog() {
  const { itemName, taxRate, storedItems, setItemName, setTaxRate, setStoredItems } = useContext(ItemContext);
  const { openDialog, dialogType, setOpenDrawer, setSnackbarMessage, setOpenSnackbar, setOpenDialog, setDialogType } = useContext(UIContext);
  const { sendMessage } = useContext(WebSocketContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    setTaxRate(6.625);
  }, []);

  useEffect(() => {
    if (!openDialog && itemName !== '') {
      setOpenDrawer(true);
    }
  }, [openDialog]);

  const handleSetItemName = (name: string) => {
    setItemName(name);
    handleCloseDialog();
  };

  const handleCancel = () => {
    if (!itemName) {
      setItemName('');
    }
    handleCloseDialog();
  };

  const handleSetTaxRate = async (rate: number) => {
    const item = storedItems.find(item => item.name === itemName);
    if (!item) return;
    const url = `/api/v1/items/update/${item.id}/field`;
    try {
      await axios.patch(url, { field: 'tax_rate', value: rate });
      setTaxRate(rate);
      sendMessage(JSON.stringify({ type: 'item-tax-rate-update', payload: rate }));
      sendMessage(JSON.stringify({ type: 'items-update', payload: storedItems.map(item => item.name === itemName ? { ...item, tax_rate: rate } : item) }));
      setStoredItems(storedItems.map(item => item.name === itemName ? { ...item, tax_rate: rate } : item));
    } catch (err) {
      console.error(err);
    }
    handleCloseDialog();
  };

  const handleUpdateItemName = async (name: string) => {
    const item = storedItems.find(item => item.name === itemName);
    if (!item) return;
    const url = `/api/v1/items/update/${item.id}/field`;
    try {
      await axios.patch(url, { field: 'name', value: name });
      setItemName(name);
      sendMessage(JSON.stringify({ type: 'item-name-update', payload: name }));
      sendMessage(JSON.stringify({ type: 'items-update', payload: storedItems.map(item => item.name === itemName ? { ...item, name } : item) }));
      setStoredItems(storedItems.map(item => item.name === itemName ? { ...item, name } : item));
    } catch (err) {
      console.error(err);
    }
    handleCloseDialog();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    const name = formJson.itemName as string;
    const rate = parseFloat(formJson.taxRate as string);

    const closeDialog = () => {
      handleCloseDialog();
      setTimeout(() => {
        setDialogType('');
      }, 200); // for fade out animation
    };

    switch (dialogType) {
      case 'name':
        if (name === itemName) {
          closeDialog();
          return;
        }
        if (storedItems.some(item => item.name.toLowerCase() === name.toLowerCase())) {
          setSnackbarMessage('This item already exists...');
          setOpenSnackbar(true);
          return;
        }
        if (!itemName) {
          handleSetItemName(name);
        } else {
          handleUpdateItemName(name);
        }
        break;

      case 'tax-rate':
        if (rate === taxRate) {
          closeDialog();
          return;
        }
        handleSetTaxRate(rate);
        break;

      default:
        console.error('Invalid dialog type');
        closeDialog();
        break;
    }
  };


  return (
    <FormDialog
      openDialog={openDialog}
      handleCloseDialog={handleCloseDialog}
      handleSubmit={handleSubmit}
      dialogTitle={dialogType === 'name' ? !itemName ? "Create a new item!" : "Edit item name" : "Edit tax rate"}
      dialogContent=""
      dialogActions={
        <>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="submit">{!itemName ? "Create" : "Save"}</Button>
        </>
      }
      dialogExtras={
        <CenterGrid container>
          {dialogType === 'name' && (
            <CenterGrid item xs={12}>
              <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                name="itemName"
                label="Item name"
                type="text"
                fullWidth
                variant="filled"
                defaultValue={itemName}
              />
            </CenterGrid>
          )}
          {(dialogType === 'tax-rate' || !itemName) && (
            <CenterGrid item xs={12}>
              <TextField
                autoFocus={!itemName}
                inputRef={inputRef}
                onFocus={() => inputRef.current?.select()}
                required
                margin="dense"
                id="tax-rate"
                name="taxRate"
                label="Tax rate"
                type="number"
                fullWidth
                variant="filled"
                defaultValue={6.625}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Typography variant='h5'>%</Typography></InputAdornment>,
                  inputProps: { step: 'any' }
                }}
              />
            </CenterGrid>
          )}
        </CenterGrid>
      }
    />
  );
}
