import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

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
  }, [url, protocols, token, shouldConnect, onConnect, onMessage, onDisconnect, onError, maxReconnectAttempts, reconnectInterval]);

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

// Specialized hook for summary progress updates
export const useSummaryWebSocket = (onProgressUpdate?: (data: any) => void) => {
  const wsUrl = `${import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'}/ws/summaries`;
  
  return useWebSocket({
    url: wsUrl,
    shouldConnect: true,
    onMessage: (message) => {
      if (message.type === 'summary_progress' || message.type === 'summary_completed') {
        onProgressUpdate?.(message.data);
      }
    },
    onError: (error) => {
      console.error('Summary WebSocket error:', error);
    },
  });
};
