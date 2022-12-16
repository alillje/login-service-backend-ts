declare type QueryResults = {
    users?: Promise<object>,
    next?: {
        page: number
    },
    previous: {
        page: number
    },
    pages: number
}

