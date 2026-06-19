import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getDeviceId } from '../utils/helpers';

const AppContext = createContext(null);

const initialState = {
  deviceId: '',
  userProfile: null,
  jobs: [],
  loading: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_DEVICE_ID':
      return { ...state, deviceId: action.payload };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_JOBS':
      return { ...state, jobs: action.payload };
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j => j.id === action.payload.id ? action.payload : j),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_DEVICE_ID', payload: getDeviceId() });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp 必须在 AppProvider 内使用');
  }
  return context;
}
