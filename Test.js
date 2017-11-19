let Commands = {};

Commands.main = {
    help: '',
    args: [''],
    command: undefined
};
Commands.sub = [];
Commands.sub.com = {
    help: '',
    args: ['test'],
    command: undefined
};

console.log(Commands);

let prefix = ']';
let m = {};

m.content = ']main awkward';

let arr = m.content.split(' ');
let cmd = arr.shift().slice(prefix.length); 
let sub, args, path;

console.log(cmd);

if (!Commands.hasOwnProperty(cmd)) return console.log('NOT INCLUDE');
if (Commands[cmd] instanceof Array) {
    sub = arr.shift();
    args = arr;
    path = `./${cmd}/${sub}.js`;
}
else if (Commands[cmd] instanceof Object) {
    args = arr;
    path = `./${cmd}.js`;
}

console.log(path);
/*
let p = ']';

let arr = m.split(' ');

let cmd = arr.shift().slice(p.length);
let arg = arr.reverse().slice(0, a.length).reverse();
let sub = arr.filter(e => {
    return !arg.includes(e);
})[0];

console.log(cmd);
console.log(sub);
console.log(arg);
*/
