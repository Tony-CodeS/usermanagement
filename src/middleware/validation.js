const joi = require('joi')

exports.userSchema = joi.object({
    email:joi.string().email().required(),
    organization:joi.string().required(),
    phone:joi.string().required(),
    cacNumber:joi.string().required(),
    password:joi.string().required(),
    industry:joi.string().required(),
    products:joi.object({
        name:joi.string().required(),
    }),
    branches:joi.object({
        name:joi.string().required(),
    }),
    location:joi.object({
        country:joi.string().required(),
        state:joi.string().required(),
        city:joi.string().required(),
        address:joi.string().required()
    })

})
