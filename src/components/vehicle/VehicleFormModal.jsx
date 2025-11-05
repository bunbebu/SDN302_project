import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber, message } from "antd";
import { brandModelService } from "../../services/brandModelService";

const VehicleFormModal = ({ visible, onClose, onSubmit, initialValues, isEditMode }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [models, setModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
            loadModels();
        }
    }, [visible, initialValues, form]);

    const loadModels = async () => {
        setLoadingModels(true);
        try {
            const data = await brandModelService.getAllModels();

            // API có thể trả về array hoặc object có property chứa array
            let modelList = [];
            if (Array.isArray(data)) {
                modelList = data;
            } else if (data && Array.isArray(data.items)) {
                modelList = data.items;
            } else if (data && Array.isArray(data.data)) {
                modelList = data.data;
            } else if (data && Array.isArray(data.models)) {
                modelList = data.models;
            }

            setModels(modelList);
        } catch (error) {
            message.error("Không thể tải danh sách model");
            console.error(error);
            setModels([]); // Set empty array on error
        } finally {
            setLoadingModels(false);
        }
    };

    const handleSubmit = async () => {
        try {
            console.log("🔍 Before validation - Form fields:", form.getFieldsValue());
            const values = await form.validateFields();
            console.log("✅ After validation - Form values:", values);
            setLoading(true);
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error("❌ Validation failed:", error);
            console.error("❌ Error fields:", error.errorFields);
            if (error.errorFields) {
                const errorMsg = error.errorFields.map(f => `${f.name}: ${f.errors.join(", ")}`).join("\n");
                message.error(`Lỗi: ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const validateVIN = (_, value) => {
        if (!value) {
            return Promise.reject(new Error("Vui lòng nhập số VIN"));
        }
        if (value.length !== 17) {
            return Promise.reject(new Error("Số VIN phải có đúng 17 ký tự"));
        }
        return Promise.resolve();
    };

    const validateLicensePlate = (_, value) => {
        if (!value) {
            return Promise.reject(new Error("Vui lòng nhập biển số xe"));
        }
        // Format: 61A150505 (2 số + 1 chữ + 5-6 số)
        const pattern = /^\d{2}[A-Z]\d{5,6}$/;
        if (!pattern.test(value)) {
            return Promise.reject(
                new Error("Biển số xe không đúng định dạng (VD: 61A150505)")
            );
        }
        return Promise.resolve();
    };

    return (
        <Modal
            title={isEditMode ? "Cập nhật xe" : "Thêm xe mới"}
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={isEditMode ? "Cập nhật" : "Thêm"}
            cancelText="Hủy"
            width={600}
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    name="vin"
                    label="Số VIN"
                    rules={[{ validator: validateVIN }]}
                    extra="Số VIN phải có đúng 17 ký tự"
                >
                    <Input
                        placeholder="Nhập số VIN (17 ký tự)"
                        maxLength={17}
                        disabled={isEditMode}
                    />
                </Form.Item>

                <Form.Item
                    name="model_id"
                    label="Model"
                    rules={[{ required: true, message: "Vui lòng chọn model" }]}
                >
                    <Select
                        placeholder="Chọn model"
                        loading={loadingModels}
                        showSearch
                        disabled={isEditMode}
                        filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={Array.isArray(models) ? models.map((model) => ({
                            label: `${model.brand?.name || ""} - ${model.name}`,
                            value: model.id,
                        })) : []}
                    />
                </Form.Item>

                <Form.Item
                    name="license_plate"
                    label="Biển số xe"
                    rules={[{ validator: validateLicensePlate }]}
                    extra="Định dạng: 61A150505"
                >
                    <Input
                        placeholder="Nhập biển số xe (VD: 61A150505)"
                        style={{ textTransform: "uppercase" }}
                    />
                </Form.Item>

                <Form.Item
                    name="current_mileage"
                    label="Số Kilometer hiện tại"
                    rules={[
                        { required: true, message: "Vui lòng nhập số kilometer" },
                        { type: "number", min: 0, message: "Số kilometer phải >= 0" },
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập số kilometer hiện tại"
                        style={{ width: "100%" }}
                        min={0}
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                </Form.Item>

                <Form.Item
                    name="image_url"
                    label="URL hình ảnh xe"
                    rules={[
                        { required: true, message: "Vui lòng nhập URL hình ảnh" },
                        { type: "url", message: "URL không hợp lệ" },
                    ]}
                >
                    <Input
                        placeholder="Nhập URL hình ảnh xe"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VehicleFormModal;
