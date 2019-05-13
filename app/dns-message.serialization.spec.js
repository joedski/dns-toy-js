import test from "ava";

import {
  DnsOpCode,
  DnsResponseCode,
  DnsResourceRecordType,
  DnsResourceRecordClass,
  serializeDnsMessageHeader,
  serializeDnsQuestionEntry,
  serializeDnsMessage,
} from "./dns-message";

test("serializeDnsMessageHeader serializes a query header as expected", t => {
  const testHeaderBuffer = Buffer.of(
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
    0x00
  );
  /**
   * @type {DnsMessage}
   */
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
        name: ["_services", "_dns-sd", "_udp"],
        type: DnsResourceRecordType.PTR,
        class: DnsResourceRecordClass.IN,
      },
    ],
    answers: [],
    nameServers: [],
    additionalRecords: [],
  };

  const createdHeaderBuffer = serializeDnsMessageHeader(testMessage);
  t.assert(createdHeaderBuffer.equals(testHeaderBuffer));
});

test("serializeDnsQuestionEntry serializes a question entry as expected", t => {
  const testQuestionEntry = {
    name: ["_http", "_tcp"],
    type: DnsResourceRecordType.PTR,
    class: DnsResourceRecordClass.IN,
  };

  const testQuestionEntryBuffer = Buffer.of(
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

  const createdQuestionEntryBuffer = serializeDnsQuestionEntry(
    testQuestionEntry
  );
  t.assert(createdQuestionEntryBuffer.equals(testQuestionEntryBuffer));
});

test.todo(
  "serializeDnsQuestionEntry serializes a question entry with non-ASCII characters as expected"
);

test("serializeDnsMessage serializes a query as expected", t => {
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

  /**
   * @type {DnsMessage}
   */
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

  const createdBuffer = serializeDnsMessage(testMessage);

  t.assert(createdBuffer.equals(testBuffer));
});
