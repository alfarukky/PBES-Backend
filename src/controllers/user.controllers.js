import * as userService from '../services/user.services.js';

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.suspendUser(id, req.user.role);
    res
      .status(200)
      .json({ message: 'User suspended successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.user.role);
    res.status(200).json({ data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterRole = req.user.role;
    const result = await userService.getUserById(id, requesterRole);
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: result });
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
    res.status(200).json({
      message: 'User updated successfully',
      data: result,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new password required' });
    }

    const result = await userService.changeUserPassword(
      userId,
      currentPassword,
      newPassword
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterRole = req.user.role;
    await userService.deleteUser(id, requesterRole);
    res.status(204).send(); // No content since the user is deleted
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
