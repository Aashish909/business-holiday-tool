"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { createAdmin, createEmployee } from "@/lib/actions/onboarding";

const formSchema = z.object({
  accountType: z.enum(["employee", "admin"]),
  // Employee fields
  department: z.string().optional(),
  invitationCode: z.string().optional(),
  // Admin fields
  companyName: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyLogo: z.string().optional(),
}).refine(data => {
  if (data.accountType === 'employee') {
    return !!data.invitationCode && data.invitationCode.length === 6;
  }
  return true;
}, {
  message: "Invitation code must be 6 characters long",
  path: ["invitationCode"],
}).refine(data => {
  if (data.accountType === 'admin') {
    return !!data.companyName && data.companyName.length > 0;
  }
  return true;
}, {
  message: "Company name is required",
  path: ["companyName"],
});

type FormValues = z.infer<typeof formSchema>;

interface OnboardingFormProps {
  userId: string;
}

const OnboardingForm = ({
  userId,
}: OnboardingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "employee",
      invitationCode: "",
      department: "",
      companyName: "",
      companyWebsite: "",
      companyLogo: "",
    },
  });

  const accountType = form.watch("accountType");

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError("");

    let response;
    try {
      if (data.accountType === "employee") {
        response = await createEmployee(
          data.department,
          userId,
          data.invitationCode!
        );
      } else {
        response = await createAdmin(
          data.companyName!,
          data.companyWebsite || "",
          data.companyLogo || "",
          userId
        );
      }

      if (response?.success) {
        console.log("Onboarding completed successfully");
        if (response.token) {
          await fetch("/api/auth/update-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.token }),
          });
        }
        toast.success("Onboarding completed successfully.");
        window.location.reload(); // Force a reload to trigger middleware redirect
      } else {
        throw new Error("Onboarding failed. Please check your input and try again.");
      }
    } catch (err: unknown) {
      console.error(`Error during onboarding: ${err}`);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Complete your account setup
        </CardTitle>
        <CardDescription>
          Welcome to NextLeave! Let&apos;s get you onboarded.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-base">Account Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="employee" id="employee" className="peer sr-only" />
                        </FormControl>
                        <Label
                          htmlFor="employee"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                           Employee
                           <span className="text-sm text-muted-foreground mt-1">
                            Join an existing company
                          </span>
                        </Label>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                           <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                        </FormControl>
                        <Label
                          htmlFor="admin"
                           className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Admin
                          <span className="text-sm text-muted-foreground mt-1">
                            Create a new company
                          </span>
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {accountType === "employee" && (
              <>
                <FormField
                  control={form.control}
                  name="invitationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your 6-digit invitation code"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the invitation code provided by your company admin.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Engineering, Marketing" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                       <FormDescription>
                        Which department do you work in?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {accountType === "admin" && (
              <>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your company name" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourcompany.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyLogo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/logo.png"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a URL to your company logo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Setting up..."
                : accountType === "admin"
                ? "Create Company"
                : "Complete Setup"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OnboardingForm;
