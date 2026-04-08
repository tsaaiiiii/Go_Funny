import { defineConfig } from 'orval'

export default defineConfig({
  tripAccount: {
    input: {
      target: './docs/openapi.draft.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/generated/model',
      client: 'react-query',
      clean: true,
      prettier: true,
      baseUrl: '',
      override: {
        mutator: {
          path: './src/api/custom-fetch.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useSuspenseQuery: false,
          useInfinite: false,
        },
      },
    },
  },
})
