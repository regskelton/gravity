// 3D Gravity Simulation
var uni = (function() {
    var things = [];
    var nDims = 3; // 3D universe
    var bigG = 6.674e-11; // Gravitational constant (m^3 kg^-1 s^-2)
    var dt = 3600; // Time step in seconds (1 hour)
    var scaleFactor = 1e-9; // Scale factor for rendering
    
    return {
        createSomething: function(name, position, velocity, mass, size, color) {
            var thing = {
                name: name,
                position: position.slice(0, nDims).concat([0, 0, 0].slice(0, Math.max(0, nDims - position.length))),
                velocity: velocity.slice(0, nDims).concat([0, 0, 0].slice(0, Math.max(0, nDims - velocity.length))),
                acceleration: [0, 0, 0],
                mass: mass,
                size: size,
                color: color,
                potentialEnergy: 0,
                kineticEnergy: 0
            };
            things.push(thing);
            console.log("Created: " + name + " at position " + thing.position);
            return thing;
        },
        
        applyGravity: function() {
            // Clear existing acceleration vectors & potentials
            for (var i = 0; i < things.length; i++) {
                for (var d = 0; d < nDims; d++) {
                    things[i].acceleration[d] = 0;
                }
                things[i].potentialEnergy = 0;
            }

            // Apply gravity between all pairs
            for (var i = 0; i < things.length; i++) {
                for (var j = i + 1; j < things.length; j++) {
                    var rSquared = 0;

                    // Calculate Euclidean distance
                    for (var d = 0; d < nDims; d++) {
                        var diff = things[j].position[d] - things[i].position[d];
                        rSquared += diff * diff;
                    }

                    var r = Math.sqrt(rSquared);
                    
                    // Avoid division by zero
                    if (r < 1e3) r = 1e3;

                    // Gravitational potential = - (G x Mi x Mj) / r
                    var gravitationalPotential = -bigG * things[i].mass * things[j].mass / r;
                    things[i].potentialEnergy += gravitationalPotential;

                    // Gravitational force = (G x Mi x Mj) / r^2
                    var gravitationalForce = bigG * things[i].mass * things[j].mass / rSquared;

                    // Apply acceleration in each dimension
                    for (var d = 0; d < nDims; d++) {
                        var direction = (things[j].position[d] - things[i].position[d]) / r;
                        things[i].acceleration[d] += gravitationalForce * direction / things[i].mass;
                        things[j].acceleration[d] -= gravitationalForce * direction / things[j].mass;
                    }
                }
            }
        },
        
        updatePositions: function() {
            for (var i = 0; i < things.length; i++) {
                things[i].kineticEnergy = 0;
                
                for (var d = 0; d < nDims; d++) {
                    // Update velocity: v = v + a * dt
                    things[i].velocity[d] += things[i].acceleration[d] * dt;
                    
                    // Update position: p = p + v * dt
                    things[i].position[d] += things[i].velocity[d] * dt;
                    
                    // Calculate kinetic energy
                    things[i].kineticEnergy += 0.5 * things[i].mass * things[i].velocity[d] * things[i].velocity[d];
                }
            }
        },
        
        simulate: function() {
            this.applyGravity();
            this.updatePositions();
        },
        
        getThings: function() {
            return things;
        },
        
        clear: function() {
            things = [];
        },
        
        setTimeStep: function(newDt) {
            dt = newDt;
        },
        
        getEnergy: function() {
            var totalKE = 0, totalPE = 0;
            for (var i = 0; i < things.length; i++) {
                totalKE += things[i].kineticEnergy;
                totalPE += things[i].potentialEnergy;
            }
            return {
                kinetic: totalKE,
                potential: totalPE / 2, // Divide by 2 because we counted each pair twice
                total: totalKE + totalPE / 2
            };
        }
    };
})();

// Simple solar system configuration
var thingsConfig = [
    {
        name: "Sun",
        mass: "1.989e30",
        orbit: "0",
        speed: "0",
        size: 30,
        color: "#FDB813",
        parent: null
    },
    {
        name: "Mercury",
        mass: "3.285e23",
        orbit: "5.791e10",
        speed: "47360",
        size: 5,
        color: "#8C7853",
        parent: null
    },
    {
        name: "Venus",
        mass: "4.867e24",
        orbit: "1.082e11",
        speed: "35020",
        size: 9,
        color: "#FFC649",
        parent: null
    },
    {
        name: "Earth",
        mass: "5.972e24",
        orbit: "1.496e11",
        speed: "29780",
        size: 10,
        color: "#4169E1",
        parent: null
    },
    {
        name: "Moon",
        mass: "7.342e22",
        orbit: "3.844e8",
        speed: "1022",
        size: 4,
        color: "#C0C0C0",
        parent: "Earth"
    },
    {
        name: "Mars",
        mass: "6.39e23",
        orbit: "2.279e11",
        speed: "24070",
        size: 7,
        color: "#CD5C5C",
        parent: null
    },
    {
        name: "Jupiter",
        mass: "1.898e27",
        orbit: "7.786e11",
        speed: "13070",
        size: 25,
        color: "#DAA520",
        parent: null
    },
    {
        name: "Saturn",
        mass: "5.683e26",
        orbit: "1.434e12",
        speed: "9680",
        size: 22,
        color: "#F4A460",
        parent: null
    },
    {
        name: "Uranus",
        mass: "8.681e25",
        orbit: "2.871e12",
        speed: "6800",
        size: 16,
        color: "#4FD0E7",
        parent: null
    },
    {
        name: "Neptune",
        mass: "1.024e26",
        orbit: "4.495e12",
        speed: "5430",
        size: 15,
        color: "#4169E1",
        parent: null
    }
];

function deFormat(str) {
    return parseFloat(str);
}

// Initialize the simulation
function initSimulation() {
    uni.clear();
    
    for (var i = 0; i < thingsConfig.length; i++) {
        var thing = thingsConfig[i];
        var mass = deFormat(thing.mass);
        var orbit = deFormat(thing.orbit);
        var speed = deFormat(thing.speed);
        
        // Handle parent bodies (like Moon orbiting Earth)
        var parentX = 0, parentY = 0, parentZ = 0;
        var parentVx = 0, parentVy = 0, parentVz = 0;
        
        if (thing.parent) {
            // Find the parent body
            for (var j = 0; j < i; j++) {
                if (thingsConfig[j].name === thing.parent) {
                    var parentOrbit = deFormat(thingsConfig[j].orbit);
                    var parentSpeed = deFormat(thingsConfig[j].speed);
                    parentY = parentOrbit;
                    parentVx = parentSpeed;
                    break;
                }
            }
        }
        
        // Create objects in 3D space
        // Position: [x, y, z]
        // Velocity: [vx, vy, vz]
        uni.createSomething(
            thing.name,
            [parentX, parentY + orbit, parentZ],      // Position relative to parent
            [parentVx + speed, parentVy, parentVz],   // Velocity relative to parent
            mass,
            thing.size,
            thing.color
        );
    }
}

// Animation loop
var isPaused = false;
var animationId = null;
var useLogScale = true; // Toggle for logarithmic display scaling
var cameraAngle = 0; // Angle in radians (0 = side view, π/2 = top view)
var cameraSpeed = 0.0005; // Speed of camera rotation
var autoCameraRotate = true; // Whether camera rotates automatically
var frameCount = 0;

function animate() {
    if (!isPaused) {
        uni.simulate();
        
        // Automatically rotate camera
        if (autoCameraRotate) {
            frameCount++;
            // Oscillate between -60° and +60° using sine wave
            cameraAngle = Math.sin(frameCount * cameraSpeed) * Math.PI / 3; // π/3 = 60 degrees
        }
        
        render();
    }
    animationId = requestAnimationFrame(animate);
}

function render() {
    var canvas = document.getElementById('universe');
    if (!canvas) return;
    
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Get things
    var things = uni.getThings();
    
    // Find center of mass for camera centering
    var centerX = 0, centerY = 0, centerZ = 0;
    var totalMass = 0;
    for (var i = 0; i < things.length; i++) {
        centerX += things[i].position[0] * things[i].mass;
        centerY += things[i].position[1] * things[i].mass;
        centerZ += things[i].position[2] * things[i].mass;
        totalMass += things[i].mass;
    }
    if (totalMass > 0) {
        centerX /= totalMass;
        centerY /= totalMass;
        centerZ /= totalMass;
    }
    
    // Base scale factor for rendering
    var baseScale = 2e-10;
    
    // Draw grid for orbital plane
    drawGrid(ctx, width, height, centerX, centerY, centerZ, baseScale);
    
    // Draw things
    for (var i = 0; i < things.length; i++) {
        var thing = things[i];
        
        // Position relative to center of mass
        var dx = thing.position[0] - centerX;
        var dy = thing.position[1] - centerY;
        var dz = thing.position[2] - centerZ;
        
        // Apply camera rotation - rotate around Z axis to tilt view up/down
        // This rotates the X-Y plane (orbital plane) relative to viewer
        var rotatedX = dx * Math.cos(cameraAngle) - dy * Math.sin(cameraAngle);
        var rotatedY = dx * Math.sin(cameraAngle) + dy * Math.cos(cameraAngle);
        var rotatedZ = dz;
        
        // Project onto screen with perspective
        // The Y coordinate on screen includes the rotated Y position projected by viewing angle
        var viewAngle = Math.PI / 6; // 30 degree viewing angle from above
        var projectedY = rotatedY * Math.cos(viewAngle) + rotatedZ * Math.sin(viewAngle);
        
        var screenX, screenY;
        
        if (useLogScale) {
            // Logarithmic scaling for better distribution
            var distance = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY);
            var angle = Math.atan2(rotatedY, rotatedX);
            
            // Apply logarithmic scaling to distance
            var logScale = 120; // Adjust this value to change spacing
            var visualDistance;
            
            if (distance > 1e9) {
                // Log scale for distances > 1 billion meters
                visualDistance = logScale * Math.log10(distance / 1e9);
            } else {
                visualDistance = distance * baseScale;
            }
            
            // Recalculate screen position with log scale
            var screenDist2D = visualDistance;
            screenX = width / 2 + screenDist2D * Math.cos(angle);
            screenY = height / 2 + screenDist2D * Math.sin(angle) * Math.cos(viewAngle) + rotatedZ * baseScale * Math.sin(viewAngle);
        } else {
            // Linear scaling
            screenX = width / 2 + rotatedX * baseScale;
            screenY = height / 2 + projectedY * baseScale;
        }
        
        // Calculate size based on depth (Z coordinate) for perspective
        var depthScale = 1 / (1 + Math.abs(rotatedZ) * 1e-12);
        var displaySize = thing.size * depthScale;
        
        // Brightness based on depth (closer = brighter)
        var brightness = Math.max(0.3, Math.min(1, depthScale));
        
        // Draw body
        ctx.beginPath();
        ctx.arc(screenX, screenY, displaySize, 0, 2 * Math.PI);
        ctx.globalAlpha = brightness;
        ctx.fillStyle = thing.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Draw glow for the Sun
        if (thing.name === "Sun") {
            ctx.beginPath();
            ctx.arc(screenX, screenY, displaySize + 5, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(253, 184, 19, 0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Draw label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.globalAlpha = brightness;
        ctx.fillText(thing.name, screenX + displaySize + 5, screenY);
        ctx.globalAlpha = 1;
    }
    
    // Draw energy info
    var energy = uni.getEnergy();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';
    ctx.fillText('Total Energy: ' + energy.total.toExponential(2) + ' J', 10, 20);
    ctx.fillText('Kinetic: ' + energy.kinetic.toExponential(2) + ' J', 10, 40);
    ctx.fillText('Potential: ' + energy.potential.toExponential(2) + ' J', 10, 60);
    ctx.fillText('Display: ' + (useLogScale ? 'Logarithmic Scale' : 'Linear Scale'), 10, 80);
    ctx.fillText('Camera Rotation: ' + (cameraAngle * 180 / Math.PI).toFixed(0) + '°', 10, 100);
}

function drawGrid(ctx, width, height, centerX, centerY, centerZ, baseScale) {
    var viewAngle = Math.PI / 6; // Match the viewing angle from render function
    
    if (useLogScale) {
        // Logarithmic grid spacing
        drawLogGrid(ctx, width, height, viewAngle);
    } else {
        // Linear grid spacing
        drawLinearGrid(ctx, width, height, viewAngle);
    }
}

function drawLinearGrid(ctx, width, height, viewAngle) {
    // Grid parameters
    var gridSize = 600; // Size of grid in screen pixels
    var gridSpacing = 60; // Spacing between grid lines in screen pixels
    var gridLines = Math.floor(gridSize / gridSpacing);
    
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw grid lines parallel to X axis
    for (var i = -gridLines; i <= gridLines; i++) {
        var y = i * gridSpacing;
        
        // Start and end points in screen space (before camera rotation)
        var startX = -gridSize;
        var endX = gridSize;
        
        // Apply camera rotation
        var startRotX = startX * Math.cos(cameraAngle) - y * Math.sin(cameraAngle);
        var startRotY = startX * Math.sin(cameraAngle) + y * Math.cos(cameraAngle);
        var endRotX = endX * Math.cos(cameraAngle) - y * Math.sin(cameraAngle);
        var endRotY = endX * Math.sin(cameraAngle) + y * Math.cos(cameraAngle);
        
        // Project with viewing angle (z = 0 for the plane)
        var startScreenX = width / 2 + startRotX;
        var startScreenY = height / 2 + startRotY * Math.cos(viewAngle);
        var endScreenX = width / 2 + endRotX;
        var endScreenY = height / 2 + endRotY * Math.cos(viewAngle);
        
        ctx.beginPath();
        ctx.moveTo(startScreenX, startScreenY);
        ctx.lineTo(endScreenX, endScreenY);
        ctx.stroke();
    }
    
    // Draw grid lines parallel to Y axis
    for (var i = -gridLines; i <= gridLines; i++) {
        var x = i * gridSpacing;
        
        // Start and end points in screen space (before camera rotation)
        var startY = -gridSize;
        var endY = gridSize;
        
        // Apply camera rotation
        var startRotX = x * Math.cos(cameraAngle) - startY * Math.sin(cameraAngle);
        var startRotY = x * Math.sin(cameraAngle) + startY * Math.cos(cameraAngle);
        var endRotX = x * Math.cos(cameraAngle) - endY * Math.sin(cameraAngle);
        var endRotY = x * Math.sin(cameraAngle) + endY * Math.cos(cameraAngle);
        
        // Project with viewing angle (z = 0 for the plane)
        var startScreenX = width / 2 + startRotX;
        var startScreenY = height / 2 + startRotY * Math.cos(viewAngle);
        var endScreenX = width / 2 + endRotX;
        var endScreenY = height / 2 + endRotY * Math.cos(viewAngle);
        
        ctx.beginPath();
        ctx.moveTo(startScreenX, startScreenY);
        ctx.lineTo(endScreenX, endScreenY);
        ctx.stroke();
    }
}

function drawLogGrid(ctx, width, height, viewAngle) {
    var logScale = 120; // Match the log scale from render function
    
    // Draw concentric circles at logarithmic distances
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)';
    ctx.lineWidth = 1;
    
    // Distances in meters for grid circles (powers of 10)
    var distances = [
        1e9,    // 1 billion meters (inner solar system)
        1e10,   // 10 billion meters
        1e11,   // 100 billion meters (around Earth orbit)
        2e11,   // 200 billion meters
        5e11,   // 500 billion meters
        1e12,   // 1 trillion meters (around Jupiter/Saturn)
        2e12,   // 2 trillion meters
        5e12    // 5 trillion meters (outer solar system)
    ];
    
    for (var d = 0; d < distances.length; d++) {
        var distance = distances[d];
        var visualRadius = logScale * Math.log10(distance / 1e9);
        
        // Draw circle as an ellipse based on viewing angle
        ctx.beginPath();
        for (var angle = 0; angle <= 2 * Math.PI; angle += Math.PI / 72) {
            // Point on the circle in 3D space (Z=0 plane)
            var x = visualRadius * Math.cos(angle);
            var y = visualRadius * Math.sin(angle);
            var z = 0;
            
            // Apply camera rotation around Z axis
            var rotX = x * Math.cos(cameraAngle) - y * Math.sin(cameraAngle);
            var rotY = x * Math.sin(cameraAngle) + y * Math.cos(cameraAngle);
            var rotZ = z;
            
            // Project with viewing angle - same as planets
            var projectedY = rotY * Math.cos(viewAngle) + rotZ * Math.sin(viewAngle);
            
            var screenX = width / 2 + rotX;
            var screenY = height / 2 + projectedY;
            
            if (angle === 0) {
                ctx.moveTo(screenX, screenY);
            } else {
                ctx.lineTo(screenX, screenY);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw distance label at the rightmost point of each circle
        var labelAngle = -cameraAngle; // Position label to the right
        var labelX = visualRadius * Math.cos(labelAngle);
        var labelY = visualRadius * Math.sin(labelAngle);
        var labelZ = 0;
        
        var labelRotX = labelX * Math.cos(cameraAngle) - labelY * Math.sin(cameraAngle);
        var labelRotY = labelX * Math.sin(cameraAngle) + labelY * Math.cos(cameraAngle);
        var labelProjectedY = labelRotY * Math.cos(viewAngle);
        
        var labelScreenX = width / 2 + labelRotX;
        var labelScreenY = height / 2 + labelProjectedY;
        
        ctx.fillStyle = 'rgba(150, 150, 200, 0.5)';
        ctx.font = '10px Arial';
        
        // Format distance label
        var label;
        if (distance >= 1e12) {
            label = (distance / 1e12).toFixed(0) + ' Tm';
        } else if (distance >= 1e9) {
            label = (distance / 1e9).toFixed(0) + ' Gm';
        }
        ctx.fillText(label, labelScreenX + 5, labelScreenY);
    }
    
    // Draw radial lines (like spokes)
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.15)';
    ctx.lineWidth = 1;
    
    var numSpokes = 12; // 30 degree intervals
    for (var i = 0; i < numSpokes; i++) {
        var spokeAngle = (i * 2 * Math.PI) / numSpokes;
        
        // Draw from center to outer edge
        var maxRadius = logScale * Math.log10(5e12 / 1e9);
        
        // Start point (center)
        var x1 = 0;
        var y1 = 0;
        var z1 = 0;
        
        // End point
        var x2 = maxRadius * Math.cos(spokeAngle);
        var y2 = maxRadius * Math.sin(spokeAngle);
        var z2 = 0;
        
        // Apply camera rotation
        var rotX1 = x1 * Math.cos(cameraAngle) - y1 * Math.sin(cameraAngle);
        var rotY1 = x1 * Math.sin(cameraAngle) + y1 * Math.cos(cameraAngle);
        var rotX2 = x2 * Math.cos(cameraAngle) - y2 * Math.sin(cameraAngle);
        var rotY2 = x2 * Math.sin(cameraAngle) + y2 * Math.cos(cameraAngle);
        
        // Project with viewing angle
        var projY1 = rotY1 * Math.cos(viewAngle);
        var projY2 = rotY2 * Math.cos(viewAngle);
        
        var screenX1 = width / 2 + rotX1;
        var screenY1 = height / 2 + projY1;
        var screenX2 = width / 2 + rotX2;
        var screenY2 = height / 2 + projY2;
        
        ctx.beginPath();
        ctx.moveTo(screenX1, screenY1);
        ctx.lineTo(screenX2, screenY2);
        ctx.stroke();
    }
    
    // Highlight center point (Sun)
    ctx.fillStyle = 'rgba(150, 150, 200, 0.4)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 3, 0, 2 * Math.PI);
    ctx.fill();
}

// Controls
function togglePause() {
    isPaused = !isPaused;
    var btn = document.getElementById('pauseBtn');
    if (btn) btn.textContent = isPaused ? 'Resume' : 'Pause';
}

function resetSimulation() {
    initSimulation();
}

function toggleScale() {
    useLogScale = !useLogScale;
}

function setCameraAngle(angle) {
    cameraAngle = angle * Math.PI / 180; // Convert degrees to radians
}

// Start simulation when page loads
if (typeof window !== 'undefined') {
    window.onload = function() {
        initSimulation();
        animate();
    };
}
