import {defineArrayMember, defineField, defineType} from 'sanity'
import {API_VERSION, nonBlank, publishedId, requiredText, stableIdField, technologyReferences, textArray, uniqueReferences} from './validation'
import {capabilityIds} from './capabilityArea'

export const project = defineType({
  name: 'project', title: 'Project', type: 'document',
  fields: [
    stableIdField(),
    defineField({name: 'title', type: 'string', validation: requiredText}),
    defineField({name: 'slug', type: 'slug', description: 'Editable routing identifier; changing this never changes stableId.',
      options: {source: 'title', isUnique: async (value, context) => {
        const id = publishedId(context.document?._id ?? '')
        return context.getClient({apiVersion: API_VERSION}).withConfig({useCdn: false, perspective: 'raw'})
          .fetch<boolean>('count(*[_type == "project" && slug.current == $slug && !(_id in [$id, $draftId])]) == 0', {slug: value, id, draftId: `drafts.${id}`})
      }},
      validation: rule => rule.required().custom(value => !!value?.current?.trim() || 'A non-empty slug is required.'),
    }),
    defineField({name: 'label', type: 'string', validation: requiredText}),
    defineField({name: 'summary', type: 'string', validation: requiredText}),
    defineField({name: 'year', type: 'number', validation: rule => rule.required().integer().min(1900).max(2100)}),
    defineField({name: 'status', type: 'string', options: {list: ['completed', 'in-progress', 'archived']},
      validation: rule => rule.required().custom(value => ['completed', 'in-progress', 'archived'].includes(value ?? '') || 'Use completed, in-progress or archived.')}),
    defineField({name: 'featured', type: 'boolean', initialValue: false, validation: rule => rule.required()}),
    defineField({name: 'displayOrder', type: 'number', description: 'Editorial order, lowest first. Ties sort by stableId. Never mapped into the domain Project.', validation: rule => rule.required().integer().min(0)}),
    technologyReferences(),
    defineField({name: 'capabilityEvidence', type: 'array', initialValue: [],
      validation: rule => rule.required().custom((items: {capability?: {_ref?: string}}[] | undefined) => uniqueReferences(items?.map(item => item.capability ?? {}))),
      of: [defineArrayMember({name: 'evidence', type: 'object', fields: [
        defineField({name: 'capability', type: 'reference', to: [{type: 'capabilityArea'}],
          options: {disableNew: true, filter: '_id in $ids', filterParams: {ids: capabilityIds.map(id => `capability.${id}`)}},
          validation: rule => rule.required().custom(value => !value?._ref || capabilityIds.some(id => `capability.${id}` === publishedId(value._ref)) || 'Reference one of the seven fixed capabilities.'),
        }),
        defineField({name: 'priority', type: 'number', description: '1 = strongest evidence; 2 = supporting; 3 = additional.', options: {list: [1, 2, 3]}, validation: rule => rule.required().integer().min(1).max(3)}),
      ]})],
    }),
    textArray('highlights'),
    defineField({name: 'links', type: 'object', validation: rule => rule.required(), fields: [
      defineField({name: 'github', type: 'url', description: 'Required while the portfolio renders every project as a GitHub link.', validation: rule => rule.required().uri({scheme: ['http', 'https'], allowRelative: false})}),
      defineField({name: 'live', type: 'url', validation: rule => rule.uri({scheme: ['http', 'https'], allowRelative: false}).custom(nonBlank)}),
    ]}),
  ],
  orderings: [{name: 'editorial', title: 'Editorial order', by: [{field: 'displayOrder', direction: 'asc'}, {field: 'stableId', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'stableId'}},
})
