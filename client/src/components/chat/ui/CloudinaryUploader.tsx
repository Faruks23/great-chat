"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { saveCloudinaryAsset } from '@/services/uploadService';

type SavedAsset = {
  url: string;
  filename: string;
};

export default function CloudinaryUploader() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);

  useEffect(() => {
    // Load Cloudinary upload widget script if not already present
    if (typeof window === 'undefined') return;
    if (!(window as any).cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openWidget = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!(window as any).cloudinary) {
      alert('Cloudinary widget not loaded yet. Try again in a moment.');
      return;
    }

    const options = {
      cloudName,
      uploadPreset,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'pdf'],
      maxFiles: 1,
      showAdvancedOptions: false,
      cropping: false,
      folder: 'great-chat/uploads',
    } as any;

    setProgress(0);
    setUploading(true);

    (window as any).cloudinary.openUploadWidget(options, async function (error: any, result: any) {
      if (error) {
        console.error('Cloudinary widget error', error);
        setUploading(false);
        return;
      }

      // The widget fires many events; handle progress and success.
      if (result && result.event === 'upload-progress' && result.info) {
        const info = result.info;
        if (info.bytes_uploaded && info.bytes_total) {
          const pct = Math.round((info.bytes_uploaded / info.bytes_total) * 100);
          setProgress(pct);
        } else if (typeof info.progress === 'number') {
          setProgress(Math.round(info.progress * 100));
        }
        return;
      }

      if (result && result.event === 'success' && result.info) {
        // result.info contains the uploaded asset data
        const info = result.info;
        const payload = {
          secure_url: info.secure_url,
          original_filename: info.original_filename ?? info.original_filename,
          public_id: info.public_id,
          resource_type: info.resource_type,
          format: info.format,
          bytes: info.bytes,
          mime_type: info.mime_type ?? info.resource_type,
        };

        try {
          // Send secure_url to backend to persist
          const saved = await saveCloudinaryAsset(payload as any);
          setSavedAssets((s) => [{ url: saved.url, filename: saved.filename }, ...s]);
        } catch (err) {
          console.error('Failed to save cloudinary asset on server', err);
        }
      }

      // widget finished queue
      if (result && result.event === 'queues-end') {
        setUploading(false);
        setProgress(100);
      }
    });
  };

  return (
    <div className="space-y-3">
      <button type="button" onClick={openWidget} className="rounded bg-emerald-600 px-4 py-2 text-white">
        Upload via Cloudinary
      </button>

      {uploading && (
        <div className="w-full">
          <div className="h-2 w-full rounded bg-zinc-200">
            <div style={{ width: `${progress}%` }} className="h-2 rounded bg-emerald-500 transition-all" />
          </div>
          <div className="text-sm text-zinc-500">Uploading... {progress}%</div>
        </div>
      )}

      {savedAssets.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-sm font-medium">Saved uploads</div>
          {savedAssets.map((a, idx) => (
            <div key={idx} className="text-xs text-emerald-700">
              <a href={a.url} target="_blank" rel="noreferrer" className="underline">
                {a.filename || a.url}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
