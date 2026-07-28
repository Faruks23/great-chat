"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, LoginFormData } from "@/schemas/login.schema";
import { login } from "@/services/authService";
import { saveAuthSession } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const identifier = watch("identifier");

  const onSubmit = async (data: LoginFormData) => {
    try {
      const isPhone = /^\+?[0-9\s-]{7,15}$/.test(data.identifier.trim());

      const response = await login({
        ...(isPhone
          ? { phone: data.identifier.trim() }
          : { email: data.identifier.trim() }),
        password: data.password,
      });
    
         console.log("Login response:", response); // Log the response for debugging

      saveAuthSession(response.data);
 
      refresh?.();

      router.push("/chat");
    } catch (err) {
      setError("root", {
        message:
          err instanceof Error ? err.message : "Login failed.",
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue to Great Chat.
        </CardDescription>
      </CardHeader>

      
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="identifier">
              Email or phone number
            </Label>

            <Input
              id="identifier"
              placeholder="you@example.com or +123456789"
              {...register("identifier")}
            />

            {errors.identifier && (
              <p className="text-sm text-destructive">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              {...register("password")}
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
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
     
    </Card>
  );
}