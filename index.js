const PORT = process.env.PORT || 3000
const express = require("express")
const app = express()
const path = require("path")
const http = require("http")
const { Server } = require("socket.io")
const crypto = require('crypto');




const server = http.createServer(app)

const io = new Server(server)


app.use(express.static(path.resolve("")))


// Mock database
let arr = []
let playing = []



io.on("connection", (socket) => {

    socket.on('find', (e) => {
        if (e.name !== null && e.name !== '') {
            arr.push(e.name)
            if (arr.length == 2) {
                let player1 = {
                    p1Name: arr[0],
                    p1Value: 'X',
                    p1Move: '',
                }
                let player2 = {
                    p2Name: arr[1],
                    p2Value: 'O',
                    p2Move: '',
                }
                let newPlayers = {
                    id: crypto.randomUUID(),
                    p1: player1,
                    p2: player2,
                    p1Id: crypto.randomUUID(),
                    p2ID: crypto.randomUUID(),
                    sum: 1,
                }
                // Adding the players to the game enviornment
                playing.push(newPlayers)

                // Deleting the previous players from the containers
                arr.splice(0, 2)

                io.emit("find", { allPlayers: playing })
            }
        }
    })


    socket.on("playing", (e) => {
        console.log(e)
        console.log(playing)


        if (e.value === 'O') {
            let objToChange = playing.find((obj) => {
                return obj.p1.p1Name === e.name
            })
            objToChange.p1.p1Move = e.id
            objToChange.sum++
        } else if (e.value === 'X') {
            let objToChange = playing.find((obj) => {
                return obj.p2.p2Name === e.name
            })
            objToChange.p2.p2Move = e.id
            objToChange.sum++
        }


        io.emit('playing', { allPlayers: playing })
    })




    socket.on("removeGameData", (e) => {
        if (e.id) {
            let updatedAllPlayers = playing.filter((element, index) => {
                return element.id != e.id;
            })
            playing = updatedAllPlayers
            console.log('Updated allPlayers--> ' + playing)
        }
    })

})






app.get("/", (req, res) => {
    return res.sendFile("index.html")
})

console.log("Beginning to connect.....")
server.listen(process.env.PORT || PORT, () => {
    console.log(`Port connected to ${PORT}`)
})


