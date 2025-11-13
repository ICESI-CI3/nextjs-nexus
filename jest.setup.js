// Optional: configure or set up a testing framework before each test
// if you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock de next/image plano
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props) {
    const { src, alt, ...rest } = props;
    const resolved = typeof src === 'string' ? src : (src && src.src) || '';
    return React.createElement('img', { src: resolved, alt: alt || '', ...rest });
  },
}));

// Mock defensivo de next/navigation (por si algo lo usa)
jest.mock('next/navigation', () => {
  const push = jest.fn();
  const replace = jest.fn();
  const back = jest.fn();
  return {
    useRouter: () => ({ push, replace, back, prefetch: jest.fn() }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: jest.fn(),
  };
});
