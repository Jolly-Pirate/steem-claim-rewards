# steem-claim-rewards
Steem Rewards Auto Claim Bot

## STEEM Rewards Auto Claim Bot v1.0 - by @drakos
 
### FEATURES
- Uses the multiplatform NodeJS
- Support for multiple accounts
- Error handling of wrong account names
- RPC node status check
- Private/public key validation
 
### SETUP
- Install NodeJS (https://nodejs.org).
- Create a folder for your project and go into it.
- Copy the script into a file, e.g. claim_rewards.js
- Alternatively `git clone https://github.com/Jolly-Pirate/steem-claim-rewards`, then `cd steem-claim-rewards`
- Edit the CONFIG section.
- Under linux, secure the file's permissions: `chmod 600 claim_rewards.js`
- Install the steem package into your project folder: `npm install steem@latest --save`
- Run the script from the project's folder with: `node claim_rewards.js`
 
### NOTE
The script file will contain your private posting keys.
SECURE it, it's your responsibility.
