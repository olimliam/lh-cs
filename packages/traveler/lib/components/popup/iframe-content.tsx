import { MarkerOptionIframe } from '../../types/tour';

import styled from '@emotion/styled';

enum IframeContentStatus {
  url = 'url',
  html = 'html',
}

const Wrapper = styled.div`
  iframe {
    border: none;
  }
`;

const IframeContent = (props: { option: MarkerOptionIframe }) => {
  return (
    <Wrapper className='h-full w-full bg-white'>
      <div className='h-full w-full'>
        {props.option.type === IframeContentStatus.url && props.option.url && (
          <iframe
            className='h-full w-full'
            src={props.option.url}
            allowFullScreen
            allow={'camera microphone'}
          />
        )}
        {props.option.type === IframeContentStatus.html &&
          props.option.htmlContent && (
            <div
              className='h-full w-full'
              dangerouslySetInnerHTML={{ __html: props.option.htmlContent }}
            />
          )}
      </div>
    </Wrapper>
  );
};

IframeContent.displayName = 'IframeContent';

export default IframeContent;
