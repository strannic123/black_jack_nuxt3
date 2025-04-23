// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false, // Отключаем SSR для GitHub Pages
  modules: ['@pinia/nuxt'],
  app: {
    baseURL: '/black_jack_nuxt3/', // Имя вашего репозитория
    buildAssetsDir: 'assets', // Директория для ассетов
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls: {
          video: ['src', 'poster'],
          source: ['src'],
          img: ['src'],
          image: ['xlink:href', 'href'],
          use: ['xlink:href', 'href'],
        },
      },
    },
  },
})
