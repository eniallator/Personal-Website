const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const multer = require('multer')
require('dotenv').config()

const upload = multer()
const app = express()
const port = 3000

async function sendMail(data) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_AUTH_USER,
            pass: process.env.EMAIL_AUTH_PASS
        }
    })

    let info = await transporter.sendMail({
        from: `"${data.name}" <${process.env.EMAIL_AUTH_USER}>`,
        to: 'MY_EMAIL',
        subject: `[Personal Site] From ${data.name}`,
        text: `Name: ${data.name}\n\nEmail: ${data.email}\n\nMessage: ${data.message}`
    })

    console.log('Message sent: ' + info.messageId)
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(upload.array())
app.use(express.static('public'))

app.post('/', (req, res) => {
    console.log(req.body)
    sendMail(req.body)
    res.redirect('/')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
