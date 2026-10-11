---
title: "Geofences explained: what zone alerts can and can't tell you"
description: "What a geofence is, how zone alerts work, where they help a fleet, and the honest limits you should know about before relying on them."
tldr: "A geofence is a zone drawn on a map. When a tracked vehicle crosses its edge, the system can send you an alert. Zone alerts are excellent for knowing when vehicles leave depots or reach sites, but they depend on GPS accuracy and how often the tracker reports, so draw zones with a margin and only alert on what you'll act on."
author: Synovika
published: 2026-10-11
draft: false
tags: [Fleet tracking, Explainer]
---

A geofence is an invisible boundary you draw on a map. It might be a circle around your depot, the outline of a customer's site, or a corridor along a route. Once it's drawn, your tracking system watches every vehicle's position and tells you when one crosses the line.

It's one of the most useful features in fleet tracking, and one of the most misunderstood. Here's how it works, where it helps, and where it can let you down.

## How a zone alert works

1. The tracker in the vehicle works out its position from satellite signals.
2. It sends that position over the mobile network, every so often while the vehicle moves.
3. The tracking software compares each new position with the zones you've drawn.
4. If the vehicle was inside a zone and is now outside it, or the other way round, the software raises an alert and sends it to you.

That's it. There's no magic in the vehicle. The software is comparing dots on a map with shapes on a map.

## Where geofences help

- **Leaving the depot.** Know when each vehicle sets off, without asking anyone.
- **Arriving on site.** See when a delivery van reaches a customer, and how long it stays.
- **After-hours use.** Combined with the time of day, a zone alert can tell you a vehicle has left the yard when it shouldn't have.
- **Staying on route.** A corridor along a route shows you when a driver takes a detour.
- **Theft.** A vehicle leaving its zone at 2am is a strong signal that something is wrong.

## The honest limits

**GPS isn't perfect.** In open sky, a position is usually accurate to within a few metres. Near tall buildings, under heavy cover or in a covered car park, it can drift further. A vehicle parked right on the edge of a zone can appear to step in and out of it.

**Trackers report every so often, not continuously.** If a tracker sends a position every minute, a short trip out of a zone and back again can fall between two reports and never show up. Ask how often your trackers report while moving.

**Signal comes and goes.** In areas with poor coverage, positions may arrive late. Good trackers store them and send them later, but the alert arrives late too.

**Too many alerts are as bad as none.** If every vehicle sends an alert every time it passes a petrol station, your team will soon stop reading them.

## How to set geofences up well

- **Draw zones with a margin.** Make a depot zone a little bigger than the yard, so vehicles parked by the fence don't flicker in and out.
- **Alert only on what you'll act on.** For each alert, ask who will receive it and what they'll do. If the answer is "nothing", turn it off.
- **Use time with place.** "Left the depot" means little at 8am and a lot at midnight. Alerts that consider the time are far more useful.
- **Review them monthly.** Sites change, routes change. Old zones create noise.

## Geofences in Selvion

Geofences are one of the core features of [Selvion](/products/selvion/), our fleet tracking platform. You draw a zone around a depot, a site or a route, and Selvion tells you on your phone when a vehicle leaves it or enters it. Selvion is in development; [join the waitlist](/contact/?waitlist=selvion) to be one of the first to use it.

For the bigger picture, read [how to choose a fleet tracking system](/insights/choosing-fleet-tracking-nigeria/).
