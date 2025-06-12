localStorage.clear()

// LOALDING
window.addEventListener("load", function () {
    const loader = document.getElementById("Loalding");

    loader.style.display = "none";
});

// CANVAS MATRIX
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

const palavras = [" Te amo", "Meu amor"];
const fonteSize = 24;
const columnSpacing = 70;
let columns;
let drops;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (canvas.width <= 400) {
        columns = Math.floor(canvas.width / columnSpacing);
    } else {
        columns = Math.floor((canvas.width / columnSpacing) + 1);
    }

    drops = Array(columns).fill(0).map(() => ({
        y: Math.floor(Math.random() * canvas.height),
        active: Math.random() < 1
    }));
}

function Draw() {
    ctx.fillStyle = `rgba(30, 30, 30, 0.10)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#dd0e0e";
    ctx.font = `${fonteSize}px monospace`;

    drops.forEach((drop, i) => {
        if (!drop.active) return;

        const texto = palavras[Math.floor(Math.random() * palavras.length)];
        const x = i * columnSpacing;
        const y = drop.y;

        ctx.fillText(texto, x, y);
        drop.y += fonteSize;

        if (drop.y > canvas.height) {
            drop.y = 0;
        }
    });
}
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
setInterval(Draw, 60);

// PAGE 1 INTERACTIONS
function Click() {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#940d0d';
    ctx.textAlign = 'center';


    document.addEventListener('click', (event) => {
        if (event.target !== canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        ctx.fillText('Te amo!!', x, y + 20);
    });
}

function PageView(id, btn) {
    document.querySelectorAll('section').forEach(sec => {
        sec.classList.remove('active');
    });

    document.getElementById(id).classList.add('active');

    document.querySelectorAll('nav button').forEach(button => {
        button.classList.remove('active-btn');
    });

    if (btn) btn.classList.add('active-btn');
}

// LETTERS INTERACTIONS

let cartas = [];
let index = 1;

async function UploadLetters() {
    try {
        const response = await fetch('./dates.json');
        const Letters = await response.json();
        return Letters;
    } catch (error) {
        console.error('Erro ao carregar JSON', error);
    }
}

async function inicializarCartas() {
    cartas = await UploadLetters();
    if (!cartas) return;

    const container = document.getElementById("ContainerLetters");
    container.innerHTML = "";

    cartas.forEach((carta, i) => {
        const div = document.createElement("div");
        div.className = "carta";
        if (carta.mensagem != "") {
            div.innerHTML = `<h3>${carta.title}</h3>
            <p class="tag">${carta.tag}</p>
            <p class="date">${carta.data}</p>
            <p class="msg">${carta.mensagem}</p>`;
        } else if (carta.imagem != "") {
            div.innerHTML = `<h3>${carta.title}</h3>
            <p class="tag">${carta.tag}</p>
            <p class="date">${carta.data}</p>
            <img src="${carta.imagem}" class="foto"></img>`;
        } else if (carta.id == 0) {
            div.className = "space";
            container.appendChild(div);
        }

        container.appendChild(div);
    });

    atualizarCarrossel();
}

function atualizarCarrossel() {
    const container = document.getElementById("ContainerLetters");
    const cartasDivs = container.children;

    for (let i = 0; i < cartasDivs.length; i++) {
        cartasDivs[i].classList.remove("destaque");
    }

    if (cartasDivs[index]) cartasDivs[index].classList.add("destaque");

    const cartaLargura = 100 + 20; // largura da carta + gap
    const deslocamento = (index - 1) * cartaLargura;
    container.style.transform = `translateX(-${deslocamento}px)`;
}

function moveNext() {
    if (index < cartas.length - 2) {
        index++;
        atualizarCarrossel();
    }
}

function movePrev() {
    if (index > 1) {
        index--;
        atualizarCarrossel();
    }
}

document.addEventListener("DOMContentLoaded", inicializarCartas);

/* Music */
const audio = document.getElementById('audio');
const capaMusic = document.getElementById('Capa');
const NomeMsc = document.getElementById('TrackTitle');
const ArtistMsc = document.getElementById('TrackArtist');
const playBtn = document.getElementById('playBtn');
const progress = document.getElementById('Progress');

let currentSong = 0;
let playlist = [];

async function UploadPlayList() {
    try {
        const getPlayList = await fetch('./songs/songs.json');
        playlist = await getPlayList.json();
        loadSong(currentSong);
    } catch (error) {
        console.error('Erro ao carregar JSON', error);
    }
}

function loadSong(index) {
    const song = playlist[index];
    audio.src = song.musica;
    capaMusic.src = song.capa;
    ArtistMsc.textContent = song.artist;
    NomeMsc.textContent = song.name;
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

function nextSong() {
    currentSong = (currentSong + 1) % playlist.length;
    loadSong(currentSong);
    audio.play();
}

function prevSong() {
    currentSong = (currentSong - 1 + playlist.length) % playlist.length;
    loadSong(currentSong);
    audio.play();
}

audio.addEventListener('ended', nextSong);

audio.addEventListener('timeupdate', () => {
    const value = (audio.currentTime / audio.duration) * 100;
    progress.value = value;
    progress.style.background = `linear-gradient(to right, #4B4B4B ${value}%, #FFF5F5 ${value}%)`;
});

progress.addEventListener('input', () => {
    const value = progress.value;
    audio.currentTime = (value / 100) * audio.duration;
    progress.style.background = `linear-gradient(to right, #4B4B4B ${value}%, #FFF5F5 ${value}%)`;
});

/* 411 x 36.6% */

UploadPlayList();

/* LEAFLET */

function carregarMensagem() {
    fetch('./leaflet/leaflet.json')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o JSON');
            return response.json();
        })
        .then(data => {
            console.log(data);

            const card = data[0];

            const capa = document.getElementById("cardCapa")
            capa.src = card.Capa;

            const contra = document.getElementById("cardContra")
            contra.src = card.contraCapa;

            const title = document.getElementById('Ftitle');
            title.textContent = card.title;

            const text = document.getElementById('Ftext');
            text.textContent = card.text;

            const img = document.getElementById('Fimg');
            img.src = card.img;

        })
        .catch(error => console.error('Erro:', error));
}

window.onload = carregarMensagem;

/* Heart */

let isRunning = false;
let animationFrameId;

const section = document.getElementById("Page5");
const heartCanvas = document.getElementById("pinkboard");

function startHeartAnimation() {
    if (!isRunning) {
        isRunning = true;
        onResize();
        callFunctionHeart(); // Inicia os corações
    }
}

function stopHeartAnimation() {
    if (isRunning) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
        const ctx = heartCanvas.getContext("2d");
        ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    }
}

function onResize() {
    heartCanvas.width = heartCanvas.clientWidth;
    heartCanvas.height = heartCanvas.clientHeight;
}

window.addEventListener("resize", onResize);

const observer = new MutationObserver(() => {
    if (section.classList.contains("active")) {
        startHeartAnimation();
    } else {
        stopHeartAnimation();
    }
});

observer.observe(section, {
    attributes: true,
    attributeFilter: ["class"]
});

function callFunctionHeart() {
    var settings = {
        particles: {
            length: 2000,
            duration: 4,
            velocity: 80,
            effect: -1.3,
            size: 8,
        },
    };
    (function () {
        var b = 0;
        var c = ["ms", "moz", "webkit", "o"];
        for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
            window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
            window.cancelAnimationFrame =
                window[c[a] + "CancelAnimationFrame"] ||
                window[c[a] + "CancelRequestAnimationFrame"];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (h, e) {
                var d = new Date().getTime();
                var f = Math.max(0, 16 - (d - b));
                var g = window.setTimeout(function () {
                    h(d + f);
                }, f);
                b = d + f;
                return g;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (d) {
                clearTimeout(d);
            };
        }
    })();
    var Point = (function () {
        function Point(x, y) {
            this.x = typeof x !== "undefined" ? x : 0;
            this.y = typeof y !== "undefined" ? y : 0;
        }
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        Point.prototype.length = function (length) {
            if (typeof length == "undefined") {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            }
            this.normalize();
            this.x *= length;
            this.y *= length;
            return this;
        };
        Point.prototype.normalize = function () {
            var length = this.length();
            this.x /= length;
            this.y /= length;
            return this;
        };
        return Point;
    })();
    var Particle = (function () {
        function Particle() {
            this.position = new Point();
            this.velocity = new Point();
            this.acceleration = new Point();
            this.age = 0;
        }
        Particle.prototype.initialize = function (x, y, dx, dy) {
            this.position.x = x;
            this.position.y = y;
            this.velocity.x = dx;
            this.velocity.y = dy;
            this.acceleration.x = dx * settings.particles.effect;
            this.acceleration.y = dy * settings.particles.effect;
            this.age = 0;
        };
        Particle.prototype.update = function (deltaTime) {
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.velocity.x += this.acceleration.x * deltaTime;
            this.velocity.y += this.acceleration.y * deltaTime;
            this.age += deltaTime;
        };
        Particle.prototype.draw = function (context, image) {
            function ease(t) {
                return --t * t * t + 1;
            }
            var size = image.width * ease(this.age / settings.particles.duration);
            context.globalAlpha = 1 - this.age / settings.particles.duration;
            context.drawImage(
                image,
                this.position.x - size / 2,
                this.position.y - size / 2,
                size,
                size
            );
        };
        return Particle;
    })();
    var ParticlePool = (function () {
        var particles,
            firstActive = 0,
            firstFree = 0,
            duration = settings.particles.duration;

        function ParticlePool(length) {
            particles = new Array(length);
            for (var i = 0; i < particles.length; i++) {
                particles[i] = new Particle();
            }
        }
        ParticlePool.prototype.add = function (x, y, dx, dy) {
            particles[firstFree].initialize(x, y, dx, dy);
            firstFree++;
            if (firstFree == particles.length) firstFree = 0;
            if (firstActive == firstFree) firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        };
        ParticlePool.prototype.update = function (deltaTime) {
            var i;
            if (firstActive < firstFree) {
                for (i = firstActive; i < firstFree; i++) {
                    particles[i].update(deltaTime);
                }
            }
            if (firstFree < firstActive) {
                for (i = firstActive; i < particles.length; i++) {
                    particles[i].update(deltaTime);
                }
                for (i = 0; i < firstFree; i++) {
                    particles[i].update(deltaTime);
                }
            }
            while (particles[firstActive].age >= duration && firstActive != firstFree) {
                firstActive++;
                if (firstActive == particles.length) firstActive = 0;
            }
        };
        ParticlePool.prototype.draw = function (context, image) {
            if (firstActive < firstFree) {
                for (i = firstActive; i < firstFree; i++) {
                    particles[i].draw(context, image);
                }
            }
            if (firstFree < firstActive) {
                for (i = firstActive; i < particles.length; i++) {
                    particles[i].draw(context, image);
                }
                for (i = 0; i < firstFree; i++) {
                    particles[i].draw(context, image);
                }
            }
        };
        return ParticlePool;
    })();
    (function (canvas) {
        var context = canvas.getContext("2d"),
            particles = new ParticlePool(settings.particles.length),
            particleRate = settings.particles.length / settings.particles.duration,
            time;

        function pointOnHeart(t) {
            return new Point(
                160 * Math.pow(Math.sin(t), 3),
                130 * Math.cos(t) -
                50 * Math.cos(2 * t) -
                20 * Math.cos(3 * t) -
                10 * Math.cos(4 * t) +
                25
            );
        }
        var image = (function () {
            var canvas = document.createElement("canvas"),
                context = canvas.getContext("2d");
            canvas.width = settings.particles.size;
            canvas.height = settings.particles.size;

            function to(t) {
                var point = pointOnHeart(t);
                point.x =
                    settings.particles.size / 2 + (point.x * settings.particles.size) / 350;
                point.y =
                    settings.particles.size / 2 - (point.y * settings.particles.size) / 350;
                return point;
            }
            context.beginPath();
            var t = -Math.PI;
            var point = to(t);
            context.moveTo(point.x, point.y);
            while (t < Math.PI) {
                t += 0.01;
                point = to(t);
                context.lineTo(point.x, point.y);
            }
            context.closePath();
            context.fillStyle = "#f50b02";
            context.fill();
            var image = new Image();
            image.src = canvas.toDataURL();
            return image;
        })();

        function render() {
            if (!isRunning) return; // Para a animação se não estiver ativa

            animationFrameId = requestAnimationFrame(render);

            var newTime = new Date().getTime() / 1000;
            var deltaTime = newTime - (time || newTime);
            time = newTime;

            context.clearRect(0, 0, canvas.width, canvas.height);

            var amount = particleRate * deltaTime;
            for (var i = 0; i < amount; i++) {
                var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
                var dir = pos.clone().length(settings.particles.velocity);
                particles.add(
                    canvas.width / 2 + pos.x,
                    canvas.height / 2 - pos.y,
                    dir.x,
                    -dir.y
                );
            }

            particles.update(deltaTime);
            particles.draw(context, image);
        }

        function onResize() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        window.onresize = onResize;
        setTimeout(function () {
            onResize();
            render();
        }, 10);
    })(document.getElementById("pinkboard"));
};

/* Diary */
