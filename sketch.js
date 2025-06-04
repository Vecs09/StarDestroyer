let gameState = 'start';
let portada, introImg1, introImg2, introImg3, naveImg, enemigoImg, enemigo2Img, gameOverImg, jefeImg, youwinImg;
let nave;
let bullets = [];
let enemigos = [];
let fireCooldown = 0;
let firing = false;
let puntos = 0;
let vidas = 3;
let nivel = 1;
let topScores = [];
let gameOverTime = 0;
let introStartTime = 0;
let introAlpha = 255;
let introFadeStart = false;
let inputNombre;
let nombreJugador = '';
let jefe = null;
let jefeGolpes = 7;
let jefeMovimiento = 0;
let jefeDir = 'right';
let jefePosiciones;
let jefeDisparoCooldown = 0;
let oleada = 0;
let maxOleadas = 3;
let jefeMostrado = false;
let soundtrack;
let blasterSound;
let bossSound;
let easteregg;
let winSound;


function preload() {
  portada = loadImage('assets/Portada.png');
  introImg1 = loadImage('assets/Level1.png');
  introImg2 = loadImage('assets/Level2.jpg');
  introImg3 = loadImage('assets/Level3.jpg');
  naveImg = loadImage('assets/nave.png');
  enemigoImg = loadImage('assets/enemigo.png');
  enemigo2Img = loadImage('assets/enemigo2.png');
  gameOverImg = loadImage('assets/GAMEOVER.jpg');
  youwinImg = loadImage('assets/YOUWIN.jpg');
  jefeImg = loadImage('assets/finalboss.png');
  soundtrack = loadSound('Soundtrack.mp3');
  blasterSound = loadSound('Blaster.mp3');
  bossSound = loadSound('BlasterBoss.mp3');
  easteregg = loadSound("Easteregg.mp3");
  winSound = loadSound("Win.mp3");


}

function setup() {
  createCanvas(944, 528);
  imageMode(CENTER);
  nave = { x: width / 2, y: height - 60, size: 80, speed: 8 };
  generarEnemigos();
  crearInputNombre();
  jefePosiciones = [
    { x: 472, y: 100 },
    { x: width - 100, y: 100 },
    { x: width - 100, y: 300 },
    { x: 100, y: 300 },
    { x: 100, y: 100 }
  ];
}

function draw() {
  background(0);
  switch (gameState) {
    case 'start': showPortada(); break;
    case 'intro':
    case 'intro2':
    case 'intro3': showIntro(); break;
    case 'play': playGame(); break;
    case 'gameover': showGameOver(); break;
    case 'youwin': showYouWin(); break;
  }
}

function showPortada() {
  image(portada, width / 2, height / 2, width, height);
  mostrarTopScores();
  fill(255);
  textAlign(CENTER);
  textSize(24);
}

function showIntro() {
  let introImg = nivel === 1 ? introImg1 : nivel === 2 ? introImg2 : introImg3;
  tint(255, introAlpha);
  image(introImg, width / 2, height / 2, width, height);
  noTint();
  if (!introFadeStart && millis() - introStartTime > 1000) introFadeStart = true;
  if (introFadeStart) {
    introAlpha -= 5;
    if (introAlpha <= 0) {
      introAlpha = 255;
      introFadeStart = false;
      gameState = 'play';
      generarEnemigos();
    }
  }
}

function keyPressed() {
  if (gameState === 'start' && (key === 'p' || key === 'P')) {
    resetGame();
    introStartTime = millis();
    introAlpha = 255;
    introFadeStart = false;
    gameState = 'intro';
    if (!soundtrack.isPlaying()) {
      soundtrack.loop();
      soundtrack.setVolume(0.2);

    }
  }
  if (key === ' ') firing = true;
  if ((gameState === 'gameover' || gameState === 'youwin') && (key === 'r' || key === 'R')) {
    if (inputNombre.elt.style.display === 'none') {
      resetGame();
      gameState = 'start';
    }
  }
}

function keyReleased() {
  if (key === ' ') firing = false;
}

function playGame() {
  background(10);
  drawCabecera();
  if (keyIsDown(LEFT_ARROW)) nave.x -= nave.speed;
  if (keyIsDown(RIGHT_ARROW)) nave.x += nave.speed;
  nave.x = constrain(nave.x, nave.size / 2, width - nave.size / 2);
  if (firing && fireCooldown <= 0) {
  bullets.push({ x: nave.x, y: nave.y - nave.size / 2 });
  fireCooldown = 10;
  if (blasterSound.isLoaded()) {
    blasterSound.play();
    blasterSound.setVolume(0.2);
  }
}

  if (fireCooldown > 0) fireCooldown--;
  drawNave(nave.x, nave.y);
  updateBullets();
  updateEnemigos();
  updateJefe();
  if (vidas <= 0) {
    gameOverTime = millis();
    gameState = 'gameover';
    inputNombre.show();
    inputNombre.value('');
    inputNombre.elt.focus();
    soundtrack.stop();
  }
}

function drawNave(x, y) {
  image(naveImg, x, y, nave.size, nave.size);
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    if (!b.enemigo) {
      b.y -= 7;
      fill(255, 0, 0);
      noStroke();
      ellipse(b.x, b.y, 10, 10);
      for (let j = enemigos.length - 1; j >= 0; j--) {
        let e = enemigos[j];
        if (dist(b.x, b.y, e.x, e.y) < 30) {
          if (e.resistencia) {
            e.resistencia--;
            if (e.resistencia <= 0) enemigos.splice(j, 1);
          } else enemigos.splice(j, 1);
          bullets.splice(i, 1);
          puntos += 100;
          break;
        }
      }
      if (jefe && dist(b.x, b.y, jefe.x, jefe.y) < 40) {
        jefeGolpes--;
        bullets.splice(i, 1);
        if (jefeGolpes <= 0) {
          jefe = null;
          puntos += 1000;
          gameState = 'youwin';
          inputNombre.show();
          inputNombre.value('');
          inputNombre.elt.focus();
          soundtrack.stop();
          if (winSound.isLoaded()) {
              winSound.play();
              winSound.setVolume(0.5);

  }
        }
      }
      if (b.y < -10) bullets.splice(i, 1);
    } else {
      b.x += b.dx;
      b.y += b.dy;
      fill(0, 255, 255);
      ellipse(b.x, b.y, 8, 8);
      if (dist(b.x, b.y, nave.x, nave.y) < 30) {
        bullets.splice(i, 1);
        vidas--;
      } else if (b.y > height || b.y < 0 || b.x < 0 || b.x > width) bullets.splice(i, 1);
    }
  }
}

function generarEnemigos() {
  enemigos = [];
  if (nivel === 1) {
    for (let i = 0; i < 10; i++) {
      enemigos.push({ x: random(50, width - 50), y: random(-300, -50), speed: random(1, 2), tipo: 'normal' });
    }
  } else if (nivel === 2) {
    for (let i = 0; i < 8; i++) {
      enemigos.push({ x: random(50, width - 50), y: random(-300, -50), speed: random(1, 2), tipo: 'zigzag', dir: 1, fireTimer: int(random(60, 180)) });
    }
    enemigos.push({ x: random(100, width - 100), y: random(-300, -50), speed: 1, tipo: 'resistente', resistencia: 3 });
    enemigos.push({ x: random(100, width - 100), y: random(-300, -50), speed: 1, tipo: 'resistente', resistencia: 3 });
  } else if (nivel === 3) {
    if (oleada < maxOleadas) {
      for (let i = 0; i < 5 + oleada * 2; i++) {
        enemigos.push({ x: random(50, width - 50), y: random(-300, -50), speed: random(1.5, 2), tipo: 'normal', fireTimer: int(random(60, 180)) });
      }
      for (let i = 0; i < 2; i++) {
        enemigos.push({ x: random(50, width - 50), y: random(-300, -50), speed: 1.5, tipo: 'zigzag', dir: 1, fireTimer: int(random(60, 180)) });
      }
      enemigos.push({ x: random(100, width - 100), y: -100, speed: 1, tipo: 'resistente', resistencia: 3, fireTimer: int(random(60, 180)) });
    } else if (!jefeMostrado) {
      jefe = { x: width / 2, y: 100 };
      jefeMostrado = true;
    }
  }
}

function updateEnemigos() {
  for (let i = enemigos.length - 1; i >= 0; i--) {
    let e = enemigos[i];
    if (e.tipo === 'zigzag') e.x += sin(frameCount * 0.1 + i) * 2;
    e.y += e.speed;
    if ((nivel === 2 && e.tipo !== 'resistente') || nivel === 3) {
      if (e.fireTimer !== undefined) {
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          bullets.push({ x: e.x, y: e.y + 30, dx: 0, dy: 5, enemigo: true });
          e.fireTimer = int(random(120, 240));
        }
      }
    }
    let img = e.tipo === 'zigzag' || e.tipo === 'resistente' ? enemigo2Img : enemigoImg;
    image(img, e.x, e.y, 60, 60);
    if (e.y > height || dist(e.x, e.y, nave.x, nave.y) < 40) {
      enemigos.splice(i, 1);
      vidas--;
    }
  }
  if (enemigos.length === 0 && nivel === 3) {
    if (oleada < maxOleadas) {
      oleada++;
      generarEnemigos();
    } else if (!jefeMostrado) {
      generarEnemigos();
    }
  } else if (enemigos.length === 0 && nivel < 3) {
    nivel++;
    gameState = 'intro' + nivel;
    introStartTime = millis();
    introAlpha = 255;
    introFadeStart = false;
  }
}

function updateJefe() {
  if (!jefe) return;
  image(jefeImg, jefe.x, jefe.y, 200, 200);
  let target = jefePosiciones[jefeMovimiento];
  let dx = target.x - jefe.x;
  let dy = target.y - jefe.y;
  let distToTarget = dist(jefe.x, jefe.y, target.x, target.y);
  if (distToTarget > 2) {
    jefe.x += dx * 0.05;
    jefe.y += dy * 0.05;
  } else {
    jefeMovimiento = (jefeMovimiento + 1) % jefePosiciones.length;
    dispararJefe();
  }
}

function dispararJefe() {
  let dirs = [
    { dx: 0, dy: -5 },   
    { dx: 0, dy: 5 },    
    { dx: -5, dy: 0 },   
    { dx: 5, dy: 0 },    
    { dx: -3.5, dy: -3.5 }, 
    { dx: 3.5, dy: -3.5 }, 
    { dx: -3.5, dy: 3.5 }, 
    { dx: 3.5, dy: 3.5 }, 
    { dx: -2.5, dy: -5 },
    { dx: 2.5, dy: -5 },
    { dx: -2.5, dy: 5 },
    { dx: 2.5, dy: 5 },
    { dx: -5, dy: -2.5 },
    { dx: 5, dy: -2.5 },
    { dx: -5, dy: 2.5 },
    { dx: 5, dy: 2.5 }
  ];

  dirs.forEach(d => {
    for (let i = 0; i < 4; i++) {
      bullets.push({ x: jefe.x, y: jefe.y, dx: d.dx, dy: d.dy, enemigo: true });
    }
  });

  if (bossSound.isLoaded()) {
    bossSound.play();
    bossSound.setVolume(2.5);
  }
}



function drawCabecera() {
  fill(255);
  textSize(18);
  textAlign(LEFT);
  text(`Nivel: ${nivel}`, 20, 25);
  text(`Vidas: ${vidas}`, 150, 25);
  text(`Puntos: ${puntos}`, 280, 25);
}

function showGameOver() {
  image(gameOverImg, width / 2, height / 2, width, height);
}

function showYouWin() {
  image(youwinImg, width / 2, height / 2, width, height);
}

function resetGame() {
  vidas =  3;
  puntos = 0;
  nivel = 1;
  nave.x = width / 2;
  bullets = [];
  jefe = null;
  jefeGolpes = 7;
  oleada = 0;
  jefeMostrado = false;
  generarEnemigos();
}

function mostrarTopScores() {
  fill(255);
  textAlign(LEFT);
  textSize(30);
  let startX = 600;
  let startY = 370;
  for (let i = 0; i < topScores.length; i++) {
    text(`${i + 1}.- ${topScores[i].nombre}: ${topScores[i].puntos}`, startX, startY + i * 40);
  }
}
function crearInputNombre() {
  inputNombre = createInput('');
  inputNombre.attribute('maxlength', 4);
  inputNombre.position(width / 2 - 50, height / 2 - 20);
  inputNombre.size(100);
  inputNombre.style('text-align', 'center');
  inputNombre.style('font-size', '20px');
  inputNombre.hide();

  inputNombre.input(() => {
    let valor = inputNombre.value().toUpperCase();

    if (valor === "R2D2" && easteregg.isLoaded()) {
      easteregg.play();
    }

    if (valor.length === 4) {
      nombreJugador = valor;
      topScores.push({ nombre: nombreJugador, puntos: puntos });
      topScores.sort((a, b) => b.puntos - a.puntos);
      topScores = topScores.slice(0, 5);
      inputNombre.hide();
    }
  });
}
