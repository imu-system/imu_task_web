"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createTask } from "@/lib/firestore-tasks";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

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

  const onSubmit = async (data: FormData) => {
    // Check if user is authenticated
    if (!user) {
      setError("Vous devez être connecté pour créer une tâche");
      toast({
        title: "Authentication Required",
        description: "Please login to create a task.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create task in Firestore
      const newTaskId = await createTask(user.uid, {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        budget: data.budget,
        deadline: null, // Can be added later
      });

      setTaskId(newTaskId);
      
      toast({
        title: "✅ Task Posted!",
        description: "Your task has been successfully posted.",
      });
      
      setIsSubmitted(true);
      
      // Redirect to tasks page after 2 seconds
      setTimeout(() => {
        router.push('/tasks');
      }, 2000);
    } catch (err: any) {
      console.error("Error creating task:", err);
      setError(err.message || "Failed to create task. Please try again.");
      
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
   if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[50vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-50 p-3">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold mb-4">
            Task Submitted Successfully!
          </CardTitle>
          <CardDescription className="mb-2">
            Providers will now be able to view and bid on your task.
          </CardDescription>
          {taskId && (
            <p className="text-sm text-muted-foreground mb-6">
              Task ID: <code className="font-mono bg-muted px-2 py-1 rounded">{taskId}</code>
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-8">
            Redirecting to your tasks...
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/tasks">View My Tasks</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tasks/new" onClick={() => { setIsSubmitted(false); setCurrentStep(0); setTaskId(null); }}>
                Post Another Task
              </Link>
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!user && (
          <Alert className="mb-4">
            <AlertDescription>
              You must be <Link href="/auth/login" className="underline font-medium">logged in</Link> to create a task.
            </AlertDescription>
          </Alert>
        )}
        
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
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 0 || loading}
          type="button"
        >
          Previous
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} type="button" disabled={loading}>
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit(onSubmit)} 
            type="button"
            disabled={loading || !user}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating task...
              </>
            ) : (
              'Submit Task'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
