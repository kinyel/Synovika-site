---
title: "Testing on the phones your customers actually use"
description: "Why software that works on a fast laptop can fail on a budget Android phone with patchy data, and how to test for the phones your customers use."
tldr: "Software is usually built on fast laptops with good internet, but many customers use mid-range or budget Android phones on mobile data that comes and goes. Test on a few real, ordinary phones, on a slow and unreliable connection, and on the journeys that matter most, such as signing up and paying. It catches the problems your customers would otherwise find for you."
author: Synovika
published: 2026-10-11
draft: false
tags: [Testing, Software projects]
---

Here's a familiar story. A new website or app is built and tested in an office with fast Wi-Fi, on recent laptops and expensive phones. It works beautifully. It launches. And then customers start to complain that it's slow, that a button doesn't respond, that the payment page never loads.

Nothing was wrong with the testing, except where it happened. The software was tested on the developer's world, not the customer's.

## The gap between the office and the street

Many of your customers are likely to be on Android phones, often mid-range or budget models, a few years old, with little free storage. They're on mobile data that's sometimes fast, sometimes slow, and sometimes gone, and they may be watching every megabyte.

Software that feels instant on a new laptop can feel broken on that phone. The reasons are usually the same:

- **Too much to download.** Large images, videos and code take a long time over a slow connection, and cost your customers data.
- **Too much work for the phone.** Heavy pages make a slower phone's processor struggle, so taps feel ignored.
- **No plan for a dropped connection.** A form that loses everything when the signal blinks will lose the customer too.
- **Layouts that only fit big screens.** Buttons off the edge, text too small to read, menus that cover the page.

## How to test for real conditions

### Keep a few ordinary phones

You don't need dozens. Two or three ordinary Android phones, the kind your customers buy, will catch most problems. Include one that's a few years old.

### Test on a bad connection, on purpose

Turn off the Wi-Fi. Use mobile data in a weak signal area. Browsers' developer tools can also simulate a slow, unreliable connection. Then use the software as a customer would.

### Test the journeys that matter most

You can't test everything equally, so start with what earns or loses money: finding a product, signing up, booking, paying, getting help. Run each one from start to finish on a real phone.

### Watch what happens when things go wrong

Switch to airplane mode halfway through a payment. Enter a wrong code. Press back. Rotate the phone. Good software tells people what happened and lets them carry on.

### Measure, don't guess

Note how long key pages take to load on your test phones, and set a limit you won't let new releases go past. Free tools like Lighthouse can help, but nothing replaces a real phone in your hand.

## Make it a habit, not a launch event

Phones change, networks change, and every new feature can slow things down. Test on real phones before every release, not just before launch. That's how you catch a [regression](/glossary/#regression), something that used to work and doesn't any more, before customers do.

## How we test

We test on the phones and networks your customers actually use, not just on our own laptops. It's one of the [promises we keep on every project](/about/), and it's at the heart of our [testing and QA](/services/testing-and-qa/) service. If your software works in the office and struggles in the street, [tell us about it](/contact/).
