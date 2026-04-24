import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowRight, MailCheck } from 'lucide-react';
import { z } from 'zod';

import { Button, Card, Input } from '@/components/ui';
import { forgotPasswordSchema, signInSchema } from '@/schemas/auth';
import { useAuth } from '@/hooks/use-auth';

export const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, sendPasswordReset, isDemoMode } = useAuth();
  const [showReset, setShowReset] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: isDemoMode ? 'priya.sharma@univentra.edu' : '',
      password: isDemoMode ? 'Student@123' : '',
    },
  });

  const resetForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <Card className="p-8 md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-orange">Welcome back</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Sign in to Univentra</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        Manage events, clubs, attendance, certificates, and campus momentum from one premium workspace.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await signIn(values.email, values.password);
            const next = location.state?.from ?? '/app';
            navigate(next);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to sign in.');
          }
        })}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Email</label>
          <Input placeholder="you@campus.edu" {...form.register('email')} />
          {form.formState.errors.email ? <p className="text-sm text-danger">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">Password</label>
          <Input placeholder="Enter password" type="password" {...form.register('password')} />
          {form.formState.errors.password ? (
            <p className="text-sm text-danger">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <button className="text-sm font-medium text-brand-orange" onClick={() => setShowReset((value) => !value)} type="button">
            Forgot password?
          </button>
          <Button disabled={form.formState.isSubmitting} type="submit">
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {showReset ? (
        <div className="mt-6 rounded-[24px] bg-surface-muted p-4">
          <div className="flex items-center gap-3">
            <MailCheck className="h-5 w-5 text-brand-purple" />
            <p className="font-medium text-ink">Reset password</p>
          </div>
          <form
            className="mt-4 space-y-3"
            onSubmit={resetForm.handleSubmit(async (values) => {
              try {
                await sendPasswordReset(values.email);
                toast.success('If the email exists, a reset link is on its way.');
                setShowReset(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Unable to send reset email.');
              }
            })}
          >
            <Input placeholder="Account email" {...resetForm.register('email')} />
            <Button type="submit" variant="secondary">
              Send reset link
            </Button>
          </form>
        </div>
      ) : null}

      <div className="mt-8 space-y-2 text-sm text-ink-soft">
        {isDemoMode ? (
          <p>
            Demo login: <span className="font-medium text-ink">priya.sharma@univentra.edu / Student@123</span>
          </p>
        ) : null}
        <p>
          New to Univentra?{' '}
          <Link className="font-medium text-brand-orange" to="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </Card>
  );
};
