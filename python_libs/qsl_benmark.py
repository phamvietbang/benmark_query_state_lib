import time

from web3 import Web3
import json
from cream_lens_abi import CREAM_LENS_ABI
from query_state_lib.base.mappers.eth_call_balance_of_mapper import EthCallBalanceOf
from query_state_lib.client.client_querier import ClientQuerier
from query_state_lib.base.mappers.eth_call_mapper import EthCall
from query_state_lib.base.utils.encoder import encode_eth_call_data
from query_state_lib.base.mappers.eth_json_rpc_mapper import EthJsonRpc
from web3.middleware import geth_poa_middleware

CREAM_ADDRESS = Web3.toChecksumAddress('0x1a014ffe0cd187a298a7e79ba5ab05538686ea4a')
tokens = ['0x4cB7F1f4aD7a6b53802589Af3B90612C1674Fec4']


class QSLBenmark:
    def __init__(self, provider_uri, contract_address, wallet, number_query, block_number="latest",
                 batch_size=100, max_workers=4):
        self.provider_uri = provider_uri
        self.contract_address = Web3.toChecksumAddress(contract_address)
        self.wallet = Web3.toChecksumAddress(wallet)
        self.number_query = number_query
        self.client_querier = ClientQuerier(provider_url=provider_uri)
        self.w3 = Web3(Web3.HTTPProvider(provider_uri))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        self.block_number = block_number
        self.batch_size = batch_size
        self.max_workers = max_workers

    def get_balance(self):
        call_infos = []
        start = time.time()
        for i in range(self.number_query):
            call1 = EthCallBalanceOf(
                self.contract_address, self.wallet, self.block_number, id=f"{self.wallet}_{i}")
            call_infos.append(call1)

        list_json_rpc = call_infos
        data_result = self.client_querier.sent_batch_to_provider(
            list_json_rpc, batch_size=self.batch_size, max_workers=self.max_workers)

        self.calculate_query(f"get_balance_{self.number_query}.txt", data_result, start)

    def get_block_number(self):
        start = time.time()
        call_infos = []
        for i in range(self.number_query):
            call1 = EthJsonRpc(method="eth_getBlockByNumber", params=[hex(25417932 + i), False], id=i)
            call_infos.append(call1)

        list_json_rpc = call_infos
        data_result = self.client_querier.sent_batch_to_provider(
            list_json_rpc, batch_size=self.batch_size, max_workers=self.max_workers)

        self.calculate_query(f"get_block_{self.number_query}.txt", data_result, start)

    def get_ctoken_metadata(self):
        start = time.time()
        call_infos = []
        data = encode_eth_call_data(abi=CREAM_LENS_ABI, fn_name="cTokenMetadataAll", args=[tokens])
        for i in range(self.number_query):
            call1 = EthCall(to=CREAM_ADDRESS, data=data, block_number=self.block_number, abi=CREAM_LENS_ABI,
                            fn_name="cTokenMetadataAll", id=i)
            call_infos.append(call1)

        list_json_rpc = call_infos
        data_result = self.client_querier.sent_batch_to_provider(
            list_json_rpc, batch_size=self.batch_size, max_workers=self.max_workers)
        self.calculate_query(f"get_ctoken_metadata_{self.number_query}.txt", data_result, start)

    def calculate_query(self, file_name, data_result, start):
        num_err = 0
        for key, data in data_result.items():
            result = data.decode_result()
            if data.error:
                num_err += 1
                print(f"{key} - err")

        print(f"err ratio {num_err / self.number_query * 100}")
        end = time.time()
        print(f"finish after {end - start}s")

    def run(self):
        print("Start run get balance")
        self.get_balance()
        print("Start run get block number")
        self.get_block_number()
        print("Start run get ctoken metadata")
        self.get_ctoken_metadata()


if __name__ == "__main__":
    job = QSLBenmark(
        provider_uri="https://rpc.ankr.com/bsc",
        contract_address="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        wallet="0x58f876857a02d6762e0101bb5c46a8c1ed44dc16",
        number_query=1000
    )
    job.run()
