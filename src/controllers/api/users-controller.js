var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import createError from 'http-errors';
import { User } from '../../models/user.js';
/**
 * Encapsulates a controller.
 */
export class UsersController {
    /**
     * Provide req.user to the route if :id is present.
     *
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @param {string} id - The value of the id for the image to load.
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
    /**
     * Gets users.
     * Finds and paginate results based on query parameters.
     *
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    getUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {};
            // Pagination
            const page = req.query.page;
            const limit = req.query.limit;
            const startIndex = Number(page) - 1 * Number(limit);
            const results = {};
            try {
                // Check length of all users
                if (req.query.username) {
                    query.username = {
                        $regex: new RegExp(req.query.username, 'i')
                    };
                }
                const allUsers = yield User.find(query);
                results.users = yield User.find(query).limit(limit).skip(startIndex).sort({ username: 1 });
                // Pagination
                if (allUsers.length / Number(limit) > Number(page)) {
                    results.next = {
                        page: Number(page) + 1
                    };
                }
                if (Number(page) > 1 && Number(page) <= allUsers.length / Number(limit)) {
                    results.previous = {
                        page: Number(page) - 1
                    };
                }
                if (req.query.page) {
                    results.pages = Math.ceil(allUsers.length / Number(limit)) || 1;
                }
                res.json(results);
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Deletes a user.
     *
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.user.sub !== req.params.id) {
                    const error = createError(403);
                    next(error);
                    return;
                }
                const user = User.findById(req.user.sub);
                user.remove().exec();
                res.status(204).end();
            }
            catch (err) {
                next(err);
            }
        });
    }
}
