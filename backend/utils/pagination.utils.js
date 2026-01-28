/**
 * Pagination Helper Utility
 * Provides consistent pagination functionality across all API endpoints
 */

/**
 * Get pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} Pagination parameters
 */
export function getPaginationParams(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    // Validate limits
    const validatedLimit = Math.min(Math.max(limit, 1), 100); // Max 100 per page
    const validatedPage = Math.max(page, 1);
    const validatedSkip = (validatedPage - 1) * validatedLimit;

    return {
        page: validatedPage,
        limit: validatedLimit,
        skip: validatedSkip
    };
}

/**
 * Build sort object from query
 * @param {string} sortBy - Sort field (e.g., "price", "-price", "createdAt")
 * @param {string} defaultSort - Default sort if not provided
 * @returns {Object} MongoDB sort object
 */
export function getSortParams(sortBy, defaultSort = '-createdAt') {
    const sort = sortBy || defaultSort;

    if (sort.startsWith('-')) {
        // Descending order
        return { [sort.substring(1)]: -1 };
    } else {
        // Ascending order
        return { [sort]: 1 };
    }
}

/**
 * Build pagination response
 * @param {Array} data - Data array
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination response object
 */
export function buildPaginationResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage
        }
    };
}

/**
 * Build filter object for plates
 * @param {Object} query - Request query object
 * @returns {Object} MongoDB filter object
 */
export function buildPlateFilter(query) {
    const filter = {};

    // Search by plate number
    if (query.search) {
        filter.plateNumber = { $regex: query.search, $options: 'i' };
    }

    // Filter by province
    if (query.province) {
        filter.province = query.province;
    }

    // Filter by vehicle type
    if (query.vehicleType) {
        filter.vehicleType = query.vehicleType;
    }

    // Filter by plate types (array)
    if (query.types) {
        const types = Array.isArray(query.types) ? query.types : [query.types];
        filter.plateType = { $in: types };
    }

    // Filter by plate colors (array)
    if (query.colors) {
        const colors = Array.isArray(query.colors) ? query.colors : [query.colors];
        filter.plateColor = { $in: colors };
    }

    // Filter by status
    if (query.status) {
        filter.status = query.status;
    }

    // Filter by price range
    if (query.minPrice || query.maxPrice) {
        filter.startingPrice = {};
        if (query.minPrice) {
            filter.startingPrice.$gte = parseInt(query.minPrice);
        }
        if (query.maxPrice) {
            filter.startingPrice.$lte = parseInt(query.maxPrice);
        }
    }

    return filter;
}

/**
 * Build filter object for sessions
 * @param {Object} query - Request query object
 * @returns {Object} MongoDB filter object
 */
export function buildSessionFilter(query) {
    const filter = {};

    // Filter by status
    if (query.status) {
        filter.status = query.status;
    }

    // Filter by room
    if (query.roomId) {
        filter.roomId = query.roomId;
    }

    // Filter by date range
    if (query.startDate || query.endDate) {
        filter.startTime = {};
        if (query.startDate) {
            filter.startTime.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            filter.startTime.$lte = new Date(query.endDate);
        }
    }

    return filter;
}
