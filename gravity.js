console.log("Alright??@@@!!!");

var canvas = document.getElementById('canvas');

var context = canvas.getContext('2d');

var earthOrbitalRadius = 146 * Math.pow(10,9);
var moonOrbitalRadius = 384.4 * Math.pow(10,6);

var solarSystem = {
    width: 3 * earthOrbitalRadius,
    height: 3 * earthOrbitalRadius
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
var moonMass = 7.34767309 * Math.pow(10,22);
var earthMass = 5.9720 * Math.pow(10,24);
var sunMass = 1.9884700000 * Math.pow(10,30);


var things = [
 //   new Thing([0, 0], [2, 1], 1, 5, 'red'),
   //new Thing([solarSystem.width/2 - moonOrbitalRadius, solarSystem.height/2], [0, 1.0230556], moonMass, 2, 'grey'),
   // new Thing([solarSystem.width/2, solarSystem.height/2], [0, 0], earthMass, 5, 'green'),

   new Thing([solarSystem.width/2, solarSystem.height/2 - earthOrbitalRadius], [29.8 * Math.pow(10,3), 0], earthMass, 5, 'green'),
   new Thing([solarSystem.width/2, solarSystem.height/2 - earthOrbitalRadius - moonOrbitalRadius], [29.8 * Math.pow(10,3) + 1.023 * Math.pow(10,3),0], moonMass, 4, 'grey'),
   new Thing([solarSystem.width/2, solarSystem.height/2], [0, 0], sunMass, 15, 'yellow')
  //  new Thing([50, 200], [0, 0], 0, 20, 'violet'),
    ]

var edges = [0, solarSystem.width, 0, solarSystem.height];

// How much are we speeded up?
var timeFactor= Math.pow(10,4);

function move(thing) {
    for (d = 0; d < 2; d++) {
        thing.velocity[d]+= thing.acceleration[d];

        thing.position[d] += thing.velocity[d];
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
    // for (i = 0; i < 2; i++) {
    //     if (thing.position[i] < edges[i * 2]) {
    //         thing.position[i] = edges[i * 2+1];
    //     }

    //     if (thing.position[i] > edges[i * 2 + 1]) {
    //         thing.position[i] = edges[i * 2];
    //     }
    // }


}


var dimensionsDOM = document.getElementById('dimensions');
var momentumDOM = document.getElementById('momentum');
var kineticDOM = document.getElementById('kinetic');

function updateFigures() {    

    var momentumText='';
    var kineticText='';
    
    var momentum= [];
    var kinetic= [];

    for( d =0 ; d < 2; d++){
        momentum.push(0);
        kinetic.push(0);

        for (i = 0; i < things.length; i++) {
            momentum[d] += things[i].mass * things[i].velocity[d];
            
            kinetic[d] += (things[i].mass * things[i].velocity[d]* things[i].velocity[d]) /2;
        }
    }

    var momentumPolar= toPolar(momentum);
    var kineticPolar= toPolar(kinetic);

    dimensionsDOM.innerHTML = '2';
    momentumDOM.innerHTML= momentumPolar.scalar.toFixed(3) + ' @ ' + Math.round(momentumPolar.angle * 180/Math.PI) + '&deg;';
    kineticDOM.innerHTML= kineticPolar.scalar.toFixed(3) + ' @ ' + Math.round(kineticPolar.angle * 180/Math.PI) + '&deg;';
}

function toPolar( inputVector)
{
    var sumOfSquares=0;

    for( d=0; d < inputVector.length; d++)
    {
        sumOfSquares += inputVector[d] * inputVector[d];
    }

    //todo: generalise angle
    return { scalar: Math.sqrt(sumOfSquares), angle: Math.atan(inputVector[1]/inputVector[0])};
}

function clockTick() {
        for( t=0; t < timeFactor; t++) {
        for (n = 0; n < things.length; n++)            {
            move(things[n]);
        }
    }

    for (n = 0; n < things.length; n++) {
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

    for (i = 0; i < things.length; i++) {
        
        // Clear existing acceleration vectors
        for( d=0; d < 2; d++) {
            things[i].acceleration[d]= 0;
        }
    }

    //apply gravity
    for (i = 0; i < things.length; i++) {
        
        // Add acceleration due to each other object
        for (j = i+1; j < things.length; j++) {
            if( i !== j) { //no self acceleration
                var rSquared= 0;

                // Pythagorean / Euclidean distance is the root of the sum of 
                // the squares of distances in each dimension
                for( d=0; d < 2; d++) {
                    rSquared +=  (things[j].position[d] - things[i].position[d]) * (things[j].position[d] - things[i].position[d])
                }

                // gravitationalForce = (G x Mi x Mj) / r^2
                var gravitationalForce = bigG * things[i].mass * things[j].mass / rSquared;

                var r = Math.sqrt(rSquared);

                //apply accelerationScalar projected to each dimension
                //...and mutually opposite
                for( d=0; d < 2; d++) {
                    things[i].acceleration[d] += gravitationalForce * ((things[j].position[d] - things[i].position[d])/r) / things[i].mass;

                    things[j].acceleration[d] += gravitationalForce * ((things[i].position[d] - things[j].position[d])/r) / things[j].mass;
                }
            }
        }
    }

    clearCanvas();

    for (n = 0; n < things.length; n++) {
        draw(things[n]);
    }
}


function draw(thing) {
    drawAt(thing.position, thing.velocity, thing.acceleration, thing.size, thing.color);
}

var velocityScale= Math.pow(10,-3);
var accelerationScale= 2.5 * Math.pow( 10, 4);

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
        x: centre.x + velocity[0] * velocityScale,
        y: centre.y + velocity[1] * velocityScale
    }

    var accelerationVector = {
        x: centre.x + acceleration[0] * accelerationScale,
        y: centre.y + acceleration[1] * accelerationScale
    }


    //draw velocity and the acceleration vectors
    context.beginPath();
    context.lineWidth=1;
    context.moveTo( centre.x, centre.y);
    context.setLineDash([]);
    context.lineTo( velocityVector.x, velocityVector.y);
    context.stroke();

    context.beginPath();
    context.lineWidth=1;
    context.moveTo( centre.x, centre.y);
    context.setLineDash([2,1]);
    context.lineTo( accelerationVector.x, accelerationVector.y);
    context.stroke();


    context.beginPath();
    context.arc(centre.x, centre.y, size, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 1;
    context.setLineDash([]);
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
    var thing = new Thing(
        [solarSystem.width / (Math.random() * 600), solarSystem.height / (Math.random() * 600)],
        [solarSystem.width / (Math.random() * 250) / timeFactor, solarSystem.height / (Math.random() * 250) / timeFactor],
        sunMass * (0.1 * Math.random()),
        Math.random() * 25,
        'red');

    things.push( thing);
}

setInterval(clockTick, 30);
//setInterval(newThing, 10000);
setInterval( updateFigures, 500);

for (j = 0; j < 1; j++) {
   // newThing();
}

//drawAt( 100, 100);

console.log("Alright??@@@!!!");