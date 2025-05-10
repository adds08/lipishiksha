
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
    // Only reset the form's language field if defaultConfig.language
    // is different from the current value in the form.
    // This prevents an infinite loop where form.reset triggers form.watch,
    // which calls onConfigChange, which updates defaultConfig, leading back here.
    if (form.getValues("language") !== defaultConfig.language) {
      form.reset({ language: defaultConfig.language });
    }
  }, [defaultConfig.language, form]); // form instance is stable, includes getValues and reset

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      const parsedValues = formSchema.safeParse(values);
      if (parsedValues.success) {
        onConfigChange(parsedValues.data as PracticeSheetConfig);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onConfigChange]); // form instance and onConfigChange are stable


  return (
    <Form {...form}>
      {/* The onSubmit on the form tag is not strictly necessary here if we only have one field 
          and updates happen on change, but it's harmless. */}
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
                  // form.handleSubmit is not needed here for on-change updates
                  // The form.watch effect handles calling onConfigChange
                }}
                defaultValue={field.value} // defaultValue should generally be used for uncontrolled or initial setup.
                                          // For controlled components with react-hook-form, field.value is usually enough for SelectValue.
                                          // However, SelectTrigger might need it for initial display if SelectValue isn't sufficient.
                                          // Or use `value={field.value}` on Select component itself.
                                          // Given the setup, defaultValue on Select and field.value for SelectValue should work.
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
        {/* No submit button is rendered as per previous changes, changes are instant via onConfigChange */}
      </form>
    </Form>
  );
}
