import { configureStore } from '@reduxjs/toolkit'
import simulatorReducer from './simulatorSlice'
import graphSpecReducer from './graphSpecSlice'
import graphDataReducer from './graphDataSlice'

export const store = configureStore({
  reducer: {
    simulator: simulatorReducer,
    graphSpec: graphSpecReducer,
    graphData: graphDataReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch