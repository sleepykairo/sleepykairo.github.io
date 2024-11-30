let playerId;
let playerRef;



firebase.default.auth().onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
        //logged in i think
        playerId = user.uid;
        playerRef = firebase.default.database().ref(`players/${playerId}`);

        playerRef.set({
            name: "H3LL0",
            id: playerId,
        })
        playerRef.onDisconnect().remove();
    } else {
        //failed to log in probably
    }
})

firebase.default.auth().signInAnonymously().catch(error => console.log(error.code, error.message));
