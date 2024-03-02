const mongoose = require("mongoose");

const kotSchema = mongoose.Schema({
 item:{
    type:String
 },
 date:{
    type:String
 },
 qty:{
    type:Number
 },
 user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
 }
});

module.exports = mongoose.model("kotModel", kotSchema);