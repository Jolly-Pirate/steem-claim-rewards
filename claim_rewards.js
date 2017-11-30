/*
 STEEM Rewards Auto Claim Bot v1.0 - by @drakos
 
 FEATURES:
 - Uses the multiplatform NodeJS
 - Support for multiple accounts
 - Error handling of wrong account names
 - RPC node status check
 - Private/public key validation
 
 SETUP:
 - Install NodeJS (https://nodejs.org).
 - Create a folder for your project and go into it.
 - Copy the script into a file, e.g. claim_rewards.js
 - Alternatively `git clone https://github.com/Jolly-Pirate/steem-claim-rewards`, then `cd steem-claim-rewards`
 - Edit the CONFIG section.
 - Under linux, secure the file's permissions: `chmod 600 claim_rewards.js`
 - Install the steem package into your project folder: `npm install steem@latest --save`
 - Run the script from the project's folder with: `node claim_rewards.js`
 
 NOTE:
 The script file will contain your private posting keys.
 SECURE it, it's your responsibility.
 */

var steem = require('steem');

// CONFIG START
// Add the account names with their corresponding PRIVATE POSTING KEY, separated by commas
// Notice that the last account does not have a comma at the end of its line
var myAccounts = {
  account1: '5JPOSTINGKEY',
  account2: '5JPOSTINGKEY',
  account3: '5JPOSTINGKEY'
};
var interval = 60; // Set the timer in minutes
var rpc = 'https://api.steemit.com'; // Set your RPC node, or leave api.steemit.com, it's very fast
// CONFIG END

// Sort the accounts alphabetically, keep things nice and ordered
myAccounts = JSON.stringify(myAccounts, Object.keys(myAccounts).sort());
myAccounts = JSON.parse(myAccounts);
// Put the account names into an array
var accountArray = [];
for (var jsonkey in myAccounts) {
  var account = jsonkey;
  accountArray.push(account); // Append the accounts into a new array
}

getRewardsForAccounts(); // Get the rewards upon running the script, then start the timer
var tid = setInterval(getRewardsForAccounts, interval * 60 * 1000);

// FUNCTIONS

function getRewardsForAccounts() {
  // Print the current date/time (optional)
  var date = new Date().toLocaleDateString();
  var time = new Date().toLocaleTimeString();
  console.log('\n' + date, time);

  // Check if the RPC is up, then get the rewards for each account
  checkRPC(rpc, function (rpc_status) {
    if (rpc_status) {
      accountArray.forEach(function (account) {
        getRewards(account);
      });
    } else {
      console.log(rpc, 'unreachable. Check the address or try another one.');
    }
  });
}

function abortTimer() { // Can be called if you want to stop the timer
  clearInterval(tid);
}

function checkRPC(rpc, callback) {
  steem.api.setOptions({url: rpc});
  steem.api.getAccountCount(function (err, result) {
    if (err) {
      console.log(err);
      callback(false);
    }
    if (result && result > 0)
      callback(true);
  });
}

function checkPrivateKey(privateKeyFromConfig, publicKeyFromBlockchain) {
  // Verify the private key in the config vs the public key on the blockchain
  try {
    if (steem.auth.wifIsValid(privateKeyFromConfig, publicKeyFromBlockchain)) {
      return true;
    }
  } catch (e) {
    //console.log(e);
    return false;
  }
}

function getRewards(account) {
  steem.api.getAccounts([account], function (err, response) {
    if (err) {
      console.log(err);
    }
    if (response[0]) { // Check the response[0], because the response array is empty when the account doesn't exist on the blockchain
      name = response[0]['name'];
      reward_sbd = response[0]['reward_sbd_balance']; // will be claimed as Steem Dollars (SBD)
      reward_steem = response[0]['reward_steem_balance']; // this parameter is always '0.000 STEEM'
      reward_steempower = response[0]['reward_vesting_steem']; // STEEM to be received as Steem Power (SP), see reward_vesting_balance below
      reward_vests = response[0]['reward_vesting_balance']; // this is the actual VESTS that will be claimed as SP

      rsbd = parseFloat(reward_sbd);
      rspw = parseFloat(reward_steempower); // Could also check for reward_vesting_balance instead

      // Claim rewards if there is SBD and/or SP to claim
      if (rsbd > 0 || rspw > 0) {
        privateKey = myAccounts[name]; // Pulled from the JSON object in the CONFIG
        publicKey = response[0].posting.key_auths[0][0]; // Get public key on the blockchain

        // Claim rewards if the private key has a valid public key on the blockchain
        if (checkPrivateKey(privateKey, publicKey)) {
          // We can claim partial rewards, if we specify the amount of reward_sbd and reward_vesting_balance. 
          // However, we want to claim everything.

          //steem.broadcast.claimRewardBalance(privateKey, name, reward_steem, '0.005 SBD', '10.000000 VESTS', function (err, response) { // for testing
          steem.broadcast.claimRewardBalance(privateKey, name, reward_steem, reward_sbd, reward_vests, function (err, response) {
            if (err) {
              console.log('Error claiming reward for', account);
            }
            if (response) {
              operationResult = response.operations[0][1]; // Get the claim_reward_balance JSON
              confirm_account = operationResult.account;
              confirm_reward_sbd = operationResult.reward_sbd;
              confirm_reward_vests = operationResult.reward_vests;
              console.log(confirm_account, 'claimed', confirm_reward_sbd, 'and', rspw, 'SP (', confirm_reward_vests, ')');
            }
          });
        } else {
          console.log('Invalid private key for:', name);
        }
      }
    } else {
      console.log(account, 'does not exist on the blockchain.');
    }
  });
}
