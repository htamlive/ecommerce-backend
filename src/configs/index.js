
function getConfig(network) {
    switch (network) {
        case "development":
        case "testnet":
            return {
                networkId: "testnet",
                nodeUrl: "https://rpc.testnet.near.org",
                walletUrl: "https://wallet.testnet.near.org",
                helperUrl: "https://helper.testnet.near.org",
                explorerUrl: "https://explorer.testnet.near.org",
                paymentContract: "uit-payment-contract.htamlive.testnet",
                account: {
                    accountId: "htamlive.testnet",
                    
                    privateKey: "ed25519:wtekTNZAG8FWmy38BcPwCUbX7XNzB4bDD9RPkpkxBqrZcHs1qQqFRxFLoymCSGLXJRdQLWMrSz7HV4S3DzrZ8nP"
                }
            }
        case "production":
        case "mainet":
            return {
                networkId: "mainet",
                nodeUrl: "https://rpc.testnet.near.org",
                walletUrl: "https://wallet.testnet.near.org",
                helperUrl: "https://helper.testnet.near.org",
                explorerUrl: "https://explorer.testnet.near.org",
                account: {
                    accountId: "htamlive.near",
                    
                    privateKey: "ed25519:wtekTNZAG8FWmy38BcPwCUbX7XNzB4bDD9RPkpkxBqrZcHs1qQqFRxFLoymCSGLXJRdQLWMrSz7HV4S3DzrZ8nP"
                }
            }
        default:
            throw Error("Can not get network config")
            break;
    }
}
export default {
    mongodb: {
        url: "mongodb+srv://vunguyen:1Qaz2Wsx3Edc@pikavu.syfpkbq.mongodb.net/ecommerce",
        options: {}
    },
    getConfig
}