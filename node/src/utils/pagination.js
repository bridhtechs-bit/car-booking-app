/**
 * Pagination utility to calculate skip and limit values
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} { skip, limit, page }
 */
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Build pagination metadata for response
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {Object} Pagination metadata
 */
export const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Build sorting object for MongoDB
 * @param {string} sortBy - Field to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Object} MongoDB sort object
 */
export const getSortObject = (sortBy = 'createdAt', order = 'desc') => {
  const validSortFields = {
    'price': 'pricePerDay',
    'name': 'name',
    'brand': 'brand',
    'date': 'createdAt',
    'createdAt': 'createdAt',
    'updatedAt': 'updatedAt',
    'status': 'status'
  };

  const field = validSortFields[sortBy] || 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  return { [field]: sortOrder };
};
