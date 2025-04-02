import * as commandLocationService from '../services/commandLocation.services.js';

export const createLocation = async (req, res) => {
  try {
    const location = await commandLocationService.createLocation(
      req.body.name,
      req.body.code
    );
    res.status(201).json({
      success: true,
      data: location,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getLocations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Comes from validated paginationSchema

    const location = await commandLocationService.getLocations({
      page: Number(page),
      limit: Number(limit),
    });
    res.status(201).json({
      success: true,
      data: location,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const location = await commandLocationService.updateLocation(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      data: location,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await commandLocationService.deleteLocation(id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: null, // Explicitly state no data is returned (optional)
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};
