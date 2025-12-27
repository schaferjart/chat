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

// Scroll to bottom helper - simple and reliable
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
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
  
  scrollToBottom();
  return bubble;
}

// Split text into chat-friendly chunks
function splitIntoChunks(text) {
  // Max characters per bubble
  const MAX_LENGTH = 200;
  
  // First try splitting by double newlines (paragraphs)
  let chunks = text.split(/\n\n+/).map(s => s.trim()).filter(s => s);
  
  // If only one chunk, try other split strategies
  if (chunks.length === 1) {
    // Try splitting by numbered lists (1., 2., etc.) or markdown headers (**Title:**)
    const listSplit = text.split(/(?=\d+\.\s+\*\*|\n\d+\.\s|\n[-•]\s)/);
    if (listSplit.length > 1) {
      chunks = listSplit.map(s => s.trim()).filter(s => s);
    } else {
      // Split by sentence endings
      chunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
      chunks = chunks.map(s => s.trim()).filter(s => s);
    }
  }
  
  // Merge very short chunks, split very long ones
  const result = [];
  for (const chunk of chunks) {
    if (result.length > 0 && chunk.length < 30) {
      // Merge short chunk with previous
      result[result.length - 1] += ' ' + chunk;
    } else if (chunk.length > MAX_LENGTH) {
      // Split long chunk by sentences
      const sentences = chunk.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [chunk];
      let current = '';
      for (const sentence of sentences) {
        if (current.length + sentence.length > MAX_LENGTH && current.length > 0) {
          result.push(current.trim());
          current = sentence;
        } else {
          current += (current ? ' ' : '') + sentence.trim();
        }
      }
      if (current.trim()) result.push(current.trim());
    } else {
      result.push(chunk);
    }
  }
  
  return result.length > 0 ? result : [text];
}

// Add multiple messages with staggered delays and typing indicator
async function addMessagesSequentially(chunks, position) {
  for (let i = 0; i < chunks.length; i++) {
    // Show typing indicator before each message (except first, which had the initial loading)
    if (i > 0) {
      const typingRow = document.createElement('div');
      typingRow.className = 'message-row left';
      const typingBubble = createLoadingBubble();
      typingRow.appendChild(typingBubble);
      messagesEl.appendChild(typingRow);
      
      // Small delay then scroll to ensure DOM updated
      await new Promise(r => setTimeout(r, 50));
      scrollToBottom();
      
      // Delay proportional to upcoming message length (no cap)
      const delay = chunks[i].length * 20 + 300;
      await new Promise(r => setTimeout(r, delay));
      
      // Remove typing indicator
      typingRow.remove();
    }
    addMessage(chunks[i], position);
    
    // Ensure scroll after each message
    await new Promise(r => setTimeout(r, 50));
    scrollToBottom();
  }
}

// Send message to webhook
async function sendToWebhook(message) {
  const row = document.createElement('div');
  row.className = 'message-row left';
  const loadingBubble = createLoadingBubble();
  row.appendChild(loadingBubble);
  messagesEl.appendChild(row);
  scrollToBottom();

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
    
    // Add bot response - split into chunks for natural feel
    const botMessage = data.output || data.text || data.message || 'Sorry, I couldn\'t process that.';
    const chunks = splitIntoChunks(botMessage);
    await addMessagesSequentially(chunks, 'left');
    
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
