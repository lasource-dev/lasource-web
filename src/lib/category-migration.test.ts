import { describe, expect, it } from 'vitest'

import { buildCategoryMigrationPlan } from './category-migration'

describe('Category migration plan', () => {
  const technologies = [
    { category: ' Framework ', technologyID: 'tech-1' },
    { category: 'framework', technologyID: 'tech-2' },
    { category: 'SDK', technologyID: 'tech-3' },
  ]

  it('conserve chaque valeur et ne crée aucun doublon', () => {
    const plan = buildCategoryMigrationPlan(technologies, [])
    expect(plan.categoriesToCreate.map(({ canonicalName }) => canonicalName)).toEqual([
      'Framework',
      'SDK',
    ])
    expect(plan.assignments).toHaveLength(technologies.length)
    expect(plan.unresolvedTechnologyIDs).toEqual([])
  })

  it('réutilise une catégorie existante et reste réexécutable', () => {
    const existing = [{ canonicalName: 'Framework', id: 'category-1', slug: 'framework' }]
    const firstPlan = buildCategoryMigrationPlan(technologies, existing)
    const created = firstPlan.categoriesToCreate.map((category, index) => ({
      ...category,
      id: `created-${index}`,
    }))
    const secondPlan = buildCategoryMigrationPlan(technologies, [...existing, ...created])

    expect(firstPlan.categoriesToCreate).toHaveLength(1)
    expect(firstPlan.assignments.filter(({ categoryID }) => categoryID === 'category-1')).toHaveLength(2)
    expect(secondPlan.categoriesToCreate).toEqual([])
    expect(secondPlan.assignments).toHaveLength(technologies.length)
  })

  it('signale explicitement les technologies sans valeur au lieu de perdre des données', () => {
    expect(
      buildCategoryMigrationPlan([{ category: '  ', technologyID: 'tech-empty' }], [])
        .unresolvedTechnologyIDs,
    ).toEqual(['tech-empty'])
  })
})
