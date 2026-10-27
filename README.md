# 🌐 Translator App v20 ADVANCED

**Project #04 of the 100+ AI Projects series — by Aryan Kumar Shah**

An advanced translator, built as v20 from the start — never a basic v1.
Translate English, Hindi, Bengali, Spanish, French, German, Japanese, Tamil and Telugu.

## What it can do — v20 advanced
- **9 languages, both ways:** English, Hindi, Bengali, Spanish, French, German, Japanese, Tamil, Telugu — with a ⇄ swap button
- **Online translation:** free MyMemory API, no key, no account
- **Offline backup (v20):** exact common phrases (e.g. "Good morning" → सुप्रभात / সুপ্রভাত) AND word-by-word translation for common words, so simple English → Hindi/Bengali still works even if MyMemory's free daily quota is finished or internet fails — the app always tells you which source it used
- **Speak:** speak the input and the translation (browser speech, free)
- **Copy, Share, Favourite, History:** all saved only on your phone
- **Character count, example phrases, light/dark theme**
- **Beautiful ultimate UI:** indigo → amber gradient glass cards, phone-first, no horizontal scroll
- **Works as an app (PWA):** install from Chrome → "Add to Home screen", cache `translator-v20` with old-cache delete
- **Python version included:** `translator.py` with the exact same v20 logic (online + offline phrase book + word-by-word)

## Honest limit
MyMemory is free with a daily limit. If it says quota finished, the app does NOT invent a translation — it falls back to offline phrases / word-by-word for Hindi/Bengali, or tells you to try a shorter text. Google's unofficial translate endpoint was tested and was blocked from this environment, so it is NOT used.

## Try it
**Website:** Open `index.html`, or enable GitHub Pages and open the live link.
**App:** Open the live link in Chrome on your phone → menu → "Add to Home screen".
**Python:**
```bash
python translator.py
```
Choose From / To, type text, or 'quit' to exit.

## Examples that work offline
- `Good morning` (English → Hindi) → सुप्रभात
- `Thank you very much` (English → Hindi) → बहुत-बहुत धन्यवाद
- `Hello world` (English → Hindi, word-by-word backup) → नमस्ते दुनिया

## Files (upload exactly like this, all at repo root)
```
index.html
style.css
app.js
translator.py
favicon.svg
manifest.json
sw.js
README.md
LICENSE
POSTING_KIT.md
```

## Tech stack
HTML, CSS, JavaScript (MyMemory API + PWA + localStorage + Web Speech), Python

## Next project
Project #05: Spam Email Classifier — only after this one, one by one.
