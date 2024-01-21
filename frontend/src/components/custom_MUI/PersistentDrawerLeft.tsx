import * as React from 'react';

// imports from MUI
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Box } from '@mui/material';

import { DRAWER_WIDTH } from '../Constants';
import { DrawerAppBar, DrawerHeader, DrawerMain, Button } from '../Styled';

export default function PersistentDrawerLeft({
  appBarHeaderDrawerClosed,
  appBarHeaderDrawerOpen,
  drawerHeader,
  drawerListChildren,
  whiteSpaceChildren,
  open,
  handleOpenDrawer,
}:
  {
    appBarHeaderDrawerClosed: string,
    appBarHeaderDrawerOpen: string,
    drawerHeader: string,
    drawerListChildren: React.ReactNode,
    whiteSpaceChildren: React.ReactNode,
    open: boolean,
    handleOpenDrawer: () => void,
  }) {

  return (
    <Box sx={{ display: 'flex' }}>
      <DrawerAppBar position="fixed" open={open}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            color="inherit"
            aria-label="open drawer"
            onClick={handleOpenDrawer}
            sx={{ ...(open && { display: 'none' }) }}
          >
            {appBarHeaderDrawerClosed}
          </Button>
          <Typography variant="h4" component="div" sx={{ ...(!open && { display: 'none' }) }}>{appBarHeaderDrawerOpen}</Typography>
          <Box sx={{ flexGrow: 1 }} />
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
          <Typography variant="h4" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            {drawerHeader}
          </Typography>
        </DrawerHeader>
        <Divider />
        {drawerListChildren}
      </Drawer>
      <DrawerMain open={open}>
        <DrawerHeader />
        {whiteSpaceChildren}
      </DrawerMain>
    </Box>
  );
}