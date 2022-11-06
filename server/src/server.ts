import Fastify from 'fastify';
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import ShortUniqueId from 'short-unique-id';

const prisma = new PrismaClient({
    log: ['query'],

})
async function start() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: true,
  })

  fastify.get('/pools/count', async () => {
    return {
      count: await prisma.pool.count()
    }
  })

  fastify.get("/users/count", async () => {
    const count = await prisma.user.count();

    return { count };
  });

  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count();

    return { count };
  });

  fastify.post("/pools", async (request, reply) => {
    const requestBodyPool = z.object({
      title: z.string()
    })

    const { title } = requestBodyPool.parse(request.body)

    const generateId = new ShortUniqueId({length: 6})
    const code = String(generateId().toUpperCase())

    await prisma.pool.create({
      data: {
        title,
        code,
      }
    })


    return reply.status(201).send({ 
      status: "Pool created",
      code });
  });


  await fastify.listen({ port: 3333,/* host: '0.0.0.0' */ });


}

start()
  .then(() => console.log('🚀 Server started'))
  .catch(console.error);