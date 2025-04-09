import * as declarationService from '../services/declaration.services.js';

export const createDeclaration = async (req, res) => {
  try {
    const { id, role, commandLocation } = req.user;

    const result = await declarationService.createDeclaration(
      req.body,
      id, // User ID
      role, // User role
      commandLocation._id // Location ObjectId
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getDeclarations = async (req, res) => {
  try {
    // Extract filters from query params
    const filters = {
      status: req.query.status,
      commandLocation: req.query.commandLocation,
    };

    const declarations = await declarationService.getDeclarations(
      req.user,
      filters
    );

    res.status(200).json({
      success: true,
      data: declarations,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getDeclarationById = async (req, res) => {
  try {
    const declaration = await declarationService.getDeclarationById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      data: declaration,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};
