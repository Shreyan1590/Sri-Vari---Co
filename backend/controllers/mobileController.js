const SecondHandMobile = require('../models/SecondHandMobile');

/**
 * @desc    Add a new mobile (IN)
 * @route   POST /api/mobiles
 * @access  Private
 */
const addMobile = async (req, res) => {
    try {
        const { serialNo, purchaseDate, modelName, imei1, imei2, purchaseAmount, ramRom, seller } = req.body;

        // Validate required fields
        if (!purchaseDate || !modelName || !imei1 || purchaseAmount === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: purchaseDate, modelName, imei1, purchaseAmount'
            });
        }

        // Check for duplicate S.No if provided
        if (serialNo) {
            const existingSerial = await SecondHandMobile.findOne({ serialNo });
            if (existingSerial) {
                return res.status(400).json({
                    success: false,
                    message: 'A mobile with this Serial Number already exists'
                });
            }
        }

        // Check for duplicate IMEI 1
        const existingMobile1 = await SecondHandMobile.findOne({ imei1 });
        if (existingMobile1) {
            return res.status(400).json({
                success: false,
                message: 'A mobile with this IMEI 1 already exists'
            });
        }

        // Check for duplicate IMEI 2 if provided
        if (imei2) {
            const existingMobile2 = await SecondHandMobile.findOne({
                $or: [{ imei1: imei2 }, { imei2: imei2 }]
            });
            if (existingMobile2) {
                return res.status(400).json({
                    success: false,
                    message: 'A mobile with this IMEI 2 already exists'
                });
            }
        }

        // Create mobile record
        const mobile = await SecondHandMobile.create({
            serialNo: (serialNo !== undefined && serialNo !== null && serialNo !== '') ? parseInt(serialNo) : undefined,
            purchaseDate,
            modelName,
            imei1,
            imei2: imei2 || '',
            purchaseAmount,
            ramRom: ramRom || '',
            seller: seller || '',
            status: 'IN_STOCK'
        });

        res.status(201).json({
            success: true,
            message: 'Mobile added successfully',
            data: mobile
        });
    } catch (error) {
        console.error('Add mobile error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while adding mobile',
            error: error.message
        });
    }
};

/**
 * @desc    Get all mobiles with optional filtering
 * @route   GET /api/mobiles
 * @access  Private
 */
const getAllMobiles = async (req, res) => {
    try {
        const { status, search, sortBy, sortOrder } = req.query;

        // Build filter query
        let filter = {};
        if (status && ['IN_STOCK', 'SOLD'].includes(status)) {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { modelName: { $regex: search, $options: 'i' } },
                { imei1: { $regex: search, $options: 'i' } },
                { imei2: { $regex: search, $options: 'i' } }
            ];

            // If search is numeric, add serialNo to search options
            if (!isNaN(search)) {
                filter.$or.push({ serialNo: parseInt(search) });
            }
        }

        // Build sort options
        let sort = { createdAt: -1 }; // Default: newest first
        if (sortBy) {
            sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        }

        const mobiles = await SecondHandMobile.find(filter).sort(sort);

        res.status(200).json({
            success: true,
            count: mobiles.length,
            data: mobiles
        });
    } catch (error) {
        console.error('Get mobiles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching mobiles',
            error: error.message
        });
    }
};

/**
 * @desc    Get single mobile by ID
 * @route   GET /api/mobiles/:id
 * @access  Private
 */
const getMobileById = async (req, res) => {
    try {
        const mobile = await SecondHandMobile.findById(req.params.id);

        if (!mobile) {
            return res.status(404).json({
                success: false,
                message: 'Mobile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: mobile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Sell a mobile (OUT)
 * @route   PUT /api/mobiles/:id/sell
 * @access  Private
 */
const sellMobile = async (req, res) => {
    try {
        const { salesDate, salesAmount } = req.body;

        // Validate required fields
        if (!salesDate || salesAmount === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide salesDate and salesAmount'
            });
        }

        // Find mobile
        const mobile = await SecondHandMobile.findById(req.params.id);
        if (!mobile) {
            return res.status(404).json({
                success: false,
                message: 'Mobile not found'
            });
        }

        // Check if already sold
        if (mobile.status === 'SOLD') {
            return res.status(400).json({
                success: false,
                message: 'This mobile has already been sold'
            });
        }

        // Update mobile
        mobile.salesDate = salesDate;
        mobile.salesAmount = salesAmount;
        mobile.status = 'SOLD';
        await mobile.save();

        res.status(200).json({
            success: true,
            message: 'Mobile sold successfully',
            data: mobile
        });
    } catch (error) {
        console.error('Sell mobile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while selling mobile',
            error: error.message
        });
    }
};

/**
 * @desc    Update a mobile
 * @route   PUT /api/mobiles/:id
 * @access  Private
 */
const updateMobile = async (req, res) => {
    try {
        const { serialNo, purchaseDate, modelName, imei1, imei2, purchaseAmount, ramRom, seller, salesDate, salesAmount, status } = req.body;

        // Find mobile
        const mobile = await SecondHandMobile.findById(req.params.id);
        if (!mobile) {
            return res.status(404).json({
                success: false,
                message: 'Mobile not found'
            });
        }

        // Check for duplicate IMEI 1 if changed
        if (imei1 && imei1 !== mobile.imei1) {
            const existingMobile1 = await SecondHandMobile.findOne({ imei1, _id: { $ne: req.params.id } });
            if (existingMobile1) {
                return res.status(400).json({
                    success: false,
                    message: 'A mobile with this IMEI 1 already exists'
                });
            }
        }

        // Check for duplicate IMEI 2 if changed
        if (imei2 && imei2 !== mobile.imei2) {
            const existingMobile2 = await SecondHandMobile.findOne({
                $or: [{ imei1: imei2 }, { imei2: imei2 }],
                _id: { $ne: req.params.id }
            });
            if (existingMobile2) {
                return res.status(400).json({
                    success: false,
                    message: 'A mobile with this IMEI 2 already exists'
                });
            }
        }

        // Check for duplicate S.No if changed
        if (serialNo !== undefined && serialNo !== '' && serialNo != mobile.serialNo) {
            const existingSerial = await SecondHandMobile.findOne({ serialNo, _id: { $ne: req.params.id } });
            if (existingSerial) {
                return res.status(400).json({
                    success: false,
                    message: 'A mobile with this Serial Number already exists'
                });
            }
        }

        // Update fields if provided
        if (serialNo !== undefined && serialNo !== '') {
            mobile.serialNo = parseInt(serialNo);
        }
        if (purchaseDate !== undefined) mobile.purchaseDate = purchaseDate;
        if (modelName !== undefined) mobile.modelName = modelName;
        if (imei1 !== undefined) mobile.imei1 = imei1;
        if (imei2 !== undefined) mobile.imei2 = imei2;
        if (purchaseAmount !== undefined) mobile.purchaseAmount = purchaseAmount;
        if (ramRom !== undefined) mobile.ramRom = ramRom;
        if (seller !== undefined) mobile.seller = seller;
        if (salesDate !== undefined) mobile.salesDate = salesDate;
        if (salesAmount !== undefined) mobile.salesAmount = salesAmount;
        if (status !== undefined) mobile.status = status;

        await mobile.save();

        res.status(200).json({
            success: true,
            message: 'Mobile updated successfully',
            data: mobile
        });
    } catch (error) {
        console.error('Update mobile error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating mobile',
            error: error.message
        });
    }
};

/**
 * @desc    Delete a mobile
 * @route   DELETE /api/mobiles/:id
 * @access  Private
 */
const deleteMobile = async (req, res) => {
    try {
        const mobile = await SecondHandMobile.findById(req.params.id);

        if (!mobile) {
            return res.status(404).json({
                success: false,
                message: 'Mobile not found'
            });
        }

        await SecondHandMobile.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Mobile deleted successfully'
        });
    } catch (error) {
        console.error('Delete mobile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting mobile',
            error: error.message
        });
    }
};

module.exports = {
    addMobile,
    getAllMobiles,
    getMobileById,
    updateMobile,
    sellMobile,
    deleteMobile
};
