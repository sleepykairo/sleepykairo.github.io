let playerId;
let playerRef;
let playerElements = {};

function init() {
    const allPlayersRef = firebase.default.database().ref("players");

    allPlayersRef.on("value", (snapshot) => {
        console.log("what does this even do");
    })
    allPlayersRef.on("child_added", (snapshot) => {
        const addedPlayer = snapshot.val();

        const playerElement = document.createElement("button");
        const textNode = document.createTextNode(addedPlayer.name);
        playerElement.appendChild(textNode);
        playerElement.setAttribute("id", `button_${addedPlayer.id}`);
        document.body.appendChild(playerElement);

        playerElements[addedPlayer.id] = playerElement;
        console.log("added " + addedPlayer.id);
    });
}

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
        playerRef.onDisconnect();

        init();
    } else {
        //failed to log in probably
    }
});

firebase.default.auth().signInAnonymously().catch(error => console.log(error.code, error.message));

var usernameInput = document.getElementById("usernameInput");
usernameInput.addEventListener("change", () => {
    playerRef.set({name: usernameInput.value});
    playerElements[playerId].textContent = usernameInput.value;

/*    const para = document.createElement("p");
    const textNode = document.createTextNode(usernameInput.value);
    para.appendChild(textNode);
    document.body.appendChild(para);*/
});

var logAllPlayersButton = document.getElementById("logAllPlayers");
logAllPlayersButton.addEventListener("click", () => {
    console.log(playerElements);
});
