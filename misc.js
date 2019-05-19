

var str = 'this1this2this3this4abc';
var arr = [];
var size = 5;
for(i = 0; i < str.length; i+=5) {
  arr.push(str.substr(i, size));
}

console.log(arr);
