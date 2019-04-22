const socket=io();
const $messageForm=document.querySelector("#message-form");
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button'); //()inside are tag names
const $messageLocation=document.querySelector('#send-location');
const $messages=document.querySelector("#messages");
const $messageInput=document.querySelector("#message-input").innerHTML;
const locationMessageTemplate=document.querySelector("#Location-message-template").innerHTML;
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML;

const {username, room }=Qs.parse(location.search,{ignoreQueryPrefix:true}) //for taking the values from url and parsing it (ignorequeryprefix is to eliminate '?')


const autoscroll=()=>{
  const $newMessage=$messages.lastElementChild
  const newMessageStyles=getComputedStyle($newMessage)
  const newMessageMargin=parseInt(newMessageStyles.marginBottom)
  const newMessageHeight=$newMessage.offsetHeight + newMessageMargin
  const visibleHeight=$messages.offsetHeight
  const containerHeight=$messages.scrollHeight
  const scrollOffset=$messages.scrollTop + visibleHeight
  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop= $messages.scrollHeight
  }
}




socket.on('message',(message)=>{

  console.log(message);
  const html = Mustache.render($messageInput,{
    username:message.username,
    message:message.text, //message is an object of generateMessage
    createdAt:moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoscroll()
})
socket.on('LocationMessage',(message)=>{
  console.log(message )
  const html=Mustache.render(locationMessageTemplate,{
    username:message.username,
    url:message.url,
    createdAt:moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoscroll()
})

socket.on("roomData",({room,users})=>{
const html=Mustache.render(sidebarTemplate,{
  room,
  users
})
document.querySelector("#sidebar").innerHTML=html
})

 
$messageForm.addEventListener('submit',(e)=>{
  e.preventDefault()
  $messageFormButton.setAttribute('disabled','disabled'); //not sending server more than once until it is emitted
  const message=e.target.elements.name.value;
 
  socket.emit("sendmessage",message,(error)=>{
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value=''; //textbox empty
    $messageFormInput.focus(); //textbox focused
    if(error){
      return console.log("error") //if any bad-word then return
    }
    console.log("delivered to server");
  });
})

$messageLocation.addEventListener('click',()=>{
 
  if(!navigator.geolocation.getCurrentPosition){
    return alert("Your browser does not support location!");
  }
  $messageLocation.setAttribute('disabled','disabled'); //disables sending more than once at a time
  navigator.geolocation.getCurrentPosition((position)=>{
    console.log(position);
    socket.emit('sendLocation',{
      
      latitude:position.coords.latitude,
      longitude:position.coords.longitude    //if more than one value to send then send object (json format)
    },()=>{
      $messageLocation.removeAttribute('disabled'); //enables the button again
      console.log("location delivered") 
    })
  })
})
socket.emit('join',{username,room},(error)=>{
  if(error){
    alert(error)
    location.href='/'
  }
})
