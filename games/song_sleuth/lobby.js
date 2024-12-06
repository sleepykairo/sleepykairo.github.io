let playerId;
let playerLobbyRef;

// const roomsRef = firebase.default.database().ref(`rooms`);

function init() {
    let lobbyCodeInput = document.getElementById("lobbyCodeInput");
    let lobbyCodeButton = document.getElementById("joinLobbyButton");
    let createLobbyButton = document.getElementById("createLobbyButton");
    let usernameInput = document.getElementById("usernameInput");
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
    createLobbyButton.addEventListener("click", (event) => {
        // firebase.default.database().ref(`rooms/${lobbyCodeInput.value}`).on('value', (snapshot) => {
        //     // createLobby();
        // }) why
        console.log("createLobbyButton clicked");
        createLobby();
    })
    usernameInput.addEventListener("change", (event) => {
        console.log(usernameInput.value);
    })

    function joinLobby(code) {
        let lobbyRef = firebase.default.database().ref(`rooms/${code}/players/${playerId}`)
        localStorage.setItem("lobbyCode", code);

        lobbyRef.set({
            name: usernameInputValue(),
            id: playerId,
            host: false,
            roomId: code,
        })
        window.location.href = "./game.html";
    }

    function createLobby() {
        let roomId;

        //thanks erik.onarheim :DDDD
        function random4Captials() {
            const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return alpha[Math.floor(Math.random() * 26)] +
                alpha[Math.floor(Math.random() * 26)] +
                alpha[Math.floor(Math.random() * 26)] +
                alpha[Math.floor(Math.random() * 26)]
        }

        roomId = random4Captials();

        localStorage.setItem("lobbyCode", roomId);

        let lobbyRef = firebase.default.database().ref(`rooms/${roomId}/players/${playerId}`);

        lobbyRef.set({
            name: usernameInputValue(),
            id: playerId,
            host: true,
            roomId: roomId,
        })
        window.location.href = "./game.html";
        // console.log("called createLobby()");
    }

    function usernameInputValue() {
        console.log(usernameInput.value);
        if (usernameInput.value === "") {
            return "Player";
        }
        return usernameInput.value;
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
