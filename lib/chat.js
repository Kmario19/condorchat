/**
 * Constructor for initialize socket events
 * 
 * @param {SocketIO.Server} io socket.io server
 */
const Chat = (io) => {
    let users_connected = []
    io.on('connection', (socket) => {
        console.log(socket.id, 'was connected')

        socket.on('login', (user) => {
            socket.emit('users_connected', users_connected)
            users_connected[socket.id] = user._id
            socket.broadcast.emit('login', user)
        })

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

        socket.on('direct', (data) => {
            console.log(`Direct message sent to ${data.to_user.username}: '${data.message}'`)
            socket.broadcast.to(data.to_user.username).emit('direct', {
                message: data.message,
                user: data.user
            })
        })

        socket.on('disconnect', () => {
            console.log(socket.id, 'was disconnected')
            delete users_connected[socket.id]
        })
    })
}

module.exports = Chat