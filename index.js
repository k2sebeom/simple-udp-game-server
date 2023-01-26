const dgram = require('dgram');

const socket = dgram.createSocket('udp4');

participants = {};
curr_idx = 0;

socket.on('listening', () => {
    console.log("Listening...");
});

socket.on('message', (msg, info) => {
    const packet = JSON.parse(msg.toString());
    const key = info.address + ":" + info.port;
    if(!participants[key]) {
        participants[key] = {
            id: curr_idx,
            info,
            updatedAt: Date.now()
        }
        curr_idx += 1;
    }
    else {
        participants[key].updatedAt = Date.now();
    }

    for (const [playerKey, player] of Object.entries(participants)) {
        const resp = JSON.stringify({ id: player.id, ...packet });
        if(playerKey !== key) {
            socket.send(resp, 0, resp.length, player.info.port, player.info.address, (err) => {
                if(err) {
                    console.error(err);
                }
            })
        }
    }
});

function cleanParticipants() {
    for (const [playerKey, player] of Object.entries(participants)) {
        if(Date.now() - player.updatedAt > 5000) {
            delete participants[playerKey];
        }
    }
}

setInterval(cleanParticipants, 5000);

socket.on('close', function() {
    console.log('closed');
});

socket.bind(3000);
