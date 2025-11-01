import { axiosCustom } from "./config";

export const serviceService = {
  getServices: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.skip !== undefined) {
      queryParams.append("skip", params.skip);
    }
    if (params.limit !== undefined) {
      queryParams.append("limit", params.limit);
    }
    if (params.category) {
      queryParams.append("category", params.category);
    }
    if (params.active_only !== undefined) {
      queryParams.append("active_only", params.active_only);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/services/?${queryString}`
      : "/services/";

    return axiosCustom.get(url);
  },

  createService: (serviceData) => {
    return axiosCustom.post("/services/", serviceData);
  },

  updateService: (id, serviceData) => {
    return axiosCustom.put(`/services/${id}/`, serviceData);
  },

  deleteService: (id) => {
    return axiosCustom.delete(`/services/${id}/`);
  },
};
