from qsl_benmark import QSLBenmark
from bep_20 import BEP20_ABI
from cream_lens_abi import CREAM_LENS_ABI
from web3 import Web3
import time
import json

CREAM_ADDRESS = Web3.toChecksumAddress('0x1a014ffe0cd187a298a7e79ba5ab05538686ea4a')
tokens = ['0x4cB7F1f4aD7a6b53802589Af3B90612C1674Fec4']


class W3Benmark(QSLBenmark):
    def __init__(self, provider_uri, contract_address, wallet, number_query, block_number="latest", batch_size=100,
                 max_workers=4):
        super().__init__(provider_uri, contract_address, wallet, number_query, block_number, batch_size, max_workers)
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=BEP20_ABI)

    def calculate_query(self, file_name, err_ratio, start):
        end = time.time()
        params = {
            "err_ratio": err_ratio,
            "time_query": end - start
        }
        print(f"finish after {end - start}s")
        with open(file_name, "w") as f:
            f.write(json.dumps(params))

    def get_balance(self):
        err = 0
        start = time.time()
        for i in range(self.number_query):
            try:
                balance = self.contract.functions.balanceOf(self.wallet).call(block_identifier=self.block_number)
                print(f"{i} - success")
            except Exception as e:
                print(f"{i} - err")
                print(e)
                err += 1
                pass
        print("save result balance crawl")
        self.calculate_query(f"w3_get_balance_{self.number_query}.txt", err / self.number_query, start)

    def get_block(self):
        err = 0
        start = time.time()
        block = 25417932
        for i in range(self.number_query):
            try:
                block_data = self.w3.eth.get_block(block_identifier=block + i)
                print(f"{i} - success")
            except Exception as e:
                print(f"{i} - err")
                print(e)
                err += 1
                pass
        print("save result block crawl")
        self.calculate_query(f"w3_get_block_{self.number_query}.txt", err / self.number_query, start)

    def get_ctoken_metadata(self):
        contract = self.w3.eth.contract(address=CREAM_ADDRESS, abi=CREAM_LENS_ABI)
        err = 0
        start = time.time()
        for i in range(self.number_query):
            try:
                data = contract.functions.cTokenMetadataAll(tokens).call()
                print(f"{i} - success")
            except Exception as e:
                print(f"{i} - err")
                err += 1
                pass
        print("save result ctoken crawl")       
        self.calculate_query(f"w3_get_ctoken_metadata_{self.number_query}.txt", err / self.number_query, start)


if __name__ == "__main__":
    job = W3Benmark(
        provider_uri="https://rpc.ankr.com/bsc",
        contract_address="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        wallet="0x58f876857a02d6762e0101bb5c46a8c1ed44dc16",
        number_query=1000
    )
    job.get_balance()
    job.get_block()
    job.get_ctoken_metadata()
