console.log("Alright??@@@!!!");

var canvas = document.getElementById('canvas');

var context = canvas.getContext('2d');

var earthOrbitalRadius = 146 * Math.pow(10,9);

var solarSystem = {
    width: 10 * earthOrbitalRadius,
    height: 10 * earthOrbitalRadius
}

function Thing(initialPosition, initialVelocity, mass, size, color) {
    this.position = initialPosition;
    this.velocity = initialVelocity;
    this.mass = mass;
    this.size = size;
    this.color = color;
    this.acceleration = [0,0];
}

// mass in units of 10^20kg
var massUnit= Math.pow(10,20);
var moonMass = 734 * massUnit;
var earthMass = 59720 * massUnit;
var sunMass = 19884700000 * massUnit;

var things = [
 //   new Thing([0, 0], [2, 1], 1, 5, 'red'),
    new Thing([20, 90], [15 * Math.pow(10,3), 10 * Math.pow(10,3)], earthMass, 5, 'green'),
    new Thing([solarSystem.width/2, solarSystem.height/2], [0, 0], sunMass, 15, 'yellow'),
//    new Thing([50, 200], [4, 2], 2, 20, 'violet'),
 //   new Thing([100, 70], [1, 3], moonMass, 1, 'grey')
]

var edges = [0, solarSystem.width, 0, solarSystem.height];

// How much are we speeded up?
var timeFactor= Math.pow(10,4);

function move(thing) {
    for (i = 0; i < 2; i++) {
        thing.position[i] += thing.velocity[i] * timeFactor;
    }
}

function bounce(thing) {
    //bounce
    // for (i = 0; i < 2; i++) {
    //     if (thing.position[i] < edges[i * 2] + thing.size) {
    //         thing.position[i] = edges[i * 2] + thing.size;
    //         thing.velocity[i] = -thing.velocity[i];
    //     }

    //     if (thing.position[i] > edges[i * 2 + 1] - thing.size) {
    //         thing.position[i] = edges[i * 2 + 1] - thing.size;
    //         thing.velocity[i] = -thing.velocity[i];
    //     }
    // }

    //wrap
    for (i = 0; i < 2; i++) {
        if (thing.position[i] < edges[i * 2]) {
            thing.position[i] = edges[i * 2+1];
        }

        if (thing.position[i] > edges[i * 2 + 1]) {
            thing.position[i] = edges[i * 2];
        }
    }


}


var dimensionsDOM = document.getElementById('dimensions');
var momentumDOM = document.getElementById('momentum');
var kineticDOM = document.getElementById('kinetic');

function updateFigures() {    

    var momentumText='';
    var kineticText='';
    var sep='';

    for( d =0 ; d < 2; d++){
        var momentum= 0;
        var kinetic=0;

        for (i = 0; i < things.length; i++) {
            momentum += things[i].mass * things[i].velocity[d];

            kinetic += things[i].mass * things[i].velocity[d]* things[i].velocity[d] / 2;
        }

        momentumText+= sep + momentum.toFixed(3);
        kineticText+= sep + kinetic.toFixed(3);

        sep=', ';
    }

    dimensionsDOM.innerHTML = '2';
    momentumDOM.innerHTML= momentumText;
    kineticDOM.innerHTML = kineticText;
}

function clockTick() {
    for (n = 0; n < things.length; n++) {
        move(things[n]);
        bounce(things[n]);
    }

    //check for collisions
    // for (i = 0; i < things.length; i++) {
    //     for (j = i; j < things.length; j++) {
    //         if (i !== j) {

    //             var rSquared = 0;

    //             for (d = 0; d < 2; d++) {
    //                 rSquared += (things[i].position[d] - things[j].position[d]) * (things[i].position[d] - things[j].position[d])
    //             }

    //             var minDistance = (things[i].size + things[j].size) * (things[i].size + things[j].size);

    //             if (rSquared < minDistance) {
    //                 console.log("Smash ", things[i], things[j]);

    //                 var relativeMass = things[i].mass / things[j].mass;

    //                 var t = things[i].velocity;
    //                 things[i].velocity = things[j].velocity;
    //                 things[j].velocity = t;


    //                 // for(d=0; d < 2; d++){
    //                 //     things[i].velocity[d] = things[j].velocity[d] / relativeMass;
    //                 //     things[j].velocity[d] = t[d] * relativeMass;    
    //                 // }
    //             }
    //         }
    //     }
    // }

    var bigG= 6.67408 * Math.pow(10,-11);

    //apply gravity
    for (i = 0; i < things.length; i++) {
        
        // Clear existing acceleration vector
        for( d=0; d < 2; d++) {
            things[i].acceleration[d]= 0;
        }

        // Add acceleration due to each other object
        for (j = i; j < things.length; j++) {
            if( i !== j) { //no self acceleration
                var rSquared= 0;

                // General pythagorus is the rot of the sum of 
                // the squares of distances in each dimension
                for( d=0; d < 2; d++) {
                    rSquared +=  (things[j].position[d] - things[i].position[d]) * (things[j].position[d] - things[i].position[d])
                }

                // gravitationalForce = (G x Mi x Mj) / r^2
                // and f = ma => a = f/m 
                // => accelerationScalar = gravitiationalFroce / Mi 
                //                       = (G x Mj) / r^2
                var accelerationScalar = bigG * things[j].mass / rSquared;

                var r = Math.sqrt(rSquared);

                //apply accelerationScalar projected to each dimension
                for( d=0; d < 2; d++) {
                    things[i].acceleration[d] += accelerationScalar * (things[j].position[d] - things[i].position[d])/r;
                }
            }
        }

        // apply total acceleration vector to velocity vector
        for( d=0; d < 2; d++) {
            things[i].velocity[d]+= things[i].acceleration[d];
        }
    }

    clearCanvas();

    for (n = 0; n < things.length; n++) {
        draw(things[n]);
    }

//    updateFigures();
}


function draw(thing) {
    drawAt(thing.position, thing.velocity, thing.acceleration, thing.size, thing.color);
}

var velocityScale= 100;

function drawAt(position, velocity, acceleration, size, color) {
    var scale= {
        width: canvas.width / solarSystem.width,
        height: canvas.height / solarSystem.height
    }

    var centre= {
        x: position[0] * scale.width,
        y: position[1] * scale.height
    }

    var velocityVector = {
        x: centre.x + velocity[0] * scale.width * velocityScale,
        y: centre.y + velocity[1] * scale.width * velocityScale
    }

    context.beginPath();
    context.arc(centre.x, centre.y, size, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = '#003300';
    context.stroke();

    //draw velocity vector
    context.beginPath();
    context.lineWidth=1;
    context.moveTo( centre.x, centre.y);
    context.lineTo( velocityVector.x, velocityVector.y);
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

setInterval(clockTick, 10);
//setInterval(newThing, 30);
setInterval( updateFigures, 500);

//drawAt( 100, 100);

console.log("Alright??@@@!!!");