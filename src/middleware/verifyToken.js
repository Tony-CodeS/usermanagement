const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()


// exports.verifyToken =(req, res, next) =>{
//     const authHeader = req.headers.authorization
//     if(!authHeader || !authHeader.startsWith('Bearer ')){
//       res
//       .status(401)
//       .json({message:'denied', success:false})   
//     }

//     const token = authHeader.split(' ')[1]
//     const secret = process.env.JWTSECRET

//     try{
//         const verified = jwt.verify(token, `${secret}`)
//         console.log(verified.userId)
//         req.user = verified

//         next();
//     }
//     catch(error){
//         res
//         .status(401)
//         .json({message:'denied', success:`${error.message}`})  
//     }
// }

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }
  
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWTSECRET;
  
    try {
      const verified = jwt.verify(token, secret);
      const userId = verified.userId;
      console.log(userId)
  
      // Compare the general authentication token with the user's ID
      const generalAuthToken = req.cookies.generalAuthToken;
  
      if (generalAuthToken !== userId) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
      }
  
      // Authorization check passed, set the user information in the request object
      req.user = verified;
  
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }
  };
  