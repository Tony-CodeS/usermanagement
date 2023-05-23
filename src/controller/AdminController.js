
const {Admin,User} = require('../model/Schema')
const mongoose = require('mongoose');
// const {Manufacturer} = require('../model/manufacturerSchema')


exports.addAdmin = async (req, res)=>{
 const  {email, password}  = req.body
 try{
    const newAdmin = await Admin.create({email, password})
    res.status(200).send({
        date:newAdmin
    })
 }catch(err){
    console.log(`${err.message}`)
 }
}



exports.getallUsers= async (req, res) =>{

    try{
        const users = await User.find({}).select("-password");
    if (!users) return ('only admins are allowed to get manaufacturers')

    res.status(200).send({users})
    } catch(err){
        console.log(err)
    }
}


exports.removeUser = async (req, res) =>{
  try{

    const adminId = req.params.adminId
    const userId = req.params.userId

    const admin = await Admin.findById(adminId)
    if(!admin) return res.status(400).send({
      type: 'Not Found',
      msg: 'Admin not found'
    })

    const deleteUser = await User.findByIdAndDelete(userId)
    if(!deleteUser) return res.status(400).send({
      type: 'Not Found',
      msg: 'User not found'
      })

      const updateResult = await User.updateMany(
        {
          $or: [
            { isDistributor: userId },
            { isManufacturer: userId }
          ]
        },
        {
          $pull: {
            isDistributor: userId,
            isManufacturer: userId
          }
        }
      );


      res.status(200).json({
        type: 'Success',
        msg: 'User deleted'
        })
  }catch(err){
    console.log(err)
  }
}


exports.adminforgotpassword = async (req, res) =>{
  try{
    const {email} = req.body;
    const admin = await Admin.findOne({email});
    if(!admin)
    return res.status(400).send({
      message: 'admin not found'
      })

      
      const secret = speakeasy.generateSecret();

      const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        window: 10 * 60,
      });

      admin.otp = otp
  
      await admin.save()

      const templatePath = path.join(__dirname, '../utils/fgpasswordtemplate.pug');
      const compiledTemplate = pug.compileFile(templatePath);
      const html = compiledTemplate({ otp });

      transporter.sendMail({
        from: 'officialtony@gmail.com',
        to: admin.email,
        subject: 'Reset Password',
        html: html
      }, (err, info) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      res.status(200).send({
        message: 'OTP Sent'
        })


  }catch(err){
    console.log(err)
  }
}


exports.changePassword = async (req, res) =>{
  try{
    const { otp, password} = req.body;
    const admin = await Admin.findOne({ otp});
    if(!admin)
    return res.status(400).send({
      message: 'Invalid OTP'
      })
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);
      admin.password = hash;
      admin.otp = undefined
      await admin.save();
      res.status(200).send({
        message: 'Password Changed'
        })
        }catch(err){
          console.log(err)
          }
          }
  

  exports.login= async (req, res) => {
  const { email, password } = req.body;
  try {
   const admin = await admin.findOne({ email });
   if (!admin) {
    return res.status(400).send({
    message: 'User not found'
      });
     }
  const isValidPassword = await bcrypt.compare(password, admin.password);
   if (!isValidPassword) {
   return res.status(400).send('Invalid email or password.');
   }
  
  const token = jwt.sign({ _id: admin._id}, process.env.JWTSECRET, {
  expiresIn: '1d'
  });
 return res.status(200).send({
  message: 'Login successful',
  token
  });
  } catch (err) {
  console.log(err);
  res.status(500).send('Error occurred while signing in.');
   }
  };
          
  
  

  

