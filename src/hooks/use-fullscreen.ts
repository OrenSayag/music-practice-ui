import { useCallback, useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  document.addEventListener('fullscreenchange', callback);
  return () => document.removeEventListener('fullscreenchange', callback);
}

function getSnapshot() {
  return document.fullscreenElement !== null;
}

export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(subscribe, getSnapshot);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
}
