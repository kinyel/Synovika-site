---
title: "Inheriting software from a developer who left: a rescue checklist"
description: "Your developer has gone and the software is yours. A step by step checklist to get access, understand what you have and keep it running."
tldr: "First secure access to everything: the code, the hosting, the domain and every account, in your company's name. Then take backups, write down what the software does and where it runs, and have someone independent read the code before you change anything. Only then decide whether to fix, rebuild or replace it."
author: Synovika
published: 2026-10-11
draft: false
tags: [Software projects, Checklist]
---

It happens more often than anyone admits. The developer who built your system has moved on, stopped answering, or left on bad terms. The software still runs, mostly. But nobody in the building knows how it works, and you're one bad day away from it stopping.

Don't panic, and don't rush to rebuild. Work through this list in order.

## 1. Secure access, today

Before anything else, make sure your company controls everything the software depends on. For each item, you want the login, and you want it in a company account, not a personal one.

- **The code.** Where is it stored? GitHub, GitLab, Bitbucket, or only on the developer's laptop? Get it into an account your company owns.
- **The hosting.** The server, the cloud account or the hosting company. Who pays the bill, and whose card is on it?
- **The domain name.** Who is the registrant? If it's the developer, get it transferred.
- **The database.** Where it lives and how to log in.
- **Email and messaging services.** Anything that sends emails or text messages for the software.
- **Payment providers.** Your payment accounts, and the keys the software uses to talk to them.
- **App store accounts**, if you have a phone app.

Change the passwords once you have them, and store them somewhere safe that more than one person can reach.

## 2. Take backups

Back up the code and the database, and check that the backups actually open. If something breaks next week, a working backup is the difference between an inconvenience and a disaster.

## 3. Write down what you have

You don't need technical knowledge for this. Sit with the people who use the software and list:

- what it does, screen by screen;
- who uses each part, and how often;
- what it connects to (payments, messages, other systems);
- what goes wrong today, and how often.

This document becomes the starting point for whoever looks after it next.

## 4. Get the code read

Have an experienced developer, who didn't write it, read the code and tell you plainly:

- how it's built, and whether that's common or unusual;
- how risky it is to change;
- what's urgent (security holes, failing backups, expired certificates);
- what could wait.

This is a few days of work, not months, and it tells you what you're really dealing with.

## 5. Fix what's urgent, then decide

With the review in hand, fix anything that puts your data or your customers at risk. Then make the bigger decision calmly:

- **Keep and maintain** if the code is sound and does the job.
- **Fix and improve** if it's mostly sound with known problems.
- **Rebuild** only if the review shows that changing it will always cost more than starting again.

Rebuilding feels clean, but it's expensive and it takes time. Many systems are better rescued than replaced.

## 6. Make sure it never happens again

Whoever looks after your software next, insist on three things: the code lives in your account, everything is written down, and every password is yours.

## How we help

[Fixing and debugging](/services/fixing-and-debugging/) software someone else built is a large part of what we do. We start by reading the code and telling you what we find, then we agree what to fix first. If it's sound, we can [look after it](/services/maintenance-and-support/) from there. [Tell us what you've inherited](/contact/).
