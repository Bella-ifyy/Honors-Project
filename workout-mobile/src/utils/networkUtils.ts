import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  return {
    isConnected: isOnline,
    isInternetReachable: isOnline,
    isOnline,
  };
};

export const checkIsOnline = async (): Promise<boolean> => {
  return true;
};
