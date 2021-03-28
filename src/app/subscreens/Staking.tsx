import { StakingCard } from "components";
import Subscreen from "./Subscreen";
import type { FormattedStakingData } from "features";

export default function Staking({
  title,
  data,
}: {
  title: string;
  data: FormattedStakingData[];
}) {
  return (
    <Subscreen title={title}>
      <div style={{ padding: 30 }}>
        {data.map((datum) => (
          <StakingCard key={datum.id} {...datum} />
        ))}
      </div>
    </Subscreen>
  );
}
