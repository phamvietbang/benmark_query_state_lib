import Web3 from "web3";

var fs = require('fs');

var cream_lens_abi = JSON.parse(fs.readFileSync("cream_lens_abi.json"));
var bep20_abi = JSON.parse(fs.readFileSync("bep20_abi.json"));
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
    }
    get_balance(){
        var times = this.number_query/this.batch_size
        for (let i=0; i<times; i++){
            var batch_request = this.w3.BatchRequest()
            for (let i=0; i<this.batch_size; i++){
                batch_request.add(this.contract.methods.balanceOf(this.wallet).call.request({}, this.block_number))
            }
            batch_request.execute()
        }
        
    }
}

const Jsonrpc = require('web3-core-requestmanager/src/jsonrpc');

var { errors } = require('web3-core-helpers');

function executeAsync(batch) {

    return new Promise((resolve, reject) => {

        var requests = batch.requests;

        batch.requestManager.sendBatch(requests, (err, results) => {

            results = results || [];

            var response = requests.map((request, index) => {

                return results[index] || {};

            }).map((result, index) => {

                if (result && result.error) {
                    return errors.ErrorResponse(result);
                }

                if (!Jsonrpc.isValidResponse(result)) {
                    return errors.InvalidResponse(result);
                }

                return requests[index].format ? requests[index].format(result.result) : result.result;

            });

            resolve(response);

        });
    })

}