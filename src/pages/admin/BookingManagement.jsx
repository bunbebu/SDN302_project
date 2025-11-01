import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  DatePicker,
  Select,
  Card,
  Flex,
  Typography,
  App,
  Modal,
  Descriptions,
  List,
  Spin, // Đã import
} from "antd";
import { PlusOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { adminService } from "../../services/adminService"; // Sửa đường dẫn nếu cần
import { toast } from "react-toastify";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

// Hàm tạo map (object) từ mảng để tra cứu nhanh
const createDataMap = (data, keyField, valueField) => {
  const map = {};
  data.forEach((item) => {
    map[item[keyField]] = item[valueField];
  });
  return map;
};

// Hàm định dạng ngày
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Hàm định dạng trạng thái
const formatStatus = (status) => {
  const statusMap = {
    PENDING: { color: "gold", text: "Chờ xác nhận" },
    CONFIRMED: { color: "blue", text: "Đã xác nhận" },
    IN_PROGRESS: { color: "geekblue", text: "Đang tiến hành" },
    COMPLETED: { color: "green", text: "Hoàn thành" },
    CANCELLED: { color: "volcano", text: "Đã hủy" },
  };
  const s = statusMap[status] || { color: "default", text: status || "N/A" };
  return <Tag color={s.color}>{s.text.toUpperCase()}</Tag>;
};

const BookingManagement = () => {
  // State cho dữ liệu
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho dữ liệu map
  const [usersMap, setUsersMap] = useState({});
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [servicesMap, setServicesMap] = useState({});
  const [centersList, setCentersList] = useState([]);

  // State cho filters (Server-side)
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDates, setFilterDates] = useState(null);
  const [filterCenter, setFilterCenter] = useState(null);

  // State cho search (Client-side)
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Modal "Xem"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [viewModalLoading, setViewModalLoading] = useState(false);

  // --- Fetch Dữ Liệu ---
  const fetchBookings = async () => {
    setLoading(true);
    const params = {
      skip: 0,
      limit: 200,
      status: filterStatus || undefined,
      service_center_id: filterCenter || undefined,
      start_date: filterDates ? filterDates[0].toISOString() : undefined,
      end_date: filterDates ? filterDates[1].toISOString() : undefined,
    };
    try {
      const res = await adminService.getAllAppointments(params);
      if (res.data.success) {
        setAllBookings(res.data.data);
        applyClientSearch(searchTerm, res.data.data);
      } else {
        toast.error("Không thể tải danh sách lịch hẹn.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi tải lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu phụ
  const fetchSupportData = async () => {
    try {
      const [usersRes, vehiclesRes, servicesRes, centersRes] =
        await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllVehicles(),
          adminService.getAllServices({ active_only: false }),
          adminService.getAllServiceCenters(),
        ]);

      if (usersRes.data.success) {
        // (CẬP NHẬT) Ghép first_name và last_name
        const userMapData = usersRes.data.data.map((user) => ({
          ...user,
          full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        }));
        setUsersMap(createDataMap(userMapData, "id", "full_name"));
      }
      if (vehiclesRes.data.success) {
        setVehiclesMap(
          createDataMap(vehiclesRes.data.data, "id", "license_plate")
        );
      }
      if (servicesRes.data.success) {
        setServicesMap(createDataMap(servicesRes.data.data, "id", "name"));
      }
      if (centersRes.data.success) {
        setCentersList(centersRes.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.warn("Lỗi khi tải dữ liệu phụ (người dùng, xe...).");
    }
  };

  useEffect(() => {
    fetchSupportData();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, filterDates, filterCenter]);

  // --- Xử lý Tìm kiếm (Client-side) ---
  const applyClientSearch = (value, data) => {
    const lowerValue = value.toLowerCase();
    const filtered = data.filter(
      (booking) =>
        (booking.booking_code || "").toLowerCase().includes(lowerValue) ||
        (usersMap[booking.user_id] || "").toLowerCase().includes(lowerValue) ||
        (vehiclesMap[booking.vehicle_id] || "")
          .toLowerCase()
          .includes(lowerValue)
    );
    setFilteredBookings(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyClientSearch(value, allBookings);
  };

  // --- Xử lý Modal "Xem" ---
  const handleViewClick = async (record) => {
    setIsViewModalOpen(true);
    setViewModalLoading(true);
    setViewingBooking(record);

    try {
      const userRes = await adminService.getUserById(record.user_id);

      if (userRes.data.success) {
        const userData = userRes.data.data;
        // (CẬP NHẬT) Ghép first_name và last_name
        const fullName = `${userData.first_name || ""} ${
          userData.last_name || ""
        }`.trim();

        setViewingBooking((prev) => ({
          ...prev,
          customer_full_name: fullName, // Sử dụng tên đã ghép
          customer_phone: userData.phone,
          customer_email: userData.email,
        }));
      } else {
        toast.error("Không thể tải chi tiết khách hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi getUserById:", error);
      // Đây là lỗi sẽ xảy ra nếu API không tìm thấy user_id của khách hàng
      toast.error(
        `Không tìm thấy chi tiết khách hàng (ID: ${record.user_id}).`
      );
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setViewingBooking(null);
  };
  const columns = [
    {
      title: "Mã Hẹn",
      dataIndex: "booking_code",
      key: "booking_code",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Khách hàng",
      dataIndex: "user_id",
      key: "user_id",
      // Map này có thể chỉ chứa Admin/Staff, nên sẽ hiển thị 'N/A'
      render: (userId) => usersMap[userId] || "N/A",
    },
    {
      title: "Phương tiện",
      dataIndex: "vehicle_id",
      key: "vehicle_id",
      render: (vehicleId) => vehiclesMap[vehicleId] || `ID: ${vehicleId}`,
    },
    {
      title: "Dịch vụ",
      dataIndex: "appointment_services",
      key: "appointment_services",
      render: (services) => `${services?.length || 0} dịch vụ`,
    },
    {
      title: "Thời gian hẹn",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (date) => formatDateTime(date),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status) => formatStatus(status),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: "#1890ff" }} />}
          style={{ padding: 0 }}
          onClick={() => handleViewClick(record)}
        >
          Xem
        </Button>
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
            Quản lý lịch hẹn
          </Title>
        </Flex>

        <Flex gap={16} wrap="wrap" style={{ marginBottom: 24 }}>
          <Search
            placeholder="Tìm theo mã hẹn, khách hàng, biển số..."
            prefix={<SearchOutlined />}
            style={{ width: 350 }}
            onChange={handleSearchChange}
            allowClear
          />
          <RangePicker
            style={{ minWidth: 250 }}
            onChange={(dates) => setFilterDates(dates)}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 220 }}
            onChange={(value) => setFilterStatus(value)}
            allowClear
          >
            <Option value="PENDING">Chờ xác nhận</Option>
            <Option value="CONFIRMED">Đã xác nhận</Option>
            <Option value="IN_PROGRESS">Đang tiến hành</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
          <Select
            placeholder="Lọc theo trung tâm"
            style={{ width: 220 }}
            onChange={(value) => setFilterCenter(value)}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {centersList.map((center) => (
              <Option key={center.id} value={center.id}>
                {center.name}
              </Option>
            ))}
          </Select>
        </Flex>

        <Table
          columns={columns}
          dataSource={filteredBookings}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* --- Modal Xem Chi Tiết --- */}
      {viewingBooking && (
        <Modal
          title={`Chi tiết Lịch hẹn: ${viewingBooking.booking_code}`}
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
          <Spin spinning={viewModalLoading}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Trạng thái">
                {formatStatus(viewingBooking.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ưu tiên">
                {viewingBooking.priority}
              </Descriptions.Item>

              {/* (CẬP NHẬT) Hiển thị tên đã ghép */}
              <Descriptions.Item label="Khách hàng">
                {viewingBooking.customer_full_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT Khách hàng">
                {viewingBooking.customer_phone || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Phương tiện">
                {vehiclesMap[viewingBooking.vehicle_id] || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email Khách hàng">
                {viewingBooking.customer_email || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày hẹn">
                {formatDateTime(viewingBooking.scheduled_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDateTime(viewingBooking.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú của khách" span={2}>
                {viewingBooking.notes || "Không có ghi chú."}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>
              Dịch vụ đã đặt
            </Title>
            <List
              bordered
              dataSource={viewingBooking.appointment_services}
              locale={{ emptyText: "Không có dịch vụ nào" }}
              renderItem={(item) => (
                <List.Item>
                  {servicesMap[item.service_id] || `ID: ${item.service_id}`}
                </List.Item>
              )}
            />
          </Spin>
        </Modal>
      )}
    </>
  );
};

// Bọc component bằng <App>
const BookingManagementPage = () => (
  <App>
    <BookingManagement />
  </App>
);

export default BookingManagementPage;
