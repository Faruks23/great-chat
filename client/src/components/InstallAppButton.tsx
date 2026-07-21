'use client';

import { Download, X } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import type { InstallPlatform } from '@/lib/pwa';

type InstallAppButtonProps = {
  className?: string;
  installedClassName?: string;
};

function getInstallSteps(platform: InstallPlatform, hasNativePrompt: boolean) {
  if (platform === 'ios') {
    return [
      'Tap the Share button in Safari (square with an arrow).',
      'Scroll down and tap "Add to Home Screen".',
      'Tap "Add" to install Great Chat on your device.',
    ];
  }

  if (platform === 'android') {
    if (hasNativePrompt) {
      return ['Tap "Install app" above to add Great Chat to your home screen.'];
    }

    return [
      'Open the browser menu (three dots in the top-right).',
      'Tap "Install app" or "Add to Home screen".',
      'Confirm to install Great Chat on your device.',
    ];
  }

  if (hasNativePrompt) {
    return ['Click "Install app" above to add Great Chat to your computer.'];
  }

  return [
    'Look for the install icon in your browser address bar.',
    'Or open the browser menu and choose "Install Great Chat".',
    'Confirm the prompt to add the app to your desktop.',
  ];
}

export function InstallAppButton({ className, installedClassName }: InstallAppButtonProps) {
  const { installed, install, showInstructions, closeInstructions, platform, hasNativePrompt } = usePwaInstall();

  if (installed) {
    return (
      <div
        className={
          installedClassName ??
          'rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur'
        }
      >
        App installed
      </div>
    );
  }

  const steps = getInstallSteps(platform, hasNativePrompt);

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        className={
          className ??
          'inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400'
        }
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Install app
      </button>

      {showInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-instructions-title"
          onClick={closeInstructions}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeInstructions}
              className="absolute right-4 top-4 rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close install instructions"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 id="install-instructions-title" className="text-xl font-semibold">
              Install Great Chat
            </h2>
            <p className="mt-2 text-sm text-white/70">
              {platform === 'ios'
                ? 'Add Great Chat to your iPhone or iPad home screen:'
                : platform === 'android'
                  ? 'Install Great Chat on your Android device:'
                  : 'Install Great Chat on your computer:'}
            </p>

            <ol className="mt-5 space-y-3 text-sm text-white/85">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-semibold text-cyan-300">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={closeInstructions}
              className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
