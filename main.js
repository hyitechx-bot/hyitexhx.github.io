// ── Navbar scroll ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Hamburger ──────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ── Neural Network Canvas Animation ───────────────────────────
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');

let W, H, nodes = [], dataPackets = [];
const NODE_COUNT   = 72;
const MAX_DIST     = 160;
const COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#a78bfa', '#38bdf8'];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initNodes(); });

// Node types: regular, hub (larger, brighter)
function makeNode() {
  const isHub = Math.random() < 0.12;
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: isHub ? 4.5 : Math.random() * 2 + 1,
    isHub,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.02,
    alpha: 0.5 + Math.random() * 0.5
  };
}

function initNodes() {
  nodes = Array.from({ length: NODE_COUNT }, makeNode);
}
initNodes();

// Data packets travel along edges
function spawnPacket(a, b) {
  dataPackets.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, speed: 0.008 + Math.random() * 0.012, color: a.color });
}

let frameCount = 0;

function draw() {
  ctx.clearRect(0, 0, W, H);
  frameCount++;

  // Move nodes
  nodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
    n.pulse += n.pulseSpeed;
  });

  // Draw edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST) {
        const alpha = (1 - dist / MAX_DIST) * 0.18;
        // Gradient edge
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, hexAlpha(a.color, alpha));
        grad.addColorStop(1, hexAlpha(b.color, alpha));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = (a.isHub || b.isHub) ? 0.8 : 0.4;
        ctx.stroke();

        // Occasionally spawn data packet
        if (frameCount % 90 === 0 && Math.random() < 0.04) spawnPacket(a, b);
      }
    }
  }

  // Draw data packets (glowing dots traveling along edges)
  dataPackets = dataPackets.filter(p => {
    p.t += p.speed;
    if (p.t > 1) return false;
    const x = p.ax + (p.bx - p.ax) * p.t;
    const y = p.ay + (p.by - p.ay) * p.t;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    return true;
  });

  // Draw nodes
  nodes.forEach(n => {
    const pulse = Math.sin(n.pulse);
    const r = n.r + (n.isHub ? pulse * 1.2 : pulse * 0.4);

    // Outer glow for hubs
    if (n.isHub) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(n.color, 0.06 + pulse * 0.04);
      ctx.fill();
    }

    // Ring
    ctx.beginPath();
    ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(n.color, 0.2 + pulse * 0.1);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Core
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(n.color, n.alpha);
    ctx.shadowBlur = n.isHub ? 16 : 6;
    ctx.shadowColor = n.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  requestAnimationFrame(draw);
}
draw();

// Helper: hex color + alpha → rgba string
function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Scroll reveal ──────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.service-card, .portfolio-card, .testimonial-card, .process-step, .about-card'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  revealObserver.observe(el);
});

// ── Contact form ───────────────────────────────────────────────
const form = document.getElementById('contactForm');
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const original = btn.textContent;

  btn.textContent = 'Sending...';
  btn.disabled = true;
  btn.style.opacity = '0.8';

  try {
    const res = await fetch(this.action, {
      method: 'POST',
      body: new FormData(this),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      btn.textContent = 'Message Sent ✓';
      btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
      btn.style.boxShadow = '0 0 24px rgba(16,185,129,0.4)';
      btn.style.opacity = '1';
      this.reset();
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.boxShadow = '';
        btn.disabled = false;
      }, 4000);
    } else {
      throw new Error('Server error');
    }
  } catch {
    btn.textContent = 'Failed – Try Again';
    btn.style.background = 'linear-gradient(135deg,#dc2626,#ef4444)';
    btn.style.opacity = '1';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }
});
