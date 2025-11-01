import React from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';

const { Option } = Select;

const PartForm = ({ isEditing = false }) => (
  <>
    <Form.Item
      name="part_code"
      label="Mã phụ tùng"
      rules={[{ required: true, message: 'Vui lòng nhập mã phụ tùng!' }]}
    >
      <Input disabled={isEditing} />
    </Form.Item>
    <Form.Item
      name="name"
      label="Tên phụ tùng"
      rules={[{ required: true, message: 'Vui lòng nhập tên phụ tùng!' }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="category"
      label="Loại phụ tùng"
      rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
    >
      <Select placeholder="Chọn loại phụ tùng">
        <Option value="Battery">Battery</Option>
        <Option value="Motor">Motor</Option>
        <Option value="Charging">Charging</Option>
        <Option value="Electronics">Electronics</Option>
        <Option value="Phụ tùng">Phụ tùng chung</Option>
      </Select>
    </Form.Item>
    <Form.Item
      name="brand"
      label="Hãng sản xuất"
      rules={[{ required: true, message: 'Vui lòng nhập hãng!' }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="unit_price"
      label="Đơn giá (VND)"
      rules={[{ required: true, message: 'Vui lòng nhập đơn giá!' }]}
    >
      <InputNumber
        style={{ width: '100%' }}
        min={0}
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
      />
    </Form.Item>
    <Form.Item
      name="cost_price"
      label="Giá vốn (VND)"
      rules={[{ required: true, message: 'Vui lòng nhập giá vốn!' }]}
    >
      <InputNumber
        style={{ width: '100%' }}
        min={0}
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
      />
    </Form.Item>
    <Form.Item
      name="min_stock_level"
      label="Tồn kho tối thiểu"
      rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
    >
      <InputNumber style={{ width: '100%' }} min={0} />
    </Form.Item>
    <Form.Item
      name="is_ev_specific"
      label="Dành riêng cho xe điện?"
      valuePropName="checked"
    >
      <Switch />
    </Form.Item>
    <Form.Item
      name="is_active"
      label="Trạng thái kinh doanh"
      valuePropName="checked"
    >
      <Switch
        disabled={isEditing}
        checkedChildren="Đang kinh doanh"
        unCheckedChildren="Ngừng kinh doanh"
      />
    </Form.Item>
  </>
);

export default PartForm;