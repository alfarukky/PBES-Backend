import Sequence from '../model/Schema/sequence.Schema.js';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';
import Declaration from '../model/Schema/declaration.Schema.js';

export class ReferenceService {
  static async getNextCustomsRef() {
    const year = new Date().getFullYear();
    const seqId = `customsRef-${year}`;

    try {
      const seq = await Sequence.findByIdAndUpdate(
        seqId,
        { $inc: { seq: 1 }, $set: { lastUsed: new Date() } },
        { new: true, upsert: true }
      );
      return `P${seq.seq}${year}`;
    } catch (error) {
      throw new ErrorWithStatus('Failed to generate customs reference', 500);
    }
  }

  static async getNextAssessmentSerial(customsRef) {
    if (!customsRef) throw new Error('Customs reference required', 400);
    return customsRef.replace(/^P/, 'L');
  }

  static async verifyUniqueReferences(customsRef, assessmentSerial) {
    const exists = await Declaration.findOne({
      $or: [
        { customsReferenceNumber: customsRef },
        { assessmentSerial: assessmentSerial },
      ],
    });

    if (exists) {
      throw new ErrorWithStatus('Reference number conflict detected', 409);
    }
  }
}
