# Secret Features 🔐

This project includes some Easter egg features for enhanced user experience.

## WiFi Easter Egg

A hidden video player has been implemented that activates when users type certain keywords in the chat interface. 

### How it works:
- The trigger word is embedded in the secret module (`js/secret.js`)
- When detected, a video player appears in the bottom-right corner
- The video is stored in `data/secret.mp4`
- The feature is completely optional and doesn't interfere with normal app functionality

### Technical Implementation:
- **Module**: `js/secret.js` - Contains the obfuscated keyword detection logic
- **Video**: `data/secret.mp4` - The hidden media file (1.39 MB)
- **HTML**: Updated `index.html` to initialize the secret feature on page load

### For Development:
The keyword is obfuscated using character codes to make the purpose less obvious:
```javascript
const k = String.fromCharCode(119, 105, 102, 105); // "wifi"
```

This approach keeps the feature hidden in plain sight! 🎬
