import { MenuTypeConst } from '../../../types/controller-bar';
import ContentRoot from '../atom/ContentRoot';
import Minimap from './Minimap';

const Map = () => {
  return (
    <ContentRoot className='px-4 py-5' type={MenuTypeConst.MINIMAP}>
      <Minimap isPin width={240} />
    </ContentRoot>
  );
};

export default Map;
