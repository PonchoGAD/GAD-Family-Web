import type {
  Abi,
  ContractFunctionName,
  ReadContractParameters,
} from 'viem';
import { publicClient } from './bscClient';

/**
 * Универсальный helper для безопасного чтения данных из контракта
 * (без any и без конфликтов generic-типов Viem).
 */
export async function readC<
  TOut = unknown,
  TAbi extends Abi = Abi,
  TName extends ContractFunctionName<TAbi, 'view' | 'pure'> = ContractFunctionName<
    TAbi,
    'view' | 'pure'
  >
>(params: ReadContractParameters<TAbi, TName>): Promise<TOut> {
  try {
    // сузим тип клиента локально, чтобы не тащить Viem-дженерики наружу
    const client = publicClient as unknown as {
      readContract: (p: unknown) => Promise<unknown>;
    };
    const res = await client.readContract(params as unknown);
    return res as TOut;
  } catch (e) {
    console.warn('readC error:', e);
    throw e;
  }
}
