// backend/src/utils/verifyEmailDomain.js
const dns = require("dns").promises;
const disposableDomainsArray = require("disposable-email-domains");

// Create a Set for O(1) domain lookup
const disposableDomainsSet = new Set(
  (Array.isArray(disposableDomainsArray) ? disposableDomainsArray : []).map((d) => d.toLowerCase().trim())
);

// Standard RFC 5322 Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Checks for keyboard mashing, excessive repeated characters, and random string patterns.
 * @param {string} username - The local part before @
 * @returns {{ isSpam: boolean, reason?: string }}
 */
function isGibberishOrSpam(username) {
  const clean = username.split("+")[0].replace(/[._-]/g, "").toLowerCase();

  // 1. Keyboard mash sequences
  const mashPatterns = [
    "asdf", "sdfg", "dfgh", "fghj", "ghjk", "hjkl",
    "qwer", "wert", "erty", "rtyu", "tyui", "yuio", "uiop",
    "zxcv", "xcvb", "cvbn", "vbnm",
    "12345", "23456", "34567", "45678", "56789", "67890",
    "abcdef", "bcdefg", "cdefgh"
  ];
  for (const pat of mashPatterns) {
    if (clean.includes(pat)) {
      return { isSpam: true, reason: "The email username contains automated or random keyboard mash patterns." };
    }
  }

  // 2. Excessive repeated characters (e.g., aaaa, 1111)
  if (/(.)\1{3,}/.test(clean)) {
    return { isSpam: true, reason: "The email address contains excessive repeated characters." };
  }

  // 3. High consonant ratio / lack of vowels for long usernames (6+ chars)
  if (clean.length >= 6 && !/[aeiouy]/.test(clean)) {
    return { isSpam: true, reason: "The email address appears to be a randomly generated sequence." };
  }

  // 4. Excessive consecutive consonants (6+ in a row)
  if (/[bcdfghjklmnpqrstvwxz]{6,}/i.test(clean)) {
    return { isSpam: true, reason: "The email address contains invalid consecutive character combinations." };
  }

  // 5. Excessive trailing digits (7+ digits at the end)
  if (/\d{7,}$/.test(clean)) {
    return { isSpam: true, reason: "The email address contains excessive trailing random numbers." };
  }

  return { isSpam: false };
}

/**
 * Validates provider-specific username rules for Gmail, Yahoo, Outlook/Hotmail.
 * @param {string} username - The part before @
 * @param {string} domain - The email domain
 * @returns {{ isValid: boolean, error?: string }}
 */
function validateProviderMailbox(username, domain) {
  const lowerDomain = domain.toLowerCase();
  const baseUsername = username.split("+")[0];

  // 🟢 GMAIL & GOOGLEMAIL RULES
  if (lowerDomain === "gmail.com" || lowerDomain === "googlemail.com") {
    if (baseUsername.length < 6 || baseUsername.length > 30) {
      return {
        isValid: false,
        error: "Gmail usernames must be between 6 and 30 characters long.",
      };
    }
    if (!/^[a-zA-Z0-9.]+$/.test(baseUsername)) {
      return {
        isValid: false,
        error: "Gmail usernames can only contain letters (a-z), numbers (0-9), and periods (.).",
      };
    }
    if (baseUsername.startsWith(".") || baseUsername.endsWith(".") || baseUsername.includes("..")) {
      return {
        isValid: false,
        error: "Gmail usernames cannot start, end, or contain consecutive periods (..).",
      };
    }
  }

  // 🟡 YAHOO RULES
  if (lowerDomain.includes("yahoo.") || lowerDomain === "ymail.com" || lowerDomain === "rocketmail.com") {
    if (baseUsername.length < 4 || baseUsername.length > 32) {
      return {
        isValid: false,
        error: "Yahoo usernames must be between 4 and 32 characters long.",
      };
    }
    if (!/^[a-zA-Z0-9._]+$/.test(baseUsername)) {
      return {
        isValid: false,
        error: "Yahoo usernames can only contain letters, numbers, underscores, and single periods.",
      };
    }
    if (baseUsername.startsWith(".") || baseUsername.endsWith(".") || baseUsername.startsWith("_") || baseUsername.endsWith("_") || baseUsername.includes("..")) {
      return {
        isValid: false,
        error: "Yahoo usernames cannot start or end with a period or underscore.",
      };
    }
  }

  // 🔵 OUTLOOK / HOTMAIL / LIVE / MSN RULES
  if (
    lowerDomain === "outlook.com" ||
    lowerDomain === "hotmail.com" ||
    lowerDomain === "live.com" ||
    lowerDomain === "msn.com"
  ) {
    if (baseUsername.length < 3 || baseUsername.length > 64) {
      return {
        isValid: false,
        error: "Outlook/Hotmail usernames must be between 3 and 64 characters long.",
      };
    }
    if (!/^[a-zA-Z]/.test(baseUsername)) {
      return {
        isValid: false,
        error: "Outlook and Hotmail email addresses must start with an alphabetical letter.",
      };
    }
    if (baseUsername.startsWith(".") || baseUsername.endsWith(".") || baseUsername.includes("..")) {
      return {
        isValid: false,
        error: "Outlook/Hotmail usernames cannot start, end, or contain consecutive periods.",
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates email format, provider mailbox rules, anti-gibberish checks,
 * disposable domain blocklist, and performs DNS MX record resolution.
 *
 * @param {string} email - The email address to validate
 * @returns {Promise<{ isValid: boolean, error?: string }>}
 */
async function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email address is required." };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Validate standard email format via regex
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return {
      isValid: false,
      error: "Please enter a valid email address with a recognized domain extension (e.g. name@example.com).",
    };
  }

  // 2. Extract username & domain
  const parts = cleanEmail.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Invalid email format." };
  }

  const username = parts[0].trim();
  const domain = parts[1].trim();

  // 3. Provider-specific Mailbox Pattern Verification
  const providerCheck = validateProviderMailbox(username, domain);
  if (!providerCheck.isValid) {
    return providerCheck;
  }

  // 4. Anti-Gibberish & Random Spam Sequence Check
  const spamCheck = isGibberishOrSpam(username);
  if (spamCheck.isSpam) {
    return {
      isValid: false,
      error: spamCheck.reason || "The email address appears to be an automated or randomly generated mailbox.",
    };
  }

  // 5. Disposable / Temporary Domain Blocklist Check
  if (disposableDomainsSet.has(domain)) {
    return {
      isValid: false,
      error: "Disposable/temporary email addresses are not permitted.",
    };
  }

  // 6. Perform DNS MX record lookup to verify active mail servers
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return {
        isValid: false,
        error: "The email domain does not have active mail servers and cannot receive emails.",
      };
    }
    return { isValid: true };
  } catch (dnsErr) {
    return {
      isValid: false,
      error: "The email domain does not have active mail servers and cannot receive emails.",
    };
  }
}

module.exports = { validateEmail, validateProviderMailbox, isGibberishOrSpam };
