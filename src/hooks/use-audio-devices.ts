import { useState, useCallback } from 'react';

const DEVICE_KEY = 'audio-input-device-id';

interface AudioDevice {
  deviceId: string;
  label: string;
}

export function useAudioDevices() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    () => localStorage.getItem(DEVICE_KEY) ?? '',
  );
  const [permissionGranted, setPermissionGranted] = useState(false);

  const enumerate = useCallback(async () => {
    try {
      // Request permission so labels are visible
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionGranted(true);

      const all = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = all
        .filter((d) => d.kind === 'audioinput')
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Mic ${d.deviceId.slice(0, 6)}` }));
      setDevices(audioInputs);
    } catch {
      setPermissionGranted(false);
    }
  }, []);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    localStorage.setItem(DEVICE_KEY, deviceId);
  }, []);

  return { devices, selectedDeviceId, permissionGranted, enumerate, selectDevice };
}
