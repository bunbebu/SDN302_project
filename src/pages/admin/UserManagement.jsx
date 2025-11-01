import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Select,
  Spin,
  App,
  Card,
  Flex,
  Typography,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
// Sửa lại đường dẫn import (đi lên 2 cấp)
import { adminService } from "../../services/adminService.js";
import { toast } from "react-toastify";

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const UserManagement = () => {
  const [users, setUsers] = useState([]); // Danh sách gốc từ API
  const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách đã lọc
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();

  // --- State cho Modal Chỉnh Sửa ---
  const [form] = Form.useForm();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data); // Gán vào danh sách đã lọc
      } else {
        toast.error("Không thể tải danh sách người dùng!");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Xử lý Tìm kiếm (Client-side) ---
  const handleSearch = (value) => {
    if (!value) {
      setFilteredUsers(users); // Reset nếu ô tìm kiếm rỗng
      return;
    }
    const lowerCaseValue = value.toLowerCase();
    const filtered = users.filter(
      (user) =>
        (user.email && user.email.toLowerCase().includes(lowerCaseValue)) ||
        (user.first_name &&
          user.first_name.toLowerCase().includes(lowerCaseValue)) ||
        (user.last_name &&
          user.last_name.toLowerCase().includes(lowerCaseValue)) ||
        (user.phone && user.phone.toLowerCase().includes(lowerCaseValue))
    );
    setFilteredUsers(filtered);
  };

  // --- Xử lý Modal Sửa ---
  const handleEditClick = async (record) => {
    setEditingUserId(record.id);
    setIsEditModalOpen(true);
    setFormLoading(true);

    try {
      const response = await adminService.getUserById(record.id);
      if (response.data.success) {
        const userData = response.data.data;
        form.setFieldsValue({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          role: userData.role,
          is_active: userData.is_active,
        });
      } else {
        toast.error("Không thể tải thông tin người dùng này!");
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết user:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
      setIsEditModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingUserId(null);
    form.resetFields();
  };

  const handleUpdateUser = async () => {
    try {
      const values = await form.validateFields();
      const updateData = {
        role: values.role,
        is_active: values.is_active,
      };
      setFormLoading(true);
      await adminService.updateUser(editingUserId, updateData);
      toast.success("Cập nhật người dùng thành công!");
      setIsEditModalOpen(false);
      setEditingUserId(null);
      fetchUsers(); // Tải lại dữ liệu
    } catch (errorInfo) {
      console.error("Lỗi khi cập nhật:", errorInfo);
      if (errorInfo.response) {
        toast.error(errorInfo.response.data.message || "Cập nhật thất bại.");
      } else {
        toast.warn("Vui lòng điền đầy đủ thông tin!");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // --- Xử lý Kích hoạt User ---
  const handleActivateUser = (record) => {
    modal.confirm({
      title: `Kích hoạt người dùng?`,
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn kích hoạt lại tài khoản "${record.last_name} ${record.first_name}"?`,
      okText: "Kích hoạt",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          await adminService.activateUser(record.id);
          toast.success("Kích hoạt người dùng thành công!");
          fetchUsers(); // Tải lại dữ liệu
        } catch (error) {
          console.error("Lỗi khi kích hoạt:", error);
          toast.error(error.response?.data?.message || "Kích hoạt thất bại.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar_url} icon={<UserOutlined />} />
          <span>{`${record.last_name} ${record.first_name}`}</span>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "default";
        if (role === "ADMIN") color = "red";
        else if (role === "STAFF") color = "blue";
        else if (role === "TECHNICIAN") color = "purple";
        else if (role === "CUSTOMER") color = "green";
        return <Tag color={color}>{role ? role.toUpperCase() : "N/A"}</Tag>;
      },
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
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => handleEditClick(record)}
            style={{ padding: 0 }}
          >
            Edit
          </Button>

          {!record.is_active && (
            <Button
              type="text"
              icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              onClick={() => handleActivateUser(record)}
              style={{ padding: 0, marginLeft: 8 }}
            >
              Active User
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: "8px" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Quản lý người dùng
        </Title>
        {/* Nút "Thêm người dùng" đã bị xóa */}
      </Flex>

      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Tìm kiếm theo tên, email, hoặc số điện thoại..."
          enterButton={<SearchOutlined />}
          style={{ width: 350 }}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)} // Thêm onChange
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers} // Dùng danh sách đã lọc
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* --- Modal Chỉnh Sửa --- */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={isEditModalOpen}
        onOk={handleUpdateUser}
        onCancel={handleEditCancel}
        confirmLoading={formLoading}
        destroyOnClose
        width={600}
      >
        <Spin spinning={formLoading}>
          <Form form={form} layout="vertical" name="edit_user_form">
            <Flex gap={16}>
              <Form.Item name="first_name" label="Tên" style={{ flex: 1 }}>
                <Input disabled />
              </Form.Item>
              <Form.Item name="last_name" label="Họ" style={{ flex: 1 }}>
                <Input disabled />
              </Form.Item>
            </Flex>
            <Form.Item name="phone" label="Số điện thoại">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value="ADMIN">Admin</Option>
                <Option value="STAFF">Staff</Option>
                <Option value="TECHNICIAN">Technician</Option>
                <Option value="CUSTOMER">Customer</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="is_active"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </Card>
  );
};

export default UserManagement;
