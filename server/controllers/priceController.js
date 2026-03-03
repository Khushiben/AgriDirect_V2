const axios = require('axios');

// Load environment variables
const API_KEY = process.env.DATA_GOV_API_KEY || "579b464db66ec23bdd0000016d0eeb9a04304526404716fc333f4a62";
const API_URL = process.env.DATA_GOV_API_URL || "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24";

// Get commodity prices for a specific crop and state
exports.getCommodityPrices = async (req, res) => {
  try {
    const { crop, state = "Gujarat" } = req.query;

    if (!crop) {
      return res.status(400).json({ 
        success: false, 
        message: "Crop name is required" 
      });
    }

    const params = {
      "api-key": API_KEY,
      "format": "json",
      "limit": 50,
      "filters[State]": state,
      "filters[Commodity]": crop
    };

    const response = await axios.get(API_URL, { 
      params,
      timeout: 30000,
      headers: {
        "User-Agent": "AgriDirect/1.0"
      }
    });

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = response.data;
    const records = data.records || [];

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No price data found for ${crop} in ${state}`,
        data: []
      });
    }

    // Process and format the data
    const processedData = records.map(record => ({
      district: record.District || '',
      market: record.Market || '',
      commodity: record.Commodity || '',
      variety: record.Variety || '',
      minPrice: parseFloat(record.Min_Price) || 0,
      maxPrice: parseFloat(record.Max_Price) || 0,
      modalPrice: parseFloat(record.Modal_Price) || 0,
      arrivalDate: record.Arrival_Date || '',
      state: record.State || state
    }));

    // Calculate average prices
    const avgMinPrice = processedData.reduce((sum, item) => sum + item.minPrice, 0) / processedData.length;
    const avgMaxPrice = processedData.reduce((sum, item) => sum + item.maxPrice, 0) / processedData.length;
    const avgModalPrice = processedData.reduce((sum, item) => sum + item.modalPrice, 0) / processedData.length;

    res.json({
      success: true,
      message: `Successfully fetched prices for ${crop} in ${state}`,
      crop,
      state,
      totalMarkets: processedData.length,
      averagePrices: {
        min: Math.round(avgMinPrice * 100) / 100,
        max: Math.round(avgMaxPrice * 100) / 100,
        modal: Math.round(avgModalPrice * 100) / 100
      },
      data: processedData
    });

  } catch (error) {
    console.error('Error fetching commodity prices:', error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch commodity prices",
      error: error.message
    });
  }
};

// Get all available commodities
exports.getAvailableCommodities = async (req, res) => {
  try {
    const params = {
      "api-key": API_KEY,
      "format": "json",
      "limit": 100,
      "filters[State]": "Gujarat"
    };

    const response = await axios.get(API_URL, { 
      params,
      timeout: 30000,
      headers: {
        "User-Agent": "AgriDirect/1.0"
      }
    });

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = response.data;
    const records = data.records || [];

    // Extract unique commodities
    const commodities = [...new Set(records.map(record => record.Commodity).filter(Boolean))];

    res.json({
      success: true,
      message: "Successfully fetched available commodities",
      count: commodities.length,
      commodities: commodities.sort()
    });

  } catch (error) {
    console.error('Error fetching commodities:', error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available commodities",
      error: error.message
    });
  }
};

// Get prices for multiple commodities at once
exports.getMultipleCommodityPrices = async (req, res) => {
  try {
    const { crops, state = "Gujarat" } = req.body;

    if (!crops || !Array.isArray(crops) || crops.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Crops array is required" 
      });
    }

    const results = {};

    for (const crop of crops) {
      try {
        const params = {
          "api-key": API_KEY,
          "format": "json",
          "limit": 20,
          "filters[State]": state,
          "filters[Commodity]": crop
        };

        const response = await axios.get(API_URL, { 
          params,
          timeout: 15000,
          headers: {
            "User-Agent": "AgriDirect/1.0"
          }
        });

        const records = response.data.records || [];
        
        if (records.length > 0) {
          const avgModalPrice = records.reduce((sum, record) => 
            sum + (parseFloat(record.Modal_Price) || 0), 0) / records.length;
          
          results[crop] = {
            available: true,
            averagePrice: Math.round(avgModalPrice * 100) / 100,
            marketCount: records.length,
            priceRange: {
              min: Math.min(...records.map(r => parseFloat(r.Min_Price) || 0)),
              max: Math.max(...records.map(r => parseFloat(r.Max_Price) || 0))
            }
          };
        } else {
          results[crop] = {
            available: false,
            message: "No data available"
          };
        }
      } catch (error) {
        results[crop] = {
          available: false,
          error: error.message
        };
      }
    }

    res.json({
      success: true,
      message: "Successfully fetched multiple commodity prices",
      state,
      results
    });

  } catch (error) {
    console.error('Error fetching multiple commodity prices:', error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch multiple commodity prices",
      error: error.message
    });
  }
};
