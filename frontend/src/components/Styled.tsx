import { styled } from '@mui/material/styles';
import {
  Box, Grid,
  Button as MuiButton,
  TextField as MUITextField, TextFieldProps,
  Select as MUISelect,
  IconButton as MUIIconButton,
  Divider as MUIDivider,
  ListItemButton as MUIListItemButton,
  FormControl as MUIFormControl,
  MenuItem as MUIMenuItem,
  DialogTitle as MUIDialogTitle,
  DialogContentText as MUIDialogContentText,
  Dialog as MUIDialog,
  DialogProps as MUIDialogProps,
  Snackbar as MUISnackbar,
  Card as MUICard,
  CardContent as MUICardContent,
  CardActionArea as MUICardActionArea,
  FormControlLabel as MUIFormControlLabel,
  Checkbox as MUICheckbox,
  Accordion as MUIAccordion,
  Typography as MUITypography,
  ToggleButton as MUIToggleButton,
  ToggleButtonGroup as MUIToggleButtonGroup,
  ToggleButtonProps as MUIToggleButtonProps,
} from '@mui/material';
import { DateTimePicker as MUIDateTimePicker, MobileDateTimePicker as MUIMobileDateTimePicker } from '@mui/x-date-pickers';
import { DataGrid as MUIDataGrid } from '@mui/x-data-grid';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { DRAWER_WIDTH } from './Constants';

interface DialogProps extends MUIDialogProps {
  shiftamount?: number;
}

const Button = styled(MuiButton)({
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
});

const ButtonSmaller = styled(Button)({
  fontSize: '1.5rem',
  fontWeight: 400,
});

const ButtonWider = styled(Button)({
  width: '66.66%',
});

const ButtonWidest = styled(Button)({
  width: '100%',
});

const ListItemButton = styled(MUIListItemButton)({
  '& .MuiListItemText-primary': {
    fontSize: '1.75rem',
  },
});

const CenterGrid = styled(Grid)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const Popup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column', // Stack children vertically
  justifyContent: 'space-between', // Adjust this based on your design needs
  position: 'absolute',
  top: '50%',
  left: `calc(50% + ${DRAWER_WIDTH / 2}px)`,
  transform: 'translate(-50%, -50%)',
  width: '70vw',
  minHeight: '10vh',
  maxHeight: '85vh',
  backgroundColor: '#fff',
  border: `2px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
  boxShadow: theme.shadows[24],
  padding: theme.spacing(2, 4, 3),
  borderRadius: '0.375rem',
  overflowY: 'auto',
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

const TextField = styled(MUITextField)<TextFieldProps>({
  margin: '8px',
  '& input': {
    fontSize: '2.15rem',
  },
  '& label': {
    fontSize: '2.15rem',
  },
  '& label.MuiInputLabel-shrink': {
    fontSize: '1rem',
  },
  '& .MuiInputBase-root': {
    fontSize: '2.15rem',
  },
  '& .MuiSelect-select': {
    backgroundColor: 'transparent',
  }
});

const TextFieldSmaller = styled(TextField)({
  '& input': {
    fontSize: '1.5rem',
  },
  '& label': {
    fontSize: '1.5rem',
  },
  '& .MuiInputBase-root': {
    fontSize: '1.5rem',
  },
});

//MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation8 MuiPopover-paper MuiMenu-paper MuiMenu-paper paper div containing the list
//MuiList-root MuiList-padding MuiMenu-list for ul
//MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters MuiMenuItem-root MuiMenuItem-gutters for li

const MenuItem = styled(MUIMenuItem)({
  fontSize: '2.15rem',
});

const MenuItemSmaller = styled(MUIMenuItem)({
  fontSize: '1.5rem',
});

const Select = styled(MUISelect)({
  margin: '8px',
  fontSize: '2.15rem',
  "& .MuiInputLabel": {
    color: "green"
  },
});

const IconButton = styled(MUIIconButton)({
  margin: '8px',
  fontSize: '3.5rem',
  zIndex: 1000,
});

const IconButtonSmaller = styled(MUIIconButton)({
  margin: '8px',
  fontSize: '2.15rem',
  zIndex: 1000,
});

const Divider = styled(MUIDivider)(({ theme }) => ({
  margin: '24px',
  width: '100%',
  border: `0.5px solid ${theme.palette.primary.main}`,
  borderRadius: '0.375rem',
}));

const FormControl = styled(MUIFormControl)({
  padding: '0px',
  margin: '0px',
  border: 'none',
});

const DialogTitle = styled(MUIDialogTitle)({
  fontSize: '2.15rem',
  fontWeight: 'bold'
});

const DialogContentText = styled(MUIDialogContentText)({
  fontSize: '2.15rem',
});

const Snackbar = styled(MUISnackbar)(({ theme }) => {
  return {
    '& .MuiSnackbarContent-root': {
      fontSize: '2.15rem',
      backgroundColor: theme.palette.primary.main,
    },
  }
});

const Circle = styled('div')(({ theme }) => ({
  minWidth: '50px',
  minHeight: '50px',
  borderRadius: '50%',
  border: '4px solid',
  borderColor: theme.palette.primary.main,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: theme.spacing(2),
  fontSize: '2.5rem',
  fontWeight: 'bold',
  lineHeight: '40px',
  margin: '8px',
}));

const Card = styled(MUICard)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.primary.main,
  fontSize: '2.75rem',
  fontWeight: 'bold',
  borderRadius: '1.375rem',
  boxShadow: theme.shadows[6],
  minHeight: '10rem',
}));

const CardContent = styled(MUICardContent)({
  textAlign: 'center',
  flexGrow: 1,
});

const CardActionArea = styled(MUICardActionArea)({
  margin: '16px',
  width: '50%',
  borderRadius: '1.375rem',
});

const DraggableListBox = styled(Box)({
  position: 'relative',
  width: '200px',
  height: '40px',
  transformOrigin: '50% 50% 0px',
  borderRadius: '5px',
  color: 'white',
  lineHeight: '40px',
  paddingLeft: '32px',
  fontSize: '14.5px',
  background: 'lightblue',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  touchAction: 'none',
});

const Dialog = styled(MUIDialog)<DialogProps>(({ shiftamount }) => ({
  '& .MuiDialog-container': {
    position: 'fixed',
    top: '50%',
    left: `calc(50% + ${shiftamount}px)`, // Centering dialog in the available space
    transform: 'translate(-50%, -50%)',
    width: '100vh',
  },
}));

const FormControlLabel = styled(MUIFormControlLabel)({
  '& .MuiTypography-root': {
    fontSize: '2.15rem',
  },
});

const Checkbox = styled(MUICheckbox)({
  '& .MuiSvgIcon-root': {
    fontSize: '2.15rem',
  },
});

const DateTimePicker = styled(MUIDateTimePicker)({
  width: '100%',
  margin: '8px',
  '& .MuiInputBase-input': {
    fontSize: '1.5rem',
  },
  '& .MuiFormLabel-root': {
    fontSize: '1.5rem',
  },
  '& label.MuiInputLabel-shrink': {
    fontSize: '1rem',
  },
});

const MobileDateTimePicker = styled(MUIMobileDateTimePicker)({
  width: '100%',
  margin: '8px',
  '& .MuiInputBase-input': {
    fontSize: '1.5rem',
  },
  '& .MuiFormLabel-root': {
    fontSize: '1.5rem',
  },
  '& label.MuiInputLabel-shrink': {
    fontSize: '1rem',
  },
});

const DataGrid = styled(MUIDataGrid)({


  '& .MuiDataGrid-row': {
    fontSize: '1.25rem',
  },

  '& .MuiDataGrid-columnHeader': {
    fontSize: '1.25rem',
  },

  '& .MuiTablePagination-root': {
    fontSize: '1.25rem',
  },

  '& .MuiTablePagination-displayedRows': {
    fontSize: '1.25rem',
  },

  '& .MuiTablePagination-selectLabel': {
    fontSize: '1.25rem',
  },

});

const Accordion = styled(MUIAccordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
}));

const ItemPriceLine = styled(MUITypography)({
  flex: 1,
  display: 'flex',
  borderBottom: '1px dotted',
  margin: '0 6px 6px',
});

interface ToggleButtonProps extends MUIToggleButtonProps {
  selectedcolor: string;
}

const ToggleButton = styled(MUIToggleButton)<ToggleButtonProps>(({ selectedcolor }) => ({
  minWidth: '3rem',
  minHeight: '3rem',
  color: 'primary',
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'primary',
    backgroundColor: selectedcolor,
  },
  '&.Mui-disabled': {
    color: '#e8e4e4',
    backgroundColor: 'transparent',
  },
}));

const ToggleButtonGroup = styled(MUIToggleButtonGroup)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: '0.375rem',
}));


export {
  Button,
  ButtonWider,
  ButtonWidest,
  CenterGrid,
  Popup,
  DrawerMain,
  DrawerAppBar,
  DrawerHeader,
  TextField,
  TextFieldSmaller,
  Select,
  IconButton,
  IconButtonSmaller,
  Divider,
  ListItemButton,
  FormControl,
  MenuItem,
  MenuItemSmaller,
  DialogTitle,
  DialogContentText,
  Dialog,
  Snackbar,
  Circle,
  Card,
  CardContent,
  CardActionArea,
  DraggableListBox,
  FormControlLabel,
  Checkbox,
  DateTimePicker,
  MobileDateTimePicker,
  DataGrid,
  Accordion,
  ItemPriceLine,
  ButtonSmaller,
  ToggleButton,
  ToggleButtonGroup
};