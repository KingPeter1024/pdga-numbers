const express = require("express");
const path = require("path");
const fetch = require("node-fetch")
const app = express();
const moment = require("moment")

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

const http = require("http");

const server = http.createServer(app);

const socketIo = require("socket.io");
const io = socketIo(server);

let data = {pdga: 199550}
let delay = 1
let recentlyFound = true;

io.on("connection", (socket) => {
  socket.on("init", () => {
    socket.emit("update", data)
  })
  
});

setInterval(async () => {
  if (delay > 0) {
    delay = delay - 1
    return
  }

  const pullPage = async (pdgaNumber) => {
    return await fetch(`https://www.pdga.com/player/${pdgaNumber}`)
  }
  const newNumber = data.pdga + (recentlyFound ? 5 : 1)
  const newMember = await pullPage(newNumber)
  const memberText = await newMember.text()
  const numberIndex = memberText.indexOf(` #${newNumber}<`);

  if (numberIndex > -1) {
    const newData = {}
    console.log(newNumber)

    let nameStart = numberIndex;
    while (true) {
      if (memberText.charAt(nameStart - 1) === ">") {
        break
      } else {
        nameStart -= 1
      }
    }
    const nameLine = memberText.substring(nameStart, numberIndex + 8)
    const nameParts = nameLine.split("#")
    newData.name = nameParts[0]
    newData.pdga = Number.parseInt(nameParts[1])
    newData.time = (moment().format())
    data = newData
    io.sockets.emit("update", data)
    
    delay = 1
    recentlyFound = true
  } else {
    delay = recentlyFound || (newNumber > 199950 && newNumber < 200000) ? 1 : 20
    recentlyFound = false
  }
}, 1000)

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

// Finish up
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`App listening on ${port}`);
});
