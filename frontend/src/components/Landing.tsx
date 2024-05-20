import { useNavigate } from 'react-router';
import { Box } from '@mui/material';
import { Button, CenterGrid } from './Styled';

function Landing() {
  const navigate = useNavigate();
  return (
    <Box sx={{ width: '100vw', height: '100vh' }}>
      <CenterGrid container spacing={2} alignItems="center" justifyContent="center" style={{ height: '100%' }}>

        <CenterGrid item xs={12}>
          <Box 
            component='img' 
            src="/pelican-logo-1-no-bg-trimmed.png" 
            alt="logo" 
            sx={{ height: '12.5rem', width: '12.5rem', '&:hover': {transform: 'scale(1.05)'}, transition: 'all 0.15s ease-in-out, transform 0.15s ease-in-out', }} />
        </CenterGrid>

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
          <Button variant="contained" fullWidth sx={{fontSize: '2rem'}}>
            Open Drawer
          </Button>
        </CenterGrid>

        <CenterGrid item xs={12} sm={6} >
          <Button variant="contained" fullWidth onClick={() => navigate('/config')} sx={{fontSize: '2rem'}}>
            Config
          </Button>
        </CenterGrid>
      </CenterGrid>
    </Box>
  );
}

export default Landing;