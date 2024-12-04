let playerId;
let playerLobbyRef;

// const roomsRef = firebase.default.database().ref(`rooms`);

function init() {
    let lobbyCodeInput = document.getElementById("lobbyCodeInput");
    let lobbyCodeButton = document.getElementById("joinLobbyButton");
    lobbyCodeButton.addEventListener("click", (event) => {
        firebase.default.database().ref(`rooms/${lobbyCodeInput.value}`).on('value', (snapshot) => {
            if (snapshot.exists() && lobbyCodeInput.value !== "" && lobbyCodeInput.value !== "lobby") {
                joinLobby(lobbyCodeInput.value);
                console.log(`Room ${lobbyCodeInput.value} is valid`);
            } else {
                console.log(`Room ${lobbyCodeInput.value} is NOT valid`);
            }
        })
    })

    function joinLobby(code) {
        let lobbyRef = firebase.default.database().ref(`rooms/${code}/players/${playerId}`)

        window.location.href = "./game.html";
        lobbyRef.set({
            name: "Player",
            id: playerId,
            host: false,
        })
    }

    function createLobby(code) {
        let lobbyRef = firebase.default.database().ref(`rooms/${code}/players/${playerId}`)

        window.location.href = "./game.html";
        lobbyRef.set({
            name: "Player",
            id: playerId,
            host: true,
        })
    }
}

firebase.default.auth().onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
        //logged in i think
        playerId = user.uid;
        playerLobbyRef = firebase.default.database().ref(`rooms/lobby/players/${playerId}`);

        playerLobbyRef.set({
            name: "Player",
            id: playerId,
        })
        playerLobbyRef.onDisconnect().remove();
        playerLobbyRef.on("value", (snapshot) => {
            console.log(snapshot.val());
        })

        init();
    } else {
        //failed to log in probably
    }
});

firebase.default.auth().signInAnonymously().catch(error => console.log(error.code, error.message));
