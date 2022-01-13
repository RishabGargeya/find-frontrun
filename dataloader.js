import { createAlchemyWeb3 } from "@alch/alchemy-web3" // Alchemy Package
import axios from 'axios'; // HTTP request package
import abiDecoder from 'abi-decoder'; // Import ABI Decoder Package (Decodes Smart Contract Receipts into Human Readable Form)

export async function getLatestSwapLogs(pairAddress, pairABI, numPastBlocksToRetrieve, startingBlock=-1) {
  
  const web3 = createAlchemyWeb3("https://eth-mainnet.alchemyapi.io/v2/tKwQpTHeQTpCjDeoWMsNRc6y8UcjivV_");
  
  // Get the Current Block Number
  var blockNumber = await web3.eth.getBlockNumber();
  console.log("The latest block number is " + blockNumber);
  blockNumber -= numPastBlocksToRetrieve
  if (startingBlock != -1) {
    blockNumber = startingBlock
  }
  
  // Use the Alchemy Parity API to gather TX Receipts for the Past 1000 Blocks
  var receipts = []

  for (var i = 1; i <= numPastBlocksToRetrieve; i++) {
    var currentBlockNumber = "0x" + Number(blockNumber).toString(16);
    console.log("Gathering receipts for block number: " + blockNumber);

    var blockReceipt = await axios.post('https://eth-mainnet.alchemyapi.io/v2/tKwQpTHeQTpCjDeoWMsNRc6y8UcjivV_', {
      "jsonrpc": "2.0", "id": 1, "method": "parity_getBlockReceipts", "params": [currentBlockNumber]
    })
    receipts.push({ blockNumber: currentBlockNumber, data: blockReceipt.data.result })

    blockNumber += 1
  }

  // Load Contract ABI for Uniswap V3 Pairing. We are preprocessing for the Uniswap ETH<>UNI pool.
  abiDecoder.addABI(pairABI)

  // For each block's receipt

  var detectedSwaps = []

  for (var j = 0; j < receipts.length; j++) {
    var receipt = receipts[j].data;
    //console.log(`Number of receipts in block ${Number(receipts[j].blockNumber)} : ${receipt.length}`)
    for (var tidx = 0; tidx < receipt.length; tidx++) { // For each transaction in the block's receipt
        var decodedLogs = abiDecoder.decodeLogs(receipt[tidx].logs) // Decode the logs for this transaction
        for (var logid = 0; logid < decodedLogs.length; logid++) { 
          if ((decodedLogs[logid].address == pairAddress)) { // Check if this log is an ETH<>UNI swap or UNI<>ETH swap
            console.log(`Number of receipts in block ${Number(receipts[j].blockNumber)} : ${receipt.length}`)
            console.log(`Found a swap at transaction index: ${tidx}, ${receipt[tidx].transactionHash} for Block ${receipts[j].blockNumber}`)
            detectedSwaps.push({'blockNum': receipts[j].blockNumber, 'tidx' : tidx, 'data': decodedLogs[logid]})
          }
        }
      //}
    }
  }

  return detectedSwaps
  
}