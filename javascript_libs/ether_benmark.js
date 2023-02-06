import { ethers } from "ethers";

var cream_lens_abi = JSON.parse(fs.readFileSync("cream_lens_abi.json"));
var bep20_abi = JSON.parse(fs.readFileSync("bep20_abi.json"));
const CREAM_ADDRESS = '0x1A014Ffe0cd187A298a7E79BA5ab05538686ea4a'
const tokens = ['0x4cB7F1f4aD7a6b53802589Af3B90612C1674Fec4']
class EtherBenmark{
    constructor(provider_uri, contract_address, wallet, number_query, block_number, batch_size, max_workers){
        this.provider_uri=provider_uri;
        this.contract_address=contract_address;
        this.wallet=wallet;
        this.number_query=number_query;
        this.block_number=block_number;
        this.batch_size=batch_size;
        this.max_workers=max_workers;
        this.ether_json_rpc = new ethers.provider.JsonRpcBatchProvider(provider_uri);
        this.provider = new ethers.getDefaultProvider(provider_uri);
        this.contract = new ethers.Contract(contract_address, bep20_abi, this.provider);
        this.cream_lens = new ethers.Contract(CREAM_ADDRESS, cream_lens_abi, this.provider);
    }
    async get_block_number(){
        var times = this.number_query/this.batch_size;
        for (let i=0; i<times; i++){
            var batch_request = [];
            for (let i=0; i<this.batch_size; i++){
                promises.push(this.ether_json_rpc.getBlockNumber(11026478 + i));
            }
            let results = await Promise.all(promises);
        }
        
    }
    async get_balance(){
        for (let i=0; i<this.number_query; i++){
            let balance = await this.contract.balanceOf(this.wallet);
        }
            
        }
    async get_ctoken_metadata(){
        for (let i=0; i<this.number_query; i++){
            let result = await this.cream_lens.cTokenMetadataAll(tokens)
            }
        }
    }
    
