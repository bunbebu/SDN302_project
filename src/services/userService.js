// src/services/userService.js

import { axiosCustom } from "./config";

export const userService = {
  login: (data) => {
    return axiosCustom.post("/auth/login", data);
  },

  register: (data) => {
    return axiosCustom.post("/auth/register", data);
  },

  logout: () => {
    return axiosCustom.post("/auth/logout");
  },

  getTechnicians: () => {
    return axiosCustom.get("/users/technicians");
  },

  getMyProfile: () => {
    return axiosCustom.get("/users/me");
  },

  updateMyProfile: (data) => {
    return axiosCustom.put("/users/me", data);
  },
};
