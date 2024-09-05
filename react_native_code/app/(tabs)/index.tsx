import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [serverIP, setServerIP] = useState<string | null>(null);  // Initially null to indicate no value yet
  const [inputIP, setInputIP] = useState<string>('');

  // Fetch server IP from local storage
  useEffect(() => {
    const fetchServerIP = async () => {
      try {
        const savedIP = await AsyncStorage.getItem('serverIP');
        if (savedIP) {
          setServerIP(savedIP);  // Set the server IP from storage
          setInputIP(savedIP);    // Also set it in the TextInput for display
        } else {
          console.log('No Server IP saved');
        }
      } catch (error) {
        console.error('Failed to load server IP:', error);
      }
    };

    fetchServerIP();
  }, []);

  // Save server IP when the user enters a new one
  const saveServerIP = async () => {
    try {
      await AsyncStorage.setItem('serverIP', inputIP);
      setServerIP(inputIP); // Update the server IP after saving
      console.log('Server IP saved:', inputIP);
    } catch (error) {
      console.error('Failed to save server IP:', error);
    }
  };

  const connectWebSocket = () => {
    if (!serverIP) {
      console.log('Server IP is not defined, skipping WebSocket connection.');
      return; // Do not attempt to connect if the server IP is not defined
    }

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket is already connected.');

      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
        console.log('Reconnection attempts cleared due to active connection.');

        setIsConnected(true);
      }

      return;
    }

    socket.current = new WebSocket(`ws://${serverIP}:8080`);

    socket.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);

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
      }, 5000);
    }
  };

  // Try connecting to WebSocket only after the server IP has been retrieved
  useEffect(() => {
    if (serverIP) {
      connectWebSocket(); // Connect to WebSocket only if serverIP is defined
    }

    return () => {
      if (socket.current) {
        socket.current.close();
      }
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    };
  }, [serverIP]); // Trigger WebSocket connection only when serverIP changes from null

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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Server IP"
          value={inputIP}       // Display the current IP in the input
          onChangeText={setInputIP}
        />
        <TouchableOpacity style={styles.saveButton} onPress={saveServerIP}>
          <Text style={styles.buttonText}>Save IP</Text>
        </TouchableOpacity>
      </View>

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
  inputContainer: {
    flexDirection: 'row', // Align input and button horizontally
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '70%',  // Adjust width to give space for the button
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginLeft: 10, // Space between the input and button
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
});
