// NOTE: All the @type annotations in the enums are to get
// exact types.  maybe I'll think of a better way to do it later.

/**
 * Op-code specifying the kind of query being made.
 * Values 3-15 are reserved for future use. (RFC1035#4.1.1)
 */
exports.DnsOpCode = {
  /**
   * A standard query.
   * @type {DnsOpCode.QUERY}
   */
  QUERY: 0,
  /**
   * An Inverse Query.
   * @type {DnsOpCode.IQUERY}
   */
  IQUERY: 1,
  /**
   * Server status request.
   * @type {DnsOpCode.STATUS}
   */
  STATUS: 2,
};

/**
 * Possible response codes the server can send back.
 * Values 6-15 are reserved for future use.
 */
exports.DnsResponseCode = {
  /**
   * @type {DnsResponseCode.NO_ERROR}
   */
  NO_ERROR: 0,
  /**
   * @type {DnsResponseCode.FORMAT_ERROR}
   */
  FORMAT_ERROR: 1,
  /**
   * @type {DnsResponseCode.SERVER_FAILURE}
   */
  SERVER_FAILURE: 2,
  /**
   * @type {DnsResponseCode.NAME_ERROR}
   */
  NAME_ERROR: 3,
  /**
   * @type {DnsResponseCode.NOT_IMPLEMENTED}
   */
  NOT_IMPLEMENTED: 4,
  /**
   * @type {DnsResponseCode.REFUSED}
   */
  REFUSED: 5,
};

/**
 * Defines the type of a record, whether it's what type
 * of record or querying or the type of the record returned.
 * (RFC1035#3.2.3)
 */
exports.DnsResourceRecordType = {
  /**
   * a host address
   * @type {DnsResourceRecordType.A}
   */
  A: 1,
  /**
   * an authoritative name server
   * @type {DnsResourceRecordType.NS}
   */
  NS: 2,
  /**
   * a mail destination (Obsolete - use MX)
   * @type {DnsResourceRecordType.MD}
   */
  MD: 3,
  /**
   * a mail forwarder(Obsolete - use MX)
   * @type {DnsResourceRecordType.MF}
   */
  MF: 4,
  /**
   * the canonical name for an alias
   * @type {DnsResourceRecordType.CNAME}
   */
  CNAME: 5,
  /**
   * marks the start of a zone of authority
   * @type {DnsResourceRecordType.SOA}
   */
  SOA: 6,
  /**
   * a mailbox domain name(EXPERIMENTAL)
   * @type {DnsResourceRecordType.MB}
   */
  MB: 7,
  /**
   * a mail group member(EXPERIMENTAL)
   * @type {DnsResourceRecordType.MG}
   */
  MG: 8,
  /**
   * a mail rename domain name(EXPERIMENTAL)
   * @type {DnsResourceRecordType.MR}
   */
  MR: 9,
  /**
   * a null RR(EXPERIMENTAL)
   * @type {DnsResourceRecordType.NULL}
   */
  NULL: 10,
  /**
   * a well known service description
   * @type {DnsResourceRecordType.WKS}
   */
  WKS: 11,
  /**
   * a domain name pointer;
   * used frequently in mDNS lookups
   * @type {DnsResourceRecordType.PTR}
   */
  PTR: 12,
  /**
   * host information
   * @type {DnsResourceRecordType.HINFO}
   */
  HINFO: 13,
  /**
   * mailbox or mail list information
   * @type {DnsResourceRecordType.MINFO}
   */
  MINFO: 14,
  /**
   * mail exchange
   * @type {DnsResourceRecordType.MX}
   */
  MX: 15,
  /**
   * text strings
   * @type {DnsResourceRecordType.TXT}
   */
  TXT: 16,
  /**
   * A request for a transfer of an entire zone
   * @type {DnsResourceRecordType.AXFR}
   */
  AXFR: 252,
  /**
   * A request for mailbox-related records(MB, MG or MR)
   * @type {DnsResourceRecordType.MAILB}
   */
  MAILB: 253,
  /**
   * A request for mail agent RRs(Obsolete - see MX)
   * @type {DnsResourceRecordType.MAILA}
   */
  MAILA: 254,
  /**
   * A request for all records
   * @type {DnsResourceRecordType._}
   */
  _: 255,
};

/**
 * Defines a Record Class.  Most of the time
 * the class will be IN for Internet.
 * (RFC1035#3.2.4)
 */
exports.DnsResourceRecordClass = {
  /**
   * the Internet.
   * This is the most common class you'll use.
   * @type {DnsResourceRecordClass.IN}
   */
  IN: 1,
  /**
   * the CSNET class (Obsolete - used only for examples in some obsolete RFCs)
   * @type {DnsResourceRecordClass.CS}
   */
  CS: 2,
  /**
   * the CHAOS class
   * @type {DnsResourceRecordClass.CH}
   */
  CH: 3,
  /**
   * Hesiod[Dyer 87]
   * @type {DnsResourceRecordClass.HS}
   */
  HS: 4,
  /**
   * Any class.
   * Can only be used in Questions' Class fields.
   * @type {DnsResourceRecordClass._}
   */
  _: 255,
};

/**
 * Serializes a DNS message object.
 *
 * TODO: Support for other record types!
 *
 * @returns {Buffer}
 */
exports.serializeDnsMessage = function serializeDnsMessage(
  /**
   * Message object to serialize.
   * @type {DnsMessage}
   */
  message
) {
  const headerBuffer = exports.serializeDnsMessageHeader(message);
  const questionsBuffer = Buffer.concat(
    message.questions.map(exports.serializeDnsQuestionEntry)
  );
  const answersBuffer = Buffer.concat(
    message.answers.map(exports.serializeDnsResourceRecord)
  );
  const nameServersBuffer = Buffer.concat(
    message.nameServers.map(exports.serializeDnsResourceRecord)
  );
  const additionalRecordsBuffer = Buffer.concat(
    message.additionalRecords.map(exports.serializeDnsResourceRecord)
  );
  return Buffer.concat([
    headerBuffer,
    questionsBuffer,
    answersBuffer,
    nameServersBuffer,
    additionalRecordsBuffer,
  ]);
};

/**
 * Serialize the header of a message.
 *
 * @returns {Buffer}
 */
exports.serializeDnsMessageHeader = function serializeDnsMessageHeader(
  /**
   * Message object to serialize.
   * @type {DnsMessage}
   */
  message
) {
  const headerBuffer = Buffer.alloc(12);
  const headerFlagsAndSuch =
    (message.header.isResponse ? 1 << 15 : 0) &
    (message.header.opCode << 11) &
    (message.header.isAuthoritativeAnswer ? 1 << 10 : 0) &
    (message.header.isTruncated ? 1 << 9 : 0) &
    (message.header.isRecursionDesired ? 1 << 8 : 0) &
    (message.header.isRecursionAvailable ? 1 << 7 : 0) &
    (message.header.responseCode << 0);

  headerBuffer.writeUInt16BE(message.header.id, 0);
  headerBuffer.writeUInt16BE(headerFlagsAndSuch, 2);
  headerBuffer.writeUInt16BE(message.questions.length, 4);
  headerBuffer.writeUInt16BE(message.answers.length, 6);
  headerBuffer.writeUInt16BE(message.nameServers.length, 8);
  headerBuffer.writeUInt16BE(message.additionalRecords.length, 10);

  return headerBuffer;
};

/**
 * Serializes a single Question Entry to a Buffer.
 * @returns {Buffer}
 */
exports.serializeDnsQuestionEntry = function serializeDnsQuestionEntry(
  /**
   * @type {DnsQuestion}
   */
  questionEntry
) {
  // TODO: Refactor.  This code is really slapdash,
  // - Need to limit name parts to 63 chars.
  // - Need to make sure I'm actually handling non-ASCII correctly.
  // - Not yet a concern, but creating all those buffers is pretty non-optimal.
  //    - The length can be precalculated easily, and the data written without all these
  //      silly intermediate buffers.
  // - Probably some other things.

  // Add an empty entry at the end for the terminal 0x00 byte.
  const nameParts = questionEntry.name.concat([""]);
  const nameBuffer = Buffer.concat(
    nameParts.map(part => {
      const byteLength = Buffer.byteLength(part);
      if (byteLength > 63) {
        throw new Error(
          `Cannot serialize Question Entry: Part "${part}" is too long`
        );
      }
      const buffer = Buffer.alloc(byteLength + 1);
      buffer.writeUInt8(part.length, 0);
      buffer.write(part, 1);
      return buffer;
    })
  );
  const questionMetaBuffer = Buffer.alloc(4);
  questionMetaBuffer.writeUInt16BE(questionEntry.type, 0);
  questionMetaBuffer.writeUInt16BE(questionEntry.class, 2);
  return Buffer.concat([nameBuffer, questionMetaBuffer]);
};

/**
 * TODO: This whole thing.
 *
 * Not immediately interested because I'm only querying.
 *
 * @returns {Buffer}
 */
exports.serializeDnsResourceRecord = function serializeDnsResourceRecord(
  /**
   * @type {DnsResourceRecord}
   */
  record
) {
  throw new Error("Not implemented");
};

/**
 * @returns {DnsMessage}
 */
exports.parseDnsMessage = function parseDnsMessage(
  /**
   * @type {Buffer}
   */
  messageBuffer
) {
  const [header, remainderAfterHeader] = exports.parseDnsMessageHeader(
    messageBuffer
  );

  const [questions, remainderAfterQuestions] = exports.parseDnsMessageQuestions(
    remainderAfterHeader,
    messageBuffer
  );

  return {
    header,
    questions,
    answers: [],
    nameServers: [],
    additionalRecords: [],
  };
};

/**
 * TODO: Handle buffer-too-short case.
 *
 * @returns {[DnsHeader, Buffer]}
 */
exports.parseDnsMessageHeader = function parseDnsMessageHeader(
  /** @type {Buffer} */
  messageBuffer
) {
  /** @type {DnsHeader} */
  const header = {
    id: messageBuffer.readUInt16BE(0),
    isResponse: (messageBuffer.readUInt8(2) & 0x80) !== 0,
    opCode: (messageBuffer.readUInt8(2) & 0x78) >> 3,
    isAuthoritativeAnswer: (messageBuffer.readUInt8(2) & 0x04) !== 0,
    isTruncated: (messageBuffer.readUInt8(2) & 0x02) !== 0,
    isRecursionDesired: (messageBuffer.readUInt8(2) & 0x01) !== 0,
    isRecursionAvailable: (messageBuffer.readUInt8(3) & 0x80) !== 0,
    responseCode: messageBuffer.readUInt8(3) & 0x0f,
  };

  const remainderAfterheader = messageBuffer.slice(12);

  return [header, remainderAfterheader];
};

/**
 * TODO: Handle buffer-too-short case.
 * Though, an error may be what I want, anyway?  Hm.
 * Maybe make that "make more descriptive error".
 *
 * @returns {[Array<DnsQuestion>, Buffer]}
 */
exports.parseDnsMessageQuestions = function parseDnsMessageQuestions(
  /**
   * The data remaining to process.
   * @type {Buffer}
   */
  remainderAfterHeader,
  /**
   * The whole data buffer, for accessing
   * the question-entry-count and for
   * any name-pointers.
   * @type {Buffer}
   */
  messageBuffer
) {
  const expectedQuestionCount = messageBuffer.readUInt16BE(4);
  const questions = [];
  let remainderAfterQuestions = remainderAfterHeader;

  while (questions.length < expectedQuestionCount) {
    /** @type {DnsQuestion} */
    const questionEntry = {
      name: [],
      type: exports.DnsResourceRecordType.A,
      class: exports.DnsResourceRecordClass.IN,
    };

    while (remainderAfterQuestions.readUInt8(0) !== 0x00) {
      // Probably want to extract this snippet...
      const namePartLength = remainderAfterQuestions.readUInt8(0);
      const namePart = remainderAfterQuestions
        .slice(1, namePartLength + 1)
        .toString("utf8");
      questionEntry.name.push(namePart);
      remainderAfterQuestions = remainderAfterQuestions.slice(
        namePartLength + 1
      );
    }

    // Skip the empty/terminal part.
    remainderAfterQuestions = remainderAfterQuestions.slice(1);

    questionEntry.type = remainderAfterQuestions.readUInt16BE(0);
    questionEntry.class = remainderAfterQuestions.readUInt16BE(2);

    questions.push(questionEntry);
    remainderAfterQuestions = remainderAfterQuestions.slice(4);
  }

  return [questions, remainderAfterQuestions];
};
