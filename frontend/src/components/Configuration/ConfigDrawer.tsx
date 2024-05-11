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

export default function ConfigDrawer({ options, children }: { options: { name: string, icon: React.ReactNode }[], children: React.ReactNode }) {
  const { openDrawer, handleOpenDrawer, setOpenPopup, setOpenDrawer } = useContext(UIContext);
  const { itemName, storedItems, setStoredItems, setItemName } = useContext(ItemContext);
  const { formConfig, setFormConfig, setSelected } = useContext(FormConfigContext);
  const { lastMessage, sendMessage } = useContext(WebSocketContext);

  useEffect(() => {
    const messageData = JSON.parse(lastMessage || '{}');
    if (messageData.type === 'config-update' && formConfig.length !== 0) {
      console.log('updating form config')
      setFormConfig(messageData.payload);
    }
    else if (messageData.type === 'items-update') {
      console.log('updating stored items')
      setStoredItems(messageData.payload);
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
    const newStoredItems = await handleDelete(itemName);
    setStoredItems(newStoredItems || []);
    setOpenDrawer(false);
    setFormConfig([]);
    sendMessage(JSON.stringify({ type: 'items-update', payload: newStoredItems }))
  }

  const onClickDone = () => {
    setOpenDrawer(false);
    setFormConfig([]);
    setItemName('');
  }

  const handleOpenPopup = (formObjType: string) => {
    setOpenPopup(true);
    const newFormObject = { label: '', type: '', order: formConfig.length, options: [] };
    switch (formObjType) {
      case 'Dropdown':
        newFormObject.label = '';
        newFormObject.type = 'single_select';
        break;
      case 'Text Field':
        newFormObject.label = '';
        newFormObject.type = 'text';
        break;
      case 'Date & Time':
        newFormObject.label = '';
        newFormObject.type = 'datetime';
        break;
      default:
        newFormObject.label = '';
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
              <ConfirmationButton
                onConfirmed={onDeleteConfirmed}
                shiftAmount={0}
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