// Vietnamese province codes for license plates
export const provinceCodesMap = {
    "Thành phố Hà Nội": ["29", "30", "31", "32", "33", "40"],
    "Thành phố Hồ Chí Minh": ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
    "Thành phố Hải Phòng": ["15", "16"],
    "Thành phố Đà Nẵng": ["43"],
    "Thành phố Cần Thơ": ["65"],
    "An Giang": ["67"],
    "Bà Rịa - Vũng Tàu": ["72", "77"],
    "Bắc Giang": ["98"],
    "Bắc Kạn": ["97"],
    "Bạc Liêu": ["94"],
    "Bắc Ninh": ["99"],
    "Bến Tre": ["71"],
    "Bình Định": ["77"],
    "Bình Dương": ["61"],
    "Bình Phước": ["93"],
    "Bình Thuận": ["86"],
    "Cà Mau": ["69"],
    "Cao Bằng": ["11"],
    "Đắk Lắk": ["47"],
    "Đắk Nông": ["48"],
    "Điện Biên": ["27"],
    "Đồng Nai": ["60", "39"],
    "Đồng Tháp": ["66"],
    "Gia Lai": ["81"],
    "Hà Giang": ["23"],
    "Hà Nam": ["90"],
    "Hà Tĩnh": ["38"],
    "Hải Dương": ["34"],
    "Hậu Giang": ["95"],
    "Hòa Bình": ["28"],
    "Hưng Yên": ["89"],
    "Khánh Hòa": ["79"],
    "Kiên Giang": ["68"],
    "Kon Tum": ["82"],
    "Lai Châu": ["25"],
    "Lâm Đồng": ["49"],
    "Lạng Sơn": ["12"],
    "Lào Cai": ["24"],
    "Long An": ["62"],
    "Nam Định": ["18"],
    "Nghệ An": ["37"],
    "Ninh Bình": ["35"],
    "Ninh Thuận": ["85"],
    "Phú Thọ": ["19"],
    "Phú Yên": ["78"],
    "Quảng Bình": ["73"],
    "Quảng Nam": ["92"],
    "Quảng Ngãi": ["76"],
    "Quảng Ninh": ["14"],
    "Quảng Trị": ["74"],
    "Sóc Trăng": ["83"],
    "Sơn La": ["26"],
    "Tây Ninh": ["70"],
    "Thái Bình": ["17"],
    "Thái Nguyên": ["20"],
    "Thanh Hóa": ["36"],
    "Thừa Thiên Huế": ["75"],
    "Tiền Giang": ["63"],
    "Trà Vinh": ["84"],
    "Tuyên Quang": ["22"],
    "Vĩnh Long": ["64"],
    "Vĩnh Phúc": ["88"],
    "Yên Bái": ["21"]
};

// Car series letters (commonly used in Vietnam)
export const carSeriesLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "P", "S", "T", "V", "X", "Y", "Z"];

// Motorcycle series letters
export const motorbikeSeriesLetters = ["AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AK", "AL", "AM", "AN", "AP", "AS", "AT", "AV", "AX", "AY", "AZ",
    "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH", "BK", "BL", "BM", "BN", "BP", "BS", "BT"];

// Plate types with their patterns
export const plateTypePatterns = {
    "Ngũ quý": [
        // 5 cùng số
        {
            pattern: "XXX.XX", generator: () => {
                const digit = Math.floor(Math.random() * 10);
                return `${digit}${digit}${digit}.${digit}${digit}`;
            }
        },
        {
            pattern: "XX.XXX", generator: () => {
                const digit = Math.floor(Math.random() * 10);
                return `${digit}${digit}.${digit}${digit}${digit}`;
            }
        }
    ],
    "Sảnh tiến": [
        // Số tăng dần: 123.45, 234.56, 567.89
        {
            pattern: "XYZ.AB", generator: () => {
                const start = Math.floor(Math.random() * 6);
                return `${start}${start + 1}${start + 2}.${start + 3}${start + 4}`;
            }
        },
        {
            pattern: "AB.CDE", generator: () => {
                const start = Math.floor(Math.random() * 5);
                return `${start}${start + 1}.${start + 2}${start + 3}${start + 4}`;
            }
        }
    ],
    "Tứ quý": [
        // 4 số cùng nhau
        {
            pattern: "XXX.XY", generator: () => {
                const digit = Math.floor(Math.random() * 10);
                const last = Math.floor(Math.random() * 10);
                return `${digit}${digit}${digit}.${digit}${last}`;
            }
        },
        {
            pattern: "YXX.XX", generator: () => {
                const digit = Math.floor(Math.random() * 10);
                const first = Math.floor(Math.random() * 10);
                return `${first}${digit}${digit}.${digit}${digit}`;
            }
        },
        {
            pattern: "XX.XXY", generator: () => {
                const digit = Math.floor(Math.random() * 10);
                const last = Math.floor(Math.random() * 10);
                return `${digit}${digit}.${digit}${digit}${last}`;
            }
        }
    ],
    "Tam hoa": [
        // 3 số giống nhau
        {
            pattern: "XXX.YZ", generator: () => {
                const triple = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const z = Math.floor(Math.random() * 10);
                return `${triple}${triple}${triple}.${y}${z}`;
            }
        },
        {
            pattern: "YZ.XXX", generator: () => {
                const triple = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const z = Math.floor(Math.random() * 10);
                return `${y}${z}.${triple}${triple}${triple}`;
            }
        }
    ],
    "Thần tài": [
        // Có số 39 (Thần tài)
        { pattern: "39X.YZ", generator: () => `39${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}` },
        { pattern: "X39.YZ", generator: () => `${Math.floor(Math.random() * 10)}39.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}` },
        { pattern: "XY.39Z", generator: () => `${Math.floor(Math.random() * 100).toString().padStart(2, '0')}.39${Math.floor(Math.random() * 10)}` }
    ],
    "Lộc phát": [
        // Có số 68 hoặc 86 (Lộc phát)
        { pattern: "68X.YZ", generator: () => `68${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}` },
        { pattern: "X68.YZ", generator: () => `${Math.floor(Math.random() * 10)}68.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}` },
        { pattern: "86X.YZ", generator: () => `86${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}` }
    ],
    "Ông địa": [
        // Có số 38 (Ông địa)
        { pattern: "38X.YZ", generator: () => `38${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}` },
        { pattern: "X38.YZ", generator: () => `${Math.floor(Math.random() * 10)}38.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}` },
        { pattern: "XY.38Z", generator: () => `${Math.floor(Math.random() * 100).toString().padStart(2, '0')}.38${Math.floor(Math.random() * 10)}` }
    ],
    "Số gánh": [
        // Số đối xứng: 121, 131, 252, etc
        {
            pattern: "XYX.AB", generator: () => {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const a = Math.floor(Math.random() * 10);
                const b = Math.floor(Math.random() * 10);
                return `${x}${y}${x}.${a}${b}`;
            }
        },
        {
            pattern: "AB.XYX", generator: () => {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const a = Math.floor(Math.random() * 10);
                const b = Math.floor(Math.random() * 10);
                return `${a}${b}.${x}${y}${x}`;
            }
        }
    ],
    "Lặp đôi": [
        // Số lặp đôi: 11, 22, 33, etc
        {
            pattern: "XX.YZA", generator: () => {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const z = Math.floor(Math.random() * 10);
                const a = Math.floor(Math.random() * 10);
                return `${x}${x}.${y}${z}${a}`;
            }
        },
        {
            pattern: "XYZ.AA", generator: () => {
                const a = Math.floor(Math.random() * 10);
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const z = Math.floor(Math.random() * 10);
                return `${x}${y}${z}.${a}${a}`;
            }
        }
    ],
    "Biển đẹp": [
        // Biển thường, random
        {
            pattern: "XXX.XX", generator: () => {
                const nums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
                return `${nums[0]}${nums[1]}${nums[2]}.${nums[3]}${nums[4]}`;
            }
        }
    ]
};

/**
 * Generate random car plate number
 * @param {string} province - Province name
 * @param {string} plateType - Type of plate
 * @returns {string} Generated plate number
 */
export function generateCarPlate(province, plateType) {
    const codes = provinceCodesMap[province];
    if (!codes || codes.length === 0) {
        throw new Error(`No codes found for province: ${province}`);
    }

    const code = codes[Math.floor(Math.random() * codes.length)];
    const series = carSeriesLetters[Math.floor(Math.random() * carSeriesLetters.length)];

    const patterns = plateTypePatterns[plateType];
    if (!patterns || patterns.length === 0) {
        throw new Error(`No patterns found for plate type: ${plateType}`);
    }

    const patternObj = patterns[Math.floor(Math.random() * patterns.length)];
    const numbers = patternObj.generator();

    return `${code}${series} - ${numbers}`;
}

/**
 * Generate random motorcycle plate number
 * @param {string} province - Province name
 * @param {string} plateType - Type of plate
 * @returns {string} Generated plate number
 */
export function generateMotorbikePlate(province, plateType) {
    const codes = provinceCodesMap[province];
    if (!codes || codes.length === 0) {
        throw new Error(`No codes found for province: ${province}`);
    }

    const code = codes[Math.floor(Math.random() * codes.length)];
    const series = motorbikeSeriesLetters[Math.floor(Math.random() * motorbikeSeriesLetters.length)];

    const patterns = plateTypePatterns[plateType];
    if (!patterns || patterns.length === 0) {
        throw new Error(`No patterns found for plate type: ${plateType}`);
    }

    const patternObj = patterns[Math.floor(Math.random() * patterns.length)];
    const numbers = patternObj.generator();

    return `${code}${series} - ${numbers}`;
}

/**
 * Get price range based on plate type
 * @param {string} plateType - Type of plate
 * @returns {object} Min and max price
 */
export function getPriceRange(plateType) {
    const ranges = {
        "Ngũ quý": { min: 500000000, max: 2000000000 }, // 500M - 2B
        "Sảnh tiến": { min: 150000000, max: 500000000 }, // 150M - 500M
        "Tứ quý": { min: 40000000, max: 150000000 }, // 40M - 150M
        "Tam hoa": { min: 40000000, max: 150000000 }, // 40M - 150M
        "Thần tài": { min: 150000000, max: 1000000000 }, // 150M - 1B
        "Lộc phát": { min: 150000000, max: 1000000000 }, // 150M - 1B
        "Ông địa": { min: 150000000, max: 500000000 }, // 150M - 500M
        "Số gánh": { min: 40000000, max: 500000000 }, // 40M - 500M
        "Lặp đôi": { min: 5000000, max: 150000000 }, // 5M - 150M
        "Biển đẹp": { min: 5000000, max: 40000000 } // 5M - 40M
    };

    return ranges[plateType] || { min: 5000000, max: 40000000 };
}

/**
 * Generate random price within range
 * @param {string} plateType - Type of plate
 * @returns {number} Random price
 */
export function generatePrice(plateType) {
    const { min, max } = getPriceRange(plateType);
    const rawPrice = min + Math.random() * (max - min);

    // Round to nearest million
    return Math.round(rawPrice / 1000000) * 1000000;
}

/**
 * Get all provinces
 * @returns {string[]} Array of province names 
 */
export function getAllProvinces() {
    return Object.keys(provinceCodesMap);
}

/**
 * Get all plate types
 * @returns {string[]} Array of plate types
 */
export function getAllPlateTypes() {
    return Object.keys(plateTypePatterns);
}
