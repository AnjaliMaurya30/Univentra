import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Link as LinkIcon, MapPin, MessageSquare, Star, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Avatar, Badge, Button, Card, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea } from '@/components/ui';
import { CertificatePreview } from '@/components/certificates/certificate-preview';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { QrPassCard } from '@/components/qr/qr-pass';
import { useAuth } from '@/hooks/use-auth';
import { feedbackSchema } from '@/schemas/feedback';
import { certificateService } from '@/services/certificate-service';
import { platformService } from '@/services/platform-service';
import { eventTimingLabel, formatDateTime, seatsLeft } from '@/lib/utils/format';
import type { EventFeedbackView, EventRegistration, Profile } from '@/types';
import { toast } from 'sonner';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(2, 'Comment cannot be empty.'),
});

export const EventDetailsScreen = ({
  slug,
  mode,
}: {
  slug: string;
  mode: 'public' | 'app';
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();
  const [certificateTarget, setCertificateTarget] = useState<{
    registration: EventRegistration;
    profile: Profile;
  } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const eventQuery = useQuery({
    queryKey: ['event', slug, profile?.id],
    queryFn: () => platformService.getEventBySlug(slug, profile?.id),
  });

  const feedbackForm = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 5,
      feedback_text: '',
    },
  });

  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (eventId: string) => platformService.registerForEvent(profile!.id, eventId),
    onSuccess: async () => {
      toast.success('Registration confirmed. Your QR pass is ready.');
      await queryClient.invalidateQueries({ queryKey: ['event', slug, profile?.id] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', profile?.id] });
      await queryClient.invalidateQueries({ queryKey: ['my-registrations', profile?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: (eventId: string) => platformService.toggleSavedEvent(profile!.id, eventId),
    onSuccess: async () => {
      toast.success('Saved events updated.');
      await queryClient.invalidateQueries({ queryKey: ['event', slug, profile?.id] });
      await queryClient.invalidateQueries({ queryKey: ['saved-events', profile?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => platformService.addComment(profile!.id, eventQuery.data!.id, content),
    onSuccess: async () => {
      commentForm.reset();
      toast.success('Comment posted.');
      await queryClient.invalidateQueries({ queryKey: ['event', slug, profile?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const feedbackMutation = useMutation({
    mutationFn: (values: z.infer<typeof feedbackSchema>) =>
      platformService.submitFeedback(profile!.id, eventQuery.data!.id, values.rating, values.feedback_text),
    onSuccess: async () => {
      feedbackForm.reset({
        rating: 5,
        feedback_text: '',
      });
      toast.success('Feedback saved. Thanks for sharing it.');
      await queryClient.invalidateQueries({ queryKey: ['event', slug, profile?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const attendeesQuery = useQuery({
    queryKey: ['event-attendees', eventQuery.data?.id],
    queryFn: () => platformService.getEventAttendees(eventQuery.data!.id),
    enabled: Boolean(
      mode === 'app' &&
        eventQuery.data &&
        profile &&
        role !== 'student',
    ),
  });

  const event = eventQuery.data;

  if (eventQuery.isLoading) {
    return <LoadingScreen message="Opening event experience..." />;
  }

  if (!event) {
    return (
      <EmptyState
        actionLabel="Browse events"
        description="This event could not be found or is no longer available."
        onAction={() => navigate(mode === 'public' ? '/browse' : '/app/events')}
        title="Event unavailable"
      />
    );
  }

  const canManage = mode === 'app' && role !== 'student';
  const organizerName = event.organizerClub?.name ?? event.organizerProfile?.full_name ?? 'Univentra';
  const userRegistration = event.userRegistration;
  const canLeaveFeedback =
    mode === 'app' &&
    userRegistration?.registration_status === 'attended' &&
    event.status === 'completed';

  const handleCertificateIssue = async () => {
    if (!previewRef.current || !certificateTarget) return;

    try {
      await certificateService.issueCertificate({
        container: previewRef.current,
        event,
        organizerName,
        profile: certificateTarget.profile,
        registrationId: certificateTarget.registration.id,
      });
      toast.success('Certificate generated and saved.');
      setCertificateTarget(null);
      await queryClient.invalidateQueries({ queryKey: ['event-attendees', event.id] });
      await queryClient.invalidateQueries({ queryKey: ['my-registrations', certificateTarget.profile.id] });
      await queryClient.invalidateQueries({ queryKey: ['certificates', certificateTarget.profile.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to issue certificate.');
    }
  };

  const feedbackList = event.feedback ?? [];

  return (
    <div className="space-y-6">
      <div className="surface-panel overflow-hidden p-0">
        <div className="grid min-h-[280px] gap-8 bg-hero-grid p-6 md:p-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">{event.category}</Badge>
                <Badge variant={event.status === 'completed' ? 'success' : event.status === 'pending' ? 'secondary' : 'purple'}>
                  {event.status}
                </Badge>
              </div>
              <PageHeader
                title={event.title}
                description={event.description}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {mode === 'public' ? (
                <>
                  <Button asChild>
                    <Link to="/signin">Sign in to register</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link to="/signup">Create account</Link>
                  </Button>
                </>
              ) : (
                <>
                  {!userRegistration ? (
                    <Button disabled={registerMutation.isPending || !['approved', 'full'].includes(event.status)} onClick={() => registerMutation.mutate(event.id)}>
                      Register now
                    </Button>
                  ) : (
                    <Button variant="secondary">Registered</Button>
                  )}
                  <Button onClick={() => (profile ? saveMutation.mutate(event.id) : navigate('/signin'))} variant="outline">
                    {event.isSaved ? 'Saved' : 'Save event'}
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card className="self-end bg-white/92">
            <div className="grid gap-4 text-sm text-ink-soft">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-brand-orange" />
                <span>{eventTimingLabel(event.start_time, event.end_time)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-brand-orange" />
                <span>{event.venue}</span>
              </div>
              {event.meeting_link ? (
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-4 w-4 text-brand-orange" />
                  <a className="underline" href={event.meeting_link} rel="noreferrer" target="_blank">
                    Join meeting room
                  </a>
                </div>
              ) : null}
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-brand-orange" />
                <span>
                  Hosted by {organizerName} / {event.current_participants}/{event.max_participants} joined
                </span>
              </div>
            </div>
            <div className="mt-5 rounded-[24px] bg-surface-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">Seats left</p>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">
                {seatsLeft(event.current_participants, event.max_participants)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">Registration closes {formatDateTime(event.registration_deadline)}.</p>
            </div>
          </Card>
        </div>
      </div>

      {mode === 'app' && userRegistration ? <QrPassCard event={event} profile={profile} registration={userRegistration} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-2xl font-semibold text-ink">About this event</h3>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{event.description}</p>
            {event.team_based ? (
              <div className="mt-5 rounded-[24px] bg-surface-muted p-4 text-sm text-ink-soft">
                Team-based experience: create or join a team from My Registrations after you register.
              </div>
            ) : null}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink">Comments</h3>
                <p className="mt-1 text-sm text-ink-soft">Ask questions and share context with the community.</p>
              </div>
              <MessageSquare className="h-5 w-5 text-brand-orange" />
            </div>

            {mode === 'app' ? (
              <form
                className="mt-5 space-y-3"
                onSubmit={commentForm.handleSubmit((values) => commentMutation.mutate(values.content))}
              >
                <Textarea {...commentForm.register('content')} placeholder="Drop a question or quick note..." />
                {commentForm.formState.errors.content ? (
                  <p className="text-sm text-danger">{commentForm.formState.errors.content.message}</p>
                ) : null}
                <Button disabled={commentMutation.isPending} type="submit" variant="secondary">
                  Post comment
                </Button>
              </form>
            ) : (
              <div className="mt-5 rounded-[24px] bg-surface-muted p-4 text-sm text-ink-soft">
                Sign in to join the event discussion and ask questions before the event starts.
              </div>
            )}

            <div className="mt-6 space-y-4">
              {(event.comments ?? []).length === 0 ? (
                <p className="text-sm text-ink-soft">No comments yet. Be the first to start the conversation.</p>
              ) : (
                event.comments?.map((comment) => (
                  <div key={comment.id} className="space-y-3 rounded-[24px] bg-surface-muted p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10" name={comment.author?.full_name} src={comment.author?.avatar_url} />
                      <div>
                        <p className="font-medium text-ink">{comment.author?.full_name}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">{formatDateTime(comment.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-ink-soft">{comment.content}</p>
                    {comment.replies.length > 0 ? (
                      <div className="space-y-3 rounded-[20px] bg-white p-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-9 w-9" name={reply.author?.full_name} src={reply.author?.avatar_url} />
                            <div>
                              <p className="font-medium text-ink">{reply.author?.full_name}</p>
                              <p className="text-sm leading-6 text-ink-soft">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-2xl font-semibold text-ink">Feedback</h3>
            <p className="mt-1 text-sm text-ink-soft">Ratings and reflections from attendees.</p>

            {canLeaveFeedback ? (
              <form
                className="mt-5 space-y-3"
                onSubmit={feedbackForm.handleSubmit((values) =>
                  feedbackMutation.mutate(values as z.infer<typeof feedbackSchema>),
                )}
              >
                <Input max={5} min={1} step={1} type="number" {...feedbackForm.register('rating')} />
                <Textarea placeholder="How was the event experience?" {...feedbackForm.register('feedback_text')} />
                {feedbackForm.formState.errors.feedback_text ? (
                  <p className="text-sm text-danger">{feedbackForm.formState.errors.feedback_text.message}</p>
                ) : null}
                <Button disabled={feedbackMutation.isPending} type="submit" variant="secondary">
                  Submit feedback
                </Button>
              </form>
            ) : (
              <div className="mt-5 rounded-[24px] bg-surface-muted p-4 text-sm text-ink-soft">
                Feedback opens after you attend a completed event.
              </div>
            )}

            <div className="mt-6 space-y-4">
              {feedbackList.length === 0 ? (
                <p className="text-sm text-ink-soft">No attendee feedback yet.</p>
              ) : (
                feedbackList.map((entry) => <FeedbackCard entry={entry} key={entry.id} />)
              )}
            </div>
          </Card>

          {userRegistration?.certificate_issued && userRegistration.certificate_url ? (
            <Card>
              <h3 className="font-display text-2xl font-semibold text-ink">Certificate ready</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Your certificate is available in Certificate Center and can be downloaded anytime.
              </p>
              <Button
                className="mt-5"
                onClick={() =>
                  certificateService.downloadCertificate(
                    userRegistration.certificate_url!,
                    certificateService.buildFileName(
                      profile?.full_name ?? 'student',
                      event.slug,
                    ),
                  )
                }
              >
                Download certificate
              </Button>
            </Card>
          ) : null}

          {canManage ? (
            <Card>
              <h3 className="font-display text-2xl font-semibold text-ink">Attendee management</h3>
              <p className="mt-2 text-sm text-ink-soft">Mark completions, review QR passes, and issue certificates.</p>
              <div className="mt-5 space-y-3">
                {attendeesQuery.isLoading ? (
                  <p className="text-sm text-ink-soft">Loading attendees...</p>
                ) : (attendeesQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-ink-soft">No registrations yet.</p>
                ) : (
                  attendeesQuery.data?.map((entry) => (
                    <div className="rounded-[24px] bg-surface-muted p-4" key={entry.id}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={entry.profile?.full_name} src={entry.profile?.avatar_url} />
                          <div>
                            <p className="font-medium text-ink">{entry.profile?.full_name}</p>
                            <p className="text-sm text-ink-soft">{entry.profile?.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={entry.registration_status === 'attended' ? 'success' : 'secondary'}>
                            {entry.registration_status}
                          </Badge>
                          {entry.certificate?.certificate_url ? (
                            <Button
                              onClick={() => {
                                if (!entry.certificate?.certificate_url) return;
                                void certificateService.downloadCertificate(
                                  entry.certificate.certificate_url,
                                  certificateService.buildFileName(
                                    entry.profile?.full_name ?? 'attendee',
                                    event.slug,
                                  ),
                                );
                              }}
                              size="sm"
                              variant="secondary"
                            >
                              Download cert
                            </Button>
                          ) : event.status === 'completed' &&
                            event.certificate_enabled &&
                            entry.registration_status === 'attended' &&
                            entry.profile ? (
                            <Button
                              onClick={() =>
                                setCertificateTarget({
                                  registration: entry,
                                  profile: entry.profile!,
                                })
                              }
                              size="sm"
                              variant="outline"
                            >
                              Issue certificate
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <Dialog onOpenChange={(open) => !open && setCertificateTarget(null)} open={Boolean(certificateTarget)}>
        <DialogContent className="max-h-[92vh] overflow-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>Issue certificate</DialogTitle>
            <DialogDescription>
              Preview the certificate exactly as the attendee will receive it, then generate and save it.
            </DialogDescription>
          </DialogHeader>
          {certificateTarget ? (
            <div className="space-y-4">
              <div className="overflow-auto rounded-[28px] bg-surface-muted p-3">
                <div className="origin-top-left scale-[0.3] md:scale-[0.55] lg:scale-[0.7]">
                  <CertificatePreview
                    certificateNumber={`PREVIEW-${certificateTarget.registration.id.slice(0, 8).toUpperCase()}`}
                    eventTitle={event.title}
                    issueDate={new Date().toISOString()}
                    organizerName={organizerName}
                    ref={previewRef}
                    studentName={certificateTarget.profile.full_name}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button onClick={() => setCertificateTarget(null)} variant="secondary">
                  Close
                </Button>
                <Button onClick={handleCertificateIssue}>Generate certificate</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FeedbackCard = ({ entry }: { entry: EventFeedbackView }) => (
  <div className="rounded-[24px] bg-surface-muted p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10" name={entry.author?.full_name} src={entry.author?.avatar_url} />
        <div>
          <p className="font-medium text-ink">{entry.author?.full_name}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">{formatDateTime(entry.created_at)}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-soft">
        <Star className="h-4 w-4 fill-brand text-brand-orange" />
        <span className="text-sm font-semibold text-ink">{entry.rating}/5</span>
      </div>
    </div>
    <p className="mt-4 text-sm leading-6 text-ink-soft">{entry.feedback_text}</p>
  </div>
);
