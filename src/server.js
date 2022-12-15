var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import { connectDB } from './config/mongoose.js';
import { router } from './routes/router.js';
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connectDB();
            const app = express();
            // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
            app.use(helmet());
            // Set up a morgan logger using the dev format for log entries.
            app.use(logger('dev'));
            // Parse requests of the content type application/json.
            app.use(express.json());
            // Register routes.
            app.use('/', router);
            // Error handler.
            app.use(function (err, req, res, next) {
                err.status = err.status || 500;
                // Set error messages depending on status code
                if (err.status === 500) {
                    err.message = 'An unexpected condition was encountered.';
                }
                else if (err.status === 409) {
                    err.message = 'The username and/or email address is already registered.';
                }
                if (req.app.get('env') !== 'development') {
                    return res
                        .status(err.status)
                        .json({
                        status: err.status,
                        message: err.message
                    });
                }
                // Dev only
                // Only providing detailed error in development.
                return res
                    .status(err.status)
                    .json({
                    status: err.status,
                    message: err.message,
                    cause: err.cause
                        ? {
                            status: err.cause.status,
                            message: err.cause.message,
                            stack: err.cause.stack
                        }
                        : null,
                    stack: err.stack
                });
            });
            // Starts the HTTP server listening for connections.
            app.listen(process.env.PORT, () => {
                console.log(`Server running at http://localhost:${process.env.PORT}`);
                console.log('Press Ctrl-C to terminate...');
            });
        }
        catch (err) {
            console.error(err);
            process.exitCode = 1;
        }
    });
}
start();
