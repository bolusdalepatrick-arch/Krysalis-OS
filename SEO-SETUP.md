---
tags: [guide, krysalis-os, seo]
---

# Krysalis OS SEO Pipeline

The unified SEO system for Krysalis OS.

## Overview
This document outlines the standard operating procedures for managing multi-site SEO deployments via the Krysalis OS dashboard.

## Setup Requirements
1. Configure your agent in `config.json`.
2. Connect your analytics endpoints.
3. Ensure the `workspace-krysalisos` profile has read/write permissions to the content vaults.

## Pipeline Steps
1. **Keyword Research:** Delegate to the primary agent via the SEO tab.
2. **Drafting:** The agent will output `.md` drafts directly into the staging vault.
3. **Publishing:** Content is synced via the designated deployment hooks.
