import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import { DRAWER_WIDTH } from '../Constants';
import Box from '@mui/material/Box';

interface TemporaryDrawerProps {
  drawerList: React.ReactNode;
  openDrawer: boolean;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function TemporaryDrawer({ drawerList, openDrawer, toggleDrawer }: TemporaryDrawerProps) {

  return (
    <div>
      <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
        <Box sx={{ width: DRAWER_WIDTH, height: '100%' }} onClick={toggleDrawer(false)}>
          {drawerList}
        </Box>
      </Drawer>
    </div>
  );
}
