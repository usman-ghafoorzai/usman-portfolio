import {defineField, defineType} from 'sanity'
import {nonBlank, requiredText, stableIdField, technologyReferences, textArray} from './validation'

export const experience = defineType({
  name: 'experience', title: 'Experience', type: 'document',
  fields: [
    stableIdField(),
    defineField({name: 'organization', type: 'string', validation: requiredText}),
    defineField({name: 'role', type: 'string', validation: requiredText}),
    defineField({name: 'startYear', type: 'number', description: 'Year precision only; do not invent a month or day.', validation: rule => rule.required().integer().min(1900).max(2100)}),
    defineField({name: 'endYear', type: 'number', description: 'Leave unset for ongoing work.', validation: rule => rule.integer().min(1900).max(2100).min(rule.valueOfField('startYear'))}),
    defineField({name: 'location', type: 'string', validation: rule => rule.custom(nonBlank)}),
    defineField({name: 'summary', type: 'string', validation: requiredText}),
    textArray('highlights', 0), technologyReferences(),
  ],
  // GROQ ascending order puts null after numbers, so ongoing work is last within a start year.
  orderings: [{name: 'chronological', title: 'Chronological (ongoing last)', by: [{field: 'startYear', direction: 'asc'}, {field: 'endYear', direction: 'asc'}, {field: 'stableId', direction: 'asc'}]}],
  preview: {select: {title: 'role', subtitle: 'organization'}},
})
