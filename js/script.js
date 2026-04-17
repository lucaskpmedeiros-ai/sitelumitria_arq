/* ============================================================
   LUMITRIA — script.js
   Vanilla JS puro, sem dependências externas.
   Funciona abrindo index.html diretamente no navegador.
   ============================================================ */

'use strict';

/* ============================================================
   1. HEADER — sombra e fundo ao rolar
   ============================================================ */
(function () {
  var header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}());


/* ============================================================
   2. MENU MOBILE
   ============================================================ */
(function () {
  var hamburger = document.getElementById('hamburger');
  var nav       = document.getElementById('nav');
  if (!hamburger || !nav) return;

  /* Overlay escuro atrás do menu */
  var overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:98',
    'background:rgba(0,0,0,0.52)',
    'backdrop-filter:blur(4px)',
    '-webkit-backdrop-filter:blur(4px)',
    'display:none', 'opacity:0',
    'transition:opacity 0.3s ease'
  ].join(';');
  document.body.appendChild(overlay);

  function openMenu() {
    hamburger.classList.add('open');
    nav.classList.add('open');
    overlay.style.display = 'block';
    requestAnimationFrame(function () { overlay.style.opacity = '1'; });
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    overlay.style.opacity = '0';
    setTimeout(function () { overlay.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (nav.classList.contains('open')) { closeMenu(); } else { openMenu(); }
  });

  overlay.addEventListener('click', closeMenu);

  nav.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
}());


/* ============================================================
   3. SMOOTH SCROLL — âncoras internas
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var id     = this.getAttribute('href');
    var target = document.querySelector(id);
    if (!target || id === '#') return;

    e.preventDefault();
    var headerH = (document.getElementById('header') || {}).offsetHeight || 70;
    var top     = target.getBoundingClientRect().top + window.scrollY - headerH;

    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});


/* ============================================================
   4. SCROLL REVEAL — animar elementos ao entrar na viewport
   ============================================================ */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    /* Fallback: mostrar tudo imediatamente */
    items.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      /* Escalonar irmãos com classe .reveal no mesmo pai */
      var siblings = Array.from(entry.target.parentNode.querySelectorAll('.reveal'));
      var idx      = siblings.indexOf(entry.target);
      var delay    = idx * 80;

      setTimeout(function () {
        entry.target.classList.add('visible');
      }, delay);

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  items.forEach(function (el) { observer.observe(el); });
}());


/* ============================================================
   5. CONTADOR ANIMADO — data-target + data-suffix
   ============================================================ */
(function () {
  var counters = document.querySelectorAll('.counter');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    var target   = parseInt(el.getAttribute('data-target'), 10);
    var suffix   = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var start    = null;

    function step(ts) {
      if (!start) start = ts;
      var elapsed  = ts - start;
      var progress = Math.min(elapsed / duration, 1);
      var value    = Math.round(target * easeOutCubic(progress));

      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(function (c) { observer.observe(c); });
}());


/* ============================================================
   6. NAV LINK ATIVO — destaca seção visível
   ============================================================ */
(function () {
  var sections  = document.querySelectorAll('section[id]');
  var navLinks  = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(function (s) { observer.observe(s); });
}());


/* ============================================================
   7. PARALLAX SUAVE — hero visual em desktop
   ============================================================ */
(function () {
  var hero  = document.getElementById('hero');
  var pills = document.querySelectorAll('.float-pill');
  if (!hero || !pills.length) return;

  /* Apenas em telas maiores */
  if (window.innerWidth < 900) return;

  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    var cx   = (e.clientX - rect.left  - rect.width  / 2) / rect.width;
    var cy   = (e.clientY - rect.top   - rect.height / 2) / rect.height;

    pills.forEach(function (pill, i) {
      var depth = (i + 1) * 7;
      /* A animação CSS float-a/b continua no transform base; precisamos somar */
      pill.style.marginLeft = (cx * depth) + 'px';
      pill.style.marginTop  = (cy * depth) + 'px';
    });
  }, { passive: true });

  hero.addEventListener('mouseleave', function () {
    pills.forEach(function (pill) {
      pill.style.marginLeft = '';
      pill.style.marginTop  = '';
    });
  });
}());


/* ============================================================
   8. FORMULÁRIO DE CONTATO — feedback visual
   ============================================================ */
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Validação básica */
    var name  = form.querySelector('#name');
    var email = form.querySelector('#email');

    if (name  && !name.value.trim())  { name.focus();  return; }
    if (email && !email.value.trim()) { email.focus(); return; }

    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled    = true;
    submitBtn.style.opacity = '0.7';

    var company = form.querySelector('#company');
    var message = form.querySelector('#message');

    fetch('https://formsubmit.co/ajax/lucaskpmedeiros@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        Nome:     name.value.trim(),
        Email:    email.value.trim(),
        Empresa:  company  ? company.value.trim()  : '',
        Mensagem: message  ? message.value.trim()  : '',
        _subject: 'Nova mensagem — Lumitria'
      })
    })
    .then(function (res) { return res.json(); })
    .then(function () {
      submitBtn.textContent      = 'Mensagem enviada! ✓';
      submitBtn.style.opacity    = '1';
      submitBtn.style.background = 'linear-gradient(135deg,#0A7A42,#085C30)';
      setTimeout(function () {
        submitBtn.textContent      = originalText;
        submitBtn.disabled         = false;
        submitBtn.style.opacity    = '';
        submitBtn.style.background = '';
        form.reset();
      }, 3200);
    })
    .catch(function () {
      submitBtn.textContent      = 'Erro ao enviar. Tente novamente.';
      submitBtn.style.background = 'linear-gradient(135deg,#7A0A0A,#5C0808)';
      submitBtn.style.opacity    = '1';
      setTimeout(function () {
        submitBtn.textContent      = originalText;
        submitBtn.disabled         = false;
        submitBtn.style.opacity    = '';
        submitBtn.style.background = '';
      }, 3000);
    });
  });
}());


/* ============================================================
   9. GALAXY CANVAS — deep space foto-realista
   ============================================================ */
(function () {
  var canvas = document.getElementById('galaxyCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf;

  /* Mouse — normalizado -1..1, lerp suave */
  var mouse = { tx: 0, ty: 0, cx: 0, cy: 0 };

  /* Deslocamento máximo por camada: 0=fundo, 1=meio, 2=frente */
  var PARALLAX = [5, 15, 28];

  var stars        = [];  /* todas as estrelas */
  var galaxyShapes = [];  /* galáxias alongadas + nebulosas difusas */

  /* Cometas */
  var comets = [];
  var COMET_MIN = 5, COMET_MAX = 12, nextComet = 0;

  /* ── utilitários ── */
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Paleta fiel à foto: branco frio, azul-branco, laranja, amarelo-quente */
  function pickColor(bright) {
    var r = Math.random();
    if (bright) {
      if (r < 0.30) return [160, 200, 255]; /* azul-branco */
      if (r < 0.52) return [255, 215, 140]; /* dourado      */
      if (r < 0.68) return [255, 175, 100]; /* laranja      */
      if (r < 0.82) return [200, 230, 255]; /* azul claro   */
      return               [248, 248, 255]; /* branco puro  */
    }
    if (r < 0.68) return [230, 238, 255]; /* branco frio  */
    if (r < 0.84) return [195, 218, 255]; /* azul pálido  */
    if (r < 0.93) return [255, 232, 200]; /* quente pálido*/
    return               [175, 200, 255]; /* azul médio   */
  }

  /* ── construção das estrelas ── */
  function buildStars() {
    stars = [];

    /* Camada 0 — fundo muito denso, estrelas minúsculas */
    for (var i = 0; i < 520; i++) {
      var c = pickColor(false);
      stars.push({
        x: rnd(0, W), y: rnd(0, H),
        r: rnd(0.15, 0.52),
        cr: c[0], cg: c[1], cb: c[2],
        baseA: rnd(0.08, 0.36),
        twk: rnd(0.002, 0.009), ph: rnd(0, Math.PI * 2),
        spd: rnd(0.003, 0.010), ang: rnd(0, Math.PI * 2),
        layer: 0, glow: false, spikes: false,
      });
    }

    /* Camada 1 — estrelas médias com variação de cor */
    for (var i = 0; i < 180; i++) {
      var c = pickColor(false);
      var big = Math.random() > 0.82;
      stars.push({
        x: rnd(0, W), y: rnd(0, H),
        r: big ? rnd(0.9, 1.35) : rnd(0.40, 0.88),
        cr: c[0], cg: c[1], cb: c[2],
        baseA: rnd(0.18, 0.64),
        twk: rnd(0.003, 0.012), ph: rnd(0, Math.PI * 2),
        spd: rnd(0.007, 0.020), ang: rnd(0, Math.PI * 2),
        layer: 1, glow: big, spikes: false,
      });
    }

    /* Camada 2 — estrelas brilhantes accent com glow e spikes */
    for (var i = 0; i < 32; i++) {
      var c   = pickColor(true);
      var big = i < 6;                  /* as 6 primeiras são as "estrelas-ancoras" */
      stars.push({
        x: rnd(0, W), y: rnd(0, H),
        r: big ? rnd(1.5, 2.8) : rnd(0.9, 1.55),
        cr: c[0], cg: c[1], cb: c[2],
        baseA: rnd(0.55, 0.92),
        twk: rnd(0.004, 0.013), ph: rnd(0, Math.PI * 2),
        spd: rnd(0.012, 0.038), ang: rnd(0, Math.PI * 2),
        layer: 2, glow: true, spikes: big,
        spikeAng: rnd(0, Math.PI / 4),  /* rotação aleatória dos spikes */
      });
    }
  }

  /* ── galáxias e manchas difusas ── */
  function buildGalaxies() {
    galaxyShapes = [];

    /* Galáxias edge-on (elongadas como na foto) */
    var edgeData = [
      { x: 0.18, y: 0.22, rw: 52, rh: 6,  ang: -18 },
      { x: 0.62, y: 0.68, rw: 38, rh: 5,  ang:  12 },
      { x: 0.84, y: 0.35, rw: 30, rh: 4,  ang: -28 },
      { x: 0.40, y: 0.82, rw: 42, rh: 5,  ang:   5 },
    ];
    edgeData.forEach(function (d) {
      galaxyShapes.push({
        type: 'edge',
        x: d.x, y: d.y,
        rw: d.rw, rh: d.rh,
        ang: d.ang * (Math.PI / 180),
        a: rnd(0.10, 0.20),
        layer: Math.random() > 0.5 ? 0 : 1,
      });
    });

    /* Manchas redondas (galáxias face-on / aglomerados) */
    for (var i = 0; i < 5; i++) {
      galaxyShapes.push({
        type: 'round',
        x: rnd(0.05, 0.93), y: rnd(0.05, 0.93),
        r: rnd(7, 20),
        a: rnd(0.06, 0.13),
        layer: 0,
      });
    }
  }

  /* ── desenho das galáxias ── */
  function drawGalaxies() {
    galaxyShapes.forEach(function (g) {
      var ox = mouse.cx * PARALLAX[g.layer];
      var oy = mouse.cy * PARALLAX[g.layer];

      ctx.save();
      if (g.type === 'edge') {
        var cx = g.x * W + ox, cy = g.y * H + oy;
        ctx.translate(cx, cy);
        ctx.rotate(g.ang);
        ctx.scale(1, g.rh / g.rw);
        var gr = ctx.createRadialGradient(0, 0, 0, 0, 0, g.rw);
        gr.addColorStop(0,    'rgba(215,222,240,' + g.a + ')');
        gr.addColorStop(0.28, 'rgba(210,218,238,' + (g.a * 0.55) + ')');
        gr.addColorStop(0.65, 'rgba(200,210,232,' + (g.a * 0.20) + ')');
        gr.addColorStop(1,    'rgba(190,205,228,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(0, 0, g.rw, 0, Math.PI * 2);
        ctx.fill();
      } else {
        var cx = g.x * W + ox, cy = g.y * H + oy;
        var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, g.r);
        gr.addColorStop(0,   'rgba(218,225,245,' + g.a + ')');
        gr.addColorStop(0.5, 'rgba(210,218,240,' + (g.a * 0.4) + ')');
        gr.addColorStop(1,   'rgba(200,212,235,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(cx, cy, g.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  /* ── desenho das estrelas ── */
  function drawStars(t) {
    stars.forEach(function (s) {
      var twinkle = 0.5 + 0.5 * Math.sin(t * s.twk * 60 + s.ph);
      var alpha   = s.baseA * (0.50 + 0.50 * twinkle);
      var ox      = mouse.cx * PARALLAX[s.layer];
      var oy      = mouse.cy * PARALLAX[s.layer];
      var rx      = s.x + ox;
      var ry      = s.y + oy;

      /* Glow externo */
      if (s.glow) {
        var glowR = s.r * (s.spikes ? 6.0 : 3.8);
        var gr    = ctx.createRadialGradient(rx, ry, 0, rx, ry, glowR);
        var ga    = alpha * (s.spikes ? 0.28 : 0.16);
        gr.addColorStop(0, 'rgba(' + s.cr + ',' + s.cg + ',' + s.cb + ',' + ga + ')');
        gr.addColorStop(1, 'rgba(' + s.cr + ',' + s.cg + ',' + s.cb + ',0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle   = gr;
        ctx.beginPath();
        ctx.arc(rx, ry, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Spikes de difração (estrelas mais brilhantes) */
      if (s.spikes) {
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(s.spikeAng);
        [0, Math.PI / 2].forEach(function (baseAng) {
          var len = s.r * 9;
          var gs  = ctx.createLinearGradient(
            -Math.cos(baseAng) * len, -Math.sin(baseAng) * len,
             Math.cos(baseAng) * len,  Math.sin(baseAng) * len
          );
          gs.addColorStop(0,   'rgba(' + s.cr + ',' + s.cg + ',' + s.cb + ',0)');
          gs.addColorStop(0.5, 'rgba(' + s.cr + ',' + s.cg + ',' + s.cb + ',' + (alpha * 0.55) + ')');
          gs.addColorStop(1,   'rgba(' + s.cr + ',' + s.cg + ',' + s.cb + ',0)');
          ctx.strokeStyle = gs;
          ctx.lineWidth   = 0.7;
          ctx.lineCap     = 'round';
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.moveTo(-Math.cos(baseAng) * len, -Math.sin(baseAng) * len);
          ctx.lineTo( Math.cos(baseAng) * len,  Math.sin(baseAng) * len);
          ctx.stroke();
        });
        ctx.restore();
      }

      /* Núcleo da estrela */
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = 'rgb(' + s.cr + ',' + s.cg + ',' + s.cb + ')';
      ctx.beginPath();
      ctx.arc(rx, ry, s.r, 0, Math.PI * 2);
      ctx.fill();

      /* Deriva lenta */
      s.x += Math.cos(s.ang) * s.spd;
      s.y += Math.sin(s.ang) * s.spd;
      if (s.x < -2)    s.x = W + 2;
      if (s.x > W + 2) s.x = -2;
      if (s.y < -2)    s.y = H + 2;
      if (s.y > H + 2) s.y = -2;
    });
    ctx.globalAlpha = 1;
  }

  /* ── cometas ── */
  function spawnComet(t) {
    var angle  = rnd(18, 38) * (Math.PI / 180);
    var speed  = rnd(320, 520);
    var length = rnd(120, 220);
    comets.push({
      x: rnd(-W * 0.1, W * 0.5), y: rnd(-20, H * 0.35),
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      len: length, w: rnd(0.8, 1.6), a: rnd(0.55, 0.85),
      born: t,
      life: (length + Math.max(W, H) * 1.4) / speed,
    });
    nextComet = t + rnd(COMET_MIN, COMET_MAX);
  }

  function drawComets(t) {
    if (t >= nextComet && W > 0) spawnComet(t);
    comets = comets.filter(function (c) { return (t - c.born) < c.life; });

    comets.forEach(function (c) {
      var el      = t - c.born;
      var fadeIn  = Math.min(el / 0.15, 1);
      var fadeOut = Math.min((c.life - el) / 0.30, 1);
      var alpha   = c.a * fadeIn * fadeOut;
      if (alpha <= 0) return;

      var x    = c.x + c.vx * el, y = c.y + c.vy * el;
      var ang  = Math.atan2(c.vy, c.vx);
      var tx   = x - Math.cos(ang) * c.len, ty = y - Math.sin(ang) * c.len;
      var grad = ctx.createLinearGradient(tx, ty, x, y);
      grad.addColorStop(0,    'rgba(255,255,255,0)');
      grad.addColorStop(0.65, 'rgba(180,220,255,' + (alpha * 0.3) + ')');
      grad.addColorStop(1,    'rgba(255,255,255,' + alpha + ')');

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = c.w;
      ctx.lineCap     = 'round';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.55;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, c.w * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  /* ── resize ── */
  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
    buildStars();
    buildGalaxies();
  }

  /* ── loop principal ── */
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    var t = ts / 1000;
    mouse.cx += (mouse.tx - mouse.cx) * 0.055;
    mouse.cy += (mouse.ty - mouse.cy) * 0.055;

    ctx.clearRect(0, 0, W, H);
    drawGalaxies();
    drawStars(t);
    drawComets(t);
  }

  /* ── mouse ── */
  var hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouse.ty = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    }, { passive: true });
    hero.addEventListener('mouseleave', function () {
      mouse.tx = 0; mouse.ty = 0;
    }, { passive: true });
  }

  requestAnimationFrame(function () { resize(); raf = requestAnimationFrame(loop); });

  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf); resize(); raf = requestAnimationFrame(loop);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else                 { raf = requestAnimationFrame(loop); }
  });
}());


/* ============================================================
   10. VÍDEO — placeholder play
   ============================================================ */
(function () {
  var placeholder = document.getElementById('videoPlaceholder');
  var video       = document.getElementById('videoPlayer');
  if (!placeholder || !video) return;

  placeholder.addEventListener('click', function () {
    /* Tenta reproduzir; se o arquivo não existir, mantém o placeholder */
    var playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.then(function () {
        /* Vídeo iniciou — esconde o placeholder */
        placeholder.style.transition = 'opacity 0.4s ease';
        placeholder.style.opacity    = '0';
        setTimeout(function () {
          placeholder.style.display = 'none';
        }, 400);
      }).catch(function () {
        /* Sem arquivo de vídeo — mantém o placeholder visível */
      });
    }
  });

  /* Ao pausar, mostra o placeholder novamente */
  video.addEventListener('pause', function () {
    if (video.ended || video.currentTime === 0) return;
    placeholder.style.display  = 'flex';
    placeholder.style.opacity  = '0';
    requestAnimationFrame(function () {
      placeholder.style.transition = 'opacity 0.3s ease';
      placeholder.style.opacity    = '1';
    });
  });
}());


/* ============================================================
   11. HERO ROTATE — rotação suave das frases em destaque
   ============================================================ */
(function () {
  var el = document.getElementById('heroRotate');
  if (!el) return;

  var phrases = [
    'facilita decisões e acelera vendas.',
    'convence clientes antes da obra.',
    'elimina dúvidas antes de construir.',
    'gera confiança no primeiro contato.',
    'transforma visitas em fechamentos.',
    'apresenta projetos de forma única.',
  ];

  var current = 0;

  function rotate() {
    el.classList.add('fade-exit');

    setTimeout(function () {
      current = (current + 1) % phrases.length;
      el.textContent = phrases[current];
      el.classList.remove('fade-exit');
      el.classList.add('fade-enter');
      void el.offsetWidth;
      el.classList.remove('fade-enter');
    }, 1100); /* aguarda a saída terminar */
  }

  /* Pausa longa para dar tempo de ler — troca a cada 7 s */
  setInterval(rotate, 7000);
}());

/* ============================================================
   12. LOGO INTERATIVO — expandir opções ao clicar/hover
   ============================================================ */
(function () {
  var visual = document.getElementById('heroVisual');
  var core   = document.getElementById('logoCore');
  if (!visual || !core) return;

  function open()  { visual.classList.add('active'); }
  function close() { visual.classList.remove('active'); }
  function toggle(){ visual.classList.toggle('active'); }

  /* Desktop: hover no visual-core abre; sair da área inteira fecha */
  core.addEventListener('mouseenter', open);
  visual.addEventListener('mouseleave', close);

  /* Mobile / toque: toque no logo faz toggle */
  core.addEventListener('click', function (e) {
    /* só faz toggle se nenhum card-option foi clicado */
    toggle();
    e.stopPropagation();
  });

  /* Clique fora fecha */
  document.addEventListener('click', close);
  visual.addEventListener('click', function (e) { e.stopPropagation(); });
}());

/* ============================================================
   SHOWCASE — play/pause nos cards ao hover
   ============================================================ */
(function () {
  document.querySelectorAll('.sc-card').forEach(function (card) {
    var video = card.querySelector('.sc-video');
    if (!video) return;

    card.addEventListener('mouseenter', function () {
      video.play();
    });

    card.addEventListener('mouseleave', function () {
      video.pause();
      video.currentTime = 0;
    });
  });
}());
