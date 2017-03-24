// This is where your angular app js resides...
(function(){
    'use strict';

    angular
        .module('MyApp', [])
        .controller('AppController', AppController);

    function AppController($scope) {
        var session = null;

        $scope.isUsernameSet = false;
        $scope.message = '';
        $scope.people = [];
        $scope.messages = [];

        // Initialize Websocket
        WebsocketProvider.connect('ws://127.0.0.1:1337', listener);

        function listener(response) {
            var json = JSON.parse(response.data);

            if (json) {
                switch(json.type) {
                    case WebsocketProvider.BROADCAST_TYPE.ON_USER_CONNECT:
                    break;
                    case WebsocketProvider.BROADCAST_TYPE.ON_NEW_USER_CONNECT:
                    break;
                    case WebsocketProvider.BROADCAST_TYPE.ON_USER_DISCONNECT:
                    break;
                    case WebsocketProvider.BROADCAST_TYPE.ON_COLOR_ASSIGNED:
                    break;
                    case WebsocketProvider.BROADCAST_TYPE.FETCH_HISTORY:
                    break;
                    case WebsocketProvider.BROADCAST_TYPE.ON_MESSAGE_RECEIVED:
                    break;
                    default:
                        console.error('Unrecognized JSON type');
                    break;
                }
            } else {
                console.error('No JSON data parsed.');
            }
        }

        $scope.submit = function () {
            if (!session) {
                session = {
                    username: $scope.message
                }

                $scope.messages.push({
                    author: 'System',
                    content: `You are known as ${ session.username }`,
                    color: '#E3E3E3'
                });
                $scope.people.push(session);
                $scope.isUsernameSet = true;
            }

            WebsocketProvider.sendMessage($scope.message);

            $scope.message = '';
        }
    }
}());