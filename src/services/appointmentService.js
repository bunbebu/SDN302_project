import { axiosCustom } from "./config";

export const appointmentService = {
  getAppointments: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.skip !== undefined) {
      queryParams.append("skip", params.skip);
    }
    if (params.limit !== undefined) {
      queryParams.append("limit", params.limit);
    }
    if (params.status) {
      queryParams.append("status", params.status);
    }
    if (params.service_center_id !== undefined) {
      queryParams.append("service_center_id", params.service_center_id);
    }
    if (params.start_date) {
      queryParams.append("start_date", params.start_date);
    }
    if (params.end_date) {
      queryParams.append("end_date", params.end_date);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/appointments/?${queryString}`
      : "/appointments/";

    return axiosCustom.get(url);
  },

  getAppointmentById: (id) => {
    return axiosCustom.get(`/appointments/${id}/`);
  },

  getMyAppointments: (skip = 0, limit = 100, includeServices = true) => {
    const params = new URLSearchParams();
    params.append("skip", skip);
    params.append("limit", limit);
    if (includeServices) {
      params.append("include_services", "true");
    }
    return axiosCustom.get(`/appointments/my?${params.toString()}`);
  },

  updateAppointment: (id, appointmentData) => {
    return axiosCustom.put(`/appointments/${id}/`, appointmentData);
  },

  cancelAppointment: (id, cancelReason = "Khách hàng hủy") => {
    // DELETE method with cancel_reason as query parameter in URL
    const params = new URLSearchParams();
    params.append("cancel_reason", cancelReason);
    return axiosCustom.delete(`/appointments/${id}?${params.toString()}`);
  },

  // Alternative cancel method if API uses different endpoint
  cancelAppointmentDirect: (id) => {
    return axiosCustom.delete(`/appointments/${id}`);
  },

  updateAppointmentStatus: (id, statusData) => {
    const requestData =
      typeof statusData === "string" ? { status: statusData } : statusData;

    return axiosCustom.put(`/appointments/${id}/status`, requestData);
  },
};
