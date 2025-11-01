import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  App, // Import App
  Card,
  Flex,
  Typography,
  Modal,
  Tag,
  Form,
  InputNumber,
  Select,
  Spin,
  Checkbox,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ToolOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined, // Icon cho nút Deactivate
  ExclamationCircleOutlined, // Icon cho Modal Confirm
  ReloadOutlined, // Icon cho nút Restore
} from "@ant-design/icons";
// Sửa lại đường dẫn import (đi lên 2 cấp)
import { adminService } from "../../services/adminService";
import { toast } from "react-toastify";

const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const PartManagement = () => {
  const [allParts, setAllParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp(); // Khởi tạo modal instance

  // --- State cho Modal Xem Chi Tiết ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPart, setViewingPart] = useState(null);

  // --- State cho Modal Thêm Mới ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);

  // --- State cho Modal Chỉnh Sửa ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [editingPartId, setEditingPartId] = useState(null);

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

  // Hàm định dạng tiền tệ
  const formatCurrency = (number) => {
    if (number === null || number === undefined) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(number);
  };

  // Hàm tải dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllParts();
      if (response.data.success) {
        setAllParts(response.data.data);
        setFilteredParts(response.data.data);
      } else {
        toast.error("Không thể tải danh sách phụ tùng!");
      }
    } catch (error) {
      console.error("Lỗi khi tải phụ tùng:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Xử lý Tìm kiếm (Client-side) ---
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = allParts.filter(
      (part) =>
        part.name.toLowerCase().includes(value) ||
        part.part_code.toLowerCase().includes(value) ||
        part.category.toLowerCase().includes(value) ||
        part.brand.toLowerCase().includes(value)
    );
    setFilteredParts(filtered);
  };

  // --- Xử lý Modal Xem Chi Tiết ---
  const handleViewClick = (record) => {
    setViewingPart(record);
    setIsViewModalOpen(true);
  };
  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setViewingPart(null);
  };

  // --- Xử lý Modal Thêm Mới ---
  const showCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const payload = {
        ...values,
        unit_price: parseFloat(values.unit_price) || 0,
        cost_price: parseFloat(values.cost_price) || 0,
        // min_stock_level đã được BỎ
      };

      setCreateLoading(true);
      const response = await adminService.createPart(payload);
      if (response.data.success) {
        toast.success("Thêm phụ tùng mới thành công!");
        setIsCreateModalOpen(false);
        createForm.resetFields();
        fetchData();
      } else {
        toast.error(response.data.message || "Thêm mới thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi thêm mới:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setCreateLoading(false);
    }
  };

  // --- Xử lý Modal Chỉnh Sửa ---
  const handleEditClick = (record) => {
    setEditingPartId(record.id);
    editForm.setFieldsValue({
      ...record,
      unit_price: record.unit_price.toString(),
      cost_price: record.cost_price.toString(),
      // min_stock_level đã được BỎ
    });
    setIsEditModalOpen(true);
  };
  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setEditingPartId(null);
  };
  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      const payload = {
        name: values.name,
        category: values.category,
        brand: values.brand,
        unit_price: parseFloat(values.unit_price) || 0,
        cost_price: parseFloat(values.cost_price) || 0,
        // min_stock_level đã được BỎ
        is_ev_specific: values.is_ev_specific,
      };

      setEditLoading(true);
      const response = await adminService.updatePart(editingPartId, payload);

      if (response.data.success) {
        toast.success("Cập nhật phụ tùng thành công!");
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditingPartId(null);
        fetchData();
      } else {
        toast.error(response.data.message || "Cập nhật thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setEditLoading(false);
    }
  };

  // --- Xử lý Vô hiệu hóa ---
  const handleDeactivateClick = (record) => {
    modal.confirm({
      title: `Vô hiệu hóa phụ tùng?`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          Bạn có chắc chắn muốn vô hiệu hóa phụ tùng{" "}
          <strong>{record.name}</strong> (Mã: {record.part_code})?
        </span>
      ),
      okText: "Vô hiệu hóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          await adminService.deactivatePart(record.id);
          toast.success("Vô hiệu hóa phụ tùng thành công!");
          fetchData();
        } catch (error) {
          console.error("Lỗi khi vô hiệu hóa:", error);
          toast.error(error.response?.data?.message || "Vô hiệu hóa thất bại.");
          setLoading(false);
        }
      },
    });
  };

  // --- Xử lý Khôi phục ---
  const handleRestoreClick = (record) => {
    modal.confirm({
      title: `Khôi phục phụ tùng?`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          Bạn có chắc chắn muốn khôi phục phụ tùng{" "}
          <strong>{record.name}</strong> (Mã: {record.part_code})?
        </span>
      ),
      okText: "Khôi phục",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          await adminService.restorePart(record.id);
          toast.success("Khôi phục phụ tùng thành công!");
          fetchData();
        } catch (error) {
          console.error("Lỗi khi khôi phục:", error);
          toast.error(error.response?.data?.message || "Khôi phục thất bại.");
          setLoading(false);
        }
      },
    });
  };

  // --- Cấu hình Cột ---
  const columns = [
    {
      title: "Mã Phụ Tùng",
      dataIndex: "part_code",
      key: "part_code",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Tên Phụ Tùng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Danh Mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Giá Bán (VND)",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (price) => formatCurrency(price),
    },
    // {
    //   title: "Tồn Kho Tối Thiểu", // Đã BỎ
    //   dataIndex: "min_stock_level",
    //   key: "min_stock_level",
    // },
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
      width: 150,
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
              Khôi phục
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Hàm helper để render một mục chi tiết
  const DetailItem = ({
    title,
    content,
    isTag = false,
    tagColor = "default",
  }) => (
    <div style={{ marginBottom: 12 }}>
      <Text style={{ color: "rgba(0, 0, 0, 0.45)", display: "block" }}>
        {title}
      </Text>
      {isTag ? (
        <Tag color={tagColor}>{content}</Tag>
      ) : (
        <Text strong>{content || "N/A"}</Text>
      )}
    </div>
  );

  return (
    <Card bordered={false} style={{ borderRadius: "8px" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Quản lý Phụ tùng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Thêm Phụ Tùng
        </Button>
      </Flex>

      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Tìm theo Mã, Tên, Danh mục, Hãng..."
          prefix={<SearchOutlined />}
          style={{ width: 400 }}
          // ĐÃ THAY ĐỔI: onSearch -> onChange
          onChange={(e) => handleSearch(e)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredParts}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* --- Modal Xem Chi Tiết --- */}
      {viewingPart && (
        <Modal
          title={`Chi tiết Phụ tùng: ${viewingPart.name}`}
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
              <DetailItem title="ID Phụ tùng" content={viewingPart.id} />
              <DetailItem title="Mã Phụ tùng" content={viewingPart.part_code} />
              <DetailItem title="Tên" content={viewingPart.name} />
              <DetailItem title="Danh mục" content={viewingPart.category} />
              <DetailItem title="Hãng" content={viewingPart.brand} />
              <DetailItem
                title="Ngày tạo"
                content={formatDateTime(viewingPart.created_at)}
              />
            </Flex>
            {/* Cột phải */}
            <Flex vertical style={{ flex: 1 }}>
              <DetailItem
                title="Giá bán"
                content={formatCurrency(viewingPart.unit_price)}
              />
              <DetailItem
                title="Giá nhập"
                content={formatCurrency(viewingPart.cost_price)}
              />
              <DetailItem
                title="Tồn kho tối thiểu"
                content={viewingPart.min_stock_level}
              />
              <DetailItem
                title="Chuyên cho EV"
                content={viewingPart.is_ev_specific ? "Có" : "Không"}
                isTag
                tagColor={viewingPart.is_ev_specific ? "cyan" : "default"}
              />
              <DetailItem
                title="Trạng thái"
                content={viewingPart.is_active ? "Active" : "Inactive"}
                isTag
                tagColor={viewingPart.is_active ? "green" : "volcano"}
              />

              <DetailItem
                title="Cập nhật lần cuối"
                content={formatDateTime(viewingPart.updated_at)}
              />
            </Flex>
          </Flex>
        </Modal>
      )}

      {/* --- Modal Thêm Mới --- */}
      <Modal
        title="Thêm Phụ Tùng Mới"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={handleCreateCancel}
        confirmLoading={createLoading}
        destroyOnClose
      >
        <Spin spinning={createLoading}>
          <Form form={createForm} layout="vertical" name="create_part_form">
            <Form.Item
              name="part_code"
              label="Mã Phụ Tùng"
              rules={[
                { required: true, message: "Vui lòng nhập mã phụ tùng!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên Phụ Tùng"
              rules={[
                { required: true, message: "Vui lòng nhập tên phụ tùng!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Flex gap={16}>
              <Form.Item
                name="category"
                label="Danh Mục"
                rules={[{ required: true, message: "Vui lòng nhập danh mục!" }]}
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="brand"
                label="Hãng"
                rules={[{ required: true, message: "Vui lòng nhập hãng!" }]}
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
            </Flex>
            <Flex gap={16}>
              <Form.Item
                name="unit_price"
                label="Giá Bán (VND)"
                rules={[{ required: true, message: "Vui lòng nhập giá bán!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="cost_price"
                label="Giá Nhập (VND)"
                rules={[{ required: true, message: "Vui lòng nhập giá nhập!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Flex>
            {/* BỎ Form.Item min_stock_level */}
            <Flex gap={16}>
              <Form.Item
                name="is_ev_specific"
                valuePropName="checked"
                initialValue={false}
              >
                <Checkbox>Chuyên cho xe EV</Checkbox>
              </Form.Item>
              <Form.Item
                name="is_active"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Kích hoạt</Checkbox>
              </Form.Item>
            </Flex>
          </Form>
        </Spin>
      </Modal>

      {/* --- Modal Chỉnh Sửa --- */}
      <Modal
        title="Chỉnh Sửa Phụ Tùng"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        confirmLoading={editLoading}
        destroyOnClose
      >
        <Spin spinning={editLoading}>
          <Form form={editForm} layout="vertical" name="edit_part_form">
            {/* Mã Phụ tùng không cho sửa, chỉ hiển thị */}
            <Form.Item name="part_code" label="Mã Phụ Tùng">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên Phụ Tùng"
              rules={[
                { required: true, message: "Vui lòng nhập tên phụ tùng!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Flex gap={16}>
              <Form.Item
                name="category"
                label="Danh Mục"
                rules={[{ required: true, message: "Vui lòng nhập danh mục!" }]}
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="brand"
                label="Hãng"
                rules={[{ required: true, message: "Vui lòng nhập hãng!" }]}
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
            </Flex>
            <Flex gap={16}>
              <Form.Item
                name="unit_price"
                label="Giá Bán (VND)"
                rules={[{ required: true, message: "Vui lòng nhập giá bán!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="cost_price"
                label="Giá Nhập (VND)"
                rules={[{ required: true, message: "Vui lòng nhập giá nhập!" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Flex>
            {/* BỎ Form.Item min_stock_level */}
            <Form.Item name="is_ev_specific" valuePropName="checked">
              <Checkbox>Chuyên cho xe EV</Checkbox>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </Card>
  );
};

export default PartManagement;
