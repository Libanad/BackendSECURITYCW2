const express = require("express")
// const helmet = require("helmet")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const https = require ("https")
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');


const app = express()
const Routes = require("./routes/route.js")
app.use(cookieParser());

const PORT = process.env.PORT || 5000

dotenv.config();

app.use(express.json({ limit: '10mb' }))
app.use(cors())

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))// error message

const options = {
  key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')),
};
app.use("/test", (req,res)=> {
    res.send("Test");
})

app.use("", Routes)

// app.use(helmet());

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
// //  sanitization
// app.use(mongoSanitize());

// app.use(xss());