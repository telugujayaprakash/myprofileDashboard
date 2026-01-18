const express = require('express')
const { userRegister, userLogin, verifyOTP } = require('../../controllers/Users/Auth/UserAuth.controller');


const router = express.Router();

router.post('/auth/register', userRegister)
router.post('/auth/verify-otp', verifyOTP)
router.post('/auth/login', userLogin)


module.exports = router;