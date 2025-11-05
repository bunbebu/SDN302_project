import React from "react";
import { Card, Button, Tag } from "antd";
import { CalendarOutlined, CarOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const VehicleCard = ({ vehicle, onViewDetail, onBookService }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa có";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    return (
        <Card
            hoverable
            className="vehicle-card shadow-md rounded-lg"
            cover={
                vehicle.image_url ? (
                    <img
                        src={vehicle.image_url}
                        alt={vehicle.model_name || "Vehicle"}
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center"><svg class="text-6xl text-white" style="width: 4rem; height: 4rem;" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg></div>';
                        }}
                    />
                ) : (
                    <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <CarOutlined className="text-6xl text-white" />
                    </div>
                )
            }
            actions={[
                <Button type="link" onClick={() => onViewDetail(vehicle)} key="detail">
                    Xem chi tiết
                </Button>,
                <Button type="primary" onClick={() => onBookService(vehicle)} key="book">
                    Đặt lịch
                </Button>,
            ]}
        >
            <Card.Meta
                title={
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{vehicle.brand_name || vehicle.brand?.name || "N/A"}</span>
                        <Tag color="blue">{vehicle.model_name || vehicle.model?.name || "N/A"}</Tag>
                    </div>
                }
                description={
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <CarOutlined className="mr-2" />
                            <span className="font-semibold">Biển số: </span>
                            <span className="ml-2">{vehicle.license_plate || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                            <SafetyCertificateOutlined className="mr-2" />
                            <span className="font-semibold">VIN: </span>
                            <span className="ml-2 text-xs">{vehicle.vin || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                            <CalendarOutlined className="mr-2" />
                            <span className="font-semibold">Bảo dưỡng tiếp theo: </span>
                            <span className="ml-2 text-red-500 font-semibold">
                                {formatDate(vehicle.warranty_end_date)}
                            </span>
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

export default VehicleCard;
