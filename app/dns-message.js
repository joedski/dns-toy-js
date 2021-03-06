// NOTE: All the @type annotations in the enums are to get
// exact types.  maybe I'll think of a better way to do it later.

const { formatIpv4, formatIpv6 } = require("./util/format");

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
  // TODO: Get All Updated Types!
  // RFC1035 is pretty old.
  /**
   * An IPV6 address.
   * @type {DnsResourceRecordType.AAAA}
   */
  AAAA: 28,
  /**
   * Generalized service location record, used for newer protocols
   * instead of creating protocol-specific records such as MX.
   * https://tools.ietf.org/html/rfc2782
   * https://en.wikipedia.org/wiki/SRV_record
   * @type {DnsResourceRecordType.SRV}
   */
  SRV: 33,
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
  // - Need to limit name parts to 63 octets.
  // - Need to limit total domain name length to 256 octets.
  // - Need to make sure I'm actually handling non-ASCII correctly.
  //    - Actually, after reading, that should be a separate step before this,
  //      Something something ToASCII, Punycode, blah.
  //      But not something I handle in this.
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
  messageBuffer,
  /**
   * @type {{ includeOffsets?: boolean }}
   */
  options = {}
) {
  const [header, remainderAfterHeader] = exports.parseDnsMessageHeader(
    messageBuffer
  );

  const questionsOffset = messageBuffer.length - remainderAfterHeader.length;

  const [questions, remainderAfterQuestions] = exports.parseDnsMessageQuestions(
    remainderAfterHeader,
    messageBuffer,
    options
  );

  const answersOffset = messageBuffer.length - remainderAfterQuestions.length;

  const [
    answers,
    remainderAfterAnswers,
  ] = exports.parseDnsMessageResourceRecords(
    remainderAfterQuestions,
    messageBuffer,
    messageBuffer.readUInt16BE(6),
    options
  );

  const nameServersOffset = messageBuffer.length - remainderAfterAnswers.length;

  const [
    nameServers,
    remainderAfterNameServers,
  ] = exports.parseDnsMessageResourceRecords(
    remainderAfterAnswers,
    messageBuffer,
    messageBuffer.readUInt16BE(8),
    options
  );

  const additionalRecordsOffset =
    messageBuffer.length - remainderAfterNameServers.length;

  const [additionalRecords] = exports.parseDnsMessageResourceRecords(
    remainderAfterNameServers,
    messageBuffer,
    messageBuffer.readUInt16BE(10),
    options
  );

  return {
    header,
    questions,
    answers,
    nameServers,
    additionalRecords,
    ...(options.includeOffsets
      ? {
          questionsOffset,
          answersOffset,
          nameServersOffset,
          additionalRecordsOffset,
        }
      : null),
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
  messageBuffer,
  /**
   * @type {{ includeOffsets?: boolean }}
   */
  options
) {
  const expectedQuestionCount = messageBuffer.readUInt16BE(4);
  /** @type {Array<DnsQuestion>} */
  const questions = [];
  let remainderAfterQuestions = remainderAfterHeader;

  while (questions.length < expectedQuestionCount) {
    /** @type {DnsQuestion} */
    const questionEntry = {
      name: [],
      type: exports.DnsResourceRecordType.A,
      class: exports.DnsResourceRecordClass.IN,
      ...(options.includeOffsets
        ? {
            offset: messageBuffer.length - remainderAfterQuestions.length,
          }
        : null),
    };

    const nameResults = exports.readName(
      remainderAfterQuestions,
      messageBuffer
    );
    questionEntry.name = nameResults[0];
    remainderAfterQuestions = nameResults[1];

    questionEntry.type = remainderAfterQuestions.readUInt16BE(0);
    questionEntry.class = remainderAfterQuestions.readUInt16BE(2);

    questions.push(questionEntry);
    remainderAfterQuestions = remainderAfterQuestions.slice(4);
  }

  return [questions, remainderAfterQuestions];
};

/**
 * Parses a Resource Records section, which covers all of
 * Answers, Name Servers, and Additional Records.
 *
 * Where defined, it performs additional processing per type.
 * @returns {[Array<DnsResourceRecord>, Buffer]}
 */
exports.parseDnsMessageResourceRecords = function parseDnsMessageResourceRecords(
  /**
   * The data remaining to process.
   * @type {Buffer}
   */
  remainderAfterPreviousSection,
  /**
   * The whole data buffer, for
   * any name-pointers.
   * @type {Buffer}
   */
  messageBuffer,
  /**
   * Expected record count for this section.
   * @type {number}
   */
  expectedRecordCount,
  /**
   * @type {{ includeOffsets?: boolean }}
   */
  options
) {
  /** @type {Array<DnsResourceRecord>} */
  const resourceRecords = [];
  let remainderAfterSection = remainderAfterPreviousSection;

  while (resourceRecords.length < expectedRecordCount) {
    const offset = messageBuffer.length - remainderAfterSection.length;
    const nameResults = exports.readName(remainderAfterSection, messageBuffer);
    const recordName = nameResults[0];
    remainderAfterSection = nameResults[1];

    const recordType = remainderAfterSection.readUInt16BE(0);
    const recordClass = remainderAfterSection.readUInt16BE(2);
    const recordTTL = remainderAfterSection.readUInt32BE(4);
    const recordDataLength = remainderAfterSection.readUInt16BE(8);
    remainderAfterSection = remainderAfterSection.slice(10);

    const recordDataOffset =
      messageBuffer.length - remainderAfterSection.length;
    const recordData = remainderAfterSection.slice(0, recordDataLength);
    remainderAfterSection = remainderAfterSection.slice(recordDataLength);

    resourceRecords.push(
      exports.createResourceRecordFromParseResults(
        {
          name: recordName,
          type: recordType,
          class: recordClass,
          ttl: recordTTL,
          dataRaw: recordData,
          ...(options.includeOffsets
            ? {
                offset,
                recordDataOffset,
              }
            : null),
        },
        messageBuffer
      )
    );
  }

  return [resourceRecords, remainderAfterSection];
};

/**
 * Creates a Resource Record from the raw parse results, adding
 * additional properties for a few Record Types I felt like supporting.
 * @returns {DnsResourceRecord}
 */
exports.createResourceRecordFromParseResults = function createResourceRecordFromParseResults(
  /** @type {{ name: Array<string>; type: DnsResourceRecordType; class: DnsResourceRecordClass; ttl: number; dataRaw: Buffer }} */
  { type: recordType, ...recordProps },
  /** @type {Buffer} */
  message
) {
  // Explicitly breaking out recordProps.type allows tsserver to correctly
  // set the return type.
  switch (recordType) {
    case exports.DnsResourceRecordType.A: {
      const address = formatIpv4(recordProps.dataRaw);

      return {
        type: recordType,
        ...recordProps,
        address,
      };
    }

    case exports.DnsResourceRecordType.AAAA: {
      const address = formatIpv6(recordProps.dataRaw);

      return {
        type: recordType,
        ...recordProps,
        address,
      };
    }

    case exports.DnsResourceRecordType.NS:
    case exports.DnsResourceRecordType.PTR:
    case exports.DnsResourceRecordType.CNAME: {
      const [domainName] = exports.readName(recordProps.dataRaw, message);

      return {
        type: recordType,
        ...recordProps,
        domainName,
      };
    }

    case exports.DnsResourceRecordType.TXT: {
      const [texts] = exports.readAllCharacterStrings(recordProps.dataRaw);

      return {
        type: recordType,
        ...recordProps,
        texts,
      };
    }

    case exports.DnsResourceRecordType.SRV: {
      // I think this is correct, but I'm not exactly sure.
      // The description in RFC 2782 is doesn't really give
      // a bitfield breakdown.
      // https://tools.ietf.org/html/rfc2782
      const priority = recordProps.dataRaw.readUInt16BE(0);
      const weight = recordProps.dataRaw.readUInt16BE(2);
      const port = recordProps.dataRaw.readUInt16BE(4);
      const [target] = exports.readName(recordProps.dataRaw.slice(6), message);

      return {
        type: recordType,
        ...recordProps,
        priority,
        weight,
        port,
        target,
      };
    }

    default: {
      return {
        type: recordType,
        ...recordProps,
      };
    }
  }
};

/**
 * Parses a Domain Name at a given point,
 * handling name-pointers correctly.
 * @returns {[Array<string>, Buffer]} the name-parts array and remainder after actually-read portion.
 */
exports.readName = function readName(
  /** @type {Buffer} */
  messageRemainder,
  /** @type {Buffer} */
  message
) {
  const leadOctet = messageRemainder.readUInt8(0);

  if ((leadOctet & 0xc0) === 0xc0) {
    return exports.readNamePointer(messageRemainder, message);
  } else if ((leadOctet & 0xc0) === 0x80 || (leadOctet & 0xc0) === 0x40) {
    throw new Error(
      `Unsupported name type: ${(leadOctet & 0xc0).toString(16)}`
    );
  } else {
    return exports.readNameInline(messageRemainder, message);
  }
};

/**
 * Parses an inline Domain Name at a given point,
 * @returns {[Array<string>, Buffer]} the name-parts array and remainder after actually-read portion.
 */
exports.readNamePointer = function readNamePointer(
  /** @type {Buffer} */
  messageRemainder,
  /** @type {Buffer} */
  message
) {
  const leadOctet = messageRemainder.readUInt8(0);
  const type = leadOctet & 0xc0;
  const offset = messageRemainder.readUInt16BE(0) & ~0xc000;

  if (type === 0xc0) {
    const remainderAfterPointer = messageRemainder.slice(2);
    const [name] = exports.readName(message.slice(offset), message);
    return [name, remainderAfterPointer];
  } else {
    throw new Error(`Unsupported name type: ${type.toString(16)}`);
  }
};

/**
 * Parses an inline Domain Name at a given point,
 * @returns {[Array<string>, Buffer]} the name-parts array and remainder after actually-read portion.
 */
exports.readNameInline = function readNameInline(
  /** @type {Buffer} */
  messageRemainder,
  /** @type {Buffer} */
  message
) {
  /** @type {Array<string>} */
  const name = [];
  let remainderAfterName = messageRemainder;

  while (
    remainderAfterName.readUInt8(0) !== 0x00 &&
    (remainderAfterName.readUInt8(0) & 0xc0) === 0
  ) {
    // Probably want to extract this snippet...
    const namePartLength = remainderAfterName.readUInt8(0);
    const namePart = remainderAfterName
      .slice(1, namePartLength + 1)
      .toString("utf8");
    name.push(namePart);
    remainderAfterName = remainderAfterName.slice(namePartLength + 1);
  }

  if ((remainderAfterName.readUInt8(0) & 0xc0) !== 0) {
    const [nameFromPointer, remainderAfterPointer] = exports.readName(
      remainderAfterName,
      message
    );
    return [name.concat(nameFromPointer), remainderAfterPointer];
  } else {
    // Skip the terminal part.
    remainderAfterName = remainderAfterName.slice(1);
    return [name, remainderAfterName];
  }
};

/**
 * Reads a single Character String.
 *
 * A Character String is defined by RFC 1035 Section 3.3. as
 * - An octet which is the length field
 * - A number of octets equal to the value of that length field
 *
 * A Character String may thus be up to 256 octets long,
 * 1 for the 0xff length field, and 255 for the character octets.
 *
 * @returns {[string, Buffer]}
 */
exports.readCharacterString = function readCharacterString(
  /** @type {Buffer} */
  messageRemainder
) {
  const stringLength = messageRemainder.readUInt8(0);
  // TODO: Proper encoding?
  const string = messageRemainder.slice(1, stringLength + 1).toString("utf8");

  return [string, messageRemainder.slice(stringLength + 1)];
};

/**
 * Reads a series of 1 or more Character Strings, terminated by
 * a zero-length Character String.
 *
 * Theoretically, it should handle the degenerate case of 0 character strings,
 * which is to say, a single Character String that consists of only a 0x00
 * length field and thus is the Terminal.
 *
 * This is used by, for instance, the TXT Record Type.
 * @returns {[Array<string>, Buffer]}
 */
exports.readAllCharacterStrings = function readAllCharacterStrings(
  /** @type {Buffer} */
  messageRemainder
) {
  /** @type {Array<string>} */
  const strings = [];
  let remainderAfterStrings = messageRemainder;

  while (remainderAfterStrings.readUInt8(0) !== 0) {
    const stringRes = exports.readCharacterString(remainderAfterStrings);
    strings.push(stringRes[0]);
    remainderAfterStrings = stringRes[1];
  }

  remainderAfterStrings = remainderAfterStrings.slice(1);

  return [strings, remainderAfterStrings];
};

/**
 * Convenience function that takes a partially specified
 * DnsMessage object and returns a fully specified one
 * using default values for any unspecified fields.
 *
 * @returns {DnsMessage}
 */
exports.createDnsMessage = function createDnsMessage(
  /** @type {CreateDnsRequestOptions} */
  options
) {
  /** @type {Partial<DnsHeader>} */
  const header = options.header || {};

  return {
    header: {
      id:
        header.id >= 0
          ? Math.floor(header.id)
          : Math.floor(Math.random() * 0xffff),
      isResponse: header.isResponse === true,
      opCode: header.opCode || exports.DnsOpCode.QUERY,
      isAuthoritativeAnswer: header.isAuthoritativeAnswer === true,
      isTruncated: header.isTruncated === true,
      isRecursionDesired: header.isRecursionDesired === true,
      isRecursionAvailable: header.isRecursionAvailable === true,
      responseCode: header.responseCode || exports.DnsResponseCode.NO_ERROR,
    },
    questions: options.questions || [],
    answers: options.answers || [],
    nameServers: options.nameServers || [],
    additionalRecords: options.additionalRecords || [],
  };
};
