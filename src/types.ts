/**
 * Configuration options for n8n-chat-pretty
 */
export interface ChatOptions {
  /**
   * The URL of your n8n webhook endpoint
   * @required
   */
  webhookUrl: string;

  /**
   * Configuration for the webhook request
   */
  webhookConfig?: {
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
  };

  /**
   * CSS selector for the target container
   * @default '#n8n-chat'
   */
  target?: string;

  /**
   * Render mode
   * @default 'fullscreen'
   */
  mode?: 'window' | 'fullscreen';

  /**
   * Initial greeting messages
   */
  initialMessages?: string[];

  /**
   * Key used for sending chat input to n8n
   * @default 'chatInput'
   */
  chatInputKey?: string;

  /**
   * Key used for session ID
   * @default 'sessionId'
   */
  chatSessionKey?: string;

  /**
   * Whether to load previous session
   * @default true
   */
  loadPreviousSession?: boolean;

  /**
   * Additional metadata to send with each message
   */
  metadata?: Record<string, unknown>;

  /**
   * Theme configuration
   */
  theme?: ThemeOptions;

  /**
   * Internationalization strings
   */
  i18n?: I18nOptions;

  /**
   * Typing indicator settings
   */
  typingIndicator?: {
    /**
     * Milliseconds per character for typing delay
     * @default 20
     */
    msPerChar?: number;
    /**
     * Base delay in milliseconds
     * @default 300
     */
    baseDelay?: number;
  };

  /**
   * Maximum characters per message bubble before splitting
   * @default 200
   */
  maxBubbleLength?: number;

  /**
   * Enable bubble animations
   * @default true
   */
  enableAnimations?: boolean;
}

export interface ThemeOptions {
  /**
   * Primary accent color (user messages, buttons)
   * @default '#e74266'
   */
  primaryColor?: string;

  /**
   * Background color for bot messages
   * @default 'rgba(206,206,206,.5)'
   */
  botMessageBackground?: string;

  /**
   * Background color for user messages
   * @default '#e74266'
   */
  userMessageBackground?: string;

  /**
   * Main background color
   * @default '#FFF'
   */
  backgroundColor?: string;

  /**
   * Main text color
   * @default '#000'
   */
  textColor?: string;

  /**
   * Font family
   * @default 'system-ui, -apple-system, sans-serif'
   */
  fontFamily?: string;

  /**
   * Border radius for bubbles
   * @default '1.25rem'
   */
  borderRadius?: string;
}

export interface I18nOptions {
  /**
   * Placeholder text for input field
   * @default 'Type your message...'
   */
  inputPlaceholder?: string;

  /**
   * Send button text
   * @default 'Send'
   */
  sendButtonText?: string;

  /**
   * Error message for connection failures
   * @default 'Connection error. Please try again.'
   */
  errorMessage?: string;

  /**
   * Fallback response when bot returns empty
   * @default "Sorry, I couldn't process that."
   */
  fallbackResponse?: string;
}

/**
 * Chat instance returned by createChat
 */
export interface ChatInstance {
  /**
   * Send a message programmatically
   */
  sendMessage: (text: string) => Promise<void>;

  /**
   * Add a message to the chat (without sending to webhook)
   */
  addMessage: (text: string, position: 'left' | 'right') => void;

  /**
   * Clear all messages
   */
  clear: () => void;

  /**
   * Destroy the chat instance
   */
  destroy: () => void;

  /**
   * Get the current session ID
   */
  getSessionId: () => string;

  /**
   * Reset the session (creates new session ID)
   */
  resetSession: () => void;
}
