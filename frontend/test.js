const qrcode = require('qrcode-generator');

var base64 = 'data:image/png;base64,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';
var width = 200;
var height = 200;

var img = '';
img += '<img';
img += '\u0020src="';
img += 'data:image/gif;base64,';
img += base64;
img += '"';
img += '\u0020width="';
img += width;
img += '"';
img += '\u0020height="';
img += height;
img += '"';
// if (alt) {
//     img += '\u0020alt="';
//     img += alt;
//     img += '"';
// }
img += '/>';

var img = 'data:image/gif;base64,' + base64;
var qr = qrcode(4, 'M');
qr.addData('This is base64 string');
qr.make();
console.log(qr.createImgTag());