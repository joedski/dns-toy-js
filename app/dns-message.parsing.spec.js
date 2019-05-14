import test from "ava";

import {
  DnsOpCode,
  DnsResponseCode,
  DnsResourceRecordType,
  DnsResourceRecordClass,
  parseDnsMessage,
  parseDnsMessageHeader,
  parseDnsMessageQuestions,
  parseDnsMessageResourceRecords,
} from "./dns-message.js";

function stringToHexes(
  /** @type {string} */
  s,
  /** @type {BufferEncoding} */
  encoding = "utf8"
) {
  return Buffer.from(s, encoding).toString("hex");
}

/** @type {DnsMessage} */
const pointerRequestMessage = {
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

const pointerRequestBuffer = Buffer.from(
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

/** @type {DnsMessage} */
const addressResponseMessage = {
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

const addressResponseBuffer = Buffer.from(
  "beef84000001000100000000" +
    "09646174616d756e6368056c6f63616c0000010001" +
    "c00c000100010000000a0004c0a8c849",
  "hex"
);

const addressResponseBufferAfterHeader = addressResponseBuffer.slice(12);
const addressResponseBufferAfterQuestions = addressResponseBufferAfterHeader.slice(
  21
);

test("parseDnsMessage should parse a raw query message buffer as expected", t => {
  const testBuffer = pointerRequestBuffer;
  const testMessage = pointerRequestMessage;

  const createdMessage = parseDnsMessage(testBuffer);

  t.deepEqual(createdMessage, testMessage);
});

test("parseDnsMessage should parse a raw response message buffer as expected", t => {
  const testBuffer = addressResponseBuffer;
  const testMessage = addressResponseMessage;

  const createdMessage = parseDnsMessage(testBuffer);

  t.deepEqual(createdMessage, testMessage);
});

test("parseDnsMessageHeader should parse a message's header as expected", t => {
  const testBuffer = pointerRequestBuffer;

  /** @type {DnsHeader} */
  const testMessageHeader = pointerRequestMessage.header;

  const [createdMessageHeader, remainderAfterHeader] = parseDnsMessageHeader(
    testBuffer
  );

  t.deepEqual(createdMessageHeader, testMessageHeader);
  // header length is always 12.
  t.assert(remainderAfterHeader.equals(testBuffer.slice(12)));
});

test.todo(
  "parseDnsMessageHeader should parse other responses' headers too, not just this rando query I made"
);

test("parseDnsMessageQuestions should parse the question entries of a message", t => {
  const testBuffer = pointerRequestBuffer;
  const testQuestions = pointerRequestMessage.questions;

  const testBufferAfterHeader = testBuffer.slice(12);

  const [createdQuestions, remainderAfterQuestions] = parseDnsMessageQuestions(
    testBufferAfterHeader,
    testBuffer
  );

  t.deepEqual(createdQuestions, testQuestions);
  t.assert(remainderAfterQuestions.length === 0);
});

test("parseDnsMessageResourceRecords should parse resource records of a message as expected", t => {
  const testMessageBuffer = addressResponseBuffer;
  const testRemainderAfterQuestionsBuffer = addressResponseBufferAfterQuestions;

  const testAnswers = addressResponseMessage.answers;

  const [
    createdAnswers,
    remainderAfterAnswers,
  ] = parseDnsMessageResourceRecords(
    testRemainderAfterQuestionsBuffer,
    testMessageBuffer,
    testMessageBuffer.readUInt16BE(6)
  );

  t.deepEqual(createdAnswers, testAnswers);
  t.assert(remainderAfterAnswers.length === 0);
});

test.todo("readName should handle normal names and pointers");
