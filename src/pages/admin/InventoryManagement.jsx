import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  App,
  Card,
  Flex,
  Typography,
  Modal,
  Tag,
  Select,
  Form,
  InputNumber,
  DatePicker,
  Spin,
  Switch, // Thêm Switch component
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  ShopOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  WarningOutlined, // Icon cho Low Stock
} from "@ant-design/icons";
// Sửa lại đường dẫn import (đi lên 2 cấp)
import { adminService } from "../../services/adminService";
import { toast } from "react-toastify";

const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const InventoryManagement = () => {
  // --- State cho dữ liệu và loading ---
  const [allInventory, setAllInventory] = useState([]); // Dữ liệu gốc từ API
  const [filteredInventory, setFilteredInventory] = useState([]); // Dữ liệu đã lọc (cho search)
  const [loading, setLoading] = useState(false);
  const [partsMap, setPartsMap] = useState({});
  const [serviceCentersMap, setServiceCentersMap] = useState({});
  const [partsList, setPartsList] = useState([]); // Dùng cho dropdown
  const [serviceCentersList, setServiceCentersList] = useState([]); // Dùng cho dropdown

  const [filterCenterId, setFilterCenterId] = useState(null); // State cho Filter Center
  const [filterPartId, setFilterPartId] = useState(null); // State cho Filter Part
  const [showLowStockOnly, setShowLowStockOnly] = useState(false); // (MỚI) State cho Low Stock

  // --- State cho Modal "Xem" ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingInventory, setViewingInventory] = useState(null);

  // --- State cho Modal "Tạo mới" ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const [createForm] = Form.useForm();

  // --- State cho Modal "Chỉnh sửa" ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [editForm] = Form.useForm();

  const { modal } = App.useApp(); // Thêm hook modal để xác nhận

  // Hàm tạo map (object) từ mảng để tra cứu nhanh
  const createDataMap = (data, keyField, valueField) => {
    const map = {};
    data.forEach((item) => {
      map[item[keyField]] = item[valueField];
    });
    return map;
  };

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
      console.error(e); // Ghi lại lỗi
      return "Ngày không hợp lệ";
    }
  };

  // --- Fetch dữ liệu ---
  // (CẬP NHẬT) fetchInventory giờ ưu tiên lowStock
  const fetchInventory = async (centerId, partId, lowStock) => {
    setLoading(true);
    let data = [];
    let success = false;
    try {
      let inventoryRes;
      if (lowStock) {
        // Case 0: Ưu tiên Low Stock
        inventoryRes = await adminService.getLowStockInventory();
        if (inventoryRes.data.success) {
          data = inventoryRes.data.data;
          success = true;
        }
      } else if (centerId && partId) {
        // Case 1: Lọc theo Center, rồi lọc client-side theo Part
        inventoryRes = await adminService.getInventoryByServiceCenter(centerId);
        if (inventoryRes.data.success) {
          data = inventoryRes.data.data.filter(
            (item) => item.part_id === partId
          );
          success = true;
        }
      } else if (centerId) {
        // Case 2: Chỉ lọc theo Center
        inventoryRes = await adminService.getInventoryByServiceCenter(centerId);
        if (inventoryRes.data.success) {
          data = inventoryRes.data.data;
          success = true;
        }
      } else if (partId) {
        // Case 3: Chỉ lọc theo Part
        inventoryRes = await adminService.getInventoryByPart(partId);
        if (inventoryRes.data.success) {
          data = inventoryRes.data.data;
          success = true;
        }
      } else {
        // Case 4: Lấy tất cả
        inventoryRes = await adminService.getAllInventory();
        if (inventoryRes.data.success) {
          data = inventoryRes.data.data;
          success = true;
        }
      }

      if (success) {
        setAllInventory(data);
        setFilteredInventory(data); // Cập nhật cả filtered list
      } else {
        toast.error("Không thể tải danh sách tồn kho!");
        setAllInventory([]);
        setFilteredInventory([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải inventory:", error);
      toast.error("Đã xảy ra lỗi khi tải tồn kho.");
      setAllInventory([]);
      setFilteredInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Tách hàm fetch dữ liệu phụ trợ (Parts, Centers)
  const fetchSupportData = async () => {
    try {
      const [partsRes, serviceCentersRes] = await Promise.all([
        adminService.getAllParts(),
        adminService.getAllServiceCenters(),
      ]);

      // Xử lý Parts (cho Map và List)
      if (partsRes.data.success) {
        setPartsMap(createDataMap(partsRes.data.data, "id", "name"));
        setPartsList(partsRes.data.data); // Lưu list
      } else {
        toast.warn("Không thể tải danh sách phụ tùng.");
      }

      // Xử lý Service Centers (cho Map và List)
      if (serviceCentersRes.data.success) {
        setServiceCentersMap(
          createDataMap(serviceCentersRes.data.data, "id", "name")
        );
        setServiceCentersList(serviceCentersRes.data.data); // Lưu list
      } else {
        toast.warn("Không thể tải danh sách trung tâm.");
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu phụ trợ:", error);
      toast.error("Đã xảy ra lỗi tải dữ liệu phụ trợ.");
    }
  };

  // useEffect chỉ chạy 1 lần để lấy Parts và Centers
  useEffect(() => {
    fetchSupportData();
  }, []);

  // (CẬP NHẬT) useEffect giờ lắng nghe cả 3 filter
  useEffect(() => {
    fetchInventory(filterCenterId, filterPartId, showLowStockOnly);
    // Khi filter thay đổi, reset ô tìm kiếm
    handleSearch({ target: { value: "" } });
  }, [filterCenterId, filterPartId, showLowStockOnly]);

  // --- Xử lý Tìm kiếm ---
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    // Luôn lọc từ allInventory (là dữ liệu đã fetch theo filter)
    const filtered = allInventory.filter(
      (item) =>
        (partsMap[item.part_id] || "").toLowerCase().includes(value) ||
        (item.location_in_warehouse || "").toLowerCase().includes(value) ||
        (serviceCentersMap[item.service_center_id] || "")
          .toLowerCase()
          .includes(value)
    );
    setFilteredInventory(filtered);
  };

  // --- Xử lý Modal "Xem" ---
  const handleViewClick = (record) => {
    setViewingInventory(record);
    setIsViewModalOpen(true);
  };
  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setViewingInventory(null);
  };

  // --- Xử lý Modal "Tạo mới" ---
  const showCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };
  const handleCreateInventory = async () => {
    try {
      const values = await createForm.validateFields();
      const dataToSend = {
        ...values,
        last_restock_date: values.last_restock_date
          ? values.last_restock_date.toISOString()
          : null,
      };
      setCreateFormLoading(true);
      await adminService.createInventory(dataToSend);
      toast.success("Tạo tồn kho mới thành công!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      await fetchInventory(filterCenterId, filterPartId, showLowStockOnly); // Tải lại
    } catch (errorInfo) {
      console.error("Lỗi khi tạo:", errorInfo);
      toast.error(errorInfo.response?.data?.message || "Tạo mới thất bại.");
    } finally {
      setCreateFormLoading(false);
    }
  };

  // --- Xử lý Modal "Chỉnh sửa" ---
  const handleEditClick = (record) => {
    setEditingInventoryId(record.id);
    editForm.setFieldsValue({
      quantity_on_hand: record.quantity_on_hand,
      quantity_available: record.quantity_available,
      reorder_point: record.reorder_point,
      location_in_warehouse: record.location_in_warehouse,
    });
    setIsEditModalOpen(true);
  };
  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingInventoryId(null);
    editForm.resetFields();
  };
  const handleUpdateInventory = async () => {
    try {
      const values = await editForm.validateFields([
        "quantity_on_hand",
        "quantity_available",
        "reorder_point",
        "location_in_warehouse",
      ]);
      setFormLoading(true);
      await adminService.updateInventory(editingInventoryId, values);
      toast.success("Cập nhật tồn kho thành công!");
      setIsEditModalOpen(false);
      setEditingInventoryId(null);
      editForm.resetFields();
      await fetchInventory(filterCenterId, filterPartId, showLowStockOnly); // Tải lại
    } catch (errorInfo) {
      console.error("Lỗi khi cập nhật:", errorInfo);
      toast.error(errorInfo.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setFormLoading(false);
    }
  };

  // --- Xử lý Vô hiệu hóa ---
  const handleDeactivateClick = (record) => {
    modal.confirm({
      title: `Vô hiệu hóa mục tồn kho?`,
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn vô hiệu hóa phụ tùng "${
        partsMap[record.part_id] || "ID: " + record.part_id
      }" tại trung tâm "${
        serviceCentersMap[record.service_center_id] ||
        "ID: " + record.service_center_id
      }"?`,
      okText: "Vô hiệu hóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true); // Hiển thị loading trên bảng
          await adminService.deactivateInventory(record.id);
          toast.success("Vô hiệu hóa thành công!");
          await fetchInventory(filterCenterId, filterPartId, showLowStockOnly); // Tải lại
        } catch (error) {
          console.error("Lỗi khi vô hiệu hóa:", error);
          toast.error(error.response?.data?.message || "Vô hiệu hóa thất bại.");
        } finally {
          setLoading(false); // Luôn tắt loading
        }
      },
    });
  };

  const handleRestoreClick = (record) => {
    modal.confirm({
      title: `Kích hoạt lại mục tồn kho?`,
      icon: <ReloadOutlined style={{ color: "#52c41a" }} />, // Màu xanh lá
      content: `Bạn có chắc chắn muốn kích hoạt lại phụ tùng "${
        partsMap[record.part_id] || "ID: " + record.part_id
      }" tại trung tâm "${
        serviceCentersMap[record.service_center_id] ||
        "ID: " + record.service_center_id
      }"?`,
      okText: "Kích hoạt",
      okType: "primary", // Dùng 'primary' thay vì 'danger'
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true); // Hiển thị loading trên bảng
          // Gọi service mới
          await adminService.restoreInventory(record.id);
          toast.success("Kích hoạt lại thành công!");
          // Tải lại danh sách
          await fetchInventory(filterCenterId, filterPartId, showLowStockOnly);
        } catch (error) {
          console.error("Lỗi khi kích hoạt:", error);
          toast.error(error.response?.data?.message || "Kích hoạt thất bại.");
        } finally {
          setLoading(false); // Luôn tắt loading
        }
      },
    });
  };

  // --- Cấu hình Cột ---
  const columns = [
    {
      title: "Phụ tùng",
      dataIndex: "part_id",
      key: "part_id",
      render: (partId) => (
        <Space>
          <ShopOutlined />
          <strong>{partsMap[partId] || `ID: ${partId}`}</strong>
        </Space>
      ),
    },
    {
      title: "Trung tâm Dịch vụ",
      dataIndex: "service_center_id",
      key: "service_center_id",
      render: (centerId) => serviceCentersMap[centerId] || `ID: ${centerId}`,
    },
    {
      title: "SL Tồn kho",
      dataIndex: "quantity_on_hand",
      key: "quantity_on_hand",
      sorter: (a, b) => a.quantity_on_hand - b.quantity_on_hand,
    },
    {
      title: "SL Khả dụng",
      dataIndex: "quantity_available",
      key: "quantity_available",
      sorter: (a, b) => a.quantity_available - b.quantity_available,
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

          {/* (CẬP NHẬT) Giữ nguyên logic cũ */}
          {record.is_active && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
              onClick={() => handleDeactivateClick(record)}
            >
              Vô hiệu hóa
            </Button>
          )}

          {/* (MỚI) Thêm logic cho nút Kích hoạt */}
          {!record.is_active && (
            <Button
              type="text"
              icon={<ReloadOutlined style={{ color: "#52c41a" }} />}
              style={{ padding: 0, color: "#52c41a" }} // Thêm màu cho chữ
              onClick={() => handleRestoreClick(record)}
            >
              Kích hoạt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Helper render chi tiết
  const DetailItem = ({ title, content }) => (
    <div style={{ marginBottom: 12 }}>
      <Text style={{ color: "rgba(0, 0, 0, 0.45)", display: "block" }}>
        {title}
      </Text>
      <Text strong>{content || "N/A"}</Text>
    </div>
  );

  return (
    <Card bordered={false} style={{ borderRadius: "8px" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Quản lý Tồn kho
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Thêm Tồn kho
        </Button>
      </Flex>

      {/* Cập nhật khu vực Filter và Search */}
      <Flex gap={16} style={{ marginBottom: 24 }} wrap="wrap" align="center">
        <Search
          placeholder="Tìm theo tên phụ tùng, vị trí..."
          prefix={<SearchOutlined />}
          style={{ width: 350 }}
          onChange={handleSearch}
          allowClear
          disabled={showLowStockOnly} // (MỚI) Vô hiệu hóa khi xem Low Stock
        />
        <Select
          placeholder="Lọc theo Trung tâm Dịch vụ"
          style={{ width: 300 }}
          allowClear
          onChange={(value) => setFilterCenterId(value)}
          value={filterCenterId}
          disabled={showLowStockOnly} // (MỚI) Vô hiệu hóa khi xem Low Stock
        >
          <Option key="all-centers" value={null}>
            Tất cả trung tâm
          </Option>
          {serviceCentersList.map((center) => (
            <Option key={center.id} value={center.id}>
              {center.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Lọc theo Phụ tùng"
          style={{ width: 300 }}
          allowClear
          onChange={(value) => setFilterPartId(value)}
          value={filterPartId}
          showSearch
          optionFilterProp="children"
          disabled={showLowStockOnly} // (MỚI) Vô hiệu hóa khi xem Low Stock
        >
          <Option key="all-parts" value={null}>
            Tất cả phụ tùng
          </Option>
          {partsList.map((part) => (
            <Option key={part.id} value={part.id}>
              {part.name} (Mã: {part.part_code})
            </Option>
          ))}
        </Select>
        {/* (MỚI) Thêm Switch Low Stock */}
        <Space>
          <Switch
            checked={showLowStockOnly}
            onChange={(checked) => {
              setShowLowStockOnly(checked);
              // Khi bật Low Stock, xóa các filter khác
              if (checked) {
                setFilterCenterId(null);
                setFilterPartId(null);
              }
            }}
          />
          <Text style={{ color: showLowStockOnly ? "#faad14" : "inherit" }}>
            <WarningOutlined style={{ marginRight: 4 }} />
            Chỉ hiển thị sắp hết hàng
          </Text>
        </Space>
      </Flex>

      <Table
        columns={columns}
        dataSource={filteredInventory}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* --- Modal Xem Chi Tiết --- */}
      {viewingInventory && (
        <Modal
          title={`Chi tiết tồn kho`}
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
              <DetailItem
                title="Phụ tùng"
                content={
                  partsMap[viewingInventory.part_id] ||
                  `ID: ${viewingInventory.part_id}`
                }
              />
              <DetailItem
                title="Trung tâm Dịch vụ"
                content={
                  serviceCentersMap[viewingInventory.service_center_id] ||
                  `ID: ${viewingInventory.service_center_id}`
                }
              />
              <DetailItem
                title="Vị trí trong kho"
                content={viewingInventory.location_in_warehouse}
              />
              <DetailItem
                title="Trạng thái"
                content={
                  viewingInventory.is_active ? "Đang hoạt động" : "Ngưng"
                }
              />
            </Flex>

            {/* Cột phải */}
            <Flex vertical style={{ flex: 1 }}>
              <DetailItem
                title="Số lượng tồn kho"
                content={viewingInventory.quantity_on_hand}
              />
              <DetailItem
                title="Số lượng khả dụng"
                content={viewingInventory.quantity_available}
              />
              <DetailItem
                title="Ngưỡng đặt hàng lại"
                content={viewingInventory.reorder_point}
              />
              <DetailItem
                title="Ngày nhập kho cuối"
                content={formatDateTime(viewingInventory.last_restock_date)}
              />
            </Flex>
          </Flex>
        </Modal>
      )}

      {/* --- Modal Tạo Mới --- */}
      <Modal
        title="Thêm mục tồn kho mới"
        open={isCreateModalOpen}
        onOk={handleCreateInventory}
        onCancel={handleCreateCancel}
        confirmLoading={createFormLoading}
        destroyOnClose
        width={700}
      >
        <Spin spinning={createFormLoading}>
          <Form
            form={createForm}
            layout="vertical"
            name="create_inventory_form"
          >
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
                name="part_id"
                label="Phụ tùng"
                rules={[{ required: true, message: "Vui lòng chọn phụ tùng!" }]}
                style={{ flex: 1 }}
              >
                <Select
                  placeholder="Chọn phụ tùng"
                  showSearch
                  optionFilterProp="children"
                >
                  {partsList.map((part) => (
                    <Option key={part.id} value={part.id}>
                      {part.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Flex>
            <Flex gap={16}>
              <Form.Item
                name="quantity_on_hand"
                label="Số lượng tồn kho"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="quantity_available"
                label="Số lượng khả dụng"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Flex>
            <Flex gap={16}>
              <Form.Item
                name="reorder_point"
                label="Ngưỡng đặt hàng lại"
                rules={[{ required: true, message: "Vui lòng nhập ngưỡng!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="last_restock_date"
                label="Ngày nhập kho cuối"
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Flex>
            <Form.Item name="location_in_warehouse" label="Vị trí trong kho">
              <Input placeholder="Ví dụ: Kệ A, Hàng 3" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* --- Modal Chỉnh Sửa --- */}
      <Modal
        title="Chỉnh sửa Tồn kho"
        open={isEditModalOpen}
        onOk={handleUpdateInventory}
        onCancel={handleEditCancel}
        confirmLoading={formLoading}
        destroyOnClose
        width={700}
      >
        <Spin spinning={formLoading}>
          <Form form={editForm} layout="vertical" name="edit_inventory_form">
            <Flex gap={16}>
              <Form.Item
                name="quantity_on_hand"
                label="Số lượng tồn kho"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="quantity_available"
                label="Số lượng khả dụng"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Flex>
            <Form.Item
              name="reorder_point"
              label="Ngưỡng đặt hàng lại"
              rules={[{ required: true, message: "Vui lòng nhập ngưỡng!" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="location_in_warehouse" label="Vị trí trong kho">
              <Input placeholder="Ví dụ: Kệ A, Hàng 3" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </Card>
  );
};

export default InventoryManagement;
