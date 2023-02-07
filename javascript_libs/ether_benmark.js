const ethers  = require("ethers");
var fs = require('fs');
var cream_lens_abi = JSON.parse(fs.readFileSync("cream_lens_abi.json"));

var bep20_abi = JSON.parse(fs.readFileSync("bep20.json"));
// const b20 = new Interface(bep20_abi);

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
        // this.ether_json_rpc = new ethers.providers.JsonRpcBatchProvider(provider_uri);
        this.provider = new ethers.providers.StaticJsonRpcProvider(provider_uri);
        this.contract = new ethers.Contract(contract_address, bep20_abi, this.provider);
        this.cream_lens = new ethers.Contract(CREAM_ADDRESS, cream_lens_abi, this.provider);
    }
    async get_block_number(){
        var start = Date.now()
        var err = 0
        for (let i=0; i<this.number_query; i++){
            try{
                let results = await this.provider.getBlock(25417932 + i);
            }catch(e){
                err+=1
                console.log(err)
            }
        }
        console.log("err ratio", err/this.number_query)
        console.log("time query", Date.now() - start) 
    }
    async get_balance(){
        var start = Date.now()
        var err = 0
        for (let i=0; i<this.number_query; i++){
            try{
                let balance = await this.contract.balanceOf(this.wallet);
            }catch(e){
                err+=1
                console.log(e)
                console.log("err - ", e)
            }
        }
        console.log("err ratio", err/this.number_query)
        console.log("time query", Date.now() - start)    
        }
    async get_ctoken_metadata(){
        var start = Date.now()
        var err = 0
        for (let i=0; i<this.number_query; i++){
            try{
                let result = await this.cream_lens.callStatic.cTokenMetadataAll(tokens)
            }catch(e){
                err+=1
                console.log("err - ", e)
            } 
            }
        console.log("err ratio", err/this.number_query)
        console.log("time query", Date.now() - start)
        }
    async run(){
        console.log("Start crawl balance!")
        await job.get_balance()
        console.log("Start crawl block!")
        await job.get_block_number()
        console.log("Start crawl ctoken!")
        await job.get_ctoken_metadata()
    }
        
    }
    
const job = new EtherBenmark(
    provider_uri="https://rpc.ankr.com/bsc",
    contract_address="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    wallet="0x58f876857a02d6762e0101bb5c46a8c1ed44dc16",
    number_query=1000,
    block_number="latest", 
    batch_size=100,
    max_workers=4
)
job.run()

