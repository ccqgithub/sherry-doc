/**
 * 扫描目录下的文档文件
 * author: season.chen
 */

var fs = require('fs'),
    path = require('path'),
    config = require('./config.json'),
    yaml = require('./lib/js-yaml/js-yaml.js'),
    dateFormat = require('./lib/dateformat.js'),
    doclist = [],
    all = [],
    basePath = './',
    dataPath = './data/',
    buffer,
    total = 0;

Date.prototype.Format = function(fmt) { //author: meizz 
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

doclist = config.doclist || [];

console.log('get config success……');
console.log('a total of '+ doclist.length +' documents.');
console.log('====================');

doclist.forEach(function(item, i) {
    var dir = path.join(basePath, item.path);
    var list = [];

    console.log('scan the document ' + i + '……');
    console.log('====================');

    try {
    	list = walk(dir);
    	all[i] = list;
    	total += list.length;
    } catch( err ) {
    	console.log( err );
    }
});

console.log('generate document article\'s list json……');
all.forEach(function(item, i) {
	var filename = path.join(dataPath, 'articles-' + i + '.json');
	var buffer = JSON.stringify(item, null, '\t');

	doclist[i]['articles'] = filename;
	doclist[i]['count'] = item.length;
	console.log('write json: ' + filename);
	fs.open(filename, "w", 0777, function(e, fd){
	    if(e) throw e;
	    fs.writeSync(fd, buffer)
	    fs.closeSync(fd);
	});
});

console.log('====================');
configFilename = path.join(dataPath, 'config.json');
console.log('write json: ' + configFilename);
buffer = JSON.stringify(config, null, '\t');
fs.open(configFilename, "w", 0777, function(e, fd){
    if(e) throw e;
    fs.writeSync(fd, buffer)
    fs.closeSync(fd);
});

console.log('====================');
console.log('success!');
console.log('total '+ all.length +' documents.');
console.log('total '+ total +' articles.');

/**
 * 根据后缀名判断是否是markdown文件
 */
function isMd(str) {
    var arr = str.split('.');
    var ext = arr.pop();
    ext = ext.toLowerCase();
    if (ext == 'md') {
        return true;
    }
    return false;
}

/**
 * 扫描一个文档
 */
function walk(p) {

    var dirList;
    var filename;
    var list = [];

    console.log('walking ' + p + '……');
    console.log('====================');

    try {
        dirList = fs.readdirSync(p);
        try {
            dirList.forEach(function(item) {
            	var sPath = path.join(p, item);

                try {
                    var stat = fs.lstatSync(sPath);
                    if (stat.isDirectory()) {
                        walk(sPath);
                    } else {
                        if (stat.isFile()) {
                            if (isMd(sPath)) {
                                parseFile(sPath);
                            }
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            });
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        console.log(err);
    }

    function parseFile(filename) {
    	var splitStr = config['confSplit'];
    	var contentText = fs.readFileSync(filename, 'utf-8');
    	var arr, confStr, conf;

    	arr = contentText.split(splitStr, 2);
    	confStr = arr.length > 1 ? arr[0] : '';

    	conf = yaml.safeLoad(confStr);
    	conf.file = filename;

    	// 处理日期
    	if (conf.date instanceof Date) {
    		conf.date = dateFormat(conf.date, "yyyy-MM-dd HH:mm:ss");
    	} 

        list.push(conf);
    }

    return list;
}
