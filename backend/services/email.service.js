import SibApiV3Sdk from '@getbrevo/brevo';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Brevo API Instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set API Key
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

/**
 * Helper to send email via Brevo API
 * @param {string} toEmail 
 * @param {string} subject 
 * @param {string} htmlContent 
 */
const sendEmail = async (toEmail, subject, htmlContent) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.sender = {
            email: process.env.SMTP_EMAIL, // From Email
            name: 'Auction Platform'
        };

        // Redirect admin emails explicitly to real email
        let targetEmail = toEmail;
        // Hardcode fix as requested by user
        if (toEmail === 'admin@admin.com' || toEmail === 'admin@auction.com') {
            targetEmail = 'vduc31100@gmail.com';
            console.log(`📧 HARD FIX: Redirecting admin email to ${targetEmail}`);
        } else if (process.env.ADMIN_NOTIFICATION_EMAIL && (toEmail === 'admin@admin.com' || toEmail === 'admin@auction.com')) {
            // Fallback to env var if explicit check fails (though above covers it)
            targetEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
        }

        sendSmtpEmail.to = [{ email: targetEmail }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Email sent to ${targetEmail} | MessageId: ${data.messageId}`);
        return data;
    } catch (error) {
        console.error('❌ Brevo API Error:', error);
        throw new Error('Failed to send email via Brevo API');
    }
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, username) => {
    const subject = 'Chào mừng bạn đến với NPA';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #AA8C3C 0%, #8B7530 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #AA8C3C; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Chào mừng bạn đến với NPA</h1>
            </div>
            <div class="content">
                <p>Xin chào <strong>${username}</strong>,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản! Chúng tôi rất vui mừng chào đón bạn vào cộng đồng đấu giá của chúng tôi.</p>
                <a href="${process.env.FRONTEND_URL}" class="button">Khám phá ngay</a>
                <p style="margin-top: 30px;">Chúc bạn có trải nghiệm tuyệt vời!</p>
            </div>
            <div class="footer">
                <p>Email này được gửi từ Auction Platform.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    return sendEmail(email, subject, html);
};

/**
 * Send OTP Email
 */
export const sendOTPEmail = async (email, otpCode) => {
    const subject = '🔐 Mã xác thực tài khoản của bạn';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #AA8C3C; text-align: center; letter-spacing: 8px; padding: 20px; background: white; border: 2px dashed #AA8C3C; border-radius: 10px; margin: 20px 0; }
            .warning { color: #d32f2f; font-size: 14px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Mã Xác Thực OTP</h1>
            </div>
            <div class="content">
                <p>Bạn đã yêu cầu mã xác thực để hoàn tất đăng ký/đăng nhập.</p>
                <div class="otp-code">${otpCode}</div>
                <p><strong>Mã OTP có hiệu lực trong 10 phút.</strong></p>
                <p class="warning">⚠️ Không chia sẻ mã này với bất kỳ ai.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    return sendEmail(email, subject, html);
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (email, otpCode) => {
    const subject = '🔑 Yêu cầu đặt lại mật khẩu';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        </style>
    </head>
    <body>
        <h2>🔑 Đặt Lại Mật Khẩu</h2>
        <p>Mã xác thực của bạn là: <strong>${otpCode}</strong></p>
        <p>Mã này sẽ hết hạn sau 10 phút.</p>
    </body>
    </html>
    `;
    return sendEmail(email, subject, html);
};

export const sendPaymentPendingEmail = async (email, username, amount, transactionCode, expiryDate) => {
    const subject = '📝 Yêu cầu thanh toán đang chờ xử lý';
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#AA8C3C;">Thanh toán đang chờ</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Số tiền: <strong>${amount ? amount.toLocaleString() : 0} VND</strong></p>
        <p>Mã giao dịch: <strong>${transactionCode}</strong></p>
    </div>
    `;
    return sendEmail(email, subject, html);
};

export const sendPaymentReceivedEmail = async (email, username, amount, transactionCode) => {
    const subject = '✅ Đã nhận được yêu cầu xác nhận thanh toán';
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#4CAF50;">Đã nhận yêu cầu xác nhận</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Chúng tôi đã nhận được bằng chứng thanh toán cho GD <strong>${transactionCode}</strong>.</p>
    </div>
    `;
    return sendEmail(email, subject, html);
};

export const sendPaymentApprovedEmail = async (email, username, amount, info) => {
    const subject = '🎉 Thanh toán thành công';
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#4CAF50;">Thanh toán được phê duyệt</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Thanh toán của bạn cho <strong>${info}</strong> đã thành công.</p>
    </div>
    `;
    return sendEmail(email, subject, html);
};

export default {
    sendWelcomeEmail,
    sendOTPEmail,
    sendPasswordResetEmail,
    sendPaymentPendingEmail,
    sendPaymentReceivedEmail,
    sendPaymentApprovedEmail
};
