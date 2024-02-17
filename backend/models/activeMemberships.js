const mongoose = require("mongoose");

const activeMembershipsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },

    party: {
        type: mongoose.Schema.ObjectId,
        ref: "Party",
        required: true
    },

    memberShip: {
        type: mongoose.Schema.ObjectId,
        ref: "MembershipPlans",
        required: true
    },

    lastPaid: {
        type: String
    },

    validity: {
        type: Number,
        required: false
    },

    due: {
        type: Number
    },

    createdAt: {
        type: String,
    }

});

module.exports = mongoose.model("ActiveMemberships", activeMembershipsSchema);
