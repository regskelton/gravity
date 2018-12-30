var universe = (function () {
    var nDims, scale, bigG, things = [];

    var Thing = function (name, initialPosition, initialVelocity, mass, size, color) {
        this.name = name;
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

        createSomething: function (name, position, velocity, mass, size, color) {
            things.push(new Thing(name, position, velocity, mass, size, color));
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
        dimensions: document.querySelector('.info__dimensions--value'),
        momentum: document.querySelector('.info__momentum--value'),
        kinetic: document.querySelector('.info__kinetic--value'),
        potential: document.querySelector('.info__potential--value'),
        total: document.querySelector('.info__total--value'),
        item_list: document.querySelector('.item__list'),
    };

    var velocityScale = Math.pow(10, -3);
    var accelerationScale = 2.5 * Math.pow(10, 4);


    function formatLargeNumber(num, dp) {
        var log= Math.log10(num);

        var exp = Math.floor(log);
        var mantissa = Math.pow( 10, log - exp).toFixed(dp);

        //var numText = "" + num;

        //var mantissa = numText[0] + "." + numText.slice(2, 2 + dp);

        //console.log( num, dp, mantissa, ":", exp);

        return mantissa + ":" + exp;
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
        init: function (paramScales) {
            scale = paramScales;

            //var img = document.getElementById("background");

            //context.drawImage(img, 0, 0);
        },

        clearScreen: function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
        },

        draw: function (position, velocity, acceleration, size, color) {
            //console.log(color);

            var centre = {
                x: ((position[0] + scale / 2) / scale) * canvas.width,
                y: canvas.height - ((position[1] + scale / 2) / scale) * canvas.height
            }

            var velocityVector = {
                x: centre.x + velocity[0] * velocityScale,
                y: centre.y - velocity[1] * velocityScale
            }

            var accelerationVector = {
                x: centre.x + acceleration[0] * accelerationScale,
                y: centre.y - acceleration[1] * accelerationScale
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
        },

        updateText: function (nDims, momentumPolar, kineticEnergyPolar) {
            DOM.dimensions.innerHTML = nDims;
            DOM.momentum.innerHTML = formatLargeNumber(momentumPolar.scalar, 4) + ' @ ' + Math.round(momentumPolar.angle * 180 / Math.PI) + '&deg;';
            DOM.kinetic.innerHTML = formatLargeNumber(kineticEnergyPolar.scalar, 4) + ' @ ' + Math.round(kineticEnergyPolar.angle * 180 / Math.PI) + '&deg;';
        },

        addSomething: function (name, position, velocity, mass, size, color) {
            /*
            name, 
            [0, orbit],
            [speed, 0],
            mass,
            things[i].size,
            things[i].color
            */

            var template = '<tr class="item" id="item-%name%">' +
                '<td><div class="item__active">Yes <button class="btn-hold">No</button></div></td>' +
                '<td><div class="item__name">%name%</div></td>' +
                '<td><div class="item__mass">12345</div></td>' +
                '<td><div class="item__orbit">12345</div></td>' +
                '<td><div class="item__speed">12345</div></td>' +
                '<td><div class="item__parent"></div></td>' +
                '<td><div class="item__color">yellow</div></td>' +
                '<td><div class="item__size">15</div></td>' +
                '<td><div class="item__period">1 year</div></td>' +
                '</tr>';

            template = template.split('%name%').join(name);

            //insert into DOM
            DOM.item_list.insertAdjacentHTML('beforeend', template);
        },

        updateSomethingText: function (name, position, velocity, mass, size, color) {
            /*
            name, 
            [0, orbit],
            [speed, 0],
            mass,
            things[i].size,
            things[i].color
            */
            var tr = document.getElementById('item-' + name);
            tr.getElementsByClassName('item__orbit')[0].innerHTML = formatLargeNumber( toPolar(position).scalar, 4);
            tr.getElementsByClassName('item__speed')[0].innerHTML = formatLargeNumber( toPolar(velocity).scalar, 4);
            tr.getElementsByClassName('item__mass')[0].innerHTML = formatLargeNumber( mass,4);
            tr.getElementsByClassName('item__size')[0].innerHTML = size;
            tr.getElementsByClassName('item__color')[0].innerHTML = color;
        }
    }

})();

//require( './things.json');
var thingsConfig = [{
        "name": "sun",
        "mass": "1.9884700000:30",
        "orbit": "0",
        "speed": "0",
        "parent": "",
        "color": "yellow",
        "size": "15"
    },
    {
        "name": "earth",
        "mass": "5.9720:24",
        "orbit": "146:9",
        "speed": "29.8:3",
        "parent": "sun",
        "color": "green",
        "size": "5"
    },
    {
        "name": "moon",
        "mass": "7.34767309:22",
        "orbit": "384.4:6",
        "speed": "1.023:3",
        "parent": "earth",
        "color": "grey",
        "size": "2"
    }
];


var controller = (function (uni, UICtrl) {

    var deFormat = function (raw) {
        var split = raw.split(":");

        var result = split[0] * (split[1] ? Math.pow(10, split[1]) : 1);

        console.log(raw + ' --> ' + result);

        return result;
    }

    var populateTheUniverse = function () {
        var things = thingsConfig;

        for (i = 0; i < things.length; i++) {
            console.log("Creating {" + things[i].name + "}");

            var mass = deFormat(things[i].mass);
            var orbit = deFormat(things[i].orbit);
            var speed = deFormat(things[i].speed);

            var parent = things[i].parent;

            while (parent) {
                var found = false;

                for (j = 0; j < things.length && !found; j++) {
                    if (things[j].name === parent) {
                        console.log("Parent is {" + things[j].name + "}");

                        orbit += deFormat(things[j].orbit);
                        speed += deFormat(things[j].speed);

                        parent = things[j].parent;

                        found = true;
                    }
                }
            }

            uni.createSomething(
                things[i].name,
                [0, orbit],
                [speed, 0],
                mass,
                things[i].size,
                things[i].color
            );

            UICtrl.addSomething(
                things[i].name,
                [0, orbit],
                [speed, 0],
                mass,
                things[i].size,
                things[i].color
            );
        }
    };

    var earthOrbitalRadius = 146 * Math.pow(10, 9);

    var scale = 3 * earthOrbitalRadius;

    // How much are we speeded up?
    var timeFactor = Math.pow(10, 4);

    var clockTick = function () {
        for (t = 0; t < timeFactor; t++) {
            uni.moveAll();

            //uni.wrapAll();

            //uni.collide();

            uni.applyGravity();
        }

        UICtrl.clearScreen();

        uni.getThings().forEach(function (thing) {
            UICtrl.draw(thing.position, thing.velocity, thing.acceleration, thing.size, thing.color);
        });
    };

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

                uni.getThings().forEach(function (thing) {
                    UICtrl.updateSomethingText(thing.name, thing.position, thing.velocity, thing.mass, thing.size, thing.color);
                });
            }, 750);

            console.log("Jump to hyperspace...");
        }
    };
})(universe, uiController);

controller.init();