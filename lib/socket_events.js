/**
 * Constructor for initialize socket events
 * 
 * @param {SocketIO.Server} io socket.io server
 */
const Chat = (io) => {
    let users_connected = []
    io.on('connection', (socket) => {

        socket.on('login', (user) => {
            socket.broadcast.emit('login', user)
            console.log(user.username, 'was connected')
            // Send connected users
            socket.emit('users_connected', users_connected)
            // Includeme
            users_connected.push({ socket: socket.id, user: user._id })
            // then, join in my own room
            socket.join(user.username)
        })

        // Best way to direct messages
        socket.on('suscribe user', (user) => {
            console.log('open direct message', user.username)
            socket.join(user.username)
        })

        // All can access to all groups (rooms)
        socket.on('message', (data) => {
            console.log('sending room post', data.room)
            socket.broadcast.emit('message', data) //.to(data.room) All are in all rooms (?)
        })

        // Direct message
        socket.on('direct', (message) => {
            console.log(`Direct message sent to ${message.to_user.username}: '${message.body}'`)
            socket.broadcast.to(message.to_user.username).emit('direct', message)
        })

        // Emit create user event
        socket.on('new user', (user) => {
            console.log('New user registered:', user.username)
            socket.broadcast.emit('new user', user)
        })

        // Emit create group event
        socket.on('new group', (group) => {
            console.log('New group registered:', group.name)
            socket.broadcast.emit('new group', group)
        })

        // Emit update user event
        socket.on('update user', (user) => {
            console.log('User updated:', user.username)
            socket.broadcast.emit('update user', user)
        })

        // Emit update group event
        socket.on('update group', (group) => {
            console.log('Group updated:', group)
            socket.broadcast.emit('update group', group)
        })

        // Emit delete group event
        socket.on('delete group', (group) => {
            console.log('Group deleted:', group)
            socket.broadcast.emit('delete group', user)
        })

        // If disconnect, delete of connected users
        socket.on('disconnect', () => {
            console.log(socket.id, 'was disconnected')
            for( let i = 0; i < users_connected.length; i++) {
                if (users_connected[i].socket == socket.id) {
                    socket.broadcast.emit('logout', users_connected[i].user)
                    users_connected.splice(i, 1)
                    break
                }
            }
        })
    })
}

module.exports = Chat