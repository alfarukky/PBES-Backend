import * as authService from '../services/auth.services.js';

export const registerUser = async (req, res) => {
  try {
    const { serviceNumber, name, email, password, role, commandLocation } =
      req.body;
    const loggedInUserRole = req.user.role; // Get the role of the logged-in user
    const createdBy = req.user._id; // Get the ID of the logged-in user
    const result = await authService.registerUser(
      serviceNumber,
      name,
      email,
      password,
      role,
      commandLocation,
      loggedInUserRole, // Pass the logged-in user's role
      createdBy // Pass the logged-in user's ID
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { serviceNumber, password } = req.body;
    const result = await authService.loginUser(serviceNumber, password);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params; // Extract token from URL parameters
    const result = await authService.verifyEmail(token); // Call the service
    res.json(result); // Send success response
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message }); // Handle errors
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body; // Extract email from request body
    const result = await authService.resendVerificationEmail(email);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // Extract token from URL parameters
    const { newPassword } = req.body; // Extract newPassword from request body
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
