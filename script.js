/* ===================================
   Apple-Style Banglish Editor
   JavaScript - All Features Intact
   =================================== */

// ===== Configuration =====
const CONFIG = {
    API_KEY: "AIzaSyDY2jkFPPmgICGirKJ-p7ELHSfppZQU8Ew",
    GOOGLE_INPUT_TOOLS_URL: "https://inputtools.google.com/request",
    GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    MAX_SUGGESTIONS: 5,
    MAX_HISTORY: 50,
    PUNCTUATIONS: ["।", ",", ".", "?", "!", "/", ";", ":", "'", '"', "-"]
};

// ===== DOM Elements =====
const editor = document.getElementById('editor');
editor.addEventListener('input', handleEditorInput);

const suggestBox = document.getElementById('suggestion-box');
const voiceBtn = document.getElementById('voiceBtn');
const langBtn = document.getElementById('langBtn');

// ===== State Management =====
const state = {
    mode: 'bn',
    suggestions: [],
    selectedIndex: 0,
    isVoiceActive: false,
    recognition: null
};

// ===== Storage Manager (Multi-Note) =====
const storageManager = {
    notes: [],
    currentNoteId: null,

    init() {
        // Load notes from localStorage
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
        }

        // If no notes, create welcome note
        if (this.notes.length === 0) {
            this.createNote("Welcome to your new editor! 🎉", true);
        } else {
            // Load last active note or first note
            const lastActive = localStorage.getItem('lastActiveNote');
            if (lastActive && this.notes.find(n => n.id === lastActive)) {
                this.loadNote(lastActive);
            } else {
                this.loadNote(this.notes[0].id);
            }
        }

        this.renderHistory();
    },

    createNote(initialContent = "", isSystem = false) {
        const newNote = {
            id: Date.now().toString(),
            title: isSystem ? "Welcome Note" : "New Note",
            content: initialContent,
            timestamp: Date.now()
        };

        this.notes.unshift(newNote); // Add to top
        this.saveNotesToStorage();
        this.loadNote(newNote.id);
        this.renderHistory();
    },

    saveNoteContent(content) {
        if (!this.currentNoteId) return;

        const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
        if (noteIndex !== -1) {
            // Check if content actually changed
            if (this.notes[noteIndex].content === content) return;

            this.notes[noteIndex].content = content;
            this.notes[noteIndex].timestamp = Date.now();

            // Generate title only if NOT manually renamed
            if (!this.notes[noteIndex].manualTitle) {
                const firstLine = content.split('\n')[0].trim();
                this.notes[noteIndex].title = firstLine.substring(0, 30) || "New Note";
            }

            // Move to top
            const updatedNote = this.notes.splice(noteIndex, 1)[0];
            this.notes.unshift(updatedNote);

            this.saveNotesToStorage();
            this.renderHistory();
        }
    },

    loadNote(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            this.currentNoteId = id;
            editor.value = note.content;
            localStorage.setItem('lastActiveNote', id);

            // Update UI active state
            document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
            const activeItem = document.querySelector(`.history-item[data-id="${id}"]`);
            if (activeItem) activeItem.classList.add('active');

            // Close sidebar on mobile
            document.getElementById('sidebar').classList.remove('open');

            // Trigger input event to update UI state (Welcome msg)
            editor.dispatchEvent(new Event('input'));
        }
    },

    deleteNote(e, id) {
        e.stopPropagation(); // Prevent loading the note
        if (confirm("Are you sure you want to delete this note?")) {
            this.notes = this.notes.filter(n => n.id !== id);
            this.saveNotesToStorage();

            if (this.currentNoteId === id) {
                if (this.notes.length > 0) {
                    this.loadNote(this.notes[0].id);
                } else {
                    this.createNote();
                }
            }
            this.renderHistory();
        }
    },

    saveNotesToStorage() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    },

    renameNote(e, id) {
        e.stopPropagation();
        const note = this.notes.find(n => n.id === id);
        if (!note) return;

        const newTitle = prompt("Enter new name:", note.title);
        if (newTitle && newTitle.trim() !== "") {
            note.title = newTitle.trim();
            note.manualTitle = true; // Mark as manually renamed
            this.saveNotesToStorage();
            this.renderHistory();
        }
    },

    renderHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = this.notes.map(note => `
            <div class="history-item ${note.id === this.currentNoteId ? 'active' : ''}" 
                 onclick="storageManager.loadNote('${note.id}')" 
                 data-id="${note.id}">
                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis;">${note.title || 'New Note'}</span>
                <div class="history-actions">
                    <button class="edit-note-btn" onclick="storageManager.renameNote(event, '${note.id}')" title="Rename">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="delete-note-btn" onclick="storageManager.deleteNote(event, '${note.id}')" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
};

// Undo/Redo Manager (Simplified to work with current session)
const editorManager = {
    history: [],
    redoStack: [],

    saveState() {
        if (this.history.length > CONFIG.MAX_HISTORY) this.history.shift();
        this.history.push(editor.value);
        this.redoStack = [];
    },

    undo() {
        if (this.history.length > 0) {
            this.redoStack.push(editor.value);
            editor.value = this.history.pop();
            storageManager.saveNoteContent(editor.value); // Sync storage
        }
    },

    redo() {
        if (this.redoStack.length > 0) {
            this.history.push(editor.value);
            editor.value = this.redoStack.pop();
            storageManager.saveNoteContent(editor.value); // Sync storage
        }
    }
};

// Initialize
storageManager.init();
editorManager.saveState();
// Set initial lang
const langBtnInput = document.getElementById('langBtnInput');
if (langBtnInput) {
    langBtnInput.innerHTML = `<span class="btn-text-icon">${state.mode.toUpperCase()}</span>`;
}

// ===== Button Animation Helper =====
function pulseButton(buttonElement) {
    buttonElement.classList.add('btn-pulse');
    setTimeout(() => {
        buttonElement.classList.remove('btn-pulse');
    }, 400);
}

// ===== Icon Glow Effect (Keyboard Shortcuts) =====
function glowIcon(buttonElement) {
    if (!buttonElement) return;
    buttonElement.classList.add('icon-glow');
    setTimeout(() => {
        buttonElement.classList.remove('icon-glow');
    }, 600);
}



// ===== Input Handler =====
async function handleEditorInput(e) {
    // UI Logic: Toggle Welcome Message & Chips
    const welcomeMsg = document.getElementById('welcomeMsg');
    const chips = document.getElementById('chips');
    const contentWrapper = document.querySelector('.content-wrapper');
    const hasText = editor.value.trim().length > 0;

    if (welcomeMsg) {
        if (hasText) {
            if (welcomeMsg) welcomeMsg.classList.add('hidden');
            if (chips) chips.classList.add('hidden');
            if (contentWrapper) contentWrapper.classList.add('typing-active');
        } else {
            if (welcomeMsg) welcomeMsg.classList.remove('hidden');
            if (chips) chips.classList.remove('hidden');
            if (contentWrapper) contentWrapper.classList.remove('typing-active');
        }
    }

    // Auto-resize textarea (Synchronous for smoothness)
    // Save scroll position to prevent auto-scroll
    const mainContainer = document.querySelector('.main-container');
    const scrollBefore = mainContainer ? mainContainer.scrollTop : 0;

    editor.style.height = 'auto';
    const newHeight = Math.max(112, editor.scrollHeight);
    editor.style.height = newHeight + 'px';

    // Restore scroll position to prevent jump
    if (mainContainer) {
        mainContainer.scrollTop = scrollBefore;
    }

    // Editor Box Internal Scroll Logic REMOVED for Unlimited Expansion
    const editorBox = document.querySelector('.editor-box');
    if (editorBox) {
        editorBox.style.overflowY = 'visible';
        // Always visible/expandable
    }

    // Save state for undo/redo on space
    if (e && e.inputType === "insertText" && e.data === " ") {
        editorManager.saveState();
    }

    // Auto-save to storage
    storageManager.saveNoteContent(editor.value);

    // ... Suggestion Logic ...
    const pos = editor.selectionStart;
    const textBefore = editor.value.substring(0, pos);
    const words = textBefore.split(/[\s\n\r]/);
    const currentWord = words[words.length - 1];

    if (!currentWord || CONFIG.PUNCTUATIONS.includes(currentWord.slice(-1))) {
        hideSuggestions();
        return;
    }

    await fetchSuggestions(currentWord);
}

// ===== Fetch Suggestions from Google Input Tools =====
async function fetchSuggestions(word) {
    const itc = (state.mode === 'bn') ? 'bn-t-i0-und' : 'en-t-i0-und';

    try {
        const response = await fetch(
            `${CONFIG.GOOGLE_INPUT_TOOLS_URL}?text=${encodeURIComponent(word)}&itc=${itc}&num=${CONFIG.MAX_SUGGESTIONS}`
        );
        const data = await response.json();

        if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
            state.suggestions = data[1][0][1];
            renderSuggestions();

            // Fetch AI suggestions in parallel
            fetchGeminiAI(word);
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

// ===== Fetch AI Suggestions from Gemini =====
async function fetchGeminiAI(word) {
    if (word.length < 3) return;

    // Add AI processing visual feedback
    editor.parentElement.classList.add('ai-processing');

    try {
        const response = await fetch(
            `${CONFIG.GEMINI_API_URL}?key=${CONFIG.API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Correct ${state.mode === 'bn' ? 'Bengali' : 'English'} spelling for: ${word}. One word only.`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (data.candidates && data.candidates[0]) {
            const aiWord = data.candidates[0].content.parts[0].text.trim();

            if (aiWord && !state.suggestions.includes(aiWord)) {
                state.suggestions.unshift(aiWord);
                renderSuggestions();
            }
        }
    } catch (error) {
        console.error('Error fetching AI suggestions:', error);
    } finally {
        // Remove AI processing visual feedback
        editor.parentElement.classList.remove('ai-processing');
    }
}

// ===== Keyboard Event Handler =====
editor.addEventListener('keydown', function (e) {
    // Undo/Redo Shortcuts
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        editorManager.redo();
        // Feedback via visual pulse only if button exists (it doesn't anymore, but good practice)
        return;
    }

    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        editorManager.undo();
        return;
    }

    // Language Toggle Shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        toggleLang();
        glowIcon(document.getElementById('langBtnInput')); // Glow effect
        return;
    }

    // Voice Toggle Shortcut (Ctrl+~)
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleVoice();
        glowIcon(voiceBtn); // Glow effect
        return;
    }

    // Escape to hide suggestions
    if (e.key === 'Escape') {
        hideSuggestions();
        return;
    }

    // Suggestion box navigation
    if (suggestBox.style.display === 'block') {
        // Tab: Cycle through suggestions
        if (e.key === 'Tab') {
            e.preventDefault();
            state.selectedIndex = (state.selectedIndex + 1) % state.suggestions.length;
            renderSuggestions();
            return;
        }

        // Arrow Down
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            state.selectedIndex = (state.selectedIndex + 1) % state.suggestions.length;
            renderSuggestions();
            return;
        }

        // Arrow Up
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            state.selectedIndex = (state.selectedIndex - 1 + state.suggestions.length) % state.suggestions.length;
            renderSuggestions();
            return;
        }

        // Enter or Space: Confirm word + Add Space
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            applyWord(state.suggestions[state.selectedIndex], ' ');
            return;
        }

        // Punctuation: Confirm word + Add Punctuation + Auto Space
        if (CONFIG.PUNCTUATIONS.includes(e.key)) {
            e.preventDefault();
            applyWord(state.suggestions[state.selectedIndex], e.key);
            return;
        }
    } else {
        // Smart punctuation when suggestion box is closed
        if (CONFIG.PUNCTUATIONS.includes(e.key)) {
            const pos = editor.selectionStart;
            const lastChar = editor.value.charAt(pos - 1);

            if (lastChar === " ") {
                e.preventDefault();
                const textBefore = editor.value.substring(0, pos - 1);
                const textAfter = editor.value.substring(pos);

                // Remove previous space, add punctuation + auto space
                editor.value = textBefore + e.key + " " + textAfter;
                editor.setSelectionRange(pos + 1, pos + 1);
            }
        }
    }
});

// ===== Render Suggestions =====
function renderSuggestions() {
    if (state.suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    suggestBox.innerHTML = state.suggestions.map((word, index) => `
        <div class="suggestion-item ${index === state.selectedIndex ? 'active' : ''}" 
             onclick="applyWord('${word.replace(/'/g, "\\'")}', ' ')"
             role="option"
             aria-selected="${index === state.selectedIndex}">
            ${word}
        </div>
    `).join('');

    showSuggestions();
}

// ===== Show Suggestions =====
// ===== Show Suggestions =====
// ===== Show Suggestions =====
function showSuggestions() {
    const suggestionBox = document.getElementById('suggestion-box');
    if (!suggestionBox.children.length) {
        hideSuggestions();
        return;
    }

    // Find Word Start Index
    const cursorEnd = editor.selectionEnd;
    const textBefore = editor.value.substring(0, cursorEnd);
    // Find last separator or start of string
    const wordStartIndex = textBefore.search(/\S+$/);
    const targetIndex = wordStartIndex === -1 ? cursorEnd : wordStartIndex;

    // Get coordinates for Word Start (for Left)
    const startCoords = getCaretCoordinates(editor, targetIndex);

    // Get coordinates for Cursor End (for Top/Height consistency)
    const endCoords = getCaretCoordinates(editor, cursorEnd);

    // Get Container and Editor Positions
    const mainContainer = document.querySelector('.main-container');
    const mainRect = mainContainer.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();

    // Calculate line height for offset
    const computedStyle = window.getComputedStyle(editor);
    const lineHeight = parseInt(computedStyle.lineHeight) || parseInt(computedStyle.fontSize) * 1.2;

    // Caret position relative to the viewport (ignoring mainContainer scroll for now)
    const caretScreenY = editorRect.top + endCoords.top - editor.scrollTop;

    // Caret position relative to the mainContainer (for CSS top)
    const caretRelativeToContainerY = caretScreenY - mainRect.top + mainContainer.scrollTop;

    // Show box off-screen first to measure height
    suggestionBox.style.display = 'block';
    suggestionBox.style.visibility = 'hidden';
    const boxHeight = suggestionBox.offsetHeight;
    suggestionBox.style.visibility = 'visible';

    // Default Position: Below the cursor
    let finalTop = caretRelativeToContainerY + lineHeight;

    // Collision Detection: If not enough space below, show above
    const spaceBelow = window.innerHeight - (caretScreenY + lineHeight);
    if (spaceBelow < boxHeight + 10) {
        // 10px buffer
        finalTop = caretRelativeToContainerY - boxHeight;
    }

    // Left Position (Same logic)
    const caretScreenX = editorRect.left + startCoords.left - editor.scrollLeft;
    const finalLeft = caretScreenX - mainRect.left + mainContainer.scrollLeft;

    suggestionBox.style.left = `${finalLeft}px`;
    suggestionBox.style.top = `${finalTop}px`;

    currentFocus = -1;
}

// Helper: Textarea Caret Coordinates (Robust)
function getCaretCoordinates(element, position) {
    const div = document.createElement('div');
    const style = window.getComputedStyle(element);

    // Copy all relevant styles
    const properties = [
        'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'paddingTop',
        'paddingRight', 'paddingBottom', 'paddingLeft', 'fontStyle', 'fontVariant', 'fontWeight',
        'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign',
        'textTransform', 'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing',
        'tabSize', 'MozTabSize'
    ];

    properties.forEach(prop => {
        div.style[prop] = style[prop];
    });

    // Mirror content
    div.textContent = element.value.substring(0, position);

    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    // Style the mirror div to be off-screen
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.top = '0';
    div.style.left = '-9999px';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';

    document.body.appendChild(div);

    const coordinates = {
        top: span.offsetTop + parseInt(style.borderTopWidth),
        left: span.offsetLeft + parseInt(style.borderLeftWidth),
        height: parseInt(style.lineHeight)
    };

    document.body.removeChild(div);
    return coordinates;
}

// ===== Apply Selected Word =====
function applyWord(word, suffix) {
    editorManager.saveState();

    const pos = editor.selectionStart;
    const textBefore = editor.value.substring(0, pos);
    const textAfter = editor.value.substring(pos);
    const words = textBefore.split(/[\s\n\r]/);
    const lastRawWord = words[words.length - 1];
    const prefix = textBefore.substring(0, textBefore.length - lastRawWord.length);

    // Smart suffix: Add auto space after punctuation
    let finalSuffix = suffix;
    if (CONFIG.PUNCTUATIONS.includes(suffix)) {
        finalSuffix = suffix + " ";
    }

    editor.value = prefix + word + finalSuffix + textAfter;
    const newPos = prefix.length + word.length + finalSuffix.length;
    editor.setSelectionRange(newPos, newPos);

    hideSuggestions();
    editor.focus();
}

// ===== Hide Suggestions =====
function hideSuggestions() {
    suggestBox.style.display = 'none';
    state.suggestions = [];
    state.selectedIndex = 0;
}

// ===== Theme Toggle =====
function toggleTheme() {
    document.body.classList.toggle('light-mode');

    // Save preference to localStorage
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Load saved theme
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});

// ===== Language Toggle =====
function toggleLang() {
    state.mode = state.mode === 'bn' ? 'en' : 'bn';
    const langBtnInput = document.getElementById('langBtnInput');
    if (langBtnInput) {
        langBtnInput.innerHTML = `<span class="btn-text-icon">${state.mode.toUpperCase()}</span>`;
    }
    hideSuggestions();
}

// ===== Voice Recognition =====
function toggleVoice() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice recognition is only supported in Chrome browser.");
        return;
    }

    if (state.isVoiceActive) {
        // Stop voice recognition
        if (state.recognition) {
            state.recognition.stop();
        }
        state.isVoiceActive = false;
        editor.parentElement.classList.remove('voice-active');
        voiceBtn.classList.remove('active');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
        // Start voice recognition
        state.recognition = new webkitSpeechRecognition();
        state.recognition.lang = state.mode === 'bn' ? 'bn-BD' : 'en-US';
        state.recognition.continuous = true;
        state.recognition.interimResults = false;

        state.recognition.onstart = () => {
            state.isVoiceActive = true;
            editor.parentElement.classList.add('voice-active');
            voiceBtn.classList.add('active');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        };

        state.recognition.onresult = (event) => {
            // Save state before appending
            editorManager.saveState();

            const transcript = event.results[event.results.length - 1][0].transcript;

            // Append text with space
            editor.value += transcript + " ";

            // Scroll logic
            editor.blur();
            editor.focus();
            editor.scrollTop = editor.scrollHeight;

            // Trigger auto-save
            storageManager.saveNoteContent(editor.value);
        };

        state.recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            state.isVoiceActive = false;
            editor.parentElement.classList.remove('voice-active');
            voiceBtn.classList.remove('active');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };

        state.recognition.onend = () => {
            state.isVoiceActive = false;
            editor.parentElement.classList.remove('voice-active');
            voiceBtn.classList.remove('active');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };

        state.recognition.start();
    }
}

// ===== Get Cursor Position =====
function getCursorXY(input, selectionPoint) {
    const div = document.createElement('div');
    const style = getComputedStyle(input);

    for (const prop of style) {
        div.style[prop] = style[prop];
    }

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';

    div.textContent = input.value.substring(0, selectionPoint);

    const span = document.createElement('span');
    span.textContent = '.';
    div.appendChild(span);

    document.body.appendChild(div);

    const spanX = span.offsetLeft;
    const spanY = span.offsetTop;
    const height = span.offsetHeight;

    document.body.removeChild(div);

    return {
        offsetLeft: spanX,
        offsetTop: spanY,
        height: height
    };
}

// ===== Click Outside to Hide Suggestions =====
document.addEventListener('click', (e) => {
    if (!suggestBox.contains(e.target) && e.target !== editor) {
        hideSuggestions();
    }
});

// ===== Auto-save Draft =====
let autoSaveTimer;
editor.addEventListener('input', () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        localStorage.setItem('draft', editor.value);
    }, 1000);
});

// Load saved draft
window.addEventListener('DOMContentLoaded', () => {
    const savedDraft = localStorage.getItem('draft');
    if (savedDraft && !editor.value) {
        editor.value = savedDraft;
    }
});

// ===== Sidebar Toggle =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');

    // Check if mobile
    if (window.innerWidth <= 1024) {
        toggleSidebarMobile();
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleSidebarMobile() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Ensure correct button check for undo/redo shortcuts since buttons are removed
function safePulse(selector) {
    const btn = document.querySelector(selector);
    if (btn) pulseButton(btn);
}

// Helper to insert text from chips
function insertText(text) {
    editor.value = text;
    editor.focus();
    // Trigger input to update UI
    editor.dispatchEvent(new Event('input'));
}

// ===== Google Search Feature =====
function googleSearch() {
    let text = window.getSelection().toString();
    if (!text) {
        text = editor.value.trim();
    }

    if (text) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank');
    } else {
        alert("Please type or select text to search!");
    }
}

console.log('✨ Gemini-Style Banglish Editor loaded successfully!');
