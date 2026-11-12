const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servírování statických souborů z adresáře "public"
app.use(express.static('public'));

// Simulovaný stav hry na serveru
let gameState = {
  player: {
    name: "Hráč 1 (Ty)",
    balance: 14500,
    gallery: []
  },
  currentArt: {
    title: "Kyber-Krtkův sen",
    author: "AI_Vanguard",
    image: "https://picsum.photos/seed/cyberart/400/300",
    estimatedRange: "4 000 - 7 000 Kč",
    currentBid: 5200,
    highestBidder: "Honza"
  },
  bidHistory: [
    { text: "Honza přihodil 5 200 Kč", time: "12:00" },
    { text: "Anička přihodila 5 000 Kč", time: "11:59" }
  ]
};

io.on('connection', (socket) => {
  console.log('Nový hráč se připojil:', socket.id);

  // Pošli aktuální stav novému hráči
  socket.emit('update_state', gameState);

  // Reakce na kliknutí tlačítka přihozu
  socket.on('place_bid', (amount) => {
    gameState.currentArt.currentBid += amount;
    gameState.currentArt.highestBidder = gameState.player.name;
    
    // Přidej záznam do historie
    gameState.bidHistory.unshift({
      text: `${gameState.player.name} přihodil +${amount} Kč (Celkem: ${gameState.currentArt.currentBid} Kč)`,
      time: new Date().toLocaleTimeString()
    });

    // Pošli aktualizovaný stav všem připojeným klientům
    io.emit('update_state', gameState);
  });
});

server.listen(3000, () => {
  console.log('Server běží na http://localhost:3000');
});