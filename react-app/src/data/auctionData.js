// Mock auction data for car plates
export const carAuctionData = [
    {
        id: 1,
        plateNumber: "30K-888.88",
        province: "Hà Nội",
        type: "Tứ quý",
        startPrice: 40000000,
        currentPrice: 250000000,
        auctionTime: "10:00 26/12/2025",
        status: "Đang đấu giá",
        image: "/assets/plates/car-plate.png"
    },
    {
        id: 2,
        plateNumber: "51F-123.45",
        province: "Hà Nội",
        type: "Sảnh tiến",
        startPrice: 40000000,
        currentPrice: 180000000,
        auctionTime: "10:30 26/12/2025",
        status: "Đang đấu giá",
        image: "/assets/plates/car-plate.png"
    },
    {
        id: 3,
        plateNumber: "29A-999.99",
        province: "Hà Nội",
        type: "Ngũ quý",
        startPrice: 500000000,
        currentPrice: 2800000000,
        auctionTime: "11:00 26/12/2025",
        status: "Sắp diễn ra",
        image: "/assets/plates/car-plate.png"
    }
];

export const motorbikeAuctionData = [
    {
        id: 1,
        plateNumber: "29AA-888.88",
        province: "Hà Nội",
        type: "Tứ quý",
        startPrice: 5000000,
        currentPrice: 45000000,
        auctionTime: "14:00 26/12/2025",
        status: "Đang đấu giá",
        image: "/assets/plates/motorbike-plate.png"
    },
    {
        id: 2,
        plateNumber: "30AB-123.45",
        province: "Hà Nội",
        type: "Sảnh tiến",
        startPrice: 5000000,
        currentPrice: 18000000,
        auctionTime: "14:30 26/12/2025",
        status: "Đang đấu giá",
        image: "/assets/plates/motorbike-plate.png"
    }
];

export const assetData = [
    {
        id: 1,
        name: "Xe ô tô Toyota Camry 2.5Q 2020",
        shortTitle: "Toyota Camry 2020",
        type: "Xe ô tô",
        startPrice: 450000000,
        currentPrice: 520000000,
        location: "Hà Nội",
        auctionTime: "10:00 28/12/2025",
        registerTime: "17:00 27/12/2025",
        status: "Đang đấu giá",
        image: "/assets/assets/car.jpg",
        images: [
            "/assets/assets/car.jpg",
            "/assets/assets/car.jpg",
            "/assets/assets/car.jpg",
            "/assets/assets/car.jpg"
        ],
        description: "Xe Toyota Camry 2.5Q sản xuất năm 2020, màu đen, nội thất kem. Xe tư nhân chính chủ, biển số Hà Nội. Cam kết không đâm đụng, ngập nước. Động cơ 2.5L mạnh mẽ, hộp số tự động 6 cấp. Trang bị đầy đủ tiện nghi: cửa sổ trời, ghế điện, nhớ ghế, màn hình DVD, camera lùi...",
        specifications: [
            { label: "Năm sản xuất", value: "2020" },
            { label: "Hãng xe", value: "Toyota" },
            { label: "Dòng xe", value: "Camry" },
            { label: "Phiên bản", value: "2.5Q" },
            { label: "Màu sắc", value: "Đen" },
            { label: "Odo", value: "45,000 km" },
            { label: "Tình trạng", value: "Đã qua sử dụng" }
        ],
        category: "Phương tiện giao thông",
        depositAmount: 50000000,
        depositPercent: 10,
        auctionInfo: {
            method: "Trả giá lên",
            priceStep: 5000000,
            participants: 12,
            viewCount: 1542
        }
    },
    {
        id: 2,
        name: "Nhà phố 3 tầng mặt tiền Xã Đàn, Đống Đa",
        shortTitle: "Nhà phố Xã Đàn",
        type: "Bất động sản",
        startPrice: 8500000000,
        currentPrice: 9200000000,
        location: "Hà Nội",
        auctionTime: "15:00 28/12/2025",
        registerTime: "12:00 28/12/2025",
        status: "Sắp diễn ra",
        image: "/assets/assets/house.jpg",
        images: [
            "/assets/assets/house.jpg",
            "/assets/assets/house.jpg",
            "/assets/assets/house.jpg"
        ],
        description: "Nhà phố 3 tầng tại mặt đường Xã Đàn, quận Đống Đa, Hà Nội. Diện tích đất 80m2, mặt tiền 5m. Vị trí đắc địa, kinh doanh sầm uất. Sổ đỏ chính chủ, pháp lý rõ ràng. Nhà xây kiên cố, thiết kế hiện đại, phù hợp vừa ở vừa kinh doanh hoặc cho thuê văn phòng.",
        specifications: [
            { label: "Diện tích đất", value: "80 m2" },
            { label: "Diện tích xây dựng", value: "240 m2" },
            { label: "Mặt tiền", value: "5 m" },
            { label: "Hướng", value: "Đông Nam" },
            { label: "Số tầng", value: "3" },
            { label: "Số phòng ngủ", value: "4" },
            { label: "Pháp lý", value: "Sổ đỏ" }
        ],
        category: "Bất động sản",
        depositAmount: 500000000,
        depositPercent: 5,
        auctionInfo: {
            method: "Trả giá lên",
            priceStep: 50000000,
            participants: 5,
            viewCount: 890
        }
    }
];
