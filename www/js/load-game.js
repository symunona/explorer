var _firstLoad = true;

function loadGame(gameId){
    var def = $.Deferred();

    if (_firstLoad){
        // Init Firebase. Config loaded in another file.        
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
