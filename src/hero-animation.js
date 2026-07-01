/**
 * hero-animation.js
 * Cinematic Canvas Animation for Mahidhar Durga's Portfolio Hero Section.
 * Renders real photo on the RIGHT side of the hero with holographic effects.
 * The LEFT side stays clear for text content.
 */

export function initHeroAnimation(containerId, photoSrc, cyberSrc) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Hide the CSS fallback portrait immediately so there's no double-image
  const fallback = container.querySelector('.portrait-fallback-img');
  if (fallback) fallback.style.opacity = '0';

  // ---------- Setup Canvas ----------
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-cinematic-canvas';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // High-DPI support
  let dpr = window.devicePixelRatio || 1;
  let W = 0, H = 0; // Start at 0 to trigger dynamic resize inside render loop once CSS loads

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = container.clientWidth;
    H = container.clientHeight;
    console.log(`[CANVAS RESIZE] W=${W}, H=${H}, Container=${container.id}`);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  // Listen to browser window resize events
  window.addEventListener('resize', () => { resize(); rebuildLayout(); });

  // ---------- State ----------
  let t = 0;
  let mouseX = W, mouseY = H / 2;
  let isHovered = false;
  let hoverProgress = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let scanProgress = 0;
  let rx = 0;
  let ry = 0;

  const mouseTarget = container.closest('.hero') || container;

  mouseTarget.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    // Only "hover" when mouse is over the right (photo) half
    const { px } = getPhotoRect();
    isHovered = mouseX > px - 60;
  });
  mouseTarget.addEventListener('mouseleave', () => { isHovered = false; });

  // Touch support for mobile interaction
  mouseTarget.addEventListener('touchstart', e => {
    if (e.touches && e.touches[0]) {
      isHovered = true;
      const rect = container.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });
  mouseTarget.addEventListener('touchend', () => { isHovered = false; });

  // ---------- Image Loading Declarations ----------
  let realLoaded = false, cyberLoaded = false;
  const realImg = new Image();
  const cyberImg = new Image();

  // ---------- Draw Cover Image Helper (object-fit: cover for canvas) ----------
  function drawCoverImage(ctx, img, dx, dy, dw, dh) {
    if (dw <= 0 || dh <= 0) return;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    if (!imgW || !imgH) return;

    const imgRatio = imgW / imgH;
    const destRatio = dw / dh;
    let sx, sy, sw, sh;

    if (imgRatio > destRatio) {
      sh = imgH;
      sw = imgH * destRatio;
      sx = (imgW - sw) / 2;
      sy = 0;
    } else {
      sw = imgW;
      sh = imgW / destRatio;
      sx = 0;
      sy = (imgH - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  // ---------- Draw Glitch Cover Image Helper ----------
  function drawCoverImageGlitch(ctx, img, dx, dy, dw, dh, glitchIntensity) {
    if (dw <= 0 || dh <= 0) return;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    if (!imgW || !imgH) return;

    const imgRatio = imgW / imgH;
    const destRatio = dw / dh;
    let sx, sy, sw, sh;

    if (imgRatio > destRatio) {
      sh = imgH;
      sw = imgH * destRatio;
      sx = (imgW - sw) / 2;
      sy = 0;
    } else {
      sw = imgW;
      sh = imgW / destRatio;
      sx = 0;
      sy = (imgH - sh) / 2;
    }

    if (glitchIntensity > 0 && Math.random() < glitchIntensity * 0.45) {
      // Draw baseline cropped image
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

      // Draw horizontal slices offset slightly
      const slices = Math.floor(3 + Math.random() * 5);
      for (let i = 0; i < slices; i++) {
        const sySlice = Math.random() * sh;
        const shSlice = Math.random() * (sh / 6) + 4;
        const dySlice = dy + (sySlice / sh) * dh;
        const dhSlice = (shSlice / sh) * dh;

        const offset = (Math.random() - 0.5) * dw * 0.09 * glitchIntensity;
        ctx.drawImage(img, sx, sy + sySlice, sw, shSlice, dx + offset, dySlice, dw, dhSlice);
      }

      // Chromatic split aberration overlay
      if (Math.random() < 0.35) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.45 * glitchIntensity;
        // Shift red channel slightly left
        ctx.drawImage(img, sx, sy, sw, sh, dx - 4, dy, dw, dh);
        // Shift cyan channel slightly right
        ctx.drawImage(img, sx, sy, sw, sh, dx + 4, dy, dw, dh);
        ctx.restore();
      }
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  }

  // ---------- Photo Rect — RIGHT side of canvas ----------
  function getPhotoRect() {
    // Portrait dimensions
    const ph = Math.max(20, Math.min(H * 0.88, 700));
    const pw = ph / 1.45;
    // Position on the RIGHT side with some margin from edge
    const rightMargin = Math.max(W * 0.04, 20);
    const px = Math.max(0, W - pw - rightMargin);
    const py = Math.max(0, (H - ph) / 2);
    return { px, py, pw, ph };
  }

  // ---------- Pixel Particle System ----------
  let pixelParticles = [];
  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d');

  function buildPixelData() {
    const sampleW = 80;
    const sampleH = Math.round(sampleW * 1.45); // match ratio (approx 116)
    offCanvas.width = sampleW;
    offCanvas.height = sampleH;
    
    // 1. Draw real image with cover crop and grab image data
    offCtx.clearRect(0, 0, sampleW, sampleH);
    drawCoverImage(offCtx, realImg, 0, 0, sampleW, sampleH);
    const realData = offCtx.getImageData(0, 0, sampleW, sampleH).data;
    
    pixelParticles = [];
    const step = 2;
    for (let sy = 0; sy < sampleH; sy += step) {
      for (let sx = 0; sx < sampleW; sx += step) {
        const idx = (sy * sampleW + sx) * 4;
        
        // Real image color and alpha
        const r = realData[idx];
        const g = realData[idx + 1];
        const b = realData[idx + 2];
        const a = realData[idx + 3];
        if (a < 50) continue;
        
        // Brightness and depth mapping for real image (lighter pixels are closer, e.g. face highlights)
        const realBrightness = (r * 0.299 + g * 0.587 + b * 0.114);
        if (realBrightness < 20) continue; // skip dark backgrounds
        const realZ = (realBrightness / 255.0) * 75.0 - 37.5; // Z depth amplitude: -37.5 to +37.5 px
        
        // Generate beautiful cyberpunk theme colors dynamically from the user's real face highlights
        let cr = 185, cg = 39, cb = 252; // Purple midtones
        if (realBrightness > 150) {
          cr = 0; cg = 242; cb = 254; // Cyan highlights
        } else if (realBrightness > 75) {
          cr = 185; cg = 39; cb = 252; // Purple
        } else {
          cr = 0; cg = 255; cb = 135; // Neon green shadows
        }
        
        // Cyber Z depth pops out slightly more for neon high-contrast look
        const cyberZ = (realBrightness / 255.0) * 85.0 - 42.5;
        
        // Store centered normalized coordinates and 3D properties
        pixelParticles.push({
          nx: (sx / sampleW) - 0.5, // centered normalized X [-0.5, 0.5]
          ny: (sy / sampleH) - 0.5, // centered normalized Y [-0.5, 0.5]
          r, g, b,
          cr, cg, cb,
          realZ,
          cyberZ,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.6,
          size: 1.0 + Math.random() * 1.5,
          x: 0, y: 0, z: 0
        });
      }
    }
  }

  // ---------- Orbital Rings ----------
  const orbitRings = [
    { radius: 0.38, speed: 0.008,  color: '#00f2fe', nodes: 6, lineWidth: 1.5, opacity: 0.55 },
    { radius: 0.48, speed: -0.005, color: '#b927fc', nodes: 4, lineWidth: 1,   opacity: 0.38 },
    { radius: 0.57, speed: 0.003,  color: '#00ff87', nodes: 7, lineWidth: 0.8, opacity: 0.28 },
  ];

  // ---------- Data Streams — right half only ----------
  let dataStreams = [];
  function initDataStreams() {
    dataStreams = [];
    for (let i = 0; i < 10; i++) {
      dataStreams.push({
        x: 0, // will be set in first update based on W
        y: -Math.random() * H,
        speed: 0.7 + Math.random() * 1.2,
        opacity: 0.035 + Math.random() * 0.04,
        chars: Array(8).fill(0).map(() => Math.random() > 0.5 ? '1' : '0'),
        charTimer: 0,
      });
    }
  }
  initDataStreams();

  function getRightHalfX() {
    const { px } = getPhotoRect();
    // Streams only in right half (from photo left edge onwards)
    return px + Math.random() * (W - px);
  }

  function rebuildLayout() {
    initDataStreams();
    if (realLoaded) buildPixelData();
  }

  // ---------- HUD Badge Metrics ----------
  // Positioned to the LEFT of the photo (inside the photo, not sticking outside the site)
  const hudMetrics = [
    { label: 'JAVA',   value: '95%', icon: '☕', color: '#00f2fe' },
    { label: 'AWS SA', value: 'CERT', icon: '☁', color: '#ff9500' },
    { label: 'AI/RAG', value: 'LIVE', icon: '🤖', color: '#00ff87' },
    { label: 'MCP',    value: 'ACT',  icon: '⚡', color: '#b927fc' },
  ];

  // ---------- Utility: Rounded Rect Path ----------
  function roundRect(ctx, x, y, w, h, r) {
    if (r > Math.min(w, h) / 2) r = Math.min(w, h) / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // ---------- Draw Functions ----------

  function drawBase() {
    ctx.clearRect(0, 0, W, H);
  }

  function drawDataStreams() {
    ctx.save();
    ctx.font = '10px "Fira Code", monospace';

    const r = Math.round(0 + 185 * hoverProgress);
    const g = Math.round(242 - 203 * hoverProgress);
    const b = Math.round(254 - 2 * hoverProgress);

    dataStreams.forEach(stream => {
      // Lazy-init x position on first frame
      if (stream.x === 0) stream.x = getRightHalfX();

      const speedMult = 1.0 + 1.2 * hoverProgress;
      stream.y += stream.speed * speedMult;
      
      if (stream.y > H + 120) {
        stream.y = -120;
        stream.x = getRightHalfX();
      }

      stream.charTimer++;
      if (stream.charTimer > 8) {
        stream.charTimer = 0;
        stream.chars.shift();
        stream.chars.push(Math.random() > 0.5 ? '1' : '0');
      }

      // Dynamic stream color transition
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      for (let i = 0; i < stream.chars.length; i++) {
        const charY = stream.y - i * 13;
        const fade = (1 - i / stream.chars.length) * stream.opacity;
        ctx.globalAlpha = fade;

        // Apply a light parallax shift
        const streamX = stream.x + parallaxX * 0.3;
        const streamY = charY + parallaxY * 0.3;
        
        ctx.fillText(stream.chars[i], streamX, streamY);
      }
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawGlowBackdrop() {
    const { px, py, pw, ph } = getPhotoRect();
    // Parallax depth offset
    const cx = px + pw / 2 + parallaxX * 0.5;
    const cy = py + ph * 0.45 + parallaxY * 0.5;

    // Ambient glow behind portrait
    const sizeMult = 0.9 + 0.1 * hoverProgress;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pw * sizeMult);
    
    // Smooth transition opacities
    const op1 = 0.06 + 0.08 * hoverProgress;
    const op2 = 0.025 + 0.045 * hoverProgress;
    
    glow.addColorStop(0,   `rgba(0, 242, 254, ${op1})`);
    glow.addColorStop(0.5, `rgba(185, 39, 252, ${op2})`);
    glow.addColorStop(1,   'rgba(0,0,0,0)');
    
    ctx.save();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx, cy, pw * sizeMult, ph * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPixelParticles() {
    if (!realLoaded || pixelParticles.length === 0) return;
    const { px: basePx, py: basePy, pw, ph } = getPhotoRect();
    const cx = basePx + pw / 2;
    const cy = basePy + ph / 2;

    const dispAmt = 3 + 7 * hoverProgress;
    const alphaMult = 0.6 + 1.8 * hoverProgress;
    const fov = 350; // Camera perspective distance

    // Base coordinate space for photo shifts
    const pxCenter = cx + parallaxX * 0.8;
    const pyCenter = cy + parallaxY * 0.8;

    ctx.save();
    // Additive blending for a self-illuminating digital hologram glow
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < pixelParticles.length; i++) {
      const p = pixelParticles[i];
      
      // Interpolate Z-depth from realZ to cyberZ based on hoverProgress
      const oz = p.realZ + (p.cyberZ - p.realZ) * hoverProgress;
      
      // Interpolate colors from real (r,g,b) to cyber (cr,cg,cb)
      const r = Math.round(p.r + (p.cr - p.r) * hoverProgress);
      const g = Math.round(p.g + (p.cg - p.g) * hoverProgress);
      const b = Math.round(p.b + (p.cb - p.b) * hoverProgress);
      
      const ox = p.nx * pw;
      const oy = p.ny * ph;

      // 3D Rotation math around Y-axis (tilt left-right)
      const x1 = ox * Math.cos(ry) - oz * Math.sin(ry);
      const z1 = ox * Math.sin(ry) + oz * Math.cos(ry);

      // 3D Rotation math around X-axis (tilt up-down)
      const y2 = oy * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = oy * Math.sin(rx) + z1 * Math.cos(rx);

      // 3D Perspective Projection with safe camera distance
      const cameraDist = 650;
      const projFov = 650;
      const scale = projFov / (cameraDist + z2);

      const floatX = Math.sin(t * p.speed * 1.1 + p.phase) * dispAmt;
      const floatY = Math.cos(t * p.speed * 0.9 + p.phase + 1.2) * dispAmt * 0.5;

      let posX = pxCenter + x1 * scale + floatX;
      let posY = pyCenter + y2 * scale + floatY;

      // Mouse interactive repelling force in 3D projected space
      const dx = mouseX - posX;
      const dy = mouseY - posY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 95) {
        const force = (95 - dist) / 95;
        const angle = Math.atan2(dy, dx);
        const repelStrength = 40 * hoverProgress * scale;
        posX -= Math.cos(angle) * force * repelStrength;
        posY -= Math.sin(angle) * force * repelStrength;
      }

      p.x = posX;
      p.y = posY;

      // Draw the 3D particle as a smooth glowing circle
      const size = p.size * scale * (0.85 + 0.35 * hoverProgress);
      const alpha = (0.12 + 0.07 * Math.sin(t * 2.5 + p.phase)) * alphaMult * scale;
      ctx.globalAlpha = Math.max(0.06, Math.min(alpha, 0.85));
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawPhoto() {
    if (!realLoaded) return;
    const { px: basePx, py: basePy, pw, ph } = getPhotoRect();
    
    // Aligned with photo parallax space
    const px = basePx + parallaxX * 0.8;
    const py = basePy + parallaxY * 0.8;

    ctx.save();
    roundRect(ctx, px, py, pw, ph, 20);
    ctx.clip();

    // Dynamic photo opacity blending — keep real photo partially visible on hover for clear facial details
    ctx.globalAlpha = 0.94 - 0.49 * hoverProgress;
    drawCoverImage(ctx, realImg, px, py, pw, ph);

    // Cyber overlay blends on top with screen composition to create a glowing digital effect of your own face
    if (hoverProgress > 0.01) {
      ctx.save();
      ctx.globalAlpha = 0.65 * hoverProgress;
      ctx.globalCompositeOperation = 'screen';

      // Digital glitch multiplier peaks in the middle of hover transitions
      const transitionGlitch = 4.0 * hoverProgress * (1.0 - hoverProgress);
      const randomFlicker = Math.random() < 0.08 ? Math.random() * 0.55 : 0;
      const glitchAmt = Math.min(1.0, transitionGlitch + randomFlicker);

      // Draw your own face with digital glitch (100% aligned!)
      drawCoverImageGlitch(ctx, realImg, px, py, pw, ph, glitchAmt);
      
      // Overlay the holographic cyan-to-purple gradient on top of the glitched face
      ctx.globalCompositeOperation = 'source-atop';
      const hologramGrad = ctx.createLinearGradient(px, py, px, py + ph);
      hologramGrad.addColorStop(0, 'rgba(0, 242, 254, 0.82)'); // Neon Cyan
      hologramGrad.addColorStop(1, 'rgba(185, 39, 252, 0.82)'); // Neon Purple
      ctx.fillStyle = hologramGrad;
      ctx.fillRect(px, py, pw, ph);

      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.restore();

    // Bottom vignette — fade into page background
    const vigH = ph * 0.40;
    const vig = ctx.createLinearGradient(0, py + ph - vigH, 0, py + ph + 2);
    vig.addColorStop(0, 'rgba(7,9,14,0)');
    vig.addColorStop(1, 'rgba(7,9,14,1)');
    ctx.save();
    roundRect(ctx, px, py + ph - vigH, pw, vigH + 4, 0);
    ctx.clip();
    ctx.fillStyle = vig;
    ctx.fillRect(px, py + ph - vigH, pw, vigH + 4);
    ctx.restore();

    // Left-side blend — seamlessly fade photo into the overlay gradient
    const leftBlendW = pw * 0.35;
    const leftBlend = ctx.createLinearGradient(px, 0, px + leftBlendW, 0);
    leftBlend.addColorStop(0, 'rgba(7,9,14,0.98)');
    leftBlend.addColorStop(1, 'rgba(7,9,14,0)');
    ctx.save();
    roundRect(ctx, px, py, leftBlendW, ph, 20);
    ctx.clip();
    ctx.fillStyle = leftBlend;
    ctx.fillRect(px, py, leftBlendW, ph);
    ctx.restore();
  }

  function drawBorder() {
    const { px: basePx, py: basePy, pw, ph } = getPhotoRect();
    const px = basePx + parallaxX * 0.8;
    const py = basePy + parallaxY * 0.8;

    ctx.save();
    
    // Smooth color interpolation Cyan (0, 242, 254) to Purple (185, 39, 252)
    const r = Math.round(0 + 185 * hoverProgress);
    const g = Math.round(242 - 203 * hoverProgress);
    const b = Math.round(254 - 2 * hoverProgress);
    const alpha = 0.35 + 0.20 * hoverProgress + 0.1 * Math.sin(t * (2 + hoverProgress));
    
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
    ctx.shadowBlur = 12 + 8 * hoverProgress;
    
    roundRect(ctx, px, py, pw, ph, 20);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawCornerBrackets() {
    const { px: basePx, py: basePy, pw, ph } = getPhotoRect();
    const px = basePx + parallaxX * 0.8;
    const py = basePy + parallaxY * 0.8;
    const size = 18;

    // Color transition interpolation
    const r = Math.round(0 + 185 * hoverProgress);
    const g = Math.round(242 - 203 * hoverProgress);
    const b = Math.round(254 - 2 * hoverProgress);
    const color = `rgb(${r}, ${g}, ${b})`;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7 + 0.2 * hoverProgress;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4 + 5 * hoverProgress;

    // TL
    ctx.beginPath(); ctx.moveTo(px + size, py); ctx.lineTo(px, py); ctx.lineTo(px, py + size); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(px + pw - size, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw, py + size); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(px + size, py + ph); ctx.lineTo(px, py + ph); ctx.lineTo(px, py + ph - size); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(px + pw - size, py + ph); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px + pw, py + ph - size); ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Dynamic accumulated scan progress avoids visual jump glitches when changing speeds
  function drawScanBar() {
    const { px: basePx, py: basePy, pw, ph } = getPhotoRect();
    const px = basePx + parallaxX * 0.8;
    const py = basePy + parallaxY * 0.8;

    const scanY = py + (scanProgress % (ph + 20)) - 10;
    
    const r = Math.round(0 + 185 * hoverProgress);
    const g = Math.round(242 - 203 * hoverProgress);
    const b = Math.round(254 - 2 * hoverProgress);
    const scanColor = `${r}, ${g}, ${b}`;

    const scanGrad = ctx.createLinearGradient(px, scanY - 10, px, scanY + 10);
    scanGrad.addColorStop(0,   `rgba(${scanColor}, 0)`);
    scanGrad.addColorStop(0.5, `rgba(${scanColor}, ${0.45 + 0.20 * hoverProgress})`);
    scanGrad.addColorStop(1,   `rgba(${scanColor}, 0)`);

    ctx.save();
    roundRect(ctx, px, py, pw, ph, 20);
    ctx.clip();
    ctx.fillStyle = scanGrad;
    ctx.fillRect(px, scanY - 10, pw, 20);
    ctx.restore();
  }

  function drawHUDLabels() {
    const { px: basePx, py: basePy, pw, ph } = getPhotoRect();
    const px = basePx + parallaxX * 0.8;
    const py = basePy + parallaxY * 0.8;
    
    ctx.save();
    ctx.font = '9px "Fira Code", monospace';

    // LIVE dot — top left inside frame
    const pulse = 0.6 + 0.4 * Math.sin(t * 4);
    ctx.fillStyle = `rgba(0, 255, 135, ${pulse})`;
    ctx.shadowColor = '#00ff87';
    ctx.shadowBlur = 6 * pulse;
    ctx.beginPath();
    ctx.arc(px + 16, py + 16, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(0, 255, 135, 0.8)`;
    ctx.fillText('LIVE', px + 26, py + 20);

    // Resolution — top right
    ctx.fillStyle = `rgba(0, 242, 254, ${0.55 + 0.25 * hoverProgress})`;
    ctx.fillText('4K', px + pw - 26, py + 20);

    // Status bar — bottom
    const barH = 22;
    const barY = py + ph - barH - 8;
    ctx.fillStyle = `rgba(7, 9, 14, ${0.75 + 0.15 * hoverProgress})`;
    ctx.fillRect(px + 10, barY, pw - 20, barH);
    ctx.strokeStyle = `rgba(0, 242, 254, ${0.25 + 0.20 * hoverProgress})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 10, barY, pw - 20, barH);
    ctx.fillStyle = `rgba(0, 242, 254, ${0.65 + 0.20 * hoverProgress})`;
    ctx.font = '8px "Fira Code", monospace';
    ctx.fillText('ID: MD-2024  |  STATUS: ONLINE  |  JAVA · AWS · AI', px + 16, barY + 14);

    ctx.restore();
  }

  function drawOrbitals() {
    const { px, py, pw, ph } = getPhotoRect();
    // Parallax depth offset
    const cx = px + pw / 2 + parallaxX * 1.1;
    const cy = py + ph * 0.38 + parallaxY * 1.1;
    const baseR = Math.min(pw, ph) * 0.5;

    orbitRings.forEach(ring => {
      const R = baseR * ring.radius;
      const speedMult = 1.0 + 1.5 * hoverProgress;
      const angle = t * ring.speed * 60 * speedMult;

      ctx.save();
      ctx.strokeStyle = ring.color;
      ctx.globalAlpha = Math.min(1.0, ring.opacity * (1.0 + 0.8 * hoverProgress));
      ctx.lineWidth = ring.lineWidth;
      ctx.setLineDash([5, 12]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, R, R * 0.32, -0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      for (let n = 0; n < ring.nodes; n++) {
        const nodeAngle = angle + (n / ring.nodes) * Math.PI * 2;
        const nx = cx + Math.cos(nodeAngle) * R;
        const ny = cy + Math.sin(nodeAngle) * R * 0.32;
        const nodePulse = (0.55 + 0.45 * Math.sin(t * 4 + n)) * (1.0 + 0.8 * hoverProgress);
        
        ctx.globalAlpha = Math.min(1.0, nodePulse);
        ctx.fillStyle = ring.color;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    });
  }

  function drawFloatingBadges() {
    const { px, py, pw, ph } = getPhotoRect();
    const badgeW = 76;
    const badgeH = 42;

    // Parallax depth offset
    const pxOffset = parallaxX * 1.5;
    const pyOffset = parallaxY * 1.5;

    // Badges expand outward slightly on hover
    const pushAmt = 16 * hoverProgress;

    const positions = [
      { x: px + 12 - pushAmt + pxOffset,          y: py + ph * 0.22 + Math.sin(t * 1.1) * 7 + pyOffset },     // Left side, upper
      { x: px + pw - badgeW - 12 + pushAmt + pxOffset, y: py + ph * 0.22 + Math.sin(t * 1.3 + 1) * 7 + pyOffset }, // Right side, upper
      { x: px + 12 - pushAmt + pxOffset,          y: py + ph * 0.42 + Math.sin(t * 1.0 + 2) * 7 + pyOffset },  // Left side, lower
      { x: px + pw - badgeW - 12 + pushAmt + pxOffset, y: py + ph * 0.42 + Math.sin(t * 1.2 + 3) * 7 + pyOffset }, // Right side, lower
    ];

    hudMetrics.forEach((m, i) => {
      const { x: bx, y: by } = positions[i];
      ctx.save();
      ctx.globalAlpha = 0.80 + 0.20 * hoverProgress;

      ctx.fillStyle = 'rgba(7, 9, 14, 0.88)';
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 1;
      
      // Dynamic hover shadow glow
      ctx.shadowColor = m.color;
      ctx.shadowBlur = 8 + 8 * hoverProgress;
      
      roundRect(ctx, bx, by, badgeW, badgeH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Icon
      ctx.font = '13px sans-serif';
      ctx.fillStyle = m.color;
      ctx.globalAlpha = 1;
      ctx.fillText(m.icon, bx + 8, by + 16);

      // Label
      ctx.font = '8px "Fira Code", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(m.label, bx + 27, by + 14);

      // Value
      ctx.font = 'bold 12px "Fira Code", monospace';
      ctx.fillStyle = m.color;
      ctx.fillText(m.value, bx + 27, by + 30);

      ctx.restore();
    });
  }

  // ---------- Main Render Loop ----------
  let lastTime = 0;
  function render(now) {
    // If layout was not yet resolved, check and resize
    if (W <= 0 || H <= 0) {
      resize();
      if (W > 0 && H > 0) {
        rebuildLayout();
      }
    }

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    t += dt;

    // 1. Update smooth hover progress transition
    hoverProgress += (isHovered ? 1.0 : -1.0) * dt * 4.0;
    hoverProgress = Math.max(0.0, Math.min(1.0, hoverProgress));

    // 2. Update parallax offsets based on mouse position relative to photo center
    const { px, py, pw, ph } = getPhotoRect();
    const cx = px + pw / 2;
    const cy = py + ph / 2;
    
    const targetParallaxX = isHovered ? (mouseX - cx) / 15 : 0;
    const targetParallaxY = isHovered ? (mouseY - cy) / 15 : 0;
    parallaxX += (targetParallaxX - parallaxX) * 0.1;
    parallaxY += (targetParallaxY - parallaxY) * 0.1;

    // 3. Update 3D Rotation Angles
    let targetRx = 0;
    let targetRy = 0;
    if (isHovered) {
      targetRx = -((mouseY - cy) / ph) * 0.65;
      targetRy = ((mouseX - cx) / pw) * 0.65;
    } else {
      targetRx = 0.05 * Math.sin(t * 0.7);
      targetRy = 0.14 * Math.sin(t * 0.4);
    }
    rx += (targetRx - rx) * 0.08;
    ry += (targetRy - ry) * 0.08;

    // 4. Smooth accumulated scan line progress
    scanProgress += (1.5 + 2.0 * hoverProgress) * dt * 60;

    drawBase();
    drawGlowBackdrop();
    drawDataStreams();
    drawPixelParticles();
    drawPhoto();
    drawBorder();
    drawCornerBrackets();
    drawScanBar();
    drawOrbitals();
    drawFloatingBadges();
    drawHUDLabels();

    requestAnimationFrame(render);
  }

  // ---------- Trigger Image Loading (after all canvas variables are initialized) ----------
  realImg.onload = () => {
    realLoaded = true;
    if (fallback) fallback.style.display = 'none';
    buildPixelData();
  };
  cyberImg.onload = () => {
    cyberLoaded = true;
    buildPixelData();
  };

  realImg.src = photoSrc;
  cyberImg.src = cyberSrc;

  if (realImg.complete) {
    realLoaded = true;
    if (fallback) fallback.style.display = 'none';
    buildPixelData();
  }
  if (cyberImg.complete) {
    cyberLoaded = true;
    buildPixelData();
  }

  requestAnimationFrame(render);
}
