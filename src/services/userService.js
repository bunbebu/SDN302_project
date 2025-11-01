// src/services/userService.js

import { axiosCustom } from "./config";

export const userService = {
  login: (data) => {
    return axiosCustom.post("/auth/login", data);
  },

  logout: () => {
    return axiosCustom.post("/auth/logout");
  },

  getTechnicians: () => {
    return axiosCustom.get("/users/technicians");
  },
};
