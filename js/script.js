/* ============================================================
   LUMITRIA — script.js
   Vanilla JS puro, sem dependências externas.
   Funciona abrindo index.html diretamente no navegador.
   ============================================================ */

/* Sempre abre no topo — impede restauração de scroll do browser */
if (history.scrollRestoration) { history.scrollRestoration = 'manual'; }
window.scrollTo(0, 0);

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
  var items = Array.from(document.querySelectorAll('.reveal'));
  if (!items.length) return;

  /* 1. Capturar quais elementos já estão visíveis ANTES de esconder qualquer coisa.
        No mobile, scrollTo(0,0) pode ser assíncrono, então getBoundingClientRect()
        ainda reflete a posição restaurada pelo browser (ex: no meio da showcase). */
  var vh = window.innerHeight || document.documentElement.clientHeight;
  var alreadyVisible = items.filter(function (el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh;
  });

  /* 2. Ativar CSS que esconde os .reveal */
  document.documentElement.classList.add('js-ready');

  /* 3. Revelar imediatamente os que já estavam na viewport — sem flicker */
  alreadyVisible.forEach(function (el) { el.classList.add('visible'); });

  if (!('IntersectionObserver' in window)) {
    /* Fallback: mostrar tudo */
    items.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  /* 4. Observer para os demais */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var siblings = Array.from(entry.target.parentNode.querySelectorAll('.reveal'));
      var idx      = siblings.indexOf(entry.target);
      var delay    = idx * 80;

      setTimeout(function () {
        entry.target.classList.add('visible');
      }, delay);

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  items.forEach(function (el) {
    if (!el.classList.contains('visible')) { observer.observe(el); }
  });
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
   9. GALAXY CANVAS — tech deep space
   ============================================================ */
(function () {
  var canvas = document.getElementById('galaxyCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, raf;

  var mouse = { tx: 0, ty: 0, cx: 0, cy: 0 };
  var PARALLAX = [4, 12, 24];

  var stars        = [];
  var nebulas      = [];
  var nodes        = [];   /* bright nodes for connection lines */

  /* Cometas */
  var comets = [];
  var COMET_MIN = 6, COMET_MAX = 14, nextComet = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Paleta tech: cyan brand + azul profundo + roxo */
  function pickColor(bright) {
    var r = Math.random();
    if (bright) {
      if (r < 0.40) return [0, 229, 255];   /* cyan brand      */
      if (r < 0.60) return [100, 200, 255];  /* azul-cyan       */
      if (r < 0.75) return [180, 130, 255];  /* roxo tech       */
      if (r < 0.88) return [200, 240, 255];  /* azul claro      */
      return               [255, 255, 255];  /* branco          */
    }
    if (r < 0.50) return [180, 230, 255];  /* azul pálido      */
    if (r < 0.75) return [140, 200, 240];  /* azul-cinza       */
    if (r < 0.90) return [100, 180, 255];  /* azul médio       */
    return               [200, 200, 255];  /* lilás            */
  }

  /* ── estrelas ── */
  function buildStars() {
    stars = []; nodes = [];

    for (var i = 0; i < 480; i++) {
      var c = pickColor(false);
      stars.push({ x: rnd(0,W), y: rnd(0,H), r: rnd(0.12,0.48),
        cr:c[0],cg:c[1],cb:c[2], baseA:rnd(0.06,0.32),
        twk:rnd(0.002,0.009), ph:rnd(0,Math.PI*2),
        spd:rnd(0.002,0.008), ang:rnd(0,Math.PI*2),
        layer:0, glow:false, spikes:false });
    }
    for (var i = 0; i < 160; i++) {
      var c = pickColor(false); var big = Math.random()>0.80;
      stars.push({ x:rnd(0,W), y:rnd(0,H), r: big?rnd(0.8,1.3):rnd(0.35,0.80),
        cr:c[0],cg:c[1],cb:c[2], baseA:rnd(0.18,0.60),
        twk:rnd(0.003,0.011), ph:rnd(0,Math.PI*2),
        spd:rnd(0.006,0.018), ang:rnd(0,Math.PI*2),
        layer:1, glow:big, spikes:false });
    }
    for (var i = 0; i < 28; i++) {
      var c = pickColor(true); var big = i < 5;
      var s = { x:rnd(0,W), y:rnd(0,H), r: big?rnd(1.4,2.6):rnd(0.9,1.5),
        cr:c[0],cg:c[1],cb:c[2], baseA:rnd(0.55,0.92),
        twk:rnd(0.004,0.013), ph:rnd(0,Math.PI*2),
        spd:rnd(0.010,0.030), ang:rnd(0,Math.PI*2),
        layer:2, glow:true, spikes:big, spikeAng:rnd(0,Math.PI/4) };
      stars.push(s);
      nodes.push(s); /* cyan nodes for connections */
    }
  }

  /* ── nebulosas panorâmicas em camadas de profundidade ── */
  function buildNebulas() {
    nebulas = [];
    /* Camada fundo — nebulosa grande roxo-azul, cria horizonte */
    nebulas.push({ x:0.50, y:0.55, rx:W*0.80, ry:H*0.50, r:60,  g:40,  b:200, a:0.060, layer:0 });
    /* Camada meio — cyan no topo, como aurora */
    nebulas.push({ x:0.50, y:0.10, rx:W*0.65, ry:H*0.38, r:0,   g:180, b:255, a:0.055, layer:0 });
    /* Nuvem esquerda */
    nebulas.push({ x:0.08, y:0.42, rx:W*0.40, ry:H*0.45, r:40,  g:0,   b:180, a:0.048, layer:1 });
    /* Nuvem direita */
    nebulas.push({ x:0.92, y:0.38, rx:W*0.38, ry:H*0.42, r:0,   g:100, b:220, a:0.042, layer:1 });
    /* Glow central brilhante — ponto de fuga */
    nebulas.push({ x:0.50, y:0.45, rx:W*0.22, ry:H*0.22, r:0,   g:229, b:255, a:0.035, layer:2 });
    /* Horizonte inferior escuro */
    nebulas.push({ x:0.50, y:1.05, rx:W*1.20, ry:H*0.30, r:0,   g:0,   b:0,   a:0.70,  layer:0 });
  }

  /* ── desenho nebulosas ── */
  function drawNebulas() {
    nebulas.forEach(function(n) {
      var ox = mouse.cx * PARALLAX[n.layer], oy = mouse.cy * PARALLAX[n.layer];
      var cx = n.x * W + ox, cy = n.y * H + oy;
      var scaleY = n.ry / n.rx;
      ctx.save();
      ctx.scale(1, scaleY);
      var gcx = cx, gcy = cy / scaleY;
      var gr = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, n.rx);
      gr.addColorStop(0,    'rgba('+n.r+','+n.g+','+n.b+','+n.a+')');
      gr.addColorStop(0.38, 'rgba('+n.r+','+n.g+','+n.b+','+(n.a*0.50)+')');
      gr.addColorStop(0.70, 'rgba('+n.r+','+n.g+','+n.b+','+(n.a*0.15)+')');
      gr.addColorStop(1,    'rgba('+n.r+','+n.g+','+n.b+',0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(gcx, gcy, n.rx, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
  }

  /* ── linhas de conexão entre nodes ── */
  function drawConnections(t) {
    var maxDist = W * 0.22;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i+1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = (a.x + mouse.cx*PARALLAX[a.layer]) - (b.x + mouse.cx*PARALLAX[b.layer]);
        var dy = (a.y + mouse.cy*PARALLAX[a.layer]) - (b.y + mouse.cy*PARALLAX[b.layer]);
        var dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < maxDist) {
          var pulse = 0.5 + 0.5 * Math.sin(t * 0.8 + i * 0.7 + j * 0.5);
          var alpha = (1 - dist/maxDist) * 0.12 * pulse;
          ctx.save();
          ctx.strokeStyle = 'rgba(0,229,255,'+alpha+')';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x + mouse.cx*PARALLAX[a.layer], a.y + mouse.cy*PARALLAX[a.layer]);
          ctx.lineTo(b.x + mouse.cx*PARALLAX[b.layer], b.y + mouse.cy*PARALLAX[b.layer]);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
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
      grad.addColorStop(0,    'rgba(0,229,255,0)');
      grad.addColorStop(0.65, 'rgba(0,229,255,' + (alpha * 0.4) + ')');
      grad.addColorStop(1,    'rgba(200,245,255,' + alpha + ')');

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
    buildNebulas();
  }

  /* ── loop principal ── */
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    var t = ts / 1000;
    mouse.cx += (mouse.tx - mouse.cx) * 0.055;
    mouse.cy += (mouse.ty - mouse.cy) * 0.055;

    ctx.clearRect(0, 0, W, H);
    drawNebulas();
    drawConnections(t);
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
    'imaginar.',
    'ver antes de existir.',
    'sentir como seu.',
    'entender de verdade.',
    'percorrer antes de comprar.',
    'visualizar com clareza.',
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
   SHOWCASE — play/pause nos cards
   ============================================================ */
(function () {
  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  document.querySelectorAll('.sc-card').forEach(function (card) {
    var video = card.querySelector('.sc-video');
    if (!video) return;
    var media = card.querySelector('.sc-media');

    if (isTouch) {
      /* Mobile: clique no card toca/pausa o vídeo */
      media.classList.add('touch-video');

      /* Botão de play sobreposto */
      var btn = document.createElement('div');
      btn.className = 'sc-play-btn';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>'
        + '<polygon points="10,8 17,12 10,16" fill="white"/>'
        + '</svg>';
      media.appendChild(btn);

      function syncState() {
        if (video.paused) {
          media.classList.remove('is-playing');
        } else {
          media.classList.add('is-playing');
        }
      }

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (video.paused) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });

      video.addEventListener('play',  syncState);
      video.addEventListener('pause', syncState);

    } else {
      /* Desktop: poster visível em repouso, toca ao passar o mouse */
      card.addEventListener('mouseenter', function () { video.play(); });
      card.addEventListener('mouseleave', function () {
        video.pause();
        video.currentTime = 0;
      });
    }
  });
}());
