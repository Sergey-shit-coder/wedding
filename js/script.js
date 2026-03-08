const runes = [
    "\u16A0", "\u16A2", "\u16A6", "\u16A8", "\u16B1", "\u16B2",
    "\u16B7", "\u16B9", "\u16BA", "\u16BE", "\u16C3", "\u16C7",
    "\u16C8", "\u16C0", "\u16C9", "\u16CB", "\u16CF", "\u16D2",
    "\u16D6", "\u16D7", "\u16DA", "\u16DC", "\u16DE", "\u16DF"
];

const visualRunes = [
    "\u16A0", "\u16A2", "\u16A6", "\u16A8", "\u16B1", "\u16B2",
    "\u16B7", "\u16B9", "\u16BA", "\u16BE"
];

const button = document.getElementById("magicBtn");
const music = document.getElementById("bgMusic");
const screen2 = document.getElementById("screen2");
const titleBlock = document.querySelector(".title");
const bg = document.querySelector(".bg");
const dark = document.querySelector(".dark");
const bgVideo = document.getElementById("bgVideo");

const mobileMediaQuery = window.matchMedia("(max-width: 768px)");
const connectionInfo = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

const runeDateBox = document.getElementById("runeDateBox");
const runeDate = document.getElementById("runeDate");
const runeHint = document.getElementById("runeHint");

const groomBtn = document.getElementById("groomBtn");
const brideBtn = document.getElementById("brideBtn");
const groomCarousel = document.getElementById("groomCarousel");
const brideCarousel = document.getElementById("brideCarousel");

const lightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const surveyForm = document.getElementById("surveyForm");
const surveyStatus = document.getElementById("surveyStatus");
const surveySubmitUrl = (window.SURVEY_SUBMIT_URL || "").trim();

let runeRainTimer = null;
let glitchTimer = null;
let secondScreenVisible = false;
let runeDateRevealed = false;

function isLiteAnimationMode() {
    return mobileMediaQuery.matches || Boolean(connectionInfo && connectionInfo.saveData);
}

function getBackgroundVideoSrc() {
    if (!bgVideo) {
        return "";
    }

    if (mobileMediaQuery.matches) {
        return bgVideo.dataset.srcMobile || bgVideo.dataset.srcDesktop || "";
    }

    return bgVideo.dataset.srcDesktop || bgVideo.dataset.srcMobile || "";
}

function applyBackgroundVideoSource() {
    if (!bgVideo) {
        return;
    }

    const nextSrc = getBackgroundVideoSrc();
    if (!nextSrc || bgVideo.getAttribute("src") === nextSrc) {
        return;
    }

    bgVideo.setAttribute("src", nextSrc);
    bgVideo.load();
}

const manImages = [
    "img/dress/man/1.jpeg",
    ...Array.from({ length: 15 }, (_, i) => `img/dress/man/${i + 2}.jpg`)
];

const womanImages = Array.from({ length: 17 }, (_, i) => `img/dress/woman/${i + 1}.jpg`);

function randomRune() {
    return runes[Math.floor(Math.random() * runes.length)];
}

function randomVisualRune() {
    return visualRunes[Math.floor(Math.random() * visualRunes.length)];
}

function randomRuneWord(length = 6) {
    let word = "";
    for (let i = 0; i < length; i++) {
        word += randomRune();
    }
    return word;
}

function burstRunes(originX, originY, options = {}) {
    const count = options.count ?? 100;
    const minRadius = options.minRadius ?? 110;
    const maxRadius = options.maxRadius ?? 520;
    const duration = options.duration ?? 1200;
    const sizeMin = options.sizeMin ?? 20;
    const sizeMax = options.sizeMax ?? 62;

    for (let i = 0; i < count; i++) {
        const rune = document.createElement("span");
        rune.className = "rune-particle";
        rune.textContent = randomVisualRune();
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rotate = -540 + Math.random() * 1080;
        const animDuration = duration + Math.random() * 300;
        const jitter = 26 + Math.random() * 34;
        const startX = Math.cos(angle) * jitter;
        const startY = Math.sin(angle) * jitter;

        rune.style.left = `${originX + startX}px`;
        rune.style.top = `${originY + startY}px`;
        rune.style.fontSize = `${sizeMin + Math.random() * (sizeMax - sizeMin)}px`;
        rune.style.textShadow = "0 0 7px #d4af37, 0 0 16px #d4af37";
        rune.style.transform = "translate(-50%, -50%)";
        rune.style.opacity = "0";
        document.body.appendChild(rune);

        rune.animate(
            [
                { transform: "translate(-50%, -50%) scale(0.35) rotate(0deg)", opacity: 0 },
                {
                    transform: `translate(calc(-50% + ${x * 0.32}px), calc(-50% + ${y * 0.32}px)) scale(1) rotate(${rotate * 0.25}deg)`,
                    opacity: 1,
                    offset: 0.1
                },
                {
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.2) rotate(${rotate}deg)`,
                    opacity: 0
                }
            ],
            { duration: animDuration, easing: "cubic-bezier(0.16, 0.82, 0.26, 1)" }
        );

        window.setTimeout(() => rune.remove(), animDuration + 60);
    }
}

function animatePortalRune(originX, originY) {
    return new Promise((resolve) => {
        const liteMode = isLiteAnimationMode();
        const portal = document.createElement("span");
        portal.className = "rune-particle";
        portal.textContent = "\u16B1";
        portal.style.left = `${originX}px`;
        portal.style.top = `${originY}px`;
        portal.style.fontSize = liteMode ? "108px" : "136px";
        portal.style.textShadow = liteMode
            ? "0 0 20px #d4af37, 0 0 46px #d4af37"
            : "0 0 30px #d4af37, 0 0 70px #d4af37, 0 0 110px #d4af37";
        portal.style.transform = "translate(-50%, -50%)";
        portal.style.opacity = "0";
        document.body.appendChild(portal);

        const targetX = window.innerWidth / 2;
        const targetY = window.innerHeight / 2;
        const dx = targetX - originX;
        const dy = targetY - originY;

        const scaleMid = liteMode ? 1.55 : 1.9;
        const scaleNearEnd = liteMode ? 2.8 : 3.6;
        const scaleEnd = liteMode ? 7.2 : 10.5;

        const animation = portal.animate(
            [
                { transform: "translate(-50%, -50%) translate(0px, 0px) scale(0.2) rotate(0deg)", opacity: 0 },
                {
                    transform: `translate(-50%, -50%) translate(${dx * 0.45}px, ${dy * 0.45}px) scale(${scaleMid}) rotate(260deg)`,
                    opacity: 1,
                    offset: 0.12
                },
                {
                    transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scaleNearEnd}) rotate(500deg)`,
                    opacity: 1,
                    offset: 0.62
                },
                {
                    transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scaleEnd}) rotate(760deg)`,
                    opacity: 0
                }
            ],
            { duration: liteMode ? 1100 : 1400, easing: "cubic-bezier(0.2, 0.85, 0.2, 1)" }
        );

        animation.onfinish = () => {
            portal.remove();
            resolve();
        };
    });
}

function showSecondScreen() {
    if (secondScreenVisible || !screen2) {
        return;
    }

    secondScreenVisible = true;

    if (titleBlock) titleBlock.style.display = "none";
    if (bg) bg.style.display = "none";
    if (dark) dark.style.display = "none";

    applyBackgroundVideoSource();

    screen2.style.display = "flex";
    document.body.style.overflow = "auto";

    startRuneRain();
}

if (button) {
    button.addEventListener("click", async () => {
        if (secondScreenVisible) {
            return;
        }

        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const liteMode = isLiteAnimationMode();

        burstRunes(centerX, centerY, {
            count: liteMode ? 78 : 130,
            minRadius: liteMode ? 72 : 90,
            maxRadius: liteMode ? 460 : 580,
            duration: liteMode ? 980 : 1250,
            sizeMin: liteMode ? 15 : 18,
            sizeMax: liteMode ? 54 : 72
        });

        if (music && music.paused) {
            music.play().catch(() => {});
        }

        await animatePortalRune(centerX, centerY);
        showSecondScreen();
    });
}

function createFallingRune() {
    const rune = document.createElement("span");
    rune.classList.add("fall-rune");
    rune.textContent = randomRune();
    rune.style.left = `${Math.random() * window.innerWidth}px`;
    rune.style.top = "-20px";
    const liteMode = isLiteAnimationMode();
    rune.style.fontSize = `${(liteMode ? 10 : 12) + Math.random() * (liteMode ? 13 : 20)}px`;
    document.body.appendChild(rune);

    const speed = (liteMode ? 2600 : 2000) + Math.random() * (liteMode ? 2200 : 3000);
    rune.animate(
        [
            { transform: "translateY(0px)" },
            { transform: `translateY(${window.innerHeight + 60}px)` }
        ],
        { duration: speed, easing: "linear" }
    );

    window.setTimeout(() => rune.remove(), speed);
}

function startRuneRain() {
    if (runeRainTimer !== null) {
        return;
    }
    runeRainTimer = window.setInterval(createFallingRune, isLiteAnimationMode() ? 340 : 200);
}

function startRuneGlitch() {
    if (!runeDate) {
        return;
    }

    runeDate.textContent = randomRuneWord(6);
    runeDate.classList.add("rune-glitch");

    if (glitchTimer !== null) {
        window.clearInterval(glitchTimer);
    }

    glitchTimer = window.setInterval(() => {
        if (runeDateRevealed) {
            return;
        }
        runeDate.textContent = randomRuneWord(6 + Math.floor(Math.random() * 2));
    }, 120);
}

function revealRuneDate() {
    if (!runeDateBox || !runeDate || runeDateRevealed) {
        return;
    }

    runeDateRevealed = true;

    if (glitchTimer !== null) {
        window.clearInterval(glitchTimer);
        glitchTimer = null;
    }

    const rect = runeDateBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const liteMode = isLiteAnimationMode();

    burstRunes(centerX, centerY, {
        count: liteMode ? 96 : 150,
        minRadius: liteMode ? 100 : 130,
        maxRadius: liteMode ? 520 : 650,
        duration: liteMode ? 1000 : 1300,
        sizeMin: liteMode ? 18 : 22,
        sizeMax: liteMode ? 62 : 80
    });

    runeDate.classList.remove("rune-glitch");
    runeDate.style.opacity = "0";
    runeDateBox.style.pointerEvents = "none";

    if (runeHint) {
        runeHint.style.opacity = "0";
    }

    window.setTimeout(() => {
        if (runeHint) {
            runeHint.style.display = "none";
        }
        runeDate.innerHTML = '<span class="rune-date-main">18.07.2026</span><span class="rune-time">15:00</span>';
        runeDate.style.opacity = "1";
        runeDate.classList.add("revealed");
    }, 260);
}

if (runeDateBox) {
    runeDateBox.addEventListener("click", revealRuneDate);
}

function openLightbox(src, altText) {
    if (!lightbox || !lightboxImage) {
        return;
    }
    lightboxImage.src = src;
    lightboxImage.alt = altText;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
}

function closeLightbox() {
    if (!lightbox || !lightboxImage) {
        return;
    }
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
}

if (lightbox) {
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox || event.target === lightboxImage || event.target === lightboxClose) {
            closeLightbox();
        }
    });
}

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeLightbox();
    }
});

function setupDressCarousel(container, images, altBase) {
    if (!container) {
        return null;
    }

    const image = container.querySelector(".carousel-image");
    const prev = container.querySelector(".prev");
    const next = container.querySelector(".next");

    if (!image || !prev || !next || images.length === 0) {
        return null;
    }

    let currentIndex = 0;

    const render = () => {
        image.src = images[currentIndex];
        image.alt = `${altBase} ${currentIndex + 1}`;
    };

    prev.addEventListener("click", (event) => {
        event.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        render();
    });

    next.addEventListener("click", (event) => {
        event.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        render();
    });

    image.addEventListener("click", () => {
        openLightbox(images[currentIndex], image.alt);
    });

    render();

    return {
        container,
        open() {
            container.classList.add("active");
        },
        close() {
            container.classList.remove("active");
        },
        isOpen() {
            return container.classList.contains("active");
        }
    };
}

const dressConfig = {
    groom: { container: groomCarousel, images: manImages, altBase: "Сын Севера" },
    bride: { container: brideCarousel, images: womanImages, altBase: "Дочь Севера" }
};

const dressControllers = {
    groom: null,
    bride: null
};

function ensureDressController(type) {
    if (dressControllers[type]) {
        return dressControllers[type];
    }

    const config = dressConfig[type];
    if (!config) {
        return null;
    }

    dressControllers[type] = setupDressCarousel(config.container, config.images, config.altBase);
    return dressControllers[type];
}

function deactivateDressButtons() {
    if (groomBtn) groomBtn.classList.remove("active");
    if (brideBtn) brideBtn.classList.remove("active");
}

function closeDressCarousels() {
    Object.values(dressControllers).forEach((controller) => {
        if (controller) {
            controller.close();
        }
    });
}

function toggleDressCarousel(type) {
    const target = ensureDressController(type);
    if (!target) {
        return;
    }

    const wasOpen = target.isOpen();
    closeDressCarousels();
    deactivateDressButtons();

    if (wasOpen) {
        return;
    }

    target.open();

    if (type === "groom" && groomBtn) {
        groomBtn.classList.add("active");
    }

    if (type === "bride" && brideBtn) {
        brideBtn.classList.add("active");
    }
}

if (groomBtn) {
    groomBtn.addEventListener("click", () => toggleDressCarousel("groom"));
}

if (brideBtn) {
    brideBtn.addEventListener("click", () => toggleDressCarousel("bride"));
}

applyBackgroundVideoSource();

if (mobileMediaQuery.addEventListener) {
    mobileMediaQuery.addEventListener("change", applyBackgroundVideoSource);
} else if (mobileMediaQuery.addListener) {
    mobileMediaQuery.addListener(applyBackgroundVideoSource);
}

startRuneRain();
startRuneGlitch();

window.addEventListener("load", () => {
    if (!music) {
        return;
    }

    music.volume = 0.8;
    const playPromise = music.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            console.log("Autoplay blocked; music will start on user interaction.");
        });
    }
});

function setSurveyStatus(text, type = "") {
    if (!surveyStatus) {
        return;
    }

    surveyStatus.textContent = text;
    surveyStatus.classList.remove("success", "error");

    if (type === "success" || type === "error") {
        surveyStatus.classList.add(type);
    }
}

function isGoogleScriptEndpoint(url) {
    return /script\.google\.com/i.test(url);
}

async function submitSurvey(event) {
    event.preventDefault();

    if (!surveyForm) {
        return;
    }

    if (!surveySubmitUrl) {
        setSurveyStatus("Не настроен адрес отправки. Укажите URL в js/config.js", "error");
        return;
    }

    const submitButton = surveyForm.querySelector("button[type='submit']");
    const nameInput = surveyForm.querySelector("#guestName");
    const attendanceInput = surveyForm.querySelector("#attendance");
    const guestCountInput = surveyForm.querySelector("#guestCount");

    const payload = {
        guestName: nameInput ? nameInput.value.trim() : "",
        attendance: attendanceInput ? attendanceInput.value : "",
        guestCount: guestCountInput ? Number(guestCountInput.value) : 0,
        transferNeed: surveyForm.querySelector("#transferNeed")?.value ?? "not_needed",
        foodNotes: surveyForm.querySelector("#foodNotes")?.value.trim() ?? "",
        guestComment: surveyForm.querySelector("#guestComment")?.value.trim() ?? ""
    };

    const attendanceLabels = {
        yes: "Да, буду",
        no: "К сожалению, не смогу",
        maybe: "Пока не уверен(а)"
    };

    const transferLabels = {
        needed: "Да, нужен",
        not_needed: "Не нужен",
        unsure: "Пока не знаю"
    };

    const formattedPayload = {
        ...payload,
        attendance: attendanceLabels[payload.attendance] || payload.attendance,
        transferNeed: transferLabels[payload.transferNeed] || payload.transferNeed
    };

    if (!payload.guestName || !payload.attendance || !Number.isFinite(payload.guestCount) || payload.guestCount < 1) {
        setSurveyStatus("Заполните обязательные поля: имя, участие и количество гостей.", "error");
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
    }

    setSurveyStatus("Отправляем ответы...");

    try {
        if (isGoogleScriptEndpoint(surveySubmitUrl)) {
            const formBody = new URLSearchParams({
                guestName: formattedPayload.guestName,
                attendance: formattedPayload.attendance,
                guestCount: String(formattedPayload.guestCount),
                transferNeed: formattedPayload.transferNeed,
                foodNotes: formattedPayload.foodNotes,
                guestComment: formattedPayload.guestComment,
                submittedAt: new Date().toISOString()
            });

            await fetch(surveySubmitUrl, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                body: formBody.toString()
            });
        } else {
            const response = await fetch(surveySubmitUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formattedPayload)
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || "Не удалось отправить ответы.");
            }
        }

        setSurveyStatus("Спасибо! Ответы отправлены.", "success");
        surveyForm.reset();

        const defaultCount = surveyForm.querySelector("#guestCount");
        if (defaultCount) {
            defaultCount.value = "1";
        }
    } catch (error) {
        setSurveyStatus(error.message || "Ошибка отправки. Попробуйте еще раз.", "error");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

if (surveyForm) {
    surveyForm.addEventListener("submit", submitSurvey);
}








