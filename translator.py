"""Translator App v20 ADVANCED — Project #04 of the 100+ AI Projects series.
Same logic as the web version (app.js):
  - Online: free MyMemory API, no key (urllib, 12-sec timeout)
  - Offline backup: built-in English <-> Hindi / Bengali phrase book
Run:  python translator.py
Languages: en, hi, bn, es, fr, de, ja, ta, te (MyMemory codes).
Honest limit: MyMemory is free with a daily limit; long/rare texts may fail.
"""
import json
import re
import urllib.parse
import urllib.request

PHRASES = {
    "hello": {"hi": "नमस्ते", "bn": "নমস্কার"},
    "hello, how are you?": {"hi": "नमस्ते, आप कैसे हैं?", "bn": "নমস্কার, আপনি কেমন আছেন?"},
    "how are you?": {"hi": "आप कैसे हैं?", "bn": "আপনি কেমন আছেন?"},
    "thank you": {"hi": "धन्यवाद", "bn": "ধন্যবাদ"},
    "thank you very much": {"hi": "बहुत-बहुत धन्यवाद", "bn": "অনেক ধন্যবাদ"},
    "good morning": {"hi": "सुप्रभात", "bn": "সুপ্রভাত"},
    "good night": {"hi": "शुभ रात्रि", "bn": "শুভ রাত্রি"},
    "goodbye": {"hi": "अलविदा", "bn": "বিদায়"},
    "where are you going?": {"hi": "आप कहाँ जा रहे हैं?", "bn": "আপনি কোথায় যাচ্ছেন?"},
    "what is your name?": {"hi": "आपका नाम क्या है?", "bn": "আপনার নাম কি?"},
    "please": {"hi": "कृपया", "bn": "দয়া করে"},
    "sorry": {"hi": "माफ़ कीजिए", "bn": "দুঃখিত"},
    "yes": {"hi": "हाँ", "bn": "হ্যাঁ"},
    "no": {"hi": "नहीं", "bn": "না"},
    "welcome": {"hi": "स्वागत है", "bn": "স্বাগতম"},
    "i am a student": {"hi": "मैं एक छात्र हूँ", "bn": "আমি একজন ছাত্র"},
}


def offline_translate(text, from_lang, to_lang):
    key = text.strip().lower()
    if from_lang == "en" and to_lang in ("hi", "bn"):
        return PHRASES.get(key, {}).get(to_lang)
    if to_lang == "en" and from_lang in ("hi", "bn"):
        for en, vals in PHRASES.items():
            if vals.get(from_lang) == text.strip():
                return en
    return None


def online_translate(text, from_lang, to_lang):
    try:
        q = urllib.parse.quote(text)
        url = f"https://api.mymemory.translated.net/get?q={q}&langpair={from_lang}|{to_lang}"
        with urllib.request.urlopen(url, timeout=12) as r:
            data = json.loads(r.read().decode("utf-8"))
        out = data.get("responseData", {}).get("translatedText")
        if not out or "MYMEMORY WARNING" in out or "QUERY LENGTH LIMIT" in out:
            return None
        return out
    except Exception:
        return None


WORD_DICT = {
    "hello": {"hi": "नमस्ते", "bn": "নমস্কার"}, "world": {"hi": "दुनिया", "bn": "বিশ্ব"},
    "thank": {"hi": "धन्यवाद", "bn": "ধন্যবাদ"}, "you": {"hi": "आप", "bn": "আপনি"},
    "very": {"hi": "बहुत", "bn": "খুব"}, "much": {"hi": "बहुत", "bn": "অনেক"},
    "good": {"hi": "अच्छा", "bn": "ভালো"}, "morning": {"hi": "सुबह", "bn": "সকাল"},
    "night": {"hi": "रात", "bn": "রাত"}, "please": {"hi": "कृपया", "bn": "দয়া করে"},
    "sorry": {"hi": "माफ़ कीजिए", "bn": "দুঃখিত"}, "yes": {"hi": "हाँ", "bn": "হ্যাঁ"},
    "no": {"hi": "नहीं", "bn": "না"}, "my": {"hi": "मेरा", "bn": "আমার"},
    "name": {"hi": "नाम", "bn": "নাম"}, "is": {"hi": "है", "bn": "হয়"},
    "are": {"hi": "हैं", "bn": "আছেন"}, "i": {"hi": "मैं", "bn": "আমি"},
    "am": {"hi": "हूँ", "bn": "আছি"}, "student": {"hi": "छात्र", "bn": "ছাত্র"},
    "teacher": {"hi": "शिक्षक", "bn": "শিক্ষক"}, "school": {"hi": "स्कूल", "bn": "স্কুল"},
    "book": {"hi": "किताब", "bn": "বই"}, "water": {"hi": "पानी", "bn": "জল"},
    "food": {"hi": "खाना", "bn": "খাবার"}, "friend": {"hi": "दोस्त", "bn": "বন্ধু"},
    "family": {"hi": "परिवार", "bn": "পরিবার"}, "home": {"hi": "घर", "bn": "বাড়ি"},
    "today": {"hi": "आज", "bn": "আজ"}, "tomorrow": {"hi": "कल", "bn": "আগামীকাল"},
    "how": {"hi": "कैसे", "bn": "কেমন"}, "what": {"hi": "क्या", "bn": "কি"},
    "where": {"hi": "कहाँ", "bn": "কোথায়"}, "when": {"hi": "कब", "bn": "কখন"},
    "love": {"hi": "प्यार", "bn": "ভালোবাসা"}, "happy": {"hi": "खुश", "bn": "খুশি"},
}


def word_by_word(text, to_lang):
    def repl(m):
        d = WORD_DICT.get(m.group(0).lower())
        return d.get(to_lang, m.group(0)) if d else m.group(0)
    return re.sub(r"[A-Za-z']+", repl, text)


def translate(text, from_lang, to_lang):
    if from_lang == to_lang:
        return text, "same language"
    offline = offline_translate(text, from_lang, to_lang)
    if offline:
        return offline, "offline phrase book"
    online = online_translate(text, from_lang, to_lang)
    if online:
        return online, "online MyMemory API"
    if from_lang == "en" and to_lang in ("hi", "bn"):
        wb = word_by_word(text, to_lang)
        if wb != text:
            return wb, "offline word-by-word backup"
    return None, "failed"


def main():
    print("Translator App v20 ADVANCED — by Aryan Kumar Shah")
    print("Languages: en, hi, bn, es, fr, de, ja, ta, te")
    from_lang = input("From (default en): ").strip() or "en"
    to_lang = input("To (default hi): ").strip() or "hi"
    while True:
        text = input("\nText to translate (or 'quit'): ")
        if text.strip().lower() == "quit":
            break
        out, source = translate(text, from_lang, to_lang)
        if out:
            print(f"Translation ({source}): {out}")
        else:
            print("Could not translate right now — check internet, or try a shorter / simpler text.")


if __name__ == "__main__":
    main()
