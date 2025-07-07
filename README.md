# Ứng Dụng Web Quản Lý Cây Gia Phả

Dự án này là một hệ thống quản lý cây gia phả dựa trên web. Ứng dụng cho phép người dùng thêm, tìm kiếm và trực quan hóa các mối quan hệ gia đình bằng giao diện hiện đại (Next.js + Tailwind CSS) và backend sử dụng Flask cùng Neo4j.

## Tính Năng
- Thêm thành viên với tên, giới tính và mô tả
- Tạo mối quan hệ cha mẹ - con cái
- Xóa thành viên
- Tìm kiếm thành viên theo tên
- Trực quan hóa cấu trúc cây gia phả

## Công Nghệ Sử Dụng
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Flask (Python)
- **Cơ sở dữ liệu:** Neo4j (Graph Database)

## Yêu Cầu Trước Khi Cài Đặt
- Python 3.8 trở lên
- Node.js (v16+)
- Một instance Neo4j AuraDB hoặc máy chủ Neo4j cài đặt cục bộ

## Hướng Dẫn Cài Đặt

### 1. Backend (Flask)
1. Cài đặt các thư viện Python cần thiết:
   ```powershell
   pip install flask flask-cors neo4j
   ```
2. Cập nhật URI kết nối Neo4j, tên người dùng và mật khẩu trong file `server.py` nếu cần.
3. Khởi động server Flask:
   ```powershell
   python server.py
   ```

### 2. Frontend (Next.js)
1. Di chuyển vào thư mục `.\frontend`:
   ```powershell
   cd frontend
   ```
2. Cài đặt các phụ thuộc:
   ```powershell
   npm install
   ```
3. Khởi động server phát triển:
   ```powershell
   npm run dev
   ```

### 3. Truy Cập Ứng Dụng
- API backend mặc định chạy tại: `http://127.0.0.1:5000/`
- Frontend mặc định chạy tại: `http://localhost:3000/`

## Giấy Phép
Dự án này dành cho mục đích giáo dục.
