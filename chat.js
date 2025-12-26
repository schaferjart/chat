const WEBHOOK_URL = 'https://n8n.baufer.beauty/webhook/53c136fe-3e77-4709-a143-fe82746dd8b6/chat';

const messagesEl = document.querySelector('.messages');
const inputEl = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let sessionId = localStorage.getItem('chatSessionId') || crypto.randomUUID();
localStorage.setItem('chatSessionId', sessionId);

// Create bubble element
function createBubble(text, position) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${position}`;
  const msg = document.createElement('span');
  msg.className = 'message';
  msg.innerHTML = text;
  bubble.appendChild(msg);
  return bubble;
}

// Create loading bubble
function createLoadingBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'bubble left';
  const loading = document.createElement('span');
  loading.className = 'loading';
  loading.innerHTML = '<b>•</b><b>•</b><b>•</b>';
  bubble.appendChild(loading);
  return bubble;
}

// Add message with animation
function addMessage(text, position) {
  const row = document.createElement('div');
  row.className = `message-row ${position}`;
  const bubble = createBubble(text, position);
  bubble.style.opacity = '0';
  bubble.style.transform = 'scale(0.8)';
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  
  anime({
    targets: bubble,
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 400,
    easing: 'easeOutBack'
  });
  
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

// Send message to webhook
async function sendToWebhook(message) {
  const row = document.createElement('div');
  row.className = 'message-row left';
  const loadingBubble = createLoadingBubble();
  row.appendChild(loadingBubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId: sessionId,
        chatInput: message
      })
    });
    
    const data = await response.json();
    
    // Remove loading row
    row.remove();
    
    // Add bot response
    const botMessage = data.output || data.text || data.message || 'Sorry, I couldn\'t process that.';
    addMessage(botMessage, 'left');
    
  } catch (error) {
    row.remove();
    addMessage('Connection error. Please try again.', 'left');
  }
}

// Handle send
function handleSend() {
  const text = inputEl.value.trim();
  if (!text) return;
  
  inputEl.value = '';
  addMessage(text, 'right');
  sendToWebhook(text);
}

// Event listeners
sendBtn.addEventListener('click', handleSend);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});

// Initial greeting
setTimeout(() => addMessage('Hey there! 👋', 'left'), 300);
setTimeout(() => addMessage('How can I help you today?', 'left'), 1000);
