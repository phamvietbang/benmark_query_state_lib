import { callbackify } from "util";
import Web3 from "web3";

var fs = require('fs');

var cream_lens_abi = JSON.parse(fs.readFileSync("cream_lens_abi.json"));
var bep20_abi = JSON.parse(fs.readFileSync("bep20_abi.json"));
const CREAM_ADDRESS = Web3.toChecksumAddress('0x1a014ffe0cd187a298a7e79ba5ab05538686ea4a')
const tokens = ['0x4cB7F1f4aD7a6b53802589Af3B90612C1674Fec4']
class W3Benmark{
    constructor(provider_uri, contract_address, wallet, number_query, block_number, batch_size, max_workers){
        this.provider_uri=provider_uri;
        this.contract_address=contract_address;
        this.wallet=wallet;
        this.number_query=number_query;
        this.block_number=block_number;
        this.batch_size=batch_size;
        this.max_workers=max_workers;
        this.w3 = new Web3(provider_uri)
        this.contract = new this.w3.eth.Contract(bep20_abi, Web3.utils.checkAddressChecksum(contract_address))
        this.cream_lens = new this.w3.eth.Contract(cream_lens_abi, Web3.utils.checkAddressChecksum(CREAM_ADDRESS))
    }
    get_balance(){
        var times = this.number_query/this.batch_size
        for (let i=0; i<times; i++){
            var batch_request = this.w3.BatchRequest()
            for (let i=0; i<this.batch_size; i++){
                batch_request.add(this.contract.methods.balanceOf(this.wallet).call.request({}, this.block_number + i))
            }
            batch_request.execute()
        }
        
    }
    get_block_number(){
        var times = this.number_query/this.batch_size
        var err
        for (let i=0; i<times; i++){
            var batch_request = this.w3.BatchRequest()
            for (let i=0; i<this.batch_size; i++){
                batch_request.add(this.web3.eth.getBlock(11026478 + i))
            }
            batch_request.execute()
        }
    }
    get_ctoken_metadata(){
        var times = this.number_query/this.batch_size
        for (let i=0; i<times; i++){
            var batch_request = this.w3.BatchRequest()
            for (let i=0; i<this.batch_size; i++){
                batch_request.add(this.cream_lens.methods.cTokenMetadataAll(tokens).call.request({},'latest'))
            }
            batch_request.execute()
        }
    }
}