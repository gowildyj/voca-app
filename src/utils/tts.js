// Lightweight, pluggable TTS utility.
// Default provider is the browser's SpeechSynthesis API.
// Optionally you can configure a remote provider (e.g. Hugging Face inference)
// by calling `configureTTS({ provider: 'hf', hfApiKey, hfModel })`.

let provider = "browser"; // 'browser' | 'hf'
let hfConfig = {
  apiKey: null,
  model: "facebook/fastspeech2-en-ljspeech", // override if you want a different model
};

// Optional preferences for browser voice selection
let preferredVoiceName = null; // exact voice name to prefer
let preferredGender = null; // 'female' | 'male' | null

export const configureTTS = ({
  provider: p = "browser",
  hfApiKey = null,
  hfModel = null,
} = {}) => {
  provider = p;
  if (hfApiKey) hfConfig.apiKey = hfApiKey;
  if (hfModel) hfConfig.model = hfModel;
};

export const setPreferredVoiceName = (name) => {
  preferredVoiceName = name || null;
};

export const setPreferredGender = (gender) => {
  if (gender !== "female" && gender !== "male") preferredGender = null;
  else preferredGender = gender;
};

const browserSpeak = (text, langCode, opts = {}) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const play = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (langCode) utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();

    // Prefer high-quality voices heuristically
    const preferredNames = [
      "Google", // Chrome Google voices
      "Microsoft", // Edge/Windows Neural voices
      "Samantha", // macOS
      "Daniel", // macOS
      "Alloy", // some platforms
    ];

    let selectedVoice = null;
    if (voices && voices.length > 0) {
      // 0) preferred voice by exact name
      if (preferredVoiceName) {
        selectedVoice = voices.find((v) => v.name === preferredVoiceName);
      }

      // helper to detect gender from voice name heuristically
      const isFemaleName = (n) => {
        if (!n) return false;
        const femaleHints = [
          "Female",
          "Samantha",
          "Joanna",
          "Nicole",
          "Olivia",
          "Amy",
          "Alloy",
          "Google UK English Female",
          "Google US English Female",
        ];
        return femaleHints.some((h) => n.includes(h));
      };

      const isMaleName = (n) => {
        if (!n) return false;
        const maleHints = [
          "Daniel",
          "Alex",
          "Male",
          "Matthew",
          "Google UK English Male",
        ];
        return maleHints.some((h) => n.includes(h));
      };

      // 1) prefer gender if requested
      if (!selectedVoice && preferredGender) {
        if (preferredGender === "female") {
          selectedVoice = voices.find(
            (v) => isFemaleName(v.name) || isFemaleName(v.voiceURI),
          );
        } else if (preferredGender === "male") {
          selectedVoice = voices.find(
            (v) => isMaleName(v.name) || isMaleName(v.voiceURI),
          );
        }
      }

      // 2) exact lang startsWith match
      // 1) exact lang startsWith match
      selectedVoice = voices.find(
        (v) => langCode && v.lang && v.lang.startsWith(langCode),
      );
      // if lang match selected and gender preference exists, try to find same-lang + gender
      if (selectedVoice && preferredGender) {
        const sameLangGender = voices.find(
          (v) =>
            v.lang &&
            langCode &&
            v.lang.startsWith(langCode) &&
            ((preferredGender === "female" && isFemaleName(v.name)) ||
              (preferredGender === "male" && isMaleName(v.name))),
        );
        if (sameLangGender) selectedVoice = sameLangGender;
      }
      // 2) prefer known names
      if (!selectedVoice) {
        selectedVoice = voices.find((v) =>
          preferredNames.some(
            (n) => v.name.includes(n) || (v.voiceURI || "").includes(n),
          ),
        );
      }
      // 3) fallback to first voice
      if (!selectedVoice) selectedVoice = voices[0];
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.rate = opts.rate ?? 1.0;
    utterance.pitch = opts.pitch ?? 1.0;

    // Resume then speak to avoid some browser race issues
    try {
      window.speechSynthesis.resume();
    } catch (e) {}
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      play();
    };
  } else {
    setTimeout(play, 10);
  }
};

const hfSpeak = async (text) => {
  // Note: Exposing API keys in frontend is insecure for production.
  // Prefer a server-side proxy that holds the HF key.
  if (!hfConfig.apiKey || !hfConfig.model)
    throw new Error("HF TTS not configured");

  const url = `https://api-inference.huggingface.co/models/${hfConfig.model}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfConfig.apiKey}`,
      Accept: "audio/wav",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HF TTS error: ${res.status} ${txt}`);
  }

  const buffer = await res.arrayBuffer();
  const blob = new Blob([buffer], { type: "audio/wav" });
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  audio.play().finally(() => {
    // revoke after a short delay to ensure playback started
    setTimeout(() => URL.revokeObjectURL(audioUrl), 2000);
  });
};

export const speak = async (text, langCode = null, opts = {}) => {
  if (!text) return;

  if (provider === "hf") {
    try {
      await hfSpeak(text);
      return;
    } catch (e) {
      // fallback to browser
      console.warn("HF TTS failed, falling back to browser TTS:", e);
      browserSpeak(text, langCode, opts);
      return;
    }
  }

  // default: browser
  browserSpeak(text, langCode, opts);
};

export default { speak, configureTTS };
