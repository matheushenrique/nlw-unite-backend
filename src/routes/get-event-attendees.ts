import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";


export async function getEventAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId/attendees', {
      schema: {
        params: z.object({
          eventId: z.string().uuid()
        }),
        querystring: z.object({
          pageIndex: z.string().nullish().default('0').transform(Number),
          query: z.string().nullish(),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                createdAt: z.date(),
                checkedInAt: z.date().nullable()
              })
            )
          })
        }
      }
    }, async (req, res) => {
      const { eventId } = req.params
      const { pageIndex, query } = req.query

      const numberOfRecordForPage = 10

      const attendees = await prisma.attendee.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          checkIn: {
            select: {
              createdAt: true,
            }
          }
        },
        where: query ? {
          eventId,
          name: {
            contains: query
          }
        }: {
          eventId,          
        },
        take: numberOfRecordForPage,
        skip: pageIndex * numberOfRecordForPage,
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.send({
        attendees: attendees.map(el => {
          const { id, name, email, createdAt, checkIn} = el

          return {
            id, 
            name, 
            email, 
            createdAt, 
            checkedInAt: checkIn?.createdAt ?? null
          }
        })
      })

    })
}
