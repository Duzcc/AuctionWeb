# AuctionWeb — Hệ Thống Đấu Giá Biển Số Xe Trực Tuyến

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![React](https://img.shields.io/badge/React-v19-61dafb.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.7-010101.svg)

**Nền tảng đấu giá biển số xe tích hợp thời gian thực, thanh toán trực tuyến, KYC và bảo mật đa lớp.**

</div>

---

## Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Tech Stack](#-tech-stack)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)
- [API Endpoints](#-api-endpoints)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Biến môi trường](#-biến-môi-trường)
- [Luồng nghiệp vụ](#-luồng-nghiệp-vụ)
- [WebSocket Events](#-websocket-events)
- [Bảo mật](#-bảo-mật)
- [Tác giả](#-tác-giả)

---

## Giới Thiệu

**AuctionWeb** là hệ thống đấu giá biển số xe trực tuyến được xây dựng theo chuẩn production-ready, mô phỏng quy trình đấu giá biển số xe thực tế tại Việt Nam. Hệ thống hỗ trợ đấu giá theo phòng (room-based), cập nhật giá thầu theo thời gian thực qua WebSocket, xác minh danh tính người dùng (KYC), quản lý ví điện tử, và hệ thống thông báo đầy đủ.

### Điểm nổi bật:
- **Real-time bidding** — Giá thầu cập nhật tức thì không cần refresh trang
- **Bảo mật đa lớp** — JWT + Refresh Token, Argon2 hashing, MFA (TOTP), account lockout
- **KYC tích hợp** — Xác minh danh tính người dùng trước khi tham gia đấu giá
- **Quản lý ví** — Nạp tiền, khóa/mở ký quỹ, lịch sử giao dịch
- **Thông báo email tự động** — Xác thực OTP, kết quả đấu giá, trạng thái KYC

---

## Tính Năng Chính

### Người Dùng (User)
| Tính năng | Mô tả |
|-----------|-------|
| Đăng ký / Đăng nhập | Đăng ký tài khoản, xác thực email qua OTP 6 chữ số |
| Xác thực 2 yếu tố (MFA) | Tích hợp TOTP (Google Authenticator / Authy) |
| Quản lý hồ sơ | Cập nhật thông tin cá nhân, ảnh đại diện |
| KYC Verification | Upload CMND/CCCD (mặt trước, mặt sau, selfie) để xác minh danh tính |
| Ví điện tử | Nạp tiền, xem số dư, lịch sử giao dịch |
| Đăng ký đấu giá | Đăng ký tham gia phòng đấu giá, đặt cọc ký quỹ |
| Đặt giá thầu | Đặt giá theo thời gian thực trong phòng đấu giá |
| Yêu thích | Lưu danh sách biển số yêu thích |
| Thông báo | Nhận thông báo real-time trong ứng dụng |

### Quản Trị Viên (Admin)
| Tính năng | Mô tả |
|-----------|-------|
| Dashboard | Thống kê tổng quan: người dùng, doanh thu, phiên đấu giá |
| Quản lý biển số | Thêm, sửa, xóa; phân loại biển xe ô tô / xe máy |
| Quản lý phiên đấu giá | Tạo phiên (session), gán biển số, quản lý lịch trình |
| Quản lý phòng | Xem danh sách phòng đấu giá, trạng thái, người tham gia |
| Duyệt KYC | Chấp thuận / từ chối hồ sơ KYC của người dùng |
| Quản lý người dùng | Xem, tìm kiếm, ban/unban tài khoản |
| Lịch sử đấu giá | Xem toàn bộ lịch sử đặt giá và kết quả |

---

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  React 19 + Vite + Redux Toolkit + React Router + Socket.IO     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP / WebSocket
┌─────────────────────────▼───────────────────────────────────────┐
│                       SERVER LAYER                              │
│            Node.js + Express.js + Socket.IO Server              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │   Auth   │ │ Auction  │ │  KYC     │ │  Notification      │ │
│  │ Routes   │ │ Routes   │ │ Routes   │ │  Routes            │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │  Plate   │ │ Payment  │ │  Wallet  │ │  Admin Routes      │ │
│  │ Routes   │ │ Routes   │ │ Routes   │ │                    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Middleware Pipeline                         │   │
│  │  CORS → cookieParser → Auth Guard → Validation          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │    Cron Jobs         │  │     Socket Handler           │    │
│  │  (Auto start/end)    │  │  (Real-time bidding events)  │    │
│  └──────────────────────┘  └──────────────────────────────┘    │
└───────────────────────────────────────────────────────────────-─┘
           │                         │                 │
┌──────────▼──────┐      ┌───────────▼────┐   ┌───────▼──────┐
│   MongoDB Atlas │      │   Cloudinary   │   │  Brevo SMTP  │
│  (Primary DB)   │      │ (Image Upload) │   │  (Email)     │
└─────────────────┘      └────────────────┘   └──────────────┘
```

---

## Tech Stack

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Node.js** | v18+ | Runtime environment |
| **Express.js** | ^4.18.2 | Web framework |
| **MongoDB + Mongoose** | ^8.1.0 | Cơ sở dữ liệu NoSQL |
| **Socket.IO** | ^4.7.4 | Real-time WebSocket communication |
| **JWT** | ^9.0.2 | Xác thực stateless (Access + Refresh token) |
| **Argon2** | ^0.44.0 | Mã hóa mật khẩu (bảo mật cao) |
| **Nodemailer** | ^6.9.8 | Gửi email OTP, thông báo |
| **Cloudinary** | ^2.0.0 | Upload và lưu trữ ảnh KYC, biển số |
| **Multer** | ^1.4.5 | Xử lý multipart/form-data (file upload) |
| **Node-Cron** | ^4.2.1 | Lên lịch tự động bắt đầu/kết thúc đấu giá |
| **Speakeasy** | ^2.0.0 | Tạo TOTP cho MFA |
| **QRCode** | ^1.5.4 | Tạo QR code kích hoạt MFA |
| **ioredis** | ^5.9.1 | Redis client (cache/rate limiting) |
| **express-validator** | ^7.0.1 | Validate request body |
| **bcryptjs** | ^2.4.3 | Hỗ trợ mã hóa phụ |
| **@getbrevo/brevo** | ^2.0.0 | Brevo API (email marketing) |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React** | ^19.2.3 | UI framework |
| **Vite** | ^7.2.4 | Build tool & dev server |
| **Redux Toolkit** | ^2.11.2 | State management toàn cục |
| **React Router DOM** | ^7.12.0 | Client-side routing |
| **Socket.IO Client** | ^4.8.3 | Kết nối WebSocket với backend |
| **Axios** | ^1.13.2 | HTTP client |
| **React Hook Form** | ^7.70.0 | Quản lý và validate form |
| **Zod** | ^4.3.5 | Schema validation |
| **TailwindCSS** | ^3.4.19 | Utility-first CSS framework |
| **Lucide React** | ^0.562.0 | Icon library |
| **React Hot Toast** | ^2.6.0 | Toast notifications |

---

## Cấu Trúc Thư Mục

```
PrMINDX/
├── assets/                        # Ảnh tĩnh toàn dự án
│   ├── banners/                   # Banner quảng cáo
│   ├── images/                    # Ảnh nội dung
│   └── logo/                      # Logo thương hiệu
│
├── backend/                       # Node.js Express Backend
│   ├── config/                    # Cấu hình ứng dụng
│   │   ├── database.js            # Kết nối MongoDB
│   │   └── env.js                 # Load biến môi trường
│   │
│   ├── controllers/               # Xử lý logic request/response
│   │   ├── auth.controller.js     # Xác thực: đăng ký, login, OTP, MFA
│   │   ├── admin.controller.js    # Quản trị: user, KYC, thống kê
│   │   ├── auction*.controller.js # Kết quả đấu giá
│   │   ├── bid.controller.js      # Đặt giá thầu
│   │   ├── kyc.controller.js      # Xác minh danh tính
│   │   ├── payment.controller.js  # Thanh toán, ký quỹ
│   │   ├── plate.controller.js    # Quản lý biển số
│   │   ├── registration.controller.js # Đăng ký phiên đấu giá
│   │   ├── room.controller.js     # Quản lý phòng đấu giá
│   │   ├── session.controller.js  # Quản lý phiên đấu giá
│   │   ├── wallet.controller.js   # Ví điện tử
│   │   ├── favorite.controller.js # Danh sách yêu thích
│   │   └── notification.controller.js # Thông báo
│   │
│   ├── models/                    # Mongoose schemas
│   │   ├── User.model.js          # Tài khoản người dùng + KYC + Wallet
│   │   ├── Plate.model.js         # Biển số xe (base)
│   │   ├── CarPlate.model.js      # Biển số ô tô (discriminator)
│   │   ├── MotorbikePlate.model.js # Biển số xe máy (discriminator)
│   │   ├── Session.model.js       # Phiên đấu giá
│   │   ├── SessionPlate.model.js  # Biển số trong phiên
│   │   ├── Room.model.js          # Phòng đấu giá
│   │   ├── Bid.model.js           # Lịch sử đặt giá
│   │   ├── Registration.model.js  # Đăng ký tham gia
│   │   ├── Payment.model.js       # Giao dịch thanh toán
│   │   ├── WalletTransaction.model.js # Lịch sử giao dịch ví
│   │   ├── AuctionLog.model.js    # Log phiên đấu giá
│   │   ├── ChatMessage.model.js   # Tin nhắn trong phòng
│   │   ├── Favorite.model.js      # Biển số yêu thích
│   │   ├── Notification.model.js  # Thông báo người dùng
│   │   ├── Asset.model.js         # Tài sản digital
│   │   └── RefreshToken.model.js  # Refresh token storage
│   │
│   ├── routes/                    # API route definitions
│   │   ├── auth.routes.js         # /api/auth/*
│   │   ├── plate.routes.js        # /api/plates/*
│   │   ├── session.routes.js      # /api/sessions/*
│   │   ├── room.routes.js         # /api/rooms/*
│   │   ├── auction.routes.js      # /api/auction/*
│   │   ├── bid.routes.js          # /api/bids/*
│   │   ├── payment.routes.js      # /api/payments/*
│   │   ├── registration.routes.js # /api/registrations/*
│   │   ├── wallet.routes.js       # /api/wallet/*
│   │   ├── kyc.routes.js          # /api/kyc/*
│   │   ├── admin.routes.js        # /api/admin/*
│   │   ├── favorite.routes.js     # /api/favorites/*
│   │   └── notification.routes.js # /api/notifications/*
│   │
│   ├── services/                  # Business logic services
│   │   ├── bidding.service.js     # Logic xử lý đặt giá
│   │   ├── auctionPayment.service.js # Thanh toán sau đấu giá
│   │   ├── wallet.service.js      # Nghiệp vụ ví điện tử
│   │   ├── kyc.service.js         # Xử lý hồ sơ KYC
│   │   ├── email.service.js       # Gửi email (OTP, thông báo)
│   │   ├── cloudinary.service.js  # Upload ảnh lên Cloudinary
│   │   └── sessionService.js      # Nghiệp vụ phiên đấu giá
│   │
│   ├── middleware/                # Express middleware
│   │   ├── auth.middleware.js     # Xác thực JWT
│   │   └── ...                    # Validation, role-check, etc.
│   │
│   ├── socket/
│   │   └── socket.handler.js      # Toàn bộ Socket.IO event handlers
│   │
│   ├── jobs/
│   │   └── auctionCron.js         # Cron jobs: auto-start, auto-end sessions
│   │
│   ├── scripts/                   # Seeder scripts
│   │   └── seeders/               # Seed dữ liệu mẫu vào DB
│   │
│   ├── utils/                     # Tiện ích
│   │   └── crypto.utils.js        # Hàm hash/verify (Argon2)
│   │
│   ├── .env                       # Biến môi trường (không commit)
│   └── server.js                  # Entry point — khởi động server
│
└── react-app/                     # React Frontend (Vite)
    ├── src/
    │   ├── pages/                 # Các trang chính
    │   │   ├── Home/              # Trang chủ
    │   │   ├── Auth/              # Login, Register, OTP verify
    │   │   ├── Auction/           # Danh sách & chi tiết đấu giá
    │   │   ├── Assets/            # Danh sách biển số
    │   │   ├── Payment/           # Thanh toán
    │   │   ├── User/              # Hồ sơ, ví, KYC, thông báo
    │   │   ├── Admin/             # Admin dashboard
    │   │   ├── About/             # Giới thiệu
    │   │   └── News/              # Tin tức
    │   │
    │   ├── components/            # Reusable UI components
    │   ├── store/                 # Redux Toolkit slices & store
    │   ├── services/              # API services & socket service
    │   ├── hooks/                 # Custom React hooks
    │   ├── contexts/              # React Context providers
    │   ├── utils/                 # Helper functions
    │   ├── data/                  # Static data / constants
    │   ├── styles/                # Global styles
    │   ├── App.jsx                # Root component với routing
    │   └── main.jsx               # React entry point
    │
    ├── .env                       # Frontend env (VITE_API_URL, etc.)
    ├── vite.config.js             # Vite configuration
    ├── tailwind.config.js         # TailwindCSS config
    └── index.html                 # HTML entry point
```

---

## 🗄️ Cơ Sở Dữ Liệu

Hệ thống sử dụng **MongoDB Atlas** với các collection chính:

| Collection | Mô tả | Quan hệ |
|------------|-------|---------|
| `users` | Tài khoản, hồ sơ, KYC, ví, MFA | Core entity |
| `plates` | Biển số xe (base schema với discriminator) | Refd by SessionPlate |
| `carplates` | Biển số ô tô (extends Plate) | extends Plate |
| `motorbikeplates` | Biển số xe máy (extends Plate) | extends Plate |
| `sessions` | Phiên đấu giá (ngày, thời gian) | Has many Rooms |
| `sessionplates` | Liên kết biển số ↔ phiên, giá khởi điểm | Belongs to Session |
| `rooms` | Phòng đấu giá (trạng thái, giá hiện tại) | Belongs to SessionPlate |
| `bids` | Lịch sử các lần đặt giá | Belongs to Room & User |
| `registrations` | Đăng ký tham gia (ký quỹ) | User ↔ Room |
| `payments` | Giao dịch thanh toán sau đấu giá | User ↔ Room |
| `wallettransactions` | Lịch sử nạp/rút/khóa tiền ví | Belongs to User |
| `auctionlogs` | Log sự kiện phòng đấu giá | Belongs to Room |
| `chatmessages` | Tin nhắn real-time trong phòng | Belongs to Room |
| `favorites` | Danh sách biển số yêu thích | User ↔ Plate |
| `notifications` | Thông báo trong ứng dụng | Belongs to User |
| `refreshtokens` | Refresh token storage (blacklist-able) | Belongs to User |

---

## API Endpoints

### Authentication — `/api/auth`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `POST` | `/register` | Đăng ký tài khoản mới | ❌ |
| `POST` | `/login` | Đăng nhập, trả về JWT | ❌ |
| `POST` | `/logout` | Đăng xuất, revoke refresh token | ✅ |
| `POST` | `/refresh-token` | Làm mới Access Token | ❌ cookie |
| `POST` | `/verify-email` | Xác thực OTP email | ❌ |
| `POST` | `/resend-otp` | Gửi lại OTP | ❌ |
| `POST` | `/forgot-password` | Gửi OTP đặt lại mật khẩu | ❌ |
| `POST` | `/reset-password` | Đặt lại mật khẩu bằng OTP | ❌ |
| `GET` | `/me` | Lấy thông tin người dùng hiện tại | ✅ |
| `PUT` | `/update-profile` | Cập nhật hồ sơ | ✅ |
| `PUT` | `/change-password` | Đổi mật khẩu | ✅ |
| `POST` | `/mfa/setup` | Khởi tạo MFA (QR code) | ✅ |
| `POST` | `/mfa/verify` | Xác minh mã TOTP | ✅ |
| `POST` | `/mfa/disable` | Tắt MFA | ✅ |

### KYC — `/api/kyc`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `POST` | `/submit` | Nộp hồ sơ KYC (upload ảnh) | ✅ |
| `GET` | `/status` | Xem trạng thái KYC của mình | ✅ |
| `GET` | `/admin/list` | Danh sách KYC chờ duyệt | ✅ Admin |
| `PUT` | `/admin/:userId/approve` | Chấp thuận KYC | ✅ Admin |
| `PUT` | `/admin/:userId/reject` | Từ chối KYC + lý do | ✅ Admin |

### Biển Số — `/api/plates`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET` | `/` | Danh sách tất cả biển số | ❌ |
| `GET` | `/:id` | Chi tiết một biển số | ❌ |
| `POST` | `/` | Thêm biển số mới | ✅ Admin |
| `PUT` | `/:id` | Sửa thông tin biển số | ✅ Admin |
| `DELETE` | `/:id` | Xóa biển số | ✅ Admin |

### Phiên Đấu Giá — `/api/sessions`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET` | `/` | Danh sách phiên đấu giá | ❌ |
| `GET` | `/:id` | Chi tiết phiên | ❌ |
| `POST` | `/` | Tạo phiên mới | ✅ Admin |
| `PUT` | `/:id` | Cập nhật phiên | ✅ Admin |
| `POST` | `/:id/plates` | Gán biển số vào phiên | ✅ Admin |

### Phòng Đấu Giá — `/api/rooms`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET` | `/` | Danh sách phòng | ❌ |
| `GET` | `/:id` | Chi tiết phòng + trạng thái | ✅ |
| `GET` | `/:id/stats` | Thống kê phòng (admin) | ✅ Admin |

### Đăng Ký Tham Gia — `/api/registrations`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `POST` | `/` | Đăng ký tham gia phòng (khóa ký quỹ) | ✅ |

### Đặt Giá Thầu — `/api/bids`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `POST` | `/` | Đặt giá thầu (fallback REST) | ✅ |
| `GET` | `/room/:roomId` | Lịch sử đặt giá trong phòng | ✅ |

### Thanh Toán — `/api/payments`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `POST` | `/deposit` | Nạp tiền vào ví | ✅ |
| `POST` | `/auction-payment` | Thanh toán kết quả đấu giá | ✅ |
| `GET` | `/history` | Lịch sử thanh toán | ✅ |
| `POST` | `/admin/confirm` | Xác nhận thanh toán (admin) | ✅ Admin |

### Ví Điện Tử — `/api/wallet`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET` | `/balance` | Xem số dư ví | ✅ |
| `GET` | `/transactions` | Lịch sử giao dịch ví | ✅ |
| `POST` | `/withdraw` | Yêu cầu rút tiền | ✅ |

### Thông Báo — `/api/notifications`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET` | `/` | Danh sách thông báo | ✅ |
| `PUT` | `/:id/read` | Đánh dấu đã đọc | ✅ |
| `PUT` | `/read-all` | Đánh dấu tất cả đã đọc | ✅ |

### Yêu Thích — `/api/favorites`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET` | `/` | Danh sách yêu thích | ✅ |
| `POST` | `/` | Thêm vào yêu thích | ✅ |
| `DELETE` | `/:plateId` | Xóa khỏi yêu thích | ✅ |

### Admin — `/api/admin`
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET` | `/dashboard` | Thống kê tổng quan | ✅ Admin |
| `GET` | `/users` | Danh sách người dùng | ✅ Admin |
| `PUT` | `/users/:id/ban` | Ban tài khoản | ✅ Admin |
| `GET` | `/auction-results` | Kết quả đấu giá toàn hệ thống | ✅ Admin |

---

## Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB Atlas** account (hoặc local MongoDB)
- Tài khoản **Cloudinary** (upload ảnh)
- Tài khoản **Brevo** (gửi email)

### 1. Clone Repository
```bash
git clone https://github.com/Duzcc/AuctionWeb.git
cd AuctionWeb
```

### 2. Cài Đặt Backend
```bash
cd backend
npm install
```

Tạo file `.env` từ template:
```bash
cp .env.example .env
# Điền các biến môi trường vào .env
```

### 3. Cài Đặt Frontend
```bash
cd ../react-app
npm install
```

Tạo file `.env`:
```bash
# react-app/.env
VITE_API_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050
```

### 4. Seed Dữ Liệu Mẫu (Tùy chọn)
```bash
cd backend

# Seed đầy đủ (users + plates + sessions + rooms)
npm run seed

# Chỉ seed biển số mẫu
npm run seed:plates

# Chỉ seed phòng đấu giá
npm run seed:rooms

# Xóa toàn bộ và seed lại từ đầu
npm run seed:clean
```

### 5. Khởi Động Ứng Dụng

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev    # Node.js watch mode (tự động restart khi có thay đổi)
# hoặc
npm start      # Production mode
```

**Terminal 2 — Frontend:**
```bash
cd react-app
npm run dev    # Vite dev server, mặc định port 5173
```

Truy cập ứng dụng tại: [http://localhost:5173](http://localhost:5173)

API Health Check: [http://localhost:5050/health](http://localhost:5050/health)

---

## Biến Môi Trường

### Backend (`backend/.env`)
```env
# ===== Server =====
PORT=5050
NODE_ENV=development                    # development | production

# ===== Database =====
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/auctions_db

# ===== JWT Authentication =====
JWT_SECRET=<your-256-bit-secret>
JWT_ACCESS_EXPIRY=15m                   # Access token hết hạn sau 15 phút
JWT_REFRESH_EXPIRY=7d                   # Refresh token hết hạn sau 7 ngày

# ===== Cloudinary (Image Upload) =====
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# ===== Brevo SMTP (Email Service) =====
BREVO_API_KEY=<brevo_api_key>
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_EMAIL=<your_email@gmail.com>
SMTP_PASSWORD=<smtp_password>

# ===== CORS =====
FRONTEND_URL=http://localhost:5173

# ===== Upload =====
MAX_FILE_SIZE=5242880                   # 5MB tính bằng bytes

# ===== Admin =====
ADMIN_NOTIFICATION_EMAIL=admin@example.com
```

### Frontend (`react-app/.env`)
```env
VITE_API_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050
```

> **Lưu ý bảo mật:** Không bao giờ commit file `.env` lên Git. Cả hai thư mục đã có `.gitignore` exclude các file này.

---

## Luồng Nghiệp Vụ

### Luồng Đăng Ký & Xác Thực
```
Người dùng → Đăng ký → Nhận OTP qua Email → Xác thực OTP → Đăng nhập
           → [Tùy chọn] Kích hoạt MFA → Scan QR code → Xác thực TOTP
```

### Luồng Tham Gia Đấu Giá
```
1. Đăng nhập ✅
2. Hoàn thiện hồ sơ + nộp KYC (CMND/CCCD + selfie)
3. Admin duyệt KYC → Trạng thái "approved"
4. Nạp tiền vào ví (tối thiểu bằng mức ký quỹ)
5. Đăng ký phòng đấu giá → Hệ thống khóa tiền ký quỹ
6. Vào phòng khi đến giờ → Đặt giá thầu qua WebSocket
7. Kết thúc đấu giá → Người thắng nhận thông báo, tiến hành thanh toán
8. Người thua → Hoàn trả tiền ký quỹ vào ví
```

### Luồng Đặt Giá Thầu (Real-time)
```
Client gửi bid → Server validate (đủ số dư, đúng bước giá, trong thời gian) 
              → Cập nhật giá hiện tại trong Room 
              → Broadcast tới tất cả clients trong phòng qua Socket.IO
              → Lưu bid vào DB
              → Timer reset (nếu có cơ chế gia hạn)
```

---

## ⚡ WebSocket Events

### Client → Server (Emit)
| Event | Payload | Mô tả |
|-------|---------|-------|
| `join_room` | `{ roomId, token }` | Vào phòng đấu giá |
| `leave_room` | `{ roomId }` | Rời phòng |
| `place_bid` | `{ roomId, amount }` | Đặt giá thầu |
| `send_message` | `{ roomId, message }` | Gửi tin nhắn trong phòng |

### Server → Client (Listen)
| Event | Payload | Mô tả |
|-------|---------|-------|
| `room_joined` | `{ room, participants }` | Xác nhận vào phòng thành công |
| `new_bid` | `{ bid, currentPrice, bidder }` | Có người đặt giá mới |
| `bid_error` | `{ message }` | Lỗi khi đặt giá |
| `auction_started` | `{ roomId, startTime, endTime }` | Phiên đấu giá bắt đầu |
| `auction_ended` | `{ roomId, winner, finalPrice }` | Phiên đấu giá kết thúc |
| `timer_update` | `{ roomId, remainingSeconds }` | Cập nhật đồng hồ đếm ngược |
| `new_message` | `{ message, sender, timestamp }` | Tin nhắn chat mới |
| `notification` | `{ type, message }` | Thông báo hệ thống |

---

## Bảo Mật

| Cơ chế | Mô tả |
|--------|-------|
| **Argon2 Password Hashing** | Mã hóa mật khẩu bằng Argon2id (chống brute-force GPU) |
| **JWT + Refresh Token** | Access token ngắn hạn (15m) + Refresh token dài hạn (7d) trong httpOnly cookie |
| **OTP Email Verification** | OTP 6 chữ số, có hạn 10 phút, hashed trước khi lưu |
| **MFA / TOTP** | Hỗ trợ Google Authenticator, Authy. Secret không lộ ra client |
| **Account Lockout** | Khóa tài khoản 2 giờ sau 5 lần đăng nhập sai |
| **CORS Whitelist** | Chỉ chấp nhận request từ domain frontend được cấu hình |
| **Input Validation** | Validate toàn bộ input với `express-validator` |
| **Role-based Access** | Phân quyền `user` / `admin` ở middleware layer |
| **File Upload Security** | Giới hạn kích thước file (5MB), chỉ chấp nhận ảnh |
| **httpOnly Cookies** | Refresh token lưu trong cookie không thể truy cập bởi JS |

---

## Tác Giả

**Trần Văn Đức**
- Sinh viên CNTT — Backend Engineer Intern
- Email: vduc31100@gmail.com
- GitHub: [Duzcc](https://github.com/Duzcc)
- LinkedIn: [Trần Văn Đức](https://linkedin.com/in/tranvanduc)

---

## License

Dự án này được cấp phép theo [MIT License](LICENSE).

---

<div align="center">


</div>
