import { prisma } from "./prisma";
import { TestCase } from "@prisma/client";

export async function getDefaultSuite(categories?: string[]): Promise<TestCase[]> {
  const where = categories && categories.length ? { category: { in: categories }, isDefault: true } : { isDefault: true };
  return prisma.testCase.findMany({ where, orderBy: { category: "asc" } });
}
