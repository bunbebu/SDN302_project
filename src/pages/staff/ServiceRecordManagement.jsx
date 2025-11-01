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
  Modal,
  Card,
  Descriptions,
  List,
  Typography,
  Image,
  Avatar,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  CarOutlined,
  ToolOutlined,
  UserOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { serviceRecordService } from "../../services/serviceRecordService";
import { userService } from "../../services/userService";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const ServiceRecordManagement = () => {
  const [serviceRecords, setServiceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [statusUpdateModalVisible, setStatusUpdateModalVisible] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [recordToUpdate, setRecordToUpdate] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: "orange",
      IN_PROGRESS: "processing",
      COMPLETED: "success",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  // Get status name in Vietnamese
  const getStatusName = (status) => {
    const names = {
      PENDING: "Chờ xử lý",
      IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return names[status] || status;
  };

  // Fetch service records from API
  const fetchServiceRecords = async (params = {}) => {
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

      if (technicianFilter) {
        queryParams.technician_id = technicianFilter;
      }

      const response = await serviceRecordService.getServiceRecords(queryParams);

      if (response.data && response.data.success) {
        setServiceRecords(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.length,
          current: params.current || prev.current,
          pageSize: params.pageSize || prev.pageSize,
        }));
      } else {
        message.error("Không thể tải danh sách hồ sơ dịch vụ");
      }
    } catch (error) {
      console.error("Error fetching service records:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchServiceRecords();
    fetchTechnicians();
  }, [statusFilter, technicianFilter]);

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
    fetchServiceRecords({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    fetchServiceRecords({ current: 1 });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchServiceRecords();
    setSearchText("");
    setStatusFilter("");
    setTechnicianFilter("");
    message.success("Đã làm mới dữ liệu");
  };

  // View record details
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // Update service record status
  const handleUpdateStatus = (record) => {
    setRecordToUpdate(record);
    setSelectedNewStatus(null);
    setCancelReason("");
    setStatusUpdateModalVisible(true);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!recordToUpdate || !selectedNewStatus) {
      message.error('Vui lòng chọn trạng thái mới');
      return;
    }

    // Validate cancel reason for CANCELLED status
    if (selectedNewStatus === "CANCELLED" && !cancelReason.trim()) {
      message.error('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      const updateData = {
        status: selectedNewStatus,
      };

      // Add cancel_reason if cancelling
      if (selectedNewStatus === "CANCELLED") {
        updateData.cancel_reason = cancelReason.trim();
      }

      console.log('Updating service record status:', {
        id: recordToUpdate.id,
        data: updateData
      }); // Debug log

      const response = await serviceRecordService.updateServiceRecordStatus(
        recordToUpdate.id,
        updateData
      );

      if (response.data && response.data.success) {
        message.success("Cập nhật trạng thái thành công!");
        fetchServiceRecords();
        setStatusUpdateModalVisible(false);
        setSelectedNewStatus(null);
        setCancelReason("");
        setRecordToUpdate(null);
      } else {
        message.error("Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error response:", error.response?.data); // Debug log
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  // Get available status options based on current status
  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    };
    return statusFlow[currentStatus] || [];
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (text) => <Text strong>#{text}</Text>,
    },
    {
      title: "Lịch hẹn",
      dataIndex: "appointment_id",
      key: "appointment_id",
      width: 100,
      render: (id) => <Tag color="blue">APT-{id}</Tag>,
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "service_date",
      key: "service_date",
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
      title: "Kỹ thuật viên",
      key: "technician",
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Avatar 
            src={record.technician_avatar_url} 
            size="small"
            icon={<UserOutlined />}
          />
          <Text>{record.technician_name}</Text>
        </div>
      ),
    },
    {
      title: "Trung tâm",
      key: "service_center",
      render: (_, record) => (
        <div>
          <Text strong>{record.service_center?.name}</Text>
          <br />
          <Text type="secondary" size="small">
            {record.service_center?.code}
          </Text>
        </div>
      ),
    },
    {
      title: "Xe",
      dataIndex: "vehicle_id",
      key: "vehicle_id",
      render: (id) => (
        <Tag icon={<CarOutlined />} color="green">
          XE-{id}
        </Tag>
      ),
    },
    {
      title: "Phụ tùng",
      dataIndex: "used_parts",
      key: "used_parts_count",
      align: "center",
      render: (parts) => parts?.length || 0,
    },
    {
      title: "Tổng chi phí",
      dataIndex: "total_cost",
      key: "total_cost",
      render: (cost) => (
        <Text strong style={{ color: "#1890ff" }}>
          {parseFloat(cost).toLocaleString("vi-VN")} VND
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
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
          {record.status !== "COMPLETED" && record.status !== "CANCELLED" && (
            <Tooltip title="Cập nhật trạng thái">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleUpdateStatus(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Quản lý hồ sơ dịch vụ</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm mới
          </Button>
        </Space>
      </div>

      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <Search
          placeholder="Tìm kiếm theo ID hồ sơ..."
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
          <Option value="PENDING">Chờ xử lý</Option>
          <Option value="IN_PROGRESS">Đang thực hiện</Option>
          <Option value="COMPLETED">Hoàn thành</Option>
          <Option value="CANCELLED">Đã hủy</Option>
        </Select>

        <Select
          placeholder="Lọc theo kỹ thuật viên"
          style={{ width: 250 }}
          value={technicianFilter}
          onChange={setTechnicianFilter}
          allowClear
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {technicians.map((tech) => {
            const fullName = `${tech.last_name} ${tech.first_name}`.trim();
            return (
              <Option key={tech.id} value={tech.id}>
                {fullName} (KTV-{tech.id})
              </Option>
            );
          })}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={serviceRecords}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} hồ sơ`,
        }}
        onChange={handleTableChange}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <ToolOutlined />
            <span>Chi tiết hồ sơ dịch vụ #{selectedRecord?.id}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card title="Thông tin cơ bản" size="small">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="ID hồ sơ">
                  <Text strong>#{selectedRecord.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Lịch hẹn">
                  <Tag color="blue">APT-{selectedRecord.appointment_id}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedRecord.status)}>
                    {getStatusName(selectedRecord.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Xe">
                  <Tag icon={<CarOutlined />} color="green">
                    XE-{selectedRecord.vehicle_id}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày thực hiện">
                  {dayjs(selectedRecord.service_date).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {dayjs(selectedRecord.created_at).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedRecord.notes || "Không có ghi chú"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Technician & Service Center */}
            <div className="grid grid-cols-2 gap-4">
              <Card title="Kỹ thuật viên" size="small">
                <div className="flex items-center space-x-3">
                  <Avatar 
                    src={selectedRecord.technician_avatar_url} 
                    size={48}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <Text strong>{selectedRecord.technician_name}</Text>
                    <br />
                    <Text type="secondary">KTV-{selectedRecord.technician_id}</Text>
                  </div>
                </div>
              </Card>

              <Card title="Trung tâm dịch vụ" size="small">
                <div>
                  <Text strong>{selectedRecord.service_center?.name}</Text>
                  <br />
                  <Text type="secondary">{selectedRecord.service_center?.code}</Text>
                  <br />
                  <Text type="secondary">{selectedRecord.service_center?.address}</Text>
                  <br />
                  <Text type="secondary">{selectedRecord.service_center?.phone}</Text>
                </div>
              </Card>
            </div>

            {/* Used Parts */}
            <Card 
              title={`Phụ tùng đã sử dụng (${selectedRecord.used_parts?.length || 0})`} 
              size="small"
            >
              {selectedRecord.used_parts?.length > 0 ? (
                <List
                  dataSource={selectedRecord.used_parts}
                  renderItem={(part) => (
                    <List.Item>
                      <List.Item.Meta
                        title={part.part_name}
                        description={`Số lượng: ${part.quantity}`}
                      />
                      <Text strong style={{ color: "#1890ff" }}>
                        {parseFloat(part.total_price).toLocaleString("vi-VN")} VND
                      </Text>
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Chưa sử dụng phụ tùng nào</Text>
              )}
            </Card>

            {/* Service Photos */}
            <Card 
              title={`Ảnh dịch vụ (${selectedRecord.service_photos?.length || 0})`} 
              size="small"
            >
              {selectedRecord.service_photos?.length > 0 ? (
                <Image.PreviewGroup>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedRecord.service_photos.map((photo, index) => (
                      <Image
                        key={index}
                        width={150}
                        height={100}
                        src={photo.photo_url}
                        className="object-cover rounded"
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              ) : (
                <Text type="secondary">Chưa có ảnh dịch vụ</Text>
              )}
            </Card>

            {/* Total Cost */}
            <Card title="Tổng chi phí" size="small">
              <div className="text-center">
                <Text 
                  strong 
                  style={{ fontSize: "24px", color: "#1890ff" }}
                >
                  {parseFloat(selectedRecord.total_cost).toLocaleString("vi-VN")} VND
                </Text>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái phiếu dịch vụ"
        open={statusUpdateModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setStatusUpdateModalVisible(false);
          setSelectedNewStatus(null);
          setCancelReason("");
          setRecordToUpdate(null);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedNewStatus }}
        width={600}
      >
        {recordToUpdate && (
          <div className="space-y-4">
            <div>
              <p>
                <strong>Phiếu dịch vụ:</strong> #{recordToUpdate.id}
              </p>
              <p>
                <strong>Trạng thái hiện tại:</strong>{" "}
                <Tag color={getStatusColor(recordToUpdate.status)}>
                  {getStatusName(recordToUpdate.status)}
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
                {getAvailableStatuses(recordToUpdate.status).map((status) => (
                  <Option key={status} value={status}>
                    <Tag color={getStatusColor(status)}>
                      {getStatusName(status)}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </div>

            {selectedNewStatus === "CANCELLED" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lý do hủy phiếu dịch vụ: <span className="text-red-500">*</span>
                </label>
                <Input.TextArea
                  placeholder="Nhập lý do hủy phiếu dịch vụ..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  showCount
                />
                <small className="text-gray-500 mt-1 block">
                  Vui lòng nhập lý do cụ thể để ghi nhận
                </small>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceRecordManagement;