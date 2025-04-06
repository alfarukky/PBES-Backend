import * as bankServices from '../services/bank.services.js';

export const importBanks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await bankServices.importBanksFromExcel(req.file.path);
    res.status(200).json(result);
  } catch (error) {
    res.status(err.status || 500).json({ message: error.message });
  }
};

export const getBanks = async (req, res) => {
  try {
    const { q } = req.query;
    const banks = await bankServices.searchBanks(q || '');
    res.status(200).json(banks);
  } catch (error) {
    res.status(err.status || 500).json({ message: error.message });
  }
};
