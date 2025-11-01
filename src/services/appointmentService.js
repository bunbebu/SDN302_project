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

  updateAppointment: (id, appointmentData) => {
    return axiosCustom.put(`/appointments/${id}/`, appointmentData);
  },

  cancelAppointment: (id, cancelReason) => {
    return axiosCustom.patch(`/appointments/${id}/cancel/`, {
      cancel_reason: cancelReason
    });
  },

  updateAppointmentStatus: (id, statusData) => {
    const requestData = typeof statusData === 'string' 
      ? { status: statusData }
      : statusData;
      
    return axiosCustom.put(`/appointments/${id}/status`, requestData);
  },
};