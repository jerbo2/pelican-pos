import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import { createTheme, ThemeProvider } from '@mui/material';
import { LoadingProvider } from './components/Loading/LoadingContext';
import { AxiosInterceptorSetup } from './components/Loading/LoadingInterceptors';
import LoadingIndicator from './components/Loading/LoadingIndicator';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { UserProvider } from './components/BaseComps/contexts/UserContext';
import App from './App';
import axios from 'axios';

dayjs.extend(utc);
dayjs.extend(timezone);
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api/v1';

const theme = createTheme({
  palette: {
    primary: {
      main: '#181c24',
    },
    secondary: {
      main: '#f0f4f4',
    },
  },
  spacing: 2,
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <LoadingProvider>
        <AxiosInterceptorSetup />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <UserProvider>
            <App />
          </UserProvider>
        </LocalizationProvider>
        <LoadingIndicator />
      </LoadingProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
