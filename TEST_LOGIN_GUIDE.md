# 🔧 Hướng dẫn Test Login với Role STUDENT/MEMBER

## ✅ Đã sửa các vấn đề:

### 1. **LoginPage.jsx**

- ✅ Xóa `useNavigate()` không cần thiết
- ✅ Sử dụng `window.location.href` thay vì `navigate()`
- ✅ Thêm `setTimeout(100ms)` để đảm bảo Redux state được cập nhật
- ✅ Hỗ trợ cả role "STUDENT" và "MEMBER"

### 2. **AuthGuard.jsx**

- ✅ Thêm console.log để debug
- ✅ Cho phép cả "STUDENT" và "MEMBER" truy cập `/member`
- ✅ Auto redirect về `/member` khi đã login với role STUDENT/MEMBER

### 3. **roles.js**

- ✅ Thêm `STUDENT: "STUDENT"` constant

## 🧪 Cách test:

### Bước 1: Mở Browser Console

1. Mở DevTools (F12)
2. Chuyển sang tab **Console**

### Bước 2: Login

1. Truy cập: `http://localhost:5174/`
2. Nhập thông tin login với account có role **STUDENT**
3. Click "Đăng nhập"

### Bước 3: Kiểm tra Console Logs

Bạn sẽ thấy các log sau:

```
Login - User Role: STUDENT
AuthGuard - User Info: { user: {...}, access_token: "..." }
AuthGuard - User Role: STUDENT
AuthGuard - Current Path: /member
```

### Bước 4: Kết quả mong đợi

- ✅ Toast hiển thị "Đăng nhập thành công!"
- ✅ Sau ~100ms, tự động redirect đến `/member`
- ✅ Hiển thị trang Member Homepage
- ✅ Không bị redirect về `/unauthorized`

## 🐛 Nếu vẫn gặp lỗi:

### Lỗi 1: Vẫn ra trang unauthorized

**Nguyên nhân**: Role từ API không phải "STUDENT" hoặc "MEMBER"

**Cách kiểm tra**:

```javascript
// Xem trong console log:
Login - User Role: ???  // <- Xem giá trị này là gì
```

**Giải pháp**: Báo cho tôi biết giá trị role thực tế, tôi sẽ cập nhật code

### Lỗi 2: Không chuyển trang

**Nguyên nhân**: Browser cache hoặc localStorage cũ

**Cách fix**:

1. Xóa localStorage: `localStorage.clear()`
2. Hard refresh: `Ctrl + Shift + R`
3. Thử lại

### Lỗi 3: Console báo lỗi

**Cách xử lý**:

- Copy toàn bộ error message
- Gửi cho tôi để debug

## 📋 Các role được hỗ trợ:

| Role    | Redirect đến       | Mô tả                             |
| ------- | ------------------ | --------------------------------- |
| ADMIN   | `/admin/dashboard` | Trang quản trị                    |
| STAFF   | `/staff/dashboard` | Trang nhân viên                   |
| MEMBER  | `/member`          | Trang thành viên                  |
| STUDENT | `/member`          | Trang sinh viên (cùng với member) |

## 🔍 Debug Tips:

### Xem thông tin user trong Redux:

```javascript
// Trong browser console:
JSON.parse(localStorage.getItem("INFO_USER"));
```

### Xem role hiện tại:

```javascript
// Trong browser console:
JSON.parse(localStorage.getItem("INFO_USER"))?.user?.role;
```

### Clear tất cả và test lại:

```javascript
// Trong browser console:
localStorage.clear();
location.reload();
```

## ✨ Tính năng đã hoàn thành:

1. ✅ Login với role STUDENT/MEMBER
2. ✅ Auto redirect đúng theo role
3. ✅ Bảo vệ routes (không cho vào trang của role khác)
4. ✅ Member Homepage hiển thị danh sách xe
5. ✅ Thêm xe mới với validation
6. ✅ Xem chi tiết xe
7. ✅ Đặt lịch bảo dưỡng và chọn chi nhánh

## 🚀 Next Steps (nếu cần):

- [ ] Tạo trang booking để hoàn tất đặt lịch
- [ ] Tạo trang lịch sử bảo dưỡng
- [ ] Tạo trang quản lý lịch hẹn
- [ ] Tạo trang thông tin cá nhân

---

**Server đang chạy tại**: http://localhost:5174/

Hãy thử login và báo cho tôi biết kết quả! 🎉
