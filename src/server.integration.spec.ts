import { createTestClient } from 'apollo-server-testing';
import { createConnection, getConnection } from 'typeorm';
import Wilder from './models/Wilder';

import { getApolloServer } from './server';

describe('Apollo server', () => {
  let query, mutate;

  beforeEach(async () => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Wilder],
      synchronize: true,
      logging: false,
    });
    const testClient = createTestClient(await getApolloServer());
    query = testClient.query;
    mutate = testClient.mutate;
  });

  afterEach(() => {
    const conn = getConnection();
    return conn.close();
  });

  describe('mutation createWilder', () => {
    it('creates and returns a new wilder', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            createWilder(
              input: {
                firstName: "Prune"
                lastName: "Banane"
              }
            ) {
              firstName
              lastName
            }
          }
      `,
      });

      expect(await Wilder.count()).toEqual(1);
      expect(response.data).toMatchObject({
        createWilder: {
          firstName: 'Prune',
          lastName: 'Banane',
        },
      });
    });
  });

  describe('query wilders', () => {
    it('returns all wilders', async () => {
      const wilder1 = Wilder.create({
        firstName: 'Laure',
        lastName: 'Pinson',
      });
      await wilder1.save();
      const wilder2 = Wilder.create({
        firstName: 'Pierre',
        lastName: 'Corbeau',
      });
      await wilder2.save();

      const response = await query({
        query: `
        {
          wilders {
            firstName
            lastName
          }
        }
      `,
      });

      expect(response.data).toEqual({
        wilders: [
          {
            firstName: 'Laure',
            lastName: 'Pinson',
          },
          {
            firstName: 'Pierre',
            lastName: 'Corbeau',
          },
        ],
      });
    });
  });
});
