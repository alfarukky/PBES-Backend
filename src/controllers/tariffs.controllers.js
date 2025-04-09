import * as tariffServices from '../services/tariffs.services.js';

export const importTariffs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await tariffServices.importTariffsFromExcel(req.file.path);
    res.status(200).json(result);
  } catch (error) {
    // Preserve the original status code if available
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message,
      // Include details if available (for 400 errors)
      ...(status === 400 && { details: error.details }),
    });
  }
};

export const getTariffs = async (req, res) => {
  try {
    const tariffs = await tariffServices.getTariffs();
    res.status(200).json(tariffs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
