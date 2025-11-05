import { axiosCustom } from "./config";

export const vehicleService = {
  getMyVehicles: async () => {
    const response = await axiosCustom.get("/vehicles/");
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    // Convert to URLSearchParams for form-urlencoded format
    const params = new URLSearchParams();
    Object.keys(vehicleData).forEach((key) => {
      if (vehicleData[key] !== undefined && vehicleData[key] !== null) {
        params.append(key, vehicleData[key]);
      }
    });

    const response = await axiosCustom.post("/vehicles/", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  },

  getVehicleById: async (vehicleId) => {
    const response = await axiosCustom.get(/vehicles/);
    return response.data;
  },

  updateVehicle: async (vehicleId, vehicleData) => {
    // Convert to URLSearchParams for form-urlencoded format
    const params = new URLSearchParams();
    Object.keys(vehicleData).forEach((key) => {
      if (vehicleData[key] !== undefined && vehicleData[key] !== null) {
        params.append(key, vehicleData[key]);
      }
    });

    const response = await axiosCustom.put(`/vehicles/${vehicleId}`, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  },

  deleteVehicle: async (vehicleId) => {
    const response = await axiosCustom.delete(/vehicles/);
    return response.data;
  },
};
