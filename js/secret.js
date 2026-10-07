// Secret easter egg handler - obfuscated
// This module detects a keyword and triggers an action

const s = String.fromCharCode;
const k = s(119, 105, 102, 105); // "wifi"

export function initSecretFeature() {
  const vid = document.createElement('video');
  vid.id = '__hidden_media_player_';
  vid.style.display = 'none';
  vid.controls = true;
  vid.src = 'data/secret.mp4';
  vid.volume = 1.0;
  document.body.appendChild(vid);

  const input = document.getElementById('message-input');
  
  const triggerFullscreen = async () => {
    if (input.value.toLowerCase().includes(k)) {
      vid.volume = 1.0;
      try {
        await vid.requestFullscreen();
        vid.play();
      } catch (err) {
        console.log('Fullscreen request failed:', err);
        vid.style.display = 'block';
        vid.style.position = 'fixed';
        vid.style.top = '0';
        vid.style.left = '0';
        vid.style.width = '100vw';
        vid.style.height = '100vh';
        vid.style.zIndex = '9999';
        vid.play();
      }
    }
  };

  input.addEventListener('input', triggerFullscreen);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    vid.pause();
    vid.remove();
  });
}
