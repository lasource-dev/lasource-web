import { normalizeCategorySlug } from '../collections/category/domain'

export type LegacyTechnologyCategory = {
  category: string | null | undefined
  technologyID: string
}

export type ExistingCategoryIdentity = {
  canonicalName: string
  id: string
  slug: string
}

export type CategoryMigrationPlan = {
  assignments: { categoryID: string; technologyID: string }[]
  categoriesToCreate: ExistingCategoryIdentity[]
  unresolvedTechnologyIDs: string[]
}

const categoryKey = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr')

const provisionalID = (key: string) => `pending:${key}`

export function buildCategoryMigrationPlan(
  technologies: readonly LegacyTechnologyCategory[],
  existingCategories: readonly ExistingCategoryIdentity[],
): CategoryMigrationPlan {
  const identities = new Map(existingCategories.map((category) => [categoryKey(category.canonicalName), category]))
  const usedSlugs = new Set(existingCategories.map(({ slug }) => slug))
  const categoriesToCreate: ExistingCategoryIdentity[] = []
  const assignments: CategoryMigrationPlan['assignments'] = []
  const unresolvedTechnologyIDs: string[] = []

  for (const technology of technologies) {
    const canonicalName = technology.category?.trim().replace(/\s+/g, ' ')
    if (!canonicalName) {
      unresolvedTechnologyIDs.push(technology.technologyID)
      continue
    }

    const key = categoryKey(canonicalName)
    let identity = identities.get(key)
    if (!identity) {
      const baseSlug = normalizeCategorySlug(canonicalName) || 'category'
      let slug = baseSlug
      let suffix = 2
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix}`
        suffix += 1
      }
      identity = { canonicalName, id: provisionalID(key), slug }
      identities.set(key, identity)
      usedSlugs.add(slug)
      categoriesToCreate.push(identity)
    }

    assignments.push({ categoryID: identity.id, technologyID: technology.technologyID })
  }

  return { assignments, categoriesToCreate, unresolvedTechnologyIDs }
}
