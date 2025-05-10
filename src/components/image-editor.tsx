"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface ImageEditorProps {
  imageDataUri: string | null;
  rotation: number;
  onRotate: () => void;
}

export function ImageEditor({ imageDataUri, rotation, onRotate }: ImageEditorProps) {
  if (!imageDataUri) {
    return null; // Don't render if no image
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Image Preview & Adjust</CardTitle>
        <CardDescription>Review your uploaded image. Basic adjustments can be made here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-[4/3] max-w-xl mx-auto border rounded-md overflow-hidden bg-muted/20 flex items-center justify-center">
          {imageDataUri ? (
            <Image
              src={imageDataUri}
              alt="Uploaded practice sheet"
              fill
              className="object-contain transition-transform duration-300 ease-in-out"
              style={{ transform: `rotate(${rotation}deg)` }}
              data-ai-hint="scanned document"
            />
          ) : (
             <p className="text-muted-foreground">No image uploaded</p>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={onRotate} variant="outline" disabled={!imageDataUri}>
            <RotateCw className="mr-2 h-4 w-4" /> Rotate 90°
          </Button>
          {/* Placeholder for Crop functionality */}
          {/* <Button variant="outline" disabled={!imageDataUri}>
            <Crop className="mr-2 h-4 w-4" /> Crop Image (Coming Soon)
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
