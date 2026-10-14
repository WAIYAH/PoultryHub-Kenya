import { CircleCheck, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { Container } from "@/components/shared/container";
import { FieldShell, TextAreaField, TextField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatKenyanMobile } from "@/domain/phone";
import { errorMessage, isAppError } from "@/lib/errors";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { getServices } from "@/services";

import {
  CONTACT_SUBJECTS,
  EMPTY_CONTACT,
  MESSAGE_MAX,
  isContactSubject,
  productFromSlug,
  toContactInput,
  validateContact,
  type ContactField,
  type ContactValues,
} from "../contact-form";
import { useSiteSettings, useWhatsappHref } from "../hooks";

const FIELD_ORDER: ContactField[] = ["name", "phone", "email", "subject", "orderNumber", "message"];
const fieldId = (field: ContactField) => `contact-${field}`;

/** Contact page (CNT-01, CNT-02): how to reach us, and a message form. */
export function ContactView() {
  const settings = useSiteSettings();
  const whatsappHref = useWhatsappHref();
  const hydrated = useHydrated();
  const [searchParams] = useSearchParams();

  // Links such as "Request a quote" fill in the subject and product. The page is pre-rendered
  // without them, so they apply once hydrated (ARCHITECTURE.md §4).
  const subject = searchParams.get("subject");
  const product = searchParams.get("product");
  const order = searchParams.get("order");
  const initial: ContactValues = hydrated
    ? {
        ...EMPTY_CONTACT,
        subject: isContactSubject(subject) ? subject : "general",
        orderNumber: order ?? "",
        message: product ? `I'd like a quote for ${productFromSlug(product)}.` : "",
      }
    : EMPTY_CONTACT;

  return (
    <>
      <PageHeader
        title="Contact us"
        description="Questions, orders, bulk quotes or farm visits: we're happy to help."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <Container className="grid grid-cols-1 gap-8 py-10 sm:py-14 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="Contact details" className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 rounded-lg bg-white p-5 text-ink-700 shadow-card sm:p-6">
            <h2 className="text-h3 text-ink-900">Reach us</h2>
            {settings.whatsappPhone || whatsappHref ? (
              <WhatsAppLink
                href={whatsappHref}
                className={buttonVariants({ className: "w-full sm:w-fit" })}
              >
                <WhatsAppIcon className="size-5" /> Chat on WhatsApp
              </WhatsAppLink>
            ) : null}
            <ul className="flex flex-col gap-3 text-sm">
              {settings.phone ? (
                <li className="flex items-start gap-3">
                  <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="font-semibold text-ink-900 hover:underline"
                  >
                    {formatKenyanMobile(settings.phone)}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li className="flex items-start gap-3">
                  <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="font-semibold text-ink-900 hover:underline"
                  >
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {settings.location ? (
                <li className="flex items-start gap-3">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
                  <span>
                    {settings.location}
                    {settings.mapUrl ? (
                      <>
                        {" "}
                        <a
                          href={settings.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-forest-700 underline-offset-4 hover:underline"
                        >
                          Open the map<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </>
                    ) : null}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
          {settings.businessHours.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-lg bg-white p-5 text-sm text-ink-700 shadow-card sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
                <Clock aria-hidden="true" className="size-4 text-forest-700" /> Business hours
              </h2>
              <dl className="flex flex-col gap-1.5">
                {settings.businessHours.map((entry) => (
                  <div key={entry.days} className="flex justify-between gap-4">
                    <dt>{entry.days}</dt>
                    <dd className="font-semibold text-ink-900">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </aside>

        <ContactForm key={hydrated ? "live" : "static"} initial={initial} />
      </Container>
    </>
  );
}

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; name: string }
  | { state: "error"; message: string };

function ContactForm({ initial }: { initial: ContactValues }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  function change(field: ContactField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (submitted) setErrors(validateContact(next)); // re-check as the customer fixes things
  }

  function focusFirst(found: Partial<Record<ContactField, string>>) {
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) document.getElementById(fieldId(first))?.focus();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirst(found);
      return;
    }
    setStatus({ state: "sending" });
    try {
      await getServices().contact.submit(toContactInput(values));
      setStatus({ state: "sent", name: values.name.trim().split(/\s+/)[0] ?? "" });
    } catch (error) {
      const fields = isAppError(error, "VALIDATION_FAILED") ? error.details?.fields : undefined;
      if (typeof fields === "object" && fields !== null) {
        const server: Partial<Record<ContactField, string>> = {};
        for (const field of FIELD_ORDER) {
          const message = (fields as Record<string, unknown>)[field];
          if (typeof message === "string") server[field] = message;
        }
        setErrors(server);
        focusFirst(server);
        setStatus({ state: "idle" });
        return;
      }
      setStatus({ state: "error", message: errorMessage(error) });
    }
  }

  if (status.state === "sent") {
    return (
      <section
        role="status"
        className="flex flex-col items-start gap-4 rounded-lg bg-white p-6 shadow-card sm:p-8"
        data-testid="contact-sent"
      >
        <CircleCheck aria-hidden="true" className="size-10 text-forest-700" />
        <h2 className="text-h2 text-ink-900">Message sent</h2>
        <p className="text-ink-700">
          Thanks{status.name ? `, ${status.name}` : ""}. We'll reply by phone or email, usually
          within business hours.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValues(EMPTY_CONTACT);
            setErrors({});
            setSubmitted(false);
            setStatus({ state: "idle" });
          }}
        >
          Send another message
        </Button>
      </section>
    );
  }

  const length = values.message.trim().length;
  return (
    <form
      noValidate
      onSubmit={(event) => void submit(event)}
      aria-label="Send us a message"
      className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-7"
    >
      <h2 className="text-h3 text-ink-900">Send us a message</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          name="name"
          id={fieldId("name")}
          label="Your name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => change("name", event.target.value)}
          error={errors.name}
          className="sm:col-span-2"
        />
        <TextField
          name="phone"
          id={fieldId("phone")}
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          hint="Or give an email below."
          value={values.phone}
          onChange={(event) => change("phone", event.target.value)}
          error={errors.phone}
          optional
        />
        <TextField
          name="email"
          id={fieldId("email")}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => change("email", event.target.value)}
          error={errors.email}
          optional
        />
        <FieldShell name="subject" id={fieldId("subject")} label="What's it about?">
          {(control) => (
            <select
              {...control}
              aria-required={undefined}
              value={values.subject}
              onChange={(event) => change("subject", event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-white px-3 text-base text-ink-900 focus-visible:border-ring"
            >
              {CONTACT_SUBJECTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </FieldShell>
        {values.subject === "order_help" || values.orderNumber ? (
          <TextField
            name="orderNumber"
            id={fieldId("orderNumber")}
            label="Order number"
            placeholder="PH001234"
            autoCapitalize="characters"
            value={values.orderNumber}
            onChange={(event) => change("orderNumber", event.target.value.toUpperCase())}
            error={errors.orderNumber}
            optional
          />
        ) : null}
      </div>
      <TextAreaField
        name="message"
        id={fieldId("message")}
        label="Message"
        rows={5}
        maxLength={MESSAGE_MAX}
        value={values.message}
        onChange={(event) => change("message", event.target.value)}
        error={errors.message}
        hint={`${length.toLocaleString("en-KE")} / ${MESSAGE_MAX.toLocaleString("en-KE")} characters`}
      />
      {status.state === "error" ? (
        <p className="text-sm text-danger" role="alert">
          {status.message}
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-fit"
        loading={status.state === "sending"}
        data-testid="contact-submit"
      >
        Send message
      </Button>
      <p className="text-xs text-ink-600">
        Our{" "}
        <Link to="/policies/privacy" className="underline underline-offset-2">
          privacy policy
        </Link>{" "}
        explains how we handle your details.
      </p>
    </form>
  );
}
