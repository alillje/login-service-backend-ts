/**
 * Module for the UsersController.
 *
 * @author Andreas Lillje
 * @version 1.0.0
 */
import { Request, Response, NextFunction } from 'express'
import createError from 'http-errors'
import { User } from '../../models/user.js'

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
  async loadUser (req: Request, res: Response, next: NextFunction, id: string) {
    try {
      const user = await User.findById(id)
      if (!user) {
        const error = createError(404)
        next(error)
        return
      }
      req.user = user
      next()
    } catch (err: any) {
      let error = err
      if (error.name === 'CastError') {
        error = createError(404)
        next(error)
      } else {
        next(error)
      }
    }
  }

  /**
   * Gets users.
   * Finds and paginate results based on query parameters.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getUsers (req: Request, res: Response, next: NextFunction) {
    // const query = {} as Query
    const query = {
      username: {
        $regex: new RegExp('', 'i')
      },
    }

    // const results = {} as QueryResults
    const results = {
      users: {},
      next: {
          page: 0
      },
      previous: {
          page: 0
      },
      pages: 0
    }

    // Pagination
    const page = req.query.page
    const limit = Number(req.query.limit)
    const startIndex = Number(page) - 1 * Number(limit)

    try {
      // Check length of all users
      if (req.query.username) {
        query.username = {
          $regex: new RegExp(req.query.username as string, 'i')
        }
      }
      const allUsers = await User.find(query)
      results.users = await User.find(query).limit(limit).skip(startIndex).sort({ username: 1 })
      // Pagination
      if (allUsers.length / Number(limit) > Number(page)) {
        results.next = {
          page: Number(page) + 1
        }
      }
      if (Number(page) > 1 && Number(page) <= allUsers.length / Number(limit)) {
        results.previous = {
          page: Number(page) - 1
        }
      }

      if (req.query.page) {
        results.pages = Math.ceil(allUsers.length / Number(limit)) || 1
      }
      res.json(results)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async deleteUser (req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user.sub !== req.params.id) {
        const error = createError(403)
        next(error)
        return
      }

      const user = User.findById(req.user.sub)
      user.remove().exec()

      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }
}
