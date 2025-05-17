/**
 * OpenAI Chat Integration for EduSingapore
 *
 * This file provides integration with OpenAI's API for the chatbot functionality.
 * It handles sending user messages to the OpenAI API and displaying the responses.
 */

// Configuration for OpenAI API
const OPENAI_CONFIG = {
  // API endpoint for OpenAI chat completions
  endpoint: 'https://api.openai.com/v1/chat/completions',

  // Default model to use
  model: 'gpt-3.5-turbo',

  // Predefined API key - REPLACE THIS WITH YOUR ACTUAL API KEY
  apiKey: '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',

  // Default system message to set the context for the AI
  systemMessage: `You are EduBot, an AI assistant for EduSingapore, a tuition service provider for international students in Singapore.

  About EduSingapore:
  - Specialized in helping international students adapt to Singapore's education system
  - Offers tuition for various subjects including Math, Science, English, and more
  - Provides both online and in-person tutoring
  - Has experienced tutors familiar with Singapore's curriculum

  Your role is to be helpful, friendly, and informative. Provide concise answers about our services, pricing, scheduling, and educational approach. If you don't know specific details like exact pricing, suggest that the user contact us directly for the most accurate information.`,

  // Maximum number of messages to keep in context
  maxMessages: 10
};

// Class to handle OpenAI chat functionality
class OpenAIChat {
  constructor(config = OPENAI_CONFIG) {
    this.config = config;
    this.apiKey = this.config.apiKey || null;
    this.messages = [
      { role: 'system', content: this.config.systemMessage }
    ];
    this.isWaitingForResponse = false;
  }

  /**
   * Set the OpenAI API key
   * @param {string} key - OpenAI API key
   */
  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Get the API key
   * @returns {string|null} The API key or null if not set
   */
  getApiKey() {
    return this.apiKey || this.config.apiKey;
  }

  /**
   * Clear the API key (resets to the predefined key)
   */
  clearApiKey() {
    this.apiKey = this.config.apiKey;
  }

  /**
   * Add a message to the conversation history
   * @param {string} role - The role of the message sender ('user' or 'assistant')
   * @param {string} content - The message content
   */
  addMessage(role, content) {
    this.messages.push({ role, content });

    // Keep only the last N messages to avoid token limits
    if (this.messages.length > this.config.maxMessages + 1) { // +1 for the system message
      // Always keep the system message (first message)
      const systemMessage = this.messages[0];
      this.messages = [
        systemMessage,
        ...this.messages.slice(-(this.config.maxMessages))
      ];
    }
  }

  /**
   * Send a message to the OpenAI API
   * @param {string} message - The user's message
   * @returns {Promise<string>} Promise resolving to the AI's response
   */
  async sendMessage(message) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not available. Please check your configuration.');
    }

    if (this.isWaitingForResponse) {
      throw new Error('Already waiting for a response. Please wait.');
    }

    this.isWaitingForResponse = true;

    // Add user message to history
    this.addMessage('user', message);

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: this.messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error communicating with OpenAI API');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();

      // Add AI response to history
      this.addMessage('assistant', aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    } finally {
      this.isWaitingForResponse = false;
    }
  }

  /**
   * Reset the conversation history
   */
  resetConversation() {
    this.messages = [
      { role: 'system', content: this.config.systemMessage }
    ];
  }
}

// Create and export OpenAI chat instance
const openAIChat = new OpenAIChat();

// Initialize the chatbot UI
function initOpenAIChatbot() {
  console.log('Initializing OpenAI chatbot UI');

  const chatForm = document.querySelector('.chat-form');
  const chatInput = document.querySelector('.chat-input input');
  const chatMessages = document.querySelector('.chat-messages');

  if (!chatForm || !chatInput || !chatMessages) {
    console.error('Chat elements not found in the DOM');
    return;
  }

  // Create a new form element to replace the existing one (to remove any existing event listeners)
  const newChatForm = chatForm.cloneNode(true);
  chatForm.parentNode.replaceChild(newChatForm, chatForm);

  // Update references to the new elements
  const updatedChatForm = document.querySelector('.chat-form');
  const updatedChatInput = document.querySelector('.chat-input input');

  console.log('Adding OpenAI event listener to chat form');

  // Handle chat form submission
  updatedChatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('OpenAI chatbot handling message');

    const message = updatedChatInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessageToUI(message, 'sent');
    updatedChatInput.value = '';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message message-received typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      console.log('Sending message to OpenAI API:', message);
      // Send message to OpenAI
      const response = await openAIChat.sendMessage(message);
      console.log('Received response from OpenAI API:', response);

      // Remove typing indicator
      chatMessages.removeChild(typingIndicator);

      // Add AI response to UI
      addMessageToUI(response, 'received');
    } catch (error) {
      // Remove typing indicator
      if (typingIndicator.parentNode === chatMessages) {
        chatMessages.removeChild(typingIndicator);
      }

      // Show error message
      addMessageToUI(`Error: ${error.message}. Please try again or contact support.`, 'error');
      console.error('OpenAI API error:', error);
    }
  });

  // Function to add a message to the UI
  function addMessageToUI(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `message-${type}`);
    messageDiv.textContent = text;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  console.log('OpenAI chatbot UI initialized');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if we're on a page with the chatbot
  if (document.querySelector('.chat-container')) {
    console.log('OpenAI chatbot initializing...');

    // Make sure we initialize after main.js has run
    setTimeout(() => {
      // Remove any existing event listeners from the chat form
      const chatForm = document.querySelector('.chat-form');
      if (chatForm) {
        const newChatForm = chatForm.cloneNode(true);
        chatForm.parentNode.replaceChild(newChatForm, chatForm);
        console.log('Replaced chat form to remove existing event listeners');
      }

      // Now initialize our OpenAI chatbot
      initOpenAIChatbot();
      console.log('OpenAI chatbot initialized');
    }, 100);
  }
});

// Make OpenAI chat available globally
window.OpenAIChat = openAIChat;
