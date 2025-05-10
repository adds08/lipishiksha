
"use client";

import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, DEFAULT_GRID_ROWS, DEFAULT_GRID_COLS } from "@/lib/constants";
import { PenLine, Rows, ColumnsIcon } from "lucide-react";
import type { PracticeSheetConfig } from "@/app/generator/page";

const formSchema = z.object({
  language: z.string().min(1, "Please select a language."),
  character: z.string().max(5, "Character input is too long (max 5 characters).").optional(),
  rows: z.coerce.number().min(1, "Minimum 1 row.").max(50, "Maximum 50 rows."),
  cols: z.coerce.number().min(1, "Minimum 1 column.").max(50, "Maximum 50 columns."),
}).superRefine((values, ctx) => {
  if (values.language !== 'ne') { // Character is required only if language is not Nepali
    if (!values.character || values.character.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["character"],
        message: "Please enter a character.",
      });
    } else if (values.character.length > 5) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["character"],
        message: "Character input is too long (max 5 characters).",
      });
    }
  }
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
      character: defaultConfig.language === 'ne' ? undefined : (defaultConfig.character || "A"),
      rows: defaultConfig.rows,
      cols: defaultConfig.cols,
    },
  });

  const selectedLanguage = form.watch("language");

  React.useEffect(() => {
    // When language changes to Nepali, clear character field if it's not already for Nepali full alphabet mode
    if (selectedLanguage === 'ne' && form.getValues("character") !== undefined) {
      form.setValue("character", undefined, { shouldValidate: true });
    }
    // When language changes from Nepali to something else, set a default character if it's empty
    // This ensures the form remains valid or prompts for character input.
    if (selectedLanguage !== 'ne' && (form.getValues("character") === undefined || form.getValues("character") === "")) {
       form.setValue("character", "A", { shouldValidate: true });
    }
  }, [selectedLanguage, form]);


  React.useEffect(() => {
    const subscription = form.watch((values) => {
      const currentValues: Partial<PracticeSheetFormValues> = {
        ...values,
        rows: values.rows !== undefined ? Number(values.rows) : defaultConfig.rows,
        cols: values.cols !== undefined ? Number(values.cols) : defaultConfig.cols,
      };
      
      // If language is Nepali, ensure character is undefined for the config
      if (currentValues.language === 'ne') {
        currentValues.character = undefined;
      }

      const parsedValues = formSchema.safeParse(currentValues);
      if (parsedValues.success) {
        onConfigChange(parsedValues.data as PracticeSheetConfig);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onConfigChange, defaultConfig, formSchema]);


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
                  // Trigger re-validation or specific logic if needed when language changes
                  if (value === 'ne') {
                    form.setValue('character', undefined, {shouldValidate: true});
                  } else if (form.getValues('character') === undefined) {
                     form.setValue('character', 'A', {shouldValidate: true});
                  }
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
                Choose the language. Nepali will generate all standard alphabets.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedLanguage !== 'ne' && (
          <FormField
            control={form.control}
            name="character"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><PenLine className="w-4 h-4" /> Character to Practice</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., A" 
                    {...field} 
                    value={field.value || ""} // Ensure controlled component even if value is undefined
                    disabled={selectedLanguage === 'ne'}
                  />
                </FormControl>
                <FormDescription>
                  Enter the single character or very short text (max 5). Hidden for Nepali.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="rows"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Rows className="w-4 h-4" /> Grid Rows</FormLabel>
                <FormControl>
                  <Input type="number" placeholder={`Default: ${DEFAULT_GRID_ROWS}`} {...field} />
                </FormControl>
                <FormDescription>Number of rows in the grid.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cols"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><ColumnsIcon className="w-4 h-4" /> Grid Columns</FormLabel>
                <FormControl>
                  <Input type="number" placeholder={`Default: ${DEFAULT_GRID_COLS}`} {...field} />
                </FormControl>
                <FormDescription>Number of columns in the grid.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
