import User from '../models/userModel.js';
import { getPaginationParams, getPaginationMeta, getSortObject } from '../utils/pagination.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'date', order = 'desc' } = req.query;
    
    const { skip, limit: pageLimit, page: currentPage } = getPaginationParams(page, limit);
    const sortObject = getSortObject(sortBy, order);

    const [users, total] = await Promise.all([
      User.find({}, '-password -refreshToken')
        .sort(sortObject)
        .skip(skip)
        .limit(pageLimit),
      User.countDocuments({})
    ]);

    const pagination = getPaginationMeta(currentPage, pageLimit, total);
    res.json({ success: true, data: users, pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?._id?.toString() !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès refusé. Vous ne pouvez supprimer que votre propre compte.' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (req.user?._id?.toString() !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès refusé. Vous ne pouvez modifier que votre propre compte.' });
    }

    const updateData = { name, email };
    // Only admins can change roles
    if (role && req.user?.role === 'admin') {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?._id?.toString() !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès refusé. Vous ne pouvez consulter que votre profil.' });
    }

    const user = await User.findById(id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
