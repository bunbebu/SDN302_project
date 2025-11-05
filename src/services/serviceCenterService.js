import { axiosCustom } from "./config";

export const serviceCenterService = {
  getServiceCenters: async (skip = 0, limit = 100, activeOnly = true) => {
    const response = await axiosCustom.get("/service-centers/", {
      params: {
        skip,
        limit,
        active_only: activeOnly,
      },
    });
    return response.data;
  },

  getServiceCenterById: async (centerId) => {
    const response = await axiosCustom.get(/service-centers/);
    return response.data;
  },
};
