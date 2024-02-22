const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");
const { newMembership, sellMembership, getPlan, getAllMemberships, payDue, editMembership, getMembership, getAllDues, getAllPlans, deleteMembership } = require('../controllers/membershipController');

router.post("/new", isAuthenticatedUser, newMembership);
router.post("/sell", isAuthenticatedUser, sellMembership);
router.get("/plan/:id", isAuthenticatedUser, getPlan);
router.get("/all/:id", isAuthenticatedUser, getAllMemberships);
router.post("/payDue", isAuthenticatedUser, payDue);

router.route("/:id")
    .put(isAuthenticatedUser, editMembership)
    .get(isAuthenticatedUser, getMembership)
    .delete(isAuthenticatedUser, deleteMembership);

router.post("/allDues", isAuthenticatedUser, getAllDues)

router.post("/allPlans", isAuthenticatedUser, getAllPlans)

module.exports = router; 