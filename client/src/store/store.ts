'use client';

import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '@/store/chatSlice';
import socketMiddleware from '@/store/socketMiddleware';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
