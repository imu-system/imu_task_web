"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

const step2Schema = z.object({
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(2, "Location is required"),
  budget: z.coerce.number().min(5, "Budget must be at least $5"),
});

const formSchema = step1Schema.merge(step2Schema);

type FormData = z.infer<typeof formSchema>;

const steps = [
  {
    id: 1,
    title: "Task Details",
    description: "Provide a title and detailed description for your task.",
    fields: ["title", "description"],
  },
  {
    id: 2,
    title: "Category & Budget",
    description: "Help providers find your task by adding key details.",
    fields: ["category", "location", "budget"],
  },
  {
    id: 3,
    title: "Review & Submit",
    description: "Review the details and post your task.",
  },
];

export function NewTaskForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const params = useParams();
  const locale = params.locale;

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const formData = watch();

  type FieldName = keyof FormData;

  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], {
      shouldFocus: true,
    });
    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted", data);
    toast({
      title: "Task Posted!",
      description: "Your task has been successfully posted.",
    });
    setIsSubmitted(true);
  };
  
   if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[50vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl font-bold mb-4">Task Submitted Successfully!</CardTitle>
          <CardDescription className="mb-8">Providers will now be able to view and bid on your task.</CardDescription>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href={`/${locale}`}>Back to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/tasks/new`} onClick={() => { setIsSubmitted(false); setCurrentStep(0); }}>Post Another Task</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., I need a logo for my new company"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Task Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide as much detail as possible..."
                      {...register("description")}
                      className="min-h-[150px]"
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => register("category").onChange({ target: { value, name: "category" } })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="web-development">Web Development</SelectItem>
                            <SelectItem value="graphic-design">Graphic Design</SelectItem>
                            <SelectItem value="content-writing">Content Writing</SelectItem>
                            <SelectItem value="plumbing">Plumbing</SelectItem>
                            <SelectItem value="it-support">IT Support</SelectItem>
                        </SelectContent>
                    </Select>
                     {errors.category && (
                      <p className="text-sm text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., New York, NY or 'Remote'"
                      {...register("location")}
                    />
                     {errors.location && (
                      <p className="text-sm text-destructive">
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 500"
                      {...register("budget")}
                    />
                     {errors.budget && (
                      <p className="text-sm text-destructive">
                        {errors.budget.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Review Your Task</h3>
                  <div className="p-4 border rounded-lg space-y-2 bg-muted/50">
                    <p><strong>Title:</strong> {formData.title}</p>
                    <p><strong>Description:</strong> {formData.description}</p>
                    <p><strong>Category:</strong> {formData.category}</p>
                    <p><strong>Location:</strong> {formData.location}</p>
                    <p><strong>Budget:</strong> ${formData.budget}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">By submitting, you agree to our terms and conditions.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleSubmit(onSubmit)}>Submit Task</Button>
        )}
      </CardFooter>
    </Card>
  );
}
