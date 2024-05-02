import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createSlug } from "../utils/generate-slug";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";

export async function createEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/events', {
      schema: {
        summary: 'Create an event',
        tags: ['events'],
        body:  z.object({
          title: z.string().min(4),
          details: z.string().nullable(),
          maximumAttendees: z.number().int().positive().nullable(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          })
        }
      },
    }, async (req, res) => {

    const { title, details, maximumAttendees } = req.body

    const slug = createSlug(title)
    const eventWithSameSlug = await prisma.event.findUnique({
      where: {
        slug
      }
    })

    if (eventWithSameSlug !== null) {
      throw new Error("Another event with the same title");
      // return res.status(204).send()
    }
    
    const event = await prisma.event.create({
      data: {
        title,
        details,
        maximumAttendees,
        slug,
      }
    })
    return res.status(201).send({ eventId: event.id })
  })
}