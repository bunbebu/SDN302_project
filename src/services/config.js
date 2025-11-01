// src/services/config.js

import axios from "axios";
import { keysLocalStorage, localStorageUtil } from "../utils/localStorage";


const BASE_URL = "https://ev-service-api.onrender.com/api/v1/";

export const axiosCustom = axios.create({
  baseURL: BASE_URL,
   headers: {
    "Content-Type": "application/json",
  },
});

// Sử dụng interceptor để tự động thêm token vào mỗi request
axiosCustom.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage trong mỗi lần gọi API
    const userLogin = localStorageUtil.get(keysLocalStorage.INFO_USER);
    if (userLogin?.access_token) {
      config.headers.Authorization = "Bearer " + userLogin.access_token;
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);
