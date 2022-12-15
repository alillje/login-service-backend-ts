/**
 * Mongoose configuration.
 *
 * @author Andreas Lillje
 * @version 2.3.1
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
/**
 * Establishes a connection to a database.
 *
 * @returns {Promise} Resolves to this if connection succeeded.
 */
export const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const { connection } = mongoose;
    // Bind connection to events (to get notifications).
    connection.on('connected', () => console.log('MongoDB connection opened.'));
    connection.on('error', err => console.error(`MongoDB connection error occurred: ${err}`));
    connection.on('disconnected', () => console.log('MongoDB is disconnected.'));
    // If the Node.js process ends, close the connection.
    process.on('SIGINT', () => {
        connection.close(() => {
            console.log('MongoDB disconnected due to application termination.');
            process.exit(0);
        });
    });
    // Connect to the server.
    return mongoose.connect(process.env.DB_CONNECTION_STRING);
});
