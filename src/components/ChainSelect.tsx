import { CHAINS } from '../utils/chains';

const ChainSelect = ({
  chainId,
  switchChain,
  chainIds,
}: {
  chainId: number;
  switchChain: (chainId: number) => void | undefined;
  chainIds: number[];
}) => {
  return (
    <select
      value={chainId}
      onChange={(event) => {
        switchChain?.(Number(event.target.value));
      }}
      disabled={switchChain === undefined}
    >
      {chainIds.map((chainId) => (
        <option key={chainId} value={chainId}>
          {CHAINS[chainId]?.name ?? chainId}
        </option>
      ))}
    </select>
  );
}

export default ChainSelect;
