const Promise = require("bluebird")
var readFile = Promise.promisify(require("fs").readFile)

async function useAsync() {
    let a = await readFile('index.html', 'utf-8');
    let b = await readFile('README.md', 'utf-8');

    let c = a + b;

    console.log(c);

    return c;
}

function usePromise() {
    let a;

    readFile('index.html', 'utf8').then(tmp => {
        a = tmp;
        return readFile('README.md', 'utf8');
    }).then(b => {
        let c = a + b;
        console.log(c);
    });
}

// console.log(useAsync());
console.log(usePromise());

