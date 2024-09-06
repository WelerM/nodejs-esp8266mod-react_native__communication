import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [serverIP, setServerIP] = useState<string | null>(null);
  const [inputIP, setInputIP] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);  // State to store log messages

  // Helper function to log messages and display them in the UI
  const logMessage = (message: string) => {
    console.log(message);
    setLogs(prevLogs => [...prevLogs, message]);  // Append the new message to the logs
  };

  // Fetch server IP from local storage
  useEffect(() => {
    const fetchServerIP = async () => {
      try {
        const savedIP = await AsyncStorage.getItem('serverIP');
        if (savedIP) {
          setServerIP(savedIP);
          setInputIP(savedIP);
          logMessage(`Loaded Server IP: ${savedIP}`);
        } else {
          logMessage('No Server IP saved');
        }
      } catch (error) {
        logMessage(`Failed to load server IP: ${error}`);
      }
    };

    fetchServerIP();
  }, []);

  const saveServerIP = async () => {
    try {
      await AsyncStorage.setItem('serverIP', inputIP);
      setServerIP(inputIP);
      logMessage(`Server IP saved: ${inputIP}`);
    } catch (error) {
      logMessage(`Failed to save server IP: ${error}`);
    }
  };

  const connectWebSocket = () => {
    if (!serverIP) {
      logMessage('Server IP is not defined, skipping WebSocket connection.');
      return;
    }

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      logMessage('WebSocket is already connected.');
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
        logMessage('Reconnection attempts cleared due to active connection.');
      }
      setIsConnected(true);
      return;
    }

    socket.current = new WebSocket(`ws://${serverIP}:8080`);

    socket.current.onopen = () => {
      logMessage('WebSocket Connected');
      setIsConnected(true);
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
        logMessage('Reconnection attempts cleared after successful connection.');
      }
    };

    socket.current.onmessage = (event: WebSocketMessageEvent) => {
      logMessage(`Received: ${event.data}`);
    };

    socket.current.onerror = (error: Event) => {
      logMessage(`WebSocket Error: ${error}`);
      setIsConnected(false);
    };

    socket.current.onclose = (e: WebSocketCloseEvent) => {
      logMessage(`WebSocket Closed: ${e.code}, ${e.reason}`);
      setIsConnected(false);

      if (e.code === 1006 || !isConnected) {
        logMessage('Connection was reset. Attempting to reconnect...');
        attemptReconnect();
      }
    };
  };

  const attemptReconnect = () => {
    if (!reconnectIntervalRef.current) {
      reconnectIntervalRef.current = setInterval(() => {
        logMessage('Attempting to reconnect...');
        connectWebSocket();
      }, 5000);
    }
  };

  useEffect(() => {
    if (serverIP) {
      connectWebSocket();
    }

    return () => {
      if (socket.current) {
        socket.current.close();
      }
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    };
  }, [serverIP]);

  const sendCommand = (command: string) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(command);
      // logMessage(`Sent: ${command}`);
    } else {
      logMessage(`WebSocket is not open. Ready state: ${socket.current?.readyState}`);
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
        value={inputIP}
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
        onPressIn={() => handlePressIn('foward')}
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
  
    <ScrollView style={styles.logContainer}>
      {logs.map((log, index) => (
        <Text key={index} style={styles.logText}>
          {log}
        </Text>
      ))}
    </ScrollView>
  </View>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '70%',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginLeft: 10,
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
  logContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  logText: {
    fontSize: 12,
    color: 'black',
  },
});
