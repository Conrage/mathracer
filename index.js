const app = require('express')();

const httpServer = require('http').Server(app);

app.get('/data', (req, res) => {
    res.sendFile(__dirname + '/data.json');
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
app.get('/images/:img', (req, res) => {
    res.sendFile(__dirname + '/images/'+req.params.img);
})
app.get('/game', (req, res) => {
  res.sendFile(__dirname + '/ingame.html');
})

const io = require('socket.io')(httpServer, {
    cors:{
        origin:"*",
    }
});

const PORT = 3000 || process.env.PORT;

io.on('connect', socket => {
    console.log('User connected')

    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
});

httpServer.listen(PORT, ()=>{
    console.log('Listening to ' + PORT)
})