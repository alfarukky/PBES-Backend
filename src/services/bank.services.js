import xlsx from 'xlsx';
import fs from 'fs/promises';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';
import Bank from '../model/Schema/bank.Schema.js';

export const importBanksFromExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    if (!data.length) {
      throw new ErrorWithStatus(400, 'Excel file is empty');
    }

    const banks = data.map((item) => ({
      bankCode: String(item['BANK_CODE']).trim(),
      bankName: String(item['BANK_NAME']).trim(),
      bankAddress: item['BANK_ADDRESS']?.trim() || '',
      emailAddress: item['EMAIL_ADDRESS']?.trim() || '',
    }));

    const { deletedCount } = await Bank.deleteMany({});
    await Bank.insertMany(banks);

    await fs.unlink(filePath);

    return {
      success: true,
      message: 'Banks imported successfully',
      imported: banks.length,
      deleted: deletedCount,
    };
  } catch (error) {
    try {
      await fs.unlink(filePath);
    } catch (_) {}

    throw new ErrorWithStatus(400, error.message || 'Error importing banks');
  }
};

export const searchBanks = async (query = '') => {
  try {
    const regex = new RegExp(query, 'i');
    return await Bank.find({
      $or: [{ bankCode: regex }, { bankName: regex }],
    })
      .select('-__v -createdAt -updatedAt')
      .limit(50);
  } catch (error) {
    throw new ErrorWithStatus(400, error.message);
  }
};
