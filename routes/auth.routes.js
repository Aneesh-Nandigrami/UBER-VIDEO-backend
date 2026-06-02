const express = require("express");

const router = express.Router();

const sendOTPEmail =
    require("../services/mail.service");

const generateOTP =
    require("../utils/generateOTP");

const otpModel = require("../models/otp.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

router.post("/send-otp", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email required"
            });

        }

        const otp = generateOTP();

        console.log("OTP:", otp);

        // save otp in database here

        await sendOTPEmail(email, otp);

        res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Failed to send OTP"
        });

    }

});

// ================= FORGOT PASSWORD - SEND OTP =================
router.post("/forgot-password-send-otp", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if email exists in User or Captain collection
        const userExists = await userModel.findOne({ email: normalizedEmail });
        const captainExists = await captainModel.findOne({ email: normalizedEmail });

        if (!userExists && !captainExists) {
            return res.status(404).json({
                success: false,
                message: "Email not found in our records"
            });
        }

        // Delete any existing OTP for this email
        await otpModel.deleteMany({ email: normalizedEmail });

        // Generate new OTP
        const otp = generateOTP();

        // Save OTP to database
        await otpModel.create({
            email: normalizedEmail,
            otp: otp,
            verified: false
        });

        // Send OTP via email
        await sendOTPEmail(normalizedEmail, otp);

        console.log(`✅ OTP sent to ${normalizedEmail}: ${otp}`);

        res.status(200).json({
            success: true,
            message: "OTP sent to your email successfully"
        });

    } catch (error) {

        console.error("FORGOT PASSWORD ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send OTP",
            error: error.message
        });

    }

});

// ================= FORGOT PASSWORD - VERIFY OTP =================
router.post("/forgot-password-verify-otp", async (req, res) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find OTP record
        const otpRecord = await otpModel.findOne({
            email: normalizedEmail,
            otp: otp.trim().toUpperCase()
        });

        if (!otpRecord) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(401).json({
                success: false,
                message: "OTP has expired"
            });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        console.log(`✅ OTP verified for ${normalizedEmail}`);

        res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {

        console.error("OTP VERIFICATION ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
            error: error.message
        });

    }

});

// ================= FORGOT PASSWORD - RESET PASSWORD =================
router.post("/forgot-password-reset", async (req, res) => {

    try {

        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Verify OTP first
        const otpRecord = await otpModel.findOne({
            email: normalizedEmail,
            otp: otp.trim().toUpperCase(),
            verified: true
        });

        if (!otpRecord) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP or OTP not verified"
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(401).json({
                success: false,
                message: "OTP has expired"
            });
        }

        // Hash new password
        const hashedPassword = await userModel.hashPassword(newPassword.trim());

        // Try updating user first
        let user = await userModel.findOne({ email: normalizedEmail });

        if (user) {
            user.password = hashedPassword;
            await user.save();
            console.log(`✅ User password updated for ${normalizedEmail}`);
        } else {
            // Try updating captain
            let captain = await captainModel.findOne({ email: normalizedEmail });

            if (captain) {
                const captainHashedPassword = await captainModel.hashPassword(newPassword.trim());
                captain.password = captainHashedPassword;
                await captain.save();
                console.log(`✅ Captain password updated for ${normalizedEmail}`);
            } else {
                return res.status(404).json({
                    success: false,
                    message: "User/Captain not found"
                });
            }
        }

        // Delete OTP after successful password reset
        await otpModel.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {

        console.error("PASSWORD RESET ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to reset password",
            error: error.message
        });

    }

});

module.exports = router;