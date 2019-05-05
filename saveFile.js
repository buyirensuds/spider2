var fs = require('fs');
var request = require('request');

if(!http){
    var http = require('http');
}

function saveFile(filePath, url) {
    console.log(url, 'execute save...');
    var writeStream = fs.createWriteStream(filePath);
    writeStream.on('finish', function () {
        console.log(filePath+' write finished...');
    });
    writeStream.on('error', function (err) {
        console.log('write err...', err);
    });
    /*request.head(url, function(err,res,body){
        if(err){
            console.log(err);
        }
    });*/
    var options = {
        url: url,
        method: "get",
        headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            Host: 'img.netbian.com',

        }
    };
    request( options, function (err,res,body) {
        if(err){
            console.log(err);
        }
        console.log(url, ' requested...');
    }).pipe(writeStream);
    /*fs.open(filePath, 'w+', function (err, fd) {
        if(err){
            return console.log('open file err: ', err);
        }
        console.log('open ok ...');
        getPicture(function () {
            fs.close(fd, function (err) {
                if(err){
                    return console.log(err);
                }
                console.log('close end...');
            });
        });
    });*/

    function getPicture(closefn) {
        http.get(url, res => {
            var len = 0;
            var data = [];
            res.on('error', function (err) {
                console.log('save err...', err);
            });
            res.on('data', chunk => {
                len+=chunk.length;
                data.push(chunk);
            });
            res.on('end', ()=>{
                var writeStream = fs.createWriteStream(filePath);

                writeStream.on('finish', function () {
                    console.log('write finished...');
                });

                writeStream.on('error', function (err) {
                    console.log('write err...', err);
                });
                for(var i=0;i<data.length;i++){
                    writeStream.write(data[i]);
                }
                writeStream.end();
                closefn instanceof Function && closefn();
                len +='';
                len = len.replace(/(?=\B(\d{3})+$)/g, ',');
                console.log(filePath+'文件大小 :', len, 'KB');
                console.log('img url: ', url);
                console.log('end...');
            });
        });
    }
}

exports.saveFile = saveFile;