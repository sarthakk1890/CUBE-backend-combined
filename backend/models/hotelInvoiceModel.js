const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    guestName: {
        type: String,
        require: true
    },
    guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
        require: true
    },
    roomNum: {
        type: String,
        require: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms',
        require: true
    },
    invoiceId: {
        type: String,
        require: true // booking ID
    },
    discount: {
        type: Number,
        require: true
    },
    serviceCharge: {
        type: Number,
        require: true
    },
    checkout: {
        type: String
    },
    checkIn: {
        type: String
    },
    checkInTime: {
        type: String
    },
    checkOutTime: {
        type: String
    },
    gst: {
        type: Number,
        // require: true
    },
    net: {
        type: Number,
        require: true
    },
    rent: {
        type: Number
    },
    dailyRent: {
        type: Number
    },
    stay: {
        type: Number //No. Of days 
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gstAmt: {
        type: Number
    },
    paymentMode: {
        type: String
    },
    advancePayment: {
        type: Number
    }
},
    {
        timestamps: true

    });

const Invoice = mongoose.model('HotelInvoice', invoiceSchema);
module.exports = Invoice;