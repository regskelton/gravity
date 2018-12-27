var universe = (function () {
    var nDims, scale, bigG, things = [];

    var Thing = function (initialPosition, initialVelocity, mass, size, color) {
        this.position = initialPosition;
        this.velocity = initialVelocity;
        this.mass = mass;
        this.size = size;
        this.color = color;
        this.acceleration = [0, 0];
    }

    Thing.prototype.move = function () {
        for (d = 0; d < nDims; d++) {
            this.velocity[d] += this.acceleration[d];

            this.position[d] += this.velocity[d];
        }
    }

    Thing.prototype.bounce = function () {
        for (i = 0; i < nDims; i++) {
            if (this.position[i] < 0) {
                this.position[i] = 0;
                this.velocity[i] = -this.velocity[i];
            }

            if (this.position[i] > scale) {
                this.position[i] = scale;
                this.velocity[i] = -this.velocity[i];
            }
        }
    }

    Thing.prototype.wrap = function () {
        for (i = 0; i < nDims; i++) {
            if (this.position[i] < 0) {
                this.position[i] = scale;
            }

            if (this.position[i] > scale) {
                this.position[i] = 0;
            }
        }
    }

    var toPolar = function (inputVector) {
        var sumOfSquares = 0;

        for (d = 0; d < inputVector.length; d++) {
            sumOfSquares += inputVector[d] * inputVector[d];
        }

        //todo: generalise angle - not easy!
        return {
            scalar: Math.sqrt(sumOfSquares),
            angle: Math.atan(inputVector[1] / inputVector[0])
        };
    }

    return {
        init: function (nDimensions, paramScale, bigGparam) {
            nDims = nDimensions;
            scale = paramScale;
            bigG = bigGparam;
        },

        createSomething: function (position, velocity, mass, size, color) {
            things.push(new Thing(position, velocity, mass, size, color));
        },

        moveAll: function () {
            things.forEach(function (thing) {
                thing.move();
            });
        },

        bounceAll: function () {
            things.forEach(function (thing) {
                thing.bounce();
            });
        },

        wrapAll: function () {
            things.forEach(function (thing) {
                thing.wrap();
            });
        },

        collide: function () {
            for (i = 0; i < things.length; i++) {
                for (j = i; j < things.length; j++) {
                    if (i !== j) {

                        var rSquared = 0;

                        for (d = 0; d < nDims; d++) {
                            rSquared += (things[i].position[d] - things[j].position[d]) * (things[i].position[d] - things[j].position[d])
                        }

                        var minDistance = (things[i].size + things[j].size) * (things[i].size + things[j].size);

                        if (rSquared < minDistance) {
                            console.log("Smash ", things[i], things[j]);

                            var t = things[i].velocity;
                            things[i].velocity = things[j].velocity;
                            things[j].velocity = t;
                        }
                    }
                }
            }
        },

        applyGravity: function () {

            for (i = 0; i < things.length; i++) {
                // Clear existing acceleration vectors
                for (d = 0; d < nDims; d++) {
                    things[i].acceleration[d] = 0;
                }
            }

            //apply gravity
            for (i = 0; i < things.length; i++) {

                // Add acceleration due to each other object
                for (j = i + 1; j < things.length; j++) {
                    if (i !== j) { //no self acceleration
                        var rSquared = 0;

                        // Pythagorean / Euclidean distance is the root of the sum of 
                        // the squares of distances in each dimension
                        for (d = 0; d < nDims; d++) {
                            rSquared += (things[j].position[d] - things[i].position[d]) * (things[j].position[d] - things[i].position[d])
                        }

                        // gravitationalForce = (G x Mi x Mj) / r^2
                        var gravitationalForce = bigG * things[i].mass * things[j].mass / rSquared;

                        var r = Math.sqrt(rSquared);

                        //apply accelerationScalar projected to each dimension
                        //...and mutually opposite
                        for (d = 0; d < nDims; d++) {
                            things[i].acceleration[d] += gravitationalForce * ((things[j].position[d] - things[i].position[d]) / r) / things[i].mass;

                            things[j].acceleration[d] -= gravitationalForce * ((things[j].position[d] - things[i].position[d]) / r) / things[j].mass;
                        }
                    }
                }
            }
        },

        getMetrics: function () {
            var momentumArray = [];
            var kineticArray = [];

            for (d = 0; d < nDims; d++) {
                momentumArray.push(0);
                kineticArray.push(0);

                for (i = 0; i < things.length; i++) {
                    momentumArray[d] += things[i].mass * things[i].velocity[d];

                    kineticArray[d] += (things[i].mass * things[i].velocity[d] * things[i].velocity[d]) / 2;
                }
            }

            return {
                momentum: toPolar(momentumArray),
                kineticEnergy: toPolar(kineticArray)
            };
        },

        getThings: function () {
            return things;
        }
    }
})();

var uiController = (function () {
    var canvas = document.getElementById('canvas');

    var context = canvas.getContext('2d');

    var scale;

    var DOM = {
        dimensions: document.getElementById('dimensions'),
        momentum: document.getElementById('momentum'),
        kinetic: document.getElementById('kinetic')
    };

    function draw(thing) {
        drawAt(thing.position, thing.velocity, thing.acceleration, thing.size, thing.color);
    }

    var velocityScale = Math.pow(10, -3);
    var accelerationScale = 2.5 * Math.pow(10, 4);

    function drawAt(position, velocity, acceleration, size, color) {
        var positionScale = {
            width: canvas.width / scale,
            height: canvas.height / scale
        }

        var centre = {
            x: position[0] * positionScale.width,
            y: position[1] * positionScale.height
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
        context.lineWidth = 1;
        context.moveTo(centre.x, centre.y);
        context.setLineDash([]);
        context.lineTo(velocityVector.x, velocityVector.y);
        context.stroke();

        context.beginPath();
        context.lineWidth = 1;
        context.moveTo(centre.x, centre.y);
        context.setLineDash([2, 1]);
        context.lineTo(accelerationVector.x, accelerationVector.y);
        context.stroke();

        context.beginPath();
        context.arc(centre.x, centre.y, size, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 1;
        context.setLineDash([]);
        context.strokeStyle = '#003300';
        context.stroke();
    }

    return {
        init: function (paramScales) {
            scale = paramScales;
        },

        updateText: function (nDims, momentumPolar, kineticEnergyPolar) {
            DOM.dimensions.innerHTML = nDims;
            DOM.momentum.innerHTML = momentumPolar.scalar.toFixed(3) + ' @ ' + Math.round(momentumPolar.angle * 180 / Math.PI) + '&deg;';
            DOM.kinetic.innerHTML = kineticEnergyPolar.scalar.toFixed(3) + ' @ ' + Math.round(kinetic.angle * 180 / Math.PI) + '&deg;';
        },

        drawThings: function (things) {
            context.clearRect(0, 0, canvas.width, canvas.height);

            things.forEach(function (thing) {
                draw(thing);
            })
        }
    }

})();

var controller = (function (uni, UICtrl) {
    var earthOrbitalRadius = 146 * Math.pow(10, 9);
    var moonOrbitalRadius = 384.4 * Math.pow(10, 6);

    var scale = 3 * earthOrbitalRadius;
    var centre = scale / 2;
    var sunMass = 1.9884700000 * Math.pow(10, 30);

    var populateTheUniverse = function () {
        var moonMass = 7.34767309 * Math.pow(10, 22);
        var earthMass = 5.9720 * Math.pow(10, 24);
        var earthSpeed = 29.8 * Math.pow(10, 3);
        var moonSpeed = 1.023 * Math.pow(10, 3);

        uni.createSomething([centre, centre], [0, 0], sunMass, 15, 'yellow');
        uni.createSomething([centre, centre - earthOrbitalRadius], [earthSpeed, 0], earthMass, 5, 'green');
        uni.createSomething([centre, centre - earthOrbitalRadius - moonOrbitalRadius], [earthSpeed + moonSpeed, 0], moonMass, 4, 'grey');

        // for (j = 0; j < 5; j++) {
        //     newRandomSomething();
        // }
    }

    // How much are we speeded up?
    var timeFactor = Math.pow(10, 4);

    var newRandomSomething = function () {
        uni.createSomething([scale * Math.random(), scale * Math.random()],
            [scale * Math.random() / (10 * timeFactor), scale * Math.random() / (10 * timeFactor)],
            sunMass * Math.random() * 0.1,
            Math.random() * 25,
            'red');
    }

    var clockTick = function () {
        for (t = 0; t < timeFactor; t++) {
            uni.moveAll();
        }

        uni.bounceAll();

        //uni.collide();

        uni.applyGravity();

        UICtrl.drawThings(uni.getThings());
    }

    return {
        init: function () {
            console.log('Gravity init');

            // We are in 2d space
            var nDims = 2;

            // set the universal constants
            uni.init(nDims, scale, 6.67408 * Math.pow(10, -11));

            // populate the universe
            populateTheUniverse();

            // set up the screen
            UICtrl.init(scale);

            // let time begin
            setInterval(clockTick, 30);

            setInterval(function () {
                var metrics = uni.getMetrics();

                UICtrl.updateText(nDims, metrics.momentum, metrics.kineticEnergy);
            }, 750);

            console.log("Jump to hyperspace...");
        }
    }
})(universe, uiController);

controller.init();