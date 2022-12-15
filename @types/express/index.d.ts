export {}

declare interface RequestUser {
        sub: string
}

declare global {
    namespace Express {
        interface Request {
            user: RequestUser
            query: QueryResults
        }
    }
}

