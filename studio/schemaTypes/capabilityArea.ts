import {defineField, defineType} from 'sanity'
import {publishedId, requiredText, stableIdPattern, uniqueStableId} from './validation'

// Deliberately code-owned Studio taxonomy; not imported into the portfolio domain.
export const capabilityIds = ['frontend', 'backend', 'databases', 'integration', 'mobile', 'systems', 'workflow'] as const

export const capabilityArea = defineType({
  name: 'capabilityArea', title: 'Capability Area', type: 'document',
  fields: [
    defineField({name: 'stableId', title: 'Stable ID', type: 'string', readOnly: true,
      description: 'Set by the fixed capability template. A new capability requires an intentional code/domain change.',
      options: {list: [...capabilityIds]},
      validation: rule => rule.required().regex(stableIdPattern).custom((value, context) => {
        if (!capabilityIds.some(id => id === value)) return 'Choose one of the seven code-owned capability IDs.'
        return publishedId(context.document?._id ?? '') === `capability.${value}` || 'Capability stableId must match its fixed document ID.'
      }).custom(uniqueStableId),
    }),
    defineField({name: 'label', type: 'string', validation: requiredText}),
    defineField({name: 'description', type: 'string', validation: requiredText}),
  ],
  preview: {select: {title: 'label', subtitle: 'stableId'}},
})
