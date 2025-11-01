import { axiosCustom } from "./config";

export const serviceRecordService = {
  getServiceRecords: (params = {}) => {
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
    if (params.technician_id !== undefined) {
      queryParams.append("technician_id", params.technician_id);
    }
    if (params.vehicle_id !== undefined) {
      queryParams.append("vehicle_id", params.vehicle_id);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/service-records/?${queryString}`
      : "/service-records/";

    return axiosCustom.get(url);
  },

  getServiceRecordById: (id) => {
    return axiosCustom.get(`/service-records/${id}/`);
  },

  updateServiceRecord: (id, recordData) => {
    return axiosCustom.put(`/service-records/${id}/`, recordData);
  },

  updateServiceRecordStatus: (id, statusData) => {
    const requestData = typeof statusData === 'string' 
      ? { status: statusData }
      : statusData;

    // Tạo query parameters
    const queryParams = new URLSearchParams();
    Object.keys(requestData).forEach(key => {
      if (requestData[key] !== null && requestData[key] !== undefined) {
        queryParams.append(key, requestData[key]);
      }
    });

    const url = `/service-records/${id}/status?${queryParams.toString()}`;
    console.log('Request URL:', url);
    
    // Gửi PATCH request với query parameters (không có body)
    return axiosCustom.patch(url);
  },
};