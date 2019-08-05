/**
 * Constructor for initialize socket events
 * 
 * @param {SocketIO.Server} io socket.io server
 */
const Chat = (io) => {
    io.on('connection', (socket) => {
        console.log(socket.id, 'was connected')

        socket.on('suscribe', (data) => {
            console.log('joining room', data.room)
            socket.join(data.room)
        })

        socket.on('unsubscribe', (data) => {
            console.log('leaving room', data.room)
            socket.leave(data.room)
        })

        socket.on('message', (data) => {
            console.log('sending room post', data.room)
            socket.broadcast.to(data.room).emit('message', {
                message: data.message,
                user: data.user
            })
        })
    })
}

module.exports = Chat