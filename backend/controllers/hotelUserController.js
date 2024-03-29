const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const secretKey ="mysecretKey"
const bcrypt = require('bcrypt');
const RoomTypes = require('../models/hotelRoomTypeModel')
const fs = require('fs');
const Rooms = require('../models/hotelRoomModel');

module.exports.signup=async function(req,res){
    try {
        const { name, businessName, email, password, phoneNumber, address,GstIN } = req.body;
        
        // Check if email or number is already taken
        const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
          return res.status(400).json({ error: 'Email or number is already taken.' });
        }
    
        // Upload image to Cloudinary
        // const result = await cloudinary.uploader.upload(image);
        // console.log(result);

        const imageFile = req.file;
        let imageUrl = "https://cdn-icons-png.flaticon.com/128/1946/1946788.png"
        if(imageFile){
          const result = await cloudinary.uploader.upload(imageFile.path);
          console.log(result.secure_url);
          imageUrl = result.secure_url
          fs.unlinkSync(imageFile.path);
        }
        const user = new User({
          name,
          businessName,
          email,
          password, // Password is plain text here
          phoneNumber,
          address,
          GstIN,
          image: imageUrl, // Use the secure URL from Cloudinary
        });
    
        // // Save the user to the database
        await user.save();
    
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, secretKey);
    
        // // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true });
    
        // res.status(201).json({ message: 'Signup successful' });
        res.redirect('/user/login-page')
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}
  
module.exports.login=async function(req,res){
    try {
        const { email, password } = req.body;
    
        // Find the user by email
        const user = await User.findOne({ email });
    
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // Check if the password is correct (handled in the User schema)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // Generate JWT token
        const token = jwt.sign({ userId: user._id,user }, secretKey);
        
        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true });
        res.locals.user = user;
        // req.session.user = user;
    
       res.redirect('/');
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

module.exports.addCategoryPage=async(req,res)=>{
  const userId = req.user.userId
  const user = await User.findById(userId)
  const category = await RoomTypes.find({owner:userId})
  
  return res.render('addcategory',{
    title:'Category',
    category
})
}

module.exports.addCategory=async(req,res)=>{
    try{
        const userId = req.user.userId
        console.log(userId);
        const {roomType} = req.body
        const newRoom = new RoomTypes({
            roomType,
            owner:userId
        })

        await newRoom.save()
        res.redirect('back')
    }catch(err){
        res.send(err)
    }
}

// Assuming you are using Express.js
module.exports.signout = function (req, res) {
  // Clear the token cookie by setting it to an empty value and expiring it immediately
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  
  // Redirect the user to a login or home page, or you can send a JSON response
  res.redirect('/user/login-page'); // Example redirect route
};


module.exports.deleteType = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Delete the room type
    const type = await RoomTypes.deleteOne({ _id: id, owner: userId });

    // Delete associated rooms
    const room = await Rooms.deleteMany({ roomTypeId: id, owner: userId });

    // Check if any documents were deleted
    if (type.deletedCount === 0) {
      return res.status(404).json({ message: 'Room type not found' });
    }

    // Redirect only if the deletions were successful
    return res.redirect('back');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.myAccount=async(req,res)=>{
  try{
    const {userId}=req.user
    const user = await User.findById(userId)
    console.log(user);
    if(!user){
      return res.redirect('/')
    }
    return res.render('account',{
      title: user.name,
      user,
    })
  }catch(err){
    console.log(err);
  }
}


module.exports.editAccount=async(req,res)=>{
  const {userId} = req.user
  const user = await User.findById(userId)

  return res.render('editaccount',{
    title: 'User',
    user
  })
}

module.exports.updateAccount=async(req,res)=>{
  const {userId} = req.user
  const {name, businessName, email, phoneNumber, address, GstIN, image}=req.body
  const user = await User.findById(userId)
  const imageFile = req.file;
        let imageUrl = user.image
        if(imageFile){
          const result = await cloudinary.uploader.upload(imageFile.path);
          console.log(result.secure_url);
          imageUrl = result.secure_url
          fs.unlinkSync(imageFile.path);
        }

        try {
          await User.updateOne(
            { _id: userId }, // Find the user by their _id
            {
              $set: {
                name,
                businessName,
                email,
                phoneNumber,
                address,
                GstIN,
                image: imageUrl, // Update the image URL
              },
            }
          );
      
          return res.redirect('/user/account')
        } catch (error) {
          res.status(500).json({ error: 'Error updating user data' });
        }
}

