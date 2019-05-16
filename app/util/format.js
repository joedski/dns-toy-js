/**
 * Convert an address from 4 octets into a string.
 * @returns {string}
 */
exports.formatIpv4 = function formatIpv4(
  /**
   * Buffer with octets of address.
   * Should be 4 octets.
   * @type {Buffer}
   */
  addressBuffer
) {
  return [
    addressBuffer.readUInt8(0),
    addressBuffer.readUInt8(1),
    addressBuffer.readUInt8(2),
    addressBuffer.readUInt8(3),
  ]
    .map(n => String(n))
    .join(".");
};

/**
 * Formats an IPv6 address from 16 octets into
 * the shortened form as a string.
 * @returns {string}
 */
exports.formatIpv6 = function formatIpv6(
  /**
   * Buffer with octets of address.
   * Should be 16 octets.
   * @type {Buffer}
   */
  addressBuffer
) {
  const addressLong = addressBuffer
    .toString("hex")
    .split("")
    .reduce((acc, nibble) => {
      const t = acc.length - 1;
      if (t >= 0 && acc[t].length < 4) {
        acc[t] = acc[t] + nibble;
      } else {
        acc.push(nibble);
      }
      return acc;
    }, [])
    .join(":");

  // Replace only the longest run of 0s with ::.
  const longestZerosRun = [
    "0000:0000:0000:0000:0000:0000:0000:0000",
    "0000:0000:0000:0000:0000:0000:0000",
    "0000:0000:0000:0000:0000:0000",
    "0000:0000:0000:0000:0000",
    "0000:0000:0000:0000",
    "0000:0000:0000",
    "0000:0000",
    // NOTE: the "::" shortcut is never used for just
    // a single "0000".
  ].find(s => addressLong.includes(s));

  const addressShortened = longestZerosRun
    ? addressLong.replace(longestZerosRun, "")
    : addressLong;

  const addressShortenedNormalized = (() => {
    if (!addressShortened) {
      return "::";
    } else if (addressShortened.match(/^:|:$/)) {
      return addressShortened.replace(/^:|:$/, "::");
    } else {
      return addressShortened;
    }
  })();

  // After that, strip any leading zeros.
  // Any remaining "0000"s are only truncated to "0".
  const addressCompressed = addressShortenedNormalized
    .replace(/^0{1,3}/, "")
    .replace(/:0{1,3}/g, ":");

  return addressCompressed;
};
