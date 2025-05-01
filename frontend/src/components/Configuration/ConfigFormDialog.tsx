import { useContext, useEffect, useRef, useMemo } from 'react';
import FormDialog from '../BaseComps/FormDialog';
import { Button, CenterGrid, TextField } from '../Styled';
import { ItemContext } from './contexts/ItemContext';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';
import { InputAdornment, Typography } from '@mui/material';
import axios from 'axios';
import ConfigInventoryManagement from './ConfigInventoryManagement';
import { InventoryRef } from './ConfigInventoryManagement';
import { InventoryConfig } from '../BaseComps/dbTypes';

export default function ConfigFormDialog() {
  const { itemName, taxRate, storedItems, setItemName, setTaxRate, setStoredItems, setInventory } = useContext(ItemContext);
  const { openDialog, dialogType, setOpenDrawer, setSnackbarMessage, setOpenSnackbar, setOpenDialog, setDialogType } = useContext(UIContext);
  const { sendMessage } = useContext(WebSocketContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const inventoryRef = useRef<InventoryRef>(null);

  const item = useMemo(() => {
    return storedItems.find(item => item.name === itemName);
  }, [storedItems, itemName]);

  const url = `/api/v1/items/update/${item?.id}`;

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
    if (!item) return;
    try {
      await axios.patch(url, { tax_rate: rate });
      setTaxRate(rate);
      sendMessage(JSON.stringify({ type: 'item-tax-rate-update', payload: rate, itemName: itemName }));
      sendMessage(JSON.stringify({ type: 'items-update', payload: storedItems.map(item => item.name === itemName ? { ...item, tax_rate: rate } : item) }));
      setStoredItems(storedItems.map(item => item.name === itemName ? { ...item, tax_rate: rate } : item));
    } catch (err) {
      console.error(err);
    }
    handleCloseDialog();
  };

  const handleUpdateItemName = async (name: string) => {
    if (!item) return;
    try {
      await axios.patch(url, { name: name });
      setItemName(name);
      sendMessage(JSON.stringify({ type: 'item-name-update', payload: name, itemName: itemName }));
      sendMessage(JSON.stringify({ type: 'items-update', payload: storedItems.map(item => item.name === itemName ? { ...item, name } : item) }));
      setStoredItems(storedItems.map(item => item.name === itemName ? { ...item, name } : item));
    } catch (err) {
      console.error(err);
    }
    handleCloseDialog();
  };

  const handleUpdateInventoryConfig = async (inventoryConfig: InventoryConfig) => {
    if (!item) return;
    console.log({ inventory_config: inventoryConfig })
    try {
      await axios.patch(url, { inventory_config: inventoryConfig });
      setInventory(inventoryConfig);
      sendMessage(JSON.stringify({ type: 'item-inventory-config-update', payload: inventoryConfig, itemName: itemName }));
      sendMessage(JSON.stringify({ type: 'items-update', payload: storedItems.map(item => item.name === itemName ? { ...item, inventory_config: inventoryConfig } : item) }));
      setStoredItems(storedItems.map(item => item.name === itemName ? { ...item, inventory_config: inventoryConfig } : item));
    } catch (err) {
      console.error(err);
    }
    handleCloseDialog();
  }


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    console.log(formJson)

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

      case 'inventory': {
        const inventoryData = inventoryRef.current?.getInventoryConfig();
        if (!inventoryData) {
          closeDialog();
          return;
        }
        handleUpdateInventoryConfig(inventoryData);
        break;
      }

      default:
        console.error('Invalid dialog type');
        closeDialog();
        break;
    }
  };

  const renderDialogExtras = () => {
    switch (dialogType) {
      case 'name':
        return (
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
        );
      case 'tax-rate':
        return (
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
            defaultValue={taxRate}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Typography variant='h5'>%</Typography></InputAdornment>,
              inputProps: { step: 'any' }
            }}
          />
        )
      case 'inventory':
        return <ConfigInventoryManagement ref={inventoryRef} />;
      default:
        return null;
    }
  };

  const renderDialogTitle = () => {
    switch (dialogType) {
      case 'name':
        return !itemName ? "Create a new item!" : "Edit item name";
      case 'tax-rate':
        return "Edit tax rate";
      case 'inventory':
        return "Edit inventory setup";
      default:
        return '';
    }
  }


  return (
    <FormDialog
      openDialog={openDialog}
      handleCloseDialog={handleCloseDialog}
      handleSubmit={handleSubmit}
      dialogTitle={renderDialogTitle()}
      dialogContent=""
      dialogActions={
        <>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="submit">{!itemName ? "Create" : "Save"}</Button>
        </>
      }
      dialogExtras={
        <CenterGrid container>
          <CenterGrid item xs={12}>
            {renderDialogExtras()}
          </CenterGrid>
        </CenterGrid>
      }
    />
  );
}
