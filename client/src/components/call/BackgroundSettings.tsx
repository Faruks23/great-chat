'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';

interface BackgroundOption {
  id: string;
  name: string;
  type: 'blur' | 'color' | 'image';
  value: string;
  preview: string;
}

interface BackgroundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (backgroundType: string, value: string) => void;
  currentBackground: { type: string; value: string } | null;
}

const DEFAULT_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'none',
    name: 'None',
    type: 'color',
    value: 'none',
    preview: '#f3f4f6',
  },
  {
    id: 'blur-light',
    name: 'Light Blur',
    type: 'blur',
    value: 'blur-sm',
    preview: 'blur',
  },
  {
    id: 'blur-medium',
    name: 'Medium Blur',
    type: 'blur',
    value: 'blur-md',
    preview: 'blur',
  },
  {
    id: 'blur-heavy',
    name: 'Heavy Blur',
    type: 'blur',
    value: 'blur-lg',
    preview: 'blur',
  },
  {
    id: 'color-white',
    name: 'White',
    type: 'color',
    value: '#ffffff',
    preview: '#ffffff',
  },
  {
    id: 'color-gray',
    name: 'Gray',
    type: 'color',
    value: '#6b7280',
    preview: '#6b7280',
  },
  {
    id: 'color-blue',
    name: 'Blue',
    type: 'color',
    value: '#3b82f6',
    preview: '#3b82f6',
  },
  {
    id: 'color-green',
    name: 'Green',
    type: 'color',
    value: '#10b981',
    preview: '#10b981',
  },
  {
    id: 'image-office',
    name: 'Office',
    type: 'image',
    value: 'office',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'image-nature',
    name: 'Nature',
    type: 'image',
    value: 'nature',
    preview: 'linear-gradient(135deg, #34a853 0%, #1e8e3e 100%)',
  },
  {
    id: 'image-beach',
    name: 'Beach',
    type: 'image',
    value: 'beach',
    preview: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  {
    id: 'image-sunset',
    name: 'Sunset',
    type: 'image',
    value: 'sunset',
    preview: 'linear-gradient(135deg, #f87171 0%, #fb923c 100%)',
  },
];

export function BackgroundSettings({
  isOpen,
  onClose,
  onApply,
  currentBackground,
}: BackgroundSettingsProps) {
  const [selected, setSelected] = useState<string | null>(currentBackground?.value || 'none');

  const handleApply = (background: BackgroundOption) => {
    setSelected(background.value);
    onApply(background.type, background.value);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-secondary" />
              <h2 className="text-lg font-semibold">Background Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Background options */}
          <div className="p-6 space-y-6">
            {/* None / Blur section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Effect</h3>
              <div className="grid grid-cols-4 gap-3">
                {DEFAULT_BACKGROUNDS.filter(b => b.type === 'blur' || b.id === 'none').map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => handleApply(bg)}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all
                      ${selected === bg.value
                        ? 'border-secondary bg-secondary/10'
                        : 'border-border hover:border-secondary/50'
                      }
                    `}
                    title={bg.name}
                  >
                    <div
                      className="w-full h-16 rounded bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-xs font-medium"
                      style={bg.preview === 'blur' ? {} : { backgroundColor: bg.preview }}
                    >
                      {bg.preview === 'blur' && '◯◯◯'}
                    </div>
                    <p className="text-xs mt-2 text-center">{bg.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Colors</h3>
              <div className="grid grid-cols-4 gap-3">
                {DEFAULT_BACKGROUNDS.filter(b => b.type === 'color' && b.id !== 'none').map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => handleApply(bg)}
                    className={`
                      relative p-2 rounded-lg border-2 transition-all
                      ${selected === bg.value
                        ? 'border-secondary'
                        : 'border-border hover:border-secondary/50'
                      }
                    `}
                    title={bg.name}
                  >
                    <div
                      className="w-full h-16 rounded"
                      style={{ backgroundColor: bg.preview }}
                    />
                    <p className="text-xs mt-2 text-center">{bg.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Image section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Images</h3>
              <div className="grid grid-cols-4 gap-3">
                {DEFAULT_BACKGROUNDS.filter(b => b.type === 'image').map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => handleApply(bg)}
                    className={`
                      relative p-2 rounded-lg border-2 transition-all
                      ${selected === bg.value
                        ? 'border-secondary'
                        : 'border-border hover:border-secondary/50'
                      }
                    `}
                    title={bg.name}
                  >
                    <div
                      className="w-full h-16 rounded"
                      style={{ background: bg.preview }}
                    />
                    <p className="text-xs mt-2 text-center">{bg.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex gap-3 sticky bottom-0 bg-card">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/90 text-white transition-colors font-medium"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
