# Member Homepage - EV Service Center

## Tính năng đã triển khai

### 1. Trang chủ Member (`/member`)

- Hiển thị danh sách xe của member
- Mỗi card xe hiển thị:
  - Hình ảnh (icon)
  - Brand (hãng xe)
  - Model (dòng xe)
  - Biển số xe (License Plate)
  - Ngày bảo dưỡng tiếp theo (Warranty End Date)

### 2. Quản lý xe

- **Thêm xe mới**: Button "Thêm xe mới" ở header
  - Nhập số VIN (17 ký tự - bắt buộc)
  - Chọn Model từ dropdown
  - Nhập biển số xe (format: 61A150505 - 2 số + 1 chữ cái + 5-6 số)
  - Nhập số kilometer hiện tại

### 3. Xem chi tiết xe

- Click "Xem chi tiết" trên card xe
- Modal hiển thị:
  - Tab "Thông tin cơ bản": Brand, Model, VIN, Biển số, Kilometer, Năm sản xuất
  - Tab "Bảo dưỡng": Ngày bắt đầu bảo hành, Ngày bảo dưỡng tiếp theo, Ngày tạo, Cập nhật
- Có button "Đặt lịch bảo dưỡng" trong modal

### 4. Đặt lịch bảo dưỡng

Có 2 cách đặt lịch:

- **Cách 1**: Click "Đặt lịch" trực tiếp trên card xe
- **Cách 2**: Click "Xem chi tiết" → "Đặt lịch bảo dưỡng"

Sau khi chọn đặt lịch:

- Hiển thị modal danh sách chi nhánh
- Mỗi card chi nhánh hiển thị:
  - Tên chi nhánh
  - Địa chỉ
  - Số điện thoại
  - Giờ làm việc
  - Mô tả
- Chọn chi nhánh và xác nhận

## API Endpoints đã sử dụng

### Vehicle APIs

```
GET    /api/v1/vehicles/                    - Lấy danh sách xe của user
POST   /api/v1/vehicles/                    - Tạo xe mới
GET    /api/v1/vehicles/{id}                - Lấy chi tiết xe
PUT    /api/v1/vehicles/{id}                - Cập nhật xe
DELETE /api/v1/vehicles/{id}                - Xóa xe
```

### Service Center APIs

```
GET    /api/v1/service-centers/?skip=0&limit=100&active_only=true
       - Lấy danh sách chi nhánh
GET    /api/v1/service-centers/{id}         - Lấy chi tiết chi nhánh
```

### Brand & Model APIs

```
GET    /api/v1/brands/                      - Lấy danh sách brand
GET    /api/v1/brands/{id}/models           - Lấy models theo brand
GET    /api/v1/models/                      - Lấy tất cả models
```

## Cấu trúc Files đã tạo

### Services

```
src/services/
  ├── vehicleService.js          - API calls cho vehicle
  ├── serviceCenterService.js    - API calls cho service center
  └── brandModelService.js       - API calls cho brand & model
```

### Components

```
src/components/vehicle/
  ├── VehicleCard.jsx            - Card hiển thị thông tin xe
  ├── VehicleFormModal.jsx       - Form thêm/sửa xe
  └── ServiceCenterModal.jsx     - Modal chọn chi nhánh
```

### Pages

```
src/pages/member/
  └── HomePage.jsx               - Trang chủ member
```

### Layout

```
src/templates/member/
  └── MemberLayout.jsx           - Layout cho member (sidebar, header)
```

### Constants

```
src/constants/
  └── roles.js                   - Thêm MEMBER role
```

## Cách sử dụng

### 1. Login

- Đăng nhập với account có role MEMBER
- Sau khi login thành công, tự động redirect đến `/member`

### 2. Thêm xe

1. Click button "Thêm xe mới"
2. Điền form:
   - VIN: Nhập chính xác 17 ký tự
   - Model: Chọn từ dropdown (format: Brand - Model)
   - Biển số: Nhập theo format 61A150505
   - Kilometer: Nhập số kilometer hiện tại
3. Click "Thêm"

### 3. Xem chi tiết xe

1. Click "Xem chi tiết" trên card xe
2. Xem thông tin trong 2 tabs
3. Có thể click "Đặt lịch bảo dưỡng"

### 4. Đặt lịch

1. Click "Đặt lịch" (trên card hoặc trong modal chi tiết)
2. Chọn chi nhánh từ danh sách
3. Click "Xác nhận"

## Validation

### Số VIN

- Bắt buộc nhập
- Phải đúng 17 ký tự

### Biển số xe

- Bắt buộc nhập
- Format: 2 số + 1 chữ cái + 5-6 số
- Ví dụ: 61A150505, 30B12345

### Số Kilometer

- Bắt buộc nhập
- Phải >= 0
- Tự động format với dấu phẩy (1,000 km)

## Styling

- Sử dụng Tailwind CSS cho styling
- Sử dụng Ant Design components (Card, Button, Modal, Form, etc.)
- Responsive design với grid layout
- Icons từ @ant-design/icons

## Notes

- Tất cả API calls đều đã config auto thêm Bearer token từ localStorage
- Error handling với message.error() từ Ant Design
- Loading states với Spin component
- Empty state khi chưa có xe nào
