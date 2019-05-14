const dgram = require("dgram");
const {
  createDnsMessage,
  serializeDnsMessage,
  DnsResourceRecordType,
  DnsResourceRecordClass,
} = require("./dns-message");

exports.doMdnsAddressRequest = function doMdnsAddressRequest(
  /** @type {(error: Error | null) => void} */
  done
) {
  // all ipv4 here.
  const socket = dgram.createSocket("udp4");
  /** @type {NodeJS.Timeout | null} */
  let timeoutId = null;

  function handleTimeout() {
    timeoutId = null;
    socket.close();
    console.log("Timed out!");
    done(null);
  }

  socket.on("error", error => {
    console.error("Error!", error);
    socket.close();
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    done(error);
  });

  socket.on("message", (msg, rinfo) => {
    console.log(
      `got: ${msg.toString("hex")} from ${rinfo.address}:${rinfo.port}`
    );
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

    const message = createDnsMessage({
      questions: [
        {
          name: ["datamunch", "local"],
          type: DnsResourceRecordType.A,
          class: DnsResourceRecordClass.IN,
        },
      ],
    });

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
          done(error);
        } else {
          console.log("Waiting...!");
          timeoutId = setTimeout(handleTimeout, 5000);
        }
      }
    );
  });
};
