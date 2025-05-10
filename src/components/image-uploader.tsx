"use client";

import { useState, useCallback, ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, XCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (imageDataUri: string, file: File) => void;
  maxSizeMb?: number;
}

export function ImageUploader({ onImageUpload, maxSizeMb = 5 }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setFileName(file.name);

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type. Please upload an image (${allowedTypes.join(', ')}).`);
        setPreview(null);
        setFileName(null);
        event.target.value = ""; // Reset file input
        return;
      }

      // Validate file size
      const maxSizeInBytes = maxSizeMb * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
        setPreview(null);
        setFileName(null);
        event.target.value = ""; // Reset file input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageUpload(result, file);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setPreview(null);
        setFileName(null);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setFileName(null);
    }
  }, [onImageUpload, maxSizeMb]);

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    setFileName(null);
    const input = document.getElementById('image-upload-input') as HTMLInputElement;
    if (input) input.value = "";
    // Call onImageUpload with null to signify removal if parent needs to know
    // onImageUpload(null, null); // This depends on parent component logic
  };

  return (
    <div className="space-y-4">
      <div className="w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer bg-card relative">
        <Label htmlFor="image-upload-input" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
          <UploadCloud className="w-12 h-12 text-muted-foreground group-hover:text-primary" />
          <span className="text-primary font-medium">Click to upload or drag and drop</span>
          <span className="text-xs text-muted-foreground">PNG, JPG, GIF, WEBP up to {maxSizeMb}MB</span>
        </Label>
        <Input
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive p-3 bg-destructive/10 rounded-md">
          <XCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {preview && !error && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">Image selected: {fileName}</p>
          </div>
          <div className="relative group w-full max-w-md mx-auto border rounded-md overflow-hidden shadow-sm">
            <Image
              src={preview}
              alt="Uploaded preview"
              width={400}
              height={300}
              className="object-contain w-full h-auto max-h-80"
              data-ai-hint="uploaded image"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
