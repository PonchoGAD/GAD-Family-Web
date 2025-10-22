import type {
  Abi,
  Address,
  ContractFunctionName,
  ReadContractParameters,
} from 'viem';
import { publicClient } from './bscClient';

// Универсальный «read» без any
export async function readC<
  TOut,
  TAbi extends Abi,
  TName extends ContractFunctionName<TAbi, 'view' | 'pure'>
>(params: ReadContractParameters<TAbi, TName>): Promise<TOut> {
  const client = publicClient as unknown as {
    readContract: (p: unknown) => Promise<unknown>;
  };
  const res = await client.readContract(params);
  return res as TOut;
}
