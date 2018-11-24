console.log("Alright??@@@!!!");

var canvas = document.getElementById('canvas');

var context = canvas.getContext('2d');

function Thing(initialPosition, initialVelocity, mass, size, color) {
    this.position = initialPosition;
    this.velocity = initialVelocity;
    this.mass = mass;
    this.size = size;
    this.color = color;
}

var things = [
    new Thing([0, 0], [2, 1], 1, 5, 'red'),
    new Thing([20, 90], [1, 1], 2, 10, 'green'),
    new Thing([30, 40], [1, 1], 3, 15, 'yellow'),
    new Thing([50, 200], [4, 2], 2, 20, 'violet'),
    new Thing([100, 70], [1, 3], 5, 25, 'blue')
]

var edges = [0, canvas.width, 0, canvas.height];

function move(thing) {
    for (i = 0; i < 2; i++) {
        thing.position[i] += thing.velocity[i];
    }
}

function bounce(thing) {
    for (i = 0; i < 2; i++) {
        if (thing.position[i] < edges[i * 2] + thing.size) {
            thing.position[i] = edges[i * 2] + thing.size;
            thing.velocity[i] = -thing.velocity[i];
        }

        if (thing.position[i] > edges[i * 2 + 1] - thing.size) {
            thing.position[i] = edges[i * 2 + 1] - thing.size;
            thing.velocity[i] = -thing.velocity[i];
        }
    }
}

function draw(thing) {
    drawAt(thing.position, thing.size, thing.color);
}

function update() {
    for (n = 0; n < things.length; n++) {
        move(things[n]);
        bounce(things[n]);
    }

    //check for collisions
    for (i = 0; i < things.length; i++) {
        for (j = i; j < things.length; j++) {
            if (i !== j) {

                var distance = 0;

                for (d = 0; d < 2; d++) {
                    distance += (things[i].position[d] - things[j].position[d]) * (things[i].position[d] - things[j].position[d])
                }

                var minDistance = (things[i].size + things[j].size) * (things[i].size + things[j].size);

                if (distance < minDistance) {
                    console.log("Smash ", things[i], things[j]);

                    var relativeMass = things[i].mass / things[j].mass;

                    var t = things[i].velocity;
                    things[i].velocity = things[j].velocity;
                    things[j].velocity = t;


                    // for(d=0; d < 2; d++){
                    //     things[i].velocity[d] = things[j].velocity[d] / relativeMass;
                    //     things[j].velocity[d] = t[d] * relativeMass;    
                    // }
                }
            }
        }
    }

    //apply gravity
    // for (i = 0; i < things.length; i++) {
    //     for (j = i; j < things.length; j++) {
    //         if( i !== j) {

    //             var distance= 0;

    //             for( d=0; d < 2; d++) {
    //                 distance +=  (things[i].position[d] - things[j].position[d]) * (things[i].position[d] - things[j].position[d])
    //             }

    //             var accelerationScalar= things[j].mass / distance;

    //             for( d=0; d < 2; d++) {
    //                 things[i].velocity[d] += 0.01 * accelerationScalar * things[j].position[d];
    //             }
    //         }
    //     }
    // }


    clearCanvas();

    for (n = 0; n < things.length; n++) {
        draw(things[n]);
    }

}


function drawAt(position, size, color) {
    context.beginPath();
    context.arc(position[0], position[1], size, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = '#003300';
    context.stroke();

    // context.beginPath();
    // context.lineWidth = "1";
    // context.strokeStyle = "red";
    // context.rect(, 10);
    // context.stroke();
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.clientWidth, canvas.height);

}

function newThing() {
    var thing = new Thing([Math.random() * 600, Math.random() * 600],
        [Math.random() * 10, Math.random() * 10],
        0,
        Math.random() * 25,
        'red');

    things.push( thing);
}

setInterval(update, 10);
setInterval(newThing, 30);

//drawAt( 100, 100);

console.log("Alright??@@@!!!");