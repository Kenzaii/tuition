/**
 * OpenAI Chat Integration for EduSingapore
 *
 * This file provides integration with OpenAI's API for the chatbot functionality.
 * It handles sending user messages to the OpenAI API and displaying the responses.
 */

// Configuration for OpenAI API
const OPENAI_CONFIG = {
  // API endpoint for OpenAI chat completions (updated for project API keys)
  endpoint: 'https://api.openai.com/v1/chat/completions',
  // No specific API version - will use the default version

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
  maxMessages: 10,

  // Google Sheets logging configuration
  logging: {
    enabled: true,
    // Replace with your Google Apps Script Web App URL (we'll create this in the next step)
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwt3OBG36o71sdylSruF9FYwxHxvW-wUrz8FGjFrYmkogo0AbgVWD5RXVxG8gC9ssQXtQ/exec',
    // Optional user identifier (can be updated dynamically)
    userIdentifier: 'anonymous'
  }
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
    this.sessionId = this.generateSessionId();
    this.conversationStartTime = new Date().toISOString();
  }

  /**
   * Generate a unique session ID for this chat session
   * @returns {string} A unique session ID
   */
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15) +
           '_' + new Date().getTime();
  }

  /**
   * Set the OpenAI API key
   * @param {string} key - OpenAI API key
   */
  setApiKey(key) {
    // Validate the API key format
    if (key && (key.startsWith('sk-') || key.startsWith('sk-proj-'))) {
      this.apiKey = key;
      console.log(`API key set successfully (${key.startsWith('sk-proj-') ? 'project' : 'traditional'} format)`);
      return true;
    } else {
      console.error('Invalid API key format. Must start with "sk-" or "sk-proj-"');
      return false;
    }
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
   * Check if the API key is valid
   * @returns {boolean} True if the API key is valid
   */
  hasValidApiKey() {
    const key = this.getApiKey();
    return key && (key.startsWith('sk-') || key.startsWith('sk-proj-'));
  }

  /**
   * Set a user identifier for logging purposes
   * @param {string} identifier - User identifier (email, name, etc.)
   */
  setUserIdentifier(identifier) {
    if (this.config.logging) {
      this.config.logging.userIdentifier = identifier;
    }
  }

  /**
   * Log a chat message to Google Sheets
   * @param {string} role - The role of the message sender ('user' or 'assistant')
   * @param {string} content - The message content
   * @returns {Promise<void>}
   */
  async logChatMessage(role, content) {
    if (!this.config.logging || !this.config.logging.enabled || !this.config.logging.googleScriptUrl) {
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const data = {
        timestamp: timestamp,
        sessionId: this.sessionId,
        conversationStartTime: this.conversationStartTime,
        userIdentifier: this.config.logging.userIdentifier || 'anonymous',
        role: role,
        message: content,
        // Collect some basic, non-identifying information for analytics
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer || 'direct',
        // You can add more fields as needed
      };

      // Send the data to Google Sheets via the Apps Script Web App
      await fetch(this.config.logging.googleScriptUrl, {
        method: 'POST',
        mode: 'no-cors', // This is important for CORS issues
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      console.log('Chat message logged to Google Sheets');
    } catch (error) {
      // Don't let logging errors affect the chat functionality
      console.error('Error logging chat message:', error);
    }
  }

  /**
   * Add a message to the conversation history
   * @param {string} role - The role of the message sender ('user' or 'assistant')
   * @param {string} content - The message content
   */
  async addMessage(role, content) {
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

    // Log the message to Google Sheets if logging is enabled
    if (role !== 'system') { // Don't log system messages
      await this.logChatMessage(role, content);
    }
  }

  /**
   * Send a message to the OpenAI API
   * @param {string} message - The user's message
   * @returns {Promise<string>} Promise resolving to the AI's response
   */
  async sendMessage(message) {
    const apiKey = this.getApiKey();
    if (!this.hasValidApiKey()) {
      throw new Error('Valid API key not available. Please enter a valid OpenAI API key (starts with sk- or sk-proj-).');
    }

    if (this.isWaitingForResponse) {
      throw new Error('Already waiting for a response. Please wait.');
    }

    this.isWaitingForResponse = true;

    try {
      // Add user message to history and log it
      await this.addMessage('user', message);

      // Prepare headers based on API key format
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add the appropriate authorization header based on API key format
      if (apiKey.startsWith('sk-proj-')) {
        // Project API key format (newer OpenAI platform)
        headers['Authorization'] = `Bearer ${apiKey}`;
        // No OpenAI-Beta or OpenAI-Version headers to avoid compatibility issues
      } else {
        // Traditional API key format
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      console.log('Using headers:', JSON.stringify(headers, null, 2));

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: this.config.model,
          messages: this.messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        let errorMessage = 'Error communicating with OpenAI API';
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
            console.error('OpenAI API error details:', errorData.error);
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `API error (status ${response.status}): ${response.statusText}`;
        }

        // Log the full error for debugging
        console.error('Full API error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();

      // Add AI response to history and log it
      await this.addMessage('assistant', aiResponse);

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

      // Create a user-friendly error message
      let userFriendlyMessage = "I'm sorry, I encountered an error while processing your request.";

      // For technical users, include the actual error but simplified
      if (error.message) {
        // Check for common API errors and provide more helpful messages
        if (error.message.includes('API key')) {
          userFriendlyMessage = "I'm having trouble with my connection to OpenAI. The administrator should check the API key configuration.";
        } else if (error.message.includes('Rate limit')) {
          userFriendlyMessage = "I've reached my usage limit. Please try again in a few minutes.";
        } else if (error.message.includes('maximum context length')) {
          userFriendlyMessage = "Our conversation has become too long. Please click 'Reset Chat' to start a new conversation.";
        } else {
          // For other errors, provide a generic message with the option to see details
          userFriendlyMessage += " Please try again or contact support if the problem persists.";
        }
      }

      // Show error message
      addMessageToUI(userFriendlyMessage, 'error');
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

      // Use the predefined API key from the configuration
      if (openAIChat.hasValidApiKey()) {
        console.log('Using predefined API key');
        // Add a welcome message to indicate the chatbot is ready
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages && chatMessages.childNodes.length === 1) {
          const readyMessage = document.createElement('div');
          readyMessage.className = 'message message-received';
          readyMessage.textContent = 'I\'m ready to answer your questions about our tuition services!';
          chatMessages.appendChild(readyMessage);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      } else {
        console.error('No valid API key found in configuration');
      }

      console.log('OpenAI chatbot initialized');
    }, 100);
  }
});

// Make OpenAI chat available globally
window.OpenAIChat = openAIChat;
