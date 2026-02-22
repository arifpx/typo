# 🎨 News24 Banglish Editor - Apple Style

একটি প্রিমিয়াম, Apple-inspired Banglish টাইপিং এডিটর যা AI-powered suggestions এবং আধুনিক ডিজাইন সহ তৈরি।

## ✨ Features

### 🎯 Core Features
- **Smart Banglish Typing**: Google Input Tools integration
- **AI Suggestions**: Gemini AI-powered word corrections
- **Voice Input**: বাংলা এবং ইংরেজি voice typing
- **Undo/Redo**: Full history management (Ctrl+Z, Ctrl+Shift+Z)
- **Language Toggle**: Bangla ↔ English switching (Ctrl+.)
- **Smart Punctuation**: Auto-spacing after punctuation marks

### 🎨 Design Features
- **Apple-Style Gradients**: Smooth, colorful animated backgrounds
- **Glassmorphism**: Premium frosted glass effects
- **Dark/Light Mode**: Beautiful themes with smooth transitions
- **Fully Responsive**: Mobile, tablet, and desktop optimized
- **Auto-Save**: Automatic draft saving to localStorage

## 🚀 How to Use

### Installation
1. সব ফাইল একই ফোল্ডারে রাখুন:
   - `index.html`
   - `style.css`
   - `script.js`
   - `news24-logo.png`

2. `index.html` ফাইলটি ব্রাউজারে খুলুন

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + .` | Language Toggle (BN ↔ EN) |
| `Tab` | Cycle through suggestions |
| `↑` / `↓` | Navigate suggestions |
| `Enter` / `Space` | Accept suggestion |
| `Esc` | Hide suggestions |

### Typing Tips
1. **Banglish Mode (BN)**: Type "ami" → suggestions: "আমি", "আমী", etc.
2. **Punctuation**: Type word + punctuation → auto-spacing
3. **Voice Input**: Click "Voice" button → speak in selected language
4. **Theme**: Click theme button to switch dark/light mode

## 📁 File Structure

```
Banglish/
├── index.html          # Main HTML structure
├── style.css           # Apple-style CSS with gradients
├── script.js           # All functionality (AI, Voice, etc.)
├── news24-logo.png     # News24 logo
└── README.md           # This file
```

## 🎨 Design System

### Color Palette
**Dark Mode** (GridX-inspired):
- Background: Pure black (#0a0a0a)
- True black for OLED screens
- Maximum contrast and clarity
- Professional appearance

**Light Mode** (Celsior-inspired):
- Background: Light gray (#e5e5e5)
- Soft, non-glaring brightness
- Clean, minimal aesthetic
- Perfect for daytime use

**Accent Color**:
- Professional blue (#6c7ff2)
- Consistent across both themes
- Modern and calming

### Typography
- **Bangla**: Hind Siliguri (Google Fonts)
- **UI**: Inter (Google Fonts)
- **System Fallback**: -apple-system, BlinkMacSystemFont

## 🔧 Technical Details

### APIs Used
- **Google Input Tools**: Banglish to Bangla conversion
- **Gemini AI**: Intelligent word suggestions
- **Web Speech API**: Voice recognition

### Browser Compatibility
- ✅ Chrome/Edge (Recommended - Voice support)
- ✅ Firefox (No voice support)
- ✅ Safari (Limited voice support)

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Features Breakdown

### 1. Suggestion System
- Real-time Google Input Tools suggestions
- AI-enhanced corrections via Gemini
- Keyboard navigation (Tab, Arrow keys)
- Click to select

### 2. Voice Recognition
- Continuous speech recognition
- Language-specific (bn-BD / en-US)
- Visual feedback (active state)

### 3. Smart Editor
- Auto-save drafts every 1 second
- Undo/Redo with 50-step history
- Smart punctuation spacing
- Cursor-following suggestion box

### 4. Theme System
- Animated gradient backgrounds
- Glassmorphism with backdrop blur
- Persistent theme preference
- Smooth transitions (0.3s - 0.5s)

## 🛠️ Customization

### Change Gradient Colors
Edit `style.css`:
```css
:root {
    --gradient-bg: linear-gradient(135deg, #yourcolor1, #yourcolor2, ...);
}
```

### Adjust Blur Amount
```css
:root {
    --blur-amount: 20px; /* Increase for more blur */
}
```

### Change Font
```css
body {
    font-family: 'YourFont', 'Hind Siliguri', sans-serif;
}
```

## 📱 Mobile Optimization

- Touch-friendly button sizes
- Responsive toolbar layout
- Optimized font sizes
- Smooth scrolling

## 🔒 Privacy

- All data stored locally (localStorage)
- No server-side storage
- API calls only for suggestions
- Voice data not recorded

## 👨‍💻 Developer

**Developed by Mortuz**  
© 2026 News24

## 📄 License

This project is created for News24. All rights reserved.

---

## 🎉 Enjoy Premium Banglish Typing!

আপনার টাইপিং অভিজ্ঞতা উপভোগ করুন! 🚀
