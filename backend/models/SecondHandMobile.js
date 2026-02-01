const mongoose = require('mongoose');

// Counter schema for auto-increment serialNo
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const secondHandMobileSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        unique: true
    },
    purchaseDate: {
        type: Date,
        required: [true, 'Purchase date is required']
    },
    modelName: {
        type: String,
        required: [true, 'Model name is required'],
        trim: true
    },
    imei1: {
        type: String,
        required: [true, 'IMEI 1 is required'],
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{15}$/.test(v);
            },
            message: 'IMEI 1 must be exactly 15 digits'
        }
    },
    imei2: {
        type: String,
        trim: true,
        default: '',
        validate: {
            validator: function (v) {
                return v === '' || /^\d{15}$/.test(v);
            },
            message: 'IMEI 2 must be exactly 15 digits'
        }
    },
    purchaseAmount: {
        type: String,
        required: [true, 'Purchase amount is required'],
        trim: true
    },
    ramRom: {
        type: String,
        trim: true,
        default: ''
    },
    seller: {
        type: String,
        trim: true,
        default: ''
    },
    salesDate: {
        type: Date,
        default: null
    },
    salesAmount: {
        type: Number,
        default: null,
        min: [0, 'Sales amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['IN_STOCK', 'SOLD'],
        default: 'IN_STOCK'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster IMEI lookups
secondHandMobileSchema.index({ imei1: 1 });
secondHandMobileSchema.index({ imei2: 1 }, { sparse: true });

// Auto-increment serialNo before saving if not provided
secondHandMobileSchema.pre('save', async function (next) {
    // Explicitly check for null or undefined to allow manual entry (including 0 if needed)
    if (this.isNew && (this.serialNo === null || this.serialNo === undefined)) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                'mobileSerialNo',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.serialNo = counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('SecondHandMobile', secondHandMobileSchema);
