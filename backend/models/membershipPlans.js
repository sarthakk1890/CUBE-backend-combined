const mongoose = require("mongoose");

const membershipPlansSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },

    plan: {
        type: String,
        required: true
    },

    validity: {
        type: Number,
        required: true
    },

    basePrice: {
        type: Number
    },

    amount: {
        type: Number,
        required: true
    },

    GSTincluded: {
        type: Boolean
    },

    GSTRate: {
        type: Number,
    },

    CGST: {
        type: Number,
    },
    SGST: {
        type: Number,
    },
    IGST: {
        type: Number,
    },

});

module.exports = mongoose.model("MembershipPlans", membershipPlansSchema);
