import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Card,
  Flex,
  Typography,
  Modal,
  App,
  Form,
  Spin,
  Select,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { adminService } from "../../services/adminService";
import { toast } from "react-toastify";

const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ServiceList = () => {
  // (CẬP NHẬT) Thay đổi state cho tìm kiếm
  const [allServices, setAllServices] = useState([]); // Dữ liệu gốc từ API
  const [filteredServices, setFilteredServices] = useState([]); // Dữ liệu để hiển thị

  const [loading, setLoading] = useState(false);
  const [serviceCentersList, setServiceCentersList] = useState([]);

  // State cho Modal "Xem"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingService, setViewingService] = useState(null);

  // State cho Modal "Tạo mới"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const [createForm] = Form.useForm();

  // State cho Modal "Chỉnh sửa"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editForm] = Form.useForm();

  const { modal } = App.useApp();

  // Hàm định dạng ngày tháng
  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.log(e);
      return "Ngày không hợp lệ";
    }
  };

  // --- Fetch Dữ Liệu ---
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllServices({
        skip: 0,
        limit: 100,
        active_only: false,
      });

      if (res.data && res.data.success) {
        // (CẬP NHẬT) Set cho cả 2 state
        setAllServices(res.data.data);
        setFilteredServices(res.data.data);
      } else {
        toast.error(res.data.message || "Không thể tải danh sách dịch vụ.");
      }
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ:", error);
      toast.error("Đã xảy ra lỗi máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const centersRes = await adminService.getAllServiceCenters();
      if (centersRes.data.success) {
        setServiceCentersList(centersRes.data.data);
      } else {
        toast.warn("Không thể tải danh sách trung tâm dịch vụ.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi tải dữ liệu trung tâm.");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchSupportData();
  }, []);

  // --- (MỚI) Xử lý Tìm kiếm ---
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    // Luôn lọc từ 'allServices' (dữ liệu gốc)
    const filtered = allServices.filter(
      (service) =>
        (service.code || "").toLowerCase().includes(value) ||
        (service.name || "").toLowerCase().includes(value) ||
        (service.category || "").toLowerCase().includes(value) ||
        (service.description || "").toLowerCase().includes(value)
    );
    setFilteredServices(filtered);
  };

  // --- Xử lý Modal "Xem" ---
  const handleViewClick = (record) => {
    setViewingService(record);
    setIsViewModalOpen(true);
  };
  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setViewingService(null);
  };

  // --- Xử lý Modal "Tạo mới" ---
  const showCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };
  const handleCreateService = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateFormLoading(true);

      const dataToSend = {
        ...values,
        base_price: Number(values.base_price) || 0,
        estimated_duration_hours: Number(values.estimated_duration_hours) || 0,
      };

      await adminService.createService(dataToSend);
      toast.success("Tạo dịch vụ mới thành công!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      await fetchServices(); // Tải lại (đã tự động reset search)
    } catch (errorInfo) {
      console.error("Lỗi khi tạo:", errorInfo);
      toast.error(errorInfo.response?.data?.message || "Tạo mới thất bại.");
    } finally {
      setCreateFormLoading(false);
    }
  };

  // --- Xử lý Modal "Sửa" ---
  const handleEditClick = (record) => {
    setEditingService(record);
    editForm.setFieldsValue({
      ...record,
      base_price: parseFloat(record.base_price) || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingService(null);
    editForm.resetFields();
  };

  const handleUpdateService = async () => {
    try {
      const values = await editForm.validateFields();
      setEditFormLoading(true);

      const dataToSend = {
        ...values,
        base_price: Number(values.base_price) || 0,
        estimated_duration_hours: Number(values.estimated_duration_hours) || 0,
      };

      await adminService.updateService(editingService.id, dataToSend);
      toast.success("Cập nhật dịch vụ thành công!");
      setIsEditModalOpen(false);
      setEditingService(null);
      await fetchServices(); // Tải lại (đã tự động reset search)
    } catch (errorInfo) {
      console.error("Lỗi khi cập nhật:", errorInfo);
      toast.error(errorInfo.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setEditFormLoading(false);
    }
  };

  // --- Xử lý Vô hiệu hóa ---
  const handleDeactivateClick = (record) => {
    modal.confirm({
      title: `Vô hiệu hóa dịch vụ?`,
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn vô hiệu hóa dịch vụ "${record.name}"?`,
      okText: "Vô hiệu hóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          await adminService.deactivateService(record.id);
          toast.success("Vô hiệu hóa thành công!");
          await fetchServices();
        } catch (error) {
          console.error("Lỗi khi vô hiệu hóa:", error);
          toast.error(error.response?.data?.message || "Vô hiệu hóa thất bại.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // --- Xử lý Kích hoạt ---
  const handleRestoreClick = (record) => {
    modal.confirm({
      title: `Kích hoạt lại dịch vụ?`,
      icon: <ReloadOutlined style={{ color: "#52c41a" }} />,
      content: `Bạn có chắc chắn muốn kích hoạt lại dịch vụ "${record.name}"?`,
      okText: "Kích hoạt",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          await adminService.restoreService(record.id);
          toast.success("Kích hoạt lại thành công!");
          await fetchServices();
        } catch (error) {
          console.error("Lỗi khi kích hoạt:", error);
          toast.error(error.response?.data?.message || "Kích hoạt thất bại.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // --- Helper render chi tiết ---
  const DetailItem = ({ title, content }) => (
    <div style={{ marginBottom: 12 }}>
      <Text style={{ color: "rgba(0, 0, 0, 0.45)", display: "block" }}>
        {title}
      </Text>
      <Text strong>{content || "N/A"}</Text>
    </div>
  );

  // --- Cấu hình Cột ---
  const columns = [
    {
      title: "Mã Dịch vụ",
      dataIndex: "code",
      key: "code",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Loại dịch vụ",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Giá (VND)",
      dataIndex: "base_price",
      key: "base_price",
      render: (priceStr) =>
        priceStr ? parseFloat(priceStr).toLocaleString("vi-VN") : "N/A",
    },
    {
      title: "Thời gian (giờ)",
      dataIndex: "estimated_duration_hours",
      key: "estimated_duration_hours",
      render: (hours) => (hours ? `${hours} giờ` : "N/A"),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "volcano"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#1890ff" }} />}
            style={{ padding: 0 }}
            onClick={() => handleViewClick(record)}
          >
            Xem
          </Button>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#faad14" }} />}
            style={{ padding: 0 }}
            onClick={() => handleEditClick(record)}
          >
            Sửa
          </Button>
          {record.is_active ? (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
              onClick={() => handleDeactivateClick(record)}
            >
              Vô hiệu hóa
            </Button>
          ) : (
            <Button
              type="text"
              icon={<ReloadOutlined style={{ color: "#52c41a" }} />}
              style={{ padding: 0, color: "#52c41a" }}
              onClick={() => handleRestoreClick(record)}
            >
              Kích hoạt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: "8px" }}>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 24 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Danh sách dịch vụ
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Thêm dịch vụ mới
          </Button>
        </Flex>

        {/* (CẬP NHẬT) Thêm onChange cho Search */}
        <div style={{ marginBottom: 24 }}>
          <Search
            placeholder="Tìm theo mã, tên, loại, mô tả..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
            onChange={handleSearch}
          />
        </div>

        {/* (CẬP NHẬT) dataSource trỏ về filteredServices */}
        <Table
          columns={columns}
          dataSource={filteredServices}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* --- Modal Xem Chi Tiết --- */}
      {viewingService && (
        <Modal
          title={`Chi tiết dịch vụ: ${viewingService.name}`}
          open={isViewModalOpen}
          onCancel={handleViewCancel}
          destroyOnClose
          footer={[
            <Button key="close" onClick={handleViewCancel}>
              Đóng
            </Button>,
          ]}
          width={700}
        >
          <Flex gap={24}>
            {/* Cột trái */}
            <Flex vertical style={{ flex: 1 }}>
              <DetailItem title="Mã Dịch vụ" content={viewingService.code} />
              <DetailItem title="Tên Dịch vụ" content={viewingService.name} />
              <DetailItem
                title="Loại Dịch vụ"
                content={viewingService.category}
              />
              <DetailItem title="Mô tả" content={viewingService.description} />
            </Flex>
            {/* Cột phải */}
            <Flex vertical style={{ flex: 1 }}>
              <DetailItem
                title="Giá cơ bản"
                content={`${parseFloat(
                  viewingService.base_price
                ).toLocaleString("vi-VN")} VND`}
              />
              <DetailItem
                title="Thời gian dự kiến"
                content={`${viewingService.estimated_duration_hours} giờ`}
              />
              <DetailItem
                title="Trạng thái"
                content={viewingService.is_active ? "Đang hoạt động" : "Ngưng"}
              />
              <DetailItem
                title="Ngày tạo"
                content={formatDateTime(viewingService.created_at)}
              />
            </Flex>
          </Flex>
        </Modal>
      )}

      {/* --- Modal Tạo Mới --- */}
      <Modal
        title="Tạo dịch vụ mới"
        open={isCreateModalOpen}
        onOk={handleCreateService}
        onCancel={handleCreateCancel}
        confirmLoading={createFormLoading}
        destroyOnClose
        width={700}
      >
        <Spin spinning={createFormLoading}>
          <Form form={createForm} layout="vertical" name="create_service_form">
            {/* ... (Nội dung form không đổi) ... */}
            <Flex gap={16}>
              <Form.Item
                name="code"
                label="Mã Dịch vụ"
                rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="Ví dụ: SVC001" />
              </Form.Item>
              <Form.Item
                name="name"
                label="Tên Dịch vụ"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                style={{ flex: 2 }}
              >
                <Input placeholder="Ví dụ: Bảo dưỡng pin" />
              </Form.Item>
            </Flex>
            <Flex gap={16}>
              <Form.Item
                name="service_center_id"
                label="Trung tâm Dịch vụ"
                rules={[
                  { required: true, message: "Vui lòng chọn trung tâm!" },
                ]}
                style={{ flex: 1 }}
              >
                <Select
                  placeholder="Chọn trung tâm"
                  showSearch
                  optionFilterProp="children"
                >
                  {serviceCentersList.map((center) => (
                    <Option key={center.id} value={center.id}>
                      {center.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="category"
                label="Loại Dịch vụ"
                rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn loại dịch vụ">
                  <Option value="REPAIR">REPAIR</Option>
                  <Option value="INSPECTION">INSPECTION</Option>
                  <Option value="MAINTENANCE">MAINTENANCE</Option>
                </Select>
              </Form.Item>
            </Flex>
            <Flex gap={16}>
              <Form.Item
                name="base_price"
                label="Giá cơ bản (VND)"
                rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
              <Form.Item
                name="estimated_duration_hours"
                label="Thời gian dự kiến (giờ)"
                rules={[{ required: true, message: "Vui lòng nhập giờ!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Flex>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <TextArea rows={3} placeholder="Mô tả chi tiết dịch vụ" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* --- Modal Chỉnh Sửa --- */}
      <Modal
        title="Chỉnh sửa Dịch vụ"
        open={isEditModalOpen}
        onOk={handleUpdateService}
        onCancel={handleEditCancel}
        confirmLoading={editFormLoading}
        destroyOnClose
        width={700}
      >
        <Spin spinning={editFormLoading}>
          <Form form={editForm} layout="vertical" name="edit_service_form">
            {/* ... (Nội dung form không đổi) ... */}
            <Flex gap={16}>
              <Form.Item
                name="code"
                label="Mã Dịch vụ"
                rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="Ví dụ: SVC001" disabled />
              </Form.Item>
              <Form.Item
                name="name"
                label="Tên Dịch vụ"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                style={{ flex: 2 }}
              >
                <Input placeholder="Ví dụ: Bảo dưỡng pin" />
              </Form.Item>
            </Flex>
            <Flex gap={16}>
              <Form.Item
                name="service_center_id"
                label="Trung tâm Dịch vụ"
                rules={[
                  { required: true, message: "Vui lòng chọn trung tâm!" },
                ]}
                style={{ flex: 1 }}
              >
                <Select
                  placeholder="Chọn trung tâm"
                  showSearch
                  optionFilterProp="children"
                >
                  {serviceCentersList.map((center) => (
                    <Option key={center.id} value={center.id}>
                      {center.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="category"
                label="Loại Dịch vụ"
                rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn loại dịch vụ">
                  <Option value="REPAIR">REPAIR</Option>
                  <Option value="INSPECTION">INSPECTION</Option>
                  <Option value="MAINTENANCE">MAINTENANCE</Option>
                </Select>
              </Form.Item>
            </Flex>
            <Flex gap={16}>
              <Form.Item
                name="base_price"
                label="Giá cơ bản (VND)"
                rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
              <Form.Item
                name="estimated_duration_hours"
                label="Thời gian dự kiến (giờ)"
                rules={[{ required: true, message: "Vui lòng nhập giờ!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Flex>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <TextArea rows={3} placeholder="Mô tả chi tiết dịch vụ" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

// Bọc ServiceList bằng <App> để hook modal hoạt động
const ServiceListPage = () => (
  <App>
    <ServiceList />
  </App>
);

export default ServiceListPage;
