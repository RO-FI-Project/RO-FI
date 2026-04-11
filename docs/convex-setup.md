# Convex Setup (Cơ bản)

## 1) Cài Convex CLI
- Khuyến nghị: dùng `bunx convex ...` (không cần cài global)
- Lựa chọn khác: `npm i -g convex` rồi chạy `convex ...`
- Đăng nhập: `bunx convex login`

## 2) Tạo project & deployment
- Chạy tại root project `E:\\MYPJ\\RO-FI`: `bunx convex dev`
- Chọn/khởi tạo project mới theo hướng dẫn CLI

Ví dụ PowerShell:
```powershell
PS E:\MYPJ\RO-FI> bunx convex login
PS E:\MYPJ\RO-FI> bunx convex dev
```

## 3) Lấy URL Convex
- Sau khi tạo, CLI sẽ cung cấp `NEXT_PUBLIC_CONVEX_URL`

## 4) Cấu hình .env
Điền các biến sau trong `.env`:
- `NEXT_PUBLIC_CONVEX_URL=...`
- `RESEND_API_KEY=...`
- `RESEND_FROM=...`
- `CONTACT_TO=...`

## 5) Chạy dự án
- `bun run dev`

## 6) Verify nhanh
- Mở `/` và kiểm tra không có lỗi console
- Thử gửi form hợp tác để xác nhận email config (Resend)

## Checklist lỗi thường gặp
- Thiếu `NEXT_PUBLIC_CONVEX_URL`
- Chưa `bunx convex login`
- URL Convex sai hoặc chưa tạo deployment
- Chạy sai thư mục (không phải root project)
- `bunx` không chạy được → kiểm tra Bun đã cài chưa
