import { db, auth } from './mood-recommender/js/firebase.js';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Structured data for recommendations based on mood
const moodData = {
    lazy: {
        music: [
            "Lofi Hip Hop chill beats",
            "Acoustic covers playlist",
            "Ambient soundscapes"
        ],
        activities: [
            "Do some light stretching",
            "Watch a documentary",
            "Listen to an audiobook or podcast"
        ],
        tips: [
            "Use the '5-Minute Rule': just start a task for 5 minutes.",
            "Break your work into micro-tasks.",
            "Declutter your immediate workspace."
        ],
        colorClass: "theme-lazy"
    },
    angry: {
        music: [
            "Heavy Rock / Metal (to release energy)",
            "Calming classical piano",
            "Nature sounds (rain, ocean waves)"
        ],
        activities: [
            "Go for a brisk walk or run",
            "Do a 10-minute guided meditation",
            "Write down your frustrations on paper"
        ],
        tips: [
            "Step away from your desk for 10 minutes.",
            "Practice deep breathing (inhale 4s, hold 4s, exhale 8s).",
            "Avoid sending emails or messages until calm."
        ],
        colorClass: "theme-angry"
    },
    focus: {
        music: [
            "Binaural beats for concentration",
            "Video game soundtracks (instrumental)",
            "Classical music (Mozart, Bach)"
        ],
        activities: [
            "Start a 25-minute Pomodoro session",
            "Tackle your most difficult task first",
            "Organize your notes for the next hour"
        ],
        tips: [
            "Put your phone in another room or on DND.",
            "Keep a 'distraction list' to write down random thoughts.",
            "Stay hydrated; keep a glass of water nearby."
        ],
        colorClass: "theme-focus"
    },
    sad: {
        music: [
            "Uplifting pop anthems",
            "Nostalgic 2000s hits",
            "Soft indie acoustic"
        ],
        activities: [
            "Call a friend or family member",
            "Make your favorite warm beverage",
            "Watch a comedy sketch or feel-good show"
        ],
        tips: [
            "Don't force productivity; do easy, repetitive tasks.",
            "Acknowledge your feelings; it's okay to take it slow.",
            "Reward yourself for small accomplishments today."
        ],
        colorClass: "theme-sad"
    },
    happy: {
        music: [
            "Upbeat Pop & Dance hits",
            "Feel-good R&B",
            "High-energy workout playlist"
        ],
        activities: [
            "Start a new creative project",
            "Dance around your room for 5 minutes",
            "Help someone else with a task"
        ],
        tips: [
            "Use this energy to tackle complex problems.",
            "Brainstorm new ideas while your creativity is high.",
            "Share your positive energy with your team or friends."
        ],
        colorClass: "theme-happy"
    }
};

// DOM Elements
const moodSelectionView = document.getElementById('mood-selection');
const resultsView = document.getElementById('results-view');
const moodCards = document.querySelectorAll('.mood-card:not(.add-mood-btn)');
const backBtn = document.getElementById('back-btn');
const currentMoodTitle = document.getElementById('current-mood-title');

// Custom Mood Elements
const addMoodBtn = document.getElementById('add-mood-btn');
const customMoodModal = document.getElementById('custom-mood-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const customMoodForm = document.getElementById('custom-mood-form');

// Recommendation Lists
const musicList = document.getElementById('music-list');
const activitiesList = document.getElementById('activities-list');
const tipsList = document.getElementById('tips-list');
const resultSections = document.querySelectorAll('.result-section');

// Function to populate list items
function populateList(listElement, items) {
    listElement.innerHTML = ''; // Clear existing items
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.textContent = item;
        // Staggered animation delay
        li.style.animationDelay = `${index * 0.1}s`;
        listElement.appendChild(li);
    });
}

// Function to handle mood selection
function handleMoodSelect(event) {
    const card = event.currentTarget;
    const selectedMood = card.getAttribute('data-mood');
    const emoji = card.querySelector('.emoji').textContent;
    const data = moodData[selectedMood];

    // Update Title
    currentMoodTitle.textContent = `${emoji} Recommendations for ${selectedMood}`;

    // Update theme colors for result cards
    resultSections.forEach(section => {
        // Remove existing theme classes
        section.classList.remove('theme-lazy', 'theme-angry', 'theme-focus', 'theme-sad', 'theme-happy');
        // Add new theme class
        section.classList.add(data.colorClass);
    });

    // Populate data
    populateList(musicList, data.music);
    populateList(activitiesList, data.activities);
    populateList(tipsList, data.tips);

    // Switch views with smooth transition
    moodSelectionView.classList.remove('active');

    // Save to Firestore if user is logged in
    if (window.currentUserId) {
        try {
            addDoc(collection(db, "moodHistory"), {
                userId: window.currentUserId,
                mood: selectedMood,
                timestamp: serverTimestamp(),
                suggestions: data
            }).then(() => {
                console.log("Mood saved to Firestore");
            }).catch(e => {
                console.error("Error adding document: ", e);
            });
        } catch (e) {
            console.error("Error executing Firestore request: ", e);
        }
    }

    // Small delay to allow the CSS transition (opacity/transform) to start
    setTimeout(() => {
        moodSelectionView.style.display = 'none';
        resultsView.style.display = 'block';

        // Trigger reflow for transition
        void resultsView.offsetWidth;

        resultsView.classList.add('active');
    }, 400); // Matches the 0.4s transition in CSS
}

// Function to go back to mood selection
function handleBack() {
    resultsView.classList.remove('active');

    setTimeout(() => {
        resultsView.style.display = 'none';
        moodSelectionView.style.display = 'block';

        void moodSelectionView.offsetWidth;

        moodSelectionView.classList.add('active');
    }, 400);
}

// Function to create a mood card dynamically
function createMoodCard(moodKey, emoji, label) {
    const card = document.createElement('button');
    card.className = 'mood-card';
    card.setAttribute('data-mood', moodKey);
    card.innerHTML = `
        <span class="emoji">${emoji}</span>
        <span class="label">${label}</span>
    `;
    card.addEventListener('click', handleMoodSelect);
    return card;
}

// Event Listeners
moodCards.forEach(card => {
    card.addEventListener('click', handleMoodSelect);
});

backBtn.addEventListener('click', handleBack);

// ==========================================
// Custom Mood Logic
// ==========================================

if (addMoodBtn) {
    addMoodBtn.addEventListener('click', () => {
        customMoodModal.classList.add('active');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        customMoodModal.classList.remove('active');
    });
}

if (customMoodForm) {
    customMoodForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('cm-name').value;
        const emoji = document.getElementById('cm-emoji').value;
        const musicStr = document.getElementById('cm-music').value;
        const activitiesStr = document.getElementById('cm-activities').value;
        const tipsStr = document.getElementById('cm-tips').value;
        const colorClass = document.getElementById('cm-color').value;

        const moodKey = name.toLowerCase().replace(/\s+/g, '-');

        const newMoodData = {
            music: musicStr.split(',').map(s => s.trim()).filter(s => s),
            activities: activitiesStr.split(',').map(s => s.trim()).filter(s => s),
            tips: tipsStr.split(',').map(s => s.trim()).filter(s => s),
            colorClass: colorClass
        };

        // Add to local data
        moodData[moodKey] = newMoodData;

        // Add to UI
        const newCard = createMoodCard(moodKey, emoji, name);
        const moodGrid = document.querySelector('.mood-grid');
        moodGrid.insertBefore(newCard, addMoodBtn);

        // Close modal and reset form
        customMoodModal.classList.remove('active');
        customMoodForm.reset();

        // Save to Firestore
        if (window.currentUserId) {
            try {
                await addDoc(collection(db, "customMoods"), {
                    userId: window.currentUserId,
                    moodKey: moodKey,
                    name: name,
                    emoji: emoji,
                    data: newMoodData,
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.error("Error saving custom mood:", error);
            }
        }
    });
}

// Load custom moods when user is authenticated
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Fetch custom moods
        try {
            const q = query(collection(db, "customMoods"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            const moodGrid = document.querySelector('.mood-grid');

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Add to local data
                moodData[data.moodKey] = data.data;
                // Add to UI
                // Check if card already exists (to prevent duplicates)
                if (!document.querySelector(`.mood-card[data-mood="${data.moodKey}"]`)) {
                    const newCard = createMoodCard(data.moodKey, data.emoji, data.name);
                    moodGrid.insertBefore(newCard, addMoodBtn);
                }
            });
        } catch (error) {
            console.error("Error loading custom moods:", error);
        }
    }
});

// ==========================================
// Dark Mode Toggle Logic
// ==========================================
const themeToggle = document.getElementById('theme-toggle');

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
} else {
    if (themeToggle) themeToggle.textContent = '🌙';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        let theme = 'light';
        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark';
            themeToggle.textContent = '☀️';
        } else {
            themeToggle.textContent = '🌙';
        }
        // Save preference
        localStorage.setItem('theme', theme);
    });
}

// ==========================================
// Focus Timer Logic (25 min)
// ==========================================
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isTimerRunning = false;

const timerDisplay = document.getElementById('timer-display');
const playPauseBtn = document.getElementById('play-pause-btn');
const resetBtn = document.getElementById('reset-btn');

function updateTimerDisplay() {
    if (!timerDisplay) return;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        playPauseBtn.textContent = '▶️';
    } else {
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                playPauseBtn.textContent = '▶️';
                alert('Focus session complete! Take a break.');
            }
        }, 1000);
        playPauseBtn.textContent = '⏸️';
    }
    isTimerRunning = !isTimerRunning;
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 25 * 60;
    isTimerRunning = false;
    if (playPauseBtn) playPauseBtn.textContent = '▶️';
    updateTimerDisplay();
}

if (playPauseBtn) playPauseBtn.addEventListener('click', toggleTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);

// Initialize timer display
updateTimerDisplay();
