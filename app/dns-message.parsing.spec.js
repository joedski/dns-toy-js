import test from "ava";

import {
  DnsOpCode,
  DnsResponseCode,
  DnsResourceRecordType,
  DnsResourceRecordClass,
  parseDnsMessage,
  parseDnsMessageHeader,
  parseDnsMessageQuestions,
} from "./dns-message.js";

test("parseDnsMessage should parse a raw message buffer as expected", t => {
  const testBuffer = Buffer.of(
    // Header
    0xbe,
    0xef,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    // Question 1
    0x05,
    "_".charCodeAt(0),
    "h".charCodeAt(0),
    "t".charCodeAt(0),
    "t".charCodeAt(0),
    "p".charCodeAt(0),
    0x04,
    "_".charCodeAt(0),
    "t".charCodeAt(0),
    "c".charCodeAt(0),
    "p".charCodeAt(0),
    0x00,
    0x00,
    0x0c,
    0x00,
    0x01
  );

  /** @type {DnsMessage} */
  const testMessage = {
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

  const createdMessage = parseDnsMessage(testBuffer);

  t.deepEqual(createdMessage, testMessage);
});

test("parseDnsMessageHeader should parse a message's header as expected", t => {
  const testBuffer = Buffer.of(
    // Header
    0xbe,
    0xef,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    // Question 1
    0x05,
    "_".charCodeAt(0),
    "h".charCodeAt(0),
    "t".charCodeAt(0),
    "t".charCodeAt(0),
    "p".charCodeAt(0),
    0x04,
    "_".charCodeAt(0),
    "t".charCodeAt(0),
    "c".charCodeAt(0),
    "p".charCodeAt(0),
    0x00,
    0x00,
    0x0c,
    0x00,
    0x01
  );

  /** @type {DnsHeader} */
  const testMessageHeader = {
    id: 0xbeef,
    isResponse: false,
    opCode: DnsOpCode.QUERY,
    isAuthoritativeAnswer: false,
    isTruncated: false,
    isRecursionDesired: false,
    isRecursionAvailable: false,
    responseCode: DnsResponseCode.NO_ERROR,
  };

  const [createdMessageHeader, remainderAfterHeader] = parseDnsMessageHeader(
    testBuffer
  );

  t.deepEqual(createdMessageHeader, testMessageHeader);
});

test.todo(
  "parseDnsMessageHeader should parse other responses' headers too, not just this rando query I made"
);

test("parseDnsMessageQuestions should parse the question entries of a message", t => {
  const testBuffer = Buffer.of(
    // Header
    0xbe,
    0xef,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    // Question 1
    0x05,
    "_".charCodeAt(0),
    "h".charCodeAt(0),
    "t".charCodeAt(0),
    "t".charCodeAt(0),
    "p".charCodeAt(0),
    0x04,
    "_".charCodeAt(0),
    "t".charCodeAt(0),
    "c".charCodeAt(0),
    "p".charCodeAt(0),
    0x00,
    0x00,
    0x0c,
    0x00,
    0x01
  );

  /** @type {DnsHeader} */
  const testMessageHeader = {
    id: 0xbeef,
    isResponse: false,
    opCode: DnsOpCode.QUERY,
    isAuthoritativeAnswer: false,
    isTruncated: false,
    isRecursionDesired: false,
    isRecursionAvailable: false,
    responseCode: DnsResponseCode.NO_ERROR,
  };

  /** @type {Array<DnsQuestion>} */
  const testQuestions = [
    {
      name: ["_http", "_tcp"],
      type: DnsResourceRecordType.PTR,
      class: DnsResourceRecordClass.IN,
    },
  ];

  const testBufferAfterHeader = testBuffer.slice(12);

  const [createdQuestions, remainderAfterQuestions] = parseDnsMessageQuestions(
    testBufferAfterHeader,
    testBuffer,
    testMessageHeader
  );

  t.deepEqual(createdQuestions, testQuestions);
  t.assert(remainderAfterQuestions.length === 0);
});
