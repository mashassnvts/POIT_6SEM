 const WebSocketClient = require('rpc-websockets').Client;
    const wsClient = new WebSocketClient('ws://localhost:4000');
    
    wsClient.on('open', () => {
      wsClient.subscribe('fileModified');
      wsClient.on('fileModified', () => {
        console.log('File modification event received.');
      });
    });