(function(){
    'use strict';

    angular
        .module('MyApp')
        .service('WebsocketProvider', WebsocketProvider)

    function WebsocketProvider() {
        var conn = null;
        var vm = this;

        // If user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        /**
         * @constant BROADCAST_TYPE
         */
        vm.BROADCAST_TYPE = {
            ON_USER_CONNECT: 'on-user-connect',
            ON_USER_DISCONNECT: 'on-user-disconnect',
            ON_NEW_USER_CONNECT: 'on-new-user-connect',
            ON_COLOR_ASSIGNED: 'on-color-assigned',
            ON_MESSAGE_RECEIVED: 'on-message-received',

            FETCH_HISTORY: 'fetch-history',
        };

        /**
         * @function connect
         * 
         * Initiate connection with websocket server.
         * 
         * @param server {String} The server url.
         * @param onMessageReceiveCallback {Function} (Optional) Callback function when receiving message from websocket server.
         * @param onOpenCallback {Function} (Optional) Callback function when the websocket connection is opened.
         * @param onErrorCallback {Function} (Optional) Callback function when receiving error from websocket server.
        */
        vm.connect = function (server, onMessageReceiveCallback, onOpenCallback, onErrorCallback) {
            conn = new WebSocket(server);

            if (onMessageReceiveCallback)
                conn.onmessage = onMessageReceiveCallback;
            if (onOpenCallback)
                conn.onopen = onOpenCallback;
            if (onErrorCallback)
                conn.onerror = onErrorCallback;
        }

        /**
         * @function onMessageReceiveCallback
         * 
         * @param callback {Function} Callback function when receiving message from websocket server.
        */
        vm.onMessageReceiveCallback = function (callback) {
            if (conn)
                conn.onmessage = callback;
            else
                console.error('Websocket is not initialized');
        }

        /**
         * @function setOpenCallback
         * 
         * @param callback {Function} Callback function when the websocket connection is opened.
        */
        vm.setOpenCallback = function (callback) {
            if (conn)
                conn.onopen = callback;
            else
                console.error('Websocket is not initialized');
        }

        /**
         * @function setErrorCallback
         * 
         * @param callback {Function} Callback function when receiving error from websocket server.
        */
        vm.setErrorCallback = function (callback) {
            if (conn)
                conn.onerror = callback;
            else
                console.error('Websocket is not initialized');
        }

        /**
         * @function sendMessage
         * 
         * @param message {String} Message to be sent to the server.
        */
        vm.sendMessage = function (message) {
            if (conn)
                conn.send(message);
            else
                console.error('Websocket is not initialized');
        }
    }
}());