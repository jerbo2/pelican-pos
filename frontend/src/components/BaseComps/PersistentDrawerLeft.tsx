import * as React from 'react';

// imports from MUI
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Box } from '@mui/material';

import { DRAWER_WIDTH } from '../Constants';
import { DrawerAppBar, DrawerHeader, DrawerMain, CenterGrid } from '../Styled';
import BackIcon from './BackIcon';

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
    <CenterGrid container>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <DrawerAppBar position="fixed" open={open}>
          <Toolbar>
            {!open ? (
              <>
                <CenterGrid item xs={2}>
                  <BackIcon />
                </CenterGrid>
                <CenterGrid item xs={8}>
                  <Typography
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleOpenDrawer}
                    sx={{ cursor: 'pointer', fontSize: { xs: '1.25rem', sm: '2.25rem', md: '3rem' } }}
                    variant='h3'
                    fontWeight='bold'
                  >
                    {appBarHeaderDrawerClosed.toUpperCase()}
                  </Typography>
                </CenterGrid>
                <CenterGrid item xs={2} />
              </>
            )
              : (
                <CenterGrid item xs={12}>
                  <Typography variant="h3" fontWeight='bold' component="div" textAlign='center'>{appBarHeaderDrawerOpen}</Typography>
                </CenterGrid>
              )
            }
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
    </CenterGrid>
  );
}