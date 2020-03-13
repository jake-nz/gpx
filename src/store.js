import { configureStore, createAction, createReducer } from '@reduxjs/toolkit'
import karnak from './karnak'

export const addFile = createAction('files/add')
const togglePoint = createAction('files/togglePoint')

const filesReducer = createReducer([], {
  [addFile]: (state, action) => {
    const file = action.payload
    return [...state, file]
  }
  // [togglePoint]: (state, action) => {
  //   const index = action.payload
  //   const todo = state[index]
  //   return [
  //     ...state.slice(0, index),
  //     { ...todo, completed: !todo.completed }
  //     ...state.slice(index + 1)
  //   ]
  // }
})

const store = configureStore({
  reducer: {
    files: filesReducer
  },
  preloadedState: { files: [karnak] }
})

export default store
