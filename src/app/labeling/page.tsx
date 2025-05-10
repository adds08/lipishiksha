"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ImageUploader } from "@/components/image-uploader";
import { ImageEditor } from "@/components/image-editor";
import { LabelingForm, type LabelingFormValues } from "@/components/labeling-form";
import { LabelingInterface } from "@/components/labeling-interface";
import { generateLabels } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type LabelingStep = "upload" | "params" | "label";

export default function LabelingPage() {
  const [step, setStep] = useState<LabelingStep>("upload");
  
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageRotation, setImageRotation] = useState(0);
  
  const [labelingParams, setLabelingParams] = useState<LabelingFormValues | null>(null);
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>([]);
  
  const [isSubmittingAi, setIsSubmittingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleImageUpload = (dataUri: string, file: File) => {
    setImageDataUri(dataUri);
    setUploadedImageFile(file); // Keep file if needed for other processing
    setImageRotation(0); // Reset rotation on new image
    setStep("params");
    setAiError(null); // Clear previous errors
    setSuggestedLabels([]); // Clear previous labels
  };

  const handleRotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleParamsSubmit = async (values: LabelingFormValues) => {
    setLabelingParams(values);
    setAiError(null);
    setIsSubmittingAi(true);

    if (!imageDataUri) {
      toast({ title: "Error", description: "No image uploaded to process.", variant: "destructive" });
      setIsSubmittingAi(false);
      return;
    }

    // Apply rotation to image data if any before sending to AI.
    // This is complex. For now, we send the original image.
    // True rotation of image data would require canvas manipulation.
    // The AI will receive the un-rotated image. The displayed rotation is for user convenience.

    const aiInput = {
      practiceSheetDataUri: imageDataUri,
      language: values.language,
      characterGridDescription: values.gridDescription,
    };

    const result = await generateLabels(aiInput);
    setIsSubmittingAi(false);

    if (result.success && result.data) {
      setSuggestedLabels(result.data.suggestedLabels);
      setStep("label");
      toast({ title: "AI Suggestions Ready", description: "Labels suggested by AI. Please review and correct." });
    } else {
      setAiError(result.error || "Failed to get AI suggestions.");
      toast({ title: "AI Suggestion Failed", description: result.error || "An unknown error occurred.", variant: "destructive" });
    }
  };

  const handleSaveLabels = (finalLabels: string[]) => {
    console.log("Final labels to save:", finalLabels);
    // Here you would typically send these labels to a backend/database
    toast({ title: "Labels Saved", description: "Your corrected labels have been saved (logged to console)." });
  };
  
  const renderStepContent = () => {
    switch (step) {
      case "upload":
        return (
          <Card className="w-full max-w-lg mx-auto shadow-lg">
            <CardHeader>
              <CardTitle>Step 1: Upload Practice Sheet</CardTitle>
              <CardDescription>Select the scanned handwriting practice sheet image from your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onImageUpload={handleImageUpload} />
            </CardContent>
          </Card>
        );
      case "params":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <ImageEditor 
              imageDataUri={imageDataUri} 
              rotation={imageRotation} 
              onRotate={handleRotateImage} 
            />
            <div className="sticky top-20"> {/* Sticky for form */}
              <LabelingForm onSubmit={handleParamsSubmit} isSubmitting={isSubmittingAi} />
              {aiError && (
                 <Alert variant="destructive" className="mt-4">
                   <AlertTitle>AI Error</AlertTitle>
                   <AlertDescription>{aiError}</AlertDescription>
                 </Alert>
              )}
              {isSubmittingAi && (
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>AI is processing the image...</span>
                </div>
              )}
            </div>
          </div>
        );
      case "label":
        if (!labelingParams) return <p>Error: Labeling parameters not set.</p>; // Should not happen
        return (
          <LabelingInterface
            imageDataUri={imageDataUri}
            imageRotation={imageRotation}
            initialLabels={suggestedLabels}
            gridRows={labelingParams.rows}
            gridCols={labelingParams.cols}
            onSaveLabels={handleSaveLabels}
            language={labelingParams.language}
          />
        );
      default:
        return <p>Unknown step</p>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Image Labeling</h1>
          <p className="text-muted-foreground">
            Upload your scanned practice sheet, get AI-powered label suggestions, and manually verify or correct them.
          </p>
        </header>
        
        {/* Progress Indicator could go here if desired */}
        <div className="flex justify-center mb-6 space-x-2 sm:space-x-4">
            { (["upload", "params", "label"] as LabelingStep[]).map((s, i) => (
                <div key={s} className="flex items-center">
                    <button 
                        onClick={() => {
                            // Allow navigation to previous steps if conditions met
                            if (s === "upload") setStep("upload");
                            if (s === "params" && imageDataUri) setStep("params");
                            // Don't allow jumping to "label" without params
                        }}
                        disabled={ (s === "params" && !imageDataUri) || (s === "label" && (!labelingParams || suggestedLabels.length === 0)) }
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                            ${step === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        Step {i+1}: {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                    {i < 2 && <Separator orientation="horizontal" className="w-4 sm:w-8 mx-1 sm:mx-2 bg-border" />}
                </div>
            ))}
        </div>

        <div className="rounded-lg p-0 md:p-2"> {/* Optional subtle background for content area */}
          {renderStepContent()}
        </div>
      </div>
    </MainLayout>
  );
}
