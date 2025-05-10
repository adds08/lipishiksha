"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, DEFAULT_GRID_ROWS, DEFAULT_GRID_COLS } from "@/lib/constants";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const labelingFormSchema = z.object({
  language: z.string().min(1, "Please select a language."),
  gridDescription: z.string().min(10, "Please provide a detailed grid description (e.g., 'A 5x5 grid of characters').").max(200, "Description is too long."),
  rows: z.coerce.number().min(1).max(50).default(DEFAULT_GRID_ROWS),
  cols: z.coerce.number().min(1).max(50).default(DEFAULT_GRID_COLS),
});

export type LabelingFormValues = z.infer<typeof labelingFormSchema>;

interface LabelingFormProps {
  onSubmit: (values: LabelingFormValues) => void;
  isSubmitting: boolean;
}

export function LabelingForm({ onSubmit, isSubmitting }: LabelingFormProps) {
  const form = useForm<LabelingFormValues>({
    resolver: zodResolver(labelingFormSchema),
    defaultValues: {
      language: SUPPORTED_LANGUAGES[0].value,
      gridDescription: `A ${DEFAULT_GRID_ROWS}x${DEFAULT_GRID_COLS} grid of characters.`,
      rows: DEFAULT_GRID_ROWS,
      cols: DEFAULT_GRID_COLS,
    },
  });

  const handleFormSubmit = (values: LabelingFormValues) => {
    // Construct a more detailed gridDescription if needed, or use user's input.
    // For now, we'll primarily use rows and cols for UI grid generation, 
    // and user's gridDescription for the AI.
    const refinedValues = {
        ...values,
        gridDescription: values.gridDescription || `A ${values.rows}x${values.cols} grid of characters for language ${values.language}.`
    };
    onSubmit(refinedValues);
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>AI Labeling Parameters</CardTitle>
        <CardDescription>
          Provide details about the practice sheet to help the AI suggest labels.
          The number of rows and columns will be used to structure the labeling interface.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language of Characters</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gridDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character Grid Description (for AI)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A 10x10 grid of handwritten Nepali characters."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the layout of characters on the sheet. This helps the AI understand the image content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="rows"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Grid Rows (for UI)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} />
                    </FormControl>
                    <FormDescription>Number of rows to create for labeling.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="cols"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Grid Columns (for UI)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)}/>
                    </FormControl>
                    <FormDescription>Number of columns to create for labeling.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>


            <Button type="submit" disabled={isSubmitting} className="w-full">
              <Lightbulb className="mr-2 h-4 w-4" />
              {isSubmitting ? "Suggesting Labels..." : "Suggest Labels with AI"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
