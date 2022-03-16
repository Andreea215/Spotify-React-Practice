import React, { createContext, useContext, useReducer } from "react";
import { AppReducer } from "./AppReducer";

export interface AppState {
  access_token: string,
  refresh_token: string,
  expires_at: string,
};

export const initialState: AppState = {
  access_token: '',
  refresh_token: '',
  expires_at: '',
};

const AppContext = createContext<{
  state: AppState; 
  dispatch: React.Dispatch<any>
}>({
  state: initialState, 
  dispatch: () => null
});

export const AppWrapper: React.FC = ({ children }) => {
  const [ state, dispatch ] = useReducer(AppReducer, initialState);

  // const contextValue = useMemo(() => {
  //   return { state, dispatch };
  // }, [state, dispatch]);

  return (
    <AppContext.Provider value={{state, dispatch}}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
