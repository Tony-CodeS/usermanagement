const { boolean } = require('joi');
const mongoose = require('mongoose');




const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  organization:{type: String, required:true},
  phone:{type: String, required:true},
  products:[{
    name:{type: String, required:true},
  }],
  industry:{type:String, required:true},
  branches:[{
    name:{type:String, required:true},
  }],
  cacNumber: {type:String, required:true},
  location: [{
    country: {type:String, required:true},
    state: {type:String, required:true},
    city: {type:String, required:true},
    address: {type:String, required:true},
  }],
  password: {type: String, required:true},
  otp: {type: String},
  verificationStatus: { type: Boolean, default: false },
  Distributor: [{type:mongoose.Schema.Types.ObjectId}],
  Manufacturer: [{type:mongoose.Schema.Types.ObjectId}]
})


const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: {type:String, required:true},
  otp: {type: String}
});





const User = mongoose.model('User', userSchema)
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { Admin, User};
