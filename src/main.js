import { createIcons, icons } from 'lucide';
import confetti from 'canvas-confetti';
import { initHeroAnimation } from './hero-animation.js';
import mahidharPhotoUrl from './assets/images/mahidhar_photo.png';
import mahidharCyberUrl from './assets/images/mahidhar_cyber_avatar.png';

// Initialize Lucide Icons
createIcons({ icons });

// Initialize Cinematic Hero Animation immediately (doesn't need DOM ready)
initHeroAnimation(
  'hero-cinematic-wrapper',
  mahidharPhotoUrl,
  mahidharCyberUrl
);

// Main Initialization (runs immediately because script is loaded as a defer/module)
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpened = navLinks.classList.contains('mobile-open');
      mobileToggle.innerHTML = isOpened 
        ? `<i data-lucide="x"></i>` 
        : `<i data-lucide="menu"></i>`;
      createIcons({ icons });
    });

    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileToggle.innerHTML = `<i data-lucide="menu"></i>`;
        createIcons({ icons });
      });
    });
  }

  // Scroll Navbar effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Typewriter Effect
  const typewriterElement = document.getElementById('typewriter');
  const words = [
    "Senior Java Developer",
    "AI Agentic Workflows Engineer",
    "AWS Certified Solutions Architect",
    "MCP & RAG Systems Builder",
    "DevOps & Automation Specialist"
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      // Pause at full word
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500; // Pause before next word
    }

    setTimeout(type, typeSpeed);
  }

  if (typewriterElement) {
    type();
  }

  // Particles Canvas Background
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  const numberOfParticles = 80;
  let mouse = { x: null, y: null, radius: 120 };

  // Set canvas size
  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  setCanvasSize();
  window.addEventListener('resize', () => {
    setCanvasSize();
    initParticles();
  });

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      // Check boundaries
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Check mouse collision / push effect
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius + this.size) {
        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
          this.x += 2;
        }
        if (mouse.x > this.x && this.x > this.size * 10) {
          this.x -= 2;
        }
        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
          this.y += 2;
        }
        if (mouse.y > this.y && this.y > this.size * 10) {
          this.y -= 2;
        }
      }

      // Move particle
      this.x += this.directionX;
      this.y += this.directionY;
      this.draw();
    }
  }

  function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      let size = Math.random() * 2 + 1;
      let x = Math.random() * (canvas.width - size * 2) + size;
      let y = Math.random() * (canvas.height - size * 2) + size;
      let directionX = (Math.random() * 0.4) - 0.2;
      let directionY = (Math.random() * 0.4) - 0.2;
      
      // Theme matching colors (cyan / purple / dark grey)
      let color = 'rgba(0, 242, 254, 0.15)';
      if (Math.random() > 0.6) {
        color = 'rgba(185, 39, 252, 0.15)';
      } else if (Math.random() > 0.8) {
        color = 'rgba(0, 255, 135, 0.15)';
      }
      
      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          opacityValue = 1 - (distance / 120);
          ctx.strokeStyle = `rgba(0, 242, 254, ${opacityValue * 0.08})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connectParticles();
  }

  initParticles();
  animateParticles();

  // Scroll Reveal System
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-fade');
    console.log(`[SCROLL REVEAL] Found ${revealElements.length} elements to reveal.`);
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Activate skill level bars
          if (entry.target.id === 'skills') {
            const bars = entry.target.querySelectorAll('.skill-level span');
            bars.forEach(bar => {
              const width = bar.style.width;
              bar.style.width = '0';
              setTimeout(() => { bar.style.width = width; }, 100);
            });
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Fallback scroll listener to guarantee reveal class is added if IntersectionObserver is delayed or fails
    function revealOnScroll() {
      revealElements.forEach(el => {
        if (el.classList.contains('revealed')) return;
        const rect = el.getBoundingClientRect();
        // If element is partially inside the viewport
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          el.classList.add('revealed');
          if (el.id === 'skills') {
            const bars = el.querySelectorAll('.skill-level span');
            bars.forEach(bar => {
              const width = bar.style.width;
              bar.style.width = '0';
              setTimeout(() => { bar.style.width = width; }, 100);
            });
          }
        }
      });
    }
    window.addEventListener('scroll', revealOnScroll);
    // Run once immediately
    revealOnScroll();
  }
  
  // Run scroll reveal setup after a short delay to ensure DOM parsing is fully complete
  setTimeout(initScrollReveal, 50);

  // Skills Grid Filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active class
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');

      skillCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'block';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  // Tooltip descriptions for skills on click
  skillCards.forEach(card => {
    card.addEventListener('click', () => {
      const desc = card.getAttribute('data-description');
      if (desc) {
        // Simple visual notification
        const activeToast = document.querySelector('.skill-toast');
        if (activeToast) activeToast.remove();

        const toast = document.createElement('div');
        toast.className = 'skill-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = 'rgba(12, 15, 23, 0.95)';
        toast.style.border = '1px solid var(--accent-cyan)';
        toast.style.color = '#fff';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '10px';
        toast.style.zIndex = '1000';
        toast.style.fontFamily = 'var(--font-sans)';
        toast.style.boxShadow = '0 10px 30px rgba(0, 242, 254, 0.2)';
        toast.innerHTML = `<strong>${card.querySelector('h4').innerText}:</strong> ${desc}`;
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(10px)';
          toast.style.transition = 'all 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }, 4000);
      }
    });
  });

  // Job Timeline Accordion Toggle
  const toggleButtons = document.querySelectorAll('.btn-detail-toggle');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.timeline-card');
      const details = card.querySelector('.timeline-details');
      const isExpanded = btn.classList.toggle('active');
      
      if (isExpanded) {
        btn.innerHTML = `Hide Details <i data-lucide="chevron-down"></i>`;
        details.style.maxHeight = details.scrollHeight + 'px';
      } else {
        btn.innerHTML = `View Details <i data-lucide="chevron-down"></i>`;
        details.style.maxHeight = '0';
      }
      createIcons({ icons });
    });
  });

  // 3D Card Hover Effect for Certifications & Bio Cards
  const cards3D = document.querySelectorAll('.cert-card, .bio-card, .ai-card');
  cards3D.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (centerY - y) / 15;
      const rotateY = (x - centerX) / 15;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      
      // Move glow radial gradient if it exists
      const glow = card.querySelector('.cert-glow, .card-glow');
      if (glow) {
        glow.style.transform = `translate(${x - 150}px, ${y - 150}px)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // Interactive DevOps Terminal Simulator
  const terminalBody = document.getElementById('terminal-body');
  const cmdButtons = document.querySelectorAll('.terminal-cmd-btn');
  let isRunningCommand = false;

  const logs = {
    'mvn-deploy': [
      { text: 'mvn clean install', isInput: true },
      { text: '[INFO] Scanning for projects...', isOutput: true, color: 'text-muted' },
      { text: '[INFO] Building microservice-api 1.0.0-SNAPSHOT', isOutput: true },
      { text: '[INFO] --- maven-compiler-plugin: compile ---', isOutput: true },
      { text: '[INFO] Compiling 24 Java source files to target/classes', isOutput: true },
      { text: '[INFO] --- maven-surefire-plugin: test ---', isOutput: true },
      { text: '[INFO] Running com.mahidhar.api.ServiceSpec (Spock Tests)', isOutput: true },
      { text: '[INFO] Tests run: 42, Failures: 0, Errors: 0, Skipped: 0', isOutput: true, color: 'text-green' },
      { text: '[INFO] Quality check: Spock unit test coverage = 84% (Requirement: >80%)', isOutput: true, color: 'text-cyan' },
      { text: '[INFO] --- dockerfile-maven-plugin: build ---', isOutput: true },
      { text: '[INFO] Building docker image: mahidhardurga/microservice-api:latest', isOutput: true },
      { text: '[INFO] Successfully built image mahidhardurga/microservice-api:latest', isOutput: true, color: 'text-green' },
      { text: '[INFO] BUILD SUCCESS (12.4 seconds)', isOutput: true, color: 'text-cyan' }
    ],
    'tf-apply': [
      { text: 'terraform apply -auto-approve', isInput: true },
      { text: 'Terraform v1.7.0', isOutput: true, color: 'text-muted' },
      { text: 'Initializing provider plugins...', isOutput: true },
      { text: '- Finding hashicorp/aws versions >= 4.0.0...', isOutput: true },
      { text: 'Applying infrastructure changes...', isOutput: true, color: 'text-cyan' },
      { text: 'aws_rds_cluster.aurora_postgres: Creating...', isOutput: true },
      { text: 'aws_ecs_task_definition.service_task: Creating...', isOutput: true },
      { text: 'aws_rds_cluster.aurora_postgres: Still creating... (10s elapsed)', isOutput: true },
      { text: 'aws_rds_cluster.aurora_postgres: Creation complete [id=mahidhar-postgres-cluster]', isOutput: true, color: 'text-green' },
      { text: 'aws_ecs_service.microservice_service: Creating...', isOutput: true },
      { text: 'aws_ecs_service.microservice_service: Creation complete [id=arn:aws:ecs:us-east-1:1234:service/api]', isOutput: true, color: 'text-green' },
      { text: 'Apply complete! Resources: 3 added, 0 changed, 0 destroyed.', isOutput: true, color: 'text-cyan' }
    ],
    'db-migrate': [
      { text: 'migrate-db --from db2 --to postgres', isInput: true },
      { text: 'Scanning application configurations...', isOutput: true },
      { text: 'Found MyBatis XML configuration with 14 legacy IBM DB2 queries.', isOutput: true, color: 'text-cyan' },
      { text: 'Remediating DB2 SQL syntax anomalies to PostgreSQL standard...', isOutput: true },
      { text: ' -> Remediation: FETCH FIRST 10 ROWS ONLY -> LIMIT 10 [SUCCESS]', isOutput: true, color: 'text-green' },
      { text: ' -> Remediation: CURRENT TIMESTAMP -> CURRENT_TIMESTAMP [SUCCESS]', isOutput: true, color: 'text-green' },
      { text: 'Establishing SSL tunnel to AWS Aurora PostgreSQL cluster...', isOutput: true },
      { text: 'Migrating DB tables & exporting datasets...', isOutput: true },
      { text: 'Exported 4.2 million rows from legacy db.', isOutput: true, color: 'text-green' },
      { text: 'Data migration verification progress: [████████████████████] 100%', isOutput: true, color: 'text-cyan' },
      { text: 'Verifying row counts & checksums: HASH MATCHED!', isOutput: true, color: 'text-green' },
      { text: 'Database migration complete!', isOutput: true, color: 'text-cyan' }
    ],
    'grpc-test': [
      { text: 'grpc_cli call blockchain-gateway:50051 blockchain.WalletService.GetBalance "wallet_address: \'0xMahidhar\'"', isInput: true },
      { text: 'Connecting to blockchain-gateway:50051...', isOutput: true },
      { text: 'Sending client request payload: { wallet_address: "0xMahidhar" }', isOutput: true },
      { text: 'Receiving response from Polygon RPC Node (gRPC call):', isOutput: true, color: 'text-cyan' },
      { text: '{\n  "wallet_address": "0xMahidhar",\n  "balances": [\n    { "token": "MATIC", "amount": "12450.45" },\n    { "token": "USDT", "amount": "500.00" }\n  ],\n  "block_height": 58249012,\n  "latency_ms": 12\n}', isOutput: true, color: 'text-green' }
    ],
    'ai-agent': [
      { text: 'run-ai-agent --task compile', isInput: true },
      { text: '[AI Agent] Initializing autonomous self-healing compilation agent...', isOutput: true, color: 'text-cyan' },
      { text: '[AI Agent] Target repository: spring-boot-microservice-app', isOutput: true },
      { text: '[AI Agent] Command: Executing "mvn clean compile"...', isOutput: true },
      { text: '[SYSTEM] Compilation Failed (Exit Code 1)', isOutput: true, color: 'text-muted' },
      { text: '[SYSTEM] Error: /src/UserServiceImpl.java:[42,28] error: cannot find symbol\n  symbol:   variable StringUtils\n  location: class UserServiceImpl', isOutput: true, color: 'text-muted' },
      { text: '[AI Agent] Analysis: Compilation failed due to unresolved symbol "StringUtils" on line 42.', isOutput: true, color: 'text-cyan' },
      { text: '[AI Agent] Resolution: Missing import "org.apache.commons.lang3.StringUtils" in UserServiceImpl.java.', isOutput: true, color: 'text-cyan' },
      { text: '[AI Agent] Action: Applying source code remediation patch to UserServiceImpl.java...', isOutput: true },
      { text: '[AI Agent] Patch Applied: +import org.apache.commons.lang3.StringUtils;', isOutput: true, color: 'text-green' },
      { text: '[AI Agent] Command: Re-executing "mvn clean compile"...', isOutput: true },
      { text: '[SYSTEM] Remediating warnings... Success.', isOutput: true },
      { text: '[SYSTEM] BUILD SUCCESS (Zero compilation errors)', isOutput: true, color: 'text-green' },
      { text: '[AI Agent] Self-healing loop completed successfully. 1 issue resolved.', isOutput: true, color: 'text-cyan' }
    ]
  };

  async function executeCommand(cmdKey) {
    if (isRunningCommand) return;
    isRunningCommand = true;

    const commandLines = logs[cmdKey];
    terminalBody.innerHTML = ''; // Clear terminal

    for (let i = 0; i < commandLines.length; i++) {
      const line = commandLines[i];
      const lineEl = document.createElement('div');
      lineEl.className = 'terminal-line';

      if (line.isInput) {
        lineEl.innerHTML = `<span class="term-prompt">mahidhar@cloud-terminal:~$</span> <span class="term-input-text"></span>`;
        terminalBody.appendChild(lineEl);
        
        // Type input text letter by letter
        const textSpan = lineEl.querySelector('.term-input-text');
        for (let char of line.text) {
          textSpan.textContent += char;
          await new Promise(r => setTimeout(r, 40));
        }
      } else {
        lineEl.classList.add('output-line');
        if (line.color) {
          if (line.color === 'text-green') lineEl.style.color = 'var(--accent-green)';
          else if (line.color === 'text-cyan') lineEl.style.color = 'var(--accent-cyan)';
          else if (line.color === 'text-muted') lineEl.style.color = 'var(--text-muted)';
        }
        
        lineEl.textContent = line.text;
        terminalBody.appendChild(lineEl);
        
        // Add tiny delay for output scrolling
        await new Promise(r => setTimeout(r, Math.random() * 200 + 100));
      }

      // Scroll terminal to bottom
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Add trailing input prompt line
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line';
    promptLine.innerHTML = `<span class="term-prompt">mahidhar@cloud-terminal:~$</span> <span class="term-input-cursor"></span>`;
    terminalBody.appendChild(promptLine);
    terminalBody.scrollTop = terminalBody.scrollHeight;

    isRunningCommand = false;
  }

  cmdButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunningCommand) return;
      cmdButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cmdKey = btn.getAttribute('data-cmd');
      executeCommand(cmdKey);
    });
  });

  // Start with default command
  executeCommand('mvn-deploy');

  // Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('btn-submit-form');

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Put submit button into loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Deploying Message...</span> <span class="term-input-cursor"></span>`;

      // Simulate deployment delay
      setTimeout(() => {
        // Trigger celebratory confetti burst
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#b927fc', '#00ff87']
        });

        // Set success state
        submitBtn.innerHTML = `<span>Message Deployed!</span> <i data-lucide="check"></i>`;
        submitBtn.style.background = 'rgba(0, 255, 135, 0.2)';
        submitBtn.style.color = '#fff';
        submitBtn.style.borderColor = 'var(--accent-green)';
        createIcons({ icons });

        // Reset form inputs
        contactForm.reset();

        // Restore button state after 3 seconds
        setTimeout(() => {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.color = '';
          submitBtn.style.borderColor = '';
          createIcons({ icons });
        }, 3000);

      }, 1800);
    });
  }

  // Note: Portrait matrix canvas animation has been replaced by the
  // full-width cinematic canvas in hero-animation.js (initHeroAnimation)
