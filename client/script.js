import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const textarea = document.querySelector('textarea')

let loadInterval;


function autoExpand() {
  textarea.style.height = textarea.scrollHeight + 'px';  
}

textarea.addEventListener('input', autoExpand)


function loader(element){
  element.textContent = '';

  loadInterval = setInterval(()=>{
    element.textContent +='.';

    if(element.textContent === '....')
    element.textContent ='';
  },300)
}

function typeText(element,text){
  let index = 0;

  let interval = setInterval(()=>{
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval)
    }
  },20)
}

function generateId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId){
  return(
    `
    <div class='wrapper ${isAi && 'ai'}'>
      <div class="chat">
        <div class="profile"> 
            <img 
              src=${isAi ? bot : user} 
              alt="${isAi ? 'bot' : 'user'}" 
            />
        </div>
        
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>

    `
  )
}

const handleSubmit = async (e)=>{

  e.preventDefault();

  const data = new FormData(form)

  if(textarea.value.trim() !== ""){   // Check if the textarea not empty.
    chatContainer.innerHTML = ''
    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
    
    // bot's chatstripe
    const uniqueId = generateId()
    chatContainer.innerHTML += chatStripe(true, ' ' , uniqueId)

    chatContainer.scrollTop = chatContainer.scrollHeight;

    // To put new message in view
    const messageDiv = document.getElementById(uniqueId)

    loader(messageDiv)

    //Reset to texarea
    form.reset()
    if (textarea.value.trim() === '') {
      textarea.style.height = 'initial'; 
    } 

    // Fetch data from server => bot's response
    const response = await fetch('https://botify-qupb.onrender.com/',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        
      },
      body: JSON.stringify({
        prompt: data.get('prompt')

      })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if(response.ok){
      const data = await response.json();
      const parsedData = data.bot.content.trim();

      
      typeText(messageDiv, parsedData)
    }else{
      const err = await response.text();
      messageDiv.innerHTML = 'Something went wrong...';
      alert(err);
    }

  }

}

form.addEventListener('submit', handleSubmit)

form.addEventListener('keydown', (e)=>{

  if(e.key === 'Enter' && !e.shiftKey){
    handleSubmit(e)
  }
})