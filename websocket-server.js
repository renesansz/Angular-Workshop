// ----------------------
// Node Websocket Server
// ----------------------
// Built using native nodejs implementation.

'use strict';

// Command Prompt Title
// --------------------
process.title = 'Chat Server';

var webSocket = require('websocket').server;
var http = require('http');

// Global Variables
// -----------------
var BROADCAST_TYPE = {
    ON_USER_CONNECT: 'on-user-connect',
    ON_USER_DISCONNECT: 'on-user-disconnect',
    ON_NEW_USER_CONNECT: 'on-new-user-connect',
    ON_COLOR_ASSIGNED: 'on-color-assigned',
    ON_MESSAGE_RECEIVED: 'on-message-received',

    FETCH_HISTORY: 'fetch-history',
};
var serverPort  = 1337;
var chatHistory = [];
var clientList  = [];
var people = [];
var colors = ['red', 'green', 'blue',
              'magenta', 'purple', 'plum',
              'orange', 'yellow', 'cyan'];

// Sort colors randomnly.
colors.sort(function() { return Math.random() > 0.5; } );

/**
 * Escape html string.
 *
 * @returns {String}
 */
function HTMLEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Initialize HTTP Server
 */
var server = http.createServer();

server.listen(serverPort, function() {
    console.log('Listening to port: ' + serverPort);
});

/**
 * Initialize webSocket server
 */
var webSocketSrv = new webSocket({
    httpServer: server
});

/**
 * webSocketSrv connection callback.
 *
 * @param {Object} req - The request sent by client
 */
function webSocketOnRequest(req) {

    console.log('Connection from origin: ' + req.origin);

    var conn = req.accept(null, req.origin);
    var peopleList = [];

    // Retrieve client list
    people.forEach(function (person) {
        if (person.username && person.userColor)
            peopleList.push({
                username: person.username,
                userColor: person.userColor,
            });
    });
    
    if (peopleList.length > 0) {
        conn.sendUTF(
            JSON.stringify({
                type: BROADCAST_TYPE.ON_USER_CONNECT,
                data: peopleList
            })
        );
    }

    var index = clientList.push(conn) - 1;
    var username = null;
    var userColor = null;

    people.push({
        username: username,
        userColor: userColor
    });

    // Retrieve chat history
    if (chatHistory.length > 0) {
        conn.sendUTF(
            JSON.stringify({
                type: BROADCAST_TYPE.FETCH_HISTORY,
                data: chatHistory
            })
        );
    }

    // Handle all messages from people
    // -------------------------------
    conn.on('message', function(mes) {
        if (mes.type === 'utf8') {
            var mesStr = mes.utf8Data;

            // If no username yet, set the first message as the username.
            // else, log and broadcast the message
            if (username === null) {
                username  = HTMLEntities(mesStr); // Get username
                userColor = colors.shift(); // Assign random color
                
                var currentUser = {
                    username: username,
                    userColor: userColor
                };

                people[index] = currentUser;

                // Return color assignment to user
                conn.sendUTF(
                    JSON.stringify({
                        type: BROADCAST_TYPE.ON_COLOR_ASSIGNED,
                        data: userColor
                    })
                );

                clientList.forEach(function (client, idx) {
                    // Broadcast to all except to the user itself
                    if (idx !== index) {
                        client.sendUTF(JSON.stringify({
                            type: BROADCAST_TYPE.ON_NEW_USER_CONNECT,
                            data: {
                                content: 'New user connected: ' + username,
                                author: 'System',
                                color: '#E3E3E3',
                                user: currentUser
                            }
                        }));
                    }
                });

                console.log('New user connected: ' + username);
            } else {
                var mesData = {
                    time: (new Date()).getTime(),
                    content: mesStr,
                    color: userColor,
                    author: username
                };

                chatHistory.push(mesData);  // Keep history of all sent messages
                chatHistory = chatHistory.slice(-100); // We need only the last 100 messages to be stored.

                // Broadcast received message to all clientList.
                clientList.forEach(function(client) {
                    client.sendUTF(JSON.stringify({
                        type: BROADCAST_TYPE.ON_MESSAGE_RECEIVED,
                        data: mesData
                    }));
                });
            }
        }
    });

    // Close connection
    conn.on('close', function(client) {
        console.log('Client ' + client + ' has disconnected.');
        clientList.splice(index, 1); // Remove client from list
        people.splice(index, 1);
        
        if (username !== null) {
            // Remove client from list
            colors.push(userColor); // Marked the user's color to be available
            
            var peopleList = [];
            
            people.forEach(function (person) {
                if (person.username && person.userColor)
                    peopleList.push({
                        username: person.username,
                        userColor: person.userColor,
                    });
            });
            
            clientList.forEach(function(client) {
                client.sendUTF(JSON.stringify({
                    type: BROADCAST_TYPE.ON_USER_DISCONNECT,
                    data: {
                        time: (new Date()).getTime(),
                        content: username + ' has left the discussion.',
                        author: 'System',
                        color: '#E3E3E3',
                        people: peopleList
                    }
                }));
            });
        }
    });
}
webSocketSrv.on('request', webSocketOnRequest);

// @ Renemari Padillo