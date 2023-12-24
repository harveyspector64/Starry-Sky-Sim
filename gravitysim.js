const canvas = document.getElementById('gravityCanvas');
const ctx = canvas.getContext('2d');

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
canvas.addEventListener('click', function(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    createMeteor(x, y);
});

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



function createMeteor(x, y) {
    const meteorSpeed = 5; // Speed of the meteor
    const tailLength = 50; // Number of particles in the tail
    const tailSizeDecrement = 0.95; // Decrease size of tail particles
    const initialTailSize = 2; // Initial size of tail particles

    // Direction of the meteor
    let angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    // Create the rocky head of the meteor
    let vx = meteorSpeed * Math.cos(angle);
    let vy = meteorSpeed * Math.sin(angle);

    particles.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: 3, // Size of the meteor head
        color: 'grey',
        type: 'meteor',
        life: tailLength
    });

    // Create the fiery tail of the meteor
    for (let i = 0; i < tailLength; i++) {
        particles.push({
            x: x - vx * i * 0.1, // Position the tail particles along the trajectory
            y: y - vy * i * 0.1,
            vx: vx,
            vy: vy,
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