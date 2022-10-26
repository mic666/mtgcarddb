let http = require('http');
let https = require('https');
let scryfallJson;

https.get('https://api.scryfall.com/cards/dmu/10', (resp) => {
    let data =  [];
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        data.push(chunk);
    });
    // The whole response has been received. Print out the result.
    resp.on('end', () => {

        scryfallJson = JSON.parse(Buffer.concat(data).toString());
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Scryfall reply : \n" + JSON.stringify(scryfallJson,null,4));
}).listen(8080);