import {useState, useCallback} from 'react';

function useHttp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = useCallback(async(requestConfig: {url: string; method?: string; headers?: {}; body? : any;}, processData?: ({})=> any, returnVal?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        requestConfig.url, {
          method: requestConfig.method ? requestConfig.method : 'GET',
          headers: requestConfig.headers ? requestConfig.headers : {},
          body: requestConfig.body ? requestConfig.body : null,
        }
      );

      if (!response.ok) {
        throw { response, error: await response.json() };
      }

      if (returnVal && processData) {
        const data = await response.json();
        return processData(data);
      } else if (processData) {
        const data = await response.json();
        processData(data);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong!');
    }
    setIsLoading(false);
  }, []);

  return {
    isLoading: isLoading,
    error: error,
    sendRequest: sendRequest
  };
}

export default useHttp;