
/**
 * Calculate deposit amount based on start price
 * @param {string|number} startPrice - e.g. "40.000.000 đ" or 40000000
 * @returns {string} Formatted deposit amount
 */
export function calculateDeposit(startPrice) {
    // Simple logic based on known VPA rules or fallback
    // Typically deposit is same as start price for standard plates, but let's emulate logic
    // If string, clean it
    let price = startPrice;
    if (typeof price === 'string') {
        price = parseInt(price.replace(/[^0-9]/g, ''));
    }

    // Example logic: Deposit is usually 40tr for car, 5tr for moto
    // But strictly adhering to input:
    if (!price) return '0 đ';

    // Return formatted currency
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

/**
 * Detect special pattern for a plate number
 * @param {string} plateNumber - e.g. "30K-123.45"
 * @returns {string} Pattern name or "Bình thường"
 */
export function detectPlatePattern(plateNumber) {
    if (!plateNumber) return '';
    const cleanBox = plateNumber.split('-')[1] || '';
    const digits = cleanBox.replace('.', ''); // "12345"
    if (digits.length !== 5) return 'Bình thường';

    // Check specific patterns
    // 1. Ngũ quý (555.55)
    if (/^(\d)\1{4}$/.test(digits)) return 'Ngũ quý';

    // 2. Tứ quý (x99.99 or 999.9x)
    if (/^(\d)\1{3}\d$/.test(digits) || /^\d(\d)\1{3}$/.test(digits)) return 'Tứ quý'; // Strictly 4 repeating? 
    // Usually Tứ quý in VN context means 4 matches at end often, or just 4 matches. 
    // Let's stick to regex like: \d*(\d)\1{3}\d*
    // Simple check for 4 consecutive same digits
    if (/(\d)\1{3}/.test(digits)) return 'Tứ quý';

    // 3. Tam hoa (x88.8x, xx8.88, 888.xx)
    if (/(\d)\1{2}/.test(digits)) return 'Tam hoa';

    // 4. Sảnh tiến (123.45, 234.56...)
    const seq = "0123456789";
    if (seq.includes(digits)) return 'Sảnh tiến';
    // Sub-sequences of length 4 or 3?
    // Often "Sảnh tiến" is strictly increasing 12345.

    // 5. Lộc phát (68, 86)
    if (digits.endsWith('68') || digits.endsWith('86')) return 'Lộc phát';

    // 6. Thần tài (39, 79)
    if (digits.endsWith('39') || digits.endsWith('79')) return 'Thần tài';

    // 7. Ông địa (38, 78)
    if (digits.endsWith('38') || digits.endsWith('78')) return 'Ông địa';

    // 8. Lặp đôi (12.12, 12.21 is ganh)
    // ab.ab
    if (digits[0] === digits[3] && digits[1] === digits[4]) return 'Lặp đôi';

    // 9. Số gánh (aba.ba? or ab.ba?)
    // xy.yx (last 4: 12.21) -> digits: x1221
    const last4 = digits.slice(1);
    if (last4[0] === last4[3] && last4[1] === last4[2]) return 'Số gánh';

    return 'Bình thường';
}
