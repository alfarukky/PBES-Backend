import * as authService from '../services/auth.services.js';

export const registerUser = async (req, res) => {
  try {
    const { serviceNumber, name, email, password, role, commandLocation } =
      req.body;
    const loggedInUserRole = req.user.role;
    const createdBy = req.user._id;

    const result = await authService.registerUser(
      serviceNumber,
      name,
      email,
      password,
      role,
      commandLocation,
      loggedInUserRole,
      createdBy
    );

    res
      .status(201)
      .json({ message: 'User registered successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { serviceNumber, password } = req.body;
    const result = await authService.loginUser(serviceNumber, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await authService.verifyEmail(token);
    if (!result) {
      return res
        .status(404)
        .json({ message: 'Invalid or expired verification token' });
    }
    res
      .status(200)
      .json({ message: 'Email verified successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationEmail(email);
    res
      .status(200)
      .json({ message: 'Verification email sent successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res
      .status(200)
      .json({ message: 'Password reset link sent successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res
      .status(200)
      .json({ message: 'Password reset successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
