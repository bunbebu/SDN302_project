// src/services/brandModelService.js
import { axiosCustom } from "./config";

export const brandModelService = {
  getBrands: async () => {
    const response = await axiosCustom.get("/brands/");
    return response.data;
  },

  getModelsByBrand: async (brandId) => {
    const response = await axiosCustom.get(`/brands/${brandId}/models`);
    return response.data;
  },

  getAllModels: async () => {
    const response = await axiosCustom.get("/models/");
    return response.data;
  },
};
