import xlsx from 'xlsx';
import fs from 'fs/promises';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';
import Tariff from '../model/Schema/tariff.Schema.js';

export const importTariffsFromExcel = async (filePath) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assuming first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data.length) {
      throw new ErrorWithStatus(400, 'Excel file is empty');
    }

    // Map and clean the data
    const tariffs = data.map((item) => ({
      cetCode: String(item['CET Code']).trim(),
      description: String(item['Description']).trim(),
      su: item['SU'] || null,
      id: item['ID'] || null,
      vat: item['VAT'] || null,
      lvy: item['LVY'] || null,
      exc: item['EXC'] || null,
      dov: item['DOV'] || null,
    }));

    const { deletedCount } = await Tariff.deleteMany({});
    await Tariff.insertMany(tariffs);

    // Clean up uploaded file
    await fs.unlink(filePath);

    return {
      success: true,
      message: 'Data imported successfully',
      imported: tariffs.length,
      deleted: deletedCount,
    };
  } catch (error) {
    try {
      await fs.unlink(filePath);
    } catch (_) {
      // Ignore file deletion error
    }
    // Preserve existing error status or default to 400
    if (!error.status) error.status = 400;
    throw error;
  }
};

export const searchTariffs = async (query) => {
  try {
    const regex = new RegExp(query, 'i');
    return await Tariff.find({
      $or: [{ cetCode: regex }, { description: regex }],
    })
      .select('-__v -createdAt -updatedAt')
      .limit(50);
  } catch (error) {
    throw new ErrorWithStatus(400, error.message);
  }
};
