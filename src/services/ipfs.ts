import { GATEWAY_URL } from "config";
import CID from "cids";
import axios from "axios";
import multihashes from "multihashes";

export class IpfsService {
  public static async getIPFSFile(sha3Hash: string) {
    const ipfsHash = shaToCid(sha3Hash);
    const url = `${GATEWAY_URL}${ipfsHash}`;

    return (await axios.get(url)).data;
  }
}

// #region Helpers
function toMh(shaHash: string) {
  const buf = Buffer.from(shaHash, "hex");
  return multihashes.encode(buf, "sha3-256");
}

function toCid(mh: string) {
  const cid = new CID(1, "raw", Buffer.from(mh, "hex"), "base32");
  return cid.toBaseEncodedString();
}

function shaToCid(hash: string) {
  return toCid(Buffer.from(toMh(hash.slice(2))).toString("hex"));
}
// #endregion
