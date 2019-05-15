const dgram = require("dgram");
const {
  createDnsMessage,
  serializeDnsMessage,
  parseDnsMessage,
  DnsResourceRecordType,
  DnsResourceRecordClass,
} = require("./dns-message");

function stringifyWithLoggableBuffers(key, value) {
  if (Buffer.isBuffer(value)) {
    return `Buffer(${value.length}):${value.toString("hex")}`;
  }

  // the result of buf.toJSON()
  if (
    value &&
    typeof value === "object" &&
    value.type === "Buffer" &&
    Array.isArray(value.data)
  ) {
    return `Buffer(${value.data.length}):${Buffer.of(...value.data).toString(
      "hex"
    )}`;
  }

  if (
    Array.isArray(value) &&
    value.every(v => typeof v === "string" || typeof v === "number")
  ) {
    return `[${value.join(", ")}]`;
  }

  return value;
}

exports.doMdnsRequest = function doMdnsRequest(
  messageProps,
  {
    timeout = 5000,
    onDone = error => {
      if (error) {
        console.error("Done with error:", error);
      } else {
        console.log("Done!");
      }
    },
  } = {}
) {
  const socket = dgram.createSocket("udp4");
  /** @type {NodeJS.Timeout | null} */
  let timeoutId = null;

  function handleTimeout() {
    timeoutId = null;
    socket.close();
    console.log("Timed out!");
    onDone(null);
  }

  socket.on("error", error => {
    console.error("Error!", error);
    socket.close();
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    onDone(error);
  });

  socket.on("message", (msg, rinfo) => {
    console.log(
      `\ngot from ${rinfo.address}:${rinfo.port}: ${msg.toString("hex")}`
    );
    const res = parseDnsMessage(msg);
    console.log(JSON.stringify(res, stringifyWithLoggableBuffers, 2));
  });

  socket.on("listening", () => {
    const address = socket.address();
    const addressFormatted =
      typeof address === "object"
        ? `${address.address}:${address.port}`
        : address;
    console.log(`listening for responses on ${addressFormatted}`);
  });

  const port = Number(process.env.PORT) || 10000;

  socket.bind(port, () => {
    const mdnsBroadcastAddress = "224.0.0.251";
    const mdnsBroadcastPort = 5353;

    socket.addMembership(mdnsBroadcastAddress);

    const message = createDnsMessage(messageProps);
    const messageBuffer = serializeDnsMessage(message);

    console.log(`Sending message: ${messageBuffer.toString("hex")}`);

    socket.send(
      messageBuffer,
      mdnsBroadcastPort,
      mdnsBroadcastAddress,
      error => {
        if (error) {
          console.error("Error sending!", error);
          socket.close();
          onDone(error);
        } else {
          console.log("Waiting...!");
          timeoutId = setTimeout(handleTimeout, timeout);
        }
      }
    );
  });
};

exports.doMdnsAddressRequest = () =>
  exports.doMdnsRequest({
    questions: [
      {
        name: ["datamunch", "local"],
        type: DnsResourceRecordType.A,
        class: DnsResourceRecordClass.IN,
      },
    ],
  });

exports.doMdnsPtrBrowseRequest = () =>
  exports.doMdnsRequest({
    questions: [
      {
        name: ["_services", "_dns-sd", "_udp", "local"],
        type: DnsResourceRecordType.PTR,
        class: DnsResourceRecordClass.IN,
      },
    ],
  });

exports.doMdnsPtrPrinterRequest = () =>
  exports.doMdnsRequest({
    questions: [
      {
        name: ["_printer", "_tcp", "local"],
        type: DnsResourceRecordType.PTR,
        class: DnsResourceRecordClass.IN,
      },
    ],
  });
