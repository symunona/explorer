var _firstLoad = true;

function loadGame(gameId){
    var def = $.Deferred();

    if (_firstLoad){
        // Init Firebase.
        var config = {
            apiKey: "AIzaSyCXmDPWB2Ww7WfytNANHkKXEjBsNfehFIs",
            authDomain: "explorer-8bb1d.firebaseapp.com",
            databaseURL: "https://explorer-8bb1d.firebaseio.com",
            projectId: "explorer-8bb1d",
            storageBucket: "explorer-8bb1d.appspot.com",
            messagingSenderId: "88000557828"
        };
        firebase.initializeApp(config);
        _firstLoad = false;
    }

    firebase.database().ref('games/' + gameId)
            .once('value').then(function(gameData){
                def.resolve(gameData.val());                
            }).catch(function(e){
                console.error(e);
                def.reject(e);
            })

    return def;
}
