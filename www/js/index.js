/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
const APP_STORAGE_KEY = 'game-on';

var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        var game = localStorage.getItem(APP_STORAGE_KEY);
        if (game) {
            // Show welcome screen.
            app.game = JSON.parse(game);
            if (!app.game.status) {
                app.showStartGame();
            }
            else {
                app.showPage('intro');
            }
        }
        else {
            app.showPage('intro');
        }

        app.bind();
    },

    bind: function () {
        $('button#load-game').on('click', function () {
            app.onDownloadGame($('#game-key').val());
        });
        $('#game-key').on('keypress', function (event) {
            if (event.keyCode == 13) {
                app.onDownloadGame($('#game-key').val());
            }
        });
        $('.start button.back').on('click', app.resetGame)
        $('button#start-game').on('click', app.startGame)
        $('.app').show();
    },

    startGame: function(){
        $('.challange h1').html('Good enough');
        $('.challange .content').html('here is some content');
        app.showPage('challange');
    },

    resetGame: function () {
        app.game = false;
        app.showPage('intro');
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    onDownloadGame: function (key) {
        if (!key) { return; }
        $.ajax({ url: key + '.json' }).then(function (gameData) {
            app.game = gameData;
            localStorage.setItem('game-on', JSON.stringify(gameData));
            app.showStartGame();
        }).fail(function () {
            $('.error').html('Game loading error. Try another one.')
        })
    },

    canGameStartNow: function () {
        var canStartNow = true;
        if (app.game.rules) {
            if (app.game.rules.time) {
                if (app.game.rules.time.after) {
                    if (moment().format('HH:mm') < app.game.rules.time.after) {
                        canStartNow = false;
                    }
                }
                if (app.game.rules.time.before) {
                    if (moment().format('HH:mm') > app.game.rules.time.before) {
                        canStartNow = false;
                    }
                }
            }
        }
        return canStartNow;
    },

    updateStartButton: function(){
        if (app.canGameStartNow()){
            $('button#start-game').removeAttr('disabled');
        } else{
            $('button#start-game').attr('disabled', true);
        }        
    },

    showStartGame: function () {
        $('.app .start .game-title').html(app.game.name);
        $('.app .start .content').html(app.game.description);
        app.updateStartButton();
        app.showPage('start')
    },

    showPage: function (cls) {
        $('.app').children().hide();
        $('.' + cls).show();
    },

    loading: function (message) {
        $('.loading .message').html(message);
        app.showPage('loading');


    }
};

app.initialize();


