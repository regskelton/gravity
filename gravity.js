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
                // Clear existing acceleration vectors & potentials
                for (d = 0; d < nDims; d++) {
                    things[i].acceleration[d] = 0;
                }

                things[i].potentialEnergy = 0;
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

                        var r = Math.sqrt(rSquared);

                        // gravitational potential = - (G x Mi x Mj) / r
                        var gravitationalPotential = -bigG * things[i].mass * things[j].mass / r;

                        things[i].potentialEnergy += gravitationalPotential;

                        // gravitationalForce = (G x Mi x Mj) / r^2
                        var gravitationalForce = bigG * things[i].mass * things[j].mass / rSquared;

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
            var momentumArray = []; // momentum is a vector
            var kinetic = 0;
            var potential = 0;

            for (d = 0; d < nDims; d++) {
                momentumArray[d] = 0;
            }

            for (i = 0; i < things.length; i++) {
                for (d = 0; d < nDims; d++) {
                    momentumArray[d] += things[i].mass * things[i].velocity[d];

                    kinetic += (things[i].mass * things[i].velocity[d] * things[i].velocity[d]) / 2;
                }

                potential += things[i].potentialEnergy;
            }

            return {
                momentum: toPolar(momentumArray),
                kineticEnergy: kinetic,
                potentialEnery: potential
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
        time: document.querySelector('.info__time--value'),
        item_list: document.querySelector('.item__list'),
    };

    var velocityScale = Math.pow(10, -3);
    var accelerationScale = 2.5 * Math.pow(10, 4);

    function formatLargeNumber(num, dp) {
        var sign = '';

        if (num < 0) {
            num = -num;

            sign = '-';
        }

        var log = Math.log10(num);

        var exp = Math.floor(log);
        var mantissa = Math.pow(10, log - exp).toFixed(dp);

        //var numText = "" + num;

        //var mantissa = numText[0] + "." + numText.slice(2, 2 + dp);

        //console.log( num, dp, sign, mantissa, ":", exp);

        return sign + mantissa + ":" + exp;
    }

    function formatTime( time) {
        const seconds_per_year = 365 * 24 * 60 * 60;
        const seconds_per_day = 24 * 60 * 60;
        const seconds_per_hour = 60 * 60;
        const seconds_per_minute = 60;

        var years = Math.floor( time / seconds_per_year);
        time = time - years * seconds_per_year;

        var days = Math.floor( time / seconds_per_day);
        time = time - days * seconds_per_day;

        var hours = Math.floor( time / seconds_per_hour);
        time= time - hours * seconds_per_hour;

        var mins= Math.floor( time / seconds_per_minute);
        time= time - mins * seconds_per_minute;

        return `${years} years, ${days} days, ${hours}:${mins}:${time}`;
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

        updateText: function (nDims, momentumPolar, kineticEnergy, potentialEnergy, time) {
            DOM.dimensions.innerHTML = nDims;
            DOM.momentum.innerHTML = formatLargeNumber(momentumPolar.scalar, 12) + ' @ ' + Math.round(momentumPolar.angle * 180 / Math.PI) + '&deg;';
            DOM.kinetic.innerHTML = formatLargeNumber(kineticEnergy, 12);
            DOM.potential.innerHTML = formatLargeNumber(potentialEnergy, 12);
            DOM.total.innerHTML = formatLargeNumber(potentialEnergy + kineticEnergy, 12);
            DOM.time.innerHTML = formatTime(time);
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
            tr.getElementsByClassName('item__orbit')[0].innerHTML = formatLargeNumber(toPolar(position).scalar, 4);
            tr.getElementsByClassName('item__speed')[0].innerHTML = formatLargeNumber(toPolar(velocity).scalar, 4);
            tr.getElementsByClassName('item__mass')[0].innerHTML = formatLargeNumber(mass, 4);
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
        "size": "5"
    },
    {
        "name": "mercury",
        "mass": "0.330:24",
        "orbit": "57.9:9",
        "speed": "47.4:3",
        "parent": "sun",
        "color": "red",
        "size": "1"
    },
    {
        "name": "venus",
        "mass": "4.870:24",
        "orbit": "108.2:9",
        "speed": "35.0:3",
        "parent": "sun",
        "color": "green",
        "size": "4"
    },
    {
        "name": "earth",
        "mass": "5.9720:24",
        "orbit": "146:9",
        "speed": "29.8:3",
        "parent": "sun",
        "color": "blue",
        "size": "4"
    },
    {
        "name": "moon",
        "mass": "7.34767309:22",
        "orbit": "384.4:6",
        "speed": "1.023:3",
        "parent": "earth",
        "color": "grey",
        "size": "2"
    },
    {
        "name": "mars",
        "mass": "0.642:24",
        "orbit": "227.9:9",
        "speed": "24.1:3",
        "parent": "sun",
        "color": "red",
        "size": "2"
    },
    {
        "name": "jupiter",
        "mass": "1898:24",
        "orbit": "778.6:9",
        "speed": "13.1:3",
        "parent": "sun",
        "color": "orange",
        "size": "4"
    },
    {
        "name": "saturn",
        "mass": "568:24",
        "orbit": "1433.5:9",
        "speed": "9.7:3",
        "parent": "sun",
        "color": "yellow",
        "size": "4"
    },
    {
        "name": "uranus",
        "mass": "86.8:24",
        "orbit": "2872.5:9",
        "speed": "6.8:3",
        "parent": "sun",
        "color": "green",
        "size": "2"
    },
    {
        "name": "neptune",
        "mass": "102:24",
        "orbit": "4495.1:9",
        "speed": "5.4:3",
        "parent": "sun",
        "color": "blue",
        "size": "2"
    },
    {
        "name": "pluto",
        "mass": "0.0146:24",
        "orbit": "5906.4:9",
        "speed": "4.7:3",
        "parent": "sun",
        "color": "grey",
        "size": "2"
    },

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

    var time = 0; //seconds

    // How much are we speeded up?
    var timeFactor = Math.pow(10, 4);

    var clockTick = function () {
        for (t = 0; t < timeFactor; t++) {
            time++;

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

                UICtrl.updateText(nDims, metrics.momentum, metrics.kineticEnergy, metrics.potentialEnery, time);

                uni.getThings().forEach(function (thing) {
                    UICtrl.updateSomethingText(thing.name, thing.position, thing.velocity, thing.mass, thing.size, thing.color);
                });
            }, 750);

            console.log("Jump to hyperspace...");
        }
    };
})(universe, uiController);

controller.init();