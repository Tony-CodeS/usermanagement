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
router.post('/signup', Auth.signUp)
router.post('/login', Auth.login)
router.post('/forgotpassword', Auth.forgotPassword)
router.post('/resendOtp', Auth.resendOtp)
router.post('/confirmOtp', Auth.confirmOTP)
router.post('/changepassword', Auth.changePassword)

//General

router.post('/addExistingDistributor/:userId',verifyToken, GeneralController.addDistributor)
router.get('/allDistributor/:userId', verifyToken, GeneralController.getDistributors)
router.get('/allManufacturer/:userId', verifyToken,  GeneralController.getManufacturer)
router.delete('/removeDistributor/:manufacturerId/:distributorId', verifyToken, GeneralController.removeDistributor)
router.post('/addproduct/:userId',verifyToken,GeneralController.addProduct)
router.delete('/removeproduct/:userId/:productId',verifyToken,GeneralController.removeProduct)
router.post('/addbranch/:userId',verifyToken,GeneralController.addBranch)
router.delete('/removebranch/:userId/:branchId',verifyToken,GeneralController.removeBranch)



module.exports = router

