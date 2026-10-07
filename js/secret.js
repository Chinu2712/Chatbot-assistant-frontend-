// Secret easter egg handler - obfuscated
// This module detects a keyword and triggers an action

const s = String.fromCharCode;
const k = s(119, 105, 102, 105); // "wifi"

export function initSecretFeature() {
  const vid = document.createElement('video');
  vid.id = '__hidden_media_player_';
  vid.style.display = 'none';
  vid.style.position = 'fixed';
  vid.style.bottom = '20px';
  vid.style.right = '20px';
  vid.style.width = '300px';
  vid.style.height = 'auto';
  vid.style.zIndex = '9999';
  vid.controls = true;
  vid.src = 'data/secret.mp4';
  document.body.appendChild(vid);

  const input = document.getElementById('message-input');
  
  const observer = new MutationObserver(() => {
    if (input.value.toLowerCase().includes(k)) {
      vid.style.display = 'block';
      vid.play();
    }
  });

  input.addEventListener('input', (e) => {
    if (e.target.value.toLowerCase().includes(k)) {
      vid.style.display = 'block';
      vid.play();
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    vid.pause();
    vid.remove();
  });
}
