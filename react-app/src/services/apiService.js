import axiosInstance from './axiosInstance';

/**
 * Plate API Service
 */
export const plateService = {
    /**
     * Get all plates with filters and pagination
     */
    getPlates: async (params = {}) => {
        const response = await axiosInstance.get('/plates', { params });
        return response.data;
    },

    /**
     * Get single plate by ID
     */
    getPlateById: async (id) => {
        const response = await axiosInstance.get(`/plates/${id}`);
        return response.data;
    },

    /**
     * Get plate statistics
     */
    getStats: async () => {
        const response = await axiosInstance.get('/plates/stats');
        return response.data;
    },

    /**
     * Create new plate (Admin only)
     */
    createPlate: async (plateData) => {
        const response = await axiosInstance.post('/plates', plateData);
        return response.data;
    },

    /**
     * Update plate (Admin only)
     */
    updatePlate: async (id, plateData) => {
        const response = await axiosInstance.put(`/plates/${id}`, plateData);
        return response.data;
    },

    /**
     * Delete plate (Admin only)
     */
    deletePlate: async (id) => {
        const response = await axiosInstance.delete(`/plates/${id}`);
        return response.data;
    },
};

/**
 * Session API Service
 */
export const sessionService = {
    /**
     * Get all sessions with filters and pagination
     */
    getSessions: async (params = {}) => {
        const response = await axiosInstance.get('/sessions', { params });
        return response.data;
    },

    /**
     * Get single session by ID
     */
    getSessionById: async (id) => {
        const response = await axiosInstance.get(`/sessions/${id}`);
        return response.data;
    },

    /**
     * Get plates in a session
     */
    getSessionPlates: async (id, params = {}) => {
        const response = await axiosInstance.get(`/sessions/${id}/plates`, { params });
        return response.data;
    },

    /**
     * Create new session (Admin only)
     */
    createSession: async (sessionData) => {
        const response = await axiosInstance.post('/sessions', sessionData);
        return response.data;
    },

    /**
     * Update session (Admin only)
     */
    updateSession: async (id, sessionData) => {
        const response = await axiosInstance.put(`/sessions/${id}`, sessionData);
        return response.data;
    },
};

/**
 * Room API Service
 */
export const roomService = {
    /**
     * Get all rooms
     */
    getRooms: async (params = {}) => {
        const response = await axiosInstance.get('/rooms', { params });
        return response.data;
    },

    /**
     * Get single room by ID
     */
    getRoomById: async (id) => {
        const response = await axiosInstance.get(`/rooms/${id}`);
        return response.data;
    },

    /**
     * Create new room (Admin only)
     */
    createRoom: async (roomData) => {
        const response = await axiosInstance.post('/rooms', roomData);
        return response.data;
    },

    /**
     * Update room (Admin only)
     */
    updateRoom: async (id, roomData) => {
        const response = await axiosInstance.put(`/rooms/${id}`, roomData);
        return response.data;
    },
};

/**
 * Favorite API Service
 */
export const favoriteService = {
    /**
     * Get user's favorites with pagination
     */
    getFavorites: async (params = {}) => {
        const response = await axiosInstance.get('/favorites', { params });
        return response.data;
    },

    /**
     * Add plate to favorites
     */
    addFavorite: async (plateId) => {
        const response = await axiosInstance.post('/favorites', { plateId });
        return response.data;
    },

    /**
     * Remove plate from favorites
     */
    removeFavorite: async (plateId) => {
        const response = await axiosInstance.delete(`/favorites/${plateId}`);
        return response.data;
    },

    /**
     * Check if plate is in favorites
     */
    checkFavorite: async (plateId) => {
        const response = await axiosInstance.get(`/favorites/check/${plateId}`);
        return response.data;
    },
};

/**
 * Auction API Service
 */
export const auctionService = {
    /**
     * Get available plates in active sessions (for registration)
     */
    getAvailablePlates: async (params = {}) => {
        const response = await axiosInstance.get('/auction/available', { params });
        return response.data;
    },

    /**
     * Get auction results (sold plates with winner info)
     */
    getAuctionResults: async (params = {}) => {
        const response = await axiosInstance.get('/auction/results', { params });
        return response.data;
    },
};
