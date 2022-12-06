import { configureStore } from '@reduxjs/toolkit';
import fieldsSlice from './fields.slice';
import foldersSlice from './folders.slice';
import routerSlice from './router.slice';
import layoutSlice from './layout.slice';

const store = configureStore({
  reducer: {
    fields: fieldsSlice.reducer,
    folders: foldersSlice.reducer,
    router: routerSlice.reducer,
    layout: layoutSlice.reducer
  }
});

export default store;
