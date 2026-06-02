const blacklistTokenModel = require('../models/blacklistToken.model');
const captainModel = require('../models/captain.model');
const captainService = require('../Services/captain.service');
const cloudinary = require('../config/cloudinary');

const { validationResult } = require('express-validator');


// ======================================
// REGISTER CAPTAIN
// ======================================
module.exports.registerCaptain = async (req, res) => {

    try {

        // VALIDATION
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        let {
            fullname,
            email,
            password,
            vehicle
        } = req.body;

        // PARSE JSON DATA
        if (typeof fullname === "string") {
            fullname = JSON.parse(fullname);
        }

        if (typeof vehicle === "string") {
            vehicle = JSON.parse(vehicle);
        }

        const normalizedEmail = email.trim().toLowerCase();

        // ======================================
        // CHECK EMAIL ALREADY EXISTS
        // ======================================
        const existingCaptain = await captainModel.findOne({
            email: normalizedEmail
        });

        if (existingCaptain) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // ======================================
        // PHOTO UPLOAD
        // ======================================
        let photo = "";

        if (req.file) {

            const uploadResult =
                await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        folder: "captains",
                        resource_type: "image"
                    }
                );

            photo = uploadResult.secure_url || "";
        }

        // ======================================
        // CREATE CAPTAIN
        // ======================================
        const captain =
            await captainService.createCaptain({

                firstname: fullname.firstname,

                lastname: fullname.lastname,

                email: normalizedEmail,

                password,

                photo,

                color: vehicle.color,

                plate: vehicle.plate,

                capacity: vehicle.capacity,

                model: vehicle.model || vehicle.vehicleModel || "",

                vehicleType: vehicle.vehicleType
            });

        // ======================================
        // GENERATE TOKEN
        // ======================================
        const token =
            captain.generateAuthToken();

        return res.status(201).json({

            success: true,

            message:
                "Captain registered successfully",

            token,

            captain
        });

    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        // Mongo Duplicate Key Error
        if (error.code === 11000) {

            return res.status(409).json({

                success: false,

                message:
                    "Email already exists"
            });
        }

        return res.status(500).json({

            success: false,

            message:
                "Server Error",

            error: error.message
        });
    }
};


// ======================================
// LOGIN CAPTAIN
// ======================================
module.exports.loginCaptain = async (req, res) => {

    try {

        const errors =
            validationResult(req);

        if (!errors.isEmpty()) {

            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            email,
            password
        } = req.body;

        const normalizedEmail =
            email.trim().toLowerCase();

        const captain =
            await captainModel
                .findOne({
                    email: normalizedEmail
                })
                .select("+password");

        if (!captain) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }

        const isMatch =
            await captain.comparePassword(
                password
            );

        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }

        const token =
            captain.generateAuthToken();

        res.cookie("token", token);

        return res.status(200).json({

            success: true,

            token,

            captain
        });

    } catch (err) {

        console.log(
            "LOGIN ERROR:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                "Server Error",

            error: err.message
        });
    }
};


// ======================================
// GET CAPTAIN PROFILE
// ======================================
module.exports.getCaptainProfile =
    async (req, res) => {

        try {

            return res.status(200).json({

                success: true,

                captain: req.captain
            });

        } catch (err) {

            return res.status(500).json({

                success: false,

                error: err.message
            });
        }
    };


// ======================================
// LOGOUT CAPTAIN
// ======================================
module.exports.logoutCaptain =
    async (req, res) => {

        try {

            const token =
                req.cookies?.token ||
                req.headers.authorization?.split(" ")[1];

            if (!token) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No token found"
                });
            }

            await blacklistTokenModel.create({
                token
            });

            res.clearCookie("token");

            return res.status(200).json({

                success: true,

                message:
                    "Logout successfully"
            });

        } catch (err) {

            return res.status(500).json({

                success: false,

                error: err.message
            });
        }
    };