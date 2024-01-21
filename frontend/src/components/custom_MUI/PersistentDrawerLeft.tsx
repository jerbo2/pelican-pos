import * as React from 'react';

// imports from MUI
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Box } from '@mui/material';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';

import { DRAWER_WIDTH } from '../Constants';
import { DrawerAppBar, DrawerHeader, DrawerMain, Button, CenterGrid, ButtonWider } from '../Styled';

import { useNavigate } from 'react-router';

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

  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex' }}>
      <DrawerAppBar position="fixed" open={open}>
        <Toolbar>
          <CenterGrid container sx={{ flexGrow: 1 }}>
            <CenterGrid item xs={4}>
              <Button
                color="inherit"
                aria-label="back"
                onClick={() => navigate(-1)}
                sx={{
                  ...(open && { display: 'none' }),
                }}
              >
                <ArrowBackIosNewOutlinedIcon fontSize='large' />
              </Button>
            </CenterGrid>
            <CenterGrid item xs={4}>
              <Typography
                color="inherit"
                aria-label="open drawer"
                onClick={handleOpenDrawer}
                sx={{ ...(open && { display: 'none' }), cursor: 'pointer'}}
                variant='h3'
                fontWeight='bold'
              >
                {appBarHeaderDrawerClosed.toUpperCase()}
              </Typography>
            </CenterGrid>
            <CenterGrid item xs={4} />
          <CenterGrid item xs={12}>
            <Typography variant="h3" fontWeight='bold' component="div" sx={{ ...(!open && { display: 'none' }) }}>{appBarHeaderDrawerOpen}</Typography>
          </CenterGrid>
          </CenterGrid>
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