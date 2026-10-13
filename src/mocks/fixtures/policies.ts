// SAMPLE DATA: policy TEMPLATES marked as drafts for legal review (SITE-09, BR-32, A-19).
// They are not legal advice. `lastReviewedAt` stays null until an advocate has reviewed them.
import type { PolicyPage } from "@/types/domain";

const DRAFT_NOTICE =
  "> **Draft for legal review.** This is a template, not legal advice. The business and its advocate replace it before launch.";

export const policies: PolicyPage[] = [
  {
    slug: "privacy",
    title: "Privacy policy",
    summary: "What personal data we collect, why, where it is stored and your rights.",
    lastReviewedAt: null,
    bodyMarkdown: `${DRAFT_NOTICE}

## Who we are

PoultryHub Kenya ("we") sells poultry products online. This notice explains how we handle personal data under the Data Protection Act, 2019.

## What we collect

- **To fulfil orders:** your name, phone number, optional email address, and delivery or pick-up details.
- **For accounts:** your email address, name, phone number and saved addresses.
- **For payments:** the M-Pesa phone number and transaction reference. We never collect or store your M-Pesa PIN or card details.
- **When you contact us:** the details you include in your message.

## Why we use it

To process and deliver orders, take payments, answer questions, and keep records the law requires. We send marketing messages only if you opt in, and you can opt out at any time.

## Where it is stored

Our systems are hosted by service providers whose servers are **outside Kenya**. We use providers that apply appropriate safeguards for cross-border transfers.

## How long we keep it

Order and payment records are kept for as long as tax and accounting rules require. Other data is deleted or anonymised when it is no longer needed.

## Your rights

You may ask to access, correct or delete your personal data, or object to its use. Contact us using the details on the [contact page](/contact).

## Storage on your device

We store your cart and sign-in session in your browser so the site works. We don't use advertising cookies.`,
  },
  {
    slug: "terms",
    title: "Terms and conditions",
    summary: "The terms that apply when you order from us.",
    lastReviewedAt: null,
    bodyMarkdown: `${DRAFT_NOTICE}

## Orders

An order is accepted when we confirm it: either when your M-Pesa payment is verified, or when we confirm a pay-later order with you. We may cancel an order if an item becomes unavailable, and we will refund any payment made.

## Prices

Prices are in Kenya shillings (KSh) and are shown with their unit (for example, per tray or per chick). The price you pay is the one shown at checkout.

## Minimum orders

Some products are sold with a minimum quantity and in fixed steps. These rules are shown on each product page.

## Live animals

Day-old chicks and live birds are handed over in good health. Please follow the care guidance we provide. Report any problem at handover or as soon as possible afterwards.

## Contact

Questions about these terms? Reach us through the [contact page](/contact).`,
  },
  {
    slug: "delivery-and-returns",
    title: "Delivery and returns",
    summary: "Delivery areas, fees and days, pick-up, and what to do if something is wrong.",
    lastReviewedAt: null,
    bodyMarkdown: `${DRAFT_NOTICE}

## Delivery

We deliver to the areas listed at checkout. Each area belongs to a zone with its own fee, delivery days and expected delivery time, all shown before you pay. Some zones have free delivery above a set order value, and some have a minimum order.

If your area isn't listed, choose pick-up or message us on WhatsApp.

## Pick-up

Choose a pick-up point at checkout. Bring your order number. Day-old chicks are collected at the farm on the batch date.

## Broken eggs and other problems

Please check your order at delivery or pick-up. If eggs are broken or an item is wrong, tell the rider or our staff straight away, or contact us the same day with your order number and a photo.

## Cancellations and refunds

You can cancel a pending order from the order page. Once an order is confirmed, contact us. Refunds are made by M-Pesa or by the method you paid with.`,
  },
  {
    slug: "payments",
    title: "Payment information",
    summary: "M-Pesa and the other ways to pay, and how we keep payments safe.",
    lastReviewedAt: null,
    bodyMarkdown: `${DRAFT_NOTICE}

## Pay with M-Pesa

After you place an order, we send a payment prompt to your phone. Check the amount and the business name, then enter your M-Pesa PIN **on your phone**.

**We will never ask for your M-Pesa PIN** by call, SMS or WhatsApp.

## M-Pesa Paybill

You can also pay from your M-Pesa menu using our Paybill number, with your order number as the account number. We confirm the payment against our M-Pesa statement.

## Pay on delivery or at pick-up

Where available, pay the rider or our staff by M-Pesa or cash when you receive your order. Pay on delivery may not be available for large orders.

## When is an order paid?

Only when we have verified the payment with M-Pesa, or our staff have recorded it. A screenshot or SMS alone is not proof of payment.`,
  },
];
