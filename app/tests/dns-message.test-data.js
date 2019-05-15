const {
  DnsOpCode,
  DnsResponseCode,
  DnsResourceRecordType,
  DnsResourceRecordClass,
} = require("../dns-message");

// Converts a plain string to a string of hexes representing the octets.
function stringToHexes(
  /** @type {string} */
  s,
  /** @type {BufferEncoding} */
  encoding = "utf8"
) {
  return Buffer.from(s, encoding).toString("hex");
}

// ---------------
// Pointer Request
// ---------------

/** @type {DnsMessage} */
exports.pointerRequestMessage = {
  header: {
    id: 0xbeef,
    isResponse: false,
    opCode: DnsOpCode.QUERY,
    isAuthoritativeAnswer: false,
    isTruncated: false,
    isRecursionDesired: false,
    isRecursionAvailable: false,
    responseCode: DnsResponseCode.NO_ERROR,
  },
  questions: [
    {
      name: ["_http", "_tcp"],
      type: DnsResourceRecordType.PTR,
      class: DnsResourceRecordClass.IN,
    },
  ],
  answers: [],
  nameServers: [],
  additionalRecords: [],
};

exports.pointerRequestBuffer = Buffer.from(
  "beef00000001000000000000" +
    [
      "05",
      stringToHexes("_http"),
      "04",
      stringToHexes("_tcp"),
      "00",
      "000c",
      "0001",
    ].join(""),
  "hex"
);

exports.pointerRequestBufferHeaderOnly = exports.pointerRequestBuffer.slice(
  0,
  12
);

exports.pointerRequestBufferAfterHeader = exports.pointerRequestBuffer.slice(
  12
);

// It's the same one, but only because this message
// contains only a single question and no other sections.
exports.pointerRequestBufferQuestion0 = exports.pointerRequestBufferAfterHeader;

// --------------
// Address Answer
// --------------

/** @type {DnsMessage} */
exports.addressResponseMessage = {
  header: {
    id: 0xbeef,
    isResponse: true,
    opCode: DnsOpCode.QUERY,
    isAuthoritativeAnswer: true,
    isTruncated: false,
    isRecursionDesired: false,
    isRecursionAvailable: false,
    responseCode: DnsResponseCode.NO_ERROR,
  },
  // Question section length: 21 octets
  questions: [
    // Question length: 21 octets
    {
      name: ["datamunch", "local"],
      type: DnsResourceRecordType.A,
      class: DnsResourceRecordClass.IN,
    },
  ],
  // Answer section length: 16 octets
  answers: [
    // Answer length: 16 octets
    // Note in the buffer that a name-pointer is used
    // to shorten the message length.
    {
      name: ["datamunch", "local"],
      type: DnsResourceRecordType.A,
      class: DnsResourceRecordClass.IN,
      ttl: 10,
      address: "192.168.200.73",
      // although optional where extra type-specific
      // props are present, this is always present
      // on any response parsed from a buffer.
      dataRaw: Buffer.from("c0a8c849", "hex"),
    },
  ],
  nameServers: [],
  additionalRecords: [],
};

exports.addressResponseBuffer = Buffer.from(
  "beef84000001000100000000" +
    "09646174616d756e6368056c6f63616c0000010001" +
    "c00c000100010000000a0004c0a8c849",
  "hex"
);

exports.addressResponseBufferAfterHeader = exports.addressResponseBuffer.slice(
  12
);

exports.addressResponseBufferAfterQuestions = exports.addressResponseBufferAfterHeader.slice(
  21
);
