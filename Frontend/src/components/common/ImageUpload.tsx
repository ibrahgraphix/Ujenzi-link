import React, { useCallback, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { uploadImage, deleteUploadedImage, UploadedImage, UploadFolderType } from '../../services/uploadService';
import { thumbnailUrl } from '../../utils/imagekit';

interface ImageUploadProps {
  value?: UploadedImage | UploadedImage[] | null;
  onChange: (value: UploadedImage | UploadedImage[] | null) => void;
  multiple?: boolean;
  folderType: UploadFolderType;
  entityId?: string;
  label?: string;
  hint?: string;
  maxFiles?: number;
}

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 1.5,
    useWebWorker: true,
    initialQuality: 0.82,
  });
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  folderType,
  entityId,
  label = 'Upload Image',
  hint = 'JPEG, PNG, or WebP up to 5MB. Images are compressed before upload.',
  maxFiles = 8,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const images: UploadedImage[] = multiple
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : value && !Array.isArray(value)
      ? [value]
      : [];

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      setError(null);
      setIsUploading(true);
      setProgress(0);

      try {
        const files = Array.from(fileList);
        const remaining = multiple ? maxFiles - images.length : 1;
        const toUpload = files.slice(0, remaining);

        const uploaded: UploadedImage[] = [];

        for (let i = 0; i < toUpload.length; i++) {
          const compressed = await compressImage(toUpload[i]);
          const result = await uploadImage(compressed, folderType, entityId, (pct) => {
            const overall = Math.round(((i + pct / 100) / toUpload.length) * 100);
            setProgress(overall);
          });
          uploaded.push(result);
        }

        if (multiple) {
          onChange([...images, ...uploaded]);
        } else {
          onChange(uploaded[0] || null);
        }
      } catch (err: any) {
        setError(err?.message || 'Upload failed');
      } finally {
        setIsUploading(false);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [entityId, folderType, images, maxFiles, multiple, onChange]
  );

  const handleRemove = async (index: number) => {
    const target = images[index];
    if (target?.fileId) {
      deleteUploadedImage(target.fileId).catch(() => {});
    }

    if (multiple) {
      const next = images.filter((_, i) => i !== index);
      onChange(next.length > 0 ? next : []);
    } else {
      onChange(null);
    }
  };

  const canAddMore = multiple ? images.length < maxFiles : images.length === 0;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      {images.length > 0 && (
        <div className={`grid gap-2 ${multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
          {images.map((img, index) => (
            <div
              key={`${img.fileId}-${index}`}
              className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[4/3]"
            >
              <img
                src={thumbnailUrl(img.url)}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isUploading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!isUploading) handleFiles(e.dataTransfer.files);
          }}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#2E86D8] bg-blue-50'
              : 'border-slate-300 bg-slate-50 hover:border-[#2E86D8] hover:bg-blue-50/50'
          } ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#2E86D8] animate-spin" />
              <span className="text-xs font-semibold text-slate-600">Uploading… {progress}%</span>
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2E86D8] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                {multiple ? (
                  <ImageIcon className="w-5 h-5 text-[#2E86D8]" />
                ) : (
                  <Upload className="w-5 h-5 text-[#2E86D8]" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  {multiple ? 'Drag & drop images or click to browse' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>
              </div>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
