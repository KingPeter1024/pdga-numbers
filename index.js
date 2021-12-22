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

// Variables to keep track of
let data = {pdga: 199580} // Current latest member
let delay = 1 // Seconds before the next call to the PDGA
let lookAhead = 0; // How far ahead (scale of 5) to look to keep up with quickly-increasing numbers

// Allow connection to websockets
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
    const raw = await fetch(`https://www.pdga.com/player/${pdgaNumber}`)
    return await raw.text()
  }
  const newNumber = data.pdga + 1 + (lookAhead * 5)
  const memberText = await pullPage(newNumber)
  const numberIndex = memberText.indexOf(` #${newNumber}<`);

  if (numberIndex > -1) {
    // This is a new member
    console.log(newNumber)

    const newData = {}

    // Screen scrape for details
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

    // Update and send to users
    data = newData
    io.sockets.emit("update", data)
    
    delay = 1
    lookAhead = 4
  } else {
    // New user was not found
    lookAhead = Math.max(0, lookAhead - 1)
    delay = lookAhead > 0 || (newNumber > 199950 && newNumber < 200000) ? 1 : 20
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
