export type SpeakJapaneseResult =
    | { ok: true; utterance: SpeechSynthesisUtterance }
    | { ok: false; reason: "unsupported" | "empty" | "error"; message: string };

let hasWarmedSpeechEngine = false;

function hasSpeechSynthesis(): boolean {
    return (
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        typeof window.speechSynthesis?.speak === "function" &&
        "SpeechSynthesisUtterance" in window
    );
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

async function getVoicesWithTimeout(timeoutMs = 400): Promise<
    SpeechSynthesisVoice[]
> {
    if (!hasSpeechSynthesis()) return [];

    const initial = window.speechSynthesis.getVoices();
    if (initial.length > 0) return initial;

    return await new Promise((resolve) => {
        let done = false;

        const finish = () => {
            if (done) return;
            done = true;
            window.speechSynthesis.removeEventListener(
                "voiceschanged",
                onVoicesChanged,
            );
            resolve(window.speechSynthesis.getVoices());
        };

        const onVoicesChanged = () => finish();

        window.speechSynthesis.addEventListener(
            "voiceschanged",
            onVoicesChanged,
        );

        window.setTimeout(() => finish(), timeoutMs);
    });
}

function pickJapaneseVoice(
    voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
    const japanese = voices.filter((voice) =>
        voice.lang?.toLowerCase().startsWith("ja"),
    );
    if (japanese.length === 0) return null;

    // Prefer local voices when available (more reliable/offline).
    return (
        japanese.find((voice) => voice.localService) ??
        japanese[0] ??
        null
    );
}

export async function speakJapanese(
    text: string,
    options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
    },
): Promise<SpeakJapaneseResult> {
    const trimmed = text.trim();
    if (!trimmed) {
        return { ok: false, reason: "empty", message: "Nothing to speak." };
    }

    if (!hasSpeechSynthesis()) {
        return {
            ok: false,
            reason: "unsupported",
            message: "Text-to-speech isn’t supported in this browser.",
        };
    }

    try {
        // Cancel only active speech; cancelling an idle engine can clip the next utterance on mobile.
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = "ja-JP";

        if (typeof options?.rate === "number") {
            utterance.rate = clamp(options.rate, 0.1, 10);
        }
        if (typeof options?.pitch === "number") {
            utterance.pitch = clamp(options.pitch, 0, 2);
        }
        utterance.volume = clamp(options?.volume ?? 0.8, 0, 1);

        const voices = await getVoicesWithTimeout();
        const voice = pickJapaneseVoice(voices);
        if (voice) utterance.voice = voice;

        if (!hasWarmedSpeechEngine) {
            const warmup = new SpeechSynthesisUtterance("あ");
            warmup.lang = "ja-JP";
            warmup.volume = 0;
            warmup.rate = 10;
            if (voice) warmup.voice = voice;

            // Queue a muted utterance first so the first audible sentence starts on a warmed engine.
            window.speechSynthesis.speak(warmup);
            hasWarmedSpeechEngine = true;
        }

        window.speechSynthesis.speak(utterance);
        return { ok: true, utterance };
    } catch {
        return {
            ok: false,
            reason: "error",
            message: "Couldn’t start text-to-speech.",
        };
    }
}

export function stopSpeech(): void {
    if (!hasSpeechSynthesis()) return;
    window.speechSynthesis.cancel();
}

