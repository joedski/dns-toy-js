import test from "ava";

import {
  parseDnsMessage,
  parseDnsMessageHeader,
  parseDnsMessageQuestions,
  parseDnsMessageResourceRecords,
} from "../dns-message";

import {
  pointerRequestMessage,
  pointerRequestBuffer,
  addressResponseMessage,
  addressResponseBuffer,
  // addressResponseBufferAfterHeader,
  addressResponseBufferAfterQuestions,
} from "./dns-message.test-data";

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
