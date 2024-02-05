import * as React from 'react';
import { useContext } from 'react';

// imports from MUI
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import { ButtonWidest, ListItemButton } from '../Styled';
import PersistentDrawerLeft from '../BaseComps/PersistentDrawerLeft';

import { UIContext } from "./contexts/UIContext";
import { ItemContext } from "./contexts/ItemContext";
import { FormConfigContext } from "./contexts/FormConfigContext";

export default function ConfigDrawer({ options, children }: { options: { name: string, icon: React.ReactNode }[], children: React.ReactNode }) {
  const { openDrawer, handleOpenDrawer, setOpenPopup, setOpenDrawer } = useContext(UIContext);
  const { itemName } = useContext(ItemContext);
  const { formConfig, setFormConfig, setSelected } = useContext(FormConfigContext);

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
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
        <List>
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
            <ButtonWidest variant='contained' onClick={() => { handleCloseDrawer(); setFormConfig([]) }}>Done</ButtonWidest>
          </ListItem>
        </List>
      }
      whiteSpaceChildren={children}
      open={openDrawer}
      handleOpenDrawer={() => handleOpenDrawer(true)} />
  );
}