export {}

declare type RequestUser = {
    username?: string;
    sub?: string
}

declare global {
    namespace Express {
        interface Request {
            user: RequestUser
        }
    }
}

