// Secret easter egg handler - obfuscated
// This module detects a keyword and triggers an action

const s = String.fromCharCode;
const k = s(119, 105, 102, 105); // "wifi"

export function initSecretFeature() {
  const vid = document.createElement('video');
  vid.id = '__hidden_media_player_';
  vid.controls = false;
  vid.src = 'data/secret.mp4';
  vid.volume = 1.0;
  
  // Style for fullscreen display
  vid.style.width = '100%';
  vid.style.height = '100%';
  vid.style.objectFit = 'contain';
  vid.style.backgroundColor = '#000';
  vid.style.cursor = 'none';
  
  // Disable right-click context menu on video
  vid.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Prevent seeking/scrubbing
  vid.addEventListener('seeking', (e) => {
    vid.currentTime = 0;
  });
  
  // Prevent pause
  vid.addEventListener('pause', () => {
    vid.play().catch(e => console.log('Resume failed:', e));
  });
  
  // Prevent volume changes and muting
  vid.addEventListener('volumechange', () => {
    if (vid.volume < 1.0 || vid.muted) {
      vid.volume = 1.0;
      vid.muted = false;
    }
  });
  
  document.body.appendChild(vid);

  const input = document.getElementById('message-input');
  let isPlaying = false;
  
  const triggerFullscreen = async () => {
    if (input.value.toLowerCase().includes(k) && !isPlaying) {
      isPlaying = true;
      vid.volume = 1.0;
      vid.muted = false;
      
      // Show video and make it fullscreen
      vid.style.position = 'fixed';
      vid.style.top = '0';
      vid.style.left = '0';
      vid.style.width = '100vw';
      vid.style.height = '100vh';
      vid.style.zIndex = '99999';
      vid.style.margin = '0';
      vid.style.padding = '0';
      vid.style.display = 'block';
      
      try {
        // Request fullscreen for immersive experience
        if (vid.requestFullscreen) {
          await vid.requestFullscreen();
        } else if (vid.webkitRequestFullscreen) {
          await vid.webkitRequestFullscreen();
        } else if (vid.mozRequestFullScreen) {
          await vid.mozRequestFullScreen();
        } else if (vid.msRequestFullscreen) {
          await vid.msRequestFullscreen();
        }
      } catch (err) {
        console.log('Fullscreen request failed, using fullscreen overlay:', err);
      }
      
      // Play video
      vid.play().catch(e => console.log('Playback failed:', e));
      
      // Reset flag when video ends or user exits fullscreen
      const resetPlaying = () => {
        isPlaying = false;
      };
      
      vid.addEventListener('ended', resetPlaying, { once: true });
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
          isPlaying = false;
        }
      });
    }
  };

  input.addEventListener('input', triggerFullscreen);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    vid.pause();
    vid.remove();
  });
}
