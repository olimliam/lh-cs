import '../style/quill-content.css';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  HTMLReactParserOptions,
  Element,
  domToReact,
  DOMNode,
} from 'html-react-parser';
// ✅ default import를 안전하게 처리
import * as htmlParserModule from 'html-react-parser';
import DOMPurify from 'dompurify';

interface ContentRendererProps {
  htmlString: string;
  className?: string;
}

/**
 * ✅ 안전하게 HTML 문자열을 렌더링하는 컴포넌트
 * - DOMPurify로 XSS 방어 (인라인 스타일 허용)
 * - html-react-parser로 React 엘리먼트 변환
 * - 이미지 lazy loading, 링크 보안 처리
 *
 * @example
 * ```tsx
 * <ContentRenderer htmlString="<p style='color: red;'>안녕하세요</p>" />
 * ```
 */
export const ContentRenderer: React.FC<ContentRendererProps> = ({
  htmlString,
  className,
}) => {
  const hookRegistered = useRef(false);

  // ✅ parser 함수를 안전하게 추출
  const parse = React.useMemo(() => {
    return (htmlParserModule as any).default || htmlParserModule;
  }, []);

  // ✅ DOMPurify Hook 등록 (컴포넌트 생애주기 동안 한 번만)
  useEffect(() => {
    if (hookRegistered.current) return;

    // afterSanitizeAttributes: 속성 정화 후 검증
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      // 이미지 src 검증 (http(s), data:, / 만 허용)
      if (node.hasAttribute && node.hasAttribute('src')) {
        const src = node.getAttribute('src') ?? '';
        const isValidSrc =
          /^https?:\/\//i.test(src) ||
          /^data:image\//i.test(src) ||
          /^\//.test(src); // 상대 경로

        if (!isValidSrc) {
          console.warn('⚠️ Invalid image src removed:', src);
          node.removeAttribute('src');
        }

        // alt 속성 없으면 기본값 추가 (접근성)
        if (!node.getAttribute('alt')) {
          node.setAttribute('alt', 'image');
        }
      }

      // 링크 href 검증 (http(s), mailto:, / 만 허용)
      if (node.hasAttribute && node.hasAttribute('href')) {
        const href = node.getAttribute('href') ?? '';
        const isValidHref =
          /^https?:\/\//i.test(href) ||
          /^mailto:/i.test(href) ||
          /^\//.test(href);

        if (!isValidHref) {
          console.warn('⚠️ Invalid link href removed:', href);
          node.removeAttribute('href');
        }
      }

      // ✅ style 속성 검증 (위험한 CSS 제거)
      if (node.hasAttribute && node.hasAttribute('style')) {
        const style = node.getAttribute('style') ?? '';

        // ❌ 위험한 CSS 속성 제거 (XSS 방어)
        const dangerousPatterns = [
          /javascript:/i,
          /expression\s*\(/i,
          /behavior\s*:/i,
          /-moz-binding\s*:/i,
          /import\s+/i,
        ];

        const isDangerous = dangerousPatterns.some((pattern) =>
          pattern.test(style)
        );

        if (isDangerous) {
          console.warn('⚠️ Dangerous inline style removed:', style);
          node.removeAttribute('style');
        }
      }
    });

    hookRegistered.current = true;

    // ✅ Cleanup: 컴포넌트 언마운트 시 Hook 제거
    return () => {
      DOMPurify.removeHook('afterSanitizeAttributes');
      hookRegistered.current = false;
    };
  }, []);

  // ✅ DOMPurify 설정을 useMemo로 안정화 (인라인 스타일 허용)
  const purifyConfig = useMemo(
    () => ({
      ALLOWED_TAGS: [
        // 기본 텍스트
        'p',
        'br',
        'strong',
        'em',
        'u',
        'b',
        'i',
        's', // ✅ 취소선
        'del', // ✅ 삭제
        'ins', // ✅ 삽입
        'mark', // ✅ 하이라이트
        'sub', // ✅ 아래 첨자
        'sup', // ✅ 위 첨자
        // 제목
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        // 목록
        'ul',
        'ol',
        'li',
        // 링크 및 미디어
        'a',
        'img',
        'video',
        'audio',
        'iframe', // ⚠️ 필요 시 추가 (YouTube 등)
        // 인용 및 코드
        'blockquote',
        'code',
        'pre',
        // 테이블
        'table',
        'thead',
        'tbody',
        'tfoot',
        'tr',
        'th',
        'td',
        'caption',
        // 컨테이너
        'div',
        'span',
        'section',
        'article',
      ],
      ALLOWED_ATTR: [
        'href',
        'src',
        'alt',
        'title',
        'class',
        'id',
        'width',
        'height',
        'target',
        'rel',
        'style', // ✅ 인라인 스타일 허용
        'data-*', // ✅ data 속성 허용 (Quill 커스텀 속성)
      ],
      // ✅ 안전한 CSS 속성만 허용
      ALLOWED_CSS_PROPERTIES: [
        // 색상
        'color',
        'background-color',
        // 폰트
        'font-family',
        'font-size',
        'font-weight',
        'font-style',
        'line-height',
        'letter-spacing',
        // 텍스트
        'text-align',
        'text-decoration',
        'text-transform',
        'text-indent',
        // 간격
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        // 크기
        'width',
        'height',
        'max-width',
        'max-height',
        'min-width',
        'min-height',
        // 기타
        'border',
        'border-radius',
        'display',
        'list-style-type',
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|ftp|tel|data):)/i,
      // ✅ ADD_ATTR: DOMPurify가 자동으로 제거하는 속성 강제 허용
      ADD_ATTR: ['target', 'rel'],
    }),
    []
  );

  // ✅ HTML 정화를 useMemo로 최적화
  const sanitized = useMemo(() => {
    const cleaned = DOMPurify.sanitize(htmlString, purifyConfig);

    // ✅ 디버깅 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('====== DOMPurify 결과 ======');
      console.log('원본:', htmlString);
      console.log('정화 후:', cleaned);
      console.log('===========================');
    }

    return cleaned;
  }, [htmlString, purifyConfig]);

  // ✅ parserOptions를 별도 useMemo로 안정화
  const parserOptions = useMemo((): HTMLReactParserOptions => {
    const options: HTMLReactParserOptions = {
      replace: (domNode) => {
        if (!(domNode instanceof Element)) return;

        // ✅ 이미지 태그 커스터마이징
        if (domNode.name === 'img') {
          const src = domNode.attribs?.src;
          const alt = domNode.attribs?.alt ?? 'image';
          const styleStr = domNode.attribs?.style || '';
          const parsedStyle = parseInlineStyle(styleStr);

          if (!src) {
            console.warn('⚠️ Image without src attribute');
            return <></>;
          }

          return (
            <img
              src={src}
              alt={alt}
              loading='lazy'
              referrerPolicy='no-referrer'
              style={parsedStyle}
            />
          );
        }

        // ✅ 링크 태그 보안 강화
        if (domNode.name === 'a') {
          const href = domNode.attribs?.href;
          const isExternal = href && /^https?:\/\//i.test(href);

          return (
            <a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              style={{ color: '#0066cc', textDecoration: 'underline' }}
            >
              {domToReact(domNode.children as DOMNode[], options)}
            </a>
          );
        }

        // ✅ Heading 태그 커스텀 스타일링
        if (domNode.name === 'h1') {
          return (
            <h1 className='mb-4 text-2xl font-bold'>
              {domToReact(domNode.children as DOMNode[], options)}
            </h1>
          );
        }

        if (domNode.name === 'h2') {
          return (
            <h2 className='mb-3 text-xl font-semibold'>
              {domToReact(domNode.children as DOMNode[], options)}
            </h2>
          );
        }

        if (domNode.name === 'h3') {
          return (
            <h3 className='mb-2 text-lg font-semibold'>
              {domToReact(domNode.children as DOMNode[], options)}
            </h3>
          );
        }

        // ✅ 취소선 태그 (<s>, <del>, <strike>)
        if (domNode.name === 's' || domNode.name === 'del') {
          return (
            <s style={{ textDecoration: 'line-through' }}>
              {domToReact(domNode.children as DOMNode[], options)}
            </s>
          );
        }

        // ✅ Quill 폰트 클래스 처리
        if (domNode.name === 'span' && domNode.attribs?.class) {
          const className = domNode.attribs.class;

          // Quill 폰트 클래스 매핑
          const fontMap: Record<string, string> = {
            'ql-font-monospace': 'Courier New, monospace',
            'ql-font-serif': 'Georgia, serif',
            'ql-font-sans-serif': 'Pretendard, sans-serif',
          };

          const fontFamily = Object.keys(fontMap).find((key) =>
            className.includes(key)
          );

          if (fontFamily) {
            const style = domNode.attribs?.style || '';
            return (
              <span
                className={className}
                style={{
                  fontFamily: fontMap[fontFamily],
                  ...parseInlineStyle(style),
                }}
              >
                {domToReact(domNode.children as DOMNode[], options)}
              </span>
            );
          }
        }

        return undefined;
      },
    };

    return options;
  }, []);

  // ✅ 파싱 (타입 안전성 확보)
  const reactNodes = React.useMemo(() => {
    try {
      if (typeof parse !== 'function') {
        console.error('❌ html-react-parser not loaded correctly');
        return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
      }
      return parse(sanitized, parserOptions);
    } catch (error) {
      console.error('❌ HTML parsing failed:', error);
      return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
    }
  }, [sanitized, parserOptions, parse]);

  return (
    <div className={`quill-content ${className}`} aria-live='polite'>
      {reactNodes}
    </div>
  );
};

/**
 * ✅ 인라인 스타일 문자열을 React CSSProperties 객체로 변환
 * @param styleString - "color: red; font-size: 14px;"
 * @returns React.CSSProperties 객체
 */
function parseInlineStyle(styleString: string): React.CSSProperties {
  const style: React.CSSProperties = {};

  styleString.split(';').forEach((rule) => {
    const [key, value] = rule.split(':').map((s) => s.trim());
    if (key && value) {
      // kebab-case를 camelCase로 변환 (예: font-size → fontSize)
      const camelKey = key.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      (style as any)[camelKey] = value;
    }
  });

  return style;
}
