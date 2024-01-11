import { styled } from '@mui/material/styles';
import { Box, Grid, Button as MuiButton, TextField as MUITextField, Select as MUISelect, IconButton as MUIIconButton, Divider as MUIDivider } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { DRAWER_WIDTH } from './Constants';

const Button = styled(MuiButton)(({ theme }) => ({
  height: '40%',
  width: '50%',
  fontSize: '2.15rem',
  fontWeight: 700,
  padding: '0.5rem 1rem',
  borderRadius: '0.375rem',
  borderColor: 'transparent',
  transition: 'all 0.15s ease-in-out, transform 0.15s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  margin: '8px',
}));

const ButtonWider = styled(Button)({
  width: '66.66%',
});

const ButtonWidest = styled(Button)({
  width: '100%',
});

const CenterGrid = styled(Grid)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const Popup = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: `calc(50% + ${DRAWER_WIDTH / 2}px)`,
  transform: 'translate(-50%, -50%)',
  width: '70vw',
  height: '70vh',
  backgroundColor: '#fff',
  border: `2px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
  boxShadow: theme.shadows[24],
  padding: theme.spacing(2, 4, 3),
  borderRadius: '0.375rem',
}));

const DrawerMain = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${DRAWER_WIDTH}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const DrawerAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    marginLeft: `${DRAWER_WIDTH}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const TextField = styled(MUITextField)({
  margin: '8px',
  '& input': {
    fontSize: '2.15rem',
    fontWeight: 700,
  },
  '& label': {
    fontSize: '2.15rem',
  },
  '& label.Mui-focused': {
    fontSize: '1rem',
  },
});

const Select = styled(MUISelect)({
  margin: '8px',
});

const IconButton = styled(MUIIconButton)({
  margin: '8px',
  fontSize: '3.5rem',
});

const Divider = styled(MUIDivider)(({theme}) => ({
  margin: '24px',
  width: '100%',
  border: `0.5px solid ${theme.palette.primary.main}`,
  borderRadius: '0.375rem',
}));

export { Button, ButtonWider, ButtonWidest, CenterGrid, Popup, DrawerMain, DrawerAppBar, DrawerHeader, TextField, Select, IconButton, Divider };