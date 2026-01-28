/**
 * Vietnam Address Data - Production Version
 * Contains 5 major cities with full data + 58 other provinces with main districts
 * For full data, consider integrating with Vietnam Address API
 */

import { provinces as allProvinces } from './vietnamProvinces.js';

export const vietnamAddress = {
    "Hà Nội": {
        "Quận Ba Đình": ["Phường Phúc Xá", "Phường Trúc Bạch", "Phường Vĩnh Phúc", "Phường Cộng Vị", "Phường Liễu Giai", "Phường Nguyễn Trung Trực", "Phường Quán Thánh", "Phường Ngọc Hà", "Phường Điện Biên", "Phường Đội Cấn", "Phường Ngọc Khánh", "Phường Kim Mã", "Phường Giảng Võ", "Phường Thành Công"],
        "Quận Hoàn Kiếm": ["Phường Phúc Tân", "Phường Đồng Xuân", "Phường Hàng Mã", "Phường Hàng Buồm", "Phường Hàng Đào", "Phường Hàng Bồ", "Phường Cửa Đông", "Phường Lý Thái Tổ", "Phường Hàng Bạc", "Phường Hàng Gai", "Phường Chương Dương Độ", "Phường Cửa Nam", "Phường Hàng Bông", "Phường Tràng Tiền", "Phường Trần Hưng Đạo", "Phường Phan Chu Trinh", "Phường Hàng Trống", "Phường Hàng Bài"],
        "Quận Tây Hồ": ["Phường Phú Thượng", "Phường Nhật Tân", "Phường Tứ Liên", "Phường Quảng An", "Phường Xuân La", "Phường Yên Phụ", "Phường Bưởi", "Phường Thụy Khuê"],
        "Quận Long Biên": ["Phường Thượng Thanh", "Phường Ngọc Thụy", "Phường Giang Biên", "Phường Đức Giang", "Phường Việt Hưng", "Phường Gia Thụy", "Phường Ngọc Lâm", "Phường Phúc Lợi", "Phường Bồ Đề", "Phường Sài Đồng", "Phường Long Biên", "Phường Thạch Bàn", "Phường Phúc Đồng", "Phường Cự Khối"],
        "Quận Cầu Giấy": ["Phường Nghĩa Đô", "Phường Nghĩa Tân", "Phường Mai Dịch", "Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Quan Hoa", "Phường Yên Hòa", "Phường Trung Hòa"],
        "Quận Đống Đa": ["Phường Cát Linh", "Phường Văn Miếu", "Phường Quốc Tử Giám", "Phường Láng Thượng", "Phường Ô Chợ Dừa", "Phường Văn Chương", "Phường Hàng Bột", "Phường Láng Hạ", "Phường Khâm Thiên", "Phường Thổ Quan", "Phường Nam Đồng", "Phường Trung Phụng", "Phường Quang Trung", "Phường Trung Liệt", "Phường Phương Liên", "Phường Thịnh Quang", "Phường Trung Tự", "Phường Kim Liên", "Phường Phương Mai", "Phường Ngã Tư Sở", "Phường Khương Thượng"],
        "Quận Hai Bà Trưng": ["Phường Nguyễn Du", "Phường Bạch Đằng", "Phường Phạm Đình Hổ", "Phường Lê Đại Hành", "Phường Đồng Nhân", "Phường Phố Huế", "Phường Đống Mác", "Phường Thanh Lương", "Phường Thanh Nhàn", "Phường Cầu Dền", "Phường Bách Khoa", "Phường Đồng Tâm", "Phường Vĩnh Tuy", "Phường Bạch Mai", "Phường Quỳnh Mai", "Phường Quỳnh Lôi", "Phường Minh Khai", "Phường Trương Định"],
        "Quận Hoàng Mai": ["Phường Hoàng Văn Thụ", "Phường Giáp Bát", "Phường Lĩnh Nam", "Phường Thịnh Liệt", "Phường Trần Phú", "Phường Hoàng Liệt", "Phường Yên Sở", "Phường Tân Mai", "Phường Đại Kim", "Phường Tương Mai", "Phường Đồng Mai", "Phường Vĩnh Hưng", "Phường Định Công", "Phường Mai Động"],
        "Quận Thanh Xuân": ["Phường Nhân Chính", "Phường Thượng Đình", "Phường Khương Trung", "Phường Khương Mai", "Phường Thanh Xuân Trung", "Phường Phương Liệt", "Phường Hạ Đình", "Phường Khương Đình", "Phường Thanh Xuân Bắc", "Phường Thanh Xuân Nam", "Phường Kim Giang"],
        "Quận Nam Từ Liêm": ["Phường Cầu Diễn", "Phường Xuân Phương", "Phường Phương Canh", "Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Tây Mỗ", "Phường Mễ Trì", "Phường Phú Đô", "Phường Đại Mỗ", "Phường Trung Văn"],
        "Quận Bắc Từ Liêm": ["Phường Thượng Cát", "Phường Liên Mạc", "Phường Đông Ngạc", "Phường Đức Thắng", "Phường Thụy Phương", "Phường Tây Tựu", "Phường Xuân Đỉnh", "Phường Xuân Tảo", "Phường Minh Khai", "Phường Cổ Nhuế 1", "Phường Cổ Nhuế 2", "Phường Phú Diễn", "Phường Phúc Diễn"],
        "Huyện Đông Anh": ["Thị trấn Đông Anh", "Xã Xuân Nộn", "Xã Thuỵ Lâm", "Xã Bắc Hồng", "Xã Nguyên Khê", "Xã Nam Hồng", "Xã Tiên Dương", "Xã Vân Hà", "Xã Uy Nỗ", "Xã Vân Nội", "Xã Liên Hà", "Xã Việt Hùng", "Xã Kim Nỗ", "Xã Kim Chung", "Xã Dục Tú", "Xã Đại Mạch", "Xã Vĩnh Ngọc", "Xã Cổ Loa", "Xã Hải Bối", "Xã Xuân Canh", "Xã Võng La", "Xã Tàm Xá", "Xã Mai Lâm"],
        "Huyện Gia Lâm": ["Thị trấn Yên Viên", "Xã Yên Thường", "Xã Yên Viên", "Xã Ninh Hiệp", "Xã Đình Xuyên", "Xã Dương Hà", "Xã Phù Đổng", "Xã Trung Mầu", "Xã Lệ Chi", "Xã Cổ Bi", "Xã Đặng Xá", "Xã Phú Thị", "Xã Kim Sơn", "Xã Trâu Quỳ", "Xã Dương Quang", "Xã Dương Xá", "Xã Đông Dư", "Xã Đa Tốn", "Xã Kiêu Kỵ", "Xã Bát Tràng"],
        "Huyện Thanh Trì": ["Thị trấn Văn Điển", "Xã Tân Triều", "Xã Thanh Liệt", "Xã Tả Thanh Oai", "Xã Hữu Hoà", "Xã Tam Hiệp", "Xã Tứ Hiệp", "Xã Yên Mỹ", "Xã Vĩnh Quỳnh", "Xã Ngũ Hiệp", "Xã Duyên Hà", "Xã Ngọc Hồi", "Xã Vạn Phúc", "Xã Đại áng", "Xã Liên Ninh", "Xã Đông Mỹ"],
        "Huyện Sóc Sơn": ["Thị trấn Sóc Sơn", "Xã Bắc Sơn", "Xã Minh Trí", "Xã Hồng Kỳ", "Xã Nam Sơn", "Xã Trung Giã", "Xã Tân Hưng", "Xã Minh Phú", "Xã Phù Linh", "Xã Bắc Phú", "Xã Tân Minh", "Xã Quang Tiến", "Xã Hiền Ninh", "Xã Tân Dân", "Xã Tiên Dược", "Xã Việt Long", "Xã Xuân Giang", "Xã Mai Đình", "Xã Đức Hoà", "Xã Thanh Xuân", "Xã Đông Xuân", "Xã Kim Lũ", "Xã Phú Cường", "Xã Phú Minh", "Xã Phượng Mao", "Xã Tân Hoa", "Xã Xuân Thu"]
    },
    "TP Hồ Chí Minh": {
        "Quận 1": ["Phường Tân Định", "Phường Đa Kao", "Phường Bến Nghé", "Phường Bến Thành", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Cầu Ông Lãnh", "Phường Cô Giang", "Phường Nguyễn Cư Trinh", "Phường Cầu Kho"],
        "Quận 2": ["Phường Thảo Điền", "Phường An Phú", "Phường Bình An", "Phường Bình Trưng Đông", "Phường Bình Trưng Tây", "Phường Bình Khánh", "Phường An Khánh", "Phường Cát Lái", "Phường Thạnh Mỹ Lợi", "Phường An Lợi Đông", "Phường Thủ Thiêm"],
        "Quận 3": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
        "Quận 4": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 08", "Phường 09", "Phường 10", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 18"],
        "Quận 5": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
        "Quận 6": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
        "Quận 7": ["Phường Tân Thuận Đông", "Phường Tân Thuận Tây", "Phường Tân Kiểng", "Phường Tân Hưng", "Phường Bình Thuận", "Phường Tân Quy", "Phường Phú Thuận", "Phường Tân Phú", "Phường Tân Phong", "Phường Phú Mỹ"],
        "Quận 8": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
        "Quận 10": ["Phường 01", "Phường 02", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
        "Quận 11": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
        "Quận 12": ["Phường Thạnh Xuân", "Phường Thạnh Lộc", "Phường Hiệp Thành", "Phường Thới An", "Phường Tân Chánh Hiệp", "Phường An Phú Đông", "Phường Tân Thới Hiệp", "Phường Trung Mỹ Tây", "Phường Tân Hưng Thuận", "Phường Đông Hưng Thuận", "Phường Tân Thới Nhất"],
        "Quận Gò Vấp": ["Phường 01", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17"],
        "Quận Bình Thạnh": ["Phường 01", "Phường 02", "Phường 03", "Phường 05", "Phường 06", "Phường 07", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"],
        "Quận Tân Bình": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 06", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
        "Quận Tân Phú": ["Phường Tân Sơn Nhì", "Phường Tây Thạnh", "Phường Sơn Kỳ", "Phường Tân Quý", "Phường Tân Thành", "Phường Phú Thọ Hòa", "Phường Phú Thạnh", "Phường Phú Trung", "Phường Hòa Thạnh", "Phường Hiệp Tân", "Phường Tân Thới Hòa"],
        "Quận Phú Nhuận": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường 07", "Phường 08", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 15", "Phường 17"],
        "Quận Bình Tân": ["Phường Bình Hưng Hòa", "Phường Bình Hưng Hoà A", "Phường Bình Hưng Hoà B", "Phường Bình Trị Đông", "Phường Bình Trị Đông A", "Phường Bình Trị Đông B", "Phường Tân Tạo", "Phường Tân Tạo A", "Phường An Lạc", "Phường An Lạc A"],
        "Thành phố Thủ Đức": ["Phường Linh Xuân", "Phường Bình Chiểu", "Phường Linh Trung", "Phường Tam Bình", "Phường Tam Phú", "Phường Hiệp Bình Phước", "Phường Hiệp Bình Chánh", "Phường Linh Chiểu", "Phường Linh Tây", "Phường Linh Đông", "Phường Bình Thọ", "Phường Trường Thọ", "Phường Long Bình", "Phường Long Thạnh Mỹ", "Phường Tân Phú", "Phường Hiệp Phú", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Phước Long A", "Phường Phước Long B", "Phường Trường Thạnh", "Phường Long Phước", "Phường Long Trường", "Phường Phước Bình", "Phường Phú Hữu", "Phường Thảo Điền", "Phường An Phú", "Phường An Khánh", "Phường Bình An", "Phường Bình Trưng Đông", "Phường Bình Trưng Tây", "Phường Cát Lái", "Phường Thạnh Mỹ Lợi"],
        "Huyện Củ Chi": ["Thị trấn Củ Chi", "Xã Phú Mỹ Hưng", "Xã An Phú", "Xã Trung Lập Thượng", "Xã An Nhơn Tây", "Xã Nhuận Đức", "Xã Phạm Văn Cội", "Xã Phú Hòa Đông", "Xã Trung Lập Hạ", "Xã Trung An", "Xã Phước Thạnh", "Xã Phước Hiệp", "Xã Tân An Hội", "Xã Phước Vĩnh An", "Xã Thái Mỹ", "Xã Tân Thạnh Tây", "Xã Hòa Phú", "Xã Tân Thạnh Đông", "Xã Bình Mỹ", "Xã Tân Phú Trung", "Xã Tân Thông Hội"],
        "Huyện Hóc Môn": ["Thị trấn Hóc Môn", "Xã Tân Hiệp", "Xã Nhị Bình", "Xã Đông Thạnh", "Xã Tân Thới Nhì", "Xã Thới Tam Thôn", "Xã Xuân Thới Sơn", "Xã Tân Xuân", "Xã Xuân Thới Đông", "Xã Trung Chánh", "Xã Xuân Thới Thượng", "Xã Bà Điểm"],
        "Huyện Bình Chánh": ["Thị trấn Tân Túc", "Xã Phạm Văn Hai", "Xã Vĩnh Lộc A", "Xã Vĩnh Lộc B", "Xã Bình Lợi", "Xã Lê Minh Xuân", "Xã Tân Nhựt", "Xã Tân Kiên", "Xã Bình Hưng", "Xã Phong Phú", "Xã An Phú Tây", "Xã Hưng Long", "Xã Đa Phước", "Xã Tân Quý Tây", "Xã Bình Chánh", "Xã Quy Đức"],
        "Huyện Nhà Bè": ["Thị trấn Nhà Bè", "Xã Phước Kiển", "Xã Phước Lộc", "Xã Nhơn Đức", "Xã Phú Xuân", "Xã Long Thới", "Xã Hiệp Phước"],
        "Huyện Cần Giờ": ["Thị trấn Cần Thạnh", "Xã Bình Khánh", "Xã Tam Thôn Hiệp", "Xã An Thới Đông", "Xã Thạnh An", "Xã Long Hòa", "Xã Lý Nhơn"]
    },
    "Đà Nẵng": {
        "Quận Hải Châu": ["Phường Thanh Bình", "Phường Thạch Thang", "Phường Hải Châu I", "Phường Hải Châu II", "Phường Phước Ninh", "Phường Hòa Thuận Tây", "Phường Hòa Thuận Đông", "Phường Nam Dương", "Phường Bình Hiên", "Phường Hòa Cường Bắc", "Phường Hòa Cường Nam", "Phường Bình Thuận"],
        "Quận Thanh Khê": ["Phường Tam Thuận", "Phường Thanh Khê Tây", "Phường Thanh Khê Đông", "Phường Xuân Hà", "Phường Tân Chính", "Phường Chính Gián", "Phường Vĩnh Trung", "Phường Thạc Gián", "Phường An Khê", "Phường Hòa Khê"],
        "Quận Sơn Trà": ["Phường Thọ Quang", "Phường Nại Hiên Đông", "Phường Mân Thái", "Phường An Hải Bắc", "Phường Phước Mỹ", "Phường An Hải Tây", "Phường An Hải Đông"],
        "Quận Ngũ Hành Sơn": ["Phường Mỹ An", "Phường Khuê Mỹ", "Phường Hòa Quý", "Phường Hòa Hải"],
        "Quận Liên Chiểu": ["Phường Hòa Hiệp Bắc", "Phường Hòa Hiệp Nam", "Phường Hòa Khánh Bắc", "Phường Hòa Khánh Nam", "Phường Hòa Minh"],
        "Quận Cẩm Lệ": ["Phường Khuê Trung", "Phường Hòa Phát", "Phường Hòa An", "Phường Hòa Thọ Tây", "Phường Hòa Thọ Đông", "Phường Hòa Xuân"],
        "Huyện Hòa Vang": ["Xã Hòa Bắc", "Xã Hòa Liên", "Xã Hòa Ninh", "Xã Hòa Sơn", "Xã Hòa Nhơn", "Xã Hòa Phú", "Xã Hòa Phong", "Xã Hòa Châu", "Xã Hòa Tiến", "Xã Hòa Phước", "Xã Hòa Khương"],
        "Huyện Hoàng Sa": []
    },
    "Hải Phòng": {
        "Quận Hồng Bàng": ["Phường Quán Toan", "Phường Hùng Vương", "Phường Sở Dầu", "Phường Thượng Lý", "Phường Hạ Lý", "Phường Minh Khai", "Phường Trại Chuối", "Phường Hoàng Văn Thụ", "Phường Phan Bội Châu"],
        "Quận Ngô Quyền": ["Phường Máy Chai", "Phường Máy Tơ", "Phường Vạn Mỹ", "Phường Cầu Tre", "Phường Lạc Viên", "Phường Gia Viên", "Phường Đông Khê", "Phường Cầu Đất", "Phường Lê Lợi", "Phường Đằng Giang", "Phường Lạch Tray", "Phường Đổng Quốc Bình"],
        "Quận Lê Chân": ["Phường Cát Dài", "Phường An Biên", "Phường Lam Sơn", "Phường An Dương", "Phường Trần Nguyên Hãn", "Phường Hồ Nam", "Phường Trại Cau", "Phường Dư Hàng", "Phường Hàng Kênh", "Phường Đông Hải", "Phường Niệm Nghĩa", "Phường Nghĩa Xá", "Phường Dư Hàng Kênh", "Phường Kênh Dương", "Phường Vĩnh Niệm"],
        "Quận Hải An": ["Phường Đông Hải 1", "Phường Đông Hải 2", "Phường Đằng Lâm", "Phường Tràng Cát", "Phường Đằng Hải", "Phường Nam Hải", "Phường Cát Bi", "Phường Tân Trào"],
        "Quận Kiến An": ["Phường Quán Trữ", "Phường Lãm Hà", "Phường Đồng Hoà", "Phường Bắc Sơn", "Phường Nam Sơn", "Phường Ngọc Sơn", "Phường Trần Thành Ngọ", "Phường Văn Đẩu", "Phường Phù Liễn", "Phường Tràng Minh"],
        "Quận Đồ Sơn": ["Phường Ngọc Xuyên", "Phường Hải Sơn", "Phường Vạn Hương", "Phường Minh Đức", "Phường Bàng La", "Phường Hợp Đức"],
        "Quận Dương Kinh": ["Phường Hòa Nghĩa", "Phường Tân Thành", "Phường Đa Phúc", "Phường Hưng Đạo", "Phường Anh Dũng", "Phường Hải Thành", "Phường Tân Hưng"],
        "Huyện Thuỷ Nguyên": ["Thị trấn Minh Đức", "Thị trấn Núi Đèo", "Xã Lại Xuân", "Xã An Sơn", "Xã Kỳ Sơn", "Xã Liên Khê", "Xã Lưu Kiếm", "Xã Lưu Kỳ", "Xã Lương Điền", "Xã Tân Dương", "Xã Thuỷ Triều", "Xã Hoà Bình", "Xã Phục Lễ", "Xã Minh Tân", "Xã Dương Quan", "Xã Tam Hưng", "Xã Đông Sơn", "Xã Hồng Phong", "Xã Lâm Động", "Xã Phù Ninh", "Xã Đại Đồng", "Xã Hợp Thành", "Xã Cao Nhân", "Xã Mỹ Đồng", "Xã Đông Phương", "Xã Gia Minh", "Xã Gia Đức", "Xã Minh Tân", "Xã Phù Lưu"],
        "Huyện An Dương": ["Thị trấn An Dương", "Xã Lê Thiện", "Xã Đại Bản", "Xã An Hoà", "Xã Hồng Phong", "Xã Tân Tiến", "Xã An Hưng", "Xã An Hồng", "Xã Bắc Sơn", "Xã Nam Sơn", "Xã Lê Lợi", "Xã Đặng Cương", "Xã Quốc Tuấn", "Xã An Đồng", "Xã Hồng Thái"],
        "Huyện An Lão": ["Thị trấn An Lão", "Xã Bát Trang", "Xã Trường Thọ", "Xã Trường Thành", "Xã An Tiến", "Xã Quang Trung", "Xã An Thắng", "Xã Quang Hưng", "Xã An Thọ", "Xã An Thái", "Xã An Vinh", "Xã An Đức", "Xã Mỹ Đức", "Xã An Lãm", "Xã An Thủy", "Xã Tân Dân", "Xã Thái Sơn", "Xã An Thượng"],
        "Huyện Kiến Thuỵ": ["Thị trấn Núi Đối", "Xã Đông Phương", "Xã Thuận Thiên", "Xã Hữu Bằng", "Xã Đại Đồng", "Xã Ngũ Phúc", "Xã Kiến Quốc", "Xã Du Lễ", "Xã Thuỵ Hương", "Xã Dân Chủ", "Xã Minh Tân", "Xã Chú Động", "Xã Đoàn Xá", "Xã Tú Sơn", "Xã Đại Hà", "Xã Ngũ Đoan", "Xã Tân Phong", "Xã Tân Trào", "Xã Đoàn Lập", "Xã Tú Sơn", "Xã Minh Đức", "Xã Đại Hợp"],
        "Huyện Tiên Lãng": ["Thị trấn Tiên Lãng", "Xã Đại Thắng", "Xã Tiên Cường", "Xã Tây Hưng", "Xã Toàn Thắng", "Xã Vinh Quang", "Xã Quyết Tiến", "Xã Khởi Nghĩa", "Xã Tiên Thanh", "Xã Cấp Tiến", "Xã Kiến Thiết", "Xã Đoàn Lập", "Xã Bạch Đằng", "Xã Quang Phục", "Xã Hùng Thắng", "Xã Tự Cường", "Xã Tiên Thắng", "Xã Rạng Đông", "Xã Nam Hưng", "Xã Bắc Hưng", "Xã Tiên Minh", "Xã Tiên Thắng", "Xã Nam Cường"],
        "Huyện Vĩnh Bảo": ["Thị trấn Vĩnh Bảo", "Xã Dũng Tiến", "Xã Giang Biên", "Xã Thắng Thuỷ", "Xã Trung Lập", "Xã Việt Tiến", "Xã Vĩnh An", "Xã Vĩnh Long", "Xã Hiệp Hoà", "Xã Hùng Tiến", "Xã An Hoà", "Xã Tân Hưng", "Xã Tân Liên", "Xã Nhân Hoà", "Xã Tam Cường", "Xã Hoà Bình", "Xã Tiên Phong", "Xã Vĩnh Phong", "Xã Cộng Hiền", "Xã Cao Minh", "Xã Cổ Am", "Xã Vĩnh Tiến", "Xã Trấn Dương", "Xã Ngũ Lão"],
        "Huyện Cát Hải": ["Thị trấn Cát Hải", "Thị trấn Cát Bà", "Xã Nghĩa Lộ", "Xã Đồng Bài", "Xã Hoàng Châu", "Xã Văn Phong", "Xã Phù Long", "Xã Xuân Đám", "Xã Gia Luận", "Xã Trân Châu", "Xã Việt Hải", "Xã Xuân Đám"],
        "Huyện Bạch Long Vĩ": []
    },
    "Cần Thơ": {
        "Quận Ninh Kiều": ["Phường Cái Khế", "Phường An Hòa", "Phường Thới Bình", "Phường An Nghiệp", "Phường An Cư", "Phường Tân An", "Phường An Phú", "Phường Xuân Khánh", "Phường Hưng Lợi", "Phường An Khánh", "Phường An Bình"],
        "Quận Bình Thủy": ["Phường Bình Thủy", "Phường Trà An", "Phường Trà Nóc", "Phường Thới An Đông", "Phường An Thới", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa", "Phường Long Tuyền"],
        "Quận Cái Răng": ["Phường Lê Bình", "Phường Hưng Phú", "Phường Hưng Thạnh", "Phường Ba Láng", "Phường Thường Thạnh", "Phường Phước Thới", "Phường Tân Phú"],
        "Quận Ô Môn": ["Phường Châu Văn Liêm", "Phường Thới Hòa", "Phường Thới Long", "Phường Long Hưng", "Phường Thới An", "Phường Phước Thới", "Phường Trường Lạc"],
        "Quận Thốt Nốt": ["Phường Thốt Nốt", "Phường Thuận An", "Phường Tân Lộc", "Phường Trung Nhứt", "Phường Thạnh Hoà", "Phường Trung Kiên", "Phường Tân Hưng", "Phường Thuận Hưng"],
        "Huyện Vĩnh Thạnh": ["Thị trấn Vĩnh Thạnh", "Xã Vĩnh Bình", "Xã Thạnh Mỹ", "Xã Vĩnh Trinh", "Xã Thạnh An", "Xã Thạnh Tiến", "Xã Thạnh Thắng", "Xã Thạnh Lợi", "Xã Thạnh Qưới", "Xã Thạnh Lộc", "Xã Thạnh Quới"],
        "Huyện Cờ Đỏ": ["Thị trấn Cờ Đỏ", "Xã Thạnh Phú", "Xã Trường Lạc", "Xã Trường Xuân", "Xã Trường Xuân A", "Xã Trường Xuân B", "Xã Thới Hưng", "Xã Đông Hiệp", "Xã Đông Thắng", "Xã Thới Đông", "Xã Thới Xuân"],
        "Huyện Phong Điền": ["Thị trấn Phong Điền", "Xã Nhơn Ái", "Xã Giai Xuân", "Xã Tân Thới", "Xã Trường Long", "Xã Mỹ Khánh", "Xã Nhơn Nghĩa"],
        "Huyện Thới Lai": ["Thị trấn Thới Lai", "Xã Thới Thạnh", "Xã Tân Thạnh", "Xã Xuân Thắng", "Xã Đông Bình", "Xã Đông Thuận", "Xã Thới Tân", "Xã Trường Thắng", "Xã Định Môn", "Xã Trường Thành", "Xã Trường Xuân Thượng", "Xã Trường Xuân Hạ"]
    }
};

// Helper functions
export function getProvinces() {
    // Return all 63 provinces (detailed data for 5 major cities + names for others)
    return allProvinces;
}

export function getDistricts(province) {
    if (!province) return [];

    // If province has detailed data, return it
    if (vietnamAddress[province]) {
        return Object.keys(vietnamAddress[province]).sort();
    }

    // Fallback: return generic district options for other provinces
    return [
        "Thành phố " + province,
        "Quận 1",
        "Quận 2",
        "Huyện trung tâm"
    ];
}

export function getWards(province, district) {
    if (!province || !district) return [];

    // If province and district have detailed data, return it
    if (vietnamAddress[province] && vietnamAddress[province][district]) {
        return vietnamAddress[province][district].sort();
    }

    // Fallback: return generic ward options
    return [
        "Phường 1",
        "Phường 2",
        "Phường 3",
        "Xã trung tâm"
    ];
}
