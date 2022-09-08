import config from "./configs";
import {utils, keyStores, connect, transactions, providers} from "near-api-js"

async function getAccountConnected(params){
    let network = "testnet";
    let networkConfig = config.getConfig(network);


    // create key pair and key store
    const keyPair = utils.KeyPair.fromString(networkConfig.account.privateKey);

    const keyStore = new keyStores.InMemoryKeyStore();

    keyStore.setKey(network, networkConfig.account.accountId, keyPair);

    //connect account -> use async
    const near = await connect({
        keyStore,
        headers:{},
        ...networkConfig
    });

    //use await
    return await near.account(networkConfig.account.accountId);
}

export async function view(recipient, method, params){
    let account = await getAccountConnected();
    return await account.viewFunction(
        recipient,
        method,
        params
    );

}

async function call(recipient, method, params, attached_deposit, attached_gas){
    //account id
    let account = await getAccountConnected();
    return await account.functionCall({
        contractId: recipient,
        methodName: method,
        args: params,
        attachedDeposit: attached_deposit,
        attachedGas: attached_gas
    });
}

async function getSignUrl(account_id, method, params, deposit, gas, receiver_id, meta, callback_url, network){
    if(!network) network = "testnet";
        console.log("Params: ", params);
        const deposit_value = typeof deposit == 'string' ? deposit : utils.format.parseNearAmount('' + deposit);
        const actions = [method === '!transfer' ? transactions.transfer(deposit_value) : transactions.functionCall(method, Buffer.from(JSON.stringify(params)), gas, deposit_value)];
        const keypair = utils.KeyPair.fromRandom('ed25519');
        const provider = new providers.JsonRpcProvider({url: 'https://rpc.' + network + '.near.org'});
        const block = await provider.block({finality: 'final'});
        const txs = [transactions.createTransaction(account_id, keypair.publicKey, receiver_id, 1, actions, utils.serialize.base_decode(block.header.hash))];
        const newUrl = new URL('sign', 'https://wallet.' + network + '.near.org/');
        newUrl.searchParams.set('transactions', txs.map(transaction =>utils.serialize.serialize(transactions.SCHEMA, transaction)).map(serialized => Buffer.from(serialized).toString('base64')).join(','));
        newUrl.searchParams.set('callbackUrl', callback_url);
        if (meta)
            newUrl.searchParams.set('meta', meta);
        return newUrl.href;

}

function parseNearAmount(amount){
    return utils.format.parseNearAmount('' + amount);
}   

export default {
    getSignUrl,
    view,
    call,
    parseNearAmount
};