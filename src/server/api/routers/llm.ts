import { z } from "zod";

import {
  createTRPCRouter,
  // protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const llmRouter = createTRPCRouter({
  prompt: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});
