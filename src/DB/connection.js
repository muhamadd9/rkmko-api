import mongoose from "mongoose";
import userModel from "./model/User.model.js";
import { hashPassword } from "../utils/security/hash.js";
import { findOne, create } from "./dbService.js";

const connectDB = async () => {
  return await mongoose
    .connect(process.env.DB_URI)
    .then(async () => {
      console.log("Connected to MongoDB");
      
      // Create default admin account if it doesn't exist
      const adminEmail = "admin@gmail.com";
      const adminPassword = "admin123456789";
      
      const existingAdmin = await findOne({
        model: userModel,
        filter: { email: adminEmail },
      });
      
      if (!existingAdmin) {
        await create({
          model: userModel,
          data: {
            email: adminEmail,
            password: hashPassword({ plainText: adminPassword }),
            role: "admin",
          },
        });
        console.log("Default admin account created:", adminEmail);
      }
    })
    .catch((error) => {
      console.log("Error connecting to MongoDB:", error);
    });
};

export default connectDB;
