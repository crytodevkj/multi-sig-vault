import * as anchor from '@project-serum/anchor';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { Commitment, ConnectionConfig } from '@solana/web3.js';

import KEY from '../devnet.json';
import { IDL } from '../target/types/vault';
const { PublicKey, Keypair, Connection, SystemProgram } = anchor.web3;

const DEV_CLUSTER_API = 'https://api.devnet.solana.com';
// const MAIN_CLUSTER_API = 'https://mainnet-beta.solana.com';
const PROGRAM_ID = '4NVPu24pBtjmGg5hmhUoQm6DUqkoeQ5J4DGJiK6xFNkU';
// const REWARD_TOKEN = 'GnBw4qZs3maF2d5ziQmGzquQFnGV33NUcEujTQ3CbzP3';
const ADMIN_WALLETS = [
  '7EGWwj35r6sd4ERZMU2CGoTFL1ZuoUNup8DhxFyr6UPf',
  '3rgWEviKxXxEjbLnSQCreVNRhgx2QgHtVnVbh8ZjPgix',
  'EvKcFuJ63k2AVdg6fjee36JtPsq7RzQpvgb2wyX3gjrh',
  '5wQ4XdFbzFbRppW8if8iJwaK1qUkjhpxmTq7WJrWMYjh'
]

let key = KEY;
const seed = Uint8Array.from(key.slice(0, 32));
const UPDATE_AUTHORITY = Keypair.fromSeed(seed);

(async () => {

  const connection = new Connection(DEV_CLUSTER_API, {
    skipPreflight: true,
    preflightCommitment: 'confirmed' as Commitment,
  } as ConnectionConfig);
  const systemProgram = SystemProgram.programId;

  const provider = new anchor.Provider(connection, new NodeWallet(UPDATE_AUTHORITY), {
    skipPreflight: true,
    preflightCommitment: 'confirmed' as Commitment,
  } as ConnectionConfig);
  const program = new anchor.Program(IDL, new PublicKey(PROGRAM_ID), provider);
  let [vaultPDA, _nonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('vault')],
    program.programId
  );
  console.log('vault pda:', vaultPDA.toString());
  console.log('user:', provider.wallet.publicKey.toString());
  let result
  try {
    result = await program.rpc.initVault(
      _nonce, {
      accounts: {
        vault: vaultPDA,
        user: provider.wallet.publicKey, //Admin wallet
        systemProgram: systemProgram
      }
    });
  } catch (err) {
    console.log('Error initing vault:', err)
  }
  let [proposalsPDA, _nonce1] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('proposals')],
    program.programId
  );
  console.log('proposals pda:', proposalsPDA.toString());
  try {
    result = await program.rpc.initProposals(
      _nonce1, {
      accounts: {
        proposals: proposalsPDA,
        user: provider.wallet.publicKey,
        systemProgram: systemProgram
      }
    }
    )
  } catch (err) {
    console.log('Error initing proposals:', err)
  }
})()