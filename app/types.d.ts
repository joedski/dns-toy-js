interface DnsMessage {
  header: DnsHeader;
  questions: Array<DnsQuestion>;
  answers: Array<DnsResourceRecord>;
  nameServers: Array<DnsResourceRecord>;
  additionalRecords: Array<DnsResourceRecord>;
}

interface DnsHeader {
  /**
   * Uint16 program-assigned ID for this request.
   * This ID is echoed back by the responses from the servers.
   */
  id: number;

  /**
   * The QR field.
   * False if this is a query, true if this is a response.
   */
  isResponse: boolean;

  /**
   * The OPCODE field.
   * What kind of request this is.
   */
  opCode: DnsOpCode;

  /**
   * The AA field.
   * Whether or not an Authoritative Answer.
   * Only set in responses, this indicates that the
   * responding server is the authoritative name server.
   */
  isAuthoritativeAnswer: boolean;

  /**
   * The TC field.
   * Indicates that the message was TrunCated "due to length
   * greater than that permitted on the transmission channel".
   */
  isTruncated: boolean;

  /**
   * The RD field.
   * Set by the sender when they wish the name server to
   * persue their query recursively.  Usually for internet
   * lookups, this is what you want.  Locally, probably
   * not required.
   *
   * This field will be echoed back by the responding NS.
   */
  isRecursionDesired: boolean;

  /**
   * The RA field.
   * The server sets this in the response if it is able
   * to provide recursive lookup.
   */
  isRecursionAvailable: boolean;

  /**
   * A Uint4
   */
  responseCode: DnsResponseCode;
}

/**
 * Op-code specifying the kind of query being made.
 * Values 3-15 are reserved for future use. (RFC1035#4.1.1)
 */
enum DnsOpCode {
  /**
   * A standard query.
   */
  QUERY = 0,
  /**
   * An Inverse Query.
   */
  IQUERY = 1,
  /**
   * Server status request.
   */
  STATUS = 2,
}

/**
 * Possible response codes the server can send back.
 * Values 6-15 are reserved for future use.
 */
enum DnsResponseCode {
  NO_ERROR = 0,
  FORMAT_ERROR = 1,
  SERVER_FAILURE = 2,
  NAME_ERROR = 3,
  NOT_IMPLEMENTED = 4,
  REFUSED = 5,
}

/**
 * An entry in the Question Section.
 */
interface DnsQuestion {
  /**
   * The name in question, as represented by a list
   * of separate strings.  Usually doing stringName.split('.')
   * is sufficient to get this value from a string.
   */
  name: Array<string>;

  /**
   * Uint16 defining the type of records being queried.
   */
  type: DnsResourceRecordType;

  /**
   * Uint16 defining the class of records being queried.
   */
  class: DnsResourceRecordClass;
}

/**
 * Defines the type of a record, whether it's what type
 * of record or querying or the type of the record returned.
 * (RFC1035#3.2.3)
 */
enum DnsResourceRecordType {
  /**
   * a host address
   */
  A = 1,
  /**
   * an authoritative name server
   */
  NS = 2,
  /**
   * a mail destination (Obsolete - use MX)
   */
  MD = 3,
  /**
   * a mail forwarder(Obsolete - use MX)
   */
  MF = 4,
  /**
   * the canonical name for an alias
   */
  CNAME = 5,
  /**
   * marks the start of a zone of authority
   */
  SOA = 6,
  /**
   * a mailbox domain name(EXPERIMENTAL)
   */
  MB = 7,
  /**
   * a mail group member(EXPERIMENTAL)
   */
  MG = 8,
  /**
   * a mail rename domain name(EXPERIMENTAL)
   */
  MR = 9,
  /**
   * a null RR(EXPERIMENTAL)
   */
  NULL = 10,
  /**
   * a well known service description
   */
  WKS = 11,
  /**
   * a domain name pointer;
   * used frequently in mDNS lookups
   */
  PTR = 12,
  /**
   * host information
   */
  HINFO = 13,
  /**
   * mailbox or mail list information
   */
  MINFO = 14,
  /**
   * mail exchange
   */
  MX = 15,
  /**
   * text strings
   */
  TXT = 16,
  /**
   * A request for a transfer of an entire zone
   */
  AXFR = 252,
  /**
   * A request for mailbox-related records(MB, MG or MR)
   */
  MAILB = 253,
  /**
   * A request for mail agent RRs(Obsolete - see MX)
   */
  MAILA = 254,
  /**
   * A request for all records;
   * the string "*" doesn't work for enums in TS,
   * hence the underscore.
   */
  _ = 255,
}

/**
 * Defines a Record Class.  Most of the time
 * the class will be IN for Internet.
 * (RFC1035#3.2.4)
 */
enum DnsResourceRecordClass {
  /**
   * the Internet.
   * This is the most common class you'll use.
   */
  IN = 1,
  /**
   * the CSNET class (Obsolete - used only for examples in some obsolete RFCs)
   */
  CS = 2,
  /**
   * the CHAOS class
   */
  CH = 3,
  /**
   * Hesiod[Dyer 87]
   */
  HS = 4,
  /**
   * Any class.
   * Can only be used in Questions' Class fields.
   * the string "*" doesn't work for enums in TS,
   * hence the underscore.
   */
  _ = 255,
}

// TODO: Should I do ALL the standard RR Types at some point?

/**
 * A Resource Record with Type, Class, and additional fields
 * for the Record Data. (RDATA) (RFC1035#4.1.3)
 */
type DnsResourceRecord = {
  name: Array<string>;
  type: DnsResourceRecordType;
  class: DnsResourceRecordClass;
  ttl: number;
  /**
   * The raw data received for this record.
   */
  dataRaw: Buffer;
} & (
  | DnsCnameResourceRecordData
  | DnsNsResourceRecordData
  | DnsPtrResourceRecordData
  | DnsAResourceRecordData);

/**
 * A record with just a conanical name.
 */
interface DnsCnameResourceRecordData {
  type: DnsResourceRecordType.CNAME;

  /**
   * The conanical name.
   */
  domainName: Array<string>;
}

interface DnsNsResourceRecordData {
  type: DnsResourceRecordType.NS;

  /**
   * Domain name of the authoritative name server
   * for the specified class and domain.
   */
  domainName: Array<string>;
}

interface DnsPtrResourceRecordData {
  type: DnsResourceRecordType.PTR;

  /**
   * A domain name that points to some location
   * in the domain name space.
   */
  domainName: Array<string>;
}

interface DnsAResourceRecordData {
  type: DnsResourceRecordType.A;

  /**
   * Address in the Record.
   */
  address: string;
}
