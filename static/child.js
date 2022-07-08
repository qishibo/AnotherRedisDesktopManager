process.on('message', function(m){
    console.log('child get from parent: ' , m);
    process.send({from: 'child'});
});

// process.send({from: 'child'});