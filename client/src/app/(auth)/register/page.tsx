"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  RegisterFormData,
} from "@/schemas/register.schema";

import { register } from "@/services/authService";
import { saveAuthSession } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const {
    register: formRegister,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const email = watch("email");
  const phone = watch("phone");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await register({
        name: data.name,
        password: data.password,
        ...(email && { email }),
        ...(phone && { phone }),
      });

      saveAuthSession(response);

      refresh?.();

      router.push("/chat");
    } catch (err) {
      setError("root", {
        message:
          err instanceof Error
            ? err.message
            : "Registration failed.",
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>

        <CardDescription>
          Register a new account to start chatting.
        </CardDescription>
      </CardHeader>

    
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label>Name</Label>

            <Input {...formRegister("name")} />

            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              type="email"
              placeholder="Optional"
              {...formRegister("email")}
            />

            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>

            <Input
              type="tel"
              placeholder="Optional"
              {...formRegister("phone")}
            />

            {errors.phone && (
              <p className="text-sm text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Password</Label>

            <Input
              type="password"
              {...formRegister("password")}
            />

            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <Button
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating account..."
              : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
     
    </Card>
  );
}