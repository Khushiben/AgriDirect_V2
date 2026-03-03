const express = require('express');
const router = express.Router();
const { 
  getCommodityPrices, 
  getAvailableCommodities, 
  getMultipleCommodityPrices 
} = require('../controllers/priceController');

// GET /api/prices/commodity?crop=<crop_name>&state=<state_name>
// Get prices for a specific commodity
router.get('/commodity', getCommodityPrices);

// GET /api/prices/commodities
// Get list of all available commodities
router.get('/commodities', getAvailableCommodities);

// POST /api/prices/multiple
// Get prices for multiple commodities at once
// Body: { crops: ["Rice", "Wheat", "Corn"], state: "Gujarat" }
router.post('/multiple', getMultipleCommodityPrices);

module.exports = router;
