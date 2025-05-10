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
  character: z.string().min(1, "Please enter a character.").max(5, "Character input is too long."),
  rows: z.coerce.number().min(1, "Minimum 1 row.").max(50, "Maximum 50 rows."),
  cols: z.coerce.number().min(1, "Minimum 1 column.").max(50, "Maximum 50 columns."),
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
      character: defaultConfig.character,
      rows: defaultConfig.rows,
      cols: defaultConfig.cols,
    },
  });

  function onSubmit(values: PracticeSheetFormValues) {
    onConfigChange(values);
  }

  // Update preview dynamically on field change
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                Choose the language for the practice sheet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="character"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><PenLine className="w-4 h-4" /> Character to Practice</FormLabel>
              <FormControl>
                <Input placeholder="e.g., A, क" {...field} />
              </FormControl>
              <FormDescription>
                Enter the single character or very short text to be displayed in each grid cell.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
        {/* The form submission is handled by useEffect watching changes, so a submit button isn't strictly necessary for live updates. 
            If explicit submission before preview update is desired, uncomment this:
        <Button type="submit" className="w-full md:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" /> Update Preview
        </Button> 
        */}
      </form>
    </Form>
  );
}
