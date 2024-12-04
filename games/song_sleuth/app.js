let playerId;
let playerRef;
let playerElements = {};
let lastFmDataJSON;
let correctPlayer;
let topTracks = [];
let roomId;

function init() {
    const allPlayersRef = firebase.default.database().ref(`rooms/${roomId}/players`);

    allPlayersRef.on("value", (snapshot) => {
        console.log(`Database called value: ${snapshot.val()}`);
    })
    allPlayersRef.on("child_added", (snapshot) => {
        const addedPlayer = snapshot.val();

        const playerElement = document.createElement("button");
        const textNode = document.createTextNode(addedPlayer.name);
        playerElement.appendChild(textNode);
        playerElement.setAttribute("id", `button_${addedPlayer.id}`);
        playerElement.setAttribute("class", "playerButton");
        document.body.appendChild(playerElement);

        playerElements[addedPlayer.id] = playerElement;
        console.log("added " + addedPlayer.id);
    })
    allPlayersRef.on("child_changed", (snapshot) => {
        const changedPlayer = snapshot.key;
        const change = snapshot.val();
        playerElements[changedPlayer].textContent = change.name;

        console.log(`${changedPlayer} changed name to ${change.name}`);
    })
}

function startGame() {
    correctPlayer = randomKeyFromDict(playerElements);
    console.log(correctPlayer);
}

firebase.default.auth().onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
        //logged in i think
        playerId = user.uid;
        playerRef = firebase.default.database().ref(`rooms/${roomId}/players/${playerId}`);

        playerRef.set({
            name: "Player",
            id: playerId,
            ready: false,
        })
        playerRef.onDisconnect().remove();
        playerRef.on("value", (snapshot) => {
            console.log(snapshot.val());
        })

        init();
    } else {
        //failed to log in probably
    }
});

firebase.default.auth().signInAnonymously().catch(error => console.log(error.code, error.message));

var usernameInput = document.getElementById("usernameInput");
usernameInput.addEventListener("change", () => {
    playerRef.set({
        name: usernameInput.value,
        id: playerId,
        ready: false,
    });
    playerElements[playerId].textContent = usernameInput.value;
});

var fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", () => {
    var fr = new FileReader();
    var result;
    fr.onload = function(e) {
        // e.target.result should contain the text
        result = e.target.result;
        lastFmDataJSON = CSVtoJSON(result);
        console.log(CSVtoJSON(result));
        findTopTracks();
    };
    fr.readAsText(fileInput.files[0]);
})

document.getElementById("startGame").addEventListener("click", () => {
    startGame();
})

//funny functions
function randomKeyFromDict(dict) {
    var keys = Object.keys(dict);
    var randomKey = Math.floor(Math.random() * keys.length);
    return keys[randomKey];
}

function findTopTracks() {
    let lastFmDataShort = lastFmDataJSON;
    for (let obj of lastFmDataShort) {
        console.log(`iterating through ${obj.track}`);

        delete obj.uts;
        delete obj.utc_time;
        delete obj.artist_mbid;
        delete obj.album_mbid;

        topTracks.push({
            track: obj,
            plays: 0,
        });
        console.log(topTracks[obj].getOwnPropertyNames(obj));

    }
    topTracks.sort((a, b) => a.plays - b.plays);
    console.log(topTracks);
    // console.log(topTracks.length);
}

//https://stackoverflow.com/users/6128573/sandeep-sherpur THANKS!!!!
function CSVtoJSON(text, quoteChar = '"', delimiter = ',') {
    var rows=text.split("\n");
    var headers=rows[0].split(",");

    const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, 'gs');

    const match = line => [...line.matchAll(regex)]
        .map(m => m[2])
        .slice(0, -1);

    var lines = text.split('\n');
    const heads = headers ?? match(lines.shift());
    lines = lines.slice(1);

    return lines.map(line => {
        return match(line).reduce((acc, cur, i) => {
            // replace blank matches with `null`
            const val = cur.length <= 0 ? null : Number(cur) || cur;
            const key = heads[i] ?? `{i}`;
            return { ...acc, [key]: val };
        }, {});
    });
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}