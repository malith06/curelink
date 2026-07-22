import { useState, useCallback } from 'react';

const useGeolocation = () => {
  const [state, setState] = useState({
    status: 'idle', // idle | loading | success | permission-denied | position-unavailable | timeout | unsupported | error
    latitude: null,
    longitude: null,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: 'unsupported',
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser',
      });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
      },
      (error) => {
        let status = 'error';
        let errorMessage = 'An unknown error occurred';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            status = 'permission-denied';
            errorMessage = 'Location permission was denied. You can enter your area manually or enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            status = 'position-unavailable';
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            status = 'timeout';
            errorMessage = 'The request to get user location timed out.';
            break;
          default:
            break;
        }

        setState({
          status,
          latitude: null,
          longitude: null,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    ...state,
    isLoading: state.status === 'loading',
    isError: ['permission-denied', 'position-unavailable', 'timeout', 'unsupported', 'error'].includes(state.status),
    requestLocation,
  };
};

export default useGeolocation;
