import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import { createThirdwebClient, defineChain } from "thirdweb";
import { deployContract } from "thirdweb/deploys";
import { privateKeyToAccount } from "thirdweb/wallets";

const sourcePath = path.resolve("contracts/SoulboundBitcoin.sol");
const source = fs.readFileSync(sourcePath, "utf8");
const input = { language: "Solidity", sources: { "SoulboundBitcoin.sol": { content: source } }, settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } } };
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors?.filter((entry) => entry.severity === "error") || [];
if (errors.length) throw new Error(errors.map((entry) => entry.formattedMessage).join("\n"));
const compiled = output.contracts["SoulboundBitcoin.sol"].SoulboundBitcoin;

if (!process.env.THIRDWEB_CLIENT_ID || !process.env.THIRDWEB_SECRET_KEY || !process.env.WALLET_PRIVATE_KEY) {
  throw new Error("Set THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY, and WALLET_PRIVATE_KEY before deployment.");
}
const client = createThirdwebClient({ clientId: process.env.THIRDWEB_CLIENT_ID, secretKey: process.env.THIRDWEB_SECRET_KEY });
const chain = defineChain(Number(process.env.CHAIN_ID || 56));
const account = privateKeyToAccount({ client, privateKey: process.env.WALLET_PRIVATE_KEY });
const abi = compiled.abi;
const bytecode = `0x${compiled.evm.bytecode.object}`;
const address = await deployContract({
  client,
  chain,
  account,
  abi,
  bytecode,
  constructorParams: { initialOwner: account.address },
});
console.log(JSON.stringify({ deployedAddress: address, deployer: account.address, chainId: Number(process.env.CHAIN_ID || 56), explorerUrl: `https://bscscan.com/address/${address}` }, null, 2));
