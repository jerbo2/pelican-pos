import React, { useContext } from 'react';
import { useNavigate } from 'react-router';
import { Fab, Stack } from '@mui/material';
import { Button, CenterGrid } from './Styled';
import axios from 'axios';
import { LogoutOutlined } from '@mui/icons-material';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import { UserContext } from './BaseComps/contexts/UserContext';
import Logo from './BaseComps/Logo';

export const handleOpenCashDrawer = async () => {
  try {
    await axios.post('/open-drawer/');
  } catch (error) {
    console.error('Error opening cash drawer:', error);
  }
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  return (
    <CenterGrid container sx={{ height: '100vh', width: '100vw', p: 2 }}>
      <CenterGrid item xs={12}>
        <Logo />
      </CenterGrid>

      <Stack
        direction="column"
        spacing={1}
        sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
      >
        {user?.username && (
          <Fab variant="extended" color="primary" onClick={logout} sx={{ m: 1, minWidth: user?.is_admin ? '11.5rem' : '13rem' }}>
            <CenterGrid item xs={2}>
              <LogoutOutlined sx={{ mr: 1 }} />
            </CenterGrid>
            <CenterGrid item xs={10}>
              Logout ({user.username})
            </CenterGrid>
          </Fab>
        )}
        {user?.is_admin && (
          <Fab variant="extended" color="secondary" onClick={() => navigate('/reports')}>
            <CenterGrid item xs={2}>
              <NotesOutlinedIcon sx={{ mr: 1 }} />
            </CenterGrid>
            <CenterGrid item xs={10}>
              Reports
            </CenterGrid>
          </Fab>
        )}
      </Stack>

      <CenterGrid item xs={12}>
        <Button variant="contained" fullWidth onClick={() => navigate('/active-orders')}>
          Active Orders
        </Button>
      </CenterGrid>
      <CenterGrid item xs={12}>
        <Button variant="contained" fullWidth onClick={() => navigate('/order')}>
          New Order
        </Button>
      </CenterGrid>
      <CenterGrid item xs={12}>
        <Button variant="contained" fullWidth onClick={() => navigate('/past-orders')}>
          Past Orders
        </Button>
      </CenterGrid>

      <CenterGrid item xs={12} sm={6}>
        <Button
          variant="contained"
          fullWidth
          sx={{ fontSize: '1.5rem' }}
          onClick={handleOpenCashDrawer}
        >
          Open Drawer
        </Button>
      </CenterGrid>
      <CenterGrid item xs={12} sm={6}>
        <Button
          variant="contained"
          fullWidth
          sx={{ fontSize: '1.5rem' }}
          onClick={() => navigate('/config')}
          disabled={!user?.is_admin}
        >
          Config
        </Button>
      </CenterGrid>
    </CenterGrid>
  );
};

export default Landing;
