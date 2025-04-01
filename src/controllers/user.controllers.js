import * as userService from '../services/user.services.js';

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.suspendUser(id, req.user.role);
    res.json({ data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.user.role);
    res.json({ data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterRole = req.user.role;
    const result = await userService.getUserById(id, requesterRole);
    res.json({ data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const requesterRole = req.user.role;
    const result = await userService.updateUser(id, updates, requesterRole);
    res.json({
      message: 'User updated successfully',
      data: result,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterRole = req.user.role;
    await userService.deleteUser(id, requesterRole);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
