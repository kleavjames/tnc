"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { signIn, type SignInState } from "../lib/sign-in";

const initialState: SignInState = { error: null };

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="h-10"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-10"
          />
        </Field>
      </FieldGroup>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="xl" className="w-full" disabled={pending}>
        {pending ? "Signing in" : "SIGN IN"}
      </Button>

      <FieldDescription>
        Not on the ministry team? Sermons are available to everyone at{" "}
        <a href="https://truenorth.church/sermons">truenorth.church/sermons</a>
      </FieldDescription>
    </form>
  );
}
