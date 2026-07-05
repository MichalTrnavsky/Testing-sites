#!/usr/bin/env node
/* Question-bank validator — a quality gate so we never ship a broken bank.
 *
 * The banks are browser scripts that set `window.QUESTION_BANK = [...]`.
 * We load them with a minimal window shim and check structure, answer-key
 * validity, option counts and translation/glossary shape.
 *
 * Usage:
 *   node tools/validate_bank.js app/questions.js app/questions.sv.js
 *   (exits non-zero if any ERROR is found; WARN does not fail the build)
 *
 * Expected languages differ per market, so we only WARN on missing
 * translations — but ERROR on anything that would break the app or ship a
 * wrong answer.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const VALID_OPTION_COUNTS = [3, 4];
const RECOMMENDED_EXPL_LANGS = ["en"]; // at least English explanation

function loadBank(file) {
  const code = fs.readFileSync(file, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file });
  return sandbox.window.QUESTION_BANK;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function validateBank(file) {
  const errors = [];
  const warnings = [];
  const push = (arr, id, msg) => arr.push(`${path.basename(file)} [${id}] ${msg}`);

  let bank;
  try {
    bank = loadBank(file);
  } catch (e) {
    return { errors: [`${file}: failed to load — ${e.message}`], warnings: [] };
  }
  if (!Array.isArray(bank)) {
    return { errors: [`${file}: window.QUESTION_BANK is not an array`], warnings: [] };
  }

  const seenIds = new Set();
  const seenQuestions = new Set();

  bank.forEach((q, i) => {
    const id = q && q.id ? q.id : `#${i}`;

    if (!q || typeof q !== "object") {
      push(errors, id, "not an object");
      return;
    }
    if (!isNonEmptyString(q.id)) push(errors, id, "missing/empty id");
    else if (seenIds.has(q.id)) push(errors, id, "duplicate id");
    else seenIds.add(q.id);

    if (!isNonEmptyString(q.theme)) push(warnings, id, "missing theme");
    if (!isNonEmptyString(q.q)) push(errors, id, "missing/empty question text");
    else {
      const key = q.q.trim().toLowerCase();
      if (seenQuestions.has(key)) push(warnings, id, "duplicate question text");
      else seenQuestions.add(key);
    }

    // Options + answer key — the critical checks.
    if (!Array.isArray(q.opts)) {
      push(errors, id, "opts is not an array");
    } else {
      if (!VALID_OPTION_COUNTS.includes(q.opts.length))
        push(errors, id, `has ${q.opts.length} options (expected 3 or 4)`);
      q.opts.forEach((o, oi) => {
        if (!isNonEmptyString(o)) push(errors, id, `option ${oi} is empty`);
      });
      const dupOpt = new Set();
      q.opts.forEach((o) => {
        const k = String(o).trim().toLowerCase();
        if (dupOpt.has(k)) push(warnings, id, `duplicate option "${o}"`);
        dupOpt.add(k);
      });

      if (!Number.isInteger(q.correct)) {
        push(errors, id, "correct is not an integer (answer key missing?)");
      } else if (q.correct < 0 || q.correct >= q.opts.length) {
        push(errors, id, `correct=${q.correct} is out of range for ${q.opts.length} options`);
      }
    }

    // Explanations.
    if (!q.expl || typeof q.expl !== "object") {
      push(warnings, id, "no explanations");
    } else {
      for (const lang of RECOMMENDED_EXPL_LANGS) {
        if (!isNonEmptyString(q.expl[lang])) push(warnings, id, `explanation missing for "${lang}"`);
      }
    }

    // Optional translations: opts length must match the question's opts.
    if (q.tr && typeof q.tr === "object") {
      for (const [lang, t] of Object.entries(q.tr)) {
        if (!isNonEmptyString(t.q)) push(errors, id, `tr.${lang}.q empty`);
        if (!Array.isArray(t.opts) || t.opts.length !== (q.opts?.length ?? -1))
          push(errors, id, `tr.${lang}.opts length must equal opts length`);
        else t.opts.forEach((o, oi) => {
          if (!isNonEmptyString(o)) push(errors, id, `tr.${lang}.opts[${oi}] empty`);
        });
      }
    }

    // Optional glossary terms.
    if (q.terms) {
      if (!Array.isArray(q.terms)) push(errors, id, "terms is not an array");
      else q.terms.forEach((term, ti) => {
        if (!isNonEmptyString(term.term)) push(errors, id, `terms[${ti}].term empty`);
        if (!term.expl || typeof term.expl !== "object")
          push(errors, id, `terms[${ti}] has no definitions`);
      });
    }
  });

  return { errors, warnings, count: bank.length };
}

function main() {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error("usage: node tools/validate_bank.js <bank.js> [<bank2.js> ...]");
    process.exit(2);
  }

  let totalErrors = 0;
  for (const file of files) {
    const { errors, warnings, count } = validateBank(file);
    console.log(`\n${path.basename(file)}: ${count ?? 0} questions, ${errors.length} error(s), ${warnings.length} warning(s)`);
    warnings.forEach((w) => console.log(`  ⚠ ${w}`));
    errors.forEach((e) => console.log(`  ✖ ${e}`));
    totalErrors += errors.length;
  }

  if (totalErrors > 0) {
    console.log(`\n❌ ${totalErrors} error(s) — bank is not shippable.`);
    process.exit(1);
  }
  console.log("\n✅ All banks valid.");
}

main();
