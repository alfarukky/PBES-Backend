import * as declarationService from '../services/declaration.services.js';

export const createDeclaration = async (req, res) => {
  try {
    const { id, role, commandLocation } = req.user;
    const { status = 'STORED' } = req.body;
    const result = await declarationService.createDeclaration(
      req.body,
      id, // User ID
      role, // User role
      status, // Status
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

export const assessDeclaration = async (req, res) => {
  try {
    const assessedDeclaration = await declarationService.assessDeclaration(
      req.params.id,
      req.user.id, // Pass user ID
      req.user.role // Pass user role
    );

    res.status(200).json({
      success: true,
      data: assessedDeclaration,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateDeclaration = async (req, res) => {
  try {
    const updatedDeclaration = await declarationService.updateDeclaration(
      req.params.id,
      req.body,
      req.user.id, // Pass user ID
      req.user.role // Pass user role
    );

    res.status(200).json({
      success: true,
      data: updatedDeclaration,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const cancelDeclaration = async (req, res) => {
  try {
    const cancelledDeclaration = await declarationService.cancelDeclaration(
      req.params.id,
      req.user.id,
      req.user.role // Pass user role
    );
    res.status(200).json({
      success: true,
      data: cancelledDeclaration,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};
