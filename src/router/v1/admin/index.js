const express = require('express')
const router = express.Router()
const { verifyToken } = require('../../../middleware/verifyToken')
const AdminController = require('../../../controller/AdminController')
const GeneralController = require('../../../controller/generalController')
const Auth = require('../../../controller/auth')
///Admin routes
router.post('/admin/login', AdminController.login)
router.post('/admin/forgot-password', AdminController.adminforgotpassword)
router.post('/admin/change-password', AdminController.adminchangePassword)
router.post('/admin', AdminController.addAdmin)
router.delete('/removeUser/:adminId/:userId', verifyToken, AdminController.removeUser)

/// Authentication and authorization
router.post('/login', Auth.login)
router.post('/forgot-password', Auth.forgotPassword)
router.post('/resend-otp', Auth.resendOtp)
router.post('/confirm-otp', Auth.confirmOTP)
router.post('/change-password', Auth.changePassword)

//General
router.get('/users', verifyToken, AdminController.getallUsers)
router.post('/users', Auth.signUp)

router.post('/users/:userId', verifyToken, GeneralController.getSingleUser)

router.get('/users/:userId/distributors', verifyToken, GeneralController.getDistributors)
router.post('/users/:userId/distributors', verifyToken, GeneralController.addDistributor)

router.get('/users/:userId/distributors/:distributorId', verifyToken, GeneralController.getDistributorDetail)
router.delete('/users/:userId/distributors/:distributorId', verifyToken, GeneralController.removeDistributor)

router.get('/users/:userId/branches', verifyToken, GeneralController.getallbranches)
router.post('/users/:userId/branches', verifyToken, GeneralController.addBranch)
router.delete('/users/:userId/branches/:branchId', verifyToken, GeneralController.removeBranch)

router.get('/users/:userId/products', verifyToken, GeneralController.getallProducts)
router.post('/users/:userId/products', verifyToken, GeneralController.addProduct)
router.delete('/users/:userId/products/:productId', verifyToken, GeneralController.removeProduct)

router.get('/users/:userId/manufacturers', verifyToken, GeneralController.getManufacturer)
router.get('/users/:userId/manufacturers/:manufacturerId', verifyToken, GeneralController.getManufacturerDetail)


module.exports = router;