// Retrieve the canvas element
const canvas = document.getElementById('gravityCanvas');

// Initialize Hammer.js for touch interactions
const hammer = new Hammer(canvas);

// Get the 2D drawing context of the canvas
const ctx = canvas.getContext('2d');

// Add a listener for the 'pan' event using Hammer.js
hammer.on('pan', handlePan);

// Replaced old event listener for touchmove that stops ios scrolling with this
function preventDefaultBehavior(e) {
    e.preventDefault();
}

['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function(event) {
    canvas.addEventListener(event, preventDefaultBehavior, { passive: false });
});

// Define variables for particles and simulation settings
const particles = [];
const numParticles = 5000;
const gravitationalConstant = 0.0001;
const maxDistance = 100; // Limit calculation for performance

let airplaneImage = new Image();
airplaneImage.src = 'https://github.com/harveyspector64/Starry-Sky-Sim/blob/33a9f3026f150ac1157e6a81b61293fa6b19bf25/airplane747transparent.png?raw=true'; // Your airplane image URL

let ufoImage = new Image();
ufoImage.src = 'https://raw.githubusercontent.com/harveyspector64/Starry-Sky-Sim/main/harveyspector_pixel_art_classic_UFO_side_view_transparent_backg_23989567-06df-47bb-a647-77138dd5bede.png'; // Your UFO image URL

// Create particles with random positions and zero initial velocity
for (let i = 0; i < numParticles; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        type: 'star' // Identifying the particle as a star
    });
}

// Add this code after the existing particle initialization to create constellations
const constellationStars = [
  { x: 100, y: 50 },
  { x: 150, y: 80 },
  { x: 220, y: 100 },
  // Add more star coordinates as needed for your constellation
];

// Start listening for user input
canvas.addEventListener('click', handleInputStart);
canvas.addEventListener('mouseup', handleInputEnd);

let startX, startY;

let currentObjectType = 'meteor'; // Default to 'meteor'

function handlePan(event) {
  const initialVelocityX = event.deltaX * 0.1;
  const initialVelocityY = event.deltaY * 0.1;

  if (currentObjectType === 'meteor') {
    createMeteor(event.center.x, event.center.y, initialVelocityX, initialVelocityY);
  } else if (currentObjectType === 'airplane') {
    createAirplane(event.center.x, event.center.y, initialVelocityX, initialVelocityY);
  } else if (currentObjectType === 'ufo') {
    createUFO(event.center.x, event.center.y);
  }
}

function handleTap(event) {
  if (currentObjectType === 'meteor') {
    createMeteor(event.center.x, event.center.y);
  } else if (currentObjectType === 'airplane') {
    createAirplane(event.center.x, event.center.y);
  } else if (currentObjectType === 'ufo') {
    createUFO(event.center.x, event.center.y);
  }
}

hammer.on('tap', handleTap);

function handleInputStart(event) {
    console.log('handleInputstart event triggered', event);
    let rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
}

function handleInputEnd(event) {
  let rect = canvas.getBoundingClientRect();
  let endX = event.clientX - rect.left;
  let endY = event.clientY - rect.top;

  // Assuming dx, dy calculation as before
  let dx = endX - startX;
  let dy = endY - startY;
  let distance = Math.sqrt(dx * dx + dy * dy);
  let initialVelocity = distance * 0.1;
  let angle = Math.atan2(dy, dx);
  let vx = initialVelocity * Math.cos(angle);
  let vy = initialVelocity * Math.sin(angle);

  console.log('handleInputEnd called with currentObjectType:', currentObjectType);

  if (currentObjectType === 'meteor') {
    createMeteor(endX, endY, vx, vy);
  } else if (currentObjectType === 'airplane') {
    createAirplane(endX, endY);
  } else if (currentObjectType === 'ufo') {
    createUFO(endX, endY); // Added line for UFO creation
  }
}

function updateParticles() {
    particles.forEach(particle => {
        // Add logic here for updating airplane particles, if needed
        // For example, updating position based on velocity
        if (particle.type === 'airplane') {
            particle.x += particle.vx;
            particle.y += particle.vy;
        }
        // Gravity effect applies only to star particles
        if (particle.type === 'star') {
            for (let otherParticle of particles) {
                if (particle !== otherParticle && otherParticle.type === 'star') {
                    let dx = otherParticle.x - particle.x;
                    let dy = otherParticle.y - particle.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        let force = gravitationalConstant / (distance * distance || 1);
                        particle.vx += force * dx / distance;
                        particle.vy += force * dy / distance;
                    }
                }
            }
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        // Update life and remove dead particles
        if (particle.type === 'meteor') {
            particle.life--;
            if (particle.life <= 0) {
                let index = particles.indexOf(particle);
                particles.splice(index, 1);
            }
        }

        // Twinkling effect for stars
        if (particle.type === 'star') {
            if (!particle.hasOwnProperty('brightness')) {
                particle.brightness = Math.random() * 0.5 + 0.5; // Initial brightness
            }
            particle.brightness += (Math.random() - 0.5) * 0.2; // Adjust brightness
            particle.brightness = Math.max(0.2, Math.min(particle.brightness, 1)); // Keep within range
        }
        if (particle.type === 'ufo') {
            if (particle.state === 'moving') {
                switch (particle.direction) {
                    case 'up':
                        particle.y -= 2; // Speed of movement, adjust as needed
                        break;
                    case 'right':
                        particle.x += 2;
                        break;
                    case 'left':
                        particle.x -= 2;
                        break;
                }
                particle.moveCounter++;
                if (particle.moveCounter > 50) { // Duration of movement, adjust as needed
                    particle.moveCounter = 0;
                    particle.state = 'pausing';
                }
            } else if (particle.state === 'pausing') {
                particle.pauseCounter++;
                if (particle.pauseCounter > 30) { // Duration of pause, adjust as needed
                    particle.pauseCounter = 0;
                    particle.state = 'moving';
                    // Change direction randomly
                    particle.direction = ['up', 'right', 'left'][Math.floor(Math.random() * 3)];
                }
            }
        }
    });
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        if (particle.type === 'airplane') {
            let airplaneScale = 0.05; // Adjust scale as needed
            let airplaneWidth = airplaneImage.width * airplaneScale;
            let airplaneHeight = airplaneImage.height * airplaneScale;
            ctx.drawImage(airplaneImage, particle.x, particle.y, airplaneWidth, airplaneHeight);

            // Drawing blinking light for the airplane
            if (particle.light && particle.light.blinking) {
                if (particle.light.blinkCounter % particle.light.blinkRate === 0) {
                    ctx.fillStyle = 'red';
                    ctx.beginPath();
                    ctx.arc(particle.x + 10, particle.y + 10, 3, 0, Math.PI * 2); // Adjust position as needed
                    ctx.fill();
                }
                particle.light.blinkCounter++;
            }
        }

        particles.forEach(particle => {
        if (particle.type === 'ufo') {
            let ufoScale = 0.05; // Adjust scale as needed
            let ufoWidth = ufoImage.width * ufoScale; // Assuming ufoImage is loaded
            let ufoHeight = ufoImage.height * ufoScale;
            ctx.drawImage(ufoImage, particle.x, particle.y, ufoWidth, ufoHeight);
        }
    });
        
        if (particle.type === 'star') {
            // Twinkling effect for stars
            if (!particle.hasOwnProperty('brightness')) {
                particle.brightness = Math.random() * 0.5 + 0.5; // Initial brightness
            }
            particle.brightness += (Math.random() - 0.5) * 0.2; // Adjust brightness
            particle.brightness = Math.max(0.2, Math.min(particle.brightness, 1)); // Keep within range

            let brightness = particle.brightness * 255;
            let colorVariation = 20; // Adjust this value for more or less color variation
            let red = Math.min(Math.max(brightness + (Math.random() - 0.5) * colorVariation, 0), 255);
            let green = Math.min(Math.max(brightness + (Math.random() - 0.5) * colorVariation, 0), 255);
            let blue = Math.min(Math.max(brightness + (Math.random() - 0.5) * colorVariation, 0), 255);

            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
            ctx.fill();
        } else if (particle.type === 'meteor') {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }

        /* // Draw haze
        const hazeOpacity = 0.05; // Adjust for desired transparency
        const hazeColor = 'rgba(255, 255, 255,' + hazeOpacity + ')'; // Light white for haze
        ctx.fillStyle = hazeColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height); */

        // Draw constellation lines
        ctx.lineWidth = .75; // Adjust line thickness as desired
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // Adjust opacity as desired

        for (let i = 0; i < constellationStars.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(constellationStars[i].x, constellationStars[i].y);
            ctx.lineTo(constellationStars[i + 1].x, constellationStars[i + 1].y);
            ctx.stroke();
        }

        // Draw constellation label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Adjust opacity as desired
        ctx.font = '12px Arial'; // Adjust font size and style as desired
        const constellationName = 'Ursa Major'; // Replace with your desired constellation name

        const textWidth = ctx.measureText(constellationName).width;
        const textX = (constellationStars[0].x + constellationStars[2].x) / 2 - textWidth / 2;
        const textY = constellationStars[0].y - 15; // Adjust vertical position as needed

        ctx.fillText(constellationName, textX, textY);
    });
}

function createMeteor(x, y, vx = 0, vy = 0) {
  // Define characteristics of the meteor
  const meteorSpeed = 4; // Base speed of the meteor
  const tailLength = 50; // Number of particles in the meteor's tail
  const tailSizeDecrement = 0.95; // Factor by which the tail particle size decreases
  const initialTailSize = 2; // Initial size of the tail particles

  // Calculate combined velocity for the meteor
  const angle = Math.atan2(vy, vx); // Calculate the angle of the initial velocity
  const combinedVx = vx + meteorSpeed * Math.cos(angle);
  const combinedVy = vy + meteorSpeed * Math.sin(angle);

  // Create the fiery tail of the meteor and head
  for (let i = 0; i < tailLength; i++) {
    // Calculate position and size for each tail particle
    const tailX = x - combinedVx * i * 0.1;
    const tailY = y - combinedVy * i * 0.1;
    const tailSize = i === 0 ? initialTailSize : initialTailSize * Math.pow(tailSizeDecrement, i);

    // Determine the color of the tail particle
    // The head (i == 0) will be brighter
    const red = i === 0 ? 255 : 255;
    const green = i === 0 ? 165 : 70 + i * 3;
    const blue = i === 0 ? 0 : i * 2;
    const tailColor = `rgb(${red}, ${green}, ${blue})`;

    // Add tail particle to the particles array
    particles.unshift({
      x: tailX,
      y: tailY,
      vx: combinedVx,
      vy: combinedVy,
      size: tailSize,
      color: tailColor,
      type: 'meteor',
      life: tailLength - i
    });
  }
}

// Ensure DOM is fully loaded
window.onload = function() {
  let airplaneImage = new Image();
  airplaneImage.src = 'https://github.com/harveyspector64/Starry-Sky-Sim/blob/33a9f3026f150ac1157e6a81b61293fa6b19bf25/airplane747transparent.png?raw=true'; // Your airplane image URL

  // Button event listeners
  document.getElementById('addMeteor').addEventListener('click', function() {
    currentObjectType = 'meteor';
    updateButtonStyles(this.id);
    console.log('Meteor button clicked, currentObjectType:', currentObjectType);
  });
  document.getElementById('addAirplane').addEventListener('click', function() {
    currentObjectType = 'airplane';
    updateButtonStyles(this.id);
    console.log('Airplane button clicked, currentObjectType:', currentObjectType);
  });
 document.getElementById('addUFO').addEventListener('click', function() {
    currentObjectType = 'ufo';
    updateButtonStyles(this.id);
    console.log('UFO button clicked, currentObjectType:', currentObjectType);
});

// New touchend event listeners
document.getElementById('addMeteor').addEventListener('touchend', function(event) {
    event.preventDefault(); // Prevents additional mouse click events
    currentObjectType = 'meteor';
    updateButtonStyles(this.id);
});
document.getElementById('addAirplane').addEventListener('touchend', function(event) {
    event.preventDefault(); // Prevents additional mouse click events
    currentObjectType = 'airplane';
    updateButtonStyles(this.id);
});
document.getElementById('addUFO').addEventListener('touchend', function(event) {
    event.preventDefault(); // Prevents additional mouse click events
    currentObjectType = 'ufo';
    updateButtonStyles(this.id);
});

  // Function to update button styles
  function updateButtonStyles(activeButtonId) {
    document.querySelectorAll('#controls button').forEach(button => {
      if (button.id === activeButtonId) {
        button.style.backgroundColor = 'lightblue'; // Active button style
      } else {
        button.style.backgroundColor = ''; // Reset style for inactive buttons
      }
    });
  }

  // Start the game loop
  requestAnimationFrame(gameLoop);

  // Canvas setup
  const canvas = document.getElementById('gravityCanvas');
  const ctx = canvas.getContext('2d');

  // Hammer.js initialization
  const hammer = new Hammer(canvas);

  // ... other code within window.onload
};

function drawAirplane(x, y) {
  ctx.drawImage(airplaneImage, x, y);
}

function createAirplane(x, y) {
    particles.push({
        x: x,
        y: y,
        vx: 2, // Adjust speed as necessary
        vy: 0,
        type: 'airplane'
    });
}

airplaneImage.onerror = function() {
  console.error("Error loading the airplane image.");
};

function createUFO(x, y) {
    const ufo = {
        x: x,
        y: y,
        type: 'ufo',
        state: 'moving', // can be 'moving', 'pausing', etc.
        direction: 'up', // initial direction, can be 'up', 'right', 'left'
        moveCounter: 0, // to control movement duration
        pauseCounter: 0, // to control pause duration
    };
    particles.push(ufo);
}

function gameLoop() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(gameLoop);
}

gameLoop();
