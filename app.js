const http = require('http');
const fs = require('fs');

const port = process.env.PORT || 3000;

const respond = require('./lib/respond.js')

const server = http.createServer(respond);

server.listen(port, () => {
    console.log(`listening on port: ${port}`);
})
