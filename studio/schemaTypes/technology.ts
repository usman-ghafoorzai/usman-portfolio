import {defineField, defineType} from 'sanity'
import {requiredText, stableIdField} from './validation'

export const technology = defineType({
  name: 'technology', title: 'Technology', type: 'document',
  fields: [stableIdField(), defineField({name: 'label', type: 'string', validation: requiredText})],
  orderings: [{name: 'identity', title: 'Stable ID', by: [{field: 'stableId', direction: 'asc'}]}],
  preview: {select: {title: 'label', subtitle: 'stableId'}},
})
