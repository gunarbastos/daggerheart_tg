console.log(`Loaded: ${import.meta.url}`);

import {DtgEngine} from "../common/index.js";

export class ChatLogPatch {
    static #patched = false;
    static #orig = undefined;

    // Adds a native `/dd` slash command by wrapping applications.sidebar.tabs.ChatLog.prototype.processMessage.
    static enableDdSlash() {
        if (ChatLogPatch.#patched) return;

        const _orig = foundry.applications.sidebar.tabs.ChatLog.prototype.processMessage;

        foundry.applications.sidebar.tabs.ChatLog.prototype.processMessage = async function (message, options = {}) {
            try {
                // Let core parse the command prefix so we behave like other slash commands.
                const parsed = foundry.applications.sidebar.tabs.ChatLog.parse?.(message);
                const cmd = parsed?.[0];

                if (typeof cmd === "string" && /^\/dd\b/i.test(message)) {
                    // Strip "/dd" and parse the rest into options
                    const argString = message.replace(/^\/dd\b\s*/i, "");
                    const args = ChatLogPatch.#parseDdArgs(argString);


                    // Call DtgEngine
                    const roll = await DtgEngine.dualityRoll({
                        hopeFormula: args.hope ?? "1d12",
                        fearFormula: args.fear ?? "1d12",
                        bonus: args.bonus,
                        advDisad: args.advDisad ?? "",      // "ADVANTAGE" | "DISADVANTAGE" | ""
                        grantsHopeFear: true,
                        postToChat: false,
                    });

                    const speaker = ChatMessage.getSpeaker({
                        token: canvas.tokens?.controlled?.[0] ?? null,
                        actor: canvas.tokens?.controlled?.[0]?.actor ?? game.user.character ?? null
                    });

                    // Minimal output (replace with your template if you prefer)
                    const content = await foundry.applications.handlebars.renderTemplate(roll.template, {
                        roll: roll
                    });

                    return ChatMessage.create({
                        speaker,
                        content: content
                    });
                }
            } catch (err) {
                console.error("[dtg] /dd error:", err);
                ui.notifications?.error?.(`Duality command failed: ${err?.message ?? err}`);
                // fall through to original to avoid breaking chat
            }

            // Not a /dd command → use core behavior
            return _orig.call(this, message, options);
        };

        ChatLogPatch.#patched = true;
        ChatLogPatch.#orig = _orig;
    }

    static disableDdSlash() {
        if (!ChatLogPatch.#patched) return;
        foundry.applications.sidebar.tabs.ChatLog.prototype.processMessage = ChatLogPatch.#orig;
        ChatLogPatch.#patched = false;
        ChatLogPatch.#orig = undefined;
    }

    // --- tiny arg parser for `/dd` ----------------------------------------------
    static #parseDdArgs(str) {
        const out = { bonus: [] }; // { hope?, fear?, tie?, advDisad?, bonus: (numbers/strings/objects)[] }

        const tokens = str.trim() ? str.trim().match(/"[^"]*"|\S+/g) : [];
        for (const raw of tokens ?? []) {
            const tok = raw.replace(/^"(.*)"$/, "$1"); // strip surrounding quotes

            // +N / -N → flat numeric bonus
            if (/^[+-]?\d+$/.test(tok)) {
                out.bonus.push(parseInt(tok, 10));
                continue;
            }

            // adv / dis
            if (/^(adv|advantage)$/i.test(tok)) { out.advDisad = "ADVANTAGE"; continue; }
            if (/^(dis|disad|disadvantage)$/i.test(tok)) { out.advDisad = "DISADVANTAGE"; continue; }

            // key=value (hope=2d12 | fear=1d12 | tie=hope | label=1d4)
            const m = tok.match(/^([A-Za-z_][\w-]*)\s*=\s*(.+)$/);
            if (m) {
                const key = m[1].toLowerCase();
                const val = m[2];
                if (key === "hope")       out.hope = val;
                else if (key === "fear")  out.fear = val;
                else if (key === "tie")   out.tie = val.toLowerCase();
                else                      out.bonus.push({ formula: val, description: m[1] }); // arbitrary label=value → treat as labeled bonus
                continue;
            }

            // Anything else → treat as a bonus formula token (e.g., 1d4)
            out.bonus.push(tok);
        }

        return out;
    }
}
