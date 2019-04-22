const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const Filter=require('bad-words');
const app=express();

const { generateMessage,generateLocationMessage }=require('./utils/messages')
const{addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const publicDirectory=path.join(__dirname,"../public");
app.use(express.static(publicDirectory));

const server=http.createServer(app);
const io=socketio(server)
//let count=0;
io.on('connection',(socket)=>{
  console.log("New Connection established");
  

 
  socket.on('join',(options,callback)=>{
    const {error,user}=addUser({id:socket.id,...options})
    if(error){
      return callback(error)
    }
    socket.join(user.room) //joins the users of particular room
    socket.emit("message",generateMessage('Admin',"welcome!"))
    socket.broadcast.to(user.room).emit("message",generateMessage('Admin',`${user.username} has joined!`));
    //socket.broadcast.to(room).emit is used to send info to that room

    //getting users in a particular room
    io.to(user.room).emit("roomData",{
      room: user.room,
      users:getUsersInRoom(user.room)
    })

    callback()
  })
   //expect that user, displays it to all users.
  socket.on("sendmessage",(message,callback)=>{
    const user=getUser(socket.id)
    
      const filter=new Filter();
      if(filter.isProfane(message)){
        return callback("profinity");
      }
      io.to(user.room).emit('message',generateMessage(user.username,message));//send data to all clients..
      callback()
    
    
  })

  socket.on('sendLocation',(coords,callback)=>{
    const user=getUser(socket.id)
    io.to(user.room).emit('LocationMessage',generateLocationMessage(user.username,`https://google.com/maps?${coords.latitude},${coords.longitude}`))
    callback()
  })



  socket.on("disconnect",()=>{
    const user=removeUser(socket.id)
    if(user){

      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} left!`));
      
      //getting users in a particular room

      io.to(user.room).emit("roomData",{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  })
})


const port=process.env.PORT || 3000;
server.listen(port,()=>{
  console.log(`Server started on port ${port}`);
})