interface Error {
    status?: number,
    message: string,
    cause: {
        status?: number,
        message: string,
        stack: string
    },
    code: number
}