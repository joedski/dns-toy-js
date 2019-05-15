import test from "ava";

import {
  serializeDnsMessageHeader,
  serializeDnsQuestionEntry,
  serializeDnsMessage,
} from "../dns-message";

import {
  pointerRequestMessage,
  pointerRequestBufferHeaderOnly,
  pointerRequestBufferQuestion0,
  pointerRequestBuffer,
} from "./dns-message.test-data";

test("serializeDnsMessageHeader serializes a query header as expected", t => {
  const testHeaderBuffer = pointerRequestBufferHeaderOnly;
  const testMessage = pointerRequestMessage;

  const createdHeaderBuffer = serializeDnsMessageHeader(testMessage);
  t.assert(createdHeaderBuffer.equals(testHeaderBuffer));
});

test("serializeDnsQuestionEntry serializes a question entry as expected", t => {
  const testQuestionEntry = pointerRequestMessage.questions[0];
  const testQuestionEntryBuffer = pointerRequestBufferQuestion0;

  const createdQuestionEntryBuffer = serializeDnsQuestionEntry(
    testQuestionEntry
  );
  t.assert(createdQuestionEntryBuffer.equals(testQuestionEntryBuffer));
});

test.todo(
  "serializeDnsQuestionEntry serializes a question entry with non-ASCII characters as expected"
);

test("serializeDnsMessage serializes a query as expected", t => {
  const testBuffer = pointerRequestBuffer;
  const testMessage = pointerRequestMessage;

  const createdBuffer = serializeDnsMessage(testMessage);

  t.assert(createdBuffer.equals(testBuffer));
});
