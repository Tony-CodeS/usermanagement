const express = require('express')
const router = express.Router()
const {verifyToken} = require('../../../middleware/verifyToken')
const AdminController = require('../../../controller/AdminController')
const GeneralController = require('../../../controller/generalController')
const Auth = require('../../../controller/auth')

///Admin routes
router.post('/adminlogin', AdminController.login)
router.post('/adminforgotpassword', AdminController.adminforgotpassword)
router.post('/adminChangepassword', AdminController.adminchangePassword)
router.post('/addAdmin', AdminController.addAdmin)
router.delete('/removeUser/:adminId/:userId', verifyToken, AdminController.removeUser)
router.get('/users', verifyToken, AdminController.getallUsers)



/// Authentication and authorization
router.post('/user', Auth.signUp)
router.post('/login', Auth.login)
router.post('/forgotpassword', Auth.forgotPassword)
router.post('/resend-otp', Auth.resendOtp)
router.post('/confirm-otp', Auth.confirmOTP)
router.post('/changepassword', Auth.changePassword)

//General
router.post('/user/:userId', GeneralController.getSingleUser)
router.post('/addExistingDistributor/:userId',verifyToken, GeneralController.addDistributor)
router.get('/user/:userId/distributor', verifyToken, GeneralController.getDistributors)
router.get('/user/:userId/branches', verifyToken, GeneralController.getallbranches)
router.get('/user/:userId/products', verifyToken, GeneralController.getallProducts)
router.get('/user/:userId/distributor/:distributorId', verifyToken, GeneralController.getDistributorDetail)
router.get('/allManufacturer/:userId', verifyToken,  GeneralController.getManufacturer)
router.delete('/removeDistributor/:manufacturerId/:distributorId', verifyToken, GeneralController.removeDistributor)
router.post('/user/:userId/product',verifyToken,GeneralController.addProduct)
router.delete('/user/:userId/product/:productId',verifyToken,GeneralController.removeProduct)
router.post('/user/:userId/branch',verifyToken,GeneralController.addBranch)
router.delete('/user/:userId/branch/:branchId',verifyToken,GeneralController.removeBranch)
router.get('/user/:userId/manufacturer/:manufacturerId', verifyToken, GeneralController.getManufacturerDetail)



module.exports = router

