import { createSlice } from "@reduxjs/toolkit";
import { keysLocalStorage, localStorageUtil } from "../../utils/localStorage";

const initialState = {
  infoUser: localStorageUtil.get(keysLocalStorage.INFO_USER),
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setInfoUserAction: (state, { payload }) => {
      state.infoUser = payload;
    },

    setLogoutAction: (state) => {
      // b1: xoa thong tin user trong redux
      state.infoUser = null;

      // b2: xoa thong tin user trong localStorage
      localStorageUtil.remove(keysLocalStorage.INFO_USER);
    },
  },
});

export const { setInfoUserAction, setLogoutAction } = userSlice.actions;

export default userSlice.reducer;
