/**
 * Module for the AccountController.
 *
 * @author Andreas Lillje
 * @version 1.0.0
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
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import validator from 'validator';
import { User } from '../../models/user.js';
import { transporter } from '../../utils/mail-service.js';
import { isValidUsername, isValidPassword } from '../../utils/validation-service.js';
/**
 * Encapsulates a controller.
 */
export class AccountController {
    /**
     * Registers a user.
     *
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.username || !req.body.email || !req.body.password) {
                    const error = createError(400);
                    error.message = 'One or more required fields are missing.';
                    next(error);
                    return;
                }
                else if (!isValidUsername(req.body.username)) {
                    const error = createError(400);
                    error.message = 'The username contains chracters that are not allowed';
                    next(error);
                    return;
                }
                else if (!validator.isEmail(req.body.email)) {
                    const error = createError(400);
                    error.message = 'Invalid email address provided';
                    next(error);
                    return;
                }
                else if (!isValidPassword(req.body.password)) {
                    const error = createError(400);
                    error.message = 'The password must have a length between 10 - 256 characters';
                    next(error);
                    return;
                }
                const user = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                });
                yield user.save();
                res.status(201).json({ id: user.id });
            }
            catch (err) {
                let error = err;
                if (error.code === 11000) {
                    error = createError(409);
                    error.cause = err;
                }
                next(error);
            }
        });
    }
    /**
     * Authenticates a user.
     * Sets user-id to subject in JWT payload & creates an access token.
     *
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.username || !req.body.password) {
                    const error = createError(400);
                    next(error);
                }
                const user = yield User.authenticate(req.body.username.toLowerCase(), req.body.password);
                const payload = {
                    sub: user.id
                };
                const accessToken = jwt.sign(payload, Buffer.from(process.env.ACCESS_TOKEN_SECRET, 'base64').toString('ascii'), {
                    algorithm: 'RS256',
                    expiresIn: process.env.ACCESS_TOKEN_LIFE
                });
                res.status(200).json({
                    access_token: accessToken
                });
            }
            catch (err) {
                const error = createError(401);
                error.cause = err;
                next(error);
            }
        });
    }
    /**
     * Restores a user password, by sending a restore email to user email.
     *
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    sendRestoreEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email) {
                    const error = createError(400);
                    error.message = 'One or more required fields are missing';
                    next(error);
                }
                const user = yield User.findOne({ email: req.body.email });
                if (!user) {
                    const error = createError(404);
                    next(error);
                    return;
                }
                const payload = {
                    sub: user.id
                };
                const restorePasswordToken = jwt.sign(payload, Buffer.from(process.env.PASSWORD_RESET_PRIVATE, 'base64').toString('ascii'), {
                    algorithm: 'RS256',
                    expiresIn: process.env.PASSWORD_RESET_TOKEN_LIFE
                });
                yield transporter.sendMail({
                    from: `"Login Service" <${process.env.EMAIL_USER}>`,
                    to: req.body.email,
                    subject: 'Reset Your Login Service Password',
                    text: `This is your reset token: <b>${restorePasswordToken}</b> <br> Use it as Bearer Authorization to reset your password by making a request to the endpoint /password/reset. <br> For more information, read the documentation: https://app.swaggerhub.com/apis-docs/alillje/Login-Service/1.0.0`,
                    html: `This is your reset token: <b>${restorePasswordToken}</b> <br> Use it as Bearer Authorization to reset your password by making a request to the endpoint /password/reset. <br> For more information, read the documentation: https://app.swaggerhub.com/apis-docs/alillje/Login-Service/1.0.0`
                });
                res.status(204).end();
            }
            catch (err) {
                const error = err;
                next(error);
            }
        });
    }
    /**
     * Reset a user password.
     *
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.newPassword) {
                    const error = createError(400);
                    error.message = 'One or more required fields are missing.';
                    next(error);
                }
                const user = yield User.findById(req.user.sub);
                user.password = req.body.newPassword;
                user.save();
                res
                    .status(204)
                    .end();
            }
            catch (err) {
                let error = err;
                error = createError(400);
                next(error);
            }
        });
    }
    /**
     * Provides req.user to the route if :id is present.
     *
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @param {string} id - The value of the id for the user to load.
     */
    loadUser(req, res, next, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield User.findById(id);
                if (!user) {
                    const error = createError(404);
                    next(error);
                    return;
                }
                req.user = user;
                next();
            }
            catch (err) {
                let error = err;
                if (error.name === 'CastError') {
                    error = createError(404);
                    next(error);
                }
                else {
                    next(error);
                }
            }
        });
    }
}
