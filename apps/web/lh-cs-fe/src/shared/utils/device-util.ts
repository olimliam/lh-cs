// styles/media.ts
const sizes = {
  '4k': `${1921}px`,
  desktop: `${1280}px`,
  laptop: `${1279}px`,
  tablet: `${1024}px`,
  fold: `${767}px`,
  mobileLg: `${673}px`,
  mobile: `${427}px`,
  mobileSm: `${359}px`,
};

export const media = {
  uhd: (styles: TemplateStringsArray) => `
    @media (min-width: ${sizes['4k']}) {
      ${styles}
    }
  `,
  desktop: (styles: TemplateStringsArray) => `
    @media (min-width: ${sizes.desktop}) {
      ${styles}
    }
  `,
  laptop: (styles: TemplateStringsArray) => `
    @media (min-width: ${sizes.laptop}) {
      ${styles}
    }
  `,
  tablet: (styles: TemplateStringsArray) => `
    @media (max-width: ${sizes.tablet}) {
      ${styles}
    }
  `,
  fold: (styles: TemplateStringsArray) => `
    @media (max-width: ${sizes.fold}) {
      ${styles}
    }
  `,
  mobileLg: (styles: TemplateStringsArray) => `
    @media (max-width: ${sizes.mobileLg}) {
      ${styles}
    }
  `,
  mobile: (styles: TemplateStringsArray) => `
    @media (max-width: ${sizes.mobile}) {
      ${styles}
    }
  `,
};
