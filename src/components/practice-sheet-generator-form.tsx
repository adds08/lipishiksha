
"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PracticeSheetConfig } from "@/app/generator/page"; // Will be updated

// Define the structure for available languages more explicitly
export interface AvailableLanguage {
  value: string; // e.g., 'ne', 'en'
  label: string; // e.g., 'Nepali (Preeti)', 'English (Arial)'
}

const formSchema = z.object({
  language: z.string().min(1, "Please select a language."),
});

type PracticeSheetFormValues = z.infer<typeof formSchema>;

interface PracticeSheetGeneratorFormProps {
  onConfigChange: (config: PracticeSheetConfig) => void;
  defaultConfig: PracticeSheetConfig;
  availableLanguages: AvailableLanguage[]; // Changed from SUPPORTED_LANGUAGES
  isLoadingLanguages: boolean;
}

export function PracticeSheetGeneratorForm({ 
  onConfigChange, 
  defaultConfig, 
  availableLanguages,
  isLoadingLanguages 
}: PracticeSheetGeneratorFormProps) {
  const form = useForm<PracticeSheetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: defaultConfig.language,
    },
  });

  // Effect to update form if defaultConfig.language changes (e.g., after languages load)
  useEffect(() => {
    if (defaultConfig.language && form.getValues("language") !== defaultConfig.language) {
      form.reset({ language: defaultConfig.language });
    }
  }, [defaultConfig.language, form]);

  // Effect to subscribe to form changes and call onConfigChange
  useEffect(() => {
    const subscription = form.watch((values) => {
      const parsedValues = formSchema.safeParse(values);
      if (parsedValues.success) {
        // Ensure that onConfigChange is called with the correct type.
        // The PracticeSheetConfig now might just be { language: string }
        onConfigChange({ language: parsedValues.data.language });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onConfigChange]);


  return (
    <Form {...form}>
      <form className="space-y-6"> {/* onSubmit removed as updates are via watch */}
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language & Font</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value} // Use value for controlled component
                disabled={isLoadingLanguages || availableLanguages.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingLanguages ? "Loading languages..." : "Select a language/font"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableLanguages.length > 0 ? (
                    availableLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))
                  ) : (
                    !isLoadingLanguages && <SelectItem value="no-fonts" disabled>No fonts available. Please upload fonts in Admin.</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose a language and its associated font. The practice sheet will use characters from this font.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

