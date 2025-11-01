import React from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { serviceService } from '../services/serviceService';

const { Option } = Select;
const { TextArea } = Input;

const ServiceFormModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  editingService = null, 
  mode = 'create' // 'create' or 'edit'
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      if (mode === 'edit' && editingService) {
        form.setFieldsValue({
          code: editingService.code,
          name: editingService.name,
          category: editingService.category,
          description: editingService.description,
          is_active: editingService.is_active ?? true,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          is_active: true, // Default to active
        });
      }
    }
  }, [visible, mode, editingService, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (mode === 'create') {
        const response = await serviceService.createService(values);
        if (response.data && response.data.success) {
          message.success('Tạo dịch vụ thành công!');
          onSuccess();
          form.resetFields();
        } else {
          message.error('Không thể tạo dịch vụ');
        }
      } else {
        const response = await serviceService.updateService(editingService.id, values);
        if (response.data && response.data.success) {
          message.success('Cập nhật dịch vụ thành công!');
          onSuccess();
        } else {
          message.error('Không thể cập nhật dịch vụ');
        }
      }
    } catch (error) {
      console.error('Error submitting service:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra khi lưu dịch vụ');
      }
    }
  };

  const categoryOptions = [
    { value: 'MAINTENANCE', label: 'Bảo dưỡng' },
    { value: 'REPAIR', label: 'Sửa chữa' },
    { value: 'INSPECTION', label: 'Kiểm tra' },
    { value: 'BATTERY', label: 'Pin' },
  ];

  return (
    <Modal
      title={mode === 'create' ? 'Thêm dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={mode === 'create' ? 'Tạo dịch vụ' : 'Cập nhật'}
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          label="Mã dịch vụ"
          name="code"
          rules={[
            { required: true, message: 'Vui lòng nhập mã dịch vụ!' },
            { 
              pattern: /^[A-Z0-9]{3,10}$/, 
              message: 'Mã dịch vụ phải có 3-10 ký tự viết hoa và số!' 
            }
          ]}
        >
          <Input 
            placeholder="VD: SVC001" 
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              form.setFieldsValue({ code: value });
            }}
          />
        </Form.Item>

        <Form.Item
          label="Tên dịch vụ"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên dịch vụ!' },
            { min: 3, message: 'Tên dịch vụ phải có ít nhất 3 ký tự!' },
            { max: 100, message: 'Tên dịch vụ không được vượt quá 100 ký tự!' }
          ]}
        >
          <Input placeholder="VD: Battery Health Check" />
        </Form.Item>

        <Form.Item
          label="Loại dịch vụ"
          name="category"
          rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ!' }]}
        >
          <Select placeholder="Chọn loại dịch vụ">
            {categoryOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả dịch vụ!' },
            { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
            { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="VD: Comprehensive battery health assessment"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="is_active"
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="Hoạt động" 
            unCheckedChildren="Ngừng hoạt động" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceFormModal;