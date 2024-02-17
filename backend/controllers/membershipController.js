const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const MemberShip = require("../models/membershipPlans");
const ActiveMembership = require("../models/activeMemberships");
const moment = require('moment-timezone');
const Sales = require('../models/salesModel');

//-----Helper functions-----
function currentDate() {
    const indiaTime = moment.tz('Asia/Kolkata');
    const currentDateTimeInIndia = indiaTime.add(0, 'days').format('YYYY-MM-DD HH:mm:ss');
    return currentDateTimeInIndia;
}

// Create new membership
exports.newMembership = catchAsyncErrors(async (req, res, next) => {
    const { plan, validity, amount } = req.body;

    if (!(plan && validity && amount)) {
        return next(new ErrorHandler("Plan, validity and amount are mandatory", 400));
    }

    req.body.user = req.user._id;

    const memberShip = await MemberShip.create(req.body);

    res.status(201).json({
        success: true,
        memberShip,
    });
});


//Sell membership
exports.sellMembership = catchAsyncErrors(async (req, res, next) => {
    const { party, memberShip } = req.body;

    if (!(party && memberShip)) {
        return next(new ErrorHandler("Party and Membership are mandatory", 400));
    }

    const existingPlan = await ActiveMembership.findOne({ party, memberShip });

    if (existingPlan) {
        return next(new ErrorHandler("A plan with the provided party and membership already exists", 400));
    }

    req.body.createdAt = currentDate();
    req.body.user = req.user._id;
    req.body.lastPaid = currentDate();
    req.body.due = 0;

    const newPlan = await ActiveMembership.create(req.body);

    res.status(201).json({
        success: true,
        newPlan,
    });

});


//Get plan by id --> (Sold membership ID)
exports.getPlan = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const plan = await ActiveMembership.findById(id)
        .populate('user', 'name email')
        .populate('party', 'name address phoneNumber type guardianName')
        .populate('memberShip', 'plan validity amount GSTincluded GSTRate CGST SGST IGST membershipType');

    if (!plan) {
        return next(new ErrorHandler('Plan not found', 404));
    }

    const currentDateTimeInIndia = currentDate();
    const lastPaidDate = moment(plan.lastPaid);
    const todayDate = moment(currentDateTimeInIndia);
    const validityDays = plan.memberShip.validity;

    let dueDays = todayDate.diff(lastPaidDate, 'days');
    dueDays = Math.max(0, dueDays);

    const cyclesPassed = Math.floor(dueDays / validityDays);
    const due = cyclesPassed * plan.memberShip.amount;

    plan.due = due;

    if (plan.validity && plan.validity < dueDays) {
        plan.due = 0;
    }

    const updatedPlan = await plan.save();

    res.status(200).json({
        success: true,
        updatedPlan,
    });
});


//Get all memberships of a party by Id
exports.getAllMemberships = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const plans = await ActiveMembership.find({ party: id, user: req.user._id })
        .populate('user', 'name email')
        .populate('party', 'name address phoneNumber type guardianName')
        .populate('memberShip', 'plan validity amount GSTincluded GSTRate CGST SGST IGST membershipType');

    if (!plans) {
        return next(new ErrorHandler('No plans found for this Party', 404));
    }

    res.status(200).json({
        success: true,
        plans,
    });
})


//Payment made for Membership
exports.payDue = catchAsyncErrors(async (req, res, next) => {
    const { party, paymentDate, membership } = req.body;

    req.body.createdAt = currentDate();
    req.body.user = req.user._id;

    const activeMember = await ActiveMembership.findOne({ user: req.user._id, party: party, memberShip: membership });

    if (!activeMember) {
        return next(new ErrorHandler('No user found for this membership plan', 404));
    }

    activeMember.lastPaid = paymentDate;

    const savedActiveMember = await activeMember.save();

    const newSale = await Sales.create(req.body);

    res.status(200).json({
        success: true,
        newSale,
        savedActiveMember
    });
})

//GetMembership
exports.getMembership = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const memberShip = await MemberShip.findById(id);

    res.status(200).json({
        success: true,
        memberShip
    });

})

//EditMembership
exports.editMembership = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const updatedMemberShip = await MemberShip.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
        success: true,
        updatedMemberShip
    });

})