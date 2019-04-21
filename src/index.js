const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const Filter=require('bad-words');
const app=express();

const { generateMessage,generateLocationMessage }=require('./utils/messages')
const publicDirectory=path.join(__dirname,"../public");
app.use(express.static(publicDirectory));

const server=http.createServer(app);
const io=socketio(server)
//let count=0;
io.on('connection',(socket)=>{
  console.log("New Connection established");
  

  socket.emit("message",generateMessage("welcome!"))
  socket.broadcast.emit("message",generateMessage("new user joined!")); //expect that user, displays it to all users.
  socket.on("sendmessage",(message,callback)=>{
    const filter=new Filter();
    if(filter.isProfane(message)){
      return callback("profinity");
    }
    io.emit('message',generateMessage(message));//send data to all clients..
    callback()
  })

  socket.on('sendLocation',(coords,callback)=>{
    io.emit('LocationMessage',generateLocationMessage(`https://google.com/maps?${coords.latitude},${coords.longitude}`))
    callback()
  })




  socket.on("disconnect",()=>{
    io.emit('message',generateMessage("user left!"));
  })
})


const port=process.env.PORT || 3000;
server.listen(port,()=>{
  console.log(`Server started on port ${port}`);
})