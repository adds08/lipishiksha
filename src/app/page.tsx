import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { PenTool, ScanLine, Lightbulb } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center text-center space-y-12">
        <section className="mt-8 md:mt-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
            Welcome to Lipi Shiksha
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive tool for generating handwriting practice sheets and leveraging AI for efficient character labeling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/generator">
                <PenTool className="mr-2 h-5 w-5" /> Create Practice Sheet
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/labeling">
                <ScanLine className="mr-2 h-5 w-5" /> Label Scanned Sheet
              </Link>
            </Button>
          </div>
        </section>

        <section className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <PenTool className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Practice Sheet Generator</CardTitle>
              </div>
              <CardDescription>
                Easily create and print custom handwriting practice sheets. Choose your language, characters, and grid layout. Perfect for learners of all ages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Image 
                src="https://picsum.photos/seed/practice/600/400" 
                alt="Practice Sheet Example" 
                width={600} 
                height={400} 
                className="rounded-md object-cover aspect-video"
                data-ai-hint="handwriting practice" 
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                 <Lightbulb className="h-8 w-8 text-accent" />
                <CardTitle className="text-2xl">AI-Powered Labeling</CardTitle>
              </div>
              <CardDescription>
                Upload your scanned practice sheets and let our AI suggest character labels. Verify or correct them with ease to prepare data for handwriting recognition models.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Image 
                src="https://picsum.photos/seed/labeling/600/400" 
                alt="AI Labeling Example" 
                width={600} 
                height={400} 
                className="rounded-md object-cover aspect-video"
                data-ai-hint="AI interface"
              />
            </CardContent>
          </Card>
        </section>

        <section className="py-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Empowering Language Learning and AI</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
                Lipi Shiksha aims to bridge the gap between traditional learning methods and modern AI capabilities,
                especially for diverse languages like Nepali.
            </p>
        </section>

      </div>
    </MainLayout>
  );
}
