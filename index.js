const app = require("express")();

const httpServer = require("http").Server(app);

const { v4: uuidv4 } = require("uuid");

app.get("/data", (req, res) => {
  res.sendFile(__dirname + "/data.json");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/images/:img", (req, res) => {
  res.sendFile(__dirname + "/images/" + req.params.img);
});

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});

const PORT = 3000 || process.env.PORT;

let rooms = [];

io.on("connect", (socket) => {
  console.log("User connected");

  socket.on("join-room", (payload) => {
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].code === payload.code) {
        if (rooms[i].users.length < 4) {
          rooms[i].users.push({
            nick: payload.user.nick ? payload.user.nick : "Guest",
            color: payload.user.color,
            id: socket.id,
          });
          socket.emit("authorized-" + rooms[i].code, true);
          return;
        }
      }
    }
    rooms.push({
      code: payload.code,
      owner: socket.id,
      users: [
        {
          nick: payload.user.nick ? payload.user.nick : "Guest",
          color: payload.user.color,
          id: socket.id,
        },
      ],
    });
  });
  socket.on("create-room", (payload) => {
    let code = uuidv4().substring(0, 6);
    rooms.push({
      code: code,
      owner: socket.id,
      users: [
        {
          nick: payload.user.nick ? payload.user.nick : "Guest",
          color: payload.user.color,
          id: socket.id,
        },
      ],
    });
    socket.emit("authorized", code);
  });

  socket.on("enter-room", (payload) => {
    const room = rooms.find((element) => element.code == payload);

    const roomInfo = {
      room: room,
      yourInfo: room.users.find((element = element.id == socket.id)),
    };

    socket.emit("room-info", roomInfo);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

httpServer.listen(PORT, () => {
  console.log("Listening to " + PORT);
});
