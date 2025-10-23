import type {
  Abi,
  Address,
  ContractFunctionName,
  ReadContractParameters,
} from 'viem';
import { publicClient } from './bscClient';

/**
 * Универсальный helper для безопасного чтения данных из контракта
 * (без жёстких generic-конфликтов Viem).
 */
export async function readC<
  TOut = unknown,
  TAbi extends Abi = Abi,
  TName extends ContractFunctionName<TAbi, 'view' | 'pure'> = ContractFunctionName<
    TAbi,
    'view' | 'pure'
  >
>(params: ReadContractParameters<TAbi, TName> | any): Promise<TOut> {
  try {
    const client = publicClient as unknown as {
      readContract: (p: unknown) => Promise<unknown>;
    };
    const res = await client.readContract(params);
    return res as TOut;
  } catch (e) {
    console.warn('readC error:', e);
    throw e;
  }
}
