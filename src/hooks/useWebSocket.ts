import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';

// Global WebSocket manager to prevent multiple connections
class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private connectionStatus: 'Connecting' | 'Open' | 'Closing' | 'Closed' | 'Error' = 'Closed';
  private reconnectAttempts = 0;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  connect(url: string, token: string) {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      const wsUrl = new URL(url);
      wsUrl.searchParams.set('token', token);
      
      this.ws = new WebSocket(wsUrl.toString());
      this.connectionStatus = 'Connecting';

      this.ws.onopen = () => {
        this.connectionStatus = 'Open';
        this.reconnectAttempts = 0;
        console.log('Global WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          // Notify all subscribers
          this.subscribers.forEach(callback => callback(message));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.connectionStatus = 'Closed';
        console.log('Global WebSocket disconnected');
        
        // Attempt to reconnect if we have subscribers
        if (this.subscribers.size > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.reconnectTimeoutId = setTimeout(() => {
            this.connect(url, token);
          }, this.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        this.connectionStatus = 'Error';
        console.error('Global WebSocket error:', error);
      };

    } catch (error) {
      this.connectionStatus = 'Error';
      console.error('WebSocket connection failed:', error);
    }
  }

  subscribe(id: string, callback: (message: WebSocketMessage) => void) {
    this.subscribers.set(id, callback);
  }

  unsubscribe(id: string) {
    this.subscribers.delete(id);
    
    // Disconnect if no subscribers left
    if (this.subscribers.size === 0) {
      this.disconnect();
    }
  }

  disconnect() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatus = 'Closed';
  }

  sendMessage(message: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }
}

// Global instance
const globalWebSocketManager = new WebSocketManager();

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url: string;
  protocols?: string | string[];
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  shouldConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = ({
  url,
  protocols,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  shouldConnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'Connecting' | 'Open' | 'Closing' | 'Closed' | 'Error'
  >('Closed');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutId = useRef<NodeJS.Timeout>();
  const { token } = useAuthStore();

  const connect = useCallback(() => {
    if (!shouldConnect || !token) return;
    
    // Prevent multiple connections
    if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
      return;
    }
    
    // Close existing connection if any
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Add authentication token to WebSocket URL
      const wsUrl = new URL(url);
      wsUrl.searchParams.set('token', token);
      
      ws.current = new WebSocket(wsUrl.toString(), protocols);
      setConnectionStatus('Connecting');

      ws.current.onopen = () => {
        setConnectionStatus('Open');
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setConnectionStatus('Closed');
        onDisconnect?.();
        
        // Attempt to reconnect if needed
        if (
          shouldConnect && 
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          reconnectTimeoutId.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        setConnectionStatus('Error');
        onError?.(error);
      };

    } catch (error) {
      setConnectionStatus('Error');
      console.error('WebSocket connection failed:', error);
    }
  }, [url, protocols, token, shouldConnect, maxReconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (shouldConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, shouldConnect, token]);

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
};

// Specialized hook for summary progress updates using global WebSocket manager
export const useSummaryWebSocket = (onProgressUpdate?: (data: any) => void) => {
  const wsUrl = `${import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'}/ws/connect`;
  const { token } = useAuthStore();
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closing' | 'Closed' | 'Error'>('Closed');
  
  // Create a unique subscriber ID
  const subscriberId = useMemo(() => `summary-${Date.now()}-${Math.random()}`, []);
  
  // Use ref to avoid dependency issues with the callback
  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;

  useEffect(() => {
    if (!token) return;

    // Subscribe to messages
    globalWebSocketManager.subscribe(subscriberId, (message) => {
      if (message.type === 'task_progress' || message.type === 'summary_progress' || message.type === 'summary_completed') {
        onProgressUpdateRef.current?.(message.data);
      }
    });

    // Connect if not already connected
    globalWebSocketManager.connect(wsUrl, token);

    // Update local connection status
    const interval = setInterval(() => {
      setConnectionStatus(globalWebSocketManager.getConnectionStatus());
    }, 100);

    return () => {
      clearInterval(interval);
      globalWebSocketManager.unsubscribe(subscriberId);
    };
  }, [token, wsUrl, subscriberId]); // Removed onProgressUpdate from dependencies

  const sendMessage = useCallback((message: any) => {
    return globalWebSocketManager.sendMessage(message);
  }, []);

  return {
    connectionStatus,
    sendMessage,
  };
};
