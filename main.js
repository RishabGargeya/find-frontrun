import { getLatestSwapLogs } from './dataloader.js'
import { USDCEthPair_ABI, USDCEthPair_Address } from './constants.js'; // ABI Constants for Target Smart Contracts


async function detectSandwichAttacks() {

  var totalSandwichAttacks = 0

  var logs = await getLatestSwapLogs(USDCEthPair_Address, USDCEthPair_ABI, 100, -1)

  console.log(`Number of Swaps Detected: ${logs.length}`)

  for (var i = 0; i < logs.length; i++) {

    var tx1 = logs[i]

    for (var j = i+1; j < logs.length; j++) {
      var tx2 = logs[j]
      
      // Check that the swaps are one apart
      if (tx1.blockNum == tx2.blockNum && (tx2.tidx - tx1.tidx) == 1 && tx1.data.events[3].value == tx2.data.events[2].value ) {
        console.log(tx1.data.events)
        console.log(tx2.data.events)
        console.log("\n")
        totalSandwichAttacks += 1
      }
    }
  }
  console.log(`Number of Sandwich Attacks Found: ${totalSandwichAttacks}`)

}

detectSandwichAttacks()

