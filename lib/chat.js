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
            socket.broadcast.emit('login', user)
            console.log(user.username, 'has login. Connected:', users_connected)
            socket.emit('users_connected', users_connected)
            users_connected.push({ socket: socket.id, user: user._id })
            // then, join in my own room
            socket.join(user.username)
        })

        socket.on('suscribe user', (user) => {
            console.log('open direct message', user.username)
            socket.join(user.username)
        })

        socket.on('unsubscribe', (data) => {
            console.log('leaving room', data.room)
            socket.leave(data.room)
        })

        socket.on('message', (data) => {
            console.log('sending room post', data.room)
            socket.broadcast.emit('message', data) //.to(data.room) All are in all rooms (?)
        })

        socket.on('direct', (message) => {
            console.log(`Direct message sent to ${message.to_user.username}: '${message.body}'`)
            socket.broadcast.to(message.to_user.username).emit('direct', message)
        })

        socket.on('new user', (user) => {
            console.log('New user registered:', user.username)
            socket.broadcast.emit('new user', user)
        })

        socket.on('new group', (group) => {
            console.log('New group registered:', group.name)
            socket.broadcast.emit('new group', group)
        })

        socket.on('update user', (user) => {
            console.log('User updated:', user.username)
            socket.broadcast.emit('update user', user)
        })

        socket.on('disconnect', () => {
            console.log(socket.id, 'was disconnected')
            for( let i = 0; i < users_connected.length; i++) {
                if (users_connected[i].socket == socket.id) {
                    console.log('encontrado')
                    socket.broadcast.emit('logout', users_connected[i].user)
                    users_connected.splice(i, 1)
                    break
                }
            }
        })
    })
}

module.exports = Chat