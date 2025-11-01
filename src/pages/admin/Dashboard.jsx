// src/pages/admin/Dashboard.jsx

import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Table,
  Tag,
  Typography,
  Spin,
  List,
  Avatar,
  Space,
  Flex, // (MỚI) Thêm Flex
} from "antd";
import {
  DollarCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  CarOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { adminService } from "../../services/adminService";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

// --- Dữ liệu và Màu sắc cho Biểu đồ Tròn ---
// (Không đổi)
const PIE_COLORS = {
  PENDING: "#faad14",
  CONFIRMED: "#1890ff",
  IN_PROGRESS: "#13c2c2",
  COMPLETED: "#52c41a",
  CANCELLED: "#f5222d",
};
const PIE_LABELS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang tiến hành",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

// --- (MỚI) Component KpiCard hiện đại ---
const KpiCard = ({ icon, title, value, color, backgroundColor }) => (
  <Card bordered={false} bodyStyle={{ padding: 20 }}>
    <Flex align="center" justify="space-between">
      <Flex vertical>
        <Text type="secondary" style={{ marginBottom: 4 }}>
          {title}
        </Text>
        <Title level={3} style={{ margin: 0 }}>
          {value}
        </Title>
      </Flex>
      <Avatar
        size={48}
        style={{ backgroundColor: backgroundColor, color: color }}
        icon={icon}
      />
    </Flex>
  </Card>
);

// --- Hàm Helper ---
// (Không đổi)
const createDataMap = (data, keyField, valueField) => {
  const map = {};
  if (Array.isArray(data)) {
    data.forEach((item) => {
      map[item[keyField]] =
        typeof valueField === "function" ? valueField(item) : item[valueField];
    });
  }
  return map;
};

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

const formatBookingStatus = (status) => {
  const s = PIE_LABELS[status] || status;
  const color = PIE_COLORS[status] || "default";
  return <Tag color={color}>{s.toUpperCase()}</Tag>;
};

// --- Component Dashboard ---
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    newBookings: 0,
    newCustomers: 0,
    inProgress: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  const [partsMap, setPartsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [servicesMap, setServicesMap] = useState({});
  const [centersMap, setCentersMap] = useState({});

  // --- Hàm Fetch Dữ Liệu ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        recordsRes,
        bookingsRes,
        recentBookingsRes,
        usersRes,
        lowStockRes,
        partsRes,
        vehiclesRes,
        servicesRes,
        centersRes,
      ] = await Promise.all([
        adminService.getAllServiceRecords(),
        adminService.getAllAppointments(),
        adminService.getAllAppointments({ limit: 5, skip: 0 }),
        adminService.getAllUsers({ limit: 1000, skip: 0 }),
        adminService.getLowStockInventory(),
        adminService.getAllParts({ limit: 1000, skip: 0 }),
        adminService.getAllVehicles({ limit: 1000, skip: 0 }),
        adminService.getAllServices({
          active_only: false,
          limit: 1000,
          skip: 0,
        }),
        adminService.getAllServiceCenters({ limit: 1000, skip: 0 }),
      ]);

      // (ĐÃ XÓA CONSOLE.LOG)
      const pMap = createDataMap(partsRes?.data?.data, "id", "name");
      const uMap = createDataMap(usersRes?.data?.data, "id", (user) =>
        `${user.first_name || ""} ${user.last_name || ""}`.trim()
      );
      const vMap = createDataMap(
        vehiclesRes?.data?.data,
        "id",
        "license_plate"
      );
      const sMap = createDataMap(servicesRes?.data?.data, "id", "name");
      const cMap = createDataMap(centersRes?.data?.data, "id", "name");

      // (ĐÃ XÓA CONSOLE.LOG)
      setPartsMap(pMap);
      setUsersMap(uMap);
      setVehiclesMap(vMap);
      setServicesMap(sMap);
      setCentersMap(cMap);

      // 3. Xử lý Dữ liệu Hồ sơ Dịch vụ (Doanh thu & Đang tiến hành)
      let totalRevenue = 0;
      let inProgressCount = 0;
      const dailyRevenue = {};
      const today = new Date();
      const last30Days = new Date(new Date().setDate(today.getDate() - 30));

      if (recordsRes?.data?.success && Array.isArray(recordsRes.data.data)) {
        recordsRes.data.data.forEach((record) => {
          if (record.status === "IN_PROGRESS") {
            inProgressCount++;
          }
          const recordDate = new Date(record.service_date);
          if (record.status === "COMPLETED" && recordDate >= last30Days) {
            const cost = parseFloat(record.total_cost || 0);
            totalRevenue += cost;
            const dateString = recordDate.toISOString().split("T")[0];
            dailyRevenue[dateString] = (dailyRevenue[dateString] || 0) + cost;
          }
        });
      }
      const revenueChartData = Object.keys(dailyRevenue)
        .map((date) => ({
          date: date.substring(5),
          doanhThu: dailyRevenue[date],
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      setRevenueData(revenueChartData);

      // 4. Xử lý Dữ liệu Lịch hẹn (Biểu đồ tròn & KPI)
      const statusCounts = {
        PENDING: 0,
        CONFIRMED: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      };
      let newBookingsCount = 0;
      if (bookingsRes?.data?.success && Array.isArray(bookingsRes.data.data)) {
        bookingsRes.data.data.forEach((booking) => {
          if (statusCounts.hasOwnProperty(booking.status)) {
            statusCounts[booking.status]++;
          }
          if (booking.status === "PENDING" || booking.status === "CONFIRMED") {
            newBookingsCount++;
          }
        });
      }
      const pieData = Object.keys(statusCounts)
        .filter((key) => statusCounts[key] > 0)
        .map((key) => ({
          name: PIE_LABELS[key] || key,
          value: statusCounts[key],
          color: PIE_COLORS[key] || "#8884d8",
        }));
      setBookingStatusData(pieData);

      // 5. Xử lý Dữ liệu Người dùng (KPI)
      let newCustomersCount = 0;
      if (usersRes?.data?.success && Array.isArray(usersRes.data.data)) {
        newCustomersCount = usersRes.data.data.filter(
          (u) => u.role === "CUSTOMER"
        ).length;
      }

      // 6. Cập nhật Stats (KPIs)
      setStats({
        revenue: totalRevenue,
        newBookings: newBookingsCount,
        newCustomers: newCustomersCount,
        inProgress: inProgressCount,
      });

      // 7. Xử lý Lịch hẹn gần đây (Bảng)
      let enrichedRecentBookings = [];
      if (
        recentBookingsRes?.data?.success &&
        Array.isArray(recentBookingsRes.data.data)
      ) {
        enrichedRecentBookings = recentBookingsRes.data.data.map(
          (booking, index) => {
            // (ĐÃ XÓA CONSOLE.LOG)
            return {
              key: booking.id || index,
              customer: uMap[booking.user_id] || `ID: ${booking.user_id}`,
              vehicle: vMap[booking.vehicle_id] || `ID: ${booking.vehicle_id}`,
              service: (booking.appointment_services || [])
                .map((s) => sMap[s.service_id] || "Dịch vụ không xác định")
                .join(", "),
              date: formatDateTime(booking.scheduled_date),
              status: booking.status,
            };
          }
        );
      }
      setRecentBookings(enrichedRecentBookings);

      // 8. Xử lý Tồn kho thấp (Danh sách)
      if (lowStockRes?.data?.success && Array.isArray(lowStockRes.data.data)) {
        setLowStockItems(lowStockRes.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
      toast.error("Không thể tải dữ liệu dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const recentBookingsColumns = [
    { title: "Khách hàng", dataIndex: "customer", key: "customer" },
    { title: "Xe", dataIndex: "vehicle", key: "vehicle" },
    { title: "Dịch vụ", dataIndex: "service", key: "service", ellipsis: true },
    { title: "Thời gian", dataIndex: "date", key: "date" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => formatBookingStatus(status),
    },
  ];

  // --- Giao diện (JSX) ---
  return (
    // (SỬA) Thêm div wrapper với background xám nhạt và padding
    <div style={{ padding: 24, background: "#f5f5f5" }}>
      <Spin spinning={loading}>
        <Title level={2} style={{ marginBottom: 24 }}>
          Tổng quan
        </Title>

        {/* Hàng 1: 4 Thẻ KPI (SỬA) */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <KpiCard
              title="Doanh thu (30 ngày)"
              value={`${stats.revenue.toLocaleString("vi-VN")} VND`}
              icon={<DollarCircleOutlined />}
              color="#3f8600"
              backgroundColor="rgba(82, 196, 26, 0.1)"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KpiCard
              title="Lịch hẹn mới (Chờ & Đã xác nhận)"
              value={stats.newBookings.toLocaleString("vi-VN")}
              icon={<CalendarOutlined />}
              color="#1890ff"
              backgroundColor="rgba(24, 144, 255, 0.1)"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KpiCard
              title="Tổng số Khách hàng"
              value={stats.newCustomers.toLocaleString("vi-VN")}
              icon={<UserOutlined />}
              color="#52c41a"
              backgroundColor="rgba(82, 196, 26, 0.1)"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KpiCard
              title="Xe đang sửa chữa"
              value={stats.inProgress.toLocaleString("vi-VN")}
              icon={<CarOutlined />}
              color="#cf1322"
              backgroundColor="rgba(207, 19, 34, 0.1)"
            />
          </Col>
        </Row>

        {/* Hàng 2: Biểu đồ */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {/* Biểu đồ Doanh thu (SỬA) */}
          <Col xs={24} lg={16}>
            <Card title="Doanh thu 30 ngày qua" bordered={false}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  {/* (MỚI) Thêm Gradient cho Bar */}
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={PIE_COLORS.CONFIRMED} // Màu xanh dương
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={PIE_COLORS.CONFIRMED}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis
                    axisLine={false}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(0)}Tr`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${value.toLocaleString("vi-VN")} VND`,
                      "Doanh thu",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="doanhThu"
                    fill="url(#colorRevenue)" // (SỬA) Dùng Gradient
                    name="Doanh thu"
                    radius={[4, 4, 0, 0]} // (MỚI) Bo góc cho Bar
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Biểu đồ Trạng thái Lịch hẹn (SỬA) */}
          <Col xs={24} lg={8}>
            <Card title="Trạng thái Lịch hẹn" bordered={false}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={60} // (MỚI) Tạo biểu đồ Donut
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#ffffff" // (MỚI) Thêm viền trắng
                        style={{ outline: "none" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} lịch hẹn`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Hàng 3: Bảng và Danh sách */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {/* Bảng Lịch hẹn gần đây (SỬA) */}
          <Col xs={24} lg={16}>
            <Card title="Lịch hẹn gần đây" bordered={false}>
              <Table
                columns={recentBookingsColumns}
                dataSource={recentBookings}
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }}
              />
            </Card>
          </Col>

          {/* Danh sách Tồn kho thấp (SỬA) */}
          <Col xs={24} lg={8}>
            <Card title="Phụ tùng sắp hết hàng" bordered={false}>
              <List
                itemLayout="horizontal"
                dataSource={lowStockItems}
                locale={{ emptyText: "Không có phụ tùng nào sắp hết hàng." }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: "#fffbe6",
                            color: "#faad14",
                          }} // (SỬA) Màu icon
                          icon={<WarningOutlined />}
                        />
                      }
                      title={
                        <Text>
                          {partsMap[item.part_id] || `ID: ${item.part_id}`}
                        </Text>
                      }
                      description={`Trung tâm: ${
                        centersMap[item.service_center_id] ||
                        `ID: ${item.service_center_id}`
                      }`}
                    />
                    <Text type="danger" strong>
                      Còn {item.quantity_on_hand}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
