CREATE POLICY "Anyone can request a booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT INSERT ON public.bookings TO anon;

CREATE TABLE public.booking_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'reminder',
  channel text NOT NULL DEFAULT 'email',
  send_at timestamptz NOT NULL DEFAULT now(),
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'scheduled',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_reminders TO authenticated;
GRANT ALL ON public.booking_reminders TO service_role;
ALTER TABLE public.booking_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage booking reminders" ON public.booking_reminders FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER booking_reminders_updated_at BEFORE UPDATE ON public.booking_reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();