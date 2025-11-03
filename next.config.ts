import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /*
   * Desactivamos React Compiler para evitar el error
   * "An unknown Component is an async Client Component" en componentes cliente.
   * Si se quiere volver a activar, hacerlo en modo de anotaciones:
   *   reactCompiler: { compilationMode: 'annotation' }
   * y anotar explícitamente los componentes a optimizar.
   */
  reactCompiler: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
