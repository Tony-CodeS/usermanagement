const express = require('express')
const dotenv = require('dotenv').config()
const connectDB = require('./src/database/index')
const router = require('./src/router')
const cors = require('cors')
const helmet = require('helmet')

const PORT = process.env.PORT || 3000


const app = express()
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(router)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// const server = app.listen(PORT, () => {
//     console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
//   });


process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTIONS! 🔥 Shutting down...");
  console.log(`${err.name} : ${err.message}`);
  process.exit(1);
});


//handling unhandledRejection
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

connectDB().then((con) => {
  console.log('Connected To DataBase')
  app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
  }).catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
})