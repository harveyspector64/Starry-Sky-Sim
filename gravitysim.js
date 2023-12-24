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
    const initialVelocityX = event.deltaX * 0.05; // Adjust this factor as needed
    const initialVelocityY = event.deltaY * 0.05;
    createMeteor(event.center.x, event.center.y, initialVelocityX, initialVelocityY);
}

function handleInputStart(event) {
    console.log('handleInputstart event triggered', event);
    let rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
}

function handleInputEnd(event) {
    console.log('handleInputend event triggered', event);
    let rect = canvas.getBoundingClientRect();
    let endX = event.clientX - rect.left;
    let endY = event.clientY - rect.top;

    let dx = endX - startX;
    let dy = endY - startY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Scale initial velocity based on distance
    let initialVelocity = distance * 0.1; // Adjust this factor as needed
    let angle = Math.atan2(dy, dx);
    let vx = initialVelocity * Math.cos(angle);
    let vy = initialVelocity * Math.sin(angle);

    createMeteor(endX, endY, vx, vy);
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

        // Update position of all particles (stars and meteors)
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Update life and remove dead particles for meteors
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
    // Create a single test particle with a distinct color
    particles.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: 5,
        color: 'rgb(0, 255, 0)', // Use a bright green for easy identification
        type: 'test',
        life: 100
    });
}

function gameLoop() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(gameLoop);
}

gameLoop();
