import { createSlice } from "@reduxjs/toolkit";

const isClient = typeof window !== "undefined";

const loadAuthState = () => {
  if (!isClient) return null;
  try {
    const serializedState = localStorage.getItem("auth");
    return serializedState ? JSON.parse(serializedState) : null;
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
    return null;
  }
};

const saveAuthState = (state) => {
  if (!isClient) return;
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("auth", serializedState);
  } catch (error) {
    console.error("Error saving auth state to localStorage:", error);
  }
};

const initialState = loadAuthState() || {
  user: null,
  userType: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const newState = {
        ...state,
        user: action.payload.user,
        userType: action.payload.userType,
        token: action.payload.token,
      };
      saveAuthState(newState);
      return newState;
    },
    setUser: (state, action) => {
      const newState = {
        ...state,
        user: action.payload,
      };
      saveAuthState(newState);
      return newState;
    },
    clearAuth: () => {
      const newState = {
        user: null,
        userType: null,
        token: null,
      };
      saveAuthState(newState);
      return newState;
    },
  },
});

export const { setAuth, clearAuth, setUser } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
