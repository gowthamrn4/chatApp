const express = require ('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dbUrl = 'mongodb://admin123:admin123@ds249818.mlab.com:49818/houston_api';//your Mongo DB Url
mongoose.Promise=Promise;
mongoose.connect(dbUrl);
const Message = mongoose.model('message', {
    name: String,
    message: String,
    img: String
});
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.static(__dirname));
    app.get('/messages', (req, res)=>{
        Message.find({}, (err, mes)=>{
            res.send(mes);
        });
    });
    app.post('/messages', (req, res)=>{
        let message = new Message(req.body);
        message.save()
        .then(()=> Message.findOne({message:'badword'}))
        .then(censored=>{
            if(censored){
                return censored.remove();
            }
            io.emit('message', req.body);
            res.sendStatus(200);

        })
        .catch(err=>{
            console.log(err)
        })
    });
    io.on('connection', function(socket){
        console.log('a user connected');
    });
    http.listen(3000);