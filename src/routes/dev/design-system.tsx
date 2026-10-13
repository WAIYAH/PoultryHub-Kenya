import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Inbox, MoreHorizontal, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";

import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/shared/brand-icons";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Eyebrow } from "@/components/shared/eyebrow";
import { MotionScope } from "@/components/shared/motion-scope";
import { PriceDisplay } from "@/components/shared/price-display";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { StockBadge } from "@/components/shared/stock-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { COUNTY_NAMES_SORTED } from "@/domain/counties";
import { normalizeKenyanMobile } from "@/domain/phone";
import { notifySuccess } from "@/lib/notify";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/design-system";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Design system",
    description: "Living style guide for PoultryHub Kenya (development builds only).",
    path: "/dev/design-system",
    noindex: true,
  });

const swatches: { token: string; hex: string; className: string; use: string }[] = [
  { token: "forest-950", hex: "#022C22", className: "bg-forest-950", use: "Footer, admin sidebar" },
  { token: "forest-900", hex: "#064E3B", className: "bg-forest-900", use: "Primary, dark panels" },
  { token: "forest-700", hex: "#047857", className: "bg-forest-700", use: "Links, focus on light" },
  {
    token: "forest-100",
    hex: "#DDEEE3",
    className: "bg-forest-100",
    use: "Icon circles, eyebrows",
  },
  { token: "forest-50", hex: "#EEF5EF", className: "bg-forest-50", use: "Alternate sections" },
  { token: "gold-400", hex: "#FACC15", className: "bg-gold-400", use: "Accent CTA on dark" },
  { token: "gold-100", hex: "#FEF6C7", className: "bg-gold-100", use: "Featured badges" },
  { token: "cream-50", hex: "#FAF8F1", className: "bg-cream-50", use: "Page background" },
  { token: "earth-100", hex: "#F3E6D8", className: "bg-earth-100", use: "Eggs promo, warm tints" },
  { token: "ink-900", hex: "#17211C", className: "bg-ink-900", use: "Body text" },
  { token: "ink-600", hex: "#647067", className: "bg-ink-600", use: "Muted text" },
  { token: "line", hex: "#DCE3DC", className: "bg-line", use: "Decorative borders" },
];

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name (at least 2 letters)."),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => normalizeKenyanMobile(value) !== null,
      "Enter a Kenyan mobile number, e.g. 0712 345 678.",
    ),
});

function FormDemo() {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "" },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="flex max-w-md flex-col gap-5"
        onSubmit={(event) =>
          void form.handleSubmit((values) => {
            notifySuccess(`Saved ${values.name} (${normalizeKenyanMobile(values.phone) ?? ""})`);
          })(event)
        }
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0712 345 678"
                  {...field}
                />
              </FormControl>
              <FormDescription>We'll use this for M-Pesa and delivery updates.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-fit">
          Validate
        </Button>
      </form>
    </Form>
  );
}

const motionItems = ["Tray of 30 eggs", "50 day-old chicks", "70 kg layers mash", "Live broiler"];

/** Exit and layout animations: the kind of interaction Motion is reserved for (spike S4). */
function MotionDemo() {
  const [items, setItems] = useState(motionItems.slice(0, 3));
  const next = motionItems.find((item) => !items.includes(item));

  return (
    <MotionScope>
      <ul className="flex flex-col gap-2" aria-label="Cart lines">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <m.li
              key={item}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center justify-between rounded-md border border-line px-3 py-2"
            >
              <span>{item}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${item}`}
                onClick={() => setItems((current) => current.filter((value) => value !== item))}
              >
                <X aria-hidden="true" />
              </Button>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      <Button
        variant="outline"
        className="w-fit"
        disabled={!next}
        onClick={() => {
          if (next) setItems((current) => [...current, next]);
        }}
      >
        <Plus aria-hidden="true" /> Add a line
      </Button>
    </MotionScope>
  );
}

function DemoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-card sm:p-6">
      <h3 className="text-h3 text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

export default function DesignSystem() {
  const [quantity, setQuantity] = useState(50);
  const [retrying, setRetrying] = useState(false);

  return (
    <>
      <Section tone="mint" className="py-10 sm:py-14 lg:py-16">
        <Container className="flex flex-col gap-3">
          <Eyebrow>Development only</Eyebrow>
          <h1 className="text-h1 text-ink-900">Design system</h1>
          <p className="max-w-2xl text-lead text-ink-600">
            Tokens, primitives and states from DESIGN_SYSTEM.md, rendered with the real components.
            This page is excluded from production builds.
          </p>
        </Container>
      </Section>

      <Container className="flex flex-col gap-12 py-12">
        <section aria-labelledby="colours" className="flex flex-col gap-5">
          <h2 id="colours" className="text-h2 text-ink-900">
            Colour
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {swatches.map((swatch) => (
              <li key={swatch.token} className="overflow-hidden rounded-lg bg-white shadow-card">
                <div className={`h-16 border-b border-line ${swatch.className}`} />
                <div className="flex flex-col gap-0.5 p-3 text-sm">
                  <span className="font-semibold text-ink-900">{swatch.token}</span>
                  <span className="font-mono text-ink-600">{swatch.hex}</span>
                  <span className="text-ink-600">{swatch.use}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="type" className="flex flex-col gap-5">
          <h2 id="type" className="text-h2 text-ink-900">
            Typography
          </h2>
          <div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-card">
            <p className="text-display text-ink-900">Display: quality poultry</p>
            <p className="text-h1 text-ink-900">Heading 1: page titles</p>
            <p className="text-h2 text-ink-900">Heading 2: section titles</p>
            <p className="text-h3 text-ink-900">Heading 3: card titles</p>
            <p className="text-lead text-ink-600">Lead: introductions and summaries at 18 px.</p>
            <p className="text-ink-900">
              Body: 16 px Plus Jakarta Sans with a 1.6 line height for comfortable reading.
            </p>
            <p className="text-sm text-ink-600">Small: meta and helper text at 14 px.</p>
          </div>
        </section>

        <section aria-labelledby="buttons" className="flex flex-col gap-5">
          <h2 id="buttons" className="text-h2 text-ink-900">
            Buttons
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <DemoBlock title="On light surfaces">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="outline">Secondary</Button>
                <Button variant="secondary">Soft</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">
                  Text link <ArrowRight aria-hidden="true" />
                </Button>
                <Button variant="destructive">
                  <Trash2 aria-hidden="true" /> Delete
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Add to cart">
                  <ShoppingBag aria-hidden="true" />
                </Button>
                <Button loading>Saving</Button>
                <Button disabled>Disabled</Button>
              </div>
            </DemoBlock>
            <div
              data-surface="dark"
              className="flex flex-col gap-4 rounded-lg bg-forest-900 p-5 text-white shadow-card sm:p-6"
            >
              <h3 className="text-h3">On dark surfaces</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="accent">
                  Shop now <ArrowRight aria-hidden="true" />
                </Button>
                <Button variant="outline-inverse">Contact us</Button>
              </div>
              <p className="text-forest-200">
                Gold is reserved for one call to action per view. Focus rings switch to gold on dark
                surfaces.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="commerce" className="flex flex-col gap-5">
          <h2 id="commerce" className="text-h2 text-ink-900">
            Commerce
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <DemoBlock title="Prices and availability">
              <PriceDisplay priceMinor={55_000} unit="tray" size="lg" />
              <PriceDisplay priceMinor={12_000} unit="chick" from />
              <PriceDisplay priceMinor={420_000} unit="bag" compareAtMinor={450_000} />
              <div className="flex flex-wrap gap-2">
                <StockBadge availability="in_stock" />
                <StockBadge availability="low_stock" lowStockCount={4} />
                <StockBadge availability="out_of_stock" />
                <StockBadge availability="pre_order" availableFrom="2026-10-24" />
                <StockBadge availability="enquiry" />
              </div>
            </DemoBlock>
            <DemoBlock title="Quantity rules">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                rule={{ min: 50, step: 10, max: 500, available: 230 }}
                unit="chick"
              />
            </DemoBlock>
          </div>
        </section>

        <section aria-labelledby="badges" className="flex flex-col gap-5">
          <h2 id="badges" className="text-h2 text-ink-900">
            Badges
          </h2>
          <div className="flex flex-wrap gap-2 rounded-lg bg-white p-6 shadow-card">
            <Badge variant="success">Paid</Badge>
            <Badge variant="warning">Awaiting payment</Badge>
            <Badge variant="danger">Cancelled</Badge>
            <Badge variant="info">Out for delivery</Badge>
            <Badge variant="featured">Featured</Badge>
            <Badge variant="neutral">Draft</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <section aria-labelledby="forms" className="flex flex-col gap-5">
          <h2 id="forms" className="text-h2 text-ink-900">
            Forms
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <DemoBlock title="Validation (React Hook Form + Zod)">
              <FormDemo />
            </DemoBlock>
            <DemoBlock title="Controls">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ds-county">County</Label>
                <Select>
                  <SelectTrigger id="ds-county" className="w-full">
                    <SelectValue placeholder="Choose a county" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTY_NAMES_SORTED.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ds-notes">Delivery instructions</Label>
                <Textarea id="ds-notes" placeholder="Gate opposite the petrol station" />
              </div>
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-2 text-sm font-medium text-ink-900">
                  Delivery or pick-up
                </legend>
                <RadioGroup defaultValue="delivery" aria-label="Delivery or pick-up">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="delivery" id="ds-delivery" />
                    <Label htmlFor="ds-delivery">Delivery</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="collection" id="ds-collection" />
                    <Label htmlFor="ds-collection">Pick-up at the farm</Label>
                  </div>
                </RadioGroup>
              </fieldset>
              <div className="flex items-center gap-3">
                <Checkbox id="ds-terms" />
                <Label htmlFor="ds-terms">I agree to the terms of sale</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="ds-updates" />
                <Label htmlFor="ds-updates">Send me order updates by email</Label>
              </div>
            </DemoBlock>
          </div>
        </section>

        <section aria-labelledby="states" className="flex flex-col gap-5">
          <h2 id="states" className="text-h2 text-ink-900">
            States
          </h2>
          <div className="grid gap-5 lg:grid-cols-3">
            <EmptyState
              icon={Inbox}
              title="No products match"
              description="Try another word or clear your filters."
              actions={<Button variant="outline">Clear filters</Button>}
            />
            <ErrorState
              retrying={retrying}
              onRetry={() => {
                setRetrying(true);
                window.setTimeout(() => setRetrying(false), 1200);
              }}
            />
            <DemoBlock title="Loading">
              <div className="flex flex-col gap-3" aria-hidden="true">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Button variant="outline" onClick={() => notifySuccess("Added 2 trays to your cart")}>
                Show a toast
              </Button>
            </DemoBlock>
          </div>
        </section>

        <section aria-labelledby="overlays" className="flex flex-col gap-5">
          <h2 id="overlays" className="text-h2 text-ink-900">
            Overlays and disclosure
          </h2>
          <div className="flex flex-wrap gap-3 rounded-lg bg-white p-6 shadow-card">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delivery areas</DialogTitle>
                  <DialogDescription>
                    Delivery is offered only to areas the business has configured.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button>Got it</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel order</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel order PH001234?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The reserved stock is released. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep order</AlertDialogCancel>
                  <AlertDialogAction>Cancel order</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your cart</SheetTitle>
                  <SheetDescription>
                    Drawers slide in from the side on every screen size.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent>Popovers hold short, optional detail.</PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Order actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Print receipt</DropdownMenuItem>
                <DropdownMenuItem>Copy tracking link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">Hover or focus me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltips never carry essential information.</TooltipContent>
            </Tooltip>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <DemoBlock title="Accordion">
              <Accordion type="single" collapsible>
                <AccordionItem value="delivery">
                  <AccordionTrigger>Do you deliver?</AccordionTrigger>
                  <AccordionContent>
                    Delivery covers configured areas; everywhere else can pick up.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment">
                  <AccordionTrigger>How do I pay?</AccordionTrigger>
                  <AccordionContent>
                    M-Pesa, or pay on delivery or at pick-up where enabled.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </DemoBlock>
            <DemoBlock title="Tabs">
              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-3 text-ink-700">
                  Brown table eggs, collected daily.
                </TabsContent>
                <TabsContent value="specs" className="pt-3 text-ink-700">
                  Tray of 30 · Large
                </TabsContent>
              </Tabs>
            </DemoBlock>
          </div>
        </section>

        <section aria-labelledby="routing" className="flex flex-col gap-5">
          <h2 id="routing" className="text-h2 text-ink-900">
            Rendering checks (spike S1)
          </h2>
          <ul className="flex flex-col gap-2 rounded-lg bg-white p-6 shadow-card">
            <li>
              <Link
                className="font-semibold text-forest-700 underline"
                to="/products/farm-fresh-eggs"
              >
                Farm fresh eggs (pre-rendered at build time)
              </Link>
            </li>
            <li>
              <Link className="font-semibold text-forest-700 underline" to="/products/layers-mash">
                Layers mash (published after the build: SPA fallback + client loader)
              </Link>
            </li>
            <li>
              <Link
                className="font-semibold text-forest-700 underline"
                to="/products/no-such-product"
              >
                Unknown product (404 from the client loader)
              </Link>
            </li>
          </ul>
        </section>

        <section aria-labelledby="motion" className="flex flex-col gap-5">
          <h2 id="motion" className="text-h2 text-ink-900">
            Motion
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <DemoBlock title="Exit and layout animation (Motion, loaded on demand)">
              <MotionDemo />
            </DemoBlock>
            <DemoBlock title="Rules">
              <ul className="list-disc space-y-1 pl-5 text-ink-700">
                <li>
                  Scroll reveals and hovers use CSS; Motion loads only inside components that need
                  it.
                </li>
                <li>Only transform and opacity animate, so motion never shifts layout.</li>
                <li>With reduced motion turned on, everything appears instantly.</li>
              </ul>
            </DemoBlock>
          </div>
        </section>

        <section aria-labelledby="icons" className="flex flex-col gap-5">
          <h2 id="icons" className="text-h2 text-ink-900">
            Brand icons
          </h2>
          <ul className="flex flex-wrap gap-4 rounded-lg bg-white p-6 text-forest-900 shadow-card">
            {[
              { Icon: WhatsAppIcon, label: "WhatsApp" },
              { Icon: FacebookIcon, label: "Facebook" },
              { Icon: InstagramIcon, label: "Instagram" },
              { Icon: TikTokIcon, label: "TikTok" },
              { Icon: YouTubeIcon, label: "YouTube" },
              { Icon: XIcon, label: "X" },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-6" /> {label}
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <Section tone="forest">
        <Container>
          <Reveal>
            <SectionHeading
              tone="dark"
              eyebrow="Bulk and wholesale"
              title="Dark sections, with a scroll reveal"
              lead="This block starts below the fold, so it fades in after hydration. With reduced motion it simply appears."
              action={<Button variant="accent">Request a quote</Button>}
            />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
