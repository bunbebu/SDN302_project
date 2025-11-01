// src/services/adminService.js

import { axiosCustom } from "./config";
export const adminService = {
  getAllUsers: (params) => {
    return axiosCustom.get("/admin/users", { params });
  },

  getUserById: (userId) => {
    return axiosCustom.get(`/admin/users/${userId}`);
  },

  updateUser: (userId, updateData) => {
    return axiosCustom.put(`/admin/users/${userId}`, updateData);
  },
  activateUser: (userId) => {
    return axiosCustom.post(`/admin/users/${userId}/activate`);
  },
  getAllVehicles: (params) => {
    return axiosCustom.get("/admin/vehicles", { params });
  },
  getAllModels: (params) => {
    return axiosCustom.get("/admin/models", { params });
  },
  getAllParts: (params) => {
    return axiosCustom.get("/admin/parts", { params });
  },
  createPart: (data) => {
    return axiosCustom.post("/parts", data);
  },
  updatePart: (partId, data) => {
    return axiosCustom.put(`/parts/${partId}`, data);
  },
  deactivatePart: (partId) => {
    return axiosCustom.delete(`/parts/${partId}`);
  },
  restorePart: (partId) => {
    return axiosCustom.post(`/parts/restore/${partId}`);
  },
  getAllInventory: (params) => {
    return axiosCustom.get("/admin/inventory", { params });
  },
  createInventory: (data) => {
    return axiosCustom.post("/parts/inventory", data);
  },
  updateInventory: (inventoryId, data) => {
    return axiosCustom.put(`/parts/inventory/${inventoryId}`, data);
  },
  getAllServiceCenters: (params) => {
    return axiosCustom.get("/service-centers", { params });
  },
  deactivateInventory: (inventoryId) => {
    return axiosCustom.delete(`/parts/inventory/${inventoryId}`);
  },
  getInventoryByServiceCenter: (serviceCenterId) => {
    return axiosCustom.get(
      `/parts/inventory/service-center/${serviceCenterId}`
    );
  },
  getInventoryByPart: (partId) => {
    return axiosCustom.get(`/parts/inventory/part/${partId}`);
  },
  getLowStockInventory: () => {
    return axiosCustom.get("/parts/inventory/low-stock");
  },
  restoreInventory: (inventoryId) => {
    return axiosCustom.post(`/parts/inventory/restore/${inventoryId}`);
  },
  getAllServices: (params) => {
    return axiosCustom.get("/admin/services", { params });
  },
  createService: (data) => {
    return axiosCustom.post("/services", data);
  },
  updateService: (serviceId, data) => {
    return axiosCustom.put(`/services/${serviceId}`, data);
  },
  deactivateService: (serviceId) => {
    return axiosCustom.delete(`/services/${serviceId}`);
  },

  restoreService: (serviceId) => {
    return axiosCustom.post(`/services/${serviceId}/activate`);
  },
  updateServiceRecordStatus: (recordId, statusData) => {
    return axiosCustom.patch(
      `/service-records/${recordId}/status`,
      statusData
    );
  },
  getAllServiceRecords: (params) => {
    return axiosCustom.get("/service-records/", { params });
  },

  getServiceRecordById: (recordId) => {
    return axiosCustom.get(`/service-records/${recordId}`);
  },
  getAllAppointments: (params) => {
    return axiosCustom.get("/appointments/", { params });
  },
  getAllBrands: (params) => {
    return axiosCustom.get("/admin/brands", { params });
  },
};
