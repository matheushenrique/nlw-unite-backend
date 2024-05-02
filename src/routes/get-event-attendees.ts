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
          pageIndex: z.string().nullable().default('0').transform(Number),
        }),
        response: {
      
        }
      }
    }, async (req, res) => {
      const { eventId } = req.params
      const { pageIndex } = req.query

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
        where: {
          eventId,
        },
        take: numberOfRecordForPage,
        skip: pageIndex * numberOfRecordForPage
      })

      return res.send({
        attendees: attendees.map(el => {
          const { id, name, email, createdAt, checkIn} = el

          return {
            id, 
            name, 
            email, 
            createdAt, 
            checkInAt: checkIn?.createdAt
          }
        })
      })

    })
}
