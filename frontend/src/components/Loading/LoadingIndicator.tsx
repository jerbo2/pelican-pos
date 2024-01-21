import React from 'react';
import { CircularProgress } from '@mui/material';
import { useLoading } from './LoadingContext';

const LoadingIndicator: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <CircularProgress />
  </div>;
};

export default LoadingIndicator;
