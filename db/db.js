const mongoose = require("mongoose");

const connectDB = async () => {

    try {

        await mongoose.connect(process.env.DB_CONNECT);

        console.log("✅ MongoDB Connected");

    } catch (error) {

        console.log("❌ MongoDB Connection Error");
        console.log(error);

        process.exit(1);
    }
};

module.exports = connectDB;