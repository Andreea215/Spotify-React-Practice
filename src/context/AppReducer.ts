import { AppState, initialState } from "./AppProvider";

enum ActionType {
  SetStorage,
  ClearStorage
}

interface SetStorage {
  type: ActionType.SetStorage;
  payload: AppState;
}

interface ClearStorage {
  type: ActionType.ClearStorage;
}

type AppActions = SetStorage | ClearStorage;

export const AppReducer = (state: AppState, action: AppActions): AppState => {
  switch (action.type) {
    case ActionType.SetStorage:
      return {
        ...state,
        access_token: action.payload.access_token,
        refresh_token: action.payload.refresh_token,
        expires_at: action.payload.expires_at,
      };
    case ActionType.ClearStorage: 
      return initialState;
    default: 
      return state;
  }
};

export const setStorage = (storage: AppState): SetStorage => ({
  type: ActionType.SetStorage,
  payload: storage,
});

export const clearStorage = (): ClearStorage => ({
  type: ActionType.ClearStorage,
});