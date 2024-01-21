import * as React from 'react';
import { useContext } from 'react';

// imports from MUI
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';

import { ConfigurationContext } from './Configuration';
import { ButtonWidest, ListItemButton } from '../Styled';

import PersistentDrawerLeft from '../custom_MUI/PersistentDrawerLeft';

export default function ConfigDrawer({ options, children }: { options: { name: string, icon: React.ReactNode }[], children: React.ReactNode }) {
  const { handleOpenPopup, openDrawer, handleCloseDrawer, handleOpenDrawer, itemName, setFormConfig } = useContext(ConfigurationContext);

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
            <ButtonWidest variant='contained' onClick={()=>{handleCloseDrawer();setFormConfig([])}}>Cancel</ButtonWidest>
          </ListItem>
        </List>
      }
      whiteSpaceChildren={children}
      open={openDrawer}
      handleOpenDrawer={()=>handleOpenDrawer(true)}/>
  );
}