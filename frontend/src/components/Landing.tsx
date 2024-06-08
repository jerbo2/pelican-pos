import { useNavigate } from 'react-router';
import { Box, Fab, Stack } from '@mui/material';
import { Button, CenterGrid } from './Styled';
import axios from 'axios';
import { LogoutOutlined } from '@mui/icons-material';
import { UserContext } from './BaseComps/contexts/UserContext';
import { useContext } from 'react';
import Logo from './BaseComps/Logo';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';

const handleOpenCashDrawer = async () => {
  try {
    await axios.post('/api/v1/open-drawer/');
  } catch (error) {
    console.error(error);
  }
}


function Landing() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  return (
      <CenterGrid container sx={{height: '100vh'}}>

        <CenterGrid item xs={12}>
          <Logo />
        </CenterGrid>

        <Stack sx={{ position: 'fixed', top: 10, right: 10, zIndex: 1000, display: 'flex', alignItems: 'center' }}>
          {user?.username && (
            <Fab onClick={logout} color='primary' sx={{ m: 1, minWidth: user?.is_admin ? '11.5rem' : '13rem' }} variant='extended'>
              <CenterGrid item xs={2}>
                <LogoutOutlined sx={{ mr: 1 }} />
              </CenterGrid>
              <CenterGrid item xs={10}>
                {`Logout (${user.username})`}
              </CenterGrid>
            </Fab>
          )}
          {user?.is_admin && (
            <Fab onClick={() => navigate('/reports')} color='primary' sx={{ m: 1, minWidth: '11.5rem' }} variant='extended'>
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
          <Button variant="contained" fullWidth sx={{ fontSize: '2rem' }} onClick={handleOpenCashDrawer}>
            Open Drawer
          </Button>
        </CenterGrid>

        <CenterGrid item xs={12} sm={6}>
          <Button variant="contained" fullWidth onClick={() => navigate('/config')} sx={{ fontSize: '2rem' }} disabled={!user?.is_admin}>
            Config
          </Button>
        </CenterGrid>
      </CenterGrid>
  );
}

export default Landing;
export { handleOpenCashDrawer };