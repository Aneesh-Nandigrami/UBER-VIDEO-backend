const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({
    firstname,
    lastname,
    email,
    password,
    photo,
    color,
    plate,
    capacity,
    model,
    vehicleType
}) => {

    if (!firstname || !lastname || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }

    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password: hashedPassword,
        vehicle: {
            color,
            plate,
            capacity,
            photo: photo || "",
            model: model || vehicleType || "Unknown",
            vehicleType
        },
        location: {
            lat: 0,
            lng: 0
        }
    });

    return captain;
};