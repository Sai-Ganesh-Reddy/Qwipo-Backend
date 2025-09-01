export const getPagination = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { limit, offset };
};

export const getPaginationMeta = (total, page, limit) => {
    return {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
    };
};
