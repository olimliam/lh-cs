import styled from '@emotion/styled';

import { MarkerOptionShop } from '../../types/tour';

const Root = styled.div`
  width: 100%;
  height: 100%;
  padding: 40px;
  overflow: auto;
  border-radius: 8px;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

function ShopContent(props: { option: MarkerOptionShop }) {
  const qs = new URLSearchParams();
  qs.append('domain', props.option.shopifyDomain);
  qs.append('token', props.option.shopifyToken);
  qs.append('type', props.option.shopifyItemType);
  qs.append('id', props.option.shopifyItemID);

  return (
    <Root>
      <iframe
        style={{ width: '100%', height: '100%' }}
        src={`${window.location.origin}/shopify/shop?${qs.toString()}`}
      />
    </Root>
  );
}

export default ShopContent;
