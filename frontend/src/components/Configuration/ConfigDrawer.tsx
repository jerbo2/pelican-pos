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
import { ItemContext } from "./contexts/ItemContext";
import { FormConfigContext } from "./contexts/FormConfigContext";
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';

import ConfirmationButton from '../BaseComps/ConfirmationButton';

import { FormComponentConfig } from '../BaseComps/dbTypes';

interface ConfigDrawerProps {
  options: { name: string, icon: React.ReactNode }[],
  children: React.ReactNode
}

export default function ConfigDrawer({ options, children }: ConfigDrawerProps) {
  const { openDrawer, setOpenDialog, handleOpenDrawer, setOpenPopup, setOpenDrawer, setDialogType } = useContext(UIContext);
  const { itemName, storedItems, setStoredItems, setItemName, setTaxRate } = useContext(ItemContext);
  const { formConfig, setFormConfig, setSelected } = useContext(FormConfigContext);
  const { lastMessage, sendMessage } = useContext(WebSocketContext);

  useEffect(() => {
    const messageData = JSON.parse(lastMessage || '{}');
    switch (messageData.type) {
      case 'config-update':
        if (formConfig.length !== 0) {
          const selected = messageData.payload.config;
          setFormConfig((prevState: FormComponentConfig[]) => {
            const newConfig = [...prevState];
            newConfig[selected.order] = selected;
            console.log('newConfig:', newConfig)
            return newConfig;
          });
        }
        break;
      case 'items-update':
        setStoredItems(messageData.payload);
        break;
      case 'item-tax-rate-update':
        setTaxRate(messageData.payload);
        break;
      case 'item-name-update':
        setItemName(messageData.payload);
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

    const url = `/api/v1/items/delete/${item.id}/`;

    try {
      await axios.delete(url);
      const newStoredItems = storedItems.filter(item => item.name !== itemName);
      return newStoredItems;
    } catch (err) {
      console.error("Failed to delete the item:", err);
    }
  }

  const onDeleteConfirmed = async () => {
    console.log('deleting:', itemName)
    const newStoredItems = await handleDelete(itemName);
    setStoredItems(newStoredItems || []);
    setOpenDrawer(false);
    setFormConfig([]);
    setItemName('');
    sendMessage(JSON.stringify({ type: 'items-update', payload: newStoredItems }))
  }

  const onClickDone = () => {
    setOpenDrawer(false);
    setFormConfig([]);
    setItemName('');
    setTaxRate(0);
  }

  const handleOpenPopup = (formObjType: string) => {
    setOpenPopup(true);
    const newFormObject = { label: '', type: '', order: formConfig.length, options: [], pricing_config: { affectsPrice: false, isBasePrice: false, priceBy: '', dependsOn: { name: '', values: {} } } };
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
              <ButtonWidest variant='contained' onClick={() => {setDialogType('name');setOpenDialog(true)}}>Name</ButtonWidest>
            </ListItem>
            <ListItem>
              <ButtonWidest variant='contained' onClick={() => {setDialogType('tax-rate');setOpenDialog(true)}}>Tax rate</ButtonWidest>
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