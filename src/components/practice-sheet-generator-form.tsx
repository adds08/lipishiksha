
"use client";

import * as React from "react";
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
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import type { PracticeSheetConfig } from "@/app/generator/page";

const formSchema = z.object({
  language: z.string().min(1, "Please select a language."),
});

type PracticeSheetFormValues = z.infer<typeof formSchema>;

interface PracticeSheetGeneratorFormProps {
  onConfigChange: (config: PracticeSheetConfig) => void;
  defaultConfig: PracticeSheetConfig;
}

export function PracticeSheetGeneratorForm({ onConfigChange, defaultConfig }: PracticeSheetGeneratorFormProps) {
  const form = useForm<PracticeSheetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: defaultConfig.language,
    },
  });

  React.useEffect(() => {
    // Update the form if defaultConfig changes externally
    form.reset({ language: defaultConfig.language });
  }, [defaultConfig, form]);

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      const parsedValues = formSchema.safeParse(values);
      if (parsedValues.success) {
        onConfigChange(parsedValues.data as PracticeSheetConfig);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onConfigChange, formSchema]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(values => onConfigChange(values as PracticeSheetConfig))} className="space-y-6">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
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
              <FormDescription>
                Choose the language to generate all its standard alphabets.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

