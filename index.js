const http = require('http');
const port = 3000;
const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const mustacheExpress = require('mustache-express');
const Busboy = require('busboy');
const path = require('path');
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

const songsDir = './public/songs/';
var songs = [];


app.get('/', (req, res) => {
    fs.readdir(songsDir, (err, files) => {
        songs = files;
        res.render('index', {
            songList: files,
            currentSong: files[0]
        });
    })
});


app.post('/upload', function(req, res) {
	var busboy = new Busboy({ headers: req.headers });
	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        if (filename.split('.').pop() === 'xm' && !songs.find(i => i === filename)) {
            var saveTo = path.join('./public/songs/', filename);
            console.log('Uploading: ' + saveTo);
            file.pipe(fs.createWriteStream(saveTo));
        } else {
            res.redirect('/');
        };
	});

	busboy.on('finish', function () {
		console.log('Upload complete');
		res.redirect('/');
	});
	return req.pipe(busboy);
});

app.get('/delete/:filename', function(req, res) {
    if (req.params.filename) {
        fs.unlink(songsDir + req.params.filename, function (err) {
            console.log(err);
        });
        res.redirect('/');
    }
});


app.listen(3000, () => console.log('Example app listening on port 3000!'));

app.use(fileUpload(), express.static('public'));

