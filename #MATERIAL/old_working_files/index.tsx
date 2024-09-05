import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

export default function App() {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket is already connected.');
  
      // Clear reconnection attempts if the socket is already connected
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
        console.log('Reconnection attempts cleared due to active connection.');
  
        // Ensure the LED turns green by setting isConnected to true
        setIsConnected(true);
      }
  
      return;
    }
  
    socket.current = new WebSocket('ws://192.168.236.64:8080');
  
    socket.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
  
      // Clear reconnect attempts if successfully connected
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
        console.log('Reconnection attempts cleared after successful connection.');
      }
    };
  
    socket.current.onmessage = (event: WebSocketMessageEvent) => {
      console.log(`Received: ${event.data}`);
    };
  
    socket.current.onerror = (error: Event) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
    };
  
    socket.current.onclose = (e: WebSocketCloseEvent) => {
      console.log('WebSocket Closed:', e.code, e.reason);
      setIsConnected(false);
  
      // Handle connection reset (code 1006)
      if (e.code === 1006 || !isConnected) {
        console.log('Connection was reset. Attempting to reconnect...');
        attemptReconnect();
      }
    };
  };

  const attemptReconnect = () => {
    if (!reconnectIntervalRef.current) {
      reconnectIntervalRef.current = setInterval(() => {
        console.log('Attempting to reconnect...');
        connectWebSocket();
      }, 5000); // Retry every 5 seconds
    }
  };

  useEffect(() => {
    connectWebSocket(); // Connect when the app starts

    return () => {
      if (socket.current) {
        socket.current.close(); // Close socket on cleanup
      }
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current); // Clear reconnection attempts on cleanup
      }
    };
  }, []);

  const sendCommand = (command: string) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(command);
      console.log(`Sent: ${command}`);
    } else {
      console.warn('WebSocket is not open. Ready state:', socket.current?.readyState);
    }
  };

  const handlePressIn = (command: string) => {
    sendCommand(command);
  };

  const handlePressOut = () => {
    sendCommand('stop');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusIndicator, { backgroundColor: isConnected ? 'green' : 'red' }]} />
      <Text>{isConnected ? 'Server Connected' : 'Server Disconnected'}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('forward')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Forward</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('left')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Left</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('stop')}
          onPressOut={() => {}}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('right')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Right</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePressIn('backward')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Backward</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    margin: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    margin: 5,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
});
