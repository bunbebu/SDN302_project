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
    if (params.vehicle_id !== undefined) {
      queryParams.append("vehicle_id", params.vehicle_id);
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

  createAppointment: async (appointmentData) => {
    // Try form-urlencoded with proper array format
    const params = new URLSearchParams();

    // Required fields
    params.append("vehicle_id", appointmentData.vehicle_id);
    params.append("service_center_id", appointmentData.service_center_id);
    params.append("scheduled_date", appointmentData.scheduled_date);

    // Optional fields
    if (appointmentData.priority) {
      params.append("priority", appointmentData.priority);
    }
    if (appointmentData.notes) {
      params.append("notes", appointmentData.notes);
    }

    // Service IDs - try JSON string format
    if (
      appointmentData.service_ids &&
      Array.isArray(appointmentData.service_ids)
    ) {
      // Send as JSON string
      params.append("service_ids", JSON.stringify(appointmentData.service_ids));
    }

    console.log("🚀 Sending params:", params.toString());

    const response = await axiosCustom.post("/appointments/", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
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
