const {Admin, User} = require('../model/Schema') 
const {userSchema} = require('../middleware/validation')
const joi = require('joi')
// const transporter = require('../utils/transport') 
const path = require('path');
const pug = require('pug')        
const bcrypt = require('bcrypt')
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()


const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 587,
  auth: {
    user: 'e78c620341ece8',
    pass: '9aedcae0c9072f',
  },
});




exports.signUp = async (req, res) => {
  try {
    const { email, organization, phone, cacNumber, products, industry, Branches, location, password } = req.body;

 const validationResult = userSchema.validate(req.body);
if (validationResult.error) {
  // Validation failed
  console.error(validationResult.error.details);
  res.status(400).send({
    message: validationResult.error.details[0].message,
  })
} else {
  // Validation successful
  console.log('Data is valid');
}
  
    const verifyEmail = await User.findOne({email})
    if(verifyEmail) return res.status(400).send({
      message: "user with email already exists"
      })

    const verifyCac = await User.findOne({cacNumber})
      if(verifyCac) return res.status(400).send({
        message: "user with cac number already exists"
        })

    const verifyPhone = await User.findOne({phone})
      if(verifyPhone) return res.status(400).send({
        message: "user with phone number already exists"
        })

    const hashpassword = await bcrypt.hash(password, 12)

    const secret = speakeasy.generateSecret();

    const otp = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
      window: 10 * 60,
    });


    const newUser = new User ({
      email: email,
      organization:organization,
      products: products,
      industry: industry,
      Branches: Branches,
      location: location,
      password: hashpassword,
      otp:otp,
      phone: phone,
      cacNumber:cacNumber,
    });


    const templatePath = path.join(__dirname, '../utils/otptemplate.pug');
    const compiledTemplate = pug.compileFile(templatePath);
    const html = compiledTemplate({ otp });


     transporter.sendMail({
      from: 'officialtony@gmail.com',
      to: newUser.email,
      subject: 'OTP Verification',
      html: html
    }, (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
   

    await newUser.save();

    delete newUser._doc.password
    
    res.status(200).send({
      data: newUser,
    });


  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error creating User' });
  }
};


exports.resendOtp = async (req, res) =>{
  try{
    const email = req.body.email
    const user = await User.findOne({ email });
    if (!user) {
    return res.status(404).send({ message: 'User not found' });
      }

    const secret = speakeasy.generateSecret();

      const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        window: 10 * 60,
      });

      user.otp = otp
      await user.save()

    const templatePath = path.join(__dirname, '../utils/otptemplate.pug');
    const compiledTemplate = pug.compileFile(templatePath);
    const html = compiledTemplate({ otp });

    
    transporter.sendMail({
      from: 'officialtony@gmail.com',
      to: user.email,
      subject: 'OTP Verification',
      html: html
    }, (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(200).send({
      message: 'OTP sent to email',
      data: {
        otp: user.otp
      } 
    })

  }catch(err){
    console.log(err)
  }
}

exports.confirmOTP = async (req, res) =>{
try{
  const {otp} = req.body
  if (!otp) {
    return res.status(400).send({
      message: 'OTP is required'
    })
  }
const user = await User.findOne({otp})
if(!user)
return res.status(400).send({
  message: 'Invalid OTP'
  })

user.verificationStatus = true
user.otp = undefined


const token = jwt.sign({ _id: user._id}, process.env.JWTSECRET, {
  expiresIn: '1d'
});

await user.save()

res.status(200).send({
  message: 'OTP verified',
  token
  });



}catch(err){
  console.log(err)
}

}


exports.forgotPassword = async (req, res) =>{
  try{
    
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user)
    return res.status(400).send({
      message: 'User not found'
      })

      
      const secret = speakeasy.generateSecret();

      const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        window: 10 * 60,
      });

      user.otp = otp
  
      await user.save()

      const templatePath = path.join(__dirname, '../utils/fgpasswordtemplate.pug');
      const compiledTemplate = pug.compileFile(templatePath);
      const html = compiledTemplate({ otp });

      transporter.sendMail({
        from: 'officialtony@gmail.com',
        to: user.email,
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
  const user = await User.findOne({ otp});
  if(!user)
  return res.status(400).send({
    message: 'Invalid OTP'
    })
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    user.password = hash;
    user.otp = undefined
    await user.save();
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
    const user = await User.findOne({ email });

 
    if (!user) {
      return res.status(400).send({
        message: 'User not found'
        });
        }

    if(user.verificationStatus !== true) return res.status(400).send({
      message: 'Please verify your email'
    })
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(isValidPassword)
    if (!isValidPassword) {
    return res.status(400).send('Invalid email or password.');
     }
    console.log(process.env.JWTSECRET)
    const token = jwt.sign({ _id: user._id}, process.env.JWTSECRET, {
    expiresIn: '1d'
      });

    console.log(token)
  
      return res.status(200).send({
        message: 'Login successful',
        token
      });
    } catch (err) {
      console.log(err);
      res.status(500).send('Error occurred while signing in.');
    }
  };
  