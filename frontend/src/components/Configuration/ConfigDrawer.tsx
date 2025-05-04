import * as React from 'react';
import { useContext, useEffect } from 'react';
import axios from 'axios';

// imports from MUI
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import { ButtonWidest, ListItemButton } from '../Styled';
import PersistentDrawerLeft from '../BaseComps/PersistentDrawerLeft';

import { UIContext } from "../BaseComps/contexts/UIContext";
import { defaultInventoryConfig, ItemContext } from "./contexts/ItemContext";
import { FormConfigContext } from "./contexts/FormConfigContext";
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';

import ConfirmationButton from '../BaseComps/ConfirmationButton';

import { FormComponentConfig, PricingConfig } from '../BaseComps/dbTypes';

interface ConfigDrawerProps {
  options: { name: string, icon: React.ReactNode }[],
  children: React.ReactNode
}

const emptyPricingConfig: PricingConfig = {
  affectsPrice: false,   
  isBasePrice: undefined,
  dependsOn: { name: '', values: {} },  
  priceFactor: "",       
  priceBy: "",           
  constantValue: "",     
  perOptionMapping: {}   
};


export default function ConfigDrawer({ options, children }: ConfigDrawerProps) {
  const { openDrawer, setOpenDialog, handleOpenDrawer, setOpenPopup, setOpenDrawer, setDialogType, setOpenSnackbar, setSnackbarMessage } = useContext(UIContext);
  const { itemName, storedItems, setStoredItems, setItemName, setTaxRate, setInventory } = useContext(ItemContext);
  const { formConfig, setFormConfig, setSelected } = useContext(FormConfigContext);
  const { lastMessage, sendMessage } = useContext(WebSocketContext);

  useEffect(() => {
    const messageData = JSON.parse(lastMessage || '{}');
    console.log('WebSocket message received:', messageData);
    if (messageData.itemName && messageData.itemName !== itemName) return;
    console.log('Processing message:', messageData);
    switch (messageData.type) {
      case 'config-update':
        if (formConfig.length !== 0) {
          const selected = messageData.payload;
          setFormConfig((prevState: FormComponentConfig[]) => {
            const newConfig = [...prevState];
            newConfig[selected.order] = selected;
            console.log('newConfig:', newConfig)
            return newConfig;
          });
        }
        break;
      case 'item-tax-rate-update':
        setTaxRate(messageData.payload);
        break;
      case 'item-name-update':
        setItemName(messageData.payload);
        break;
      case 'item-inventory-config-update':
        setInventory(messageData.payload);
        break;
      default:
        break;
    }
  }, [lastMessage]);

  async function handleDelete(itemName: string) {
    const item = storedItems.find(item => item.name === itemName);
    if (!item) {
      console.error("Item not found for deletion");
      return;
    }

    const url = `/admin/items/delete/${item.id}/`;

    try {
      await axios.delete(url);
      const newStoredItems = storedItems.filter(item => item.name !== itemName);
      return newStoredItems;
    } catch (err) {
      console.error("Failed to delete the item:", err);
      return null;
    }
  }

  const onDeleteConfirmed = async () => {
    console.log('deleting:', itemName)
    const newStoredItems = await handleDelete(itemName);
    if (!newStoredItems) {
      setOpenSnackbar(true);
      setSnackbarMessage('Failed to delete item');
      return;
    }
    setStoredItems(newStoredItems || []);
    setOpenDrawer(false);
    setFormConfig([]);
    setItemName('');
    setTaxRate(0);
    setInventory(defaultInventoryConfig);
    sendMessage(JSON.stringify({ type: 'items-update', payload: newStoredItems }))
  }

  const onClickDone = () => {
    setOpenDrawer(false);
    setFormConfig([]);
    setItemName('');
    setTaxRate(0);
    setInventory(defaultInventoryConfig);
  }

  const handleOpenPopup = (formObjType: string) => {
    setOpenPopup(true);
    const newFormObject = { label: '', type: '', order: formConfig.length, options: [], pricing_config: emptyPricingConfig };
    newFormObject.label = '';
    console.log('formObjType:', formObjType)
    switch (formObjType) {
      case 'Dropdown':
        newFormObject.type = 'single_select';
        break;
      case 'Text Field':
        newFormObject.type = 'text';
        break;
      case 'Number Field':
        newFormObject.type = 'number';
        break;
      case 'Price':
        newFormObject.type = 'price';
        newFormObject.pricing_config.affectsPrice = true;
        newFormObject.pricing_config.isBasePrice = true;
        newFormObject.pricing_config.priceBy = 'Constant';
        break;
      default:
        newFormObject.type = 'error';
        break;
    }

    setFormConfig([...formConfig, newFormObject]);
    setSelected(newFormObject);
  }

  return (
    <PersistentDrawerLeft
      appBarHeaderDrawerClosed="Create New"
      appBarHeaderDrawerOpen={`Editing item: ${itemName}`}
      drawerHeader="Components"
      drawerListChildren={
        <>
          <List sx={{ overflow: 'auto', flexGrow: 1 }}>
            {options.map(({ name, icon }) => (
              <ListItem key={name} disablePadding>
                <ListItemButton onClick={() => handleOpenPopup(name)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={name} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider />
            <ListItem>
              <ButtonWidest variant='contained' onClick={onClickDone}>Done</ButtonWidest>
            </ListItem>
          </List>
          <List>
            <ListItem>
              <ButtonWidest variant='contained' onClick={() => { setDialogType('inventory'); setOpenDialog(true) }}>Inventory</ButtonWidest>
            </ListItem>
            <ListItem>
              <ButtonWidest variant='contained' onClick={() => { setDialogType('name'); setOpenDialog(true) }}>Name</ButtonWidest>
            </ListItem>
            <ListItem>
              <ButtonWidest variant='contained' onClick={() => { setDialogType('tax-rate'); setOpenDialog(true) }}>Tax rate</ButtonWidest>
            </ListItem>
            <ListItem>
              <ConfirmationButton
                onConfirmed={onDeleteConfirmed}
              >Delete</ConfirmationButton>
            </ListItem>
          </List>
        </>
      }
      whiteSpaceChildren={children}
      open={openDrawer}
      handleOpenDrawer={() => handleOpenDrawer(true)} />
  );
}