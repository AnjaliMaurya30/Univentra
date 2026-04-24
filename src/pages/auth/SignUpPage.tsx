import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button, Card, Input } from '@/components/ui';
import { signUpSchema } from '@/schemas/auth';
import { useAuth } from '@/hooks/use-auth';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp, isDemoMode } = useAuth();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      department: '',
      yearOfStudy: '',
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <Card className="p-8 md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-orange">Create your account</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Join your campus community</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        Register once to explore events, join clubs, collect badges, and track your impact through Univentra.
      </p>

      <form
        className="mt-8 grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await signUp({
              fullName: values.fullName,
              email: values.email,
              department: values.department,
              yearOfStudy: values.yearOfStudy,
              password: values.password,
            });

            if (isDemoMode) {
              navigate('/app');
            } else {
              toast.success('Account created. Check your email if verification is enabled, then sign in.');
              navigate('/signin');
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to create account.');
          }
        })}
      >
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-ink">Full name</label>
          <Input {...form.register('fullName')} placeholder="Your name" />
          {form.formState.errors.fullName ? <p className="text-sm text-danger">{form.formState.errors.fullName.message}</p> : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-ink">Email</label>
          <Input {...form.register('email')} placeholder="you@campus.edu" />
          {form.formState.errors.email ? <p className="text-sm text-danger">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Department</label>
          <Input {...form.register('department')} placeholder="Computer Science" />
          {form.formState.errors.department ? <p className="text-sm text-danger">{form.formState.errors.department.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Year of study</label>
          <Input {...form.register('yearOfStudy')} placeholder="Third Year" />
          {form.formState.errors.yearOfStudy ? <p className="text-sm text-danger">{form.formState.errors.yearOfStudy.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Password</label>
          <Input type="password" {...form.register('password')} />
          {form.formState.errors.password ? <p className="text-sm text-danger">{form.formState.errors.password.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Confirm password</label>
          <Input type="password" {...form.register('confirmPassword')} />
          {form.formState.errors.confirmPassword ? <p className="text-sm text-danger">{form.formState.errors.confirmPassword.message}</p> : null}
        </div>
        <div className="md:col-span-2 space-y-3">
          <Button className="w-full justify-center" disabled={form.formState.isSubmitting} type="submit">
            Create account
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already have an account?{' '}
        <Link className="font-medium text-brand-orange" to="/signin">
          Sign in
        </Link>
      </p>
    </Card>
  );
};
