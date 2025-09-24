import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  branch: [],
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setBranches: (state, action) => {
      state.branch = action.payload;
    },
  },
});

export const { setBranches } = branchSlice.actions;
export const selectBranch = (state) => state.branch;
export default branchSlice.reducer;
