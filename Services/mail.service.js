const nodemailer = require("nodemailer");

// Trim credentials to remove extra spaces and collapse grouped app password values
const emailUser = (process.env.EMAIL_USER || "").trim();
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

if (!emailUser || !emailPass) {
    console.error("❌ EMAIL_USER or EMAIL_PASS not set correctly in .env file");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Mail transporter verification failed:", error.message);
    } else {
        console.log("✅ Mail transporter is ready");
    }
});

const sendOTPEmail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: emailUser,
            to: email,
            subject: "Your OTP Code - Password Reset",
            html: `
                <h2>Password Reset OTP In UBER-DRIVE SAFE LIFE</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <h1 style="letter-spacing: 5px; font-weight: bold;">${otp}</h1>
                <p><strong>This OTP is valid for 10 minutes.</strong></p>
               
            `
        });
        console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
        console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
        throw error;
    }
};

module.exports = sendOTPEmail;