import React, { useState, useEffect } from "react";
import {
    Button,
    Empty,
    Spin,
    message,
    Modal,
    Descriptions,
    Tag,
    Tabs,
} from "antd";
import { PlusOutlined, CarOutlined } from "@ant-design/icons";
import VehicleCard from "../../components/vehicle/VehicleCard";
import VehicleFormModal from "../../components/vehicle/VehicleFormModal";
import BookingModal from "../../components/vehicle/BookingModal";
import { vehicleService } from "../../services/vehicleService";

const MemberHomePage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [editingVehicle, setEditingVehicle] = useState(null);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const data = await vehicleService.getMyVehicles();
            console.log("Vehicle data from API:", data); // Debug log

            // API có thể trả về array hoặc object có property chứa array
            let vehicleList = [];
            if (Array.isArray(data)) {
                vehicleList = data;
            } else if (data && Array.isArray(data.items)) {
                vehicleList = data.items;
            } else if (data && Array.isArray(data.data)) {
                vehicleList = data.data;
            } else if (data && Array.isArray(data.vehicles)) {
                vehicleList = data.vehicles;
            }

            setVehicles(vehicleList);
        } catch (error) {
            message.error("Không thể tải danh sách xe");
            console.error("Load vehicles error:", error);
            setVehicles([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVehicle = async (values) => {
        try {
            console.log("✅ Raw form values:", values);

            // Validate VIN length
            if (!values.vin || values.vin.length !== 17) {
                message.error(`VIN phải có đúng 17 ký tự (hiện tại: ${values.vin?.length || 0})`);
                return;
            }

            // Transform data để match với API - chỉ gửi required fields + optional nếu có
            const vehicleData = {
                vin: values.vin,
                license_plate: values.license_plate,
                model_id: parseInt(values.model_id), // Đảm bảo là integer
            };

            // Thêm optional fields nếu có
            if (values.current_mileage !== undefined && values.current_mileage !== null) {
                vehicleData.current_mileage = parseInt(values.current_mileage);
                console.log("✅ Added current_mileage:", vehicleData.current_mileage);
            } else {
                console.log("⚠️ current_mileage is missing:", values.current_mileage);
            }

            if (values.image_url) {
                vehicleData.image_url = values.image_url;
                console.log("✅ Added image_url:", vehicleData.image_url);
            } else {
                console.log("⚠️ image_url is missing:", values.image_url);
            }

            console.log("✅ Final vehicle data to send:", vehicleData);
            const result = await vehicleService.createVehicle(vehicleData);
            console.log("✅ API Result:", result);
            message.success("Thêm xe thành công");
            setShowVehicleModal(false);
            loadVehicles();
        } catch (error) {
            console.error("Create vehicle error:", error);
            console.error("Error response:", error.response?.data);

            // Hiển thị lỗi chi tiết từ API
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const errorMessages = error.response.data.errors.map(err =>
                    `${err.field}: ${err.message}`
                ).join(", ");
                message.error(errorMessages);
            } else {
                const errorMessage = error.response?.data?.detail
                    || error.response?.data?.message
                    || "Không thể thêm xe";
                message.error(errorMessage);
            }
        }
    };

    const handleViewDetail = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowDetailModal(true);
    };

    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
        setShowDetailModal(false);
        setShowVehicleModal(true);
    };

    const handleUpdateVehicle = async (values) => {
        try {
            console.log("✅ Update form values:", values);

            // Chỉ gửi các fields được phép update: license_plate, current_mileage, image_url
            const updateData = {};

            if (values.license_plate) {
                updateData.license_plate = values.license_plate;
            }

            if (values.current_mileage !== undefined && values.current_mileage !== null) {
                updateData.current_mileage = parseInt(values.current_mileage);
            }

            if (values.image_url) {
                updateData.image_url = values.image_url;
            }

            console.log("✅ Update data to send:", updateData);
            await vehicleService.updateVehicle(editingVehicle.id, updateData);
            message.success("Cập nhật xe thành công");
            setShowVehicleModal(false);
            setEditingVehicle(null);
            loadVehicles();
        } catch (error) {
            console.error("Update vehicle error:", error);
            console.error("Error response:", error.response?.data);

            const errorMessage = error.response?.data?.detail
                || error.response?.data?.message
                || "Không thể cập nhật xe";
            message.error(errorMessage);
        }
    };

    const handleBookService = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowBookingModal(true);
    };

    const handleSelectServiceCenter = (center, vehicle) => {
        message.success(
            `Đã chọn chi nhánh ${center.name} cho xe ${vehicle.license_plate}`
        );
        // TODO: Navigate to booking page with selected center and vehicle
        console.log("Selected center:", center);
        console.log("Selected vehicle:", vehicle);
    };

    const handleBookFromDetail = () => {
        setShowDetailModal(false);
        setShowBookingModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa có";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <CarOutlined className="mr-3" />
                                Xe của tôi
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý xe và đặt lịch bảo dưỡng
                            </p>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => setShowVehicleModal(true)}
                            className="shadow-md"
                        >
                            Thêm xe mới
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : !Array.isArray(vehicles) || vehicles.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12">
                        <Empty
                            description={
                                <div>
                                    <p className="text-gray-500 text-lg mb-4">
                                        Bạn chưa có xe nào
                                    </p>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlusOutlined />}
                                        onClick={() => setShowVehicleModal(true)}
                                    >
                                        Thêm xe đầu tiên
                                    </Button>
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.isArray(vehicles) && vehicles.map((vehicle) => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={vehicle}
                                onViewDetail={handleViewDetail}
                                onBookService={handleBookService}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Vehicle Form Modal */}
            <VehicleFormModal
                visible={showVehicleModal}
                onClose={() => {
                    setShowVehicleModal(false);
                    setEditingVehicle(null);
                }}
                onSubmit={editingVehicle ? handleUpdateVehicle : handleCreateVehicle}
                initialValues={editingVehicle}
                isEditMode={!!editingVehicle}
            />

            {/* Booking Modal */}
            <BookingModal
                visible={showBookingModal}
                onClose={() => {
                    setShowBookingModal(false);
                    setSelectedVehicle(null);
                }}
                onSuccess={() => {
                    loadVehicles(); // Reload danh sách xe sau khi đặt lịch thành công
                }}
                vehicle={selectedVehicle}
            />

            {/* Vehicle Detail Modal */}
            <Modal
                title="Chi tiết xe"
                open={showDetailModal}
                onCancel={() => {
                    setShowDetailModal(false);
                    setSelectedVehicle(null);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setShowDetailModal(false);
                            setSelectedVehicle(null);
                        }}
                    >
                        Đóng
                    </Button>,
                    <Button
                        key="edit"
                        onClick={() => handleEditVehicle(selectedVehicle)}
                    >
                        Cập nhật
                    </Button>,
                    <Button
                        key="book"
                        type="primary"
                        onClick={handleBookFromDetail}
                    >
                        Đặt lịch bảo dưỡng
                    </Button>,
                ]}
                width={700}
            >
                {selectedVehicle && (
                    <div className="space-y-6">
                        {/* Hiển thị ảnh xe */}
                        {selectedVehicle.image_url && (
                            <div className="mb-4">
                                <img
                                    src={selectedVehicle.image_url}
                                    alt={selectedVehicle.model_name || "Vehicle"}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: "1",
                                    label: "Thông tin cơ bản",
                                    children: (
                                        <Descriptions bordered column={1}>
                                            <Descriptions.Item label="Brand">
                                                <Tag color="blue">
                                                    {selectedVehicle.brand_name || selectedVehicle.brand?.name || "N/A"}
                                                </Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Model">
                                                {selectedVehicle.model_name || selectedVehicle.model?.name || "N/A"}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="VIN">
                                                <code className="bg-gray-100 px-2 py-1 rounded">
                                                    {selectedVehicle.vin || "N/A"}
                                                </code>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Biển số xe">
                                                <strong>{selectedVehicle.license_plate || "N/A"}</strong>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Số Kilometer">
                                                {selectedVehicle.current_mileage || selectedVehicle.odometer
                                                    ? `${(selectedVehicle.current_mileage || selectedVehicle.odometer).toLocaleString()} km`
                                                    : "N/A"}
                                            </Descriptions.Item>
                                            {/* <Descriptions.Item label="Năm sản xuất">
                                                {selectedVehicle.year || "N/A"}
                                            </Descriptions.Item> */}
                                        </Descriptions>
                                    ),
                                },
                                {
                                    key: "2",
                                    label: "Bảo dưỡng",
                                    children: (
                                        <Descriptions bordered column={1}>
                                            <Descriptions.Item label="Ngày bảo hành bắt đầu">
                                                {formatDate(selectedVehicle.warranty_start_date)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Ngày bảo dưỡng tiếp theo">
                                                <Tag color="red">
                                                    {formatDate(selectedVehicle.warranty_end_date)}
                                                </Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Ngày tạo">
                                                {formatDate(selectedVehicle.created_at)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Cập nhật lần cuối">
                                                {formatDate(selectedVehicle.updated_at)}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    ),
                                },
                            ]}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MemberHomePage;
