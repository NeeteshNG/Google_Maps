import { configureStore, createSlice } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const savedLocationsSlice = createSlice({
  name: 'savedLocations',
  initialState: [],
  reducers: {
    addLocation: (state, action) => {
      state.push(action.payload);
    },
    removeLocation: (state, action) => {
      return state.filter((location, index) => index !== action.payload);
    },
  },
});

const rootReducer = combineReducers({
  savedLocations: savedLocationsSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const { addLocation, removeLocation } = savedLocationsSlice.actions;

export const persistor = persistStore(store);
