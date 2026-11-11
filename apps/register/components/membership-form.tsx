"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/utils";
import type { ChurchBranch } from "@/lib/church-branches";
import { registerMember } from "@/lib/register-member";

const cardClass =
  "[--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

const CIVIL_STATUSES = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
] as const;

const WEEKDAYS = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
] as const;

const LEADER = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

type Gender = (typeof GENDERS)[number]["value"];
type CivilStatus = (typeof CIVIL_STATUSES)[number]["value"];
type Weekday = (typeof WEEKDAYS)[number]["value"];

type Meeting = {
  id: string;
  name: string;
  description: string;
  days: Weekday[];
  time: string;
};

type FormValues = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  messengerName: string;
  birthdate: string;
  gender: Gender | null;
  civilStatus: CivilStatus | null;
  branch: string | null;
  isDgroupLeader: boolean;
  meetings: Meeting[];
};

type Errors = Record<string, string>;

const PERSON_FIELDS = [
  "firstName",
  "lastName",
  "mobileNumber",
  "email",
  "birthdate",
  "gender",
  "civilStatus",
  "branch",
] as const;

function emptyForm(): FormValues {
  return {
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    messengerName: "",
    birthdate: "",
    gender: null,
    civilStatus: null,
    branch: null,
    isDgroupLeader: false,
    meetings: [],
  };
}

function blankMeeting(): Meeting {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    days: [],
    time: "",
  };
}

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function sortDays(days: Weekday[]): Weekday[] {
  return WEEKDAYS.map((day) => day.value).filter((day) => days.includes(day));
}

function validate(values: FormValues): Errors {
  const errors: Errors = {};

  if (!values.firstName.trim()) errors.firstName = "Enter a first name.";
  if (!values.lastName.trim()) errors.lastName = "Enter a last name.";
  if (!values.mobileNumber.trim()) {
    errors.mobileNumber = "Enter a mobile number.";
  }
  if (
    values.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {
    errors.email = "Enter a valid email.";
  }
  if (!values.birthdate) {
    errors.birthdate = "Enter a birthdate.";
  } else if (values.birthdate > todayIso()) {
    errors.birthdate = "Birthdate cannot be in the future.";
  }
  if (!values.gender) errors.gender = "Choose male or female.";
  if (!values.civilStatus) errors.civilStatus = "Choose a civil status.";
  if (!values.branch) errors.branch = "Choose a church branch.";

  if (values.isDgroupLeader) {
    for (const meeting of values.meetings) {
      if (!meeting.name.trim()) {
        errors[`meeting.${meeting.id}.name`] = "Enter the meeting name.";
      }
      if (meeting.days.length === 0) {
        errors[`meeting.${meeting.id}.days`] = "Choose at least one day.";
      }
      if (!meeting.time) {
        errors[`meeting.${meeting.id}.time`] = "Enter a meeting time.";
      }
    }
  }

  return errors;
}

function firstErrorId(errors: Errors, meetings: Meeting[]): string | null {
  for (const key of PERSON_FIELDS) {
    if (errors[key]) return key;
  }
  for (const meeting of meetings) {
    for (const field of ["name", "days", "time"] as const) {
      const key = `meeting.${meeting.id}.${field}`;
      if (errors[key]) return key;
    }
  }
  return null;
}

function ChoiceGroup<T extends string>({
  id,
  label,
  value,
  options,
  invalid,
  onChange,
}: {
  id: string;
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  invalid?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <div
      id={id}
      role="group"
      aria-label={label}
      aria-invalid={invalid || undefined}
      tabIndex={-1}
      className="flex flex-wrap gap-2 outline-none"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={selected ? "default" : "outline"}
            aria-pressed={selected}
            className="rounded-full px-4"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

export function MembershipForm({
  branches,
}: {
  /** Null when the branches could not be loaded. */
  branches: ChurchBranch[] | null;
}) {
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const branchOptions = (branches ?? []).map((item) => ({
    value: item.id,
    label: item.branch,
  }));
  const [maxBirthdate, setMaxBirthdate] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setMaxBirthdate(todayIso());
  }, []);

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function patch(partial: Partial<FormValues>) {
    setValues((current) => ({ ...current, ...partial }));
  }

  function updateMeeting(id: string, partial: Partial<Omit<Meeting, "id">>) {
    setValues((current) => ({
      ...current,
      meetings: current.meetings.map((meeting) =>
        meeting.id === id ? { ...meeting, ...partial } : meeting,
      ),
    }));
  }

  function onLeader(next: "yes" | "no") {
    setValues((current) => ({
      ...current,
      isDgroupLeader: next === "yes",
      meetings:
        next === "yes" && current.meetings.length === 0
          ? [blankMeeting()]
          : current.meetings,
    }));
  }

  function addMeeting() {
    setValues((current) => ({
      ...current,
      meetings: [...current.meetings, blankMeeting()],
    }));
  }

  function removeMeeting(id: string) {
    setValues((current) => ({
      ...current,
      meetings: current.meetings.filter((meeting) => meeting.id !== id),
    }));
    setErrors((current) => {
      const next = { ...current };
      for (const field of ["name", "days", "time"]) {
        delete next[`meeting.${id}.${field}`];
      }
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const errorId = firstErrorId(nextErrors, values.meetings);
    if (errorId) {
      document.getElementById(errorId)?.focus();
      return;
    }
    if (!values.gender || !values.civilStatus || !values.branch) return;

    setSubmitting(true);
    setSubmitError(null);
    const { error } = await registerMember({
      firstName: values.firstName,
      lastName: values.lastName,
      mobileNumber: values.mobileNumber,
      email: values.email,
      messengerName: values.messengerName,
      birthdate: values.birthdate,
      gender: values.gender,
      civilStatus: values.civilStatus,
      branchId: values.branch,
      isDgroupLeader: values.isDgroupLeader,
      dgroupMeetings: values.isDgroupLeader
        ? values.meetings.map(({ name, description, days, time }) => ({
            name,
            description,
            days,
            time,
          }))
        : undefined,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmittedName(values.firstName.trim());
  }

  function registerAnother() {
    setValues(emptyForm());
    setErrors({});
    setSubmitError(null);
    setSubmittedName(null);
  }

  if (submittedName) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <Card className={cardClass}>
          <CardContent
            role="status"
            className="flex flex-col items-center gap-8 py-6 text-center sm:py-10"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary duration-300 animate-in fade-in zoom-in-50 motion-reduce:animate-none">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-7"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                Thanks, {submittedName}
              </h1>
              <p className="max-w-xs leading-7 text-muted-foreground">
                Your registration is in. An admin will review it and approve
                your membership.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={registerAnother}
            >
              Register another member
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 sm:px-6">
      <Card className={cardClass}>
        <div className="-mt-(--card-spacing) flex items-center gap-4 bg-primary px-(--card-spacing) py-6 text-primary-foreground sm:gap-5 sm:py-8">
          <span
            role="img"
            aria-label="True North Church"
            className="size-20 shrink-0 bg-primary-foreground mask-[url(/tnc-logo-v2-transparent.png)] mask-contain mask-center mask-no-repeat sm:size-24"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Membership
            </h1>
            <p className="leading-6 text-primary-foreground/80">
              Register as a member of True North Church.
            </p>
          </div>
        </div>
        <CardContent>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8">
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    value={values.firstName}
                    aria-invalid={Boolean(errors.firstName) || undefined}
                    className="h-10"
                    onChange={(event) => {
                      patch({ firstName: event.target.value });
                      clearError("firstName");
                    }}
                  />
                  <FieldError>{errors.firstName}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    value={values.lastName}
                    aria-invalid={Boolean(errors.lastName) || undefined}
                    className="h-10"
                    onChange={(event) => {
                      patch({ lastName: event.target.value });
                      clearError("lastName");
                    }}
                  />
                  <FieldError>{errors.lastName}</FieldError>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="mobileNumber">Mobile number</FieldLabel>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={values.mobileNumber}
                  aria-invalid={Boolean(errors.mobileNumber) || undefined}
                  className="h-10"
                  onChange={(event) => {
                    patch({ mobileNumber: event.target.value });
                    clearError("mobileNumber");
                  }}
                />
                <FieldError>{errors.mobileNumber}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={values.email}
                  aria-invalid={Boolean(errors.email) || undefined}
                  className="h-10"
                  onChange={(event) => {
                    patch({ email: event.target.value });
                    clearError("email");
                  }}
                />
                <FieldDescription>Optional</FieldDescription>
                <FieldError>{errors.email}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="messengerName">Messenger Name</FieldLabel>
                <Input
                  id="messengerName"
                  name="messengerName"
                  autoComplete="nickname"
                  value={values.messengerName}
                  className="h-10"
                  onChange={(event) =>
                    patch({ messengerName: event.target.value })
                  }
                />
                <FieldDescription>Optional</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="birthdate">Birthdate</FieldLabel>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  autoComplete="bday"
                  max={maxBirthdate}
                  value={values.birthdate}
                  aria-invalid={Boolean(errors.birthdate) || undefined}
                  className="h-10"
                  onChange={(event) => {
                    patch({ birthdate: event.target.value });
                    clearError("birthdate");
                  }}
                />
                <FieldError>{errors.birthdate}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Gender</FieldLabel>
                <ChoiceGroup
                  id="gender"
                  label="Gender"
                  value={values.gender}
                  options={GENDERS}
                  invalid={Boolean(errors.gender)}
                  onChange={(gender) => {
                    patch({ gender });
                    clearError("gender");
                  }}
                />
                <FieldError>{errors.gender}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Civil status</FieldLabel>
                <ChoiceGroup
                  id="civilStatus"
                  label="Civil status"
                  value={values.civilStatus}
                  options={CIVIL_STATUSES}
                  invalid={Boolean(errors.civilStatus)}
                  onChange={(civilStatus) => {
                    patch({ civilStatus });
                    clearError("civilStatus");
                  }}
                />
                <FieldError>{errors.civilStatus}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Church branch</FieldLabel>
                <ChoiceGroup
                  id="branch"
                  label="Church branch"
                  value={values.branch}
                  options={branchOptions}
                  invalid={Boolean(errors.branch)}
                  onChange={(branch) => {
                    patch({ branch });
                    clearError("branch");
                  }}
                />
                {branchOptions.length === 0 ? (
                  <FieldError>
                    {branches === null
                      ? "Church branches could not be loaded. Refresh the page to try again."
                      : "No church branches are available yet."}
                  </FieldError>
                ) : null}
                <FieldError>{errors.branch}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Are you a dgroup leader?</FieldLabel>
                <ChoiceGroup
                  id="isDgroupLeader"
                  label="Are you a dgroup leader?"
                  value={values.isDgroupLeader ? "yes" : "no"}
                  options={LEADER}
                  onChange={onLeader}
                />
              </Field>
            </FieldGroup>

            {values.isDgroupLeader ? (
              <FieldSet className="gap-6 border-t border-border pt-8">
                <FieldLegend className="text-primary font-semibold">
                  Dgroup meetings
                </FieldLegend>
                <FieldDescription>
                  Add each group you lead, and the days and time it meets.
                </FieldDescription>

                {values.meetings.map((meeting, index) => {
                  const nameError = errors[`meeting.${meeting.id}.name`];
                  const daysError = errors[`meeting.${meeting.id}.days`];
                  const timeError = errors[`meeting.${meeting.id}.time`];
                  return (
                    <div
                      key={meeting.id}
                      className={cn(
                        "flex flex-col gap-5",
                        index > 0 && "border-t border-border pt-5",
                      )}
                    >
                      {values.meetings.length > 1 ? (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">
                            Meeting {index + 1}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMeeting(meeting.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : null}

                      <Field>
                        <FieldLabel htmlFor={`meeting.${meeting.id}.name`}>
                          Meeting name
                        </FieldLabel>
                        <Input
                          id={`meeting.${meeting.id}.name`}
                          name={`dgroupMeetings.${index}.name`}
                          value={meeting.name}
                          aria-invalid={Boolean(nameError) || undefined}
                          className="h-10"
                          onChange={(event) => {
                            updateMeeting(meeting.id, {
                              name: event.target.value,
                            });
                            clearError(`meeting.${meeting.id}.name`);
                          }}
                        />
                        <FieldError>{nameError}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel
                          htmlFor={`meeting.${meeting.id}.description`}
                        >
                          Description
                        </FieldLabel>
                        <Textarea
                          id={`meeting.${meeting.id}.description`}
                          name={`dgroupMeetings.${index}.description`}
                          value={meeting.description}
                          onChange={(event) =>
                            updateMeeting(meeting.id, {
                              description: event.target.value,
                            })
                          }
                        />
                        <FieldDescription>Optional</FieldDescription>
                      </Field>

                      <Field>
                        <FieldLabel id={`meeting.${meeting.id}.days-label`}>
                          Days
                        </FieldLabel>
                        <div
                          id={`meeting.${meeting.id}.days`}
                          role="group"
                          aria-labelledby={`meeting.${meeting.id}.days-label`}
                          aria-invalid={Boolean(daysError) || undefined}
                          tabIndex={-1}
                          className="flex flex-wrap gap-2 outline-none"
                        >
                          {WEEKDAYS.map((day) => {
                            const selected = meeting.days.includes(day.value);
                            return (
                              <Button
                                key={day.value}
                                type="button"
                                size="sm"
                                variant={selected ? "default" : "outline"}
                                aria-pressed={selected}
                                className="rounded-full px-4"
                                onClick={() => {
                                  updateMeeting(meeting.id, {
                                    days: sortDays(
                                      selected
                                        ? meeting.days.filter(
                                            (item) => item !== day.value,
                                          )
                                        : [...meeting.days, day.value],
                                    ),
                                  });
                                  clearError(`meeting.${meeting.id}.days`);
                                }}
                              >
                                {day.label}
                              </Button>
                            );
                          })}
                        </div>
                        <FieldError>{daysError}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`meeting.${meeting.id}.time`}>
                          Time
                        </FieldLabel>
                        <Input
                          id={`meeting.${meeting.id}.time`}
                          name={`dgroupMeetings.${index}.time`}
                          type="time"
                          value={meeting.time}
                          aria-invalid={Boolean(timeError) || undefined}
                          className="h-10"
                          onChange={(event) => {
                            updateMeeting(meeting.id, {
                              time: event.target.value,
                            });
                            clearError(`meeting.${meeting.id}.time`);
                          }}
                        />
                        <FieldError>{timeError}</FieldError>
                      </Field>
                    </div>
                  );
                })}

                <Button type="button" variant="outline" onClick={addMeeting}>
                  Add another meeting
                </Button>
              </FieldSet>
            ) : null}

            <div className="flex flex-col gap-3">
              {submitError ? (
                <p className="text-sm text-destructive" role="alert">
                  {submitError}
                </p>
              ) : null}
              <Button
                type="submit"
                size="xl"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Registering" : "Register"}
              </Button>
              <FieldDescription>
                An admin will approve your membership application.
              </FieldDescription>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
