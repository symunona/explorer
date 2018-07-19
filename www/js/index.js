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

const BASE_URL = 'https://explorer.benthegoose.com'

var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        var game = localStorage.getItem(APP_STORAGE_KEY);
        if (game) {
            // Show welcome screen.
            app.game = JSON.parse(game);
            if (!app.game.status) {
                app.restoreGame();
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
        $('.challange h1 button.back').on('click', app.resetGameWithConfirm)
        $('.challange .ctrl-buttons button.back').on('click', app.prevChallange)
        $('.challange .ctrl-buttons button.forward').on('click', app.nextChallange)
    },

    startGame: function () {
        app.showChallenge(0);
        app.game.startTime = moment().format();
        app.game.currentChallenge = 0;
        console.warn('game started ', app.game.startTime)
        app.saveGame();
        app.registerNotifications();
    },

    showChallenge: function (index) {
        app.game.currentChallenge = index;
        var challenge = app.game.challenges[index]
        $('.challange h1 .title').html(challenge.title);
        $('.challange .content').html(challenge.description);
        $('.challange .ctrl-buttons button').hide();

        app.showPage('challange');

        // If there is a next challenge
        if (index + 1 < app.game.challenges.length) {
            if (this.isChallengeVisible(index + 1)) {
                $('.ctrl-buttons button.forward').show();
            }
        }
        if (index > 0) {
            $('.ctrl-buttons button.back').show();
        }
    },

    prevChallange: function () {
        app.showChallenge(app.game.currentChallenge - 1);
    },

    nextChallange: function () {
        app.showChallenge(app.game.currentChallenge + 1);
    },

    isChallengeVisible: function (index) {
        if (moment().diff(moment(app.game.startTime), 'seconds') > app.game.challenges[index].time) {
            return true;
        }
        return false;
    },

    resetGame: function () {
        app.game = false;
        localStorage.removeItem(APP_STORAGE_KEY);
        app.showPage('intro');
    },

    resetGameWithConfirm: function () {
        navigator.notification.confirm('Are you sure you want to stop the current game?', function () {
            app.game.startTime = undefined;
            app.game.currentChallenge = 0;
            cordova.plugins.notification.local.clearAll();
            cordova.plugins.notification.local.cancelAll();
            app.saveGame();
            app.showStartGame();
        })
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
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        // console.log('Received Event: ' + id);
    },

    onDownloadGame: function (key) {
        if (!key) { return; }        

        $.ajax({ url: 'games/' + key + '.json', contentType: 'application/json' }).then(function (gameData) {
            if (typeof (gameData) === 'string') gameData = JSON.parse(gameData);
            app.game = gameData;
            app.saveGame();
            app.showStartGame();
        }).fail(function () {
            $('.error').html('Game loading error. Try another one.')
        })
    },

    saveGame: function () {
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(app.game));
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

    updateStartButton: function () {
        if (app.canGameStartNow()) {
            $('button#start-game').removeAttr('disabled');
        } else {
            $('button#start-game').attr('disabled', true);
        }
    },

    showStartGame: function () {
        $('.app .start .game-title').html(app.game.name);
        $('.app .start .content').html(app.game.description);
        app.updateStartButton();
        app.showPage('start')
    },
    restoreGame: function () {
        if (app.game.startTime) {
            app.showChallenge(app.game.currentChallenge || 0);
        }
        else {
            app.showStartGame();
        }
    },

    showPage: function (cls) {
        $('.app').children().hide();
        $('.app > .' + cls).show();
        $('.app').scrollTop = 0;
    },

    loading: function (message) {
        $('.loading .message').html(message);
        app.showPage('loading');
    },

    error: function (message) {
        $('.error .message').html(message);
        app.showPage('error');
    },

    registerNotifications: function () {

        if (!window.cordova) return;

        cordova.plugins.notification.local.on('click', app.onNotificationClick)
        cordova.plugins.notification.local.on('trigger', app.onNotificationTrigger);

        var notifs = app.game.challenges.slice(1).map(function (c, i) {
            return {
                id: i + 1,
                title: c.title,
                text: c.description.substr(0, 40),
                icon: 'res://e',
                ongoing: true,
                at: moment(app.game.startTime).add(c.time, 'seconds').toDate()
            }
        });
        console.log('sceduling', notifs);
        // console.log('times', notifs.map(function(n){return moment(n.at).diff(moment(), 'seconds')}))

        cordova.plugins.notification.local.schedule(notifs);
    },

    onNotificationClick: function (notification) {
        console.warn('onclick', arguments, notification, i);
        app.showChallenge(notification.id);
    },

    onNotificationTrigger: function (notification) {
        console.warn('SHOWING challenge', notification.id, notification)
        app.showChallenge(notification.id);
        if (notification.id > 0) {
            cordova.plugins.notification.local.clear(notification.id - 1)
        }
    },

};

app.initialize();


