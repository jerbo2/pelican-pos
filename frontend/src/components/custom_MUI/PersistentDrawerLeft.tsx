import * as React from 'react';
import { useContext } from 'react';

// imports from MUI
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Box, ListItemIcon } from '@mui/material';

import { ConfigurationContext } from '../Configuration';
import { DRAWER_WIDTH } from '../Constants';
import { DrawerAppBar, DrawerHeader, DrawerMain } from '../Styled';

export default function PersistentDrawerLeft({ options, children }: { options: { name: string, icon: React.ReactNode }[], children: React.ReactNode }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { handleOpenPopup } = useContext(ConfigurationContext);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <DrawerAppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Components
          </Typography>
        </Toolbar>
      </DrawerAppBar>
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {options.map(({ name, icon }) => (
            <ListItem key={name} disablePadding>
              <ListItemButton onClick={() => handleOpenPopup(name)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <DrawerMain open={open}>
        <DrawerHeader />
        {children}
      </DrawerMain>
    </Box>
  );
}