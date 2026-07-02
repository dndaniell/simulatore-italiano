// --- Application State & Storage ---
let currentCategory = null;
let currentItemIndex = 0;
let isAnswered = false;
let filteredItems = [];

const DIFFICULTY_MAP = { 0: 'easy', 1: 'medium', 2: 'high', 3: 'mamma_mia' };
const DIFFICULTY_LEVELS = { 'easy': 0, 'medium': 1, 'high': 2, 'mamma_mia': 3 };

let progressData = JSON.parse(localStorage.getItem('italianTutorProgress')) || { mastered: [], wrongCounts: {} };
if (!progressData.wrongCounts) progressData.wrongCounts = {};
if (!progressData.mastered) progressData.mastered = [];
let userTheme = localStorage.getItem('italianTutorTheme') || 'dark';
let userDifficulty = parseInt(localStorage.getItem('italianTutorDifficulty') || '0');
let userAvatar = localStorage.getItem('italianTutorAvatar') || null;
let userName = localStorage.getItem('italianTutorName') || 'Student';

// --- DOM Elements ---
const viewWelcome = document.getElementById('view-welcome');
const appMainViews = document.getElementById('app-main-views');
const startBtn = document.getElementById('start-btn');

const views = {
    'view-dashboard': document.getElementById('view-dashboard'),
    'view-courses': document.getElementById('view-courses'),
    'view-wheel': document.getElementById('view-wheel'),
    'view-profile': document.getElementById('view-profile'),
    'view-module': document.getElementById('view-module')
};

const navItems = document.querySelectorAll('.nav-item');
const moduleContent = document.getElementById('module-content');
const tutorFeedback = document.getElementById('tutor-feedback');
const tutorMessage = document.getElementById('tutor-message');
const tutorStatus = document.getElementById('tutor-status');
const nextBtn = document.getElementById('next-btn');

const appTitle = document.getElementById('app-title');
const appSubtitle = document.getElementById('app-subtitle');

// Profile & Settings
const themeToggle = document.getElementById('theme-toggle');
const difficultySlider = document.getElementById('difficulty-slider');
const headerAvatar = document.getElementById('header-avatar');
const profileAvatarLarge = document.getElementById('profile-avatar-large');
const editAvatarBtn = document.getElementById('edit-avatar-btn');
const avatarUpload = document.getElementById('avatar-upload');

const profileNameDisplay = document.getElementById('profile-name-display');
const profileNameInput = document.getElementById('profile-name-input');
const editNameBtn = document.getElementById('edit-name-btn');

const headerActionBtn = document.getElementById('header-action-btn');
const tipsModal = document.getElementById('tips-modal');
const closeTipsBtn = document.getElementById('close-tips-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalTipsContent = document.getElementById('modal-tips-content');
const backToCoursesBtn = document.getElementById('back-to-courses-btn');

// --- Initialization ---
function init() {
    // Apply Theme
    if (userTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.checked = true;
    }
    
    // Apply Difficulty
    difficultySlider.value = userDifficulty;

    // Apply Avatar
    if (userAvatar) {
        headerAvatar.src = userAvatar;
        profileAvatarLarge.src = userAvatar;
    }
    
    // Apply Name
    profileNameDisplay.textContent = userName;
    profileNameInput.value = userName;
    const appSubtitle = document.getElementById('app-subtitle');
    if (appSubtitle) appSubtitle.textContent = `Hello, ${userName}!`;

    updateProgress();
    updateProfileStats();
}

// --- Navigation Logic ---
startBtn.addEventListener('click', () => {
    viewWelcome.classList.remove('active');
    setTimeout(() => {
        viewWelcome.classList.add('hidden');
        appMainViews.classList.remove('hidden');
        appMainViews.style.animation = "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
    }, 200);
});

// Profile Avatar click -> Profile View
headerAvatar.addEventListener('click', () => {
    switchView('view-profile');
});

// Avatar Upload Logic
editAvatarBtn.addEventListener('click', () => {
    avatarUpload.click();
});

avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const dataUrl = event.target.result;
            userAvatar = dataUrl;
            localStorage.setItem('italianTutorAvatar', dataUrl);
            headerAvatar.src = dataUrl;
            profileAvatarLarge.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }
});

// Profile Name Edit Logic
editNameBtn.addEventListener('click', () => {
    profileNameDisplay.classList.add('hidden');
    editNameBtn.classList.add('hidden');
    profileNameInput.classList.remove('hidden');
    profileNameInput.focus();
});

profileNameInput.addEventListener('blur', saveProfileName);
profileNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveProfileName();
});

function saveProfileName() {
    const newName = profileNameInput.value.trim() || 'Student';
    userName = newName;
    localStorage.setItem('italianTutorName', newName);
    profileNameDisplay.textContent = newName;
    
    // Update home screen greeting
    const appSubtitle = document.getElementById('app-subtitle');
    if (appSubtitle) {
        appSubtitle.textContent = `Hello, ${newName}!`;
    }
    
    profileNameInput.classList.add('hidden');
    profileNameDisplay.classList.remove('hidden');
    editNameBtn.classList.remove('hidden');
}

// Tips Modal Logic
function openTipsModal() {
    updateProfileStats(); // Ensures modal content is fresh
    tipsModal.classList.remove('hidden');
}
function closeTipsModal() {
    tipsModal.classList.add('hidden');
}
headerActionBtn.addEventListener('click', openTipsModal);
closeTipsBtn.addEventListener('click', closeTipsModal);
modalCloseBtn.addEventListener('click', closeTipsModal);

// Back from module
backToCoursesBtn.addEventListener('click', () => {
    switchView('view-courses');
});

// Bottom Nav
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-target');
        switchView(targetView);
    });
});

// "See all" arrow in dashboard
document.getElementById('see-all-courses-btn').addEventListener('click', () => {
    switchView('view-courses');
});

function switchView(viewId) {
    // Update nav highlights
    navItems.forEach(item => {
        if (item.getAttribute('data-target') === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Hide all views, show target
    Object.keys(views).forEach(key => {
        if (key === viewId) {
            views[key].classList.remove('hidden');
            views[key].classList.add('active');
        } else {
            views[key].classList.remove('active');
            views[key].classList.add('hidden');
        }
    });

    // Handle Title Text based on view
    if (viewId === 'view-dashboard') {
        const phrases = [
            "Daniel is proud of you!",
            "Good job! I need to tell that to Daniel!",
            "Daniel is watching!",
            "Ready to practice?"
        ];
        appSubtitle.textContent = "Hello,";
        appTitle.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        currentCategory = null;
    } else if (viewId === 'view-courses') {
        appSubtitle.textContent = "Archive";
        appTitle.textContent = "All Categories";
    } else if (viewId === 'view-wheel') {
        appSubtitle.textContent = "Fortune";
        appTitle.textContent = "Pillole del Giorno";
    } else if (viewId === 'view-profile') {
        appSubtitle.textContent = "Account";
        appTitle.textContent = "Your Profile";
        updateProfileStats();
    }
}

// --- Settings Logic ---
themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('italianTutorTheme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('italianTutorTheme', 'dark');
    }
});

difficultySlider.addEventListener('input', (e) => {
    userDifficulty = parseInt(e.target.value);
    localStorage.setItem('italianTutorDifficulty', userDifficulty);
    updateProfileStats(); // updates level text
});

// --- Progress & Profile ---
function updateProgress() {
    let totalItems = 0;
    for (const cat in appData) {
        if(cat !== 'pillole') totalItems += appData[cat].length;
    }
    const masteredCount = progressData.mastered.length;
    const percentage = totalItems === 0 ? 0 : Math.round((masteredCount / totalItems) * 100);
    
    const progressFill = document.getElementById('progress-fill');
    const masteredCountEl = document.getElementById('mastered-count');
    const totalCountEl = document.getElementById('total-count');

    if(progressFill) progressFill.style.width = percentage + '%';
    if(masteredCountEl) masteredCountEl.textContent = masteredCount;
    if(totalCountEl) totalCountEl.textContent = totalItems;
}

function updateProfileStats() {
    const levelEl = document.getElementById('profile-level');
    const diffNames = ["Beginner", "Intermediate", "Advanced", "Native (Mamma Mia!)"];
    levelEl.textContent = diffNames[userDifficulty];

    const tipsContainer = document.getElementById('modal-tips-content'); // Moved to modal
    
    // Dynamic tips logic
    const totalWrong = Object.values(progressData.wrongCounts).reduce((a, b) => a + b, 0);
    if (totalWrong === 0) {
        if(tipsContainer) tipsContainer.innerHTML = "<strong>Let's start practicing to see where you can improve!</strong><br><br>Here you'll find tips and quick reviews regarding your mistakes.";
    } else {
        // Find most failed category based on id prefixes
        let errorsCat = { 'q':0, 't':0, 'c':0, 'm':0 };
        for (const [id, count] of Object.entries(progressData.wrongCounts)) {
            if(errorsCat[id[0]] !== undefined) errorsCat[id[0]] += count;
        }
        
        let highestCat = Object.keys(errorsCat).reduce((a, b) => errorsCat[a] > errorsCat[b] ? a : b);
        let advice = "";
        if(highestCat === 'q') advice = "Focus sui <strong>Quiz Grammaticali</strong>. Fai almeno 5 esercizi di grammatica per ripassare le regole che hai sbagliato!";
        else if(highestCat === 't') advice = "Esercitati sulle <strong>Traduzioni</strong>. Ti consiglio di fare 3 traduzioni prestando molta attenzione alla struttura della frase.";
        else if(highestCat === 'c') advice = "Leggi più <strong>Commedia</strong>. Fai un paio di esercizi per comprendere meglio il contesto culturale e le battute.";
        else advice = "Fai attenzione al <strong>Multisenso</strong>. Fai 4 esercizi per capire bene come cambia il significato in contesti diversi.";

        if(tipsContainer) tipsContainer.innerHTML = `<strong>Consiglio di Tutor Daniel:</strong> ${advice}<br><br>Hai un totale di ${totalWrong} errori registrati. Non arrenderti, gli errori servono per imparare!`;
    }
}

function markMastered(itemId) {
    if (!progressData.mastered.includes(itemId)) {
        progressData.mastered.push(itemId);
        localStorage.setItem('italianTutorProgress', JSON.stringify(progressData));
        updateProgress();
    }
}

function markWrong(itemId) {
    if(!progressData.wrongCounts[itemId]) progressData.wrongCounts[itemId] = 0;
    progressData.wrongCounts[itemId]++;
    localStorage.setItem('italianTutorProgress', JSON.stringify(progressData));
}

// --- Wheel of Fortune Logic ---
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const wheelResult = document.getElementById('wheel-result-content');
let currentRotation = 0;

spinBtn.addEventListener('click', () => {
    if(spinBtn.disabled) return;
    spinBtn.disabled = true;
    wheelResult.classList.add('hidden');
    
    // Spin 5-8 times + random offset
    const spins = 5 + Math.random() * 3; 
    const randomDegree = Math.floor(Math.random() * 360);
    currentRotation += (spins * 360) + randomDegree;
    
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    
    setTimeout(() => {
        spinBtn.disabled = false;
        showWheelResult();
    }, 4000); // 4s animation
});

function showWheelResult() {
    // Pick random pillola
    const pilloleList = appData.pillole;
    const randomItem = pilloleList[Math.floor(Math.random() * pilloleList.length)];
    
    wheelResult.innerHTML = `
        <div class="glass module-card" style="margin-bottom:0; text-align: left; animation: slideUp 0.4s ease-out;">
            <div class="term-display" style="margin: 16px 0;">
                <div class="term-text" style="font-size: 1.8rem;">${randomItem.italian}</div>
                <div class="pronunciation">🗣️ ${randomItem.pronunciation}</div>
            </div>
            <div class="rule-box" style="margin-bottom: 16px;">
                <strong style="color: var(--text-main);">Literal:</strong> ${randomItem.literal}<br><br>
                <strong style="color: var(--text-main);">Meaning:</strong> ${randomItem.english}
            </div>
            <div style="background: rgba(236, 72, 153, 0.1); padding: 12px; border-radius: 12px; border-left: 4px solid var(--accent-pink);">
                <strong style="color: var(--text-main);">Tutor Daniel says:</strong> ${randomItem.danielNotes}
            </div>
        </div>
    `;
    wheelResult.classList.remove('hidden');
}

// --- Exercise Module Logic ---
const courseTriggers = document.querySelectorAll('.menu-card, .preview-card');
courseTriggers.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-view');
        openCategory(category);
    });
});

nextBtn.addEventListener('click', () => {
    nextItem();
});

function openCategory(category) {
    currentCategory = category;
    currentItemIndex = 0;
    
    // Filter questions exactly by user selected difficulty
    const diffKey = DIFFICULTY_MAP[userDifficulty];
    filteredItems = appData[category].filter(item => item.difficulty === diffKey);

    // Shuffle the array so it's not repetitive and pick 10
    filteredItems.sort(() => Math.random() - 0.5);
    filteredItems = filteredItems.slice(0, 10);
    
    // Deselect bottom nav active states manually since we are in a sub-view
    navItems.forEach(i => i.classList.remove('active'));

    // Update UI
    Object.keys(views).forEach(key => views[key].classList.add('hidden'));
    views['view-module'].classList.remove('hidden');
    views['view-module'].classList.add('active');
    
    appSubtitle.textContent = "Practicing";
    appTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    
    renderCurrentItem();
}

function renderCurrentItem() {
    isAnswered = false;
    tutorFeedback.classList.add('hidden');
    moduleContent.innerHTML = '';
    
    if (filteredItems.length === 0) {
        moduleContent.innerHTML = `
            <div class="glass module-card" style="text-align: center;">
                <i data-lucide="alert-circle" style="width: 64px; height: 64px; color: var(--text-muted); margin: 0 auto 16px;"></i>
                <h2 class="module-title">Nessun Esercizio</h2>
                <p style="color: var(--text-muted);">No exercises found for your current difficulty level. Try increasing the difficulty in Settings!</p>
                <button class="primary-btn mt-4" onclick="switchView('view-courses')">Return</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    if (currentItemIndex >= filteredItems.length) {
        moduleContent.innerHTML = `
            <div class="glass module-card" style="text-align: center;">
                <i data-lucide="check-circle" style="width: 64px; height: 64px; color: var(--accent-cyan); margin: 0 auto 16px;"></i>
                <h2 class="module-title">Bravissimo!</h2>
                <p style="color: var(--text-muted);">You have completed all available items in this section.</p>
                <button class="primary-btn mt-4" onclick="switchView('view-courses')">Return</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const item = filteredItems[currentItemIndex];

    switch(currentCategory) {
        case 'quiz':
            renderQuiz(item);
            break;
        case 'traduzioni':
            renderTraduzioni(item);
            break;
        case 'commedia':
            renderCommedia(item);
            break;
        case 'multisenso':
            renderMultisenso(item);
            break;
    }
    lucide.createIcons();
}

function nextItem() {
    currentItemIndex++;
    renderCurrentItem();
}

function showTutorFeedback(message, status = 'Insight') {
    tutorMessage.innerHTML = message;
    tutorStatus.textContent = status;
    tutorFeedback.classList.remove('hidden');
}

// --- Category Renders ---
function renderQuiz(item) {
    moduleContent.innerHTML = `
        <div class="glass module-card">
            <h2 class="module-title">Grammar Quiz</h2>
            <div class="rule-box">
                <strong style="color: var(--text-main);">Rule:</strong> ${item.rule}
                ${item.example ? `<br><br><em>Example:</em> ${item.example}` : ''}
            </div>
            <p style="font-size: 1.1rem; font-weight: 500; margin-bottom: 24px; color: var(--text-main);">${item.question}</p>
            <div id="options-container">
                ${item.options.map((opt, index) => `
                    <button class="option-btn" data-index="${index}">${opt}</button>
                `).join('')}
            </div>
            <button class="primary-btn mt-4 inline-next-btn hidden">Continua <i data-lucide="arrow-right" style="vertical-align: middle;"></i></button>
        </div>
    `;

    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isAnswered) return;
            isAnswered = true;
            
            const selectedIdx = parseInt(e.target.getAttribute('data-index'));
            const isCorrect = selectedIdx === item.correctAnswer;
            
            btns.forEach(b => {
                const idx = parseInt(b.getAttribute('data-index'));
                if (idx === item.correctAnswer) {
                    b.classList.add('correct');
                    b.innerHTML += ' <i data-lucide="check" style="float: right;"></i>';
                } else if (idx === selectedIdx && !isCorrect) {
                    b.classList.add('incorrect');
                    b.innerHTML += ' <i data-lucide="x" style="float: right;"></i>';
                }
            });
            
            const nextBtnInline = moduleContent.querySelector('.inline-next-btn');
            nextBtnInline.classList.remove('hidden');
            nextBtnInline.addEventListener('click', nextItem);
            
            if (isCorrect) {
                markMastered(item.id);
                showTutorFeedback(item.danielNotes, 'Bravo! 🎉');
            } else {
                markWrong(item.id);
                showTutorFeedback(item.danielNotes, 'Attenzione! 💡');
            }
            lucide.createIcons();
        });
    });
}

function renderTraduzioni(item) {
    moduleContent.innerHTML = `
        <div class="glass module-card">
            <h2 class="module-title">Translate</h2>
            <p style="font-size: 1.3rem; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">"${item.english}"</p>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px;">
                Hints: ${item.hints.join(', ')}
            </div>
            
            <input type="text" id="translation-input" class="text-input" placeholder="Type translation in Italian...">
            <button id="check-btn" class="primary-btn">Check Answer</button>
            
            <div id="correct-answer-box" class="hidden" style="margin-top: 16px; padding: 16px; border-radius: 16px; color: var(--text-main);">
            </div>
            <button class="primary-btn mt-4 inline-next-btn hidden">Continua <i data-lucide="arrow-right" style="vertical-align: middle;"></i></button>
        </div>
    `;

    document.getElementById('check-btn').addEventListener('click', () => {
        if (isAnswered) return;
        isAnswered = true;
        
        const input = document.getElementById('translation-input').value.trim().toLowerCase();
        const userClean = input.replace(/[^a-zèéìòùà ]/g, '');
        
        const isCorrect = userClean.length > 0 && item.answers.some(ans => {
            const correctClean = ans.toLowerCase().replace(/[^a-zèéìòùà ]/g, '');
            return correctClean === userClean;
        });
        
        const answerBox = document.getElementById('correct-answer-box');
        answerBox.classList.remove('hidden');
        document.getElementById('check-btn').classList.add('hidden');
        
        const nextBtnInline = document.querySelector('.inline-next-btn');
        nextBtnInline.classList.remove('hidden');
        nextBtnInline.addEventListener('click', nextItem);
        
        if (isCorrect) {
            markMastered(item.id);
            answerBox.innerHTML = `<strong>Corretto!</strong> ${item.italian}`;
            answerBox.style.background = 'rgba(16, 185, 129, 0.2)';
            answerBox.style.borderLeft = '4px solid #10b981';
            showTutorFeedback(item.danielNotes, 'Perfetto! 🍝');
        } else {
            markWrong(item.id);
            answerBox.innerHTML = `<strong>Sbagliato!</strong> La risposta corretta era: <br><span style="font-size:1.1rem; font-weight:bold; color: var(--text-main);">${item.italian}</span>`;
            answerBox.style.background = 'rgba(239, 68, 68, 0.2)';
            answerBox.style.borderLeft = '4px solid #ef4444';
            showTutorFeedback(item.danielNotes, 'Let\'s analyze it 🔍');
        }
    });
}

function renderCommedia(item) {
    const jokeHtml = item.joke.replace(/\n/g, '<br>');

    moduleContent.innerHTML = `
        <div class="glass module-card">
            <h2 class="module-title">Commedia</h2>
            <div style="font-size: 1.15rem; font-weight: 500; line-height: 1.6; margin-bottom: 24px; color: var(--text-main);">
                ${jokeHtml}
            </div>
            
            <button id="explain-btn" class="primary-btn mt-4">Non capisco (I don't get it)</button>
            <button id="got-it-btn" class="primary-btn mt-4" style="margin-top:12px;">Ho capito! (I got it!)</button>
            
            <button class="primary-btn mt-4 inline-next-btn hidden" style="background: var(--accent-cyan);">Continua <i data-lucide="arrow-right" style="vertical-align: middle;"></i></button>
        </div>
    `;

    document.getElementById('explain-btn').addEventListener('click', () => {
        document.getElementById('explain-btn').classList.add('hidden');
        document.getElementById('got-it-btn').classList.add('hidden');
        
        const nextBtnInline = document.querySelector('.inline-next-btn');
        nextBtnInline.classList.remove('hidden');
        nextBtnInline.addEventListener('click', nextItem);
        
        markWrong(item.id); // Track as "needs help"
        showTutorFeedback(item.danielNotes, 'Cultural Context 🎭');
    });

    document.getElementById('got-it-btn').addEventListener('click', () => {
        document.getElementById('explanation-box').classList.remove('hidden');
        document.getElementById('explain-btn').classList.add('hidden');
        document.getElementById('got-it-btn').classList.add('hidden');
        
        const nextBtnInline = document.querySelector('.inline-next-btn');
        nextBtnInline.classList.remove('hidden');
        nextBtnInline.addEventListener('click', nextItem);
        
        markMastered(item.id);
        showTutorFeedback("Bravo! Capire l'umorismo è difficile! " + item.danielNotes, 'Bravo! 🎉');
    });
}

function renderMultisenso(item) {
    moduleContent.innerHTML = `
        <div class="glass module-card">
            <h2 class="module-title">Multisenso</h2>
            <p style="font-size: 1.3rem; margin-bottom: 24px; color: var(--text-main);">${item.sentence}</p>
            
            <p style="margin-bottom: 16px; font-weight: 500; color: #e5e7eb;">Cosa significa la parola sottolineata?</p>
            
            <div id="options-container">
                ${item.options.map((opt, index) => `
                    <button class="option-btn" data-index="${index}">${opt}</button>
                `).join('')}
            </div>
            <button class="primary-btn mt-4 inline-next-btn hidden">Continua <i data-lucide="arrow-right" style="vertical-align: middle;"></i></button>
        </div>
    `;

    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isAnswered) return;
            isAnswered = true;
            
            const selectedIdx = parseInt(e.target.getAttribute('data-index'));
            const isCorrect = selectedIdx === item.correctAnswer;
            
            btns.forEach(b => {
                const idx = parseInt(b.getAttribute('data-index'));
                if (idx === item.correctAnswer) {
                    b.classList.add('correct');
                    b.innerHTML += ' <i data-lucide="check" style="float: right;"></i>';
                } else if (idx === selectedIdx && !isCorrect) {
                    b.classList.add('incorrect');
                    b.innerHTML += ' <i data-lucide="x" style="float: right;"></i>';
                }
            });
            
            const nextBtnInline = moduleContent.querySelector('.inline-next-btn');
            nextBtnInline.classList.remove('hidden');
            nextBtnInline.addEventListener('click', nextItem);
            
            if (isCorrect) {
                markMastered(item.id);
                showTutorFeedback(item.danielNotes, 'Esatto! 🎯');
            } else {
                markWrong(item.id);
                showTutorFeedback(item.danielNotes, 'Almost! 🔄');
            }
            lucide.createIcons();
        });
    });
}

// Run init
init();
