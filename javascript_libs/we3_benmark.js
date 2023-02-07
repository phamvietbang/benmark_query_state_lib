const Web3 = require("web3")

var fs = require('fs');

var cream_lens_abi = JSON.parse(fs.readFileSync("cream_lens_abi.json"));
var bep20_abi = JSON.parse(fs.readFileSync("bep20.json"));
const CREAM_ADDRESS = "0x1A014Ffe0cd187A298a7E79BA5ab05538686ea4a"
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
        this.w3 = new Web3(new Web3.providers.HttpProvider(provider_uri))
        this.contract = new this.w3.eth.Contract(bep20_abi, contract_address)
        this.cream_lens = new this.w3.eth.Contract(cream_lens_abi, CREAM_ADDRESS)
        this.err = 0
    }
    get_balance(){
        return new Promise((resolve, reject)=>{
            var cnt = 0
            var request_err = 0
            var times = this.number_query/this.batch_size
            for (let i=0; i<times; i++){
                var batch_request = new this.w3.BatchRequest()
                for (let j=0; j<this.batch_size; j++){
                    batch_request.add(this.contract.methods.balanceOf(this.wallet).call.request({}, this.block_number, (err, data)=>{
                        cnt++;
                        if (err!=null){
                            console.log(this.batch_size*i+j+" - err")
                        }
                        if (cnt==this.number_query){
                            resolve({request_err})
                        }
                    }))
                }
                
                batch_request.execute()
            }
        })
    }
    get_block_number(){
        return new Promise((resolve, reject) => {
            var request_err = 0
            var cnt = 0;
            var times = this.number_query/this.batch_size
            for (let i=0; i<times; i++){
                var batch_request = new this.w3.BatchRequest()
                for (let j=0; j<this.batch_size; j++){
                    batch_request.add(this.w3.eth.getBlock.request(25417932 + this.batch_size*i+j, (err,data)=> {
                        cnt++;
                        if (err!=null){
                            console.log(this.batch_size*i+j+" - err")
                        }
                        if (cnt==this.number_query){
                            resolve({request_err})
                        }
                    }))
                }
                batch_request.execute()
            }
        })
    }
    get_ctoken_metadata(){
        return new Promise((resolve, reject)=>{
            var cnt = 0
            var request_err = 0
            var times = this.number_query/this.batch_size
            for (let i=0; i<times; i++){
                var batch_request = new this.w3.BatchRequest()
                for (let j=0; j<this.batch_size; j++){
                    batch_request.add(this.cream_lens.methods.cTokenMetadataAll(tokens).call.request(this.block_number,(err,data)=> {
                        cnt++;
                        if (err!=null){
                            request_err+=1
                            console.log(this.batch_size*i+j+" - err")
                        }
                        if (cnt==this.number_query){
                            resolve({request_err})
                        }
                    }))
                }
                batch_request.execute()
            }
        })
    }
    async run(){
        console.log("Start crawl balance!")
        var start_time = Date.now();
        await this.get_balance().then(({ request_err }) => {
            console.log(request_err);
            console.log(Date.now() - start_time);
            start_time = Date.now();
        })
        console.log("Start crawl block!")
        await this.get_block_number().then(({ request_err }) => {
            console.log(request_err);
            console.log(Date.now() - start_time);
            start_time = Date.now();
        })
        console.log("Start crawl ctoken!")
        await this.get_ctoken_metadata().then(({ request_err }) => {
            console.log(request_err);
            console.log(Date.now() - start_time);
        })
    }
}

const job = new W3Benmark(
    provider_uri="https://rpc.ankr.com/bsc",
    contract_address="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    wallet="0x58f876857a02d6762e0101bb5c46a8c1ed44dc16",
    number_query=1000,
    block_number="latest", 
    batch_size=100,
    max_workers=4
)
job.run()
// var start_time = Date.now();
// job.get_balance().then(({ request_err }) => {
//     console.log(request_err);
//     console.log(Date.now() - start_time);
//     start_time = Date.now();
// })
// job.get_block_number().then(({ request_err }) => {
//     console.log(request_err);
//     console.log(Date.now() - start_time);
//     start_time = Date.now();
// })
// job.get_ctoken_metadata().then(({ request_err }) => {
//     console.log(request_err);
//     console.log(Date.now() - start_time);
// })