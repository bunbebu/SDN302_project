import { configureStore } from "@reduxjs/toolkit";

import userSlice from "./user/userSlice";

export const store = configureStore({
  reducer: {
    userSlice,
    // La noi chua cac store cua ung dung
  },
});
