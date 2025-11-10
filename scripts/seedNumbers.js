import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import NumberModel from "../src/DB/model/Number.model.js";
import { create, findOne } from "../src/DB/dbService.js";

// Load environment variables - try multiple possible locations
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple .env file locations
const envPaths = [
    resolve(__dirname, "../.env"),
    resolve(__dirname, "../src/config/.env"),
    resolve(__dirname, "../src/config/.env.dev"),
];

for (const envPath of envPaths) {
    if (existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log(`Loaded .env from: ${envPath}`);
        break;
    }
}

// Also try default dotenv.config() as fallback
if (!process.env.DB_URI) {
    dotenv.config();
}

const connectDB = async () => {
    try {
        if (!process.env.DB_URI) {
            console.error("DB_URI environment variable is not set!");
            console.log("Please make sure you have a .env file with DB_URI set");
            return false;
        }
        await mongoose.connect(process.env.DB_URI);
        console.log("Connected to MongoDB");
        return true;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        return false;
    }
};

const removeDots = (phoneNumber) => {
    return phoneNumber.replace(/\./g, "");
};

const seedNumbers = async () => {
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    try {
        // Read the numbers.json file - try multiple possible paths
        const possiblePaths = [
            join(__dirname, "../../tyrespro-full-design/public/numbers.json"),
            resolve(process.cwd(), "../tyrespro-full-design/public/numbers.json"),
            resolve(__dirname, "../../../tyrespro-full-design/public/numbers.json"),
        ];

        let numbersPath = null;
        for (const path of possiblePaths) {
            if (existsSync(path)) {
                numbersPath = path;
                break;
            }
        }

        if (!numbersPath) {
            throw new Error(`Could not find numbers.json. Tried paths: ${possiblePaths.join(", ")}`);
        }

        console.log(`Reading numbers from: ${numbersPath}`);
        const numbersData = JSON.parse(readFileSync(numbersPath, "utf-8"));

        let added = 0;
        let skipped = 0;
        let errors = 0;

        // Process individuals array
        for (const item of numbersData.individuals) {
            try {
                // Remove dots from phone number
                const cleanPhoneNumber = removeDots(item.phoneNumber);

                // Check if number already exists
                const existing = await findOne({
                    model: NumberModel,
                    filter: { phoneNumber: cleanPhoneNumber },
                });

                if (existing) {
                    console.log(`Skipped (already exists): ${cleanPhoneNumber}`);
                    skipped++;
                    continue;
                }

                // Create number with status "available" (ignore soldOut field)
                await create({
                    model: NumberModel,
                    data: {
                        phoneNumber: cleanPhoneNumber,
                        rating: item.rating,
                        status: "available",
                    },
                });

                console.log(`Added: ${cleanPhoneNumber} (rating: ${item.rating})`);
                added++;
            } catch (error) {
                console.error(`Error adding ${item.phoneNumber}:`, error.message);
                errors++;
            }
        }

        console.log("\n=== Summary ===");
        console.log(`Added: ${added}`);
        console.log(`Skipped (duplicates): ${skipped}`);
        console.log(`Errors: ${errors}`);
        console.log(`Total processed: ${numbersData.individuals.length}`);

        await mongoose.connection.close();
        console.log("\nDatabase connection closed");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding numbers:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedNumbers();

