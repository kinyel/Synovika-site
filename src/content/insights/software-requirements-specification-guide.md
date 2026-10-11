---
title: "How to write a software requirements specification (SRS): a plain guide"
seoTitle: "How to write a software requirements specification (SRS)"
description: "A plain guide to writing a software requirements specification: what goes in it, how to write requirements you can check, and a simple outline to follow."
tldr: "A software requirements specification (SRS) is the agreed, written description of what software must do and how well it must do it. A good one names the users, describes what each needs to do, lists the business rules, sets the quality you expect (speed, security, phones, networks), and says what's out of scope. Each requirement should be clear enough that you can check the finished software against it."
author: Synovika
published: 2026-10-11
draft: false
tags: [Requirements, Software projects]
---

A software requirements specification, or SRS, is the document that says what a piece of software must do. It's the agreement between the people who need the software and the people who build it. Done well, it's the single most useful document in a software project. Done badly, or skipped, it's where most disappointment starts.

You don't need to be technical to write one. You need to know your business, and to be precise.

## What an SRS is for

- **Agreement.** Everyone reads the same words, so everyone expects the same thing.
- **Pricing.** Developers can quote properly, and different quotes describe the same work.
- **Building.** The team knows what to build and in what order.
- **Checking.** When the software arrives, you test it against the document, not against memory.

## What goes in it

### 1. Purpose and background

Why the software is needed, in a few paragraphs. What's going wrong today, and what should be different.

### 2. The users

Every kind of person who will use it, with a line about each: who they are, what device they'll use, where they'll be, and how comfortable they are with technology. A dispatcher at a desk and a driver on a budget phone in traffic need very different software.

### 3. What each user needs to do

These are the functional requirements. Write them as simple statements, one need per line:

- A customer can see the status of their order without calling.
- A manager can see every order placed today on one screen.
- A driver can mark a delivery complete with a photo, even with a weak signal.

Some teams write them as user stories ("As a manager, I need to..., so that..."). Either works, as long as each line is one clear need.

### 4. Business rules

The rules the software must follow: prices and discounts, approvals, limits, who can see what, what happens when something fails. Write every rule you can think of; this is where the hidden work lives.

### 5. Quality requirements

These are the non-functional requirements: how well the software must work. For a Nigerian business, think about:

- **Phones:** which devices it must work on, including older Android phones.
- **Networks:** how it behaves on slow or dropping mobile data, and offline if needed.
- **Speed:** how quickly key screens must load on those phones.
- **Security and privacy:** who can see personal data, and how it's protected. The [Nigeria Data Protection Act](/insights/ndpa-basics-small-business-websites/) applies to most systems that hold personal data.
- **Availability:** when it must be running, and what happens during a power cut or an outage.

### 6. Connections to other systems

Payments, messages, accounting software, maps, existing systems. For each: what information goes in and out, and what happens if the other system is down.

### 7. Out of scope

What the software will not do, at least for now. This one section prevents more arguments than any other.

### 8. Acceptance

How you'll decide it's finished: a short list of checks you'll run before you accept it.

## How to write a good requirement

A good requirement is:

- **Clear:** one meaning only. "Fast" isn't clear; "the order list loads in under three seconds on our test phone" is.
- **Testable:** you can check whether the software does it.
- **Necessary:** someone actually needs it.
- **Single:** one need per requirement, so each can be built, priced and checked on its own.

Words to watch: "easy", "user-friendly", "fast", "secure", "etc." They feel precise and aren't. Replace each with something you could check.

## A simple outline

Copy this structure into a document and fill it in:

1. Purpose and background
2. Users
3. What each user needs to do
4. Business rules
5. Quality requirements (phones, networks, speed, security, availability)
6. Connections to other systems
7. Out of scope
8. Acceptance checks
9. Open questions

Keep a list of open questions at the end. An honest "we don't know yet" is far better than a guess that becomes a requirement.

## Keep it alive

An SRS isn't written once and filed. As the project teaches you things, update it, and note what changed and why. When everyone works from the latest version, surprises stay small.

## Getting help

Writing requirements is a skill: asking the right questions, watching how work really happens, and turning it into precise, testable statements. That's what [requirements engineering](/services/requirements-engineering/) is, and it's the second stage of [how we work](/how-we-work/). For a lighter start, read our note on [writing down what you need before you pay for software](/insights/requirements-for-small-businesses/), or [tell us about your project](/contact/).
