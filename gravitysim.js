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

function handlePan(event) {
    console.log('Pan event triggered', event);
    const initialVelocityX = event.deltaX * 0.1; // Adjust this factor as needed
    const initialVelocityY = event.deltaY * 0.1;
}

function handleInputStart(event) {
    console.log('handleInputstart event triggered', event);
    let rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
}

function handleInputEnd(event) {
  console.log('handleInputend event triggered', event);

  // Get accurate mouse/touch coordinates relative to the canvas
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Create the meteor with initial velocity based on distance from canvas center
  createMeteor(x, y, calculateInitialVelocity(x, y));
}

// Helper function to calculate initial velocity based on distance
function calculateInitialVelocity(x, y) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const dx = centerX - x;
  const dy = centerY - y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const initialVelocity = distance * 0.1; // Adjust this factor as needed
  const angle = Math.atan2(dy, dx);
  return {
    vx: initialVelocity * Math.cos(angle),
    vy: initialVelocity * Math.sin(angle)
  };
}

function updateParticles() {
    particles.forEach(particle => {
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
    });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
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
  });

  // Draw constellation lines
  ctx.lineWidth = .75; // Adjust line thickness as desired
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // Adjust opacity as desired

  for (let i = 0; i < constellationStars.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(constellationStars[i].x, constellationStars[i].y);
    ctx.lineTo(constellationStars[i + 1].x, constellationStars[i + 1].y);
    ctx.stroke();
  }

  // (Optional) Draw constellation label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Adjust opacity as desired
  ctx.font = '12px Arial'; // Adjust font size and style as desired
  const constellationName = 'Ursa Major'; // Replace with your desired constellation name

  const textWidth = ctx.measureText(constellationName).width;
  const textX = (constellationStars[0].x + constellationStars[2].x) / 2 - textWidth / 2;
  const textY = constellationStars[0].y - 15; // Adjust vertical position as needed

  ctx.fillText(constellationName, textX, textY);
}



function createMeteor(x, y, vx = 0, vy = 0) {
    let angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x); // Calculate angle here
  const meteorSpeed = 5; // Speed of the meteor
  const tailLength = 50; // Number of particles in the tail
  const tailSizeDecrement = 0.95; // Decrease size of tail particles
  const initialTailSize = 2; // Initial size of tail particles

  // Combine initial velocity with default speed
  const combinedVx = vx + meteorSpeed * Math.cos(angle);
  const combinedVy = vy + meteorSpeed * Math.sin(angle);

  // Create the rocky head of the meteor
  particles.push({
    x: x,
    y: y,
    vx: combinedVx,
    vy: combinedVy,
    size: 3, // Size of the meteor head
    color: 'grey',
    type: 'meteor',
    life: tailLength
  });

  // Create the fiery tail of the meteor
  for (let i = 0; i < tailLength; i++) {
    particles.push({
      x: x - combinedVx * i * 0.1, // Position the tail particles along the trajectory
      y: y - combinedVy * i * 0.1,
      vx: combinedVx,
      vy: combinedVy,
      size: initialTailSize * Math.pow(tailSizeDecrement, i),
      color: `rgb(${255}, ${70 + i * 3}, ${i * 2})`, // Color transition for the tail
      type: 'meteor',
      life: tailLength - i
    });
  }
}


function gameLoop() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(gameLoop);
}

gameLoop();
