import axios from 'axios';
import { useEffect } from 'react';
import { useLoading } from './LoadingContext';

export const useAxiosInterceptors = () => {
  const { setLoading } = useLoading();

  const setupInterceptors = () => {
    axios.interceptors.request.use(config => {
      setLoading(true);
      return config;
    }, error => {
      setLoading(false);
      return Promise.reject(error);
    });

    axios.interceptors.response.use(response => {
      setLoading(false);
      return response;
    }, error => {
      setLoading(false);
      return Promise.reject(error);
    });
  };

  return setupInterceptors;
};

export const AxiosInterceptorSetup: React.FC = () => {
  const setupInterceptors = useAxiosInterceptors();

  useEffect(() => {
    setupInterceptors();
  }, [setupInterceptors]);

  return null; // This component does not render anything
};


