'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type BeforeInstallPromptEvent,
  getInstallPlatform,
  isAppInstalled,
  type InstallPlatform,
} from '@/lib/pwa';

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>('unknown');

  useEffect(() => {
    setPlatform(getInstallPlatform());

    if (isAppInstalled()) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (installed) return;

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setInstallPrompt(null);
      }
      return;
    }

    setShowInstructions(true);
  }, [installPrompt, installed]);

  const closeInstructions = useCallback(() => {
    setShowInstructions(false);
  }, []);

  return {
    installed,
    install,
    showInstructions,
    closeInstructions,
    platform,
    hasNativePrompt: Boolean(installPrompt),
  };
}
