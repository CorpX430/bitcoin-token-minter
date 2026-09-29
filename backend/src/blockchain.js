import "dotenv/config";
import { ethers } from "ethers";

const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function mint(address,uint256)",
];

const rpcUrl = process.env.RPC_URL || "https://bsc-dataseed.binance.org";
const provider = new ethers.JsonRpcProvider(rpcUrl, Number(process.env.CHAIN_ID || 56));
const contractAddress = process.env.CONTRACT_ADDRESS;
const readContract = () => new ethers.Contract(contractAddress, ABI, provider);

function assertConfigured() {
  if (!contractAddress || !ethers.isAddress(contractAddress) || contractAddress === ethers.ZeroAddress) {
    const error = new Error("CONTRACT_ADDRESS is not configured");
    error.status = 503;
    throw error;
  }
}

export async function getTokenInfo() {
  assertConfigured();
  const contract = readContract();
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name(), contract.symbol(), contract.decimals(), contract.totalSupply(),
  ]);
  return {
    address: contractAddress,
    name,
    symbol,
    decimals: Number(decimals),
    totalSupply: totalSupply.toString(),
    totalSupplyFormatted: ethers.formatUnits(totalSupply, decimals),
    chainId: Number(process.env.CHAIN_ID || 56),
    explorerUrl: `https://bscscan.com/token/${contractAddress}`,
  };
}

export async function getBalance(address) {
  assertConfigured();
  const contract = readContract();
  const [balance, decimals, symbol] = await Promise.all([
    contract.balanceOf(address), contract.decimals(), contract.symbol(),
  ]);
  return { address, rawBalance: balance.toString(), balance: ethers.formatUnits(balance, decimals), symbol, decimals: Number(decimals) };
}

export async function mintTokens(address, amount) {
  assertConfigured();
  if (!process.env.WALLET_PRIVATE_KEY) {
    const error = new Error("WALLET_PRIVATE_KEY is not configured");
    error.status = 503;
    throw error;
  }
  const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, ABI, signer);
  const tx = await contract.mint(address, amount);
  const receipt = await tx.wait();
  return { transactionHash: receipt.hash, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed?.toString() };
}
