import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Select,
  DatePicker,
  Modal,
  Card,
  Descriptions,
  List,
  Typography,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  StopOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { appointmentService } from "../../services/appointmentService";
import { userService } from "../../services/userService";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [statusUpdateModalVisible, setStatusUpdateModalVisible] =
    useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [updateStatusData, setUpdateStatusData] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: "orange",
      CONFIRMED: "blue",
      IN_PROGRESS: "processing",
      COMPLETED: "success",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  // Get status name in Vietnamese
  const getStatusName = (status) => {
    const names = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return names[status] || status;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      LOW: "green",
      NORMAL: "blue",
      HIGH: "orange",
      URGENT: "red",
    };
    return colors[priority] || "default";
  };

  // Get technician name by ID
  const getTechnicianName = (technicianId) => {
    if (!technicianId) return "Chưa phân công";
    const technician = technicians.find((tech) => tech.id === technicianId);
    if (technician) {
      const fullName =
        `${technician.last_name} ${technician.first_name}`.trim();
      return `${fullName} (KTV-${technician.id})`;
    }
    return `KTV-${technicianId}`;
  };

  // Fetch appointments from API
  const fetchAppointments = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        skip:
          ((params.current || pagination.current) - 1) *
          (params.pageSize || pagination.pageSize),
        limit: params.pageSize || pagination.pageSize,
        ...params,
      };

      if (statusFilter) {
        queryParams.status = statusFilter;
      }

      if (dateRange && dateRange.length === 2) {
        queryParams.start_date = dateRange[0].format("YYYY-MM-DD");
        queryParams.end_date = dateRange[1].format("YYYY-MM-DD");
      }

      const response = await appointmentService.getAppointments(queryParams);

      if (response.data && response.data.success) {
        setAppointments(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.length,
          current: params.current || prev.current,
          pageSize: params.pageSize || prev.pageSize,
        }));
      } else {
        message.error("Không thể tải danh sách lịch hẹn");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAppointments();
    fetchTechnicians();
  }, [statusFilter, dateRange]);

  // Fetch technicians from API
  const fetchTechnicians = async () => {
    try {
      const response = await userService.getTechnicians();
      if (response.data && response.data.success) {
        setTechnicians(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  };

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    fetchAppointments({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    // Filter based on appointment code or notes
    fetchAppointments({ current: 1 });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAppointments();
    setSearchText("");
    setStatusFilter("");
    setDateRange([]);
    message.success("Đã làm mới dữ liệu");
  };

  // View appointment details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalVisible(true);
  };

  // Cancel appointment
  const handleCancelAppointment = (appointment) => {
    setAppointmentToCancel(appointment);
    setCancelReason("");
    setCancelModalVisible(true);
  };

  // Handle cancel with reason
  const handleCancelWithReason = async () => {
    if (!cancelReason.trim()) {
      message.error("Vui lòng nhập lý do hủy lịch hẹn");
      return;
    }

    try {
      const updateData = {
        status: "CANCELLED",
        cancel_reason: cancelReason.trim()
      };

      const response = await appointmentService.updateAppointmentStatus(
        appointmentToCancel.id,
        updateData
      );

      if (response.data && response.data.success) {
        message.success("Hủy lịch hẹn thành công!");
        fetchAppointments();
        setCancelModalVisible(false);
        setCancelReason("");
        setAppointmentToCancel(null);
      } else {
        message.error("Không thể hủy lịch hẹn");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      message.error("Có lỗi xảy ra khi hủy lịch hẹn");
    }
  };

  // Update appointment status
  const handleUpdateStatus = (appointment) => {
    console.log('Opening status update modal for:', appointment); // Debug log
    setUpdateStatusData({ appointment });
    setSelectedNewStatus(null);
    setSelectedTechnician(appointment.technician_id || null);
    setStatusUpdateModalVisible(true);
  };

  // Handle status update with technician
  const handleStatusUpdateWithTechnician = async () => {
    if (!updateStatusData || !selectedNewStatus) {
      message.error('Vui lòng chọn trạng thái mới');
      return;
    }

    // Validate technician selection for IN_PROGRESS status
    if (selectedNewStatus === "IN_PROGRESS" && !selectedTechnician) {
      message.error('Vui lòng chọn kỹ thuật viên cho trạng thái "Đang thực hiện"');
      return;
    }

    try {
      const updateData = {
        status: selectedNewStatus,
      };

      // Add technician_id if selected
      if (selectedTechnician) {
        updateData.technician_id = selectedTechnician;
      }

      const response = await appointmentService.updateAppointmentStatus(
        updateStatusData.appointment.id,
        updateData
      );

      if (response.data && response.data.success) {
        message.success("Cập nhật trạng thái thành công!");
        fetchAppointments();
        setStatusUpdateModalVisible(false);
        setSelectedTechnician(null);
        setSelectedNewStatus(null);
        setUpdateStatusData(null);
      } else {
        message.error("Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating status with technician:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  // Get available status options based on current status
  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      'PENDING': ['CONFIRMED'],
      'CONFIRMED': ['IN_PROGRESS'],
      'IN_PROGRESS': ['COMPLETED'],
      'COMPLETED': [],
      'CANCELLED': []
    };
    return statusFlow[currentStatus] || [];
  };

  const columns = [
    {
      title: "Mã lịch hẹn",
      dataIndex: "booking_code",
      key: "booking_code",
      width: 180,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Ngày hẹn",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusName(status)}</Tag>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technician_id",
      key: "technician_id",
      render: (id) => getTechnicianName(id),
    },
    {
      title: "Trung tâm",
      dataIndex: "service_center_id",
      key: "service_center_id",
      render: (id) => `TT-${id}`,
    },
    {
      title: "Số dịch vụ",
      dataIndex: "appointment_services",
      key: "services_count",
      align: "center",
      render: (services) => services?.length || 0,
    },
    {
      title: "Tổng giá ước tính",
      dataIndex: "appointment_services",
      key: "total_price",
      render: (services) => {
        const total =
          services?.reduce(
            (sum, service) => sum + parseFloat(service.estimated_price || 0),
            0
          ) || 0;
        return total.toLocaleString("vi-VN") + " VND";
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status !== "CANCELLED" && record.status !== "COMPLETED" && (
            <>
              <Tooltip title="Cập nhật trạng thái">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleUpdateStatus(record)}
                />
              </Tooltip>
              {/* Only allow cancellation if status is PENDING */}
              {record.status === "PENDING" && (
                <Tooltip title="Hủy lịch hẹn">
                  <Button
                    danger
                    shape="circle"
                    icon={<StopOutlined />}
                    size="small"
                    onClick={() => handleCancelAppointment(record)}
                  />
                </Tooltip>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Quản lý lịch hẹn</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm mới
          </Button>
        </Space>
      </div>

      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <Search
          placeholder="Tìm kiếm theo mã lịch hẹn..."
          style={{ width: 300 }}
          onSearch={handleSearch}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Select
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
        >
          <Option value="PENDING">Chờ xác nhận</Option>
          <Option value="CONFIRMED">Đã xác nhận</Option>
          <Option value="IN_PROGRESS">Đang thực hiện</Option>
          <Option value="COMPLETED">Hoàn thành</Option>
          <Option value="CANCELLED">Đã hủy</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={appointments}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} lịch hẹn`,
        }}
        onChange={handleTableChange}
      />

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết lịch hẹn - ${selectedAppointment?.booking_code}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedAppointment && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã lịch hẹn" span={2}>
                <Text strong>{selectedAppointment.booking_code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedAppointment.status)}>
                  {getStatusName(selectedAppointment.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ưu tiên">
                <Tag color={getPriorityColor(selectedAppointment.priority)}>
                  {selectedAppointment.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hẹn">
                {dayjs(selectedAppointment.scheduled_date).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedAppointment.created_at).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="ID Khách hàng">
                <UserOutlined /> {selectedAppointment.user_id}
              </Descriptions.Item>
              <Descriptions.Item label="ID Xe">
                <CarOutlined /> {selectedAppointment.vehicle_id}
              </Descriptions.Item>
              <Descriptions.Item label="Trung tâm dịch vụ">
                TT-{selectedAppointment.service_center_id}
              </Descriptions.Item>
              <Descriptions.Item label="Kỹ thuật viên">
                {getTechnicianName(selectedAppointment.technician_id)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedAppointment.notes || "Không có ghi chú"}
              </Descriptions.Item>
              {selectedAppointment.cancel_reason && (
                <Descriptions.Item label="Lý do hủy" span={2}>
                  <Text type="danger">{selectedAppointment.cancel_reason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Card title="Danh sách dịch vụ" className="mt-4">
              <List
                dataSource={selectedAppointment.appointment_services}
                renderItem={(service) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Dịch vụ ID: ${service.service_id}`}
                      description={service.notes || "Không có ghi chú"}
                    />
                    <Text strong>
                      {parseFloat(service.estimated_price).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VND
                    </Text>
                  </List.Item>
                )}
              />
              <div className="mt-3 text-right">
                <Text strong style={{ fontSize: "16px" }}>
                  Tổng cộng:{" "}
                  {selectedAppointment.appointment_services
                    ?.reduce(
                      (sum, service) =>
                        sum + parseFloat(service.estimated_price || 0),
                      0
                    )
                    .toLocaleString("vi-VN")}{" "}
                  VND
                </Text>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Status Update with Technician Modal */}
      <Modal
        title="Cập nhật trạng thái lịch hẹn"
        open={statusUpdateModalVisible}
        onOk={handleStatusUpdateWithTechnician}
        onCancel={() => {
          setStatusUpdateModalVisible(false);
          setSelectedTechnician(null);
          setSelectedNewStatus(null);
          setUpdateStatusData(null);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedNewStatus }}
        width={600}
      >
        {updateStatusData && (
          <div className="space-y-4">
            <div>
              <p>
                <strong>Lịch hẹn:</strong> {updateStatusData.appointment.booking_code}
              </p>
              <p>
                <strong>Trạng thái hiện tại:</strong>{" "}
                <Tag color={getStatusColor(updateStatusData.appointment.status)}>
                  {getStatusName(updateStatusData.appointment.status)}
                </Tag>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Chọn trạng thái mới: <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Chọn trạng thái mới"
                style={{ width: "100%" }}
                value={selectedNewStatus}
                onChange={setSelectedNewStatus}
              >
                {getAvailableStatuses(updateStatusData.appointment.status).map((status) => (
                  <Option key={status} value={status}>
                    <Tag color={getStatusColor(status)}>
                      {getStatusName(status)}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Kỹ thuật viên: 
                {selectedNewStatus === "IN_PROGRESS" && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <Select
                placeholder="Chọn kỹ thuật viên"
                style={{ width: "100%" }}
                value={selectedTechnician}
                onChange={setSelectedTechnician}
                showSearch
                allowClear
                disabled={selectedNewStatus === "CANCELLED"}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {technicians.map((tech) => {
                  const fullName = `${tech.last_name} ${tech.first_name}`.trim();
                  return (
                    <Option key={tech.id} value={tech.id}>
                      {fullName} (KTV-{tech.id}) - {tech.specialization}
                    </Option>
                  );
                })}
              </Select>
              {selectedNewStatus === "IN_PROGRESS" && (
                <small className="text-gray-500 mt-1 block">
                  Bắt buộc chọn kỹ thuật viên cho trạng thái "Đang thực hiện"
                </small>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Appointment Modal */}
      <Modal
        title="Hủy lịch hẹn"
        open={cancelModalVisible}
        onOk={handleCancelWithReason}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason("");
          setAppointmentToCancel(null);
        }}
        okText="Hủy lịch hẹn"
        cancelText="Đóng"
        okButtonProps={{ 
          disabled: !cancelReason.trim(),
          danger: true 
        }}
        width={500}
      >
        {appointmentToCancel && (
          <div className="space-y-4">
            <div>
              <p>
                <strong>Lịch hẹn:</strong> {appointmentToCancel.booking_code}
              </p>
              <p>
                <strong>Trạng thái hiện tại:</strong>{" "}
                <Tag color={getStatusColor(appointmentToCancel.status)}>
                  {getStatusName(appointmentToCancel.status)}
                </Tag>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Lý do hủy lịch hẹn: <span className="text-red-500">*</span>
              </label>
              <Input.TextArea
                placeholder="Nhập lý do hủy lịch hẹn..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                maxLength={500}
                showCount
              />
              <small className="text-gray-500 mt-1 block">
                Vui lòng nhập lý do cụ thể để khách hàng có thể hiểu rõ
              </small>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement;
