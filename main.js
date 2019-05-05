var http = require('http');
var fs = require('fs');
var path = require('path');
var saveFile = require('./saveFile');
var cheerio = require('cheerio');

var filePath = './imgs';
fs.exists(filePath, function (exists) {
    if(exists){
        console.log('dir has been already created...');
    }
    else{
        console.log('dir is not exists, start create it now...');
        fs.mkdir(filePath);
        console.log(filePath + ' create finish...');
    }
});

var urlbase = 'http://www.netbian.com/index_';
var index = 1;
var url;
var noErr = true;
var savaDarution = 2800;
function getNextUrl(){
    if(index==1){
        url = urlbase.replace(/_$/, '.htm');
    }else{
        url = urlbase + index + '.htm';
    }
    index ++;
}
function requestPage(){
    http.get(url, function (res) {
        var data = [];
        res.on('data', function (chunk, err) {
            if(err){
                return console.log(err);
            }
            data.push(chunk);
        });
        res.on('end', function () {
            console.log('page request end...');
            var htmlStr = data.join('');
            rquestDataHandler(htmlStr);
        });
        res.on('error', function (error) {
            noErr = false;
            console.log(error);
        });
    });
}

function rquestDataHandler(htmlStr) {
    var $ = cheerio.load(htmlStr);
    var alinks = $('div.list>ul>li>a');
    var url;
    for(var i=1;i<alinks.length;i++){
        var id = alinks[i].attribs.href;
        id = /(\d+)/.exec(id)[1];
        url = 'http://www.netbian.com/desk/'+id+'-1920x1080.htm';
        toTargePage(url);
    }
}
var count = 1;
var saveQueue = [];
function toTargePage(url, _isLastSave) {
    http.get(url, function (res) {
        var data = [];
        res.on('data', function (chunk, err) {
            if(err){
                return console.log(err);
            }
            data.push(chunk);
        });
        res.on('end', function () {
            console.log('targePage request end...');
            var htmlstr = data.join('');
            var $ = cheerio.load(htmlstr);
            var url;
            var el = $('#main>table>tbody>tr>td>a');
            var src = el&&el[0] ? el[0].attribs.href : '';
            if (src){
                var save = function () {
                    saveFile.saveFile(path.join(filePath, (count++)+'.jpg'), src);
                }
                saveQueue.push(save);
            }
        });
    });
}

var clock = setInterval(function () {
    console.log('picture time...');
    if(saveQueue.length == 0){
        getNextUrl();
        requestPage();
        return;
    }
    var currentSaveFn = saveQueue[0];
    saveQueue.splice(0,1);
    currentSaveFn();
},savaDarution);
