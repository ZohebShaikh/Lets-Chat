const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const http = require("http")
const server = http.createServer(app)
const {
    Server
} = require("socket.io");
const io = new Server(server);
const mongoose = require("mongoose")
const { sendStatus } = require("express/lib/response")
const dbUri = "mongodb+srv://"+process.env.DB_USER+":"+process.env.DB_PASSWORD+"@"+process.env.DB_NAME+"/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(dbUri, (err) => {
    console.log("mongodb connection successful")
})
const port = process.env.PORT || 5000

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const Message = mongoose.model('Message', {
    name: String,
    message:String
})
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})

app.post('/messages', (req, res) => {
    var message = new Message(req.body)
    message.save((err => {
        if (err) {
            sendStatus(500)
        } else {
            io.emit('message',req.body)
            res.sendStatus(200)
        }
    }))
})
io.on('connection', (socket) => {
    console.log('User connected')
})
server.listen(port, () => {
    console.log("Server is listening on port %d", port)
})

