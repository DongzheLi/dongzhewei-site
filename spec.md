# dongzhewei-site Spec

## Purpose

`dongzhewei-site` is the public personal website for `dongzhewei.com`.

The site should feel minimal, personal, and technical without becoming a gimmick. The core concept is a small Linux-like machine on the web: visitors interact with a terminal-style homepage where normal commands reveal profile content, and an `agi` command acts as a lightweight profile-aware assistant.

The existing Anki-style study app remains a separate application and can later be linked from this site, likely at `/anki`.

## Product Direction

Build a personal homepage that is:

- Minimal and fast.
- Terminal-inspired, not terminal-hostile.
- Usable without knowing commands.
- Personal enough to have character.
- Easy to deploy on a Linux droplet under `dongzhewei.com`.

The terminal should be the main visual language. The website should not feel like a generic portfolio template with a terminal pasted onto it.

## First Screen

The first viewport should show a readable terminal transcript:

```txt
dongzhewei.com tty1

login: guest
Last login: Sat Jun 20 2026

guest@dongzhewei:~$ whoami
Dongzhe Wei

guest@dongzhewei:~$ cat intro.txt
Software engineer building practical tools for learning, automation, and applied AI.

guest@dongzhewei:~$ ls
about.txt  now.txt  projects/  apps/  contact.txt

guest@dongzhewei:~$ help
Commands:
  man dongzhe       read the profile manual
  cat about.txt     short bio
  cat now.txt       current focus
  ls projects       selected work
  ls apps           personal tools
  open anki         launch study app
  agi <question>    ask the local profile agent
```

At the bottom, there should be an interactive prompt.

## Commands

Initial deterministic commands:

- `help`
- `whoami`
- `pwd`
- `ls`
- `cat about.txt`
- `cat now.txt`
- `cat contact.txt`
- `ls projects`
- `ls apps`
- `open anki`
- `man dongzhe`
- `clear`

Fun commands:

- `neofetch`
- `fortune`
- `history`
- `uptime`
- `sudo hire dongzhe`

LLM command:

- `agi <question>`

`agi` should feel like just another Linux command. Avoid presenting it as a floating chatbot or generic AI assistant.

## AGI Behavior

`agi` answers questions using only local profile context:

- Dongzhe's intro.
- Current focus.
- Selected projects.
- Public apps.
- Contact links.
- Notes or writing, if added later.

If asked unrelated questions, it should redirect:

```txt
agi: context miss. I only know this machine. Try `ls` or `man dongzhe`.
```

The first implementation may use static responses. Real LLM integration should come after the terminal UI is proven.

## Design

Visual direction:

- Dark terminal background, not pure black.
- Soft monospace typography.
- Restrained accent color, likely green, amber, or cyan.
- No large gradients, decorative blobs, or portfolio-card clutter.
- Responsive single-column layout on mobile.
- Links should be obvious but still fit the terminal language.

Recommended font:

- JetBrains Mono for terminal content.
- Optional sans-serif only for non-terminal metadata.

## Deployment Shape

Target domain:

- `dongzhewei.com` for the personal site.
- `dongzhewei.com/anki` for the existing study app, later.

Target host:

- Linux droplet on DigitalOcean.
- Static frontend or small Node app.
- Reverse proxy with Nginx or Caddy.
- HTTPS via Let's Encrypt.

## Build Approach

Follow a walking-skeleton sequence:

1. Create a single static page with the terminal transcript.
2. Add interactive deterministic commands in one file.
3. Add navigation for `open anki`.
4. Add static `agi` responses.
5. Only then add a real `/api/agi` endpoint and LLM provider.

Do not build abstractions before the terminal interaction works in the browser.
