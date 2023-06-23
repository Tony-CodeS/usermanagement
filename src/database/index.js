require('dotenv').config()
const mongoose = require('mongoose')

const connectDB = () => {
    return new Promise((resolve, reject) => {
        const option = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        mongoose
            .connect(process.env.DATABASE, option)
            .then((con) => resolve(con))
            .then((err) => reject(err))
    })
}

// const connectDB = async () => {
//     try {
//         const option = {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         }
//         const connection = await mongoose.connect(process.env.DATABASE, option);
//         if (connection) {
//             console.log("Connection Established")
//             return connection;
//         }
//     } catch (error) {
//         console.error(error.message)
//     }
// }


module.exports = connectDB